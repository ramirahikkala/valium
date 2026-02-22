"""Pydantic schemas for request/response validation."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from models import NotificationChannel, RecurrenceType, TaskStatus


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


class AlarmCreate(BaseModel):
    """Schema for creating an alarm on a task."""

    alarm_at: datetime
    recurrence: RecurrenceType = RecurrenceType.none
    channel: NotificationChannel = NotificationChannel.email
    enabled: bool = True


class AlarmUpdate(BaseModel):
    """Schema for updating an alarm. All fields are optional."""

    alarm_at: datetime | None = None
    recurrence: RecurrenceType | None = None
    enabled: bool | None = None


class AlarmResponse(BaseModel):
    """Schema returned for a single alarm."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    task_id: int
    channel: str
    alarm_at: datetime
    recurrence: str
    enabled: bool
    last_sent_at: datetime | None
    created_at: datetime
    updated_at: datetime


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
    has_alarm: bool = False
    alarm: AlarmResponse | None = None
    created_at: datetime
    updated_at: datetime


# ---------- Gym Exercise Library ----------


class GymExerciseCreate(BaseModel):
    """Schema for creating an exercise in the user's exercise library."""

    name: str


class GymExerciseUpdate(BaseModel):
    """Schema for renaming a library exercise."""

    name: str | None = None


class GymExerciseResponse(BaseModel):
    """Schema returned for a single exercise library entry."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


# ---------- Gym Programs ----------


class ProgramCreate(BaseModel):
    """Schema for creating a workout program."""

    name: str


class ProgramUpdate(BaseModel):
    """Schema for updating a workout program. All fields optional."""

    name: str | None = None
    is_active: bool | None = None


class LastPerformance(BaseModel):
    """Last logged set data for a given exercise."""

    weight_used: float
    reps_done: int
    completed_at: datetime


class ExerciseCreate(BaseModel):
    """Schema for adding an exercise to a program."""

    exercise_id: int
    weight: float = 0.0
    sets: int = 3
    reps: int = 10
    rest_seconds: int = 90


class ExerciseUpdate(BaseModel):
    """Schema for updating a program exercise. All fields optional."""

    weight: float | None = None
    sets: int | None = None
    reps: int | None = None
    rest_seconds: int | None = None
    position: int | None = None


class ExerciseResponse(BaseModel):
    """Schema returned for a single program exercise."""

    id: int
    program_id: int
    exercise_id: int
    exercise_name: str
    weight: float
    sets: int
    reps: int
    rest_seconds: int
    position: int
    last_performance: LastPerformance | None = None


class ProgramResponse(BaseModel):
    """Schema returned for a single workout program."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    is_active: bool
    created_at: datetime
    exercises: list[ExerciseResponse] = []


# ---------- Gym Sessions ----------


class SessionCreate(BaseModel):
    """Schema for starting a workout session."""

    program_id: int


class SessionResponse(BaseModel):
    """Schema returned for a single workout session."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    program_id: int | None
    program_name: str
    started_at: datetime
    completed_at: datetime | None


class SessionSetCreate(BaseModel):
    """Schema for logging a single set during a workout session."""

    exercise_id: int | None = None
    exercise_name: str
    set_number: int
    weight_used: float
    reps_done: int


class SessionSetResponse(BaseModel):
    """Schema returned for a single logged set."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    session_id: int
    exercise_id: int | None
    exercise_name: str
    set_number: int
    weight_used: float
    reps_done: int
    completed_at: datetime
