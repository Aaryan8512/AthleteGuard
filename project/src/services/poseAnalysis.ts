import type {
  MovementAnalysis,
  MovementPhase,
  MovementBreakdown,
  ExerciseType,
  FormStatus,
} from '@/types';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { riskFromMovement } from './riskEngine';

// ===== MediaPipe Pose Landmarker Integration Layer =====
//
// This module is the seam where real pose estimation will plug in.
// Today every function returns simulated/demo values so the UI can run
// end-to-end. When MediaPipe Pose Landmarker is added, replace the bodies
// of these functions with the real pipeline:
//
//   Camera
//     -> MediaPipe Pose Landmarker
//     -> Body landmarks (33 keypoints)
//     -> Joint angles (hip, knee, ankle, shoulder, elbow)
//     -> Movement phase (standing / descending / bottom / ascending)
//     -> Rep detection (phase cycle counting)
//     -> Movement quality (angle thresholds + consistency)
//     -> Training / recovery context
//     -> Explainable risk indicator
//
// Recommended integration:
//   npm install @mediapipe/tasks-vision
//   import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
//   initializePoseDetector() should create a PoseLandmarker via
//   FilesetResolver.forVisionTasks(...) and store it in module scope.
//
// The functions below keep stable signatures so the UI layer does not
// change when the real implementation arrives.

const WASM_PATH =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// --- Detector state ------------------------------------------------------
let poseLandmarker: PoseLandmarker | null = null;
let detectorReady = false;
let currentPhase: MovementPhase = 'STANDING';
let phaseProgress = 0;
let repCount = 0;
let breakdownSeed = 0;
let previousAngle = 180;
let hasReachedBottom = false;

// --- Public API ----------------------------------------------------------

/**
 * Initialize the pose detector.
 * Create the browser landmarker and load the lightweight model.
 */
export async function initializePoseDetector(): Promise<boolean> {
  if (poseLandmarker) return true;

  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
  const options = {
    runningMode: 'VIDEO' as const,
    numPoses: 1,
    minPoseDetectionConfidence: 0.55,
    minPosePresenceConfidence: 0.55,
    minTrackingConfidence: 0.5,
  };
  try {
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
    });
  } catch {
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'CPU' },
    });
  }
  detectorReady = true;
  return true;
}

export function isDetectorReady(): boolean {
  return detectorReady;
}

/**
 * Calculate the angle at joint `b` given three 2D landmarks a-b-c.
 * TODO(MediaPipe): use real landmark coordinates from the landmarker.
 */
export function calculateJointAngle(
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): number {
  const radians =
    Math.atan2(cy - by, cx - bx) - Math.atan2(ay - by, ax - bx);
  let degrees = Math.abs((radians * 180) / Math.PI);
  if (degrees > 180) degrees = 360 - degrees;
  return degrees;
}

/**
 * Advance and return the current squat phase using a simulated cycle.
 * TODO(MediaPipe): derive phase from knee & hip angles:
 *   - STANDING: knee angle > 160
 *   - DESCENDING: knee angle decreasing
 *   - BOTTOM: knee angle < 100
 *   - ASCENDING: knee angle increasing
 */
export function detectSquatPhase(): MovementPhase {
  phaseProgress += 0.25 + Math.random() * 0.15;
  if (phaseProgress >= 4) {
    phaseProgress = 0;
    currentPhase = 'STANDING';
  } else if (phaseProgress < 1) {
    currentPhase = 'STANDING';
  } else if (phaseProgress < 2) {
    currentPhase = 'DESCENDING';
  } else if (phaseProgress < 3) {
    currentPhase = 'BOTTOM';
  } else {
    currentPhase = 'ASCENDING';
  }
  return currentPhase;
}

/**
 * Count a repetition when a full STANDING→DESCENDING→BOTTOM→ASCENDING→STANDING
 * cycle completes.
 * TODO(MediaPipe): increment when phase transitions from ASCENDING back to
 * STANDING with a stable knee angle.
 */
export function countRepetition(): boolean {
  if (currentPhase === 'STANDING' && phaseProgress < 0.1 && repCount > 0) {
    repCount += 1;
    return true;
  }
  if (repCount === 0 && phaseProgress >= 3.9) {
    repCount = 1;
    return true;
  }
  return false;
}

