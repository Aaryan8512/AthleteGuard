import './App.css';
import * as React from 'react';
import { Sidebar, MobileTopBar } from '@/components/shared/Sidebar';
import { type PageKey, NAV_ITEMS } from '@/components/shared/nav';
import { Toaster } from '@/components/ui/toaster';
import { DashboardPage } from '@/pages/DashboardPage';
import { LiveAnalysisPage } from '@/pages/LiveAnalysisPage';
import { RecoveryPage } from '@/pages/RecoveryPage';
import { TrainingLoadPage } from '@/pages/TrainingLoadPage';
import { CoachDashboardPage } from '@/pages/CoachDashboardPage';
import { AthleteProfilePage } from '@/pages/AthleteProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AuthPage } from '@/pages/AuthPage';
import { clearAccessToken, getAccessToken } from '@/services/api';

function App() {
  const [page, setPage] = React.useState<PageKey>('dashboard');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(() => Boolean(getAccessToken()));

  if (!authenticated) return <AuthPage onAuthenticated={() => setAuthenticated(true)} />;

  const currentLabel =
    NAV_ITEMS.find((n) => n.key === page)?.label ?? 'Dashboard';

  const renderPage = () => {
    switch (page) {
      case 'dashboard':
        return <DashboardPage />;
      case 'live':
        return <LiveAnalysisPage />;
      case 'recovery':
        return <RecoveryPage />;
      case 'training':
        return <TrainingLoadPage />;
      case 'coach':
        return <CoachDashboardPage />;
      case 'profile':
        return <AthleteProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  // Keyed wrapper gives a fresh fade-in animation on each navigation.
  return (
    <div className="min-h-screen bg-background bg-grid">
      <Sidebar
        current={page}
        onNavigate={setPage}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onLogout={() => {
          clearAccessToken();
          setAuthenticated(false);
        }}
      />
      <div className="lg:pl-64">
        <MobileTopBar
          onMenuClick={() => setMobileOpen(true)}
          title={currentLabel}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div key={page} className="animate-fade-in">
            {renderPage()}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
