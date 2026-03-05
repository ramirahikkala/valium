"""Test deload logic against the production API.

Fetches current exercise state, then simulates what happens after
1, 2, and 3 consecutive failures using the same math as gym_router.py.
"""

import math
import os
import sys

import requests

API_BASE = "https://valium.ketunmetsa.fi/api"
API_KEY = os.environ.get("VALIUM_API_KEY", "BfdQPubJnrmcwkddwkRtbnY-a65exgMtHXbSodxF7jA")

HEADERS = {"Authorization": f"Bearer {API_KEY}"}


def get_programs():
    r = requests.get(f"{API_BASE}/gym/programs", headers=HEADERS)
    r.raise_for_status()
    return r.json()


def simulate_deload(ex: dict, n_failures: int) -> dict:
    """Simulate n consecutive failures on an exercise, return final state."""
    weight = ex["weight"]
    base_weight = ex["base_weight"]
    consecutive_failures = ex["consecutive_failures"]
    threshold = ex["failure_threshold"]
    deload_mode = ex["deload_mode"]
    increment_kg = ex["increment_kg"]
    reset_increment_kg = ex["reset_increment_kg"]

    steps = []
    for i in range(1, n_failures + 1):
        consecutive_failures += 1
        if consecutive_failures >= threshold:
            if deload_mode == "percent":
                new_weight = math.floor(weight * 0.9 / 2.5) * 2.5
                steps.append(
                    f"  Fail {i}: failures={consecutive_failures} >= threshold={threshold} "
                    f"→ PERCENT DELOAD: {weight} → {new_weight} kg (-10%)"
                )
                weight = new_weight
            else:  # reset
                new_weight = base_weight
                new_base = round(base_weight + reset_increment_kg, 2)
                steps.append(
                    f"  Fail {i}: failures={consecutive_failures} >= threshold={threshold} "
                    f"→ RESET DELOAD: weight {weight} → {new_weight} kg (base), "
                    f"base {base_weight} → {new_base} kg"
                )
                weight = new_weight
                base_weight = new_base
            consecutive_failures = 0
        else:
            steps.append(
                f"  Fail {i}: failures={consecutive_failures} / {threshold} "
                f"→ weight unchanged at {weight} kg"
            )

    return {"steps": steps, "final_weight": weight, "final_base": base_weight}


def main():
    print(f"Fetching programs from {API_BASE}...\n")
    try:
        programs = get_programs()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    for prog in programs:
        print(f"=== {prog['name']} (id={prog['id']}, active={prog['is_active']}) ===")
        if not prog.get("exercises"):
            print("  (no exercises)\n")
            continue
        for ex in prog["exercises"]:
            print(f"\n  {ex['exercise_name']} (program_exercise id={ex['id']})")
            print(f"    weight={ex['weight']} kg  base_weight={ex['base_weight']} kg")
            print(f"    auto_increment={ex['auto_increment']}  deload_mode={ex['deload_mode']}")
            print(f"    failure_threshold={ex['failure_threshold']}  consecutive_failures={ex['consecutive_failures']}")
            print(f"    increment_kg={ex['increment_kg']}  reset_increment_kg={ex['reset_increment_kg']}")

            if not ex["auto_increment"]:
                print("    [auto_increment OFF — deload logic skipped]")
                continue

            print(f"\n    Simulation (starting from current state, failures={ex['consecutive_failures']}):")

            # Simulate 3 more failures (enough to trigger threshold=3)
            result = simulate_deload(ex, n_failures=3)
            for step in result["steps"]:
                print(step)
            print(f"    Final weight after 3 failures: {result['final_weight']} kg")

        print()


if __name__ == "__main__":
    main()
