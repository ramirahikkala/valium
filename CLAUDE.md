# CLAUDE.md

## Project
Todo application with REST API, web UI, CLI, PostgreSQL, Docker Compose. Name of the app is "Valium",inspired by the Rolling Stone's Mother's little helper, Valium is your little helper for getting things done.

## Tech Decisions
- Backend: Python + FastAPI (lightweight, good for APIs)
- Database: PostgreSQL with alembic migrations
- Web frontend: To be decided by you (React, Vue, Svelte, or plain HTML/JS)
- CLI: Python click-based CLI that calls the REST API
- Docker Compose: 3 services (db, api, web/cli)

## Git Discipline
- Commit after EVERY completed unit of work
- Use conventional commit messages: feat:, fix:, docs:, refactor:, test:
- Keep commits small and atomic
- NEVER bundle unrelated changes in one commit

## Code Standards
- All API endpoints return JSON with consistent error format
- Use environment variables for config (DATABASE_URL, API_PORT)
- Include type hints in Python code
- Write docstrings for all public functions

## File Structure
valium/
├── CLAUDE.md
├── SPEC.md
├── README.md
├── docker-compose.yml
├── api/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py              # FastAPI app
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── database.py          # DB connection
│   └── alembic/             # migrations
├── web/
TBD: You will decide the frontend tech and structure
├── cli/
│   ├── requirements.txt
│   └── valium_cli.py          # Click CLI
└── tests/
└── test_api.py

## Agent Team Instructions
When working as a team:
- **Lead**: Read SPEC.md, break work into tasks, assign to teammates, review results
- **Backend agent**: Owns api/ folder — models, routes, migrations, database
- **Frontend agent**: Owns web/ folder — HTML/JS interface that calls the API  
- **CLI agent**: Owns cli/ folder — command-line interface
- **Infra agent**: Owns docker-compose.yml, Dockerfiles, README

After each agent completes work, the lead should:
1. Check that the code runs
2. Run any tests
3. Make a git commit for that piece