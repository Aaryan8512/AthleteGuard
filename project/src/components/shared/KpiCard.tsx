import * as React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  status?: 'good' | 'warn' | 'danger' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

const statusColor: Record<string, string> = {
  good: 'text-success',
  warn: 'text-warning',
  danger: 'text-destructive',
  neutral: 'text-muted-foreground',
};

export function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  status = 'neutral',
  icon,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-1.5">
        <span className="text-3xl font-bold leading-none tracking-tight text-foreground">
          {value}
        </span>
        {unit && (
          <span className="mb-0.5 text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {(delta !== undefined || deltaLabel) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold',
                delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {delta > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : delta < 0 ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {delta > 0 ? '+' : ''}
              {delta}
            </span>
          )}
          {deltaLabel && (
            <span className={cn('font-medium', statusColor[status])}>
              {deltaLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
