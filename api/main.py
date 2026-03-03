"""FastAPI application with CRUD endpoints for tasks."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import (
    ADMIN_USER_ID,
    GOOGLE_CLIENT_ID,
    create_jwt,
    get_current_user,
    get_user_features,
    verify_google_token,
)
from database import get_session
from admin_router import router as admin_router
from ai_router import router as ai_router
from gym_router import router as gym_router
from plants_router import router as plants_router
from models import Alarm, List, ListShare, Task, TaskStatus, User, UserSettings
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
    ListShareCreate,
    ListShareResponse,
    TaskCreate,
    TaskReorder,
    TaskResponse,
    TaskUpdate,
    UserResponse,
    UserSettingsResponse,
    UserSettingsUpdate,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start scheduler on startup, stop on shutdown."""
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Valium", description="A simple todo API", lifespan=lifespan)

UPLOAD_DIR = Path("/app/plant_images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/plant-images", StaticFiles(directory=UPLOAD_DIR), name="plant-images")

app.include_router(gym_router)
app.include_router(admin_router)
app.include_router(plants_router)
app.include_router(ai_router)

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

    # Find existing user
    result = await session.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()

    if user is None:
        # Auto-register the new user
        user = User(google_id=google_id, email=email, name=name, picture=picture)
        session.add(user)
        await session.commit()
        await session.refresh(user)

        # Auto-create default "My Tasks" list for new users
        default_list = List(name="My Tasks", user_id=user.id)
        session.add(default_list)
        await session.commit()

        # Notify admin about new registration (best-effort, non-blocking)
        try:
            admin_result = await session.execute(select(User).where(User.id == ADMIN_USER_ID))
            admin_user = admin_result.scalar_one_or_none()
            if admin_user:
                from notifications import EmailSender
                import asyncio

                sender = EmailSender()
                subject = f"Valium: uusi käyttäjä rekisteröityi — {name}"
                html = f"""\
<html><body style="font-family: sans-serif; color: #2d2d3f;">
  <h2 style="color: #6c7bb5;">Uusi käyttäjä</h2>
  <p><strong>Nimi:</strong> {name}</p>
  <p><strong>Sähköposti:</strong> {email}</p>
  <p>Käyttäjä on nyt rekisteröitynyt Valiumiin. Voit hallinnoida käyttäjiä admin-paneelista.</p>
  <hr style="border: none; border-top: 1px solid #d8d8e8;">
  <p style="color: #6b6b80; font-size: 0.8em;">Valium — your little helper for getting things done.</p>
</body></html>"""
                text = f"Uusi käyttäjä: {name} ({email})\n\nKäyttäjä on rekisteröitynyt Valiumiin."
                await asyncio.get_event_loop().run_in_executor(
                    None, lambda: sender.send(admin_user.email, subject, html, text)
                )
        except Exception:
            logger.exception("Failed to send new-user notification to admin")
    else:
        # Update profile info on each login
        user.email = email
        user.name = name
        user.picture = picture
        await session.commit()

    token = create_jwt(user.id)
    features = await get_user_features(user.id, session)
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            picture=user.picture,
            is_admin=(user.id == ADMIN_USER_ID),
            features=features,
        ),
    )


@app.get("/auth/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> UserResponse:
    """Return the current authenticated user's info."""
    features = await get_user_features(current_user.id, session)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        picture=current_user.picture,
        is_admin=(current_user.id == ADMIN_USER_ID),
        features=features,
    )


# ---------- User settings ----------


