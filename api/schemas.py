"""Pydantic schemas for request/response validation."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from models import TaskStatus


class CategoryCreate(BaseModel):
    """Schema for creating a new category."""

    name: str


class CategoryResponse(BaseModel):
    """Schema returned for a single category."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.pending
    category_id: int | None = None


class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""

    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    category_id: int | None = None


class TaskReorder(BaseModel):
    """Schema for reordering tasks by providing an ordered list of task IDs."""

    task_ids: list[int]


class TaskResponse(BaseModel):
    """Schema returned for a single task."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
    category_id: int | None
    category_name: str | None = None
    position: int
    created_at: datetime
    updated_at: datetime
