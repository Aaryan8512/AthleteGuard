import * as React from 'react';
import type { Athlete } from '@/types';
import { SectionCard } from '@/components/shared/SectionCard';
import { RiskPill, LoadPill, RecoveryPill } from '@/components/shared/StatusPills';
import {
  PerformanceLineChart,
  RecoveryLineChart,
  LoadBarChart,
} from '@/components/shared/Charts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  HeartPulse,
  Dumbbell,
  Gauge,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';

function StatTile({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3 text-center">
      <span className="mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <p className="text-lg font-bold text-foreground tabular-nums">
        {value}
        {unit && (
          <span className="ml-0.5 text-xs font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export function AthleteProfileContent({
  athlete,
  compact = false,
}: {
  athlete: Athlete;
  compact?: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Performance"
          value={athlete.performanceScore}
          unit="/100"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatTile
          label="Recovery"
          value={athlete.recoveryScore}
          unit="/100"
          icon={<HeartPulse className="h-4 w-4" />}
        />
        <StatTile
          label="Training Load"
          value={athlete.trainingLoad}
          icon={<Dumbbell className="h-4 w-4" />}
        />
        <StatTile
          label="Movement"
          value={athlete.movementQuality}
          unit="/100"
          icon={<Gauge className="h-4 w-4" />}
        />
      </div>

      {/* Risk indicator */}
      <SectionCard
        title="Risk Indicator"
        subtitle="Explainable, rule-based"
        icon={<ShieldAlert className="h-4 w-4" />}
      >
        <div className="mb-3 flex items-center justify-between">
          <RiskPill level={athlete.riskLevel} />
          <LoadPill level={athlete.loadLevel} />
        </div>
        <ul className="space-y-1.5">
          {athlete.riskReasons.map((r) => (
            <li
              key={r}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              {r}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{athlete.riskRecommendation}</span>
        </div>
      </SectionCard>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SectionCard
          title="Performance History"
          subtitle="Last 7 sessions"
          icon={<Activity className="h-4 w-4" />}
        >
          <PerformanceLineChart data={athlete.performanceHistory} />
        </SectionCard>
        <SectionCard
          title="Recovery History"
          subtitle="Last 7 sessions"
          icon={<HeartPulse className="h-4 w-4" />}
        >
          <RecoveryLineChart data={athlete.recoveryHistory} />
        </SectionCard>
        {!compact && (
          <SectionCard
            title="Training Load History"
            subtitle="Last 7 days"
            icon={<Dumbbell className="h-4 w-4" />}
            className="sm:col-span-2"
          >
            <LoadBarChart data={athlete.loadHistory} />
          </SectionCard>
        )}
      </div>

      {/* Risk history */}
      <SectionCard
        title="Risk Indicator History"
        subtitle="Weekly trend"
        icon={<ShieldAlert className="h-4 w-4" />}
      >
        <div className="flex flex-wrap items-center gap-2">
          {athlete.riskHistory.map((h) => (
            <div
              key={h.label}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-[10px] text-muted-foreground">
                {h.label}
              </span>
              <RiskPill level={h.level} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Recent sessions */}
      <SectionCard
        title="Recent Sessions"
        subtitle="Latest logged workouts"
        icon={<Activity className="h-4 w-4" />}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Exercise</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Intensity</TableHead>
              <TableHead className="text-right">Load</TableHead>
              <TableHead className="text-right">Quality</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athlete.recentSessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-muted-foreground">
                  {s.date}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {s.exercise}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.duration}m
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.intensity}/10
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {s.load}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-semibold text-primary">
                    {s.movementQuality}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  );
}

export function AthleteHeader({ athlete }: { athlete: Athlete }) {
  const initials = athlete.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary ring-2 ring-primary/30">
        {initials}
      </div>
      <div>
        <h2 className="text-lg font-bold text-foreground">{athlete.name}</h2>
        <p className="text-xs text-muted-foreground">
          {athlete.age} yrs · {athlete.sport} · {athlete.position} ·{' '}
          {athlete.team}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <RiskPill level={athlete.riskLevel} />
          <RecoveryPill
            status={
              athlete.recoveryScore >= 75
                ? 'GOOD'
                : athlete.recoveryScore >= 55
                ? 'MODERATE'
                : 'LOW'
            }
          />
          <LoadPill level={athlete.loadLevel} />
        </div>
      </div>
    </div>
  );
}
