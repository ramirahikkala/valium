"""Gym workout API router."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_session
from models import ProgramExercise, SessionSet, User, WorkoutProgram, WorkoutSession
from schemas import (
    ExerciseCreate,
    ExerciseResponse,
    ExerciseUpdate,
    ProgramCreate,
    ProgramResponse,
    ProgramUpdate,
    SessionCreate,
    SessionResponse,
    SessionSetCreate,
    SessionSetResponse,
)

router = APIRouter(prefix="/gym", tags=["gym"])


async def _get_program(
    session: AsyncSession, program_id: int, user_id: int
) -> WorkoutProgram:
    """Load a workout program and verify ownership. Raises 404 if not found/owned."""
    result = await session.execute(
        select(WorkoutProgram)
        .options(selectinload(WorkoutProgram.exercises))
        .where(WorkoutProgram.id == program_id, WorkoutProgram.user_id == user_id)
    )
    program = result.scalar_one_or_none()
    if program is None:
        raise HTTPException(status_code=404, detail="Program not found")
    return program


async def _get_session(
    db: AsyncSession, session_id: int, user_id: int
) -> WorkoutSession:
    """Load a workout session and verify ownership. Raises 404 if not found/owned."""
    result = await db.execute(
        select(WorkoutSession).where(
            WorkoutSession.id == session_id,
            WorkoutSession.user_id == user_id,
        )
    )
    ws = result.scalar_one_or_none()
    if ws is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return ws


# ---------- Programs ----------


@router.get("/programs", response_model=list[ProgramResponse])
async def list_programs(
    active: bool | None = Query(None, description="Filter by is_active flag"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ProgramResponse]:
    """List all workout programs for the current user."""
    stmt = (
        select(WorkoutProgram)
        .options(selectinload(WorkoutProgram.exercises))
        .where(WorkoutProgram.user_id == current_user.id)
        .order_by(WorkoutProgram.created_at.desc())
    )
    if active is not None:
        stmt = stmt.where(WorkoutProgram.is_active == active)
    result = await session.execute(stmt)
    return [ProgramResponse.model_validate(p) for p in result.scalars().all()]


@router.post("/programs", response_model=ProgramResponse, status_code=201)
async def create_program(
    body: ProgramCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ProgramResponse:
    """Create a new workout program."""
    program = WorkoutProgram(user_id=current_user.id, name=body.name)
    session.add(program)
    await session.commit()
    result = await session.execute(
        select(WorkoutProgram)
        .options(selectinload(WorkoutProgram.exercises))
        .where(WorkoutProgram.id == program.id)
    )
    return ProgramResponse.model_validate(result.scalar_one())


@router.put("/programs/{program_id}", response_model=ProgramResponse)
async def update_program(
    program_id: int,
    body: ProgramUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ProgramResponse:
    """Update a workout program name or active status."""
    program = await _get_program(session, program_id, current_user.id)
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(program, field, value)
    await session.commit()
    result = await session.execute(
        select(WorkoutProgram)
        .options(selectinload(WorkoutProgram.exercises))
        .where(WorkoutProgram.id == program_id)
    )
    return ProgramResponse.model_validate(result.scalar_one())


@router.delete("/programs/{program_id}", status_code=204)
async def delete_program(
    program_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a workout program and all its exercises."""
    program = await _get_program(session, program_id, current_user.id)
    await session.delete(program)
    await session.commit()


# ---------- Exercises ----------


@router.get("/programs/{program_id}/exercises", response_model=list[ExerciseResponse])
async def list_exercises(
    program_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ExerciseResponse]:
    """List exercises in a program ordered by position."""
    await _get_program(session, program_id, current_user.id)
    result = await session.execute(
        select(ProgramExercise)
        .where(ProgramExercise.program_id == program_id)
        .order_by(ProgramExercise.position)
    )
    return [ExerciseResponse.model_validate(e) for e in result.scalars().all()]


