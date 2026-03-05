#!/usr/bin/env python3
"""Import Kasviluettelo.txt → Valium Plants API."""

import re
import sys
import time
import requests

API_BASE = "https://valium.ketunmetsa.fi/api"
API_KEY = "BfdQPubJnrmcwkddwkRtbnY-a65exgMtHXbSodxF7jA"
HDR = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
FILE = "/home/rami/Downloads/Kasviluettelo.txt"
DRY_RUN = "--dry" in sys.argv

# ── Locations ──────────────────────────────────────────────────────────────────

LOCATION_LIST = [
    "kantopuutarha", "metsäpuutarha", "hostapenkki", "Jarin hostapenkki",
    "pionipenkki", "takapihan pionipenkki", "kivikkopenkki", "alapiha",
    "eturinne", "paraatipenkki", "vuokkopenkki", "rhodopenkki", "sisääntulo",
    "takapiha", "iso kanto", "ikkunapenkki", "kantoaukio",
]

# Ordered longest-first so partial matches don't shadow shorter ones
LOC_PATTERNS = [
    ("jarin hostapenkki", "Jarin hostapenkki"),
    ("takapihan pionipenkki", "takapihan pionipenkki"),
    ("takapihan pionip", "takapihan pionipenkki"),
    ("tp. pionipenkki", "takapihan pionipenkki"),
    ("tp.pionipenkki", "takapihan pionipenkki"),
    ("takap. pionip", "takapihan pionipenkki"),
    ("tp pionipenkki", "takapihan pionipenkki"),
    ("kantopuutarha", "kantopuutarha"),
    ("metsäpuutarha", "metsäpuutarha"),
    ("hostapenkki", "hostapenkki"),
    ("pionipenkki", "pionipenkki"),
    ("kantoaukio", "kantoaukio"),
    ("ikkunapenkki", "ikkunapenkki"),
    ("kivikkopenkki", "kivikkopenkki"),
    ("eturinne", "eturinne"),
    ("paraatipenkki", "paraatipenkki"),
    ("vuokkopenkki", "vuokkopenkki"),
    ("rhodopenkki", "rhodopenkki"),
    ("sisääntulo", "sisääntulo"),
    ("iso kanto", "iso kanto"),
    ("takapiha", "takapiha"),
    ("alapiha", "alapiha"),
]

loc_ids: dict[str, int] = {}


def setup_locations():
    global loc_ids
    r = requests.get(f"{API_BASE}/plants/locations", headers=HDR)
    r.raise_for_status()
    loc_ids = {x["name"]: x["id"] for x in r.json()}
    for name in LOCATION_LIST:
        if name not in loc_ids:
            rr = requests.post(
                f"{API_BASE}/plants/locations", headers=HDR, json={"name": name}
            )
            rr.raise_for_status()
            loc_ids[name] = rr.json()["id"]
            print(f"  📍 Created location: {name}")


def find_location_id(text: str) -> int | None:
    t = text.lower()
    for kw, name in LOC_PATTERNS:
        if kw in t:
            return loc_ids.get(name)
    return None


def strip_location_words(text: str) -> str:
    """Remove location keywords from text."""
    for kw, _ in LOC_PATTERNS:
        text = re.sub(re.escape(kw), "", text, flags=re.IGNORECASE)
    return text


def extract_year(text: str) -> int | None:
    m = re.search(r"\b(20[012]\d)\b", text)
    return int(m.group(1)) if m else None


QUOTE_RE = re.compile(
    r"[\u2018\u2019\u201c\u201d'\u0060]"
    r"([^\u2018\u2019\u201c\u201d'\u0060\(\)]{1,80})"
    r"[\u2018\u2019\u201c\u201d']"
)


def extract_cultivar(text: str) -> str | None:
    m = QUOTE_RE.search(text)
    return m.group(1).strip() if m else None


def strip_cultivar(text: str) -> str:
    return QUOTE_RE.sub("", text)


def extract_parens(text: str) -> str:
    m = re.search(r"\(([^)]+)\)", text)
    return m.group(1) if m else ""


def strip_parens(text: str) -> str:
    return re.sub(r"\([^)]*\)", "", text)


def extract_source(parens: str) -> str | None:
    s = parens
    s = re.sub(r"\b20[012]\d\b", "", s)
    for kw, _ in LOC_PATTERNS:
        s = re.sub(re.escape(kw), "", s, flags=re.IGNORECASE)
    # Remove common Finnish words that aren't sources
    s = re.sub(r"\b(siemenkasvatus|Onko itänyt|itikö|sportti|ja)\b", "", s, flags=re.IGNORECASE)
    s = re.sub(r"[,;]\s*[,;]", ",", s)
    s = re.sub(r"^\s*[,;/]+|[,;/]+\s*$", "", s)
    s = re.sub(r"\s+", " ", s).strip(" ,;./")
    return s if len(s) > 1 else None


def looks_latin(s: str) -> bool:
    s = s.strip()
    if not s:
        return False
    words = s.split()
    if not words[0][0].isupper():
        return False
    if len(words) >= 2 and words[1][0].islower():
        return True
    if len(words) == 1:
        return True
    return False


