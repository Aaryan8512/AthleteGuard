import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Video,
  HeartPulse,
  Dumbbell,
  Users,
  UserCircle,
  Settings,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { NAV_ITEMS, type PageKey } from './nav';
import { AccountPanel } from './AccountPanel';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Video,
  HeartPulse,
  Dumbbell,
  Users,
  UserCircle,
  Settings,
};

interface SidebarProps {
  current: PageKey;
  onNavigate: (page: PageKey) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}

export function Sidebar({
  current,
  onNavigate,
  mobileOpen,
  onMobileClose,
  onLogout,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-widest text-foreground">
                ATHLETE<span className="text-primary">GUARD</span>
              </p>
              <p className="text-[10px] text-muted-foreground">
                Move Better. Train Smarter.
              </p>
            </div>
          </div>
          <button
            className="text-muted-foreground hover:text-foreground lg:hidden"
            onClick={onMobileClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  onMobileClose();
                }}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-[18px] w-[18px] transition-transform group-hover:scale-110',
                    active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-5 py-4">
          <AccountPanel onLogout={onLogout} />
        </div>
      </aside>
    </>
  );
}

export function MobileTopBar({
  onMenuClick,
  title,
}: {
  onMenuClick: () => void;
  title: string;
}) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button
        onClick={onMenuClick}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-sm font-bold tracking-widest text-foreground">
        ATHLETE<span className="text-primary">GUARD</span>
      </span>
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
    </div>
  );
}