export function resetRepCount(): void {
  repCount = 0;
  phaseProgress = 0;
  currentPhase = 'STANDING';
  breakdownSeed = 0;
  previousAngle = 180;
  hasReachedBottom = false;
}

export function getRepCount(): number {
  return repCount;
}

/** Analyze one video frame using the loaded Pose Landmarker. */
export function analyzeVideoFrame(
  video: HTMLVideoElement,
  exercise: ExerciseType
): MovementAnalysis | null {
  if (!poseLandmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return null;
  }

  const result = poseLandmarker.detectForVideo(video, performance.now());
  const landmarks = result.landmarks[0];
  if (!landmarks) return null;

  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const knee = landmarks[25];
  const ankle = landmarks[27];
  const shoulder = landmarks[11];
  const elbow = landmarks[13];
  const wrist = landmarks[15];
  const usingUpperBody = exercise === 'Push-up';
  const angle = usingUpperBody
    ? calculateJointAngle(
        shoulder.x,
        shoulder.y,
        elbow.x,
        elbow.y,
        wrist.x,
        wrist.y
      )
    : calculateJointAngle(
        leftHip.x,
        leftHip.y,
        knee.x,
        knee.y,
        ankle.x,
        ankle.y
      );
  const phase = phaseFromAngle(angle, usingUpperBody);
  const depth = usingUpperBody
    ? clamp(100 - angle * 0.45)
    : clamp((180 - angle) * 1.25);
  const visibility = [leftHip, rightHip, knee, ankle, shoulder, elbow, wrist].reduce(
    (sum, point) => sum + (point.visibility ?? 1),
    0
  ) / 7;
  const breakdown: MovementBreakdown = {
    depth,
    kneeAlignment: clamp(100 - Math.abs(leftHip.x - rightHip.x) * 180),
    stability: clamp(visibility * 100),
    consistency: clamp(100 - Math.abs(angle - previousAngle) * 1.5),
  };

  if (phase === 'BOTTOM') hasReachedBottom = true;
  if (hasReachedBottom && phase === 'STANDING' && previousAngle < 155) {
    repCount += 1;
    hasReachedBottom = false;
  }
  previousAngle = angle;
  currentPhase = phase;

  const { quality, warnings } = riskFromMovement(breakdown);
  return {
    exercise,
    reps: repCount,
    movementQuality: quality,
    formStatus: formFromQuality(quality),
    phase,
    breakdown,
    warnings,
    isDemo: false,
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function phaseFromAngle(angle: number, upperBody: boolean): MovementPhase {
  const bottomThreshold = upperBody ? 95 : 100;
  const standingThreshold = upperBody ? 155 : 160;
  return angle < bottomThreshold
    ? 'BOTTOM'
    : angle > standingThreshold
    ? 'STANDING'
    : angle < previousAngle
    ? 'DESCENDING'
    : 'ASCENDING';
}

function jitter(base: number, range = 6): number {
  const v = base + (Math.random() - 0.5) * range;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Calculate movement quality breakdown for the current exercise.
 * TODO(MediaPipe): derive from joint-angle variance, depth, and alignment
 * across the rep window.
 */
export function calculateMovementQuality(): MovementBreakdown {
  breakdownSeed += 1;
  const drift = Math.min(breakdownSeed * 0.2, 6);
  return {
    depth: jitter(88 - drift * 0.5, 4),
    kneeAlignment: jitter(84 - drift * 0.7, 5),
    stability: jitter(79 - drift * 0.4, 5),
    consistency: jitter(91 - drift * 0.3, 3),
  };
}

function formFromQuality(quality: number): FormStatus {
  if (quality >= 85) return 'GOOD';
  if (quality >= 75) return 'FAIR';
  return 'POOR';
}

/**
 * Produce a full MovementAnalysis snapshot for the UI.
 * Marked `isDemo: true` until MediaPipe is wired in.
 */
export function buildAnalysisSnapshot(
  exercise: ExerciseType
): MovementAnalysis {
  const phase = detectSquatPhase();
  countRepetition();
  const breakdown = calculateMovementQuality();
  const { quality, warnings } = riskFromMovement(breakdown);

  return {
    exercise,
    reps: getRepCount(),
    movementQuality: quality,
    formStatus: formFromQuality(quality),
    phase,
    breakdown,
    warnings,
    isDemo: true,
  };
}