@app.get("/user/settings", response_model=UserSettingsResponse)
async def get_user_settings(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> UserSettings:
    """Return the current user's settings, creating defaults if missing."""
    result = await session.execute(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=current_user.id, language="fi")
        session.add(settings)
        await session.commit()
    return settings


@app.put("/user/settings", response_model=UserSettingsResponse)
async def update_user_settings(
    data: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> UserSettings:
    """Update the current user's settings."""
    result = await session.execute(
        select(UserSettings).where(UserSettings.user_id == current_user.id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        session.add(settings)
    settings.language = data.language
    await session.commit()
    return settings


# ---------- Lists ----------


async def _verify_list_access(
    session: AsyncSession,
    list_id: int,
    user: User,
    require_write: bool = False,
) -> tuple[List, str]:
    """Load a list and verify access. Returns (list, permission) where permission is 'owner'|'read'|'write'."""
    lst = await session.get(List, list_id)
    if lst is None:
        raise HTTPException(status_code=404, detail="List not found")
    if lst.user_id == user.id:
        return lst, "owner"
    result = await session.execute(
        select(ListShare).where(
            ListShare.list_id == list_id,
            ListShare.shared_with_user_id == user.id,
        )
    )
    share = result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=404, detail="List not found")
    if require_write and share.permission != "write":
        raise HTTPException(status_code=403, detail="Write permission required")
    return lst, share.permission


@app.get("/lists", response_model=list[ListResponse])
async def list_lists(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ListResponse]:
    """List all lists owned by or shared with the current user."""
    # Owned lists
    owned_result = await session.execute(
        select(List)
        .options(selectinload(List.shares).selectinload(ListShare.shared_with))
        .where(List.user_id == current_user.id)
        .order_by(List.name)
    )
    owned_lists = list(owned_result.scalars().all())

    # Shared lists
    shared_ids_result = await session.execute(
        select(ListShare.list_id).where(ListShare.shared_with_user_id == current_user.id)
    )
    shared_ids = [row[0] for row in shared_ids_result.all()]

    shared_result = await session.execute(
        select(List)
        .where(List.id.in_(shared_ids))
        .order_by(List.name)
    )
    shared_lists = list(shared_result.scalars().all())

    # Load shares for each list to get permission info
    responses: list[ListResponse] = []
    for lst in owned_lists:
        share_responses = [
            ListShareResponse(
                id=s.id,
                shared_with_user_id=s.shared_with_user_id,
                shared_with_name=s.shared_with.name,
                shared_with_email=s.shared_with.email,
                permission=s.permission,
            )
            for s in lst.shares
        ]
        responses.append(
            ListResponse(
                id=lst.id,
                name=lst.name,
                created_at=lst.created_at,
                permission="owner",
                owner_id=None,
                owner_name=None,
                shares=share_responses,
            )
        )

    for lst in shared_lists:
        share_result = await session.execute(
            select(ListShare).where(
                ListShare.list_id == lst.id,
                ListShare.shared_with_user_id == current_user.id,
            )
        )
        share = share_result.scalar_one_or_none()
        perm = share.permission if share else "read"
        # Load owner
        owner = await session.get(User, lst.user_id)
        responses.append(
            ListResponse(
                id=lst.id,
                name=lst.name,
                created_at=lst.created_at,
                permission=perm,
                owner_id=lst.user_id,
                owner_name=owner.name if owner else None,
                shares=[],
            )
        )

    return responses


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
    lst, permission = await _verify_list_access(session, list_id, current_user)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can delete a list")
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
    await _verify_list_access(session, list_id, current_user)
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
    await _verify_list_access(session, body.list_id, current_user, require_write=True)

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
        if task.list_id is not None:
            await _verify_list_access(session, task.list_id, current_user, require_write=True)
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
    if task.list_id is not None:
        await _verify_list_access(session, task.list_id, current_user)
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
    if task.list_id is not None:
        await _verify_list_access(session, task.list_id, current_user, require_write=True)
    update_data = body.model_dump(exclude_unset=True)
    if "list_id" in update_data and update_data["list_id"] is not None:
        await _verify_list_access(session, update_data["list_id"], current_user, require_write=True)
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
    if task.list_id is not None:
        await _verify_list_access(session, task.list_id, current_user, require_write=True)
    await session.delete(task)
    await session.commit()


# ---------- Alarms ----------


async def _verify_task_ownership(
    session: AsyncSession, task_id: int, user: User,
) -> Task:
    """Load a task and verify the current user has write access via its list. Raises 404/403 if not."""
    task = await _get_task_with_list(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.list_id is not None:
        await _verify_list_access(session, task.list_id, user, require_write=True)
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


# ---------- List shares ----------


@app.get("/lists/{list_id}/shares", response_model=list[ListShareResponse])
async def get_list_shares(
    list_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ListShareResponse]:
    """List all shares for a list. Only the owner can view this."""
    lst, permission = await _verify_list_access(session, list_id, current_user)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can manage shares")
    result = await session.execute(
        select(ListShare)
        .options(selectinload(ListShare.shared_with))
        .where(ListShare.list_id == list_id)
    )
    shares = result.scalars().all()
    return [
        ListShareResponse(
            id=s.id,
            shared_with_user_id=s.shared_with_user_id,
            shared_with_name=s.shared_with.name,
            shared_with_email=s.shared_with.email,
            permission=s.permission,
        )
        for s in shares
    ]


@app.post("/lists/{list_id}/shares", response_model=ListShareResponse, status_code=201)
async def create_list_share(
    list_id: int,
    body: ListShareCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ListShareResponse:
    """Share a list with another user by email. Only the owner can share."""
    lst, permission = await _verify_list_access(session, list_id, current_user)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can manage shares")

    target_result = await session.execute(select(User).where(User.email == body.email))
    target = target_result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")

    existing = await session.execute(
        select(ListShare).where(
            ListShare.list_id == list_id,
            ListShare.shared_with_user_id == target.id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Already shared with this user")

    share = ListShare(list_id=list_id, shared_with_user_id=target.id, permission=body.permission)
    session.add(share)
    await session.commit()
    await session.refresh(share)
    return ListShareResponse(
        id=share.id,
        shared_with_user_id=target.id,
        shared_with_name=target.name,
        shared_with_email=target.email,
        permission=share.permission,
    )


@app.delete("/lists/{list_id}/shares/{share_id}", status_code=204)
async def delete_list_share(
    list_id: int,
    share_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove a share from a list. Only the owner can do this."""
    lst, permission = await _verify_list_access(session, list_id, current_user)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can manage shares")
    share = await session.get(ListShare, share_id)
    if share is None or share.list_id != list_id:
        raise HTTPException(status_code=404, detail="Share not found")
    await session.delete(share)
    await session.commit()
