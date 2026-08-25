export type PageKey =
  | 'dashboard'
  | 'live'
  | 'recovery'
  | 'training'
  | 'coach'
  | 'profile'
  | 'settings';

export const NAV_ITEMS: {
  key: PageKey;
  label: string;
  icon: string;
}[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'live', label: 'Live Analysis', icon: 'Video' },
  { key: 'recovery', label: 'Recovery', icon: 'HeartPulse' },
  { key: 'training', label: 'Training Load', icon: 'Dumbbell' },
  { key: 'coach', label: 'Coach Dashboard', icon: 'Users' },
  { key: 'profile', label: 'Athlete Profile', icon: 'UserCircle' },
  { key: 'settings', label: 'Settings', icon: 'Settings' },
];
