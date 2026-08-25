import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAthleteDashboard } from '@/services/api';
import type { DashboardSummary } from '@/types';
import { KpiCard } from '@/components/shared/KpiCard';
import { SectionCard } from '@/components/shared/SectionCard';
import { RiskPill } from '@/components/shared/StatusPills';
import {
  PerformanceLineChart,
  LoadBarChart,
  RecoveryLineChart,
} from '@/components/shared/Charts';
import { LoadingState, ErrorState } from '@/components/shared/States';
import {
  Activity,
  HeartPulse,
  Dumbbell,
  ShieldCheck,
  Gauge,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';

function MovementBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const color =
    value >= 85 ? 'bg-success' : value >= 75 ? 'bg-primary' : 'bg-warning';
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { toast } = useToast();
  const [data, setData] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(false);
    getAthleteDashboard()
      .then((d) => setData(d))
      .catch(() => {
        setError(true);
        toast({
          title: 'Could not load dashboard',
          description: 'Please try again.',
          variant: 'destructive',
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error || !data)
    return (
      <ErrorState message="Dashboard data unavailable." onRetry={load} />
    );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Athlete Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Performance, recovery and training overview
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Performance Score"
          value={data.performanceScore}
          unit="/100"
          delta={data.performanceDelta}
          deltaLabel="from previous session"
          status="good"
          icon={<Activity className="h-4 w-4" />}
        />
        <KpiCard
          label="Recovery Score"
          value={data.recoveryScore}
          unit="/100"
          deltaLabel={data.recoveryStatus}
          status={data.recoveryScore >= 75 ? 'good' : 'warn'}
          icon={<HeartPulse className="h-4 w-4" />}
        />
        <KpiCard
          label="Training Load"
          value={data.trainingLoad}
          deltaLabel={data.loadLevel}
          status={data.loadLevel === 'High' ? 'danger' : 'neutral'}
          icon={<Dumbbell className="h-4 w-4" />}
        />
        <KpiCard
          label="Risk Indicator"
          value={<RiskPill level={data.riskLevel} />}
          deltaLabel={data.riskNote}
          status="good"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Performance Overview"
          subtitle="Score over last 7 sessions"
          icon={<TrendingUp className="h-4 w-4" />}
        >
          <PerformanceLineChart data={data.performanceHistory} />
        </SectionCard>
        <SectionCard
          title="Training Load"
          subtitle="Load units over last 7 days"
          icon={<Dumbbell className="h-4 w-4" />}
        >
          <LoadBarChart data={data.loadHistory} />
        </SectionCard>
        <SectionCard
          title="Recovery Trend"
          subtitle="Recovery score over last 7 days"
          icon={<HeartPulse className="h-4 w-4" />}
        >
          <RecoveryLineChart data={data.recoveryHistory} />
        </SectionCard>
        <SectionCard
          title="Movement Quality"
          subtitle="Squat analysis breakdown"
          icon={<Gauge className="h-4 w-4" />}
        >
          <div className="space-y-4 pt-2">
            <MovementBar label="Depth" value={data.movement.depth} />
            <MovementBar
              label="Knee Alignment"
              value={data.movement.kneeAlignment}
            />
            <MovementBar label="Stability" value={data.movement.stability} />
            <MovementBar
              label="Consistency"
              value={data.movement.consistency}
            />
          </div>
        </SectionCard>
      </div>

      {/* Status + recommendation */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="Current Status"
          subtitle="Risk indicator summary"
          icon={<ShieldCheck className="h-4 w-4" />}
          className="lg:col-span-1"
        >
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-success/10 ring-2 ring-success/40">
              <ShieldCheck className="h-12 w-12 text-success" />
            </div>
            <div>
              <p className="text-lg font-bold text-success">LOW RISK</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Based on current movement, training-load and recovery
                indicators.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Recommendation"
          subtitle="Informational guidance"
          icon={<Lightbulb className="h-4 w-4" />}
          className="lg:col-span-2"
        >
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-foreground">
              {data.recommendation}
            </p>
            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                Disclaimer:
              </span>{' '}
              AthleteGuard provides decision-support indicators. They are not
              medical diagnoses and should not replace
              professional medical or coaching advice.
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
