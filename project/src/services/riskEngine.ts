import type {
  RiskLevel,
  RiskIndicator,
  MovementBreakdown,
} from '@/types';

// ===== Explainable Risk Indicator Engine =====
// A transparent, rule-based engine. It combines movement quality,
// training load, recovery and recent workload change into a LOW / MODERATE /
// HIGH (or ATTENTION) indicator with human-readable reasons.
//
// This is NOT a medical injury prediction. It surfaces observable patterns
// so athletes and coaches can have an informed conversation.

interface RiskInput {
  movementQuality: number; // 0-100
  consistency: number; // 0-100
  recoveryScore: number; // 0-100
  previousRecovery?: number; // 0-100
  loadChangePercent: number; // e.g. 28 = +28%
  loadLevel: 'Low' | 'Normal' | 'Moderate' | 'High';
  movementDropPercent?: number; // e.g. -9
}

export function calculateRiskIndicator(input: RiskInput): RiskIndicator {
  const reasons: string[] = [];
  let score = 0; // higher = more risk

  // Recovery component
  if (input.recoveryScore < 50) {
    score += 3;
    reasons.push(`Recovery score is low (${input.recoveryScore}/100)`);
  } else if (input.recoveryScore < 65) {
    score += 2;
    reasons.push(`Recovery score is reduced (${input.recoveryScore}/100)`);
  }

  if (
    input.previousRecovery !== undefined &&
    input.recoveryScore < input.previousRecovery - 15
  ) {
    score += 1;
    reasons.push(
      `Recovery score dropped from ${input.previousRecovery} → ${input.recoveryScore}`
    );
  }

  // Workload component
  if (input.loadChangePercent >= 25) {
    score += 3;
    reasons.push(`Training load increased ${Math.round(input.loadChangePercent)}%`);
  } else if (input.loadChangePercent >= 15) {
    score += 2;
    reasons.push(`Training load increased ${Math.round(input.loadChangePercent)}%`);
  }

  if (input.loadLevel === 'High') {
    score += 1;
    reasons.push('Current training load is high');
  }

  // Movement quality component
  if (input.movementQuality < 70) {
    score += 3;
    reasons.push(`Movement quality is reduced (${input.movementQuality}/100)`);
  } else if (input.movementQuality < 80) {
    score += 1;
    reasons.push(`Movement quality is slightly below baseline (${input.movementQuality}/100)`);
  }

  if (input.movementDropPercent && input.movementDropPercent <= -8) {
    score += 1;
    reasons.push(
      `Movement consistency decreased ${Math.abs(Math.round(input.movementDropPercent))}%`
    );
  }

  // Consistency component
  if (input.consistency < 75) {
    score += 1;
    reasons.push(`Movement consistency is below baseline (${input.consistency}%)`);
  }

  let level: RiskLevel;
  if (score >= 6) {
    level = 'ATTENTION';
  } else if (score >= 4) {
    level = 'HIGH';
  } else if (score >= 2) {
    level = 'MODERATE';
  } else {
    level = 'LOW';
  }

  if (reasons.length === 0) {
    reasons.push('Movement, training load and recovery indicators are stable.');
  }

  const recommendation =
    level === 'LOW'
      ? 'Maintain your current workload and prioritize recovery before the next high-intensity session.'
      : level === 'MODERATE'
      ? 'Consider discussing workload adjustment with your coach and focus on recovery this week.'
      : level === 'HIGH'
      ? 'Reduce training intensity, prioritize recovery, and review movement technique with your coach.'
      : 'Pause high-intensity training, consult your coach, and address recovery before the next session.';

  return { level, reasons, recommendation };
}

export function riskFromMovement(movement: MovementBreakdown): {
  quality: number;
  warnings: string[];
} {
  const quality = Math.round(
    (movement.depth +
      movement.kneeAlignment +
      movement.stability +
      movement.consistency) /
      4
  );
  const warnings: string[] = [];
  if (movement.kneeAlignment < 80) warnings.push('Check knee alignment');
  if (movement.stability < 80) warnings.push('Improve movement stability');
  if (movement.depth < 80) warnings.push('Maintain consistent depth');
  return { quality, warnings };
}
