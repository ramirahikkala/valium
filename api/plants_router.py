"""Plants module: locations and plant catalogue CRUD endpoints."""

import io
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from PIL import Image, ImageOps
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_session
from models import Plant, PlantCollectionShare, PlantImage, PlantLocation, User
from schemas import (
    PlantCollectionShareCreate,
    PlantCollectionShareResponse,
    PlantCreate,
    PlantImageCaptionUpdate,
    PlantImageResponse,
    PlantLocationCreate,
    PlantLocationResponse,
    PlantLocationUpdate,
    PlantResponse,
    PlantUpdate,
    SharedCollectionInfo,
)

router = APIRouter(prefix="/plants", tags=["plants"])

UPLOAD_DIR = Path("/app/plant_images")


def _plant_response(plant: Plant) -> PlantResponse:
    """Build a PlantResponse with location_name and image info resolved."""
    imgs = sorted(plant.images, key=lambda i: (i.sort_order, i.created_at))
    primary = f"/api/plant-images/{imgs[0].filename}" if imgs else None
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
        own_seeds=plant.own_seeds,
        ai_summary=plant.ai_summary,
        created_at=plant.created_at,
        images=[PlantImageResponse.model_validate(i) for i in imgs],
        primary_image_url=primary,
    )


async def _load_plant(
    session: AsyncSession,
    plant_id: int,
    user: User,
    require_write: bool = False,
) -> tuple[Plant, str]:
    """Load a plant and verify access. Returns (plant, permission) where permission is 'owner'|'read'|'write'."""
    result = await session.execute(
        select(Plant)
        .options(selectinload(Plant.location), selectinload(Plant.images))
        .where(Plant.id == plant_id)
    )
    plant = result.scalar_one_or_none()
    if plant is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    if plant.user_id == user.id:
        return plant, "owner"
    # Check collection share
    share_result = await session.execute(
        select(PlantCollectionShare).where(
            PlantCollectionShare.owner_user_id == plant.user_id,
            PlantCollectionShare.shared_with_user_id == user.id,
        )
    )
    share = share_result.scalar_one_or_none()
    if share is None:
        raise HTTPException(status_code=404, detail="Plant not found")
    if require_write and share.permission != "write":
        raise HTTPException(status_code=403, detail="Write permission required")
    return plant, share.permission


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


# ---------- Plant collection shares ----------