@router.post(
    "/programs/{program_id}/exercises",
    response_model=ExerciseResponse,
    status_code=201,
)
async def create_exercise(
    program_id: int,
    body: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ExerciseResponse:
    """Add an exercise to a program."""
    await _get_program(session, program_id, current_user.id)
    count_result = await session.execute(
        select(ProgramExercise).where(ProgramExercise.program_id == program_id)
    )
    position = len(count_result.scalars().all())
    exercise = ProgramExercise(
        program_id=program_id,
        name=body.name,
        weight=body.weight,
        sets=body.sets,
        reps=body.reps,
        position=position,
    )
    session.add(exercise)
    await session.commit()
    await session.refresh(exercise)
    return ExerciseResponse.model_validate(exercise)


@router.put(
    "/programs/{program_id}/exercises/{exercise_id}",
    response_model=ExerciseResponse,
)
async def update_exercise(
    program_id: int,
    exercise_id: int,
    body: ExerciseUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ExerciseResponse:
    """Update a program exercise."""
    await _get_program(session, program_id, current_user.id)
    exercise = await session.get(ProgramExercise, exercise_id)
    if exercise is None or exercise.program_id != program_id:
        raise HTTPException(status_code=404, detail="Exercise not found")
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)
    await session.commit()
    await session.refresh(exercise)
    return ExerciseResponse.model_validate(exercise)


@router.delete("/programs/{program_id}/exercises/{exercise_id}", status_code=204)
async def delete_exercise(
    program_id: int,
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete an exercise from a program."""
    await _get_program(session, program_id, current_user.id)
    exercise = await session.get(ProgramExercise, exercise_id)
    if exercise is None or exercise.program_id != program_id:
        raise HTTPException(status_code=404, detail="Exercise not found")
    await session.delete(exercise)
    await session.commit()


# ---------- Sessions ----------


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(
    body: SessionCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SessionResponse:
    """Start a new workout session from a program."""
    program = await _get_program(session, body.program_id, current_user.id)
    ws = WorkoutSession(
        user_id=current_user.id,
        program_id=program.id,
        program_name=program.name,
    )
    session.add(ws)
    await session.commit()
    await session.refresh(ws)
    return SessionResponse.model_validate(ws)


@router.put("/sessions/{session_id}/complete", response_model=SessionResponse)
async def complete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SessionResponse:
    """Mark a workout session as completed."""
    ws = await _get_session(session, session_id, current_user.id)
    ws.completed_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(ws)
    return SessionResponse.model_validate(ws)


@router.get("/sessions", response_model=list[SessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[SessionResponse]:
    """List all workout sessions for the current user, newest first."""
    result = await session.execute(
        select(WorkoutSession)
        .where(WorkoutSession.user_id == current_user.id)
        .order_by(WorkoutSession.started_at.desc())
    )
    return [SessionResponse.model_validate(ws) for ws in result.scalars().all()]


@router.get("/sessions/{session_id}/sets", response_model=list[SessionSetResponse])
async def list_session_sets(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[SessionSetResponse]:
    """List all logged sets for a workout session."""
    await _get_session(session, session_id, current_user.id)
    result = await session.execute(
        select(SessionSet)
        .where(SessionSet.session_id == session_id)
        .order_by(SessionSet.completed_at)
    )
    return [SessionSetResponse.model_validate(s) for s in result.scalars().all()]


@router.post(
    "/sessions/{session_id}/sets",
    response_model=SessionSetResponse,
    status_code=201,
)
async def log_set(
    session_id: int,
    body: SessionSetCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SessionSetResponse:
    """Log a set during an active workout session."""
    await _get_session(session, session_id, current_user.id)
    s = SessionSet(
        session_id=session_id,
        exercise_id=body.exercise_id,
        exercise_name=body.exercise_name,
        set_number=body.set_number,
        weight_used=body.weight_used,
        reps_done=body.reps_done,
    )
    session.add(s)
    await session.commit()
    await session.refresh(s)
    return SessionSetResponse.model_validate(s)
