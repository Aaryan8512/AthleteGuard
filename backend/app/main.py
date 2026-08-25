from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, athletes, workouts, recovery, training, movement, risk, coach, dashboard

app = FastAPI(title='AthleteGuard API', version='1.0.0', description='Performance, recovery, training-load, movement-quality and risk-indicator API. This service does not diagnose injuries.')
allowed_origins = list({
	*settings.cors_origin_list,
	'http://localhost:5173',
	'http://localhost:5174',
	'http://localhost:5175',
	'http://127.0.0.1:5173',
	'http://127.0.0.1:5174',
	'http://127.0.0.1:5175',
	'https://aaryan8512.github.io',
})
app.add_middleware(CORSMiddleware, allow_origins=allowed_origins, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
for router in (auth.router, athletes.router, workouts.router, recovery.router, training.router, movement.router, risk.router, coach.router, dashboard.router): app.include_router(router)

@app.get('/health', tags=['Health'])
def health(): return {'status': 'ok', 'service': 'AthleteGuard API'}

@app.get('/', tags=['Health'])
def root():
	return {'service': 'AthleteGuard API', 'status': 'running', 'docs': '/docs', 'health': '/health'}
