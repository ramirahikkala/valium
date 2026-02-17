# Todo Application Specification

## Overview
A todo task manager with both a web UI and a CLI interface,
backed by PostgreSQL. Deployed via Docker Compose.

## Features
- Create, read, update, delete tasks
- Each task has: id, title, description, status (pending/in_progress/done), created_at, updated_at
- Web UI: simple browser interface (React or plain HTML)
- CLI: command-line tool to manage tasks (e.g. `todo add "Buy milk"`)
- Both interfaces talk to the same REST API

## Architecture
- **API server**: Node.js + Express (or Python + FastAPI — agent decides)
- **Database**: PostgreSQL with migrations
- **Web frontend**: Minimal, functional, served by the API or separate container
- **CLI**: Standalone script that calls the API
- **Docker Compose**: orchestrates db + api + web

## Constraints
- Every meaningful change = a git commit with a clear message
- All code must include basic error handling
- API must have input validation
- Database schema uses migrations (not raw CREATE TABLE)
- Include a README.md with setup instructions
