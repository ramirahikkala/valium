"""Integration tests for the Valium API (requires running docker-compose stack)."""

import httpx
import jwt
import pytest

BASE_URL = "http://localhost:8000"
JWT_SECRET = "dev-secret-change-in-production"


def _create_test_user(client: httpx.Client, suffix: str = "") -> tuple[dict, str]:
    """Create a test user directly in the DB via a helper and return (user, token).

    Since we can't do a real Google Sign-In in tests, we create a user by
    calling the API with a mock approach. Instead, we'll create the user
    via direct DB insertion through a test-only endpoint or by mocking.

    For integration tests against the running stack, we use the JWT directly
    by crafting a token for a known test user.
    """
    # We need to create a user in the DB first. Since there's no test-only
    # endpoint, we'll use a raw SQL approach via the health endpoint pattern.
    # Actually, for integration tests, let's create a lightweight test helper.
    #
    # The simplest approach: create user via POST to a test setup endpoint,
    # or insert directly. Since we're testing against a live stack, we'll
    # use the DB directly via the API's internal mechanism.
    #
    # For now, use a helper that inserts via psycopg2 and returns a JWT.
    import psycopg2

    conn = psycopg2.connect(
        host="localhost", port=5432, dbname="valium", user="valium", password="valium"
    )
    conn.autocommit = True
    cur = conn.cursor()

    google_id = f"test-google-id-{suffix or id(object())}"
    email = f"test{suffix}@example.com"
    name = f"Test User {suffix}"

    cur.execute(
        """INSERT INTO users (google_id, email, name)
           VALUES (%s, %s, %s)
           ON CONFLICT (google_id) DO UPDATE SET email = EXCLUDED.email
           RETURNING id, email, name""",
        (google_id, email, name),
    )
    user_id, db_email, db_name = cur.fetchone()

    # Create default list if not exists
    cur.execute(
        """INSERT INTO lists (name, user_id)
           VALUES ('My Tasks', %s)
           ON CONFLICT ON CONSTRAINT lists_user_id_name_key DO NOTHING""",
        (user_id,),
    )

    cur.close()
    conn.close()

    token = jwt.encode({"sub": str(user_id)}, JWT_SECRET, algorithm="HS256")
    user = {"id": user_id, "email": db_email, "name": db_name, "picture": None}
    return user, token


def _cleanup_test_user(user_id: int) -> None:
    """Remove a test user and all their data from the DB."""
    import psycopg2

    conn = psycopg2.connect(
        host="localhost", port=5432, dbname="valium", user="valium", password="valium"
    )
    conn.autocommit = True
    cur = conn.cursor()
    # CASCADE will delete lists and tasks via FK
    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
    cur.close()
    conn.close()


@pytest.fixture()
def client() -> httpx.Client:
    """Return an httpx client pointing at the local API."""
    with httpx.Client(base_url=BASE_URL, timeout=10) as c:
        yield c


@pytest.fixture()
def auth_client() -> httpx.Client:
    """Return an authenticated httpx client with a test user."""
    user, token = _create_test_user(httpx.Client(), suffix="main")
    with httpx.Client(
        base_url=BASE_URL,
        timeout=10,
        headers={"Authorization": f"Bearer {token}"},
    ) as c:
        c._test_user = user  # type: ignore[attr-defined]
        c._test_token = token  # type: ignore[attr-defined]
        yield c
    _cleanup_test_user(user["id"])


@pytest.fixture()
def auth_client_b() -> httpx.Client:
    """Return a second authenticated httpx client (different user) for scoping tests."""
    user, token = _create_test_user(httpx.Client(), suffix="other")
    with httpx.Client(
        base_url=BASE_URL,
        timeout=10,
        headers={"Authorization": f"Bearer {token}"},
    ) as c:
        c._test_user = user  # type: ignore[attr-defined]
        c._test_token = token  # type: ignore[attr-defined]
        yield c
    _cleanup_test_user(user["id"])


@pytest.fixture()
def default_list(auth_client: httpx.Client) -> dict:
    """Return the default 'My Tasks' list for the test user."""
    resp = auth_client.get("/lists")
    assert resp.status_code == 200
    lists = resp.json()
    my_tasks = [l for l in lists if l["name"] == "My Tasks"]
    assert len(my_tasks) == 1
    return my_tasks[0]


