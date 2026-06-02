"""AI endpoints: provider CRUD (admin-only) and plant AI features."""

import asyncio
import io
import json
import logging
from pathlib import Path
from uuid import uuid4

logger = logging.getLogger(__name__)

import requests as req
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from PIL import Image, ImageOps
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from admin_router import require_admin
from ai_client import AIError, ai_complete, ai_complete_with_image
from auth import get_current_user
from database import get_session
from models import AIProvider, Plant, PlantImage, User
from plants_router import UPLOAD_DIR, _load_plant, _plant_response
from schemas import (
    AIProviderCreate,
    AIProviderResponse,
    AIProviderUpdate,
    PlantFillNameResponse,
    PlantGrowingGuideFillResponse,
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
        '"category": "perennial|annual|shrub|tree|houseplant|vegetable|herb|bulb|other"}. '
        "common_name must be in Finnish. "
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


@router.post("/plants/read-label", response_model=PlantFillNameResponse)
async def read_plant_label(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantFillNameResponse:
    """Read a plant name tag photo and return structured field suggestions."""
    data = await image.read()
    mime = image.content_type or "image/jpeg"
    if mime not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
        raise HTTPException(status_code=400, detail="Unsupported image type")

    prompt = (
        "This is a photo of a plant name tag or label. "
        "Read all text and classify each part using these rules:\n"
        "- latin_name: binomial scientific name in Genus species format (Latin, italicized on tags). "
        "  Never a Finnish word.\n"
        "- common_name: the plain plant name in Finnish or another vernacular language.\n"
        "- cultivar: a variety/color/form descriptor — typically in parentheses like '(valkoinen)', "
        "  in single quotes like 'Alba', or appended after the main name. "
        "  Strip the parentheses and keep only the descriptor text.\n"
        "- category: infer from plant type: perennial|annual|shrub|tree|houseplant|vegetable|herb|bulb|other\n"
        "Return ONLY valid JSON: "
        '{"latin_name": "...", "common_name": "...", "cultivar": "...", "category": "..."}. '
        "Use null for fields not present on the tag. Do not infer or guess — just read what is written."
    )
    try:
        raw = await ai_complete_with_image(session, data, mime, prompt)
    except AIError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI call failed: {e}")

    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        data_json = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")

    label_texts = [v for v in data_json.values() if isinstance(v, str)]
    logger.info("read-label step 1 (OCR): %s", data_json)

    # Look up verified names from iNaturalist/GBIF
    query = data_json.get("latin_name") or data_json.get("common_name")
    lookup = await asyncio.to_thread(_lookup_plant_names, query) if query else None
    logger.info("read-label step 2 (lookup query=%r): %s", query, lookup)

    # Second AI call: classify all available information into the correct fields
    classify_prompt = _build_classify_prompt(label_texts, lookup)
    logger.info("read-label step 3 classify prompt: %s", classify_prompt)
    try:
        raw2 = await ai_complete(session, classify_prompt)
    except AIError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI classification failed: {e}")

    text2 = raw2.strip()
    if text2.startswith("```"):
        lines = text2.splitlines()
        text2 = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        result = json.loads(text2)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")

    logger.info("read-label step 4 (final): %s", result)

    return PlantFillNameResponse(
        latin_name=result.get("latin_name"),
        common_name=result.get("common_name"),
        cultivar=result.get("cultivar"),
        category=result.get("category"),
    )


def _build_classify_prompt(label_texts: list[str], lookup: dict | None) -> str:
    """Build a prompt that asks AI to classify label texts + lookup data into correct fields."""
    parts = [
        "You are classifying plant name data into structured fields.",
        f"Text found on the plant label: {label_texts}",
    ]
    if lookup:
        verified = []
        if lookup.get("latin_name"):
            verified.append(f"scientific name: '{lookup['latin_name']}'")
        if lookup.get("common_name"):
            verified.append(f"Finnish name: '{lookup['common_name']}'")
        if verified:
            parts.append(f"Verified taxonomy data from iNaturalist/GBIF: {', '.join(verified)}")

    parts += [
        "Using all of the above, assign each piece of text to the correct field.",
        "Rules:",
        "- latin_name: binomial scientific name (Genus species). Prefer verified taxonomy data.",
        "- common_name: Finnish vernacular name. "
        "If the label contains a Finnish word for the plant, use that — it is authoritative. "
        "Use verified taxonomy data only if no Finnish name is on the label. "
        "Reject any verified name that is clearly not Finnish (e.g. Dutch, German, English).",
        "- cultivar: any name on the label that is neither the scientific name nor the Finnish name "
        "(e.g. English proper names like 'Melton Pastels', color descriptors, variety names).",
        "- category: perennial|annual|shrub|tree|houseplant|vegetable|herb|bulb|other",
        "Return ONLY valid JSON: "
        '{"latin_name": "...", "common_name": "...", "cultivar": "...", "category": "..."}. '
        "Use null for fields that cannot be determined.",
    ]
    return "\n".join(parts)


def _lookup_plant_names(query: str) -> dict | None:
    """Look up verified latin + Finnish name. Tries multiple strategies for typo tolerance."""
    queries = _search_candidates(query)
    for q in queries:
        result = _lookup_inaturalist(q) or _lookup_gbif_names(q)
        if result:
            return result
    return None


def _search_candidates(query: str) -> list[str]:
    """Return a list of search queries to try, from most to least specific."""
    query = query.strip()
    candidates = [query]
    words = query.split()
    # If multi-word query, also try just the first word (genus or first word of Finnish name)
    if len(words) > 1:
        candidates.append(words[0])
    return candidates


def _lookup_inaturalist(query: str) -> dict | None:
    """Search iNaturalist taxa with Finnish locale. Returns {latin_name, common_name} or None."""
    try:
        resp = req.get(
            "https://api.inaturalist.org/v1/taxa",
            params={
                "q": query,
                "locale": "fi",
                "preferred_place_id": 7506,  # Finland
                "rank": "species,subspecies,variety,form",
                "per_page": 3,
            },
            timeout=10,
            headers={"User-Agent": "Valium-plant-app/1.0"},
        )
        resp.raise_for_status()
        for taxon in resp.json().get("results", []):
            latin = taxon.get("name")
            finnish = taxon.get("preferred_common_name")
            if latin:
                return {"latin_name": latin, "common_name": finnish}
    except Exception:
        pass
    return None


def _lookup_gbif_names(query: str) -> dict | None:
    """Search GBIF species match (fuzzy) + vernacular names. Returns {latin_name, common_name} or None."""
    try:
        match = req.get(
            "https://api.gbif.org/v1/species/match",
            params={"name": query, "kingdom": "Plantae", "verbose": "false"},
            timeout=10,
            headers={"User-Agent": "Valium-plant-app/1.0"},
        )
        match.raise_for_status()
        data = match.json()
        # Accept EXACT, FUZZY, HIGHERRANK matches but not NONE
        if data.get("matchType") == "NONE":
            return None
        latin = data.get("canonicalName") or data.get("scientificName")
        usage_key = data.get("usageKey")
        if not latin or not usage_key:
            return None
        # Fetch Finnish vernacular name
        vern = req.get(
            f"https://api.gbif.org/v1/species/{usage_key}/vernacularNames",
            params={"limit": 50},
            timeout=10,
            headers={"User-Agent": "Valium-plant-app/1.0"},
        )
        vern.raise_for_status()
        finnish = next(
            (v["vernacularName"] for v in vern.json().get("results", []) if v.get("language") == "fin"),
            None,
        )
        return {"latin_name": latin, "common_name": finnish}
    except Exception:
        pass
    return None


@router.post("/plants/fill-guide", response_model=PlantGrowingGuideFillResponse)
async def fill_plant_guide(
    query: str = Query(..., description="Plant name (Finnish or scientific) to generate guide for"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantGrowingGuideFillResponse:
    """Generate a Finnish growing guide for a plant by name."""
    prompt = (
        f"Tunnista kasvi nimeltä '{query}' ja kirjoita sille yksityiskohtainen kasvatusohje suomeksi. "
        "Palauta VAIN kelvollinen JSON seuraavilla avaimilla: "
        '{"plant_name": "suomenkielinen nimi", "latin_name": "tieteellinen nimi", '
        '"guide_text": "yksityiskohtainen kasvatusohje suomeksi, sisältäen idätyksen, '
        'kasvuolosuhteet, kastelun, lannoituksen, sadonkorjuun tai hoidon"}. '
        "plant_name tulee olla suomeksi. latin_name tulee olla oikea tieteellinen nimi. "
        "guide_text tulee olla suomenkielinen, kattava kasvatusohje."
    )
    try:
        raw = await ai_complete(session, prompt)
    except AIError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI call failed: {e}")

    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned invalid JSON")

    return PlantGrowingGuideFillResponse(
        plant_name=data.get("plant_name", ""),
        latin_name=data.get("latin_name", ""),
        guide_text=data.get("guide_text", ""),
    )


@router.post("/plants/{plant_id}/summary", response_model=PlantResponse)
async def generate_plant_summary(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Generate and save a Finnish AI summary for a plant."""
    plant, _ = await _load_plant(session, plant_id, current_user)
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
    plant, _ = await _load_plant(session, plant_id, current_user)
    return _plant_response(plant)


@router.post("/plants/{plant_id}/fetch-image", response_model=PlantResponse)
async def fetch_plant_image(
    plant_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> PlantResponse:
    """Search iNaturalist, Wikimedia Commons, and GBIF for a plant image."""
    plant, _ = await _load_plant(session, plant_id, current_user)

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

    plant, _ = await _load_plant(session, plant_id, current_user)
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
