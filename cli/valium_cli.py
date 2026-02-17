#!/usr/bin/env python3
"""Valium CLI — a command-line client for the Valium todo task manager."""

from __future__ import annotations

import os
import sys

import click
import httpx
from rich.console import Console
from rich.table import Table

API_URL: str = os.getenv("VALIUM_API_URL", "http://localhost:8000")
console = Console()
err_console = Console(stderr=True)

VALID_STATUSES = ("pending", "in_progress", "done")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _api(method: str, path: str, **kwargs) -> httpx.Response:
    """Send an HTTP request to the API and handle connection errors."""
    url = f"{API_URL}{path}"
    try:
        resp = httpx.request(method, url, timeout=10, **kwargs)
    except httpx.ConnectError:
        err_console.print(f"[red]Error:[/red] Cannot connect to API at {API_URL}")
        raise SystemExit(1)
    except httpx.TimeoutException:
        err_console.print(f"[red]Error:[/red] Request to API timed out")
        raise SystemExit(1)

    if resp.status_code == 404:
        err_console.print("[red]Error:[/red] Task not found.")
        raise SystemExit(1)
    if resp.status_code == 422:
        detail = resp.json().get("detail", "Validation error")
        err_console.print(f"[red]Validation error:[/red] {detail}")
        raise SystemExit(1)
    if resp.status_code >= 400:
        err_console.print(
            f"[red]API error ({resp.status_code}):[/red] {resp.text}"
        )
        raise SystemExit(1)

    return resp


def _status_style(status: str) -> str:
    """Return a rich-markup styled status badge."""
    colours = {
        "pending": "yellow",
        "in_progress": "blue",
        "done": "green",
    }
    colour = colours.get(status, "white")
    return f"[{colour}]{status}[/{colour}]"


def _print_task(task: dict) -> None:
    """Pretty-print a single task's details."""
    console.print(f"[bold]ID:[/bold]          {task['id']}")
    console.print(f"[bold]Title:[/bold]       {task['title']}")
    console.print(f"[bold]Description:[/bold] {task.get('description') or '—'}")
    console.print(f"[bold]Status:[/bold]      {_status_style(task['status'])}")
    console.print(f"[bold]Created:[/bold]     {task['created_at']}")
    console.print(f"[bold]Updated:[/bold]     {task['updated_at']}")


# ---------------------------------------------------------------------------
# CLI group
# ---------------------------------------------------------------------------


@click.group()
@click.version_option(version="0.1.0", prog_name="valium")
def cli() -> None:
    """Valium — manage your tasks from the command line."""


# ---------------------------------------------------------------------------
# add
# ---------------------------------------------------------------------------


@cli.command()
@click.argument("title")
@click.option("--desc", default=None, help="Optional task description.")
def add(title: str, desc: str | None) -> None:
    """Create a new task."""
    payload: dict = {"title": title}
    if desc is not None:
        payload["description"] = desc
    resp = _api("POST", "/tasks/", json=payload)
    task = resp.json()
    console.print(f"[green]Created task #{task['id']}:[/green] {task['title']}")


# ---------------------------------------------------------------------------
# list
# ---------------------------------------------------------------------------


@cli.command("list")
@click.option(
    "--status",
    type=click.Choice(VALID_STATUSES, case_sensitive=False),
    default=None,
    help="Filter tasks by status.",
)
def list_tasks(status: str | None) -> None:
    """List tasks in a table. Optionally filter by --status."""
    params: dict = {}
    if status is not None:
        params["status"] = status
    resp = _api("GET", "/tasks/", params=params)
    tasks: list[dict] = resp.json()

    if not tasks:
        console.print("[dim]No tasks found.[/dim]")
        return

    table = Table(title="Tasks")
    table.add_column("ID", style="cyan", justify="right")
    table.add_column("Title")
    table.add_column("Status")
    table.add_column("Created")

    for t in tasks:
        created = t["created_at"][:10] if t.get("created_at") else ""
        table.add_row(
            str(t["id"]),
            t["title"],
            _status_style(t["status"]),
            created,
        )

    console.print(table)


# ---------------------------------------------------------------------------
# show
# ---------------------------------------------------------------------------


@cli.command()
@click.argument("id", type=int)
def show(id: int) -> None:
    """Show details for a single task."""
    resp = _api("GET", f"/tasks/{id}")
    _print_task(resp.json())


# ---------------------------------------------------------------------------
# update
# ---------------------------------------------------------------------------


@cli.command()
@click.argument("id", type=int)
@click.option("--title", default=None, help="New title.")
@click.option("--desc", default=None, help="New description.")
@click.option(
    "--status",
    type=click.Choice(VALID_STATUSES, case_sensitive=False),
    default=None,
    help="New status.",
)
def update(id: int, title: str | None, desc: str | None, status: str | None) -> None:
    """Update a task's title, description, or status."""
    payload: dict = {}
    if title is not None:
        payload["title"] = title
    if desc is not None:
        payload["description"] = desc
    if status is not None:
        payload["status"] = status

    if not payload:
        err_console.print("[yellow]Nothing to update.[/yellow] Provide at least one option.")
        raise SystemExit(1)

    resp = _api("PUT", f"/tasks/{id}", json=payload)
    task = resp.json()
    console.print(f"[green]Updated task #{task['id']}.[/green]")
    _print_task(task)


# ---------------------------------------------------------------------------
# done
# ---------------------------------------------------------------------------


@cli.command()
@click.argument("id", type=int)
def done(id: int) -> None:
    """Mark a task as done (shortcut for update --status done)."""
    resp = _api("PUT", f"/tasks/{id}", json={"status": "done"})
    task = resp.json()
    console.print(f"[green]Task #{task['id']} marked as done.[/green]")


# ---------------------------------------------------------------------------
# delete
# ---------------------------------------------------------------------------


@cli.command()
@click.argument("id", type=int)
@click.option("--yes", "-y", is_flag=True, help="Skip confirmation prompt.")
def delete(id: int, yes: bool) -> None:
    """Delete a task (asks for confirmation)."""
    if not yes:
        # Fetch task first so the user sees what they're deleting.
        resp = _api("GET", f"/tasks/{id}")
        task = resp.json()
        if not click.confirm(f"Delete task #{task['id']} \"{task['title']}\"?"):
            console.print("Aborted.")
            return

    _api("DELETE", f"/tasks/{id}")
    console.print(f"[red]Deleted task #{id}.[/red]")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    cli()
