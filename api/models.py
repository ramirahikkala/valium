"""SQLAlchemy ORM models."""

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all ORM models."""


class RecurrenceType(str, enum.Enum):
    """Allowed recurrence types for alarms."""

    none = "none"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class NotificationChannel(str, enum.Enum):
    """Supported notification channels."""

    email = "email"


class TaskStatus(str, enum.Enum):
    """Allowed status values for a task."""

    pending = "pending"
    in_progress = "in_progress"
    done = "done"


class User(Base):
    """Represents a user authenticated via Google Sign-In."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    google_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    picture: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    lists: Mapped[list["List"]] = relationship("List", back_populates="user")
    exercises: Mapped[list["Exercise"]] = relationship("Exercise", back_populates="user")
    workout_programs: Mapped[list["WorkoutProgram"]] = relationship(
        "WorkoutProgram", back_populates="user"
    )
    workout_sessions: Mapped[list["WorkoutSession"]] = relationship(
        "WorkoutSession", back_populates="user"
    )
    settings: Mapped["UserSettings | None"] = relationship(
        "UserSettings", back_populates="user", uselist=False
    )
    app_access: Mapped[list["UserAppAccess"]] = relationship(
        "UserAppAccess", back_populates="user"
    )
    plant_locations: Mapped[list["PlantLocation"]] = relationship(
        "PlantLocation", back_populates="user"
    )
    plants: Mapped[list["Plant"]] = relationship("Plant", back_populates="user")


class UserInvite(Base):
    """Stores email addresses pre-approved for registration by the admin."""

    __tablename__ = "user_invites"

    email: Mapped[str] = mapped_column(String(255), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class UserAppAccess(Base):
    """Stores per-user app access permissions."""

    __tablename__ = "user_app_access"

    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    app: Mapped[str] = mapped_column(String(50), primary_key=True)
    enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    user: Mapped["User"] = relationship("User", back_populates="app_access")


class UserSettings(Base):
    """Stores per-user application settings."""

    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    language: Mapped[str] = mapped_column(String(10), nullable=False, server_default="fi")

    user: Mapped["User"] = relationship("User", back_populates="settings")


class List(Base):
    """Represents a user-defined list for organizing tasks."""

    __tablename__ = "lists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    user_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped[User | None] = relationship("User", back_populates="lists")
    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="list")
    shares: Mapped[list["ListShare"]] = relationship(
        "ListShare", cascade="all, delete-orphan"
    )

    __table_args__ = (
        # Unique list name per user
        {"comment": "unique constraint handled by migration"},
    )


class Task(Base):
    """Represents a single todo task."""

    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="taskstatus", native_enum=False),
        nullable=False,
        default=TaskStatus.pending,
        server_default=TaskStatus.pending.value,
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    list_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("lists.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    list: Mapped[List | None] = relationship("List", back_populates="tasks")
    alarms: Mapped[list["Alarm"]] = relationship(
        "Alarm", back_populates="task", cascade="all, delete-orphan"
    )


class Alarm(Base):
    """Represents an alarm/reminder attached to a task."""

    __tablename__ = "alarms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    channel: Mapped[str] = mapped_column(
        String(20), nullable=False, default=NotificationChannel.email.value,
        server_default=NotificationChannel.email.value,
    )
    alarm_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    recurrence: Mapped[str] = mapped_column(
        String(20), nullable=False, default=RecurrenceType.none.value,
        server_default=RecurrenceType.none.value,
    )
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    last_sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    task: Mapped[Task] = relationship("Task", back_populates="alarms")

    __table_args__ = (
        UniqueConstraint("task_id", "channel", name="uq_alarm_task_channel"),
        Index("ix_alarm_enabled_at", "enabled", "alarm_at"),
    )


# ---------- Gym models ----------


class Exercise(Base):
    """Represents a named exercise in the user's personal exercise library."""

    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    consecutive_failures: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )

    user: Mapped[User] = relationship("User", back_populates="exercises")
    program_exercises: Mapped[list["ProgramExercise"]] = relationship(
        "ProgramExercise", back_populates="exercise"
    )
    session_sets: Mapped[list["SessionSet"]] = relationship(
        "SessionSet", back_populates="exercise"
    )


class WorkoutProgram(Base):
    """Represents a named workout program belonging to a user."""

    __tablename__ = "workout_programs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped[User] = relationship("User", back_populates="workout_programs")
    exercises: Mapped[list["ProgramExercise"]] = relationship(
        "ProgramExercise",
        back_populates="program",
        cascade="all, delete-orphan",
        order_by="ProgramExercise.position",
    )
    sessions: Mapped[list["WorkoutSession"]] = relationship(
        "WorkoutSession", back_populates="program"
    )


