import * as React from 'react';
import { SectionCard } from '@/components/shared/SectionCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ShieldCheck,
  Info,
  Bell,
  Moon,
  Video,
  Database,
  Server,
  Cpu,
} from 'lucide-react';

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SettingsPage() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Preferences and platform information
          </p>
        </div>
      </div>

      {/* Preferences */}
      <SectionCard
        title="Preferences"
        subtitle="App behavior"
        icon={<ShieldCheck className="h-4 w-4" />}
      >
        <div className="space-y-3">
          <SettingRow
            icon={<Bell className="h-4 w-4" />}
            title="Notifications"
            description="Risk and recovery alerts"
          >
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </SettingRow>
          <SettingRow
            icon={<Moon className="h-4 w-4" />}
            title="Dark Mode"
            description="Optimized for low-light venues"
          >
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </SettingRow>
          <SettingRow
            icon={<Database className="h-4 w-4" />}
            title="Auto-save Sessions"
            description="Save workout and recovery data automatically"
          >
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </SettingRow>
        </div>
      </SectionCard>

      {/* About / Disclaimer */}
      <SectionCard
        title="About AthleteGuard"
        subtitle="Platform disclaimer"
        icon={<Info className="h-4 w-4" />}
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-border bg-secondary/30 p-4 leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              AthleteGuard
            </span>{' '}
            is a decision-support platform. Its risk indicators are
            not medical diagnoses and should not replace professional medical
            or coaching advice.
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <Video className="mb-2 h-5 w-5 text-primary" />
              <p className="text-xs font-semibold text-foreground">
                Live Analysis
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Connect a backend to load your account data.
                MediaPipe Pose Landmarker integration is pending.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <Server className="mb-2 h-5 w-5 text-primary" />
              <p className="text-xs font-semibold text-foreground">
                Backend
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Frontend is FastAPI-ready. A service layer abstracts all data
                access so a backend can be connected without UI changes.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <Cpu className="mb-2 h-5 w-5 text-primary" />
              <p className="text-xs font-semibold text-foreground">
                Risk Engine
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Explainable, rule-based scoring. No arbitrary AI prediction
                percentages are used.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Brand footer */}
      <div className="flex flex-col items-center gap-1 py-4 text-center">
        <p className="text-sm font-bold tracking-widest text-foreground">
          ATHLETE<span className="text-primary">GUARD</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Move Better. Train Smarter. Perform Stronger.
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
              Smart India Hackathon 2026 · Sports & Fitness
        </p>
      </div>
    </div>
  );
}
