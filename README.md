# AI Workflow Automation SaaS Platform

A portfolio-worthy SaaS platform for building and automating workflows with AI agents. Like Zapier, but with intelligent AI at the core.

## Tech Stack

### Frontend
- **Next.js 15** with TypeScript
- **React Flow** for visual workflow builder
- **TailwindCSS** + **shadcn/ui** for styling
- **Zustand** for state management
- **WebSocket** client for real-time updates

### Backend
- **FastAPI** (Python) for REST API
- **PydanticAI** for AI agent execution
- **SQLAlchemy** with AsyncPG for database
- **WebSocket** support for real-time streaming
- **JWT** authentication

### Database
- **PostgreSQL** with JSONB for flexible data storage

## Features

- **Visual Workflow Builder**: Drag-and-drop interface to create complex workflows
- **AI Agent Nodes**: Execute AI agents with streaming responses
- **Real-time Execution**: Watch workflows execute with live updates
- **Authentication**: JWT-based secure authentication
- **Execution History**: Detailed logs and analytics

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Frontend will be available at http://localhost:3000
# Backend API docs at http://localhost:8000/docs
```
# IntelliFlow Engine

IntelliFlow Engine is an AI-first workflow automation platform for building, executing, and observing intelligent workflows composed of AI agents.

Key goals:
- Compose AI agents into reusable workflows
- Provide real-time execution streaming and observability
- Ship a developer-friendly stack for rapid iteration

## Quick Start

Prerequisites:
- Docker & Docker Compose
- Node.js 18+ (for frontend local dev)
- Python 3.11+ (for backend local dev)

Run with Docker Compose (recommended):

```bash
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API docs: http://localhost:8000/docs
```

Local development (backend):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# configure .env from .env.example
# run migrations (if using Alembic)
# alembic upgrade head
uvicorn app.main:app --reload
```

Local development (frontend):

```bash
cd frontend
npm install
npm run dev
```

## Repo layout

- `backend/` — FastAPI app, models, schemas, services, websocket handlers
- `frontend/` — Next.js app (app router), components, API client
- `docker-compose.yml` — Development docker setup
- `scripts/` — helper scripts (e.g., `setup.sh`)

## Environment

Store secrets in environment variables or a secrets manager. Example variables (backend `.env`):

- `DATABASE_URL` — PostgreSQL connection URL
- `SECRET_KEY` — JWT secret
- `REDIS_URL` — Redis for caching/websocket pubsub (optional)

Do not commit secrets to the repository. The project `.gitignore` already excludes common secret files.

## Contributing

1. Fork the repo and open a feature branch.
2. Run tests locally and ensure linting passes.
3. Open a pull request with a clear description and test coverage for changes.

## Useful Commands

- Start services: `docker-compose up -d`
- Backend dev: `uvicorn app.main:app --reload`
- Frontend dev: `npm run dev`
- Run tests (backend): `pytest`

## License

MIT

---
If you'd like, I can commit this `README.md` for you and push it to `origin/main` once you're authenticated.***/*** End Patch