class ProgramExercise(Base):
    """Represents a single exercise within a workout program."""

    __tablename__ = "program_exercises"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    program_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("workout_programs.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False
    )
    weight: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, server_default="0"
    )
    sets: Mapped[int] = mapped_column(Integer, nullable=False, default=3, server_default="3")
    reps: Mapped[int] = mapped_column(Integer, nullable=False, default=10, server_default="10")
    rest_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=90, server_default="90")
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    auto_increment: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    increment_kg: Mapped[float] = mapped_column(
        Float, nullable=False, default=2.5, server_default="2.5"
    )
    base_weight: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, server_default="0"
    )
    reset_increment_kg: Mapped[float] = mapped_column(
        Float, nullable=False, default=5.0, server_default="5"
    )
    deload_mode: Mapped[str] = mapped_column(
        String, nullable=False, default="reset", server_default="reset"
    )
    failure_threshold: Mapped[int] = mapped_column(
        Integer, nullable=False, default=3, server_default="3"
    )

    program: Mapped[WorkoutProgram] = relationship("WorkoutProgram", back_populates="exercises")
    exercise: Mapped[Exercise] = relationship("Exercise", back_populates="program_exercises")


class WorkoutSession(Base):
    """Represents a single completed or ongoing workout session."""

    __tablename__ = "workout_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    program_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("workout_programs.id", ondelete="SET NULL"), nullable=True
    )
    program_name: Mapped[str] = mapped_column(String(255), nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    user: Mapped[User] = relationship("User", back_populates="workout_sessions")
    program: Mapped[WorkoutProgram | None] = relationship(
        "WorkoutProgram", back_populates="sessions"
    )
    sets: Mapped[list["SessionSet"]] = relationship(
        "SessionSet", back_populates="session", cascade="all, delete-orphan"
    )


class SessionSet(Base):
    """Represents a single logged set within a workout session."""

    __tablename__ = "session_sets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("workout_sessions.id", ondelete="CASCADE"), nullable=False
    )
    exercise_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("exercises.id", ondelete="SET NULL"), nullable=True
    )
    exercise_name: Mapped[str] = mapped_column(String(255), nullable=False)
    set_number: Mapped[int] = mapped_column(Integer, nullable=False)
    weight_used: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, server_default="0"
    )
    reps_done: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    session: Mapped[WorkoutSession] = relationship("WorkoutSession", back_populates="sets")
    exercise: Mapped[Exercise | None] = relationship("Exercise", back_populates="session_sets")


# ---------- Plants models ----------


class PlantLocation(Base):
    """Represents a named location where plants can be placed."""

    __tablename__ = "plant_locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="plant_locations")
    plants: Mapped[list["Plant"]] = relationship("Plant", back_populates="location")


class Plant(Base):
    """Represents a plant in the user's catalogue."""

    __tablename__ = "plants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    latin_name: Mapped[str] = mapped_column(String(500), nullable=False)
    common_name: Mapped[str | None] = mapped_column(String(500), nullable=True)
    cultivar: Mapped[str | None] = mapped_column(String(255), nullable=True)
    year_acquired: Mapped[int | None] = mapped_column(Integer, nullable=True)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("plant_locations.id", ondelete="SET NULL"), nullable=True
    )
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, default="perennial", server_default="perennial"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active", server_default="active"
    )
    lost_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    own_seeds: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped["User"] = relationship("User", back_populates="plants")
    location: Mapped["PlantLocation | None"] = relationship(
        "PlantLocation", back_populates="plants"
    )
    images: Mapped[list["PlantImage"]] = relationship(
        "PlantImage",
        back_populates="plant",
        order_by="PlantImage.sort_order, PlantImage.created_at",
        cascade="all, delete-orphan",
    )


class PlantImage(Base):
    """Represents a photo attached to a plant."""

    __tablename__ = "plant_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plant_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("plants.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    caption: Mapped[str | None] = mapped_column(Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    plant: Mapped["Plant"] = relationship("Plant", back_populates="images")


# ---------- AI providers ----------


class ListShare(Base):
    """Represents a sharing record granting another user access to a list."""

    __tablename__ = "list_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    list_id: Mapped[int] = mapped_column(ForeignKey("lists.id", ondelete="CASCADE"))
    shared_with_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    permission: Mapped[str] = mapped_column(String(10), nullable=False, default="read")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    shared_with: Mapped["User"] = relationship("User", foreign_keys=[shared_with_user_id])

    __table_args__ = (
        UniqueConstraint("list_id", "shared_with_user_id"),
    )


class PlantCollectionShare(Base):
    """Represents a sharing record granting another user access to a plant collection."""

    __tablename__ = "plant_collection_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    shared_with_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    permission: Mapped[str] = mapped_column(String(10), nullable=False, default="read")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    owner: Mapped["User"] = relationship("User", foreign_keys=[owner_user_id])
    shared_with: Mapped["User"] = relationship("User", foreign_keys=[shared_with_user_id])

    __table_args__ = (
        UniqueConstraint("owner_user_id", "shared_with_user_id"),
    )


# ---------- Plant groups ----------


class PlantGroup(Base):
    """A group that allows multiple users to share one plant collection."""

    __tablename__ = "plant_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    members: Mapped[list["PlantGroupMember"]] = relationship(
        "PlantGroupMember", cascade="all, delete-orphan", back_populates="group"
    )


