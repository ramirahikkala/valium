"""Integration tests for the Valium API (requires running docker-compose stack)."""

import httpx
import pytest

BASE_URL = "http://localhost:8000"


@pytest.fixture()
def client() -> httpx.Client:
    """Return an httpx client pointing at the local API."""
    with httpx.Client(base_url=BASE_URL, timeout=10) as c:
        yield c


@pytest.fixture()
def task(client: httpx.Client) -> dict:
    """Create a throwaway task and clean it up after the test."""
    resp = client.post("/tasks", json={"title": "Test task", "description": "auto"})
    assert resp.status_code == 201
    data = resp.json()
    yield data
    client.delete(f"/tasks/{data['id']}")


def test_health(client: httpx.Client) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_create_task(client: httpx.Client) -> None:
    resp = client.post("/tasks", json={"title": "Buy groceries"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Buy groceries"
    assert data["status"] == "pending"
    assert "id" in data
    # cleanup
    client.delete(f"/tasks/{data['id']}")


def test_create_task_missing_title(client: httpx.Client) -> None:
    resp = client.post("/tasks", json={})
    assert resp.status_code == 422


def test_list_tasks(client: httpx.Client, task: dict) -> None:
    resp = client.get("/tasks")
    assert resp.status_code == 200
    tasks = resp.json()
    assert any(t["id"] == task["id"] for t in tasks)


def test_list_tasks_filter_status(client: httpx.Client, task: dict) -> None:
    resp = client.get("/tasks", params={"status": "pending"})
    assert resp.status_code == 200
    assert all(t["status"] == "pending" for t in resp.json())


def test_get_task(client: httpx.Client, task: dict) -> None:
    resp = client.get(f"/tasks/{task['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == task["id"]


def test_get_task_not_found(client: httpx.Client) -> None:
    resp = client.get("/tasks/999999")
    assert resp.status_code == 404


def test_update_task(client: httpx.Client, task: dict) -> None:
    resp = client.put(f"/tasks/{task['id']}", json={"status": "done"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "done"


def test_delete_task(client: httpx.Client) -> None:
    create_resp = client.post("/tasks", json={"title": "To be deleted"})
    task_id = create_resp.json()["id"]
    resp = client.delete(f"/tasks/{task_id}")
    assert resp.status_code == 204
    # verify gone
    assert client.get(f"/tasks/{task_id}").status_code == 404
