"""Valium MCP server — manage tasks, lists, and gym programs via Claude."""

import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

# Load .env from project root (one level up from mcp/)
load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

API_URL = os.getenv("VALIUM_API_URL", "https://valium.ketunmetsa.fi")
API_KEY = os.environ["VALIUM_ADMIN_API_KEY"]

mcp = FastMCP("Valium")

HEADERS = {"Authorization": f"Bearer {API_KEY}"}


def get(path: str, **params) -> dict | list:
    r = httpx.get(f"{API_URL}{path}", headers=HEADERS, params=params, timeout=10)
    r.raise_for_status()
    return r.json()


def post(path: str, body: dict) -> dict:
    r = httpx.post(f"{API_URL}{path}", headers=HEADERS, json=body, timeout=10)
    r.raise_for_status()
    return r.json()


def put(path: str, body: dict) -> dict:
    r = httpx.put(f"{API_URL}{path}", headers=HEADERS, json=body, timeout=10)
    r.raise_for_status()
    return r.json()


def delete(path: str) -> dict:
    r = httpx.delete(f"{API_URL}{path}", headers=HEADERS, timeout=10)
    r.raise_for_status()
    return r.json()


# ── Lists ─────────────────────────────────────────────────────────────────────

@mcp.tool()
def list_lists() -> list:
    """Return all task lists."""
    return get("/lists")


@mcp.tool()
def create_list(name: str) -> dict:
    """Create a new task list."""
    return post("/lists", {"name": name})


# ── Tasks ─────────────────────────────────────────────────────────────────────

@mcp.tool()
def list_tasks(list_id: int, status: str | None = None) -> list:
    """Return tasks in a list. Optional status filter: pending, in_progress, done."""
    params = {"list_id": list_id}
    if status:
        params["status"] = status
    return get("/tasks", **params)


@mcp.tool()
def create_task(list_id: int, title: str, description: str = "") -> dict:
    """Create a new task in the given list."""
    body = {"list_id": list_id, "title": title}
    if description:
        body["description"] = description
    return post("/tasks", body)


@mcp.tool()
def update_task(task_id: int, title: str | None = None, description: str | None = None, status: str | None = None) -> dict:
    """Update a task. Status: pending, in_progress, done."""
    body = {}
    if title is not None:
        body["title"] = title
    if description is not None:
        body["description"] = description
    if status is not None:
        body["status"] = status
    return put(f"/tasks/{task_id}", body)


@mcp.tool()
def delete_task(task_id: int) -> dict:
    """Delete a task."""
    return delete(f"/tasks/{task_id}")


# ── Exercise library ──────────────────────────────────────────────────────────

@mcp.tool()
def list_exercises() -> list:
    """Return all exercises in the personal exercise library."""
    return get("/gym/exercises")


@mcp.tool()
def create_exercise(name: str) -> dict:
    """Add a new exercise to the personal library."""
    return post("/gym/exercises", {"name": name})


@mcp.tool()
def delete_exercise(exercise_id: int) -> dict:
    """Remove an exercise from the library (also removes it from all programs)."""
    return delete(f"/gym/exercises/{exercise_id}")


# ── Workout programs ──────────────────────────────────────────────────────────

@mcp.tool()
def list_programs(active_only: bool = False) -> list:
    """Return all workout programs. Set active_only=True to filter inactive ones."""
    params = {"active": "true"} if active_only else {}
    return get("/gym/programs", **params)


@mcp.tool()
def create_program(name: str) -> dict:
    """Create a new workout program."""
    return post("/gym/programs", {"name": name})


@mcp.tool()
def update_program(program_id: int, name: str | None = None, is_active: bool | None = None) -> dict:
    """Rename a program or toggle its active status."""
    body = {}
    if name is not None:
        body["name"] = name
    if is_active is not None:
        body["is_active"] = is_active
    return put(f"/gym/programs/{program_id}", body)


@mcp.tool()
def get_program_exercises(program_id: int) -> list:
    """Return exercises in a program with their weight/sets/reps settings."""
    return get(f"/gym/programs/{program_id}/exercises")


@mcp.tool()
def add_exercise_to_program(
    program_id: int,
    exercise_id: int,
    weight: float = 0.0,
    sets: int = 3,
    reps: int = 10,
    rest_seconds: int = 90,
) -> dict:
    """Add an exercise from the library to a program."""
    return post(f"/gym/programs/{program_id}/exercises", {
        "exercise_id": exercise_id,
        "weight": weight,
        "sets": sets,
        "reps": reps,
        "rest_seconds": rest_seconds,
    })


@mcp.tool()
def update_program_exercise(
    program_id: int,
    exercise_id: int,
    weight: float | None = None,
    sets: int | None = None,
    reps: int | None = None,
    rest_seconds: int | None = None,
    auto_increment: bool | None = None,
    increment_kg: float | None = None,
    base_weight: float | None = None,
) -> dict:
    """Update weight, sets, reps, rest or auto-increment settings for a program exercise."""
    body = {}
    for field, val in [
        ("weight", weight), ("sets", sets), ("reps", reps),
        ("rest_seconds", rest_seconds), ("auto_increment", auto_increment),
        ("increment_kg", increment_kg), ("base_weight", base_weight),
    ]:
        if val is not None:
            body[field] = val
    return put(f"/gym/programs/{program_id}/exercises/{exercise_id}", body)


@mcp.tool()
def remove_exercise_from_program(program_id: int, exercise_id: int) -> dict:
    """Remove an exercise from a program."""
    return delete(f"/gym/programs/{program_id}/exercises/{exercise_id}")


# ── Workout sessions ──────────────────────────────────────────────────────────

@mcp.tool()
def list_sessions() -> list:
    """Return recent workout sessions (newest first)."""
    return get("/gym/sessions")


@mcp.tool()
def start_session(program_id: int) -> dict:
    """Start a new workout session from a program."""
    return post("/gym/sessions", {"program_id": program_id})


@mcp.tool()
def log_set(session_id: int, exercise_id: int, set_number: int, weight_used: float, reps_done: int) -> dict:
    """Log a completed set during an active session."""
    return post(f"/gym/sessions/{session_id}/sets", {
        "exercise_id": exercise_id,
        "set_number": set_number,
        "weight_used": weight_used,
        "reps_done": reps_done,
    })


@mcp.tool()
def complete_session(session_id: int, outcome: str = "success") -> dict:
    """Complete a workout session. outcome: success | failed_reset | failed_stay."""
    return put(f"/gym/sessions/{session_id}/complete", {"outcome": outcome})


if __name__ == "__main__":
    mcp.run()
