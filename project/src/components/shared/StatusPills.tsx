import type { RiskLevel, RecoveryStatus, LoadLevel, FormStatus } from '@/types';
import { cn } from '@/lib/utils';
import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from 'lucide-react';

const riskConfig: Record<
  RiskLevel,
  { label: string; className: string; Icon: typeof ShieldCheck }
> = {
  LOW: {
    label: 'LOW',
    className:
      'bg-success/15 text-success border-success/30',
    Icon: ShieldCheck,
  },
  MODERATE: {
    label: 'MODERATE',
    className:
      'bg-warning/15 text-warning border-warning/30',
    Icon: ShieldAlert,
  },
  HIGH: {
    label: 'HIGH',
    className:
      'bg-destructive/15 text-destructive border-destructive/30',
    Icon: ShieldX,
  },
  ATTENTION: {
    label: 'ATTENTION',
    className:
      'bg-destructive/20 text-destructive border-destructive/40 animate-pulse-ring',
    Icon: AlertTriangle,
  },
};

export function RiskPill({
  level,
  className,
}: {
  level: RiskLevel;
  className?: string;
}) {
  const cfg = riskConfig[level];
  const Icon = cfg.Icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide',
        cfg.className,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

export function RecoveryPill({ status }: { status: RecoveryStatus }) {
  const map: Record<RecoveryStatus, string> = {
    GOOD: 'bg-success/15 text-success border-success/30',
    MODERATE: 'bg-warning/15 text-warning border-warning/30',
    LOW: 'bg-destructive/15 text-destructive border-destructive/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        map[status]
      )}
    >
      {status}
    </span>
  );
}

export function LoadPill({ level }: { level: LoadLevel }) {
  const map: Record<LoadLevel, string> = {
    Low: 'bg-muted text-muted-foreground border-border',
    Normal: 'bg-success/15 text-success border-success/30',
    Moderate: 'bg-warning/15 text-warning border-warning/30',
    High: 'bg-destructive/15 text-destructive border-destructive/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        map[level]
      )}
    >
      {level}
    </span>
  );
}

export function FormPill({ status }: { status: FormStatus }) {
  const map: Record<FormStatus, string> = {
    GOOD: 'bg-success/15 text-success border-success/30',
    FAIR: 'bg-warning/15 text-warning border-warning/30',
    POOR: 'bg-destructive/15 text-destructive border-destructive/30',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        map[status]
      )}
    >
      {status}
    </span>
  );
}
