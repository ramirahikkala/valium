"""Fix deload configuration for StrongLifts programs.

StrongLifts B exercises incorrectly have deload_mode=reset instead of percent.
Also fix base_weights to correct starting values.
"""

import os
import sys

import requests

API_BASE = "https://valium.ketunmetsa.fi/api"
API_KEY = os.environ.get("VALIUM_API_KEY", "BfdQPubJnrmcwkddwkRtbnY-a65exgMtHXbSodxF7jA")
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}


def patch_exercise(program_id: int, pe_id: int, data: dict, name: str):
    url = f"{API_BASE}/gym/programs/{program_id}/exercises/{pe_id}"
    r = requests.put(url, headers=HEADERS, json=data)
    r.raise_for_status()
    updated = r.json()
    print(
        f"  ✓ {name}: deload_mode={updated['deload_mode']}, "
        f"weight={updated['weight']}, base_weight={updated['base_weight']}"
    )


def main():
    dry = "--dry" in sys.argv
    if dry:
        print("DRY RUN — no changes will be made\n")

    # StrongLifts B (program_id=3) — change to percent deload, fix base_weights
    # User's stated starting weights: Kyykky=57.5, Pystypunnerrus=25, Mave=60
    print("=== Fixing StrongLifts B (id=3) ===")
    fixes_b = [
        # (program_exercise_id, exercise_name, base_weight)
        (8,  "Kyykky",         57.5),
        (9,  "Pystypunnerrus", 25.0),
        (10, "Maastaveto",     60.0),
    ]
    for pe_id, name, base_weight in fixes_b:
        payload = {"deload_mode": "percent", "base_weight": base_weight}
        print(f"  {name} (pe_id={pe_id}): deload_mode → percent, base_weight → {base_weight}")
        if not dry:
            patch_exercise(3, pe_id, payload, name)

    # StrongLifts A (program_id=2) — already percent, just fix base_weights
    print("\n=== Fixing StrongLifts A (id=2) base_weights ===")
    fixes_a = [
        # (program_exercise_id, exercise_name, base_weight)
        (5, "Kyykky",         57.5),
        (6, "Penkkipunnerrus", 37.5),
        (7, "Kulmasoutu",     32.5),
    ]
    for pe_id, name, base_weight in fixes_a:
        payload = {"base_weight": base_weight}
        print(f"  {name} (pe_id={pe_id}): base_weight → {base_weight}")
        if not dry:
            patch_exercise(2, pe_id, payload, name)

    if dry:
        print("\nRun without --dry to apply changes.")
    else:
        print("\nDone.")


if __name__ == "__main__":
    main()