@router.get("/collection/shares", response_model=list[PlantCollectionShareResponse])
async def get_collection_shares(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[PlantCollectionShareResponse]:
    """List all shares for the current user's plant collection."""
    result = await session.execute(
        select(PlantCollectionShare)
        .options(
            selectinload(PlantCollectionShare.shared_with),
            selectinload(PlantCollectionShare.owner),
        )
        .where(PlantCollectionShare.owner_user_id == current_user.id)
    )
    shares = result.scalars().all()
    return [
        PlantCollectionShareResponse(
            id=s.id,
            owner_user_id=s.owner_user_id,
            owner_name=s.owner.name,
            shared_with_user_id=s.shared_with_user_id,
            shared_with_name=s.shared_with.name,
            shared_with_email=s.shared_with.email,
            permission=s.permission,
        )
        for s in shares
    ]


@router.post("/collection/shares", response_model=PlantCollectionShareResponse, status_code=201)
async def create_collection_share(
    body: PlantCollectionShareCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantCollectionShareResponse:
    """Share the current user's plant collection with another user."""
    target_result = await session.execute(select(User).where(User.email == body.email))
    target = target_result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot share with yourself")

    existing = await session.execute(
        select(PlantCollectionShare).where(
            PlantCollectionShare.owner_user_id == current_user.id,
            PlantCollectionShare.shared_with_user_id == target.id,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Already shared with this user")

    share = PlantCollectionShare(
        owner_user_id=current_user.id,
        shared_with_user_id=target.id,
        permission=body.permission,
    )
    session.add(share)
    await session.commit()
    await session.refresh(share)
    return PlantCollectionShareResponse(
        id=share.id,
        owner_user_id=current_user.id,
        owner_name=current_user.name,
        shared_with_user_id=target.id,
        shared_with_name=target.name,
        shared_with_email=target.email,
        permission=share.permission,
    )


@router.delete("/collection/shares/{share_id}", status_code=204)
async def delete_collection_share(
    share_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Remove a plant collection share."""
    share = await session.get(PlantCollectionShare, share_id)
    if share is None or share.owner_user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Share not found")
    await session.delete(share)
    await session.commit()


@router.post("/collection/transfer", status_code=204)
async def transfer_collection_ownership(
    body: PlantCollectionShareCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Transfer all plants, locations and images to another user."""
    target_result = await session.execute(select(User).where(User.email == body.email))
    target = target_result.scalar_one_or_none()
    if target is None:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot transfer to yourself")

    # Move plants, locations and images to new owner
    await session.execute(update(Plant).where(Plant.user_id == current_user.id).values(user_id=target.id))
    await session.execute(update(PlantLocation).where(PlantLocation.user_id == current_user.id).values(user_id=target.id))
    await session.execute(update(PlantImage).where(PlantImage.user_id == current_user.id).values(user_id=target.id))

    # Remove any share between the two users (both directions)
    shares_to_delete = (await session.execute(
        select(PlantCollectionShare).where(
            ((PlantCollectionShare.owner_user_id == current_user.id) & (PlantCollectionShare.shared_with_user_id == target.id)) |
            ((PlantCollectionShare.owner_user_id == target.id) & (PlantCollectionShare.shared_with_user_id == current_user.id))
        )
    )).scalars().all()
    for s in shares_to_delete:
        await session.delete(s)

    await session.commit()


@router.get("/shared-with-me", response_model=list[SharedCollectionInfo])
async def get_shared_with_me(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[SharedCollectionInfo]:
    """Get all plant collections shared with the current user."""
    result = await session.execute(
        select(PlantCollectionShare)
        .options(selectinload(PlantCollectionShare.owner))
        .where(PlantCollectionShare.shared_with_user_id == current_user.id)
    )
    shares = result.scalars().all()
    return [
        SharedCollectionInfo(
            owner_user_id=s.owner_user_id,
            owner_name=s.owner.name,
            permission=s.permission,
        )
        for s in shares
    ]


# ---------- Plants ----------


@router.get("", response_model=list[PlantResponse])
async def list_plants(
    status: str | None = Query(None),
    category: str | None = Query(None),
    location_id: int | None = Query(None),
    search: str | None = Query(None),
    owner_id: int | None = Query(None),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[PlantResponse]:
    """List plants for the current user (or a shared collection) with optional filters."""
    if owner_id and owner_id != current_user.id:
        share_result = await session.execute(
            select(PlantCollectionShare).where(
                PlantCollectionShare.owner_user_id == owner_id,
                PlantCollectionShare.shared_with_user_id == current_user.id,
            )
        )
        if share_result.scalar_one_or_none() is None:
            raise HTTPException(status_code=404, detail="Shared collection not found")
        target_user_id = owner_id
    else:
        target_user_id = current_user.id

    stmt = (
        select(Plant)
        .options(selectinload(Plant.location), selectinload(Plant.images))
        .where(Plant.user_id == target_user_id)
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
    plant, _ = await _load_plant(session, plant.id, current_user)
    return _plant_response(plant)


@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Get a single plant by ID."""
    plant, _ = await _load_plant(session, plant_id, current_user)
    return _plant_response(plant)


@router.put("/{plant_id}", response_model=PlantResponse)
async def update_plant(
    plant_id: int,
    body: PlantUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Update a plant."""
    plant, _ = await _load_plant(session, plant_id, current_user, require_write=True)
    update_data = body.model_dump(exclude_unset=True)
    if "location_id" in update_data and update_data["location_id"] is not None:
        loc = await session.get(PlantLocation, update_data["location_id"])
        if loc is None or loc.user_id != plant.user_id:
            raise HTTPException(status_code=400, detail="Invalid location_id")
    for field, value in update_data.items():
        setattr(plant, field, value)
    await session.commit()
    plant, _ = await _load_plant(session, plant_id, current_user)
    return _plant_response(plant)


@router.delete("/{plant_id}", status_code=204)
async def delete_plant(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a plant."""
    plant, permission = await _load_plant(session, plant_id, current_user)
    if permission != "owner":
        raise HTTPException(status_code=403, detail="Only the owner can delete a plant")
    await session.delete(plant)
    await session.commit()


# ---------- Plant images ----------


@router.post("/{plant_id}/images", response_model=PlantImageResponse, status_code=201)
async def upload_plant_image(
    plant_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantImageResponse:
    """Upload a photo for a plant."""
    plant, _ = await _load_plant(session, plant_id, current_user, require_write=True)

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    data = await file.read()
    img = Image.open(io.BytesIO(data))
    img = ImageOps.exif_transpose(img)

    if img.width > 1600:
        ratio = 1600 / img.width
        img = img.resize((1600, int(img.height * ratio)), Image.LANCZOS)

    if img.mode != "RGB":
        img = img.convert("RGB")

    sort_order = len(plant.images)
    filename = f"{plant_id}/{uuid4().hex}.jpg"
    dest = UPLOAD_DIR / str(plant_id)
    dest.mkdir(parents=True, exist_ok=True)
    img.save(dest / Path(filename).name, format="JPEG", quality=85)

    image = PlantImage(
        plant_id=plant_id,
        user_id=current_user.id,
        filename=filename,
        sort_order=sort_order,
    )
    session.add(image)
    await session.commit()
    await session.refresh(image)
    return PlantImageResponse.model_validate(image)


@router.put("/{plant_id}/images/{image_id}", response_model=PlantImageResponse)
async def update_plant_image(
    plant_id: int,
    image_id: int,
    body: PlantImageCaptionUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantImageResponse:
    """Update a plant image caption."""
    await _load_plant(session, plant_id, current_user, require_write=True)
    image = await session.get(PlantImage, image_id)
    if image is None or image.plant_id != plant_id:
        raise HTTPException(status_code=404, detail="Image not found")
    image.caption = body.caption
    await session.commit()
    await session.refresh(image)
    return PlantImageResponse.model_validate(image)


@router.delete("/{plant_id}/images/{image_id}", status_code=204)
async def delete_plant_image(
    plant_id: int,
    image_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a plant image and remove the file from disk."""
    await _load_plant(session, plant_id, current_user, require_write=True)
    image = await session.get(PlantImage, image_id)
    if image is None or image.plant_id != plant_id:
        raise HTTPException(status_code=404, detail="Image not found")
    file_path = UPLOAD_DIR / image.filename
    file_path.unlink(missing_ok=True)
    await session.delete(image)
    await session.commit()


@router.post("/{plant_id}/images/{image_id}/set-primary", response_model=PlantImageResponse)
async def set_primary_image(
    plant_id: int,
    image_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantImageResponse:
    """Set an image as the primary (first) image for a plant."""
    plant, _ = await _load_plant(session, plant_id, current_user, require_write=True)
    target = next((i for i in plant.images if i.id == image_id), None)
    if target is None:
        raise HTTPException(status_code=404, detail="Image not found")

    # Re-assign sort_order: target gets 0, others get their index + 1
    others = sorted(
        [i for i in plant.images if i.id != image_id],
        key=lambda i: (i.sort_order, i.created_at),
    )
    target.sort_order = 0
    for idx, img in enumerate(others):
        img.sort_order = idx + 1
    await session.commit()
    await session.refresh(target)
    return PlantImageResponse.model_validate(target)
