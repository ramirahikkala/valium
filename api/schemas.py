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


class ListShareCreate(BaseModel):
    """Schema for sharing a list with another user."""

    email: str
    permission: str = "read"


class ListShareResponse(BaseModel):
    """Schema returned for a single list share record."""

    id: int
    shared_with_user_id: int
    shared_with_name: str
    shared_with_email: str
    permission: str


class PlantCollectionShareCreate(BaseModel):
    """Schema for sharing a plant collection with another user."""

    email: str
    permission: str = "read"


class PlantCollectionShareResponse(BaseModel):
    """Schema returned for a single plant collection share record."""

    id: int
    owner_user_id: int
    owner_name: str
    shared_with_user_id: int
    shared_with_name: str
    shared_with_email: str
    permission: str


class SharedCollectionInfo(BaseModel):
    """Plant collection that has been shared with the current user."""

    owner_user_id: int
    owner_name: str
    permission: str


class ListResponse(BaseModel):
    """Schema returned for a single list."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
    permission: str = "owner"
    owner_id: int | None = None
    owner_name: str | None = None
    shares: list[ListShareResponse] = []


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


# ---------- Plant groups ----------


class PlantGroupMemberResponse(BaseModel):
    """Schema returned for a single plant group member."""

    user_id: int
    name: str
    email: str


class PlantGroupCreate(BaseModel):
    """Schema for creating a plant group."""

    name: str
    user_ids: list[int] = []


class PlantGroupUpdate(BaseModel):
    """Schema for updating a plant group's members."""

    user_ids: list[int]


class PlantGroupResponse(BaseModel):
    """Schema returned for a single plant group."""

    id: int
    name: str
    members: list[PlantGroupMemberResponse] = []


class PlantGrowingGuideCreate(BaseModel):
    """Schema for creating a plant growing guide."""

    plant_name: str
    latin_name: str = ""
    guide_text: str = ""


class PlantGrowingGuideUpdate(BaseModel):
    """Schema for updating a plant growing guide. All fields optional."""

    plant_name: str | None = None
    latin_name: str | None = None
    guide_text: str | None = None


class PlantGrowingGuideResponse(BaseModel):
    """Schema returned for a single plant growing guide."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    plant_name: str
    latin_name: str
    guide_text: str
    created_at: datetime
    updated_at: datetime


class PlantGrowingGuideFillResponse(BaseModel):
    """AI-filled fields for a growing guide."""

    plant_name: str
    latin_name: str
    guide_text: str


class PlantNoteCreate(BaseModel):
    """Schema for creating a plant note."""

    title: str
    text: str = ""


class PlantNoteUpdate(BaseModel):
    """Schema for updating a plant note. All fields optional."""

    title: str | None = None
    text: str | None = None


class PlantNoteResponse(BaseModel):
    """Schema returned for a single plant note."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    title: str
    text: str
    created_at: datetime
    updated_at: datetime


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


# ---------- Checklist ----------


class ChecklistTemplateItemCreate(BaseModel):
    """Schema for adding an item to a checklist template."""

    text: str


class ChecklistTemplateItemResponse(BaseModel):
    """Schema returned for a single template item."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    position: int


class ChecklistTemplateCreate(BaseModel):
    """Schema for creating a checklist template."""

    name: str


class ChecklistTemplateUpdate(BaseModel):
    """Schema for renaming a checklist template."""

    name: str


class ChecklistTemplateIncludeResponse(BaseModel):
    """Schema returned for a sub-template inclusion."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    child_id: int
    child_name: str


class ChecklistShareCreate(BaseModel):
    """Schema for sharing a checklist session or template with another user."""

    email: str
    permission: str = "write"


class ChecklistShareResponse(BaseModel):
    """Schema returned for a single checklist share record."""

    id: int
    shared_with_user_id: int
    shared_with_name: str
    shared_with_email: str
    permission: str
    template_id: int | None = None


class ChecklistTemplateBatchShareCreate(BaseModel):
    """Schema for bulk-sharing multiple templates with one user."""

    email: str
    permission: str = "read"
    template_ids: list[int]


class ChecklistTemplateResponse(BaseModel):
    """Schema returned for a single checklist template."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
    items: list[ChecklistTemplateItemResponse] = []
    includes: list[ChecklistTemplateIncludeResponse] = []
    permission: str = "owner"
    owner_id: int | None = None
    owner_name: str | None = None
    shares: list[ChecklistShareResponse] = []


class ChecklistSessionItemResponse(BaseModel):
    """Schema returned for a single session item."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    checked: bool
    template_id: int | None
    template_name: str | None
    position: int