def clean_common(s: str) -> str | None:
    """Remove source/location junk from a candidate common name."""
    s = strip_location_words(s)
    # Remove known source names and abbreviations
    sources = [
        "k-rauta", "k-äimärautio", "äimärautio", "äimäraution", "siirtolapuutarha",
        "sadzawka", "augis", "staudenfan", "de botterhutte", "mustilan", "arboretum",
        "särkän perennataimisto", "eurohosta", "eurobulb", "hankkija", "peters",
        "jarii", "jarih", "leenah", "paulak", "pirjo", "hannaV", "hanna v",
        "limingantullin prisma", "vakka-taimi", "jarin",
    ]
    for src in sources:
        s = re.sub(re.escape(src), "", s, flags=re.IGNORECASE)
    # Remove parenthetical leftovers and clean punctuation
    s = re.sub(r"\([^)]*\)", "", s)
    s = re.sub(r"[,;?!]+$", "", s)
    s = re.sub(r"^\s*[,;?!]+", "", s)
    s = re.sub(r"\s+", " ", s).strip(" ,;.?!")
    return s if len(s) > 1 else None


def parse_name(raw_line: str) -> tuple[str, str | None]:
    """Return (latin_name, common_name) from a raw plant line."""
    # Work on a version with cultivar and parens stripped
    no_cult = strip_cultivar(raw_line)
    no_parens = strip_parens(no_cult)

    # Also strip location keywords from name part
    no_loc = strip_location_words(no_parens)
    no_loc = re.sub(r"\s{2,}", " ", no_loc).strip(" ,;.")

    parts = [p.strip() for p in no_loc.split(",", 1)]
    first = parts[0].strip(" .,;?!")
    second = parts[1].strip(" .,;?!") if len(parts) > 1 else ""

    if not second:
        return first, None

    # Decide which side is Latin
    if looks_latin(first):
        common = clean_common(second)
        return first, common
    if looks_latin(second):
        common = clean_common(first)
        return second, common
    # Default: treat first as latin
    return first, clean_common(second)


def add_plant(data: dict) -> bool:
    if DRY_RUN:
        cv = f" '{data['cultivar']}'" if data.get("cultivar") else ""
        cm = f" / {data['common_name']}" if data.get("common_name") else ""
        st = f" [{data['status']}]" if data.get("status") != "active" else ""
        yr = f" ({data['year_acquired']})" if data.get("year_acquired") else ""
        loc = f" @{data['location_id']}" if data.get("location_id") else ""
        print(f"  {data['latin_name']}{cv}{cm}{yr}{loc}{st}")
        return True

    r = requests.post(f"{API_BASE}/plants", headers=HDR, json=data)
    if r.status_code in (200, 201):
        p = r.json()
        cv = f" '{p['cultivar']}'" if p.get("cultivar") else ""
        print(f"  ✓ {p['latin_name']}{cv}")
        time.sleep(0.06)
        return True
    else:
        print(f"  ✗ {data.get('latin_name')}: {r.status_code} {r.text[:120]}")
        return False


# ── Section state machine ──────────────────────────────────────────────────────

# Lines to skip outright
SKIP_PREFIXES = (
    "Kaariportti", "MPDE", "Mosaiikkivirusta", "Älä laita",
    "Hyötkasvit", "Lyhenteet", "Svetlana", "☆", "Tarhakurjenpolvi",
)
SKIP_EXACT = {
    "PUUTARHAN SYYSTYÖT", "OSTOSLISTA", "PERENNAT", "PUUVARTISET",
    "Clematis, kärhöt", "Hostat, kuunliljat", "Paeonia, pionit",
    "Muut perennat", "Muut perennat",
    "Syksyllä istutettavat sipulikukat",
    "Allium, laukat", "Crocus, krookukset", "Narcissus, narsissit",
    "Tulipa, tulppaanit", "Muut",
    "Menetetyt 2024", "Menetetyt 2025",
    "Lyhenteet", "Svetlana Polovnskaja SP", "☆Nimilaput tehty",
    "MPDE LPDE muovit käy kasviviljelyyn",
    "Hyötkasvit: Anemone treasures -tomaatti, aikainen",
    "Kasvit",
}


def should_skip(s: str) -> bool:
    if not s:
        return True
    if s in SKIP_EXACT:
        return True
    if any(s.startswith(p) for p in SKIP_PREFIXES):
        return True
    # All-caps short strings = section header
    if s == s.upper() and s.replace(" ", "").isalpha() and len(s) > 3:
        return True
    return False


