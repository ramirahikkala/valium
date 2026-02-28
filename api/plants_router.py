"""Plants module: locations and plant catalogue CRUD endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_session
from models import Plant, PlantLocation, User
from schemas import (
    PlantCreate,
    PlantLocationCreate,
    PlantLocationResponse,
    PlantLocationUpdate,
    PlantResponse,
    PlantUpdate,
)

router = APIRouter(prefix="/plants", tags=["plants"])


def _plant_response(plant: Plant) -> PlantResponse:
    """Build a PlantResponse with location_name resolved."""
    return PlantResponse(
        id=plant.id,
        latin_name=plant.latin_name,
        common_name=plant.common_name,
        cultivar=plant.cultivar,
        year_acquired=plant.year_acquired,
        source=plant.source,
        location_id=plant.location_id,
        location_name=plant.location.name if plant.location else None,
        category=plant.category,
        status=plant.status,
        lost_year=plant.lost_year,
        notes=plant.notes,
        created_at=plant.created_at,
    )


async def _load_plant(session: AsyncSession, plant_id: int, user: User) -> Plant:
    """Load a plant and verify ownership. Raises 404 if not found/owned."""
    result = await session.execute(
        select(Plant)
        .options(selectinload(Plant.location))
        .where(Plant.id == plant_id, Plant.user_id == user.id)
    )
    plant = result.scalar_one_or_none()
    if plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant


# ---------- Locations ----------


@router.get("/locations", response_model=list[PlantLocationResponse])
async def list_locations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[PlantLocation]:
    """List all plant locations for the current user."""
    result = await session.execute(
        select(PlantLocation)
        .where(PlantLocation.user_id == current_user.id)
        .order_by(PlantLocation.name)
    )
    return list(result.scalars().all())


@router.post("/locations", response_model=PlantLocationResponse, status_code=201)
async def create_location(
    body: PlantLocationCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantLocation:
    """Create a new plant location."""
    loc = PlantLocation(user_id=current_user.id, name=body.name.strip())
    session.add(loc)
    await session.commit()
    await session.refresh(loc)
    return loc


@router.put("/locations/{location_id}", response_model=PlantLocationResponse)
async def update_location(
    location_id: int,
    body: PlantLocationUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantLocation:
    """Rename a plant location."""
    loc = await session.get(PlantLocation, location_id)
    if loc is None or loc.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Location not found")
    loc.name = body.name.strip()
    await session.commit()
    await session.refresh(loc)
    return loc


@router.delete("/locations/{location_id}", status_code=204)
async def delete_location(
    location_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a plant location. Plants in this location will have location_id set to null."""
    loc = await session.get(PlantLocation, location_id)
    if loc is None or loc.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Location not found")
    await session.delete(loc)
    await session.commit()


# ---------- Plants ----------


@router.get("", response_model=list[PlantResponse])
async def list_plants(
    status: str | None = Query(None),
    category: str | None = Query(None),
    location_id: int | None = Query(None),
    search: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[PlantResponse]:
    """List plants for the current user with optional filters."""
    stmt = (
        select(Plant)
        .options(selectinload(Plant.location))
        .where(Plant.user_id == current_user.id)
        .order_by(Plant.latin_name)
    )
    if status:
        stmt = stmt.where(Plant.status == status)
    if category:
        stmt = stmt.where(Plant.category == category)
    if location_id is not None:
        stmt = stmt.where(Plant.location_id == location_id)
    if search:
        like = f"%{search}%"
        from sqlalchemy import or_
        stmt = stmt.where(
            or_(
                Plant.latin_name.ilike(like),
                Plant.common_name.ilike(like),
                Plant.cultivar.ilike(like),
            )
        )
    result = await session.execute(stmt)
    return [_plant_response(p) for p in result.scalars().all()]


@router.post("", response_model=PlantResponse, status_code=201)
async def create_plant(
    body: PlantCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Create a new plant."""
    if body.location_id is not None:
        loc = await session.get(PlantLocation, body.location_id)
        if loc is None or loc.user_id != current_user.id:
            raise HTTPException(status_code=400, detail="Invalid location_id")
    plant = Plant(user_id=current_user.id, **body.model_dump())
    session.add(plant)
    await session.commit()
    await session.execute(
        select(Plant)
        .options(selectinload(Plant.location))
        .where(Plant.id == plant.id)
    )
    plant = await _load_plant(session, plant.id, current_user)
    return _plant_response(plant)


@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Get a single plant by ID."""
    plant = await _load_plant(session, plant_id, current_user)
    return _plant_response(plant)


@router.put("/{plant_id}", response_model=PlantResponse)
async def update_plant(
    plant_id: int,
    body: PlantUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Update a plant."""
    plant = await _load_plant(session, plant_id, current_user)
    update_data = body.model_dump(exclude_unset=True)
    if "location_id" in update_data and update_data["location_id"] is not None:
        loc = await session.get(PlantLocation, update_data["location_id"])
        if loc is None or loc.user_id != current_user.id:
            raise HTTPException(status_code=400, detail="Invalid location_id")
    for field, value in update_data.items():
        setattr(plant, field, value)
    await session.commit()
    plant = await _load_plant(session, plant_id, current_user)
    return _plant_response(plant)


@router.delete("/{plant_id}", status_code=204)
async def delete_plant(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a plant."""
    plant = await _load_plant(session, plant_id, current_user)
    await session.delete(plant)
    await session.commit()
