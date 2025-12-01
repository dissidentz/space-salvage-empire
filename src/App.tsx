import { AdminPanel } from '@/components/AdminPanel';
import { GalaxyMap } from '@/components/GalaxyMap';
import { SidebarLeft } from '@/components/sidebar-left';
import { TopNav } from '@/components/TopNav';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import type { ErrorInfo } from 'react';
import { Component } from 'react';
import { NotificationManager } from './components/NotificationManager';
import { ChangelogView } from './components/views/ChangelogView';
import { DashboardView } from './components/views/DashboardView';
import { PrestigeView } from './components/views/PrestigeView';
import { SettingsView } from './components/views/SettingsView';
import { TechTreeView } from './components/views/TechTreeView';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './stores/gameStore';

function App() {
  // Expose store for debugging
  (window as any).useGameStore = useGameStore;

  // Start the game loop
  useGameLoop();

  // Get active view from UI state
  const activeView = useGameStore(state => state.ui.activeView);

  // Render the appropriate view
  const renderView = () => {
    switch (activeView) {
      case 'galaxyMap':
        return <GalaxyMap />;
      case 'settings':
        return <SettingsView />;
      case 'techTree':
        return <TechTreeView />;
      case 'prestige':
        return <PrestigeView />;
      case 'changelog':
        return <ChangelogView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset className="relative pb-16">
        <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <TopNav />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{renderView()}</div>
      </SidebarInset>
      <NotificationManager />
      <Toaster />
      <AdminPanel />
    </SidebarProvider>
  );
}

// Error boundary to surface runtime rendering errors visibly in the app
class AppErrorBoundary extends Component<
  Record<string, never>,
  { hasError: boolean; error?: Error }
> {
  constructor(props: Record<string, never>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console for developer
    console.error('Unhandled error in App:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-900 text-white p-6">
          <div>
            <h1 className="text-2xl font-bold">Application error</h1>
            <p className="mt-4">
              An unexpected error occurred while rendering the app. Check the
              browser console for details.
            </p>
            <pre className="mt-4 text-xs whitespace-pre-wrap">
              {String(this.state.error)}
            </pre>
          </div>
        </div>
      );
    }

    return <App />;
  }
}

export default AppErrorBoundary;
