import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { getTrainingHistory, saveWorkoutSession } from '@/services/api';
import type { TrainingLoadSummary } from '@/types';
import { KpiCard } from '@/components/shared/KpiCard';
import { SectionCard } from '@/components/shared/SectionCard';
import { LoadBarChart } from '@/components/shared/Charts';
import { LoadingState, ErrorState } from '@/components/shared/States';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dumbbell,
  Clock,
  Flame,
  TrendingUp,
  AlertTriangle,
  Plus,
  Calendar,
} from 'lucide-react';

const EXERCISES = [
  'Squat Set',
  'Lunge Set',
  'Push-up Set',
  'Sprint Drill',
  'Agility',
  'Plyometrics',
  'Match Sim',
  'Mobility',
  'Recovery Run',
];

export function TrainingLoadPage() {
  const { toast } = useToast();
  const [summary, setSummary] = React.useState<TrainingLoadSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [form, setForm] = React.useState({
    exercise: 'Squat Set',
    duration: 35,
    intensity: 8,
    date: new Date().toISOString().slice(0, 10),
  });

  const load = React.useCallback(() => {
    setLoading(true);
    setError(false);
    getTrainingHistory()
      .then(setSummary)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleSave = () => {
    if (!form.exercise) {
      toast({ title: 'Select an exercise', variant: 'destructive' });
      return;
    }
    if (form.duration <= 0 || form.duration > 240) {
      toast({
        title: 'Enter a valid duration',
        description: '1–240 minutes.',
        variant: 'destructive',
      });
      return;
    }
    if (form.intensity < 1 || form.intensity > 10) {
      toast({
        title: 'Intensity must be 1–10',
        variant: 'destructive',
      });
      return;
    }
    setSaving(true);
    saveWorkoutSession({
      exercise: form.exercise,
      duration: form.duration,
      intensity: form.intensity,
      date: form.date,
    })
      .then((s) => {
        toast({
          title: 'Session saved',
          description: `${s.exercise} · ${s.load} load units logged.`,
        });
        load();
      })
      .catch(() =>
        toast({
          title: 'Could not save session',
          variant: 'destructive',
        })
      )
      .finally(() => setSaving(false));
  };

  if (loading) return <LoadingState label="Loading training load…" />;
  if (error || !summary)
    return <ErrorState message="Training data unavailable." onRetry={load} />;

  const changeUp = summary.changePercent >= 15;
  const changeColor =
    summary.changePercent > 0 ? 'text-warning' : 'text-success';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Training Load
          </h1>
          <p className="text-sm text-muted-foreground">
            Workload tracking and trend analysis
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Today's Load"
          value={summary.todayLoad}
          unit="units"
          icon={<Dumbbell className="h-4 w-4" />}
        />
        <KpiCard
          label="7-Day Load"
          value={summary.sevenDayLoad.toLocaleString()}
          unit="units"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="Average Daily Load"
          value={summary.averageDailyLoad}
          unit="units"
          icon={<Clock className="h-4 w-4" />}
        />
        <KpiCard
          label="Workload Change"
          value={`${summary.changePercent > 0 ? '+' : ''}${summary.changePercent}%`}
          deltaLabel={`${summary.previousAverage} → ${summary.currentAverage}`}
          status={changeUp ? 'warn' : 'neutral'}
          icon={<Flame className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart */}
        <SectionCard
          title="7-Day Training Load"
          subtitle="Load units per day"
          icon={<Dumbbell className="h-4 w-4" />}
          className="lg:col-span-2"
        >
          <LoadBarChart data={summary.history} />
        </SectionCard>

        {/* Log session */}
        <SectionCard
          title="Log a Session"
          subtitle="Add a workout entry"
          icon={<Plus className="h-4 w-4" />}
        >
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 block">Exercise / Session</Label>
              <Select
                value={form.exercise}
                onValueChange={(v) => setForm((f) => ({ ...f, exercise: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Duration (min)</Label>
                <Input
                  type="number"
                  min={1}
                  max={240}
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      duration: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Intensity (1–10)</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={form.intensity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      intensity: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Date</Label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Session Load
              </p>
              <p className="text-xl font-bold text-primary">
                {form.duration * form.intensity}{' '}
                <span className="text-xs font-medium text-muted-foreground">
                  units
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                {form.duration} min × intensity {form.intensity}
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              {saving ? 'Saving…' : 'Log Session'}
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* Workload change alert */}
      <SectionCard
        title="Recent Workload Change"
        subtitle="Compared to previous baseline"
        icon={<TrendingUp className="h-4 w-4" />}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Previous Average
              </p>
              <p className="text-lg font-bold text-foreground">
                {summary.previousAverage}
              </p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Current Average
              </p>
              <p className="text-lg font-bold text-foreground">
                {summary.currentAverage}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Change
              </p>
              <p className={`text-lg font-bold ${changeColor}`}>
                {summary.changePercent > 0 ? '+' : ''}
                {summary.changePercent}%
              </p>
            </div>
          </div>
        </div>
        <div
          className={`mt-3 flex items-start gap-2.5 rounded-lg border p-3 text-sm ${
            changeUp
              ? 'border-warning/30 bg-warning/10 text-warning'
              : 'border-success/30 bg-success/10 text-success'
          }`}
        >
          {changeUp ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{summary.note}</span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          This is an informational workload comparison, not a medical injury
          prediction.
        </p>
      </SectionCard>
    </div>
  );
}