class PlantGroupMember(Base):
    """Membership record linking a user to a plant group (one group per user max)."""

    __tablename__ = "plant_group_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("plant_groups.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    group: Mapped["PlantGroup"] = relationship("PlantGroup", back_populates="members")
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])

    __table_args__ = (UniqueConstraint("user_id"),)


class PlantNote(Base):
    """A free-text note shared within a plant group."""

    __tablename__ = "plant_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False, server_default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


# ---------- AI providers ----------


class AIProvider(Base):
    """Represents a configured AI provider (Anthropic or OpenAI)."""

    __tablename__ = "ai_providers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(100), nullable=False)
    api_key: Mapped[str] = mapped_column(Text, nullable=False)
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


# ---------- Checklist ----------


class ChecklistTemplate(Base):
    """A reusable checklist template (e.g. 'Basic overnight', 'Winter sports')."""

    __tablename__ = "checklist_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["ChecklistTemplateItem"]] = relationship(
        cascade="all, delete-orphan", order_by="ChecklistTemplateItem.position"
    )
    includes: Mapped[list["ChecklistTemplateInclude"]] = relationship(
        foreign_keys="ChecklistTemplateInclude.parent_id",
        cascade="all, delete-orphan",
        order_by="ChecklistTemplateInclude.position",
    )
    shares: Mapped[list["ChecklistTemplateShare"]] = relationship(
        cascade="all, delete-orphan"
    )


class ChecklistTemplateItem(Base):
    """A single item within a checklist template."""

    __tablename__ = "checklist_template_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    template_id: Mapped[int] = mapped_column(ForeignKey("checklist_templates.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(String(500), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")


class ChecklistTemplateInclude(Base):
    """Records that one template includes another as a sub-template."""

    __tablename__ = "checklist_template_includes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    parent_id: Mapped[int] = mapped_column(ForeignKey("checklist_templates.id", ondelete="CASCADE"))
    child_id: Mapped[int] = mapped_column(ForeignKey("checklist_templates.id", ondelete="CASCADE"))
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    child: Mapped["ChecklistTemplate"] = relationship("ChecklistTemplate", foreign_keys=[child_id])

    __table_args__ = (UniqueConstraint("parent_id", "child_id"),)


class ChecklistSession(Base):
    """A single trip / packing instance created from one or more templates."""

    __tablename__ = "checklist_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    items: Mapped[list["ChecklistSessionItem"]] = relationship(
        cascade="all, delete-orphan", order_by="ChecklistSessionItem.position"
    )
    shares: Mapped[list["ChecklistSessionShare"]] = relationship(
        cascade="all, delete-orphan"
    )


class ChecklistSessionItem(Base):
    """A single checkable item in a packing session."""

    __tablename__ = "checklist_session_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("checklist_sessions.id", ondelete="CASCADE"))
    text: Mapped[str] = mapped_column(String(500), nullable=False)
    checked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    template_id: Mapped[int | None] = mapped_column(
        ForeignKey("checklist_templates.id", ondelete="SET NULL"), nullable=True
    )
    template_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")


class ChecklistSessionShare(Base):
    """Grants another user access to a checklist session (trip)."""

    __tablename__ = "checklist_session_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("checklist_sessions.id", ondelete="CASCADE"), nullable=False
    )
    shared_with_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    permission: Mapped[str] = mapped_column(String(10), nullable=False, default="write")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    shared_with: Mapped["User"] = relationship("User", foreign_keys=[shared_with_user_id])

    __table_args__ = (UniqueConstraint("session_id", "shared_with_user_id"),)


class ChecklistTemplateShare(Base):
    """Grants another user access to a checklist template."""

    __tablename__ = "checklist_template_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    template_id: Mapped[int] = mapped_column(
        ForeignKey("checklist_templates.id", ondelete="CASCADE"), nullable=False
    )
    shared_with_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    permission: Mapped[str] = mapped_column(String(10), nullable=False, default="read")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    shared_with: Mapped["User"] = relationship("User", foreign_keys=[shared_with_user_id])

    __table_args__ = (UniqueConstraint("template_id", "shared_with_user_id"),)


