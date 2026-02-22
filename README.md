# Valium

*Your little helper for getting things done. Inspired by the Rolling Stones' "Mother's Little Helper".*

A todo app with a gym workout tracker. Sign in with Google, manage task lists with drag-and-drop, and track your gym sessions with a live rest timer.

## Features

- **Tasks** — create lists, add tasks with status (pending / in progress / done), drag to reorder, set email reminders
- **Gym** — build workout programs with exercises, start sessions, log sets with a per-exercise rest timer, browse history

## Quick Start

```bash
cp .env.example .env
# Fill in GOOGLE_CLIENT_ID and optionally SMTP settings
docker compose up --build
```

- **Web UI**: http://localhost:3000
- **API + Swagger docs**: http://localhost:8000/docs

## Architecture

| Service | Tech | Port |
|---------|------|------|
| API | Python / FastAPI + SQLAlchemy | 8000 |
| Web | Node.js / Express + vanilla JS | 3000 |
| Database | PostgreSQL 16 | 5432 |

Authentication is Google Sign-In (OAuth 2.0). The web server proxies `/api/*` to the FastAPI backend.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `JWT_SECRET` | Yes (prod) | Secret for signing session tokens |
| `DATABASE_URL` | Auto | Set by Docker Compose |
| `SMTP_HOST` | Optional | For email reminders |
| `SMTP_PORT` | Optional | Default 587 |
| `SMTP_USER` | Optional | SMTP username |
| `SMTP_PASSWORD` | Optional | SMTP password |

## Running Tests

With the Docker stack running:

```bash
uv run --with httpx --with pytest pytest tests/ -v
```

## License

MIT — see [LICENSE](LICENSE).
