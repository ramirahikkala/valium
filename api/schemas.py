"""Pydantic schemas for request/response validation."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from models import TaskStatus


# ---------- Auth ----------


class AuthRequest(BaseModel):
    """Schema for Google Sign-In token exchange."""

    credential: str


class UserResponse(BaseModel):
    """Schema returned for user info."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    picture: str | None


class AuthResponse(BaseModel):
    """Schema returned after successful authentication."""

    token: str
    user: UserResponse


class AuthConfigResponse(BaseModel):
    """Schema returned for auth configuration."""

    client_id: str


# ---------- Lists ----------


class ListCreate(BaseModel):
    """Schema for creating a new list."""

    name: str


class ListResponse(BaseModel):
    """Schema returned for a single list."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime


# ---------- Tasks ----------


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.pending
    list_id: int


class TaskUpdate(BaseModel):
    """Schema for updating an existing task. All fields are optional."""

    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    list_id: int | None = None


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
    list_id: int | None
    list_name: str | None = None
    position: int
    created_at: datetime
    updated_at: datetime