def main():
    print("=== Valium Plant Importer ===")
    if DRY_RUN:
        print("DRY RUN — no writes to API\n")

    if not DRY_RUN:
        print("\n📍 Setting up locations...")
        setup_locations()
    else:
        # Populate with dummy ids for dry run display
        for i, name in enumerate(LOCATION_LIST, 1):
            loc_ids[name] = i

    with open(FILE, encoding="utf-8-sig") as f:  # utf-8-sig strips BOM
        lines = [line.rstrip("\n") for line in f]

    # Determine where to start (skip the "PUUTARHAN SYYSTYÖT" block before OSTOSLISTA)
    # We start from the wishlist * items in the "Kasvit" section and onwards
    start_idx = 0
    for idx, line in enumerate(lines):
        stripped = line.strip()
        # Find the first * item (wishlist)
        if stripped.startswith("*") and idx > 10:
            start_idx = idx
            break

    category = "perennial"
    status = "active"
    lost_year: int | None = None
    in_wishlist = True   # we start in the wishlist * block
    in_lost = False
    in_real_catalog = False  # becomes True after PERENNAT header

    total = 0
    errors = 0
    skipped = 0

    print(f"\n🌿 Importing plants (starting at line {start_idx + 1})...\n")

    for idx in range(start_idx, len(lines)):
        raw = lines[idx]
        stripped = raw.strip()

        # ── Section transitions ────────────────────────────────────────────
        if stripped == "PERENNAT":
            category = "perennial"
            status = "active"
            in_wishlist = False
            in_real_catalog = True
            in_lost = False
            continue
        if stripped in ("Clematis, kärhöt", "Hostat, kuunliljat", "Paeonia, pionit", "Muut perennat"):
            category = "perennial"
            continue
        if stripped == "Syksyllä istutettavat sipulikukat":
            category = "bulb"
            status = "active"
            in_wishlist = False
            in_lost = False
            continue
        if stripped in ("Allium, laukat", "Crocus, krookukset",
                        "Narcissus, narsissit", "Tulipa, tulppaanit", "Muut"):
            # Keep category=bulb
            continue
        if stripped == "PUUVARTISET":
            category = "shrub"
            status = "active"
            in_wishlist = False
            in_lost = False
            continue
        if stripped == "Menetetyt 2024":
            status = "lost"
            lost_year = 2024
            in_lost = True
            in_wishlist = False
            continue
        if stripped == "Menetetyt 2025":
            status = "lost"
            lost_year = 2025
            in_lost = True
            in_wishlist = False
            continue

        # Transition out of wishlist when we hit PERENNAT (handled above)
        # But if we're still in * block and hit a non-* non-empty line after some content,
        # stop wishlist mode
        if in_wishlist and not in_lost and stripped and not stripped.startswith("*"):
            # Still in wishlist section lines that aren't starred (section text)
            if should_skip(stripped):
                skipped += 1
                continue
            # Non-starred plant lines before PERENNAT = skip (notes section)
            skipped += 1
            continue

        if should_skip(stripped):
            skipped += 1
            continue

        # ── Plant line ─────────────────────────────────────────────────────
        is_wishlist_line = stripped.startswith("*") and not in_lost
        clean = stripped.lstrip("* ").strip()
        if not clean:
            skipped += 1
            continue

        line_status = "wishlist" if is_wishlist_line else status
        line_category = category
        line_lost_year = lost_year

        # Guess category for wishlist items
        if is_wishlist_line:
            low = clean.lower()
            if any(low.startswith(g) for g in ["clematis", "kärhö", "tiukukärhö", "tarha-alppikärhö"]):
                line_category = "perennial"
            elif any(low.startswith(g) for g in ["paeonia", "pioni", "kullero", "siperiankullero"]):
                line_category = "perennial"
            elif any(low.startswith(g) for g in ["origanum", "valkosipuliruoho"]):
                line_category = "herb"
            elif any(low.startswith(g) for g in ["picea", "kynäjalava", "vuorijalava", "jättipoppeli",
                                                   "siperian jasmike", "vadelma"]):
                line_category = "tree" if "jalava" in low or "poppeli" in low else "shrub"
            elif any(low.startswith(g) for g in ["narsissi", "daalia"]):
                line_category = "bulb"
            else:
                line_category = "perennial"

        parens = extract_parens(clean)
        cultivar = extract_cultivar(clean)
        year = extract_year(parens) if parens else None
        location_id = find_location_id(clean)
        source = extract_source(parens) if parens else None

        latin, common = parse_name(clean)

        # Clean up latin name
        latin = re.sub(r"\s{2,}", " ", latin).strip(" .,;?!")
        if not latin:
            skipped += 1
            continue

        # For woody plants, try to guess tree vs shrub
        if line_category == "shrub":
            trees = ["acer", "aesculus", "alnus", "malus", "prunus", "sorbus",
                     "taxus", "picea", "juniperus", "thuja", "syringa amurensis",
                     "kynäjalava", "vuorijalava", "jättipoppeli"]
            if any(latin.lower().startswith(t) for t in trees):
                line_category = "tree"

        plant = {
            "latin_name": latin,
            "common_name": common,
            "cultivar": cultivar,
            "year_acquired": year,
            "source": source[:250] if source else None,
            "location_id": location_id,
            "category": line_category,
            "status": line_status,
            "lost_year": line_lost_year,
            "notes": None,
        }

        if add_plant(plant):
            total += 1
        else:
            errors += 1

    print(f"\n{'✅' if not errors else '⚠️ '} Done.")
    print(f"  Imported : {total}")
    print(f"  Errors   : {errors}")
    print(f"  Skipped  : {skipped}")


if __name__ == "__main__":
    main()
