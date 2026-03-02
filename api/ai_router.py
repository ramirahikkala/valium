"""AI endpoints: provider CRUD (admin-only) and plant AI features."""

import io
import json
from pathlib import Path
from uuid import uuid4

import requests as req
from fastapi import APIRouter, Depends, HTTPException, Query
from PIL import Image, ImageOps
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from admin_router import require_admin
from ai_client import AIError, ai_complete
from auth import get_current_user
from database import get_session
from models import AIProvider, Plant, PlantImage, User
from plants_router import UPLOAD_DIR, _load_plant, _plant_response
from schemas import (
    AIProviderCreate,
    AIProviderResponse,
    AIProviderUpdate,
    PlantFillNameResponse,
    PlantResponse,
)

router = APIRouter(prefix="/ai", tags=["ai"])


# ---------- Provider CRUD (admin-only) ----------


@router.get("/providers", response_model=list[AIProviderResponse])
async def list_providers(
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> list[AIProvider]:
    """List all configured AI providers. Admin-only."""
    result = await session.execute(select(AIProvider).order_by(AIProvider.id))
    return list(result.scalars().all())


@router.post("/providers", response_model=AIProviderResponse, status_code=201)
async def create_provider(
    body: AIProviderCreate,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> AIProvider:
    """Add a new AI provider. Admin-only."""
    p = AIProvider(**body.model_dump())
    session.add(p)
    await session.commit()
    await session.refresh(p)
    return p


@router.put("/providers/{provider_id}", response_model=AIProviderResponse)
async def update_provider(
    provider_id: int,
    body: AIProviderUpdate,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> AIProvider:
    """Update an AI provider. Admin-only."""
    p = await session.get(AIProvider, provider_id)
    if p is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    await session.commit()
    await session.refresh(p)
    return p


@router.delete("/providers/{provider_id}", status_code=204)
async def delete_provider(
    provider_id: int,
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete an AI provider. Admin-only."""
    p = await session.get(AIProvider, provider_id)
    if p is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    await session.delete(p)
    await session.commit()


# ---------- Plant AI endpoints ----------


@router.post("/plants/fill-name", response_model=PlantFillNameResponse)
async def fill_plant_name(
    query: str = Query(..., description="Plant name to identify"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantFillNameResponse:
    """Identify a plant by name and return structured field suggestions."""
    prompt = (
        f"Identify the plant '{query}'. "
        "Return ONLY valid JSON with these keys: "
        '{"latin_name": "...", "common_name": "...", '
        '"category": "perennial|annual|shrub|tree|houseplant|vegetable|herb|bulb|other", '
        '"notes": "..."}'
    )
    try:
        raw = await ai_complete(session, prompt)
    except AIError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI call failed: {e}")

    # Strip markdown code fences if present
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")

    return PlantFillNameResponse(
        latin_name=data.get("latin_name"),
        common_name=data.get("common_name"),
        category=data.get("category"),
        notes=data.get("notes"),
    )


@router.post("/plants/{plant_id}/summary", response_model=PlantResponse)
async def generate_plant_summary(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Generate and save a Finnish AI summary for a plant."""
    plant = await _load_plant(session, plant_id, current_user)
    prompt = (
        f"Write a short informative summary in Finnish about {plant.latin_name}. "
        "Include characteristics, care tips, origin. Max 150 words."
    )
    try:
        summary = await ai_complete(session, prompt)
    except AIError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI call failed: {e}")

    plant.ai_summary = summary.strip()
    await session.commit()
    plant = await _load_plant(session, plant_id, current_user)
    return _plant_response(plant)


@router.post("/plants/{plant_id}/fetch-image", response_model=PlantResponse)
async def fetch_wikipedia_image(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Fetch a plant image from Wikipedia via Claude and save it."""
    plant = await _load_plant(session, plant_id, current_user)

    # Step 1: Ask Claude for the Wikipedia article title
    title_prompt = (
        f"What is the exact English Wikipedia article title for the plant '{plant.latin_name}'? "
        "Reply with ONLY the title, nothing else."
    )
    try:
        wiki_title = (await ai_complete(session, title_prompt)).strip()
    except AIError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI call failed: {e}")

    # Remove surrounding quotes if the model added them
    wiki_title = wiki_title.strip('"').strip("'")

    # Step 2: Fetch Wikipedia summary JSON
    try:
        wiki_resp = req.get(
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{req.utils.quote(wiki_title)}",
            timeout=15,
            headers={"User-Agent": "Valium-plant-app/1.0"},
        )
        wiki_resp.raise_for_status()
        wiki_data = wiki_resp.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Wikipedia fetch failed: {e}")

    # Step 3: Pick image URL
    image_url = None
    if "originalimage" in wiki_data:
        image_url = wiki_data["originalimage"]["source"]
    elif "thumbnail" in wiki_data:
        image_url = wiki_data["thumbnail"]["source"]

    if not image_url:
        raise HTTPException(status_code=404, detail="No image found on Wikipedia for this plant")

    # Step 4: Download image
    try:
        img_resp = req.get(image_url, timeout=20, headers={"User-Agent": "Valium-plant-app/1.0"})
        img_resp.raise_for_status()
        img_data = img_resp.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Image download failed: {e}")

    # Step 5: Process image (same pipeline as upload endpoint)
    try:
        img = Image.open(io.BytesIO(img_data))
        img = ImageOps.exif_transpose(img)
        if img.width > 1600:
            ratio = 1600 / img.width
            img = img.resize((1600, int(img.height * ratio)), Image.LANCZOS)
        if img.mode != "RGB":
            img = img.convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Image processing failed: {e}")

    # Step 6: Save to disk
    sort_order = len(plant.images)
    filename = f"{plant_id}/{uuid4().hex}.jpg"
    dest = UPLOAD_DIR / str(plant_id)
    dest.mkdir(parents=True, exist_ok=True)
    img.save(dest / Path(filename).name, format="JPEG", quality=85)

    # Step 7: Create DB record
    image = PlantImage(
        plant_id=plant_id,
        user_id=current_user.id,
        filename=filename,
        sort_order=sort_order,
    )
    session.add(image)
    await session.commit()

    plant = await _load_plant(session, plant_id, current_user)
    return _plant_response(plant)