@pytest.fixture()
def task(auth_client: httpx.Client, default_list: dict) -> dict:
    """Create a throwaway task and clean it up after the test."""
    resp = auth_client.post(
        "/tasks",
        json={"title": "Test task", "description": "auto", "list_id": default_list["id"]},
    )
    assert resp.status_code == 201
    data = resp.json()
    yield data
    auth_client.delete(f"/tasks/{data['id']}")


@pytest.fixture()
def test_list(auth_client: httpx.Client) -> dict:
    """Create a throwaway list and clean it up after the test."""
    resp = auth_client.post("/lists", json={"name": f"TestList-{id(object())}"})
    assert resp.status_code == 201
    data = resp.json()
    yield data
    auth_client.delete(f"/lists/{data['id']}")


# ---------- Health ----------


def test_health(client: httpx.Client) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


# ---------- Auth ----------


def test_auth_config(client: httpx.Client) -> None:
    """GET /auth/config should return a client_id."""
    resp = client.get("/auth/config")
    assert resp.status_code == 200
    assert "client_id" in resp.json()


def test_auth_me(auth_client: httpx.Client) -> None:
    """GET /auth/me should return the current user."""
    resp = auth_client.get("/auth/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == auth_client._test_user["email"]  # type: ignore[attr-defined]
    assert "id" in data


def test_auth_me_no_token(client: httpx.Client) -> None:
    """GET /auth/me without a token should return 401/403."""
    resp = client.get("/auth/me")
    assert resp.status_code in (401, 403)


def test_auth_invalid_token(client: httpx.Client) -> None:
    """GET /auth/me with an invalid token should return 401."""
    resp = client.get("/auth/me", headers={"Authorization": "Bearer invalid-token"})
    assert resp.status_code == 401


# ---------- Lists ----------


def test_list_lists(auth_client: httpx.Client, default_list: dict) -> None:
    """GET /lists should include the default 'My Tasks' list."""
    resp = auth_client.get("/lists")
    assert resp.status_code == 200
    lists = resp.json()
    assert any(l["id"] == default_list["id"] for l in lists)


def test_create_list(auth_client: httpx.Client) -> None:
    """POST /lists should create a new list."""
    name = f"TestCreate-{id(object())}"
    resp = auth_client.post("/lists", json={"name": name})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == name
    assert "id" in data
    # cleanup
    auth_client.delete(f"/lists/{data['id']}")


def test_create_list_duplicate(auth_client: httpx.Client, test_list: dict) -> None:
    """POST /lists with a duplicate name should return 409."""
    resp = auth_client.post("/lists", json={"name": test_list["name"]})
    assert resp.status_code == 409


def test_delete_list(auth_client: httpx.Client) -> None:
    """DELETE /lists/{id} should remove the list."""
    create_resp = auth_client.post("/lists", json={"name": "ToDelete"})
    list_id = create_resp.json()["id"]
    resp = auth_client.delete(f"/lists/{list_id}")
    assert resp.status_code == 204


def test_delete_list_not_found(auth_client: httpx.Client) -> None:
    """DELETE /lists/{id} for a non-existent list should return 404."""
    resp = auth_client.delete("/lists/999999")
    assert resp.status_code == 404


# ---------- Tasks ----------


def test_create_task(auth_client: httpx.Client, default_list: dict) -> None:
    """POST /tasks should create a task in the specified list."""
    resp = auth_client.post(
        "/tasks", json={"title": "Buy groceries", "list_id": default_list["id"]}
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Buy groceries"
    assert data["status"] == "pending"
    assert data["list_id"] == default_list["id"]
    assert "id" in data
    # cleanup
    auth_client.delete(f"/tasks/{data['id']}")


def test_create_task_missing_title(auth_client: httpx.Client, default_list: dict) -> None:
    """POST /tasks without a title should return 422."""
    resp = auth_client.post("/tasks", json={"list_id": default_list["id"]})
    assert resp.status_code == 422


def test_create_task_missing_list_id(auth_client: httpx.Client) -> None:
    """POST /tasks without a list_id should return 422."""
    resp = auth_client.post("/tasks", json={"title": "No list"})
    assert resp.status_code == 422


def test_list_tasks(auth_client: httpx.Client, default_list: dict, task: dict) -> None:
    """GET /tasks?list_id=X should include the created task."""
    resp = auth_client.get("/tasks", params={"list_id": default_list["id"]})
    assert resp.status_code == 200
    tasks = resp.json()
    assert any(t["id"] == task["id"] for t in tasks)


def test_list_tasks_filter_status(
    auth_client: httpx.Client, default_list: dict, task: dict
) -> None:
    """GET /tasks with status filter should only return matching tasks."""
    resp = auth_client.get(
        "/tasks", params={"list_id": default_list["id"], "status": "pending"}
    )
    assert resp.status_code == 200
    assert all(t["status"] == "pending" for t in resp.json())


def test_list_tasks_requires_list_id(auth_client: httpx.Client) -> None:
    """GET /tasks without list_id should return 422."""
    resp = auth_client.get("/tasks")
    assert resp.status_code == 422


def test_get_task(auth_client: httpx.Client, task: dict) -> None:
    """GET /tasks/{id} should return the task."""
    resp = auth_client.get(f"/tasks/{task['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == task["id"]


def test_get_task_not_found(auth_client: httpx.Client) -> None:
    """GET /tasks/{id} for a non-existent task should return 404."""
    resp = auth_client.get("/tasks/999999")
    assert resp.status_code == 404


def test_update_task(auth_client: httpx.Client, task: dict) -> None:
    """PUT /tasks/{id} should update the task."""
    resp = auth_client.put(f"/tasks/{task['id']}", json={"status": "done"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "done"


def test_delete_task(auth_client: httpx.Client, default_list: dict) -> None:
    """DELETE /tasks/{id} should remove the task."""
    create_resp = auth_client.post(
        "/tasks", json={"title": "To be deleted", "list_id": default_list["id"]}
    )
    task_id = create_resp.json()["id"]
    resp = auth_client.delete(f"/tasks/{task_id}")
    assert resp.status_code == 204
    # verify gone
    assert auth_client.get(f"/tasks/{task_id}").status_code == 404


# ---------- Tasks with lists ----------


def test_create_task_with_list(auth_client: httpx.Client, test_list: dict) -> None:
    """POST /tasks with a specific list_id should assign the task to that list."""
    resp = auth_client.post(
        "/tasks",
        json={"title": "Listed task", "list_id": test_list["id"]},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["list_id"] == test_list["id"]
    assert data["list_name"] == test_list["name"]
    # cleanup
    auth_client.delete(f"/tasks/{data['id']}")


def test_create_task_with_invalid_list(auth_client: httpx.Client) -> None:
    """POST /tasks with a non-existent list_id should return 404."""
    resp = auth_client.post(
        "/tasks",
        json={"title": "Bad list", "list_id": 999999},
    )
    assert resp.status_code == 404


def test_update_task_list(
    auth_client: httpx.Client, task: dict, test_list: dict
) -> None:
    """PUT /tasks/{id} can move a task to a different list."""
    resp = auth_client.put(
        f"/tasks/{task['id']}",
        json={"list_id": test_list["id"]},
    )
    assert resp.status_code == 200
    assert resp.json()["list_id"] == test_list["id"]
    assert resp.json()["list_name"] == test_list["name"]


def test_filter_tasks_by_list(auth_client: httpx.Client, test_list: dict) -> None:
    """GET /tasks?list_id=X should only return tasks in that list."""
    # Create a task in the test list
    resp = auth_client.post(
        "/tasks",
        json={"title": "In test list", "list_id": test_list["id"]},
    )
    task_id = resp.json()["id"]

    # Filter by that list
    resp = auth_client.get("/tasks", params={"list_id": test_list["id"]})
    assert resp.status_code == 200
    tasks = resp.json()
    assert all(t["list_id"] == test_list["id"] for t in tasks)
    assert any(t["id"] == task_id for t in tasks)

    # cleanup
    auth_client.delete(f"/tasks/{task_id}")


# ---------- Reorder / Position ----------


def test_new_task_at_top(auth_client: httpx.Client, default_list: dict) -> None:
    """Newly created tasks should appear at position 0 (top of list)."""
    resp1 = auth_client.post(
        "/tasks", json={"title": "First", "list_id": default_list["id"]}
    )
    resp2 = auth_client.post(
        "/tasks", json={"title": "Second", "list_id": default_list["id"]}
    )
    id1, id2 = resp1.json()["id"], resp2.json()["id"]

    tasks = auth_client.get("/tasks", params={"list_id": default_list["id"]}).json()
    # Second task should be first in the list (position 0)
    assert tasks[0]["id"] == id2
    assert tasks[0]["position"] == 0
    # First task should be second (position 1)
    first_task = next(t for t in tasks if t["id"] == id1)
    assert first_task["position"] == 1

    # cleanup
    auth_client.delete(f"/tasks/{id1}")
    auth_client.delete(f"/tasks/{id2}")


def test_reorder_tasks(auth_client: httpx.Client, default_list: dict) -> None:
    """PUT /tasks/reorder should update positions to match the given order."""
    r1 = auth_client.post(
        "/tasks", json={"title": "A", "list_id": default_list["id"]}
    )
    r2 = auth_client.post(
        "/tasks", json={"title": "B", "list_id": default_list["id"]}
    )
    r3 = auth_client.post(
        "/tasks", json={"title": "C", "list_id": default_list["id"]}
    )
    id1, id2, id3 = r1.json()["id"], r2.json()["id"], r3.json()["id"]

    # Reorder: put id1 first, id3 second, id2 third
    resp = auth_client.put("/tasks/reorder", json={"task_ids": [id1, id3, id2]})
    assert resp.status_code == 200

    tasks = auth_client.get("/tasks", params={"list_id": default_list["id"]}).json()
    order = [t["id"] for t in tasks if t["id"] in (id1, id2, id3)]
    assert order == [id1, id3, id2]

    # cleanup
    auth_client.delete(f"/tasks/{id1}")
    auth_client.delete(f"/tasks/{id2}")
    auth_client.delete(f"/tasks/{id3}")


def test_reorder_invalid_task_id(auth_client: httpx.Client) -> None:
    """PUT /tasks/reorder with a non-existent task ID should return 404."""
    resp = auth_client.put("/tasks/reorder", json={"task_ids": [999999]})
    assert resp.status_code == 404


def test_delete_list_nullifies_task(auth_client: httpx.Client) -> None:
    """Deleting a list should set list_id to null on associated tasks."""
    list_resp = auth_client.post("/lists", json={"name": "Ephemeral"})
    list_id = list_resp.json()["id"]

    task_resp = auth_client.post(
        "/tasks",
        json={"title": "Will lose list", "list_id": list_id},
    )
    task_id = task_resp.json()["id"]

    # Delete list
    auth_client.delete(f"/lists/{list_id}")

    # Check task — it should still exist but with null list
    resp = auth_client.get(f"/tasks/{task_id}")
    assert resp.status_code == 200
    assert resp.json()["list_id"] is None
    assert resp.json()["list_name"] is None

    # cleanup
    auth_client.delete(f"/tasks/{task_id}")


# ---------- User scoping ----------


def test_user_cannot_see_other_users_lists(
    auth_client: httpx.Client, auth_client_b: httpx.Client
) -> None:
    """User A should not see User B's lists."""
    # User B creates a list
    resp = auth_client_b.post("/lists", json={"name": "Secret List"})
    assert resp.status_code == 201
    secret_list_id = resp.json()["id"]

    # User A lists their lists — should not include User B's
    resp = auth_client.get("/lists")
    assert resp.status_code == 200
    assert not any(l["id"] == secret_list_id for l in resp.json())

    # cleanup
    auth_client_b.delete(f"/lists/{secret_list_id}")


def test_user_cannot_access_other_users_tasks(
    auth_client: httpx.Client, auth_client_b: httpx.Client
) -> None:
    """User A should not be able to access User B's tasks via list_id."""
    # Get User B's default list
    resp = auth_client_b.get("/lists")
    b_list = resp.json()[0]

    # User B creates a task
    resp = auth_client_b.post(
        "/tasks", json={"title": "B's task", "list_id": b_list["id"]}
    )
    assert resp.status_code == 201
    task_id = resp.json()["id"]

    # User A tries to list tasks in User B's list — should get 404
    resp = auth_client.get("/tasks", params={"list_id": b_list["id"]})
    assert resp.status_code == 404

    # User A tries to get User B's task directly — should get 404
    resp = auth_client.get(f"/tasks/{task_id}")
    assert resp.status_code == 404

    # cleanup
    auth_client_b.delete(f"/tasks/{task_id}")


def test_user_cannot_create_task_in_other_users_list(
    auth_client: httpx.Client, auth_client_b: httpx.Client
) -> None:
    """User A should not be able to create tasks in User B's lists."""
    # Get User B's default list
    resp = auth_client_b.get("/lists")
    b_list = resp.json()[0]

    # User A tries to create a task in User B's list
    resp = auth_client.post(
        "/tasks", json={"title": "Sneaky task", "list_id": b_list["id"]}
    )
    assert resp.status_code == 404


def test_unauthenticated_cannot_access_tasks(client: httpx.Client) -> None:
    """Unauthenticated requests to task endpoints should return 401/403."""
    resp = client.get("/tasks", params={"list_id": 1})
    assert resp.status_code in (401, 403)

    resp = client.get("/lists")
    assert resp.status_code in (401, 403)
