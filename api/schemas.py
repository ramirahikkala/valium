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
    is_admin: bool = False
    features: dict[str, bool] = {}


class AdminUserResponse(BaseModel):
    """Schema returned for a user in the admin panel."""

    id: int
    email: str
    name: str
    picture: str | None
    is_admin: bool
    features: dict[str, bool]


class FeatureUpdate(BaseModel):
    """Schema for updating a user's app feature flag."""

    app: str
    enabled: bool


class AdminCreateUser(BaseModel):
    """Schema for admin creating a new user by email (pre-registration)."""

    email: str


class UserInviteResponse(BaseModel):
    """Schema returned for a pending invite."""

    model_config = ConfigDict(from_attributes=True)

    email: str
    created_at: datetime


class AuthResponse(BaseModel):
    """Schema returned after successful authentication."""

    token: str
    user: UserResponse


class AuthConfigResponse(BaseModel):
    """Schema returned for auth configuration."""

    client_id: str


# ---------- User settings ----------


class UserSettingsResponse(BaseModel):
    """Schema returned for user settings."""

    model_config = ConfigDict(from_attributes=True)

    language: str


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings."""

    language: str


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
    auto_increment: bool = False
    increment_kg: float = 2.5
    reset_increment_kg: float = 5.0


class ExerciseUpdate(BaseModel):
    """Schema for updating a program exercise. All fields optional."""

    weight: float | None = None
    sets: int | None = None
    reps: int | None = None
    rest_seconds: int | None = None
    position: int | None = None
    auto_increment: bool | None = None
    increment_kg: float | None = None
    base_weight: float | None = None
    reset_increment_kg: float | None = None
    deload_mode: str | None = None
    failure_threshold: int | None = None


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
    auto_increment: bool
    increment_kg: float
    base_weight: float
    reset_increment_kg: float
    consecutive_failures: int
    deload_mode: str
    failure_threshold: int
    last_performance: LastPerformance | None = None


class SessionCompleteRequest(BaseModel):
    """Schema for completing a workout session with optional fail list."""

    failed_exercise_ids: list[int] = []
    session_outcome: str = "success"  # "success" | "failed_stay" | "failed_reset"


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


# ---------- Plants ----------


class PlantLocationCreate(BaseModel):
    """Schema for creating a plant location."""

    name: str


class PlantLocationUpdate(BaseModel):
    """Schema for renaming a plant location."""

    name: str


class PlantLocationResponse(BaseModel):
    """Schema returned for a single plant location."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class PlantCreate(BaseModel):
    """Schema for creating a plant."""

    latin_name: str
    common_name: str | None = None
    cultivar: str | None = None
    year_acquired: int | None = None
    source: str | None = None
    location_id: int | None = None
    category: str = "perennial"
    status: str = "active"
    lost_year: int | None = None
    notes: str | None = None
    own_seeds: bool = False


class PlantUpdate(BaseModel):
    """Schema for updating a plant. All fields are optional."""

    latin_name: str | None = None
    common_name: str | None = None
    cultivar: str | None = None
    year_acquired: int | None = None
    source: str | None = None
    location_id: int | None = None
    category: str | None = None
    status: str | None = None
    lost_year: int | None = None
    notes: str | None = None
    own_seeds: bool | None = None


class PlantImageResponse(BaseModel):
    """Schema returned for a single plant image."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    caption: str | None
    source_url: str | None
    sort_order: int


class PlantImageCaptionUpdate(BaseModel):
    """Schema for updating a plant image caption."""

    caption: str | None = None


class PlantResponse(BaseModel):
    """Schema returned for a single plant."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    latin_name: str
    common_name: str | None
    cultivar: str | None
    year_acquired: int | None
    source: str | None
    location_id: int | None
    location_name: str | None = None
    category: str
    status: str
    lost_year: int | None
    notes: str | None
    own_seeds: bool
    ai_summary: str | None = None
    created_at: datetime
    images: list[PlantImageResponse] = []
    primary_image_url: str | None = None


# ---------- AI providers ----------


class AIProviderCreate(BaseModel):
    """Schema for adding an AI provider."""

    provider: str
    model: str
    api_key: str
    label: str | None = None
    enabled: bool = True


class AIProviderUpdate(BaseModel):
    """Schema for updating an AI provider. All fields optional."""

    model: str | None = None
    api_key: str | None = None
    label: str | None = None
    enabled: bool | None = None


class AIProviderResponse(BaseModel):
    """Schema returned for an AI provider (api_key omitted)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    provider: str
    model: str
    label: str | None
    enabled: bool


class PlantFillNameResponse(BaseModel):
    """Schema returned by the plant AI fill-name endpoint."""

    latin_name: str | None = None
    common_name: str | None = None
    category: str | None = None
    notes: str | None = None
