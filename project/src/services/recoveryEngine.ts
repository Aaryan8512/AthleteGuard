import type {
  RecoveryInput,
  RecoveryResult,
  RecoveryFactor,
  RecoveryStatus,
} from '@/types';

// ===== Recovery Scoring Engine =====
// Transparent, rule-based wellness score — NOT a medically validated model.
// Weights are deliberately published so athletes can see how each factor
// contributes to the overall score.

const WEIGHTS = {
  sleep: 0.3,
  fatigue: 0.2,
  soreness: 0.15,
  stress: 0.1,
  rest: 0.1,
  intensity: 0.15,
} as const;

const clamp = (v: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));

function sleepScore(sleep: number): number {
  return clamp((sleep / 8) * 100);
}

function fatigueScore(fatigue: number): number {
  return clamp(((10 - fatigue) / 9) * 100);
}

function sorenessScore(soreness: number): number {
  return clamp(((10 - soreness) / 9) * 100);
}

function stressScore(stress: number): number {
  return clamp(((10 - stress) / 9) * 100);
}

// Rest days normalize on a capped scale: ~2 full rest days = optimal (100),
// declining both when under-recovered (0) and when over-rested (>3).
function restScore(restDays: number): number {
  if (restDays <= 0) return 30;
  if (restDays === 1) return 70;
  if (restDays === 2) return 100;
  if (restDays === 3) return 90;
  return clamp(90 - (restDays - 3) * 10);
}

// Higher recent training intensity reduces recovery availability.
function intensityScore(intensity: number): number {
  return clamp(((10 - intensity) / 9) * 100);
}

function statusFor(score: number): RecoveryStatus {
  if (score >= 75) return 'GOOD';
  if (score >= 55) return 'MODERATE';
  return 'LOW';
}

export function calculateRecoveryScore(input: RecoveryInput): RecoveryResult {
  const factors: RecoveryFactor[] = [
    { name: 'Sleep', score: Math.round(sleepScore(input.sleep)), weight: WEIGHTS.sleep * 100 },
    { name: 'Fatigue', score: Math.round(fatigueScore(input.fatigue)), weight: WEIGHTS.fatigue * 100 },
    { name: 'Soreness', score: Math.round(sorenessScore(input.soreness)), weight: WEIGHTS.soreness * 100 },
    { name: 'Stress', score: Math.round(stressScore(input.stress)), weight: WEIGHTS.stress * 100 },
    { name: 'Rest', score: Math.round(restScore(input.restDays)), weight: WEIGHTS.rest * 100 },
    { name: 'Intensity', score: Math.round(intensityScore(input.trainingIntensity)), weight: WEIGHTS.intensity * 100 },
  ];

  const score = clamp(
    Math.round(
      factors.reduce((acc, f) => acc + f.score * (f.weight / 100), 0)
    )
  );

  const status = statusFor(score);

  const weakest = [...factors].sort((a, b) => a.score - b.score)[0];
  const notes =
    status === 'GOOD'
      ? 'Recovery indicators look positive. Maintain your current routine.'
      : status === 'MODERATE'
      ? `Recovery is adequate but ${weakest.name.toLowerCase()} is pulling the score down.`
      : `Recovery is below target — prioritize rest and address ${weakest.name.toLowerCase()}.`;

  return { score, status, factors, notes };
}

export const RECOVERY_WEIGHTS = WEIGHTS;
