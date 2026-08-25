import type {
  Athlete,
  DashboardSummary,
  RecoveryCheckin,
  RecoveryResult,
  TeamSummary,
  TrainingLoadSummary,
  WorkoutSession,
  MovementAnalysis,
  Sport,
  RiskLevel,
} from '@/types';
import { calculateRecoveryScore } from './recoveryEngine';

// ===== Service Layer =====
// All UI components talk to this layer, never to transport details directly.
//
// Suggested FastAPI endpoints:
//   GET  /api/athlete/dashboard
//   GET  /api/athlete/training
//   GET  /api/athlete/recovery
//   POST /api/athlete/recovery
//   POST /api/athlete/workout
//   GET  /api/coach/athletes
//   GET  /api/athlete/{id}

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const TOKEN_KEY = 'athleteguard_access_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function authenticate(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<void> {
  if (!API_BASE) {
    throw new Error('The backend API is not configured for this deployed site.');
  }
  const path = input.name ? '/api/auth/register' : '/api/auth/login';
  const body = input.name
    ? { name: input.name, email: input.email, password: input.password, role: 'athlete' }
    : { email: input.email, password: input.password };
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await apiError(response));
  const token = input.name
    ? (await authenticate({ email: input.email, password: input.password }), getAccessToken())
    : (await readJson<{ access_token: string }>(response)).access_token;
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

async function apiError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const body = await response.json() as { detail?: string };
    return body.detail ?? `API ${response.status}`;
  }
  return 'The backend API did not return a JSON response. Check the API URL.';
}

async function readJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error('The backend API returned HTML instead of JSON. Check VITE_API_BASE.');
  }
  return response.json() as Promise<T>;
}

async function apiFetch<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error('API is not configured. Set VITE_API_BASE.');
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await apiError(res));
  return readJson<T>(res);
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  if (!API_BASE) throw new Error('API is not configured. Set VITE_API_BASE.');
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await apiError(res));
  return readJson<T>(res);
}

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getAthleteDashboard(): Promise<DashboardSummary> {
  return apiFetch<any>('/api/dashboard/athlete').then((data) => ({
    performanceScore: data.performance_score ?? 0,
    performanceDelta: 0,
    recoveryScore: data.recovery_score ?? 0,
    recoveryStatus: data.recovery_score == null ? 'No recovery record' : 'Recorded',
    trainingLoad: data.training_load,
    loadLevel: data.training_load >= 300 ? 'High' : data.training_load >= 240 ? 'Moderate' : 'Normal',
    riskLevel: data.risk_indicator ?? 'LOW',
    riskNote: data.risk_indicator ? 'Based on your latest assessment' : 'No risk assessment recorded',
    performanceHistory: [],
    loadHistory: data.training_history.map((item: { label: string; value: number }) => ({ ...item, intensity: 0 })),
    recoveryHistory: data.recovery_history.map((item: { date: string; score: number }) => ({ label: item.date, value: item.score })),
    movement: { depth: data.movement_quality ?? 0, kneeAlignment: data.movement_quality ?? 0, stability: data.movement_quality ?? 0, consistency: data.movement_quality ?? 0 },
    recommendation: data.recommendations[0] ?? 'Record training and recovery data to receive recommendations.',
  }));
}

export function getTrainingHistory(): Promise<TrainingLoadSummary> {
  return apiFetch<any>('/api/training/history').then((data) => ({ todayLoad: data.today_load, sevenDayLoad: data.seven_day_total, averageDailyLoad: data.seven_day_average, previousAverage: data.recent_baseline, currentAverage: data.seven_day_average, changePercent: data.workload_change_percentage, loadLevel: data.today_load >= 300 ? 'High' : data.today_load >= 240 ? 'Moderate' : 'Normal', increasedSignificantly: data.workload_change_percentage >= 15, note: 'Calculated from your recorded workouts.', history: data.history.map((item: { label: string; value: number }) => ({ ...item, intensity: 0 })) }));
}

