"""Gym workout API router."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_session
from models import Exercise, ProgramExercise, SessionSet, User, WorkoutProgram, WorkoutSession
from schemas import (
    ExerciseCreate,
    ExerciseResponse,
    ExerciseUpdate,
    GymExerciseCreate,
    GymExerciseResponse,
    GymExerciseUpdate,
    LastPerformance,
    ProgramCreate,
    ProgramResponse,
    ProgramUpdate,
    SessionCompleteRequest,
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
        .options(selectinload(WorkoutProgram.exercises).selectinload(ProgramExercise.exercise))
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


async def _get_last_performance(
    session: AsyncSession, exercise_id: int, user_id: int
) -> LastPerformance | None:
    """Return the most recent set logged for a global exercise by this user."""
    result = await session.execute(
        select(SessionSet)
        .join(WorkoutSession, SessionSet.session_id == WorkoutSession.id)
        .where(
            SessionSet.exercise_id == exercise_id,
            WorkoutSession.user_id == user_id,
            WorkoutSession.completed_at.isnot(None),
        )
        .order_by(SessionSet.completed_at.desc())
        .limit(1)
    )
    s = result.scalar_one_or_none()
    if s is None:
        return None
    return LastPerformance(
        weight_used=s.weight_used,
        reps_done=s.reps_done,
        completed_at=s.completed_at,
    )


def _make_exercise_response(pe: ProgramExercise, last_perf: LastPerformance | None) -> ExerciseResponse:
    """Build an ExerciseResponse from a ProgramExercise ORM object."""
    return ExerciseResponse(
        id=pe.id,
        program_id=pe.program_id,
        exercise_id=pe.exercise_id,
        exercise_name=pe.exercise.name,
        weight=pe.weight,
        sets=pe.sets,
        reps=pe.reps,
        rest_seconds=pe.rest_seconds,
        position=pe.position,
        auto_increment=pe.auto_increment,
        increment_kg=pe.increment_kg,
        base_weight=pe.base_weight,
        reset_increment_kg=pe.reset_increment_kg,
        last_performance=last_perf,
    )


# ---------- Exercise Library ----------


@router.get("/exercises", response_model=list[GymExerciseResponse])
async def list_exercises_library(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[GymExerciseResponse]:
    """List all exercises in the user's exercise library."""
    result = await session.execute(
        select(Exercise)
        .where(Exercise.user_id == current_user.id)
        .order_by(Exercise.name)
    )
    return [GymExerciseResponse.model_validate(e) for e in result.scalars().all()]


