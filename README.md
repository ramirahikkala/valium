# Valium

*Your little helper for getting things done.*

A todo task manager with a web UI and REST API, backed by PostgreSQL and orchestrated with Docker Compose.

## Quick Start

```bash
docker compose up --build -d
```

- **Web UI**: http://localhost:3000
- **API**: http://localhost:8000
- **API docs (Swagger)**: http://localhost:8000/docs

## Architecture

| Service | Tech | Port |
|---------|------|------|
| API | Python / FastAPI | 8000 |
| Web | Node.js / Express + vanilla JS | 3000 |
| Database | PostgreSQL 16 | 5432 |

The web frontend proxies `/api/*` requests to the FastAPI backend.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/tasks` | List tasks (optional `?status=` filter) |
| POST | `/tasks` | Create a task |
| GET | `/tasks/{id}` | Get a task |
| PUT | `/tasks/{id}` | Update a task |
| DELETE | `/tasks/{id}` | Delete a task |

## Task Model

| Field | Type | Description |
|-------|------|-------------|
| id | int | Auto-increment primary key |
| title | string | Required |
| description | string | Optional |
| status | enum | `pending`, `in_progress`, `done` |
| created_at | datetime | Auto-set on creation |
| updated_at | datetime | Auto-updated on change |

## Running Tests

With the Docker stack running:

```bash
uv run --with httpx --with pytest pytest tests/ -v
```

## Environment Variables

| Variable | Default | Used by |
|----------|---------|---------|
| `DATABASE_URL` | `postgresql+asyncpg://valium:valium@localhost:5432/valium` | API |
| `API_PORT` | `8000` | API |
| `API_URL` | `http://localhost:8000` | Web |
