"""AI endpoints: provider CRUD (admin-only) and plant AI features."""

import asyncio
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
        '"notes": "..."}. '
        "common_name must be in Finnish. notes must be in Finnish. "
        "latin_name must be the correct scientific Latin name."
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
async def fetch_plant_image(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Search iNaturalist, Wikimedia Commons, and GBIF for a plant image."""
    plant = await _load_plant(session, plant_id, current_user)

    # Search multiple sources (sync calls wrapped in thread)
    result = await asyncio.to_thread(_find_plant_image, plant.latin_name)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="No image found on iNaturalist, Wikimedia Commons, or GBIF",
        )

    image_url, source_url = result

    # Download image
    try:
        img_resp = req.get(image_url, timeout=20, headers={"User-Agent": "Valium-plant-app/1.0"})
        img_resp.raise_for_status()
        img_data = img_resp.content
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Image download failed: {e}")

    # Process image
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

    # Save to disk
    sort_order = len(plant.images)
    filename = f"{plant_id}/{uuid4().hex}.jpg"
    dest = UPLOAD_DIR / str(plant_id)
    dest.mkdir(parents=True, exist_ok=True)
    img.save(dest / Path(filename).name, format="JPEG", quality=85)

    # Create DB record with source attribution
    image = PlantImage(
        plant_id=plant_id,
        user_id=current_user.id,
        filename=filename,
        sort_order=sort_order,
        source_url=source_url,
    )
    session.add(image)
    await session.commit()

    plant = await _load_plant(session, plant_id, current_user)
    return _plant_response(plant)


def _find_plant_image(latin_name: str) -> tuple[str, str] | None:
    """Try iNaturalist → Wikimedia Commons → GBIF. Returns (image_url, source_page_url)."""
    return (
        _try_inaturalist(latin_name)
        or _try_wikimedia_commons(latin_name)
        or _try_gbif(latin_name)
    )


def _try_inaturalist(latin_name: str) -> tuple[str, str] | None:
    """Search iNaturalist taxa API for a plant photo."""
    try:
        resp = req.get(
            "https://api.inaturalist.org/v1/taxa",
            params={
                "q": latin_name,
                "photos": "true",
                "per_page": "5",
                "rank": "species,subspecies,variety,form",
            },
            timeout=15,
            headers={"User-Agent": "Valium-plant-app/1.0"},
        )
        resp.raise_for_status()
        for taxon in resp.json().get("results", []):
            photo = taxon.get("default_photo")
            if not photo:
                continue
            url = photo.get("medium_url") or photo.get("square_url")
            if not url:
                continue
            # Upgrade to large
            url = url.replace("/square.", "/large.").replace("/medium.", "/large.")
            taxon_id = taxon.get("id")
            source = f"https://www.inaturalist.org/taxa/{taxon_id}" if taxon_id else "https://www.inaturalist.org"
            return url, source
    except Exception:
        pass
    return None


def _try_wikimedia_commons(latin_name: str) -> tuple[str, str] | None:
    """Search Wikimedia Commons file namespace for a plant photo."""
    try:
        search_resp = req.get(
            "https://commons.wikimedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srnamespace": "6",
                "srsearch": latin_name,
                "srlimit": "5",
                "format": "json",
            },
            timeout=15,
            headers={"User-Agent": "Valium-plant-app/1.0"},
        )
        search_resp.raise_for_status()
        results = search_resp.json().get("query", {}).get("search", [])
        for result in results:
            file_title = result["title"]
            try:
                info_resp = req.get(
                    "https://commons.wikimedia.org/w/api.php",
                    params={
                        "action": "query",
                        "titles": file_title,
                        "prop": "imageinfo",
                        "iiprop": "url|mediatype",
                        "iiurlwidth": "1600",
                        "format": "json",
                    },
                    timeout=15,
                    headers={"User-Agent": "Valium-plant-app/1.0"},
                )
                info_resp.raise_for_status()
                pages = info_resp.json().get("query", {}).get("pages", {})
                page = next(iter(pages.values()))
                info = page.get("imageinfo", [{}])[0]
                if info.get("mediatype") in ("BITMAP", "DRAWING"):
                    image_url = info.get("thumburl") or info.get("url")
                    if image_url:
                        page_url = "https://commons.wikimedia.org/wiki/" + file_title.replace(" ", "_")
                        return image_url, page_url
            except Exception:
                continue
    except Exception:
        pass
    return None


def _try_gbif(latin_name: str) -> tuple[str, str] | None:
    """Search GBIF occurrences for a plant photo."""
    try:
        match_resp = req.get(
            "https://api.gbif.org/v1/species/match",
            params={"name": latin_name, "verbose": "false"},
            timeout=15,
            headers={"User-Agent": "Valium-plant-app/1.0"},
        )
        match_resp.raise_for_status()
        match_data = match_resp.json()
        taxon_key = match_data.get("usageKey") or match_data.get("speciesKey")
        if not taxon_key:
            return None
        occ_resp = req.get(
            "https://api.gbif.org/v1/occurrence/search",
            params={"taxonKey": taxon_key, "mediaType": "StillImage", "limit": "5"},
            timeout=15,
            headers={"User-Agent": "Valium-plant-app/1.0"},
        )
        occ_resp.raise_for_status()
        for occ in occ_resp.json().get("results", []):
            for m in occ.get("media", []):
                if m.get("type") == "StillImage" and m.get("identifier"):
                    occ_key = occ.get("key")
                    source = f"https://www.gbif.org/occurrence/{occ_key}" if occ_key else "https://www.gbif.org"
                    return m["identifier"], source
    except Exception:
        pass
    return None