class ChecklistSessionCreate(BaseModel):
    """Schema for starting a packing session from selected templates."""

    name: str
    template_ids: list[int]


class ChecklistSessionAddTemplates(BaseModel):
    """Schema for adding templates to an existing session."""

    template_ids: list[int]


class ChecklistSessionItemAdd(BaseModel):
    """Schema for adding an ad-hoc item to a session."""

    text: str
    template_name: str | None = None


class ChecklistSessionResponse(BaseModel):
    """Schema returned for a single packing session."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
    completed_at: datetime | None
    items: list[ChecklistSessionItemResponse] = []
    permission: str = "owner"
    owner_id: int | None = None
    owner_name: str | None = None
    shares: list[ChecklistShareResponse] = []


# ---------- Meals ----------


class MealShareCreate(BaseModel):
    """Schema for sharing a meal resource with another user."""

    email: str
    permission: str = "read"


class MealShareResponse(BaseModel):
    """Schema returned for a meal share record."""

    id: int
    shared_with_user_id: int
    shared_with_name: str
    shared_with_email: str
    permission: str


class RecipeBatchShareCreate(BaseModel):
    """Schema for bulk-sharing multiple recipes with one user."""

    email: str
    permission: str = "read"
    recipe_ids: list[int]


class RecipeIngredientCreate(BaseModel):
    """Schema for adding an ingredient to a recipe."""

    name: str
    amount: str | None = None
    unit: str | None = None


class RecipeIngredientResponse(BaseModel):
    """Schema returned for a single recipe ingredient."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    amount: str | None
    unit: str | None
    position: int


class RecipeCreate(BaseModel):
    """Schema for creating a recipe."""

    name: str
    description: str | None = None
    servings: int = 4
    category: str = "other"


class RecipeUpdate(BaseModel):
    """Schema for updating a recipe. All fields optional."""

    name: str | None = None
    description: str | None = None
    servings: int | None = None
    category: str | None = None


class RecipeResponse(BaseModel):
    """Schema returned for a single recipe."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    description: str | None
    servings: int
    category: str
    created_at: datetime
    ingredients: list[RecipeIngredientResponse] = []
    permission: str = "owner"
    owner_id: int | None = None
    owner_name: str | None = None
    shares: list[MealShareResponse] = []


class MealCreate(BaseModel):
    """Schema for creating a meal."""

    name: str


class MealUpdate(BaseModel):
    """Schema for updating a meal."""

    name: str


class MealRecipeAdd(BaseModel):
    """Schema for adding a recipe to a meal."""

    recipe_id: int


class MealRecipeResponse(BaseModel):
    """Schema returned for a recipe in a meal."""

    id: int
    recipe_id: int
    recipe_name: str
    position: int


class MealResponse(BaseModel):
    """Schema returned for a single meal."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
    recipes: list[MealRecipeResponse] = []


class MealPlanCreate(BaseModel):
    """Schema for creating a meal plan."""

    name: str


class MealPlanUpdate(BaseModel):
    """Schema for updating a meal plan."""

    name: str


class MealPlanSlotCreate(BaseModel):
    """Schema for adding a slot to a meal plan."""

    day_label: str
    slot_label: str
    meal_id: int | None = None
    recipe_id: int | None = None


class MealPlanSlotResponse(BaseModel):
    """Schema returned for a single meal plan slot."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    day_label: str
    slot_label: str
    meal_id: int | None
    meal_name: str | None = None
    recipe_id: int | None
    recipe_name: str | None = None
    position: int


class MealPlanResponse(BaseModel):
    """Schema returned for a single meal plan."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime
    slots: list[MealPlanSlotResponse] = []
    permission: str = "owner"
    owner_id: int | None = None
    owner_name: str | None = None
    shares: list[MealShareResponse] = []


class ShoppingListCreate(BaseModel):
    """Schema for creating a shopping list."""

    name: str
    meal_plan_id: int | None = None
    recipe_ids: list[int] = []


class ShoppingListItemAdd(BaseModel):
    """Schema for adding an item to a shopping list."""

    name: str
    amount: str | None = None
    unit: str | None = None
    source_recipe: str | None = None


class ShoppingListItemResponse(BaseModel):
    """Schema returned for a single shopping list item."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    amount: str | None
    unit: str | None
    checked: bool
    source_recipe: str | None
    position: int


class ShoppingListResponse(BaseModel):
    """Schema returned for a single shopping list."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    source_plan_id: int | None
    created_at: datetime
    items: list[ShoppingListItemResponse] = []
    permission: str = "owner"
    owner_id: int | None = None
    owner_name: str | None = None
    shares: list[MealShareResponse] = []
