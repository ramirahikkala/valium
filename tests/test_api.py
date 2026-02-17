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


@pytest.fixture()
def category(client: httpx.Client) -> dict:
    """Create a throwaway category and clean it up after the test."""
    resp = client.post("/categories", json={"name": f"TestCat-{id(object())}"})
    assert resp.status_code == 201
    data = resp.json()
    yield data
    client.delete(f"/categories/{data['id']}")


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


# ---------- Category CRUD ----------


def test_create_category(client: httpx.Client) -> None:
    name = f"TestCreate-{id(object())}"
    resp = client.post("/categories", json={"name": name})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == name
    assert "id" in data
    # cleanup
    client.delete(f"/categories/{data['id']}")


def test_create_category_duplicate(client: httpx.Client, category: dict) -> None:
    resp = client.post("/categories", json={"name": category["name"]})
    assert resp.status_code == 409


def test_list_categories(client: httpx.Client, category: dict) -> None:
    resp = client.get("/categories")
    assert resp.status_code == 200
    cats = resp.json()
    assert any(c["id"] == category["id"] for c in cats)


def test_delete_category(client: httpx.Client) -> None:
    create_resp = client.post("/categories", json={"name": "ToDelete"})
    cat_id = create_resp.json()["id"]
    resp = client.delete(f"/categories/{cat_id}")
    assert resp.status_code == 204


def test_delete_category_not_found(client: httpx.Client) -> None:
    resp = client.delete("/categories/999999")
    assert resp.status_code == 404


# ---------- Tasks with categories ----------


def test_create_task_with_category(client: httpx.Client, category: dict) -> None:
    resp = client.post(
        "/tasks",
        json={"title": "Categorized task", "category_id": category["id"]},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["category_id"] == category["id"]
    assert data["category_name"] == category["name"]
    # cleanup
    client.delete(f"/tasks/{data['id']}")


def test_create_task_with_invalid_category(client: httpx.Client) -> None:
    resp = client.post(
        "/tasks",
        json={"title": "Bad category", "category_id": 999999},
    )
    assert resp.status_code == 404


def test_update_task_category(client: httpx.Client, task: dict, category: dict) -> None:
    resp = client.put(
        f"/tasks/{task['id']}",
        json={"category_id": category["id"]},
    )
    assert resp.status_code == 200
    assert resp.json()["category_id"] == category["id"]
    assert resp.json()["category_name"] == category["name"]


def test_filter_tasks_by_category(client: httpx.Client, category: dict) -> None:
    # Create a task with category
    resp = client.post(
        "/tasks",
        json={"title": "Filtered task", "category_id": category["id"]},
    )
    task_id = resp.json()["id"]

    # Create a task without category
    resp2 = client.post("/tasks", json={"title": "No category task"})
    task2_id = resp2.json()["id"]

    # Filter by category
    resp = client.get("/tasks", params={"category_id": category["id"]})
    assert resp.status_code == 200
    tasks = resp.json()
    assert all(t["category_id"] == category["id"] for t in tasks)
    assert any(t["id"] == task_id for t in tasks)
    assert not any(t["id"] == task2_id for t in tasks)

    # cleanup
    client.delete(f"/tasks/{task_id}")
    client.delete(f"/tasks/{task2_id}")


def test_delete_category_nullifies_task(client: httpx.Client) -> None:
    """Deleting a category should set category_id to null on associated tasks."""
    cat_resp = client.post("/categories", json={"name": "Ephemeral"})
    cat_id = cat_resp.json()["id"]

    task_resp = client.post(
        "/tasks",
        json={"title": "Will lose category", "category_id": cat_id},
    )
    task_id = task_resp.json()["id"]

    # Delete category
    client.delete(f"/categories/{cat_id}")

    # Check task
    resp = client.get(f"/tasks/{task_id}")
    assert resp.status_code == 200
    assert resp.json()["category_id"] is None
    assert resp.json()["category_name"] is None

    # cleanup
    client.delete(f"/tasks/{task_id}")
