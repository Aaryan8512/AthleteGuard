import * as React from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  initializePoseDetector,
  resetRepCount,
  analyzeVideoFrame,
} from '@/services/poseAnalysis';
import type { ExerciseType, MovementAnalysis, MovementPhase } from '@/types';
import { SectionCard } from '@/components/shared/SectionCard';
import { FormPill } from '@/components/shared/StatusPills';
import { EmptyState } from '@/components/shared/States';
import {
  Video,
  VideoOff,
  Play,
  Square,
  Camera,
  AlertTriangle,
  Activity,
  Footprints,
  HeartPulse,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const EXERCISES: ExerciseType[] = ['Squat', 'Lunge', 'Push-up'];

const phaseOrder: MovementPhase[] = [
  'STANDING',
  'DESCENDING',
  'BOTTOM',
  'ASCENDING',
];

function PhaseIndicator({ phase }: { phase: MovementPhase }) {
  return (
    <div className="flex items-center gap-1.5">
      {phaseOrder.map((p) => {
        const active = p === phase;
        const passed = phaseOrder.indexOf(phase) > phaseOrder.indexOf(p);
        return (
          <React.Fragment key={p}>
            <span
              className={cn(
                'rounded-md px-2 py-1 text-[10px] font-semibold transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : passed
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {p}
            </span>
            {p !== 'ASCENDING' && (
              <span className="text-muted-foreground">→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function MetricTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-secondary/40 p-4 text-center',
        accent && 'border-primary/30 bg-primary/5'
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-2xl font-bold',
          accent ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function LiveAnalysisPage() {
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraOn, setCameraOn] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [exercise, setExercise] = React.useState<ExerciseType>('Squat');
  const [analysis, setAnalysis] = React.useState<MovementAnalysis | null>(null);
  const [starting, setStarting] = React.useState(false);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setAnalyzing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    resetRepCount();
  }, []);

  const startCamera = React.useCallback(async () => {
    setStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API is unavailable. Use a secure browser context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      try {
        await initializePoseDetector();
      } catch {
        toast({
          title: 'Camera started, AI model unavailable',
          description:
            'The camera works, but the pose model could not load. Check your internet connection and reload.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Camera started',
        description: 'Select an exercise and start analysis.',
      });
    } catch (error) {
      const reason = error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Allow camera permission in your browser, then try again.'
        : error instanceof DOMException && error.name === 'NotFoundError'
        ? 'No camera was found on this device.'
        : error instanceof Error
        ? error.message
        : 'Check camera permissions and try again.';
      toast({
        title: 'Unable to start camera',
        description: reason,
        variant: 'destructive',
      });
    } finally {
      setStarting(false);
    }
  }, [toast]);

  const startAnalysis = React.useCallback(() => {
    if (!cameraOn) {
      toast({
        title: 'Start the camera first',
        description: 'Camera must be on before analysis.',
        variant: 'destructive',
      });
      return;
    }
    resetRepCount();
    setAnalyzing(true);
    toast({ title: 'AI analysis started', description: `Analyzing ${exercise}.` });
    intervalRef.current = setInterval(() => {
      const frame = videoRef.current
        ? analyzeVideoFrame(videoRef.current, exercise)
        : null;
      if (frame) setAnalysis(frame);
    }, 100);
  }, [cameraOn, exercise, toast]);

  const stopAnalysis = React.useCallback(() => {
    setAnalyzing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    toast({ title: 'Analysis stopped', description: 'Metrics frozen.' });
  }, [toast]);

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const a = analysis;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Live Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            AI movement analysis · MediaPipe
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Camera panel */}
        <div className="lg:col-span-2">
          <SectionCard
            title="AI Movement Analysis"
            subtitle={
              cameraOn
                ? 'MediaPipe Pose Landmarker · Live inference'
                : 'Start the camera for live pose inference'
            }
            icon={<Video className="h-4 w-4" />}
            action={
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold',
                  cameraOn
                    ? 'border-success/30 bg-success/10 text-success'
                    : 'border-border bg-secondary text-muted-foreground'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    cameraOn ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                  )}
                />
                {cameraOn ? 'CAMERA LIVE' : 'CAMERA OFF'}
              </span>
            }
          >
            {/* Video viewport */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
              {/* Scanline overlay always present for the "AI" feel */}
              {analyzing && (
                <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-primary/70 blur-[1px] animate-scan-line" />
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  {/* Corner brackets */}
                  <div className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-primary/60" />
                  <div className="absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-primary/60" />
                  <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-primary/60" />
                  <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-primary/60" />
                </div>
              )}

              <video
                ref={videoRef}
                muted
                playsInline
                className={cn(
                  'h-full w-full object-cover transition-opacity',
                  cameraOn ? 'opacity-100' : 'opacity-0'
                )}
              />

              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/60 text-muted-foreground">
                    <VideoOff className="h-8 w-8" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Camera is off
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Start the camera to begin pose analysis.
                    </p>
                  </div>
                </div>
              )}

              {/* Overlay HUD */}
              {cameraOn && (
                <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4">
                  <div className="flex items-start justify-between text-xs">
                    <span className="rounded bg-black/60 px-2 py-1 font-semibold text-primary backdrop-blur">
                      AI MOVEMENT ANALYSIS
                    </span>
                    <span className="rounded bg-black/60 px-2 py-1 font-medium text-foreground backdrop-blur">
                      {exercise}
                    </span>
                  </div>
                  {analyzing && a && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="rounded bg-black/60 px-2 py-1 text-center backdrop-blur">
                        <span className="block text-[9px] text-muted-foreground">
                          REPS
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {a.reps}
                        </span>
                      </span>
                      <span className="rounded bg-black/60 px-2 py-1 text-center backdrop-blur">
                        <span className="block text-[9px] text-muted-foreground">
                          QUALITY
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {a.movementQuality}%
                        </span>
                      </span>
                      <span className="rounded bg-black/60 px-2 py-1 text-center backdrop-blur">
                        <span className="block text-[9px] text-muted-foreground">
                          FORM
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {a.formStatus}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 gap-2">
                {!cameraOn ? (
                  <Button
                    onClick={startCamera}
                    disabled={starting}
                    className="gap-1.5"
                  >
                    <Camera className="h-4 w-4" />
                    {starting ? 'Starting…' : 'Start Camera'}
                  </Button>
                ) : (
                  <Button
                    onClick={stopCamera}
                    variant="outline"
                    className="gap-1.5"
                  >
                    <VideoOff className="h-4 w-4" />
                    Stop Camera
                  </Button>
                )}

                <div className="w-44">
                  <Select
                    value={exercise}
                    onValueChange={(v) => setExercise(v as ExerciseType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXERCISES.map((ex) => (
                        <SelectItem key={ex} value={ex}>
                          {ex}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                {!analyzing ? (
                  <>
                    <Button
                      onClick={startAnalysis}
                      disabled={!cameraOn}
                      className="gap-1.5"
                    >
                      <Play className="h-4 w-4" />
                      Start Analysis
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={stopAnalysis}
                    variant="destructive"
                    className="gap-1.5"
                  >
                    <Square className="h-4 w-4" />
                    Stop Analysis
                  </Button>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Live metrics panel */}
        <div className="space-y-4">
          <SectionCard
            title="Live Metrics"
            subtitle="Real-time movement data"
            icon={<Activity className="h-4 w-4" />}
          >
            {!a ? (
              <EmptyState
                title="No analysis yet"
                description="Start an analysis to see live metrics."
                icon={<Footprints className="h-6 w-6" />}
                className="py-10"
              />
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <MetricTile label="Reps" value={a.reps} accent />
                  <MetricTile
                    label="Movement Quality"
                    value={`${a.movementQuality}%`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MetricTile label="Form" value={<FormPill status={a.formStatus} />} />
                  <MetricTile label="Exercise" value={a.exercise} />
                </div>

                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Movement Phase
                  </p>
                  <PhaseIndicator phase={a.phase} />
                </div>

                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Quality Breakdown
                  </p>
                  <div className="space-y-2 text-xs">
                    {[
                      ['Depth', a.breakdown.depth],
                      ['Knee Alignment', a.breakdown.kneeAlignment],
                      ['Stability', a.breakdown.stability],
                      ['Consistency', a.breakdown.consistency],
                    ].map(([label, val]) => (
                      <div
                        key={label as string}
                        className="flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold text-foreground">
                          {val}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Form warnings */}
          <SectionCard
            title="Form Feedback"
            subtitle="Real-time coaching cues"
            icon={<AlertTriangle className="h-4 w-4" />}
          >
            {!a ? (
              <p className="text-xs text-muted-foreground">
                Feedback appears during analysis.
              </p>
            ) : a.warnings.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-xs font-medium text-success">
                <HeartPulse className="h-4 w-4" />
                Form looks good — keep going.
              </div>
            ) : (
              <ul className="space-y-2">
                {a.warnings.map((w) => (
                  <li
                    key={w}
                    className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-2.5 text-xs font-medium text-warning"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[10px] text-muted-foreground">
              These cues are informational coaching hints, not medical advice.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
