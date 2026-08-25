// ===== AthleteGuard Data Models =====
// These interfaces describe the shape of data across the app.
// The service layer (/services/api.ts) returns these types,
// and a future FastAPI backend should match them.

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'ATTENTION';

export type RecoveryStatus = 'GOOD' | 'MODERATE' | 'LOW';

export type MovementPhase =
  | 'STANDING'
  | 'DESCENDING'
  | 'BOTTOM'
  | 'ASCENDING';

export type ExerciseType = 'Squat' | 'Lunge' | 'Push-up';

export type FormStatus = 'GOOD' | 'FAIR' | 'POOR';

export type Sport =
  | 'Cricket'
  | 'Football'
  | 'Badminton'
  | 'Basketball'
  | 'Hockey'
  | 'Athletics';

export type LoadLevel = 'Low' | 'Normal' | 'Moderate' | 'High';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'athlete' | 'coach';
  avatarUrl?: string;
}

export interface Athlete {
  id: string;
  name: string;
  age: number;
  sport: Sport;
  position: string;
  team: string;
  height?: number | null;
  avatarUrl?: string;
  performanceScore: number; // 0-100
  recoveryScore: number; // 0-100
  trainingLoad: number; // load units
  loadLevel: LoadLevel;
  movementQuality: number; // 0-100
  riskLevel: RiskLevel;
  riskReasons: string[];
  riskRecommendation: string;
  recommendation: string;
  movement: MovementBreakdown;
  performanceHistory: TrendPoint[];
  recoveryHistory: TrendPoint[];
  loadHistory: LoadPoint[];
  recentSessions: SessionRecord[];
  riskHistory: RiskHistoryPoint[];
}

export interface MovementBreakdown {
  depth: number; // %
  kneeAlignment: number; // %
  stability: number; // %
  consistency: number; // %
}

export interface TrendPoint {
  label: string; // e.g. "S1" or "Mon"
  value: number;
}

export interface LoadPoint {
  label: string; // day
  value: number; // load units
  intensity: number; // 1-10
}

export interface SessionRecord {
  id: string;
  date: string;
  exercise: string;
  duration: number; // minutes
  intensity: number; // 1-10
  load: number;
  movementQuality: number;
  reps: number;
}

export interface RecoveryCheckin {
  id: string;
  date: string;
  sleep: number; // hours 0-14
  fatigue: number; // 1-10
  soreness: number; // 1-10
  stress: number; // 1-10
  restDays: number;
  trainingIntensity: number; // 1-10
}

export interface RecoveryResult {
  score: number; // 0-100
  status: RecoveryStatus;
  factors: RecoveryFactor[];
  notes: string;
}

export interface RecoveryFactor {
  name: string;
  score: number; // 0-100
  weight: number; // %
}

export interface RecoveryInput {
  sleep: number;
  fatigue: number;
  soreness: number;
  stress: number;
  restDays: number;
  trainingIntensity: number;
}

export interface MovementAnalysis {
  exercise: ExerciseType;
  reps: number;
  movementQuality: number; // 0-100
  formStatus: FormStatus;
  phase: MovementPhase;
  breakdown: MovementBreakdown;
  warnings: string[];
  isDemo: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercise: string;
  duration: number; // minutes
  intensity: number; // 1-10
  load: number; // duration * intensity
}

export interface TrainingLoadSummary {
  todayLoad: number;
  sevenDayLoad: number;
  averageDailyLoad: number;
  previousAverage: number;
  currentAverage: number;
  changePercent: number;
  loadLevel: LoadLevel;
  increasedSignificantly: boolean;
  note: string;
  history: LoadPoint[];
}

export interface RiskIndicator {
  level: RiskLevel;
  reasons: string[];
  recommendation: string;
}

export interface RiskHistoryPoint {
  label: string;
  level: RiskLevel;
}

export interface DashboardSummary {
  performanceScore: number;
  performanceDelta: number;
  recoveryScore: number;
  recoveryStatus: string;
  trainingLoad: number;
  loadLevel: LoadLevel;
  riskLevel: RiskLevel;
  riskNote: string;
  performanceHistory: TrendPoint[];
  loadHistory: LoadPoint[];
  recoveryHistory: TrendPoint[];
  movement: MovementBreakdown;
  recommendation: string;
}

export interface TeamSummary {
  totalAthletes: number;
  lowCount: number;
  moderateCount: number;
  needsAttentionCount: number;
  athletes: Athlete[];
}