# ---------- Meals ----------


class Recipe(Base):
    """A recipe with ingredients and instructions."""

    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    servings: Mapped[int] = mapped_column(Integer, nullable=False, default=4, server_default="4")
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="other")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    ingredients: Mapped[list["RecipeIngredient"]] = relationship(
        cascade="all, delete-orphan", order_by="RecipeIngredient.position"
    )
    shares: Mapped[list["RecipeShare"]] = relationship(cascade="all, delete-orphan")


class RecipeIngredient(Base):
    """A single ingredient line in a recipe."""

    __tablename__ = "recipe_ingredients"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[str | None] = mapped_column(String(50), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")


class RecipeShare(Base):
    """Grants another user access to a recipe."""

    __tablename__ = "recipe_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    shared_with_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    permission: Mapped[str] = mapped_column(String(10), nullable=False, default="read")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    shared_with: Mapped["User"] = relationship("User", foreign_keys=[shared_with_user_id])

    __table_args__ = (UniqueConstraint("recipe_id", "shared_with_user_id"),)


class Meal(Base):
    """A named collection of recipes (e.g. 'Monday dinner')."""

    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    meal_recipes: Mapped[list["MealRecipe"]] = relationship(
        cascade="all, delete-orphan", order_by="MealRecipe.position"
    )


class MealRecipe(Base):
    """Association between a meal and a recipe."""

    __tablename__ = "meal_recipes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    recipe: Mapped["Recipe"] = relationship("Recipe")


class MealPlan(Base):
    """A weekly or named meal plan containing scheduled meals."""

    __tablename__ = "meal_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    slots: Mapped[list["MealPlanSlot"]] = relationship(
        cascade="all, delete-orphan", order_by="MealPlanSlot.position"
    )
    shares: Mapped[list["MealPlanShare"]] = relationship(cascade="all, delete-orphan")


class MealPlanSlot(Base):
    """A single day+time entry in a meal plan, referencing a meal or recipe."""

    __tablename__ = "meal_plan_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meal_plan_id: Mapped[int] = mapped_column(ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False)
    day_label: Mapped[str] = mapped_column(String(50), nullable=False)
    slot_label: Mapped[str] = mapped_column(String(50), nullable=False)
    meal_id: Mapped[int | None] = mapped_column(
        ForeignKey("meals.id", ondelete="SET NULL"), nullable=True
    )
    recipe_id: Mapped[int | None] = mapped_column(
        ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True
    )
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    meal: Mapped["Meal | None"] = relationship("Meal")
    recipe: Mapped["Recipe | None"] = relationship("Recipe")


class MealPlanShare(Base):
    """Grants another user access to a meal plan."""

    __tablename__ = "meal_plan_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    meal_plan_id: Mapped[int] = mapped_column(ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False)
    shared_with_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    permission: Mapped[str] = mapped_column(String(10), nullable=False, default="read")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    shared_with: Mapped["User"] = relationship("User", foreign_keys=[shared_with_user_id])

    __table_args__ = (UniqueConstraint("meal_plan_id", "shared_with_user_id"),)


class ShoppingList(Base):
    """A shopping list, optionally generated from a meal plan."""

    __tablename__ = "shopping_lists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    source_plan_id: Mapped[int | None] = mapped_column(
        ForeignKey("meal_plans.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    items: Mapped[list["ShoppingListItem"]] = relationship(
        cascade="all, delete-orphan", order_by="ShoppingListItem.position"
    )
    shares: Mapped[list["ShoppingListShare"]] = relationship(cascade="all, delete-orphan")


class ShoppingListItem(Base):
    """A single checkable item in a shopping list."""

    __tablename__ = "shopping_list_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    shopping_list_id: Mapped[int] = mapped_column(
        ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    amount: Mapped[str | None] = mapped_column(String(50), nullable=True)
    unit: Mapped[str | None] = mapped_column(String(50), nullable=True)
    checked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    source_recipe: Mapped[str | None] = mapped_column(String(200), nullable=True)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")


class ShoppingListShare(Base):
    """Grants another user access to a shopping list."""

    __tablename__ = "shopping_list_shares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    shopping_list_id: Mapped[int] = mapped_column(
        ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False
    )
    shared_with_user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    permission: Mapped[str] = mapped_column(String(10), nullable=False, default="write")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    shared_with: Mapped["User"] = relationship("User", foreign_keys=[shared_with_user_id])

    __table_args__ = (UniqueConstraint("shopping_list_id", "shared_with_user_id"),)