export function getRecoveryData(): Promise<RecoveryCheckin[]> {
  return apiFetch<any[]>('/api/recovery/history').then((rows) => rows.map((row: { id: number; created_at: string; sleep_hours: number; fatigue: number; soreness: number; stress: number; rest_days: number; training_intensity: number }) => ({ id: String(row.id), date: row.created_at, sleep: row.sleep_hours, fatigue: row.fatigue, soreness: row.soreness, stress: row.stress, restDays: row.rest_days, trainingIntensity: row.training_intensity })));
}

export function saveRecoveryCheckin(
  input: Omit<RecoveryCheckin, 'id' | 'date'>
): Promise<RecoveryResult> {
  const result = calculateRecoveryScore({
    sleep: input.sleep,
    fatigue: input.fatigue,
    soreness: input.soreness,
    stress: input.stress,
    restDays: input.restDays,
    trainingIntensity: input.trainingIntensity,
  });
  return apiPost<RecoveryResult>('/api/recovery', { sleep_hours: input.sleep, fatigue: input.fatigue, soreness: input.soreness, stress: input.stress, rest_days: input.restDays, training_intensity: input.trainingIntensity });
}

export function saveWorkoutSession(
  input: Omit<WorkoutSession, 'id' | 'load'> & { date: string }
): Promise<WorkoutSession> {
  const session: WorkoutSession = {
    ...input,
    id: `w-${Date.now()}`,
    date: new Date(input.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    }),
    load: input.duration * input.intensity,
  };
  return apiPost('/api/workouts', { exercise: input.exercise, duration_minutes: input.duration, intensity: input.intensity, repetitions: 0 }).then(() => session);
}

export function getTeamAthletes(): Promise<TeamSummary> {
  return apiFetch<any[]>('/api/coach/athletes').then((athletes) => ({ totalAthletes: athletes.length, lowCount: athletes.filter((a: { risk: string }) => a.risk === 'LOW').length, moderateCount: athletes.filter((a: { risk: string }) => a.risk === 'MODERATE').length, needsAttentionCount: athletes.filter((a: { risk: string }) => a.risk === 'HIGH').length, athletes: athletes.map((a: { id: number; name: string; sport: string; performance: number | null; recovery: number | null; training_load: number; risk: string }) => ({ id: String(a.id), name: a.name, age: 0, sport: a.sport as Sport, position: '', team: '', performanceScore: a.performance ?? 0, recoveryScore: a.recovery ?? 0, trainingLoad: a.training_load, loadLevel: 'Normal', movementQuality: 0, riskLevel: (a.risk ?? 'LOW') as RiskLevel, riskReasons: [], riskRecommendation: '', recommendation: '', movement: { depth: 0, kneeAlignment: 0, stability: 0, consistency: 0 }, performanceHistory: [], recoveryHistory: [], loadHistory: [], recentSessions: [], riskHistory: [] })) }));
}

export function getAthleteById(id: string): Promise<Athlete> {
  return apiFetch<any>(`/api/athletes/${id}`).then((a) => ({ ...a, id: String(a.id), performanceScore: 0, recoveryScore: 0, trainingLoad: 0, loadLevel: 'Normal', movementQuality: 0, riskLevel: 'LOW', riskReasons: [], riskRecommendation: '', recommendation: '', movement: { depth: 0, kneeAlignment: 0, stability: 0, consistency: 0 }, performanceHistory: [], recoveryHistory: [], loadHistory: [], recentSessions: [], riskHistory: [] }));
}

export function getMyAthlete(): Promise<Athlete> {
  return apiFetch<any>('/api/athletes/me').then((a) => ({ ...a, id: String(a.id), performanceScore: 0, recoveryScore: 0, trainingLoad: 0, loadLevel: 'Normal', movementQuality: 0, riskLevel: 'LOW', riskReasons: [], riskRecommendation: '', recommendation: '', movement: { depth: 0, kneeAlignment: 0, stability: 0, consistency: 0 }, performanceHistory: [], recoveryHistory: [], loadHistory: [], recentSessions: [], riskHistory: [] }));
}

export function updateAthlete(id: string, input: { sport: string; position: string; age: number | null; height: number | null; team: string }): Promise<Athlete> {
  return fetch(`${API_BASE}/api/athletes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(input) }).then(async (response) => {
    if (!response.ok) throw new Error(await apiError(response));
    return readJson<Athlete>(response);
  });
}