@router.post("/exercises", response_model=GymExerciseResponse, status_code=201)
async def create_exercise_library(
    body: GymExerciseCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> GymExerciseResponse:
    """Create a new exercise in the user's exercise library."""
    ex = Exercise(user_id=current_user.id, name=body.name)
    session.add(ex)
    await session.commit()
    await session.refresh(ex)
    return GymExerciseResponse.model_validate(ex)


@router.put("/exercises/{exercise_id}", response_model=GymExerciseResponse)
async def update_exercise_library(
    exercise_id: int,
    body: GymExerciseUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> GymExerciseResponse:
    """Rename a library exercise."""
    ex = await session.get(Exercise, exercise_id)
    if ex is None or ex.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exercise not found")
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ex, field, value)
    await session.commit()
    await session.refresh(ex)
    return GymExerciseResponse.model_validate(ex)


@router.delete("/exercises/{exercise_id}", status_code=204)
async def delete_exercise_library(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a library exercise (also removes it from all programs)."""
    ex = await session.get(Exercise, exercise_id)
    if ex is None or ex.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exercise not found")
    await session.delete(ex)
    await session.commit()


@router.get("/exercises/{exercise_id}/last-performance", response_model=LastPerformance | None)
async def get_last_performance(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> LastPerformance | None:
    """Return the most recent completed set for a global exercise."""
    ex = await session.get(Exercise, exercise_id)
    if ex is None or ex.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return await _get_last_performance(session, exercise_id, current_user.id)


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
        .options(selectinload(WorkoutProgram.exercises).selectinload(ProgramExercise.exercise))
        .where(WorkoutProgram.user_id == current_user.id)
        .order_by(WorkoutProgram.created_at.desc())
    )
    if active is not None:
        stmt = stmt.where(WorkoutProgram.is_active == active)
    result = await session.execute(stmt)
    programs = result.scalars().all()

    program_responses = []
    for program in programs:
        exercise_responses = []
        for pe in program.exercises:
            last_perf = await _get_last_performance(session, pe.exercise_id, current_user.id)
            exercise_responses.append(_make_exercise_response(pe, last_perf))
        program_responses.append(
            ProgramResponse(
                id=program.id,
                name=program.name,
                is_active=program.is_active,
                created_at=program.created_at,
                exercises=exercise_responses,
            )
        )
    return program_responses


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
        .options(selectinload(WorkoutProgram.exercises).selectinload(ProgramExercise.exercise))
        .where(WorkoutProgram.id == program.id)
    )
    p = result.scalar_one()
    return ProgramResponse(
        id=p.id,
        name=p.name,
        is_active=p.is_active,
        created_at=p.created_at,
        exercises=[],
    )


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
        .options(selectinload(WorkoutProgram.exercises).selectinload(ProgramExercise.exercise))
        .where(WorkoutProgram.id == program_id)
    )
    p = result.scalar_one()
    exercise_responses = []
    for pe in p.exercises:
        last_perf = await _get_last_performance(session, pe.exercise_id, current_user.id)
        exercise_responses.append(_make_exercise_response(pe, last_perf))
    return ProgramResponse(
        id=p.id,
        name=p.name,
        is_active=p.is_active,
        created_at=p.created_at,
        exercises=exercise_responses,
    )


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


# ---------- Program Exercises ----------


@router.get("/programs/{program_id}/exercises", response_model=list[ExerciseResponse])
async def list_program_exercises(
    program_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ExerciseResponse]:
    """List exercises in a program ordered by position, including last performance."""
    await _get_program(session, program_id, current_user.id)
    result = await session.execute(
        select(ProgramExercise)
        .options(selectinload(ProgramExercise.exercise))
        .where(ProgramExercise.program_id == program_id)
        .order_by(ProgramExercise.position)
    )
    exercises = result.scalars().all()
    responses = []
    for pe in exercises:
        last_perf = await _get_last_performance(session, pe.exercise_id, current_user.id)
        responses.append(_make_exercise_response(pe, last_perf))
    return responses


@router.post(
    "/programs/{program_id}/exercises",
    response_model=ExerciseResponse,
    status_code=201,
)
async def create_program_exercise(
    program_id: int,
    body: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ExerciseResponse:
    """Add an exercise from the library to a program."""
    await _get_program(session, program_id, current_user.id)

    # Verify exercise belongs to user
    ex = await session.get(Exercise, body.exercise_id)
    if ex is None or ex.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Exercise not found in library")

    count_result = await session.execute(
        select(ProgramExercise).where(ProgramExercise.program_id == program_id)
    )
    position = len(count_result.scalars().all())
    pe = ProgramExercise(
        program_id=program_id,
        exercise_id=body.exercise_id,
        weight=body.weight,
        sets=body.sets,
        reps=body.reps,
        rest_seconds=body.rest_seconds,
        position=position,
        auto_increment=body.auto_increment,
        increment_kg=body.increment_kg,
        reset_increment_kg=body.reset_increment_kg,
        base_weight=body.weight if body.auto_increment else 0.0,
    )
    session.add(pe)
    await session.commit()

    # Reload with exercise relationship
    result = await session.execute(
        select(ProgramExercise)
        .options(selectinload(ProgramExercise.exercise))
        .where(ProgramExercise.id == pe.id)
    )
    pe = result.scalar_one()
    last_perf = await _get_last_performance(session, pe.exercise_id, current_user.id)
    return _make_exercise_response(pe, last_perf)


@router.put(
    "/programs/{program_id}/exercises/{exercise_id}",
    response_model=ExerciseResponse,
)
async def update_program_exercise(
    program_id: int,
    exercise_id: int,
    body: ExerciseUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ExerciseResponse:
    """Update a program exercise (weight, sets, reps, rest, position)."""
    await _get_program(session, program_id, current_user.id)
    result = await session.execute(
        select(ProgramExercise)
        .options(selectinload(ProgramExercise.exercise))
        .where(ProgramExercise.id == exercise_id, ProgramExercise.program_id == program_id)
    )
    pe = result.scalar_one_or_none()
    if pe is None:
        raise HTTPException(status_code=404, detail="Exercise not found")
    old_auto_increment = pe.auto_increment
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pe, field, value)
    # When auto_increment is enabled for the first time, seed base_weight from current weight
    if not old_auto_increment and pe.auto_increment and pe.base_weight == 0:
        pe.base_weight = pe.weight
    await session.commit()
    await session.refresh(pe)
    # reload exercise relationship
    result = await session.execute(
        select(ProgramExercise)
        .options(selectinload(ProgramExercise.exercise))
        .where(ProgramExercise.id == pe.id)
    )
    pe = result.scalar_one()
    last_perf = await _get_last_performance(session, pe.exercise_id, current_user.id)
    return _make_exercise_response(pe, last_perf)


@router.delete("/programs/{program_id}/exercises/{exercise_id}", status_code=204)
async def delete_program_exercise(
    program_id: int,
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove an exercise from a program."""
    await _get_program(session, program_id, current_user.id)
    pe = await session.get(ProgramExercise, exercise_id)
    if pe is None or pe.program_id != program_id:
        raise HTTPException(status_code=404, detail="Exercise not found")
    await session.delete(pe)
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
    body: SessionCompleteRequest = SessionCompleteRequest(),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> SessionResponse:
    """Mark a workout session as completed and apply auto-increment logic."""
    ws = await _get_session(session, session_id, current_user.id)

    # Apply auto-increment weight progression for exercises in the program
    if ws.program_id:
        result = await session.execute(
            select(ProgramExercise).where(ProgramExercise.program_id == ws.program_id)
        )
        program_exercises = result.scalars().all()
        for ex in program_exercises:
            if ex.auto_increment:
                if body.session_outcome == "failed_reset":
                    ex.base_weight = round(ex.base_weight + ex.reset_increment_kg, 2)
                    ex.weight = ex.base_weight
                elif body.session_outcome == "failed_stay":
                    pass  # weights unchanged
                else:  # "success"
                    if ex.id in body.failed_exercise_ids:
                        ex.base_weight = round(ex.base_weight + ex.reset_increment_kg, 2)
                        ex.weight = ex.base_weight
                    else:
                        ex.weight = round(ex.weight + ex.increment_kg, 2)

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
