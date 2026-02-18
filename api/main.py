"""FastAPI application with CRUD endpoints for tasks."""

import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import (
    GOOGLE_CLIENT_ID,
    create_jwt,
    get_current_user,
    verify_google_token,
)
from database import get_session
from models import Alarm, List, Task, TaskStatus, User
from scheduler import start_scheduler, stop_scheduler
from schemas import (
    AlarmCreate,
    AlarmResponse,
    AlarmUpdate,
    AuthConfigResponse,
    AuthRequest,
    AuthResponse,
    ListCreate,
    ListResponse,
    TaskCreate,
    TaskReorder,
    TaskResponse,
    TaskUpdate,
    UserResponse,
)

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start scheduler on startup, stop on shutdown."""
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Valium", description="A simple todo API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _task_response(task: Task) -> TaskResponse:
    """Build a TaskResponse with the list_name and alarm info resolved."""
    # Pick the first alarm (one alarm per task per channel; we show the email one)
    alarms_raw = task.alarms
    if isinstance(alarms_raw, Alarm):
        alarm = alarms_raw
    elif alarms_raw:
        alarm = alarms_raw[0]
    else:
        alarm = None
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        list_id=task.list_id,
        list_name=task.list.name if task.list else None,
        position=task.position,
        has_alarm=alarm is not None,
        alarm=AlarmResponse.model_validate(alarm) if alarm else None,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return a simple health-check response."""
    return {"status": "ok"}


# ---------- Auth ----------


@app.get("/auth/config", response_model=AuthConfigResponse)
async def auth_config() -> AuthConfigResponse:
    """Return the Google client ID so the frontend can initialize GIS."""
    return AuthConfigResponse(client_id=GOOGLE_CLIENT_ID)


@app.post("/auth/google", response_model=AuthResponse)
async def google_sign_in(
    body: AuthRequest,
    session: AsyncSession = Depends(get_session),
) -> AuthResponse:
    """Exchange a Google ID token for a JWT session token."""
    idinfo = verify_google_token(body.credential)
    google_id = idinfo["sub"]
    email = idinfo.get("email", "")
    name = idinfo.get("name", "")
    picture = idinfo.get("picture")

    # Find or create user
    result = await session.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(google_id=google_id, email=email, name=name, picture=picture)
        session.add(user)
        await session.commit()
        await session.refresh(user)

        # Auto-create default "My Tasks" list for new users
        default_list = List(name="My Tasks", user_id=user.id)
        session.add(default_list)
        await session.commit()
    else:
        # Update profile info on each login
        user.email = email
        user.name = name
        user.picture = picture
        await session.commit()

    token = create_jwt(user.id)
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            picture=user.picture,
        ),
    )


@app.get("/auth/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return the current authenticated user's info."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        picture=current_user.picture,
    )


# ---------- Lists ----------


async def _verify_list_ownership(session: AsyncSession, list_id: int, user: User) -> List:
    """Load a list and verify the current user owns it. Raises 404 if not found/owned."""
    lst = await session.get(List, list_id)
    if lst is None or lst.user_id != user.id:
        raise HTTPException(status_code=404, detail="List not found")
    return lst


