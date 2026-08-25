# AthleteGuard Backend

FastAPI REST API for athlete performance, recovery, training load, movement quality, and explainable risk indicators. It does not diagnose injuries or make medical predictions.

## Local setup

1. Start PostgreSQL, then create a virtual environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

2. Set `DATABASE_URL` and a long random `JWT_SECRET_KEY` in `.env`.
3. Run migrations and optional seed data:

```powershell
alembic upgrade head
python seed.py
```

4. Start the API:

```powershell
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs` or `/redoc`. Health is available at `/health`.

## Docker

```powershell
docker compose up --build -d
docker compose exec api python seed.py
```

## Authentication

Register with `POST /api/auth/register`, log in with `POST /api/auth/login`, then send `Authorization: Bearer <access_token>`. Athlete routes are restricted to the authenticated athlete. Coach and admin routes use role checks.

## API groups

- `/api/auth`: register, login, current user
- `/api/athletes`: athlete profile and dashboard
- `/api/workouts`: persisted workout sessions; session load is calculated server-side
- `/api/recovery`: recovery score and history
- `/api/training`: today, seven-day, and history summaries
- `/api/movement`: analyzer results and landmark-ready endpoint
- `/api/risk`: explainable risk-indicator assessments
- `/api/coach`: coach/admin team dashboard and filtering
- `/api/dashboard/athlete`: aggregate athlete dashboard payload

Example workout:

```json
{"exercise":"squat","duration_minutes":35,"intensity":8,"repetitions":16}
```

The API calculates `session_load` as `35 * 8 = 280`; client-provided load values are ignored.

## Architecture

`MovementAnalyzer` in `app/services/movement_service.py` is the integration point for OpenCV/MediaPipe. It accepts normalized landmark results, calculates joint angles, phases, repetitions, and weighted movement quality. The current analyzer is deterministic and accepts analysis results through the API, so a future MediaPipe worker can replace the implementation without changing route contracts.

## Tests

```powershell
pytest
```
