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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    user: Mapped["User"] = relationship("User", back_populates="plants")
    location: Mapped["PlantLocation | None"] = relationship(
        "PlantLocation", back_populates="plants"
    )
