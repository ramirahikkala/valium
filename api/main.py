"""FastAPI application with CRUD endpoints for tasks."""

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_session
from models import Category, Task, TaskStatus
from schemas import (
    CategoryCreate,
    CategoryResponse,
    TaskCreate,
    TaskReorder,
    TaskResponse,
    TaskUpdate,
)

app = FastAPI(title="Valium", description="A simple todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _task_response(task: Task) -> TaskResponse:
    """Build a TaskResponse with the category_name resolved."""
    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status,
        category_id=task.category_id,
        category_name=task.category.name if task.category else None,
        position=task.position,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Return a simple health-check response."""
    return {"status": "ok"}


# ---------- Categories ----------


@app.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    session: AsyncSession = Depends(get_session),
) -> list[Category]:
    """List all categories."""
    result = await session.execute(select(Category).order_by(Category.name))
    return list(result.scalars().all())


@app.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(
    body: CategoryCreate,
    session: AsyncSession = Depends(get_session),
) -> Category:
    """Create a new category. Name must be unique."""
    existing = await session.execute(
        select(Category).where(Category.name == body.name)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Category name already exists")
    category = Category(name=body.name)
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category


@app.delete("/categories/{category_id}", status_code=204)
async def delete_category(
    category_id: int,
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a category. Tasks in this category will have category_id set to null."""
    category = await session.get(Category, category_id)
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    await session.delete(category)
    await session.commit()


# ---------- Tasks ----------


async def _get_task_with_category(session: AsyncSession, task_id: int) -> Task | None:
    """Load a task with its category relationship eagerly loaded."""
    result = await session.execute(
        select(Task).options(selectinload(Task.category)).where(Task.id == task_id)
    )
    return result.scalar_one_or_none()


@app.get("/tasks", response_model=list[TaskResponse])
async def list_tasks(
    status: TaskStatus | None = Query(None),
    category_id: int | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> list[TaskResponse]:
    """List all tasks, optionally filtered by status and/or category."""
    stmt = select(Task).options(selectinload(Task.category)).order_by(Task.position.asc())
    if status is not None:
        stmt = stmt.where(Task.status == status)
    if category_id is not None:
        stmt = stmt.where(Task.category_id == category_id)
    result = await session.execute(stmt)
    return [_task_response(t) for t in result.scalars().all()]


@app.post("/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    body: TaskCreate,
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """Create a new task. New tasks are placed at the top (position 0)."""
    if body.category_id is not None:
        cat = await session.get(Category, body.category_id)
        if cat is None:
            raise HTTPException(status_code=404, detail="Category not found")
    # Shift all existing tasks down by 1 to make room at position 0
    await session.execute(update(Task).values(position=Task.position + 1))
    task = Task(**body.model_dump(), position=0)
    session.add(task)
    await session.commit()
    task = await _get_task_with_category(session, task.id)
    return _task_response(task)


@app.put("/tasks/reorder", response_model=list[TaskResponse])
async def reorder_tasks(
    body: TaskReorder,
    session: AsyncSession = Depends(get_session),
) -> list[TaskResponse]:
    """Reorder tasks. Accepts an ordered list of task IDs; positions are assigned to match."""
    for position, task_id in enumerate(body.task_ids):
        result = await session.execute(select(Task).where(Task.id == task_id))
        task = result.scalar_one_or_none()
        if task is None:
            raise HTTPException(status_code=404, detail=f"Task {task_id} not found")
        task.position = position
    await session.commit()
    stmt = (
        select(Task)
        .options(selectinload(Task.category))
        .where(Task.id.in_(body.task_ids))
        .order_by(Task.position.asc())
    )
    result = await session.execute(stmt)
    return [_task_response(t) for t in result.scalars().all()]


@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """Get a single task by ID."""
    task = await _get_task_with_category(session, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_response(task)


@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    body: TaskUpdate,
    session: AsyncSession = Depends(get_session),
) -> TaskResponse:
    """Update an existing task."""
    task = await session.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = body.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"] is not None:
        cat = await session.get(Category, update_data["category_id"])
        if cat is None:
            raise HTTPException(status_code=404, detail="Category not found")
    for field, value in update_data.items():
        setattr(task, field, value)
    await session.commit()
    task = await _get_task_with_category(session, task_id)
    return _task_response(task)


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
