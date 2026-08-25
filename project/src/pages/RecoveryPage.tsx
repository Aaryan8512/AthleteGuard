import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { saveRecoveryCheckin } from '@/services/api';
import { RECOVERY_WEIGHTS } from '@/services/recoveryEngine';
import type { RecoveryResult, RecoveryInput } from '@/types';
import { SectionCard } from '@/components/shared/SectionCard';
import { RecoveryPill } from '@/components/shared/StatusPills';
import { RecoveryRadarChart } from '@/components/shared/Charts';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Moon,
  BatteryLow,
  Bone,
  Brain,
  CalendarOff,
  Flame,
  Calculator,
  HeartPulse,
  Info,
} from 'lucide-react';

interface FieldDef {
  key: keyof RecoveryInput;
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint: string;
}

const FIELDS: FieldDef[] = [
  { key: 'sleep', label: 'Sleep', icon: <Moon className="h-4 w-4" />, min: 0, max: 14, step: 0.5, unit: 'hrs', hint: 'Last night' },
  { key: 'fatigue', label: 'Fatigue', icon: <BatteryLow className="h-4 w-4" />, min: 1, max: 10, step: 1, unit: '/10', hint: '1 = fresh, 10 = exhausted' },
  { key: 'soreness', label: 'Muscle Soreness', icon: <Bone className="h-4 w-4" />, min: 1, max: 10, step: 1, unit: '/10', hint: '1 = none, 10 = severe' },
  { key: 'stress', label: 'Stress', icon: <Brain className="h-4 w-4" />, min: 1, max: 10, step: 1, unit: '/10', hint: '1 = calm, 10 = high' },
  { key: 'restDays', label: 'Rest Days', icon: <CalendarOff className="h-4 w-4" />, min: 0, max: 7, step: 1, unit: 'days', hint: 'Since last hard session' },
  { key: 'trainingIntensity', label: 'Training Intensity', icon: <Flame className="h-4 w-4" />, min: 1, max: 10, step: 1, unit: '/10', hint: 'Recent session intensity' },
];

function Field({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            {def.icon}
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">{def.label}</p>
            <p className="text-[10px] text-muted-foreground">{def.hint}</p>
          </div>
        </div>
        <span className="rounded-md bg-primary/10 px-2 py-1 text-sm font-bold text-primary tabular-nums">
          {value}
          <span className="ml-0.5 text-[10px] font-medium">{def.unit}</span>
        </span>
      </div>
      <Slider
        value={[value]}
        min={def.min}
        max={def.max}
        step={def.step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

export function RecoveryPage() {
  const { toast } = useToast();
  const [input, setInput] = React.useState<RecoveryInput>({
    sleep: 7,
    fatigue: 4,
    soreness: 3,
    stress: 4,
    restDays: 1,
    trainingIntensity: 8,
  });
  const [result, setResult] = React.useState<RecoveryResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  const update = (key: keyof RecoveryInput, v: number) =>
    setInput((prev) => ({ ...prev, [key]: v }));

  const calculate = () => {
    setLoading(true);
    saveRecoveryCheckin(input)
      .then((r) => {
        setResult(r);
        toast({
          title: `Recovery Score: ${r.score}/100`,
          description: r.notes,
        });
      })
      .catch(() =>
        toast({
          title: 'Calculation failed',
          description: 'Please try again.',
          variant: 'destructive',
        })
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Recovery Check-in
          </h1>
          <p className="text-sm text-muted-foreground">
            Recovery inputs and trends
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Inputs */}
        <SectionCard
          title="Today's Check-in"
          subtitle="Adjust the sliders and calculate"
          icon={<HeartPulse className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELDS.map((def) => (
              <Field
                key={def.key}
                def={def}
                value={input[def.key]}
                onChange={(v) => update(def.key, v)}
              />
            ))}
          </div>
          <Button
            onClick={calculate}
            disabled={loading}
            className="mt-4 w-full gap-2"
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculating…' : 'Calculate Recovery Score'}
          </Button>
        </SectionCard>

        {/* Result */}
        <SectionCard
          title="Recovery Score"
          subtitle="Weighted recovery model"
          icon={<HeartPulse className="h-4 w-4" />}
        >
          {!result ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Calculator className="h-7 w-7" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  No score yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Fill in the check-in and calculate your recovery score.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score ring */}
              <div className="flex items-center gap-4">
                <div
                  className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(hsl(187 92% 48%) ${result.score * 3.6}deg, hsl(222 30% 18%) 0deg)`,
                  }}
                >
                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-card">
                    <span className="text-2xl font-bold text-foreground">
                      {result.score}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>
                  <div className="mt-1">
                    <RecoveryPill status={result.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {result.notes}
                  </p>
                </div>
              </div>

              {/* Radar */}
              <div>
                <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Factor Breakdown
                </p>
                <RecoveryRadarChart data={result.factors} />
              </div>

              {/* Bars */}
              <div className="space-y-2.5">
                {result.factors.map((f) => (
                  <div key={f.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {f.name}{' '}
                        <span className="text-[10px] opacity-60">
                          ({f.weight}%)
                        </span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {f.score}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{ width: `${f.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          <span className="font-semibold text-foreground">Scoring model:</span>{' '}
          This recovery score is a transparent, rule-based wellness indicator
          using published weights (Sleep {RECOVERY_WEIGHTS.sleep * 100}%, Fatigue{' '}
          {RECOVERY_WEIGHTS.fatigue * 100}%, Soreness{' '}
          {RECOVERY_WEIGHTS.soreness * 100}%, Stress {RECOVERY_WEIGHTS.stress * 100}%, Rest{' '}
          {RECOVERY_WEIGHTS.rest * 100}%, Intensity{' '}
          {RECOVERY_WEIGHTS.intensity * 100}%). It is NOT a medically validated
          score and should not replace professional advice.
        </p>
      </div>
    </div>
  );
}
