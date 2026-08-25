import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  icon,
  action,
  className,
  children,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-colors hover:border-border/80',
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
