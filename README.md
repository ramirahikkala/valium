# Valium

*Your little helper for getting things done.*

A todo task manager with a web UI, CLI, and REST API, backed by PostgreSQL and orchestrated with Docker Compose.

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

The web frontend proxies `/api/*` requests to the FastAPI backend. Both the web UI and CLI talk to the same REST API.

## CLI

The CLI requires Python 3.11+ with `click`, `httpx`, and `rich`:

```bash
cd cli
uv pip install -r requirements.txt

# Point at the running API
export VALIUM_API_URL=http://localhost:8000

python valium_cli.py add "Buy milk" --desc "Get 2% from the store"
python valium_cli.py list
python valium_cli.py list --status pending
python valium_cli.py show 1
python valium_cli.py update 1 --status in_progress
python valium_cli.py done 1
python valium_cli.py delete 1
```

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
| `VALIUM_API_URL` | `http://localhost:8000` | CLI |