@app.get("/lists", response_model=list[ListResponse])
async def list_lists(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[List]:
    """List all lists belonging to the current user."""
    result = await session.execute(
        select(List).where(List.user_id == current_user.id).order_by(List.name)
    )
    return list(result.scalars().all())


@app.post("/lists", response_model=ListResponse, status_code=201)
async def create_list(
    body: ListCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> List:
    """Create a new list for the current user. Name must be unique per user."""
    existing = await session.execute(
        select(List).where(List.user_id == current_user.id, List.name == body.name)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="List name already exists")
    lst = List(name=body.name, user_id=current_user.id)
    session.add(lst)
    await session.commit()
    await session.refresh(lst)
    return lst


@app.delete("/lists/{list_id}", status_code=204)
async def delete_list(
    list_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a list. Tasks in this list will have list_id set to null."""
    lst = await _verify_list_ownership(session, list_id, current_user)
    await session.delete(lst)
    await session.commit()


# ---------- Tasks ----------


async def _get_task_with_list(session: AsyncSession, task_id: int) -> Task | None:
    """Load a task with its list and alarms relationships eagerly loaded."""
    result = await session.execute(
        select(Task)
        .options(selectinload(Task.list), selectinload(Task.alarms))
        .where(Task.id == task_id)
    )
    return result.scalar_one_or_none()


@app.get("/tasks", response_model=list[TaskResponse])
async def list_tasks(
    list_id: int = Query(..., description="Filter tasks by list"),
    status: TaskStatus | None = Query(None),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[TaskResponse]:
    """List tasks for a given list, optionally filtered by status."""
    await _verify_list_ownership(session, list_id, current_user)
    stmt = (
        select(Task)
        .options(selectinload(Task.list), selectinload(Task.alarms))
        .where(Task.list_id == list_id)
        .order_by(Task.position.asc())
    )
    if status is not None:
        stmt = stmt.where(Task.status == status)
    result = await session.execute(stmt)
    return [_task_response(t) for t in result.scalars().all()]


@app.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    body: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """Create a new task in the specified list. New tasks are placed at the top (position 0)."""
    await _verify_list_ownership(session, body.list_id, current_user)

    # Shift existing tasks in the same list down by 1 to make room at position 0
    await session.execute(
        update(Task).where(Task.list_id == body.list_id).values(position=Task.position + 1)
    )
    task = Task(**body.model_dump(), position=0)
    session.add(task)
    await session.commit()
    task = await _get_task_with_list(session, task.id)
    return _task_response(task)


@app.put("/tasks/reorder", response_model=list[TaskResponse])
async def reorder_tasks(
    body: TaskReorder,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[TaskResponse]:
    """Reorder tasks. Accepts an ordered list of task IDs; positions are assigned to match."""
    for position, task_id in enumerate(body.task_ids):
        task = await _get_task_with_list(session, task_id)
        if task is None:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
        # Verify user owns the list this task belongs to
        if task.list_id is not None:
            await _verify_list_ownership(session, task.list_id, current_user)
        task.position = position
    await session.commit()
    stmt = (
        select(Task)
        .options(selectinload(Task.list), selectinload(Task.alarms))
        .where(Task.id.in_(body.task_ids))
        .order_by(Task.position.asc())
    )
    result = await session.execute(stmt)
    return [_task_response(t) for t in result.scalars().all()]


@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """Get a single task by ID."""
    task = await _get_task_with_list(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    # Verify ownership through the list
    if task.list_id is not None:
        await _verify_list_ownership(session, task.list_id, current_user)
    return _task_response(task)


@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    body: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """Update an existing task."""
    task = await _get_task_with_list(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    # Verify ownership through current list
    if task.list_id is not None:
        await _verify_list_ownership(session, task.list_id, current_user)
    update_data = body.model_dump(exclude_unset=True)
    # If moving to a different list, verify ownership of the target list
    if "list_id" in update_data and update_data["list_id"] is not None:
        await _verify_list_ownership(session, update_data["list_id"], current_user)
    for field, value in update_data.items():
        setattr(task, field, value)
    await session.commit()
    session.expire(task)
    task = await _get_task_with_list(session, task_id)
    return _task_response(task)


@app.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a task by ID."""
    task = await _get_task_with_list(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    # Verify ownership through the list
    if task.list_id is not None:
        await _verify_list_ownership(session, task.list_id, current_user)
    await session.delete(task)
    await session.commit()


# ---------- Alarms ----------


async def _verify_task_ownership(
    session: AsyncSession, task_id: int, user: User,
) -> Task:
    """Load a task and verify the current user owns it via its list. Raises 404 if not found/owned."""
    task = await _get_task_with_list(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.list_id is not None:
        await _verify_list_ownership(session, task.list_id, user)
    return task


@app.post("/tasks/{task_id}/alarm", response_model=AlarmResponse, status_code=201)
async def create_alarm(
    task_id: int,
    body: AlarmCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> AlarmResponse:
    """Create an alarm on a task."""
    await _verify_task_ownership(session, task_id, current_user)

    # Check for existing alarm on same channel
    existing = await session.execute(
        select(Alarm).where(Alarm.task_id == task_id, Alarm.channel == body.channel.value)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Alarm already exists for this channel")

    alarm = Alarm(
        task_id=task_id,
        channel=body.channel.value,
        alarm_at=body.alarm_at,
        recurrence=body.recurrence.value,
        enabled=body.enabled,
    )
    session.add(alarm)
    await session.commit()
    await session.refresh(alarm)
    return AlarmResponse.model_validate(alarm)


@app.get("/tasks/{task_id}/alarm", response_model=AlarmResponse)
async def get_alarm(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> AlarmResponse:
    """Get the alarm for a task (email channel)."""
    await _verify_task_ownership(session, task_id, current_user)

    result = await session.execute(
        select(Alarm).where(Alarm.task_id == task_id, Alarm.channel == "email")
    )
    alarm = result.scalar_one_or_none()
    if alarm is None:
        raise HTTPException(status_code=404, detail="No alarm set for this task")
    return AlarmResponse.model_validate(alarm)


@app.put("/tasks/{task_id}/alarm", response_model=AlarmResponse)
async def update_alarm(
    task_id: int,
    body: AlarmUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> AlarmResponse:
    """Update the alarm for a task."""
    await _verify_task_ownership(session, task_id, current_user)

    result = await session.execute(
        select(Alarm).where(Alarm.task_id == task_id, Alarm.channel == "email")
    )
    alarm = result.scalar_one_or_none()
    if alarm is None:
        raise HTTPException(status_code=404, detail="No alarm set for this task")

    update_data = body.model_dump(exclude_unset=True)
    # Convert enum values to strings for DB storage
    if "recurrence" in update_data and update_data["recurrence"] is not None:
        update_data["recurrence"] = update_data["recurrence"].value
    for field, value in update_data.items():
        setattr(alarm, field, value)
    await session.commit()
    await session.refresh(alarm)
    return AlarmResponse.model_validate(alarm)


@app.delete("/tasks/{task_id}/alarm", status_code=204)
async def delete_alarm(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove the alarm from a task."""
    await _verify_task_ownership(session, task_id, current_user)

    result = await session.execute(
        select(Alarm).where(Alarm.task_id == task_id, Alarm.channel == "email")
    )
    alarm = result.scalar_one_or_none()
    if alarm is None:
        raise HTTPException(status_code=404, detail="No alarm set for this task")
    await session.delete(alarm)
    await session.commit()
