import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import {
    Atom,
    BookOpen,
    FlaskConical,
    LayoutDashboard,
    Map,
    Settings
} from 'lucide-react';

export function TopNav() {
  const setActiveView = useGameStore(state => state.setActiveView);
  const activeView = useGameStore(state => state.ui.activeView);

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      view: 'dashboard' as const
    },
    { 
      id: 'galaxyMap', 
      label: 'Galaxy Map', 
      icon: Map,
      view: 'galaxyMap' as const
    },
    { 
      id: 'techTree', 
      label: 'Research', 
      icon: FlaskConical,
      view: 'techTree' as const
    },
    { 
      id: 'prestige', 
      label: 'Prestige', 
      icon: Atom,
      view: 'prestige' as const
    },
    { 
      id: 'changelog', 
      label: 'Changelog', 
      icon: BookOpen,
      view: 'changelog' as const
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      view: 'settings' as const
    },
  ];

  return (
    <div className="flex items-center gap-1 flex-1">
      {/* Navigation Items */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(item.view)}
              className={cn(
                'gap-2',
                isActive && 'bg-primary text-primary-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
