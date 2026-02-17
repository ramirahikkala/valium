"""FastAPI application with CRUD endpoints for tasks."""

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_session
from models import Task, TaskStatus
from schemas import TaskCreate, TaskResponse, TaskUpdate

app = FastAPI(title="Valium", description="A simple todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return a simple health-check response."""
    return {"status": "ok"}


@app.get("/tasks", response_model=list[TaskResponse])
async def list_tasks(
    status: TaskStatus | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> list[Task]:
    """List all tasks, optionally filtered by status."""
    stmt = select(Task).order_by(Task.created_at.desc())
    if status is not None:
        stmt = stmt.where(Task.status == status)
    result = await session.execute(stmt)
    return list(result.scalars().all())


@app.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    body: TaskCreate,
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Create a new task."""
    task = Task(**body.model_dump())
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Get a single task by ID."""
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    body: TaskUpdate,
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Update an existing task."""
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    await session.commit()
    await session.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a task by ID."""
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    await session.delete(task)
    await session.commit()
