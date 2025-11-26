import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { useGameStore } from '@/stores/gameStore';
import { ORBIT_CONFIGS, getOrbitColor } from '@/config/orbits';
import type { OrbitType } from '@/types';
import { MapPin, Rocket } from 'lucide-react';

const data = {
  navMain: [
    {
      title: 'Operations',
      url: '#',
      items: [
        { title: 'Dashboard', url: '#', action: 'navigateDashboard' },
        { title: 'Resources', url: '#', action: 'toggleResources' },
      ],
    },
    {
      title: 'System',
      url: '#',
      items: [
        { title: 'Settings', url: '#', action: 'navigateSettings' },
      ],
    },
  ],
};

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar: toggleRightSidebar, open: rightOpen } =
    useSidebar('right');
  const currentOrbit = useGameStore(state => state.currentOrbit);
  const canTravelToOrbit = useGameStore(state => state.canTravelToOrbit);
  const travelToOrbit = useGameStore(state => state.travelToOrbit);
  const getOrbitTravelCost = useGameStore(state => state.getOrbitTravelCost);
  const setActiveView = useGameStore(state => state.setActiveView);
  const activeView = useGameStore(state => state.ui.activeView);

  const handleAction = (action: string) => {
    switch (action) {
      case 'toggleResources':
        toggleRightSidebar();
        break;
      case 'navigateDashboard':
        setActiveView('dashboard');
        break;
      case 'navigateSettings':
        setActiveView('settings');
        break;
    }
  };

  const handleTravelToOrbit = (orbit: OrbitType) => {
    if (canTravelToOrbit(orbit)) {
      travelToOrbit(orbit);
    }
  };

  // Get available orbits for travel
  const availableOrbits = Object.values(ORBIT_CONFIGS).filter(orbit => 
    orbit.id !== currentOrbit && canTravelToOrbit(orbit.id)
  );

  return (
    <Sidebar className="border-r-0 min-h-screen" collapsible="none" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Rocket className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold text-sidebar-foreground">
            Space Salvage Empire
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Current Location */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Current Location
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-1">
              <div className={`text-sm font-medium ${getOrbitColor(currentOrbit)}`}>
                {ORBIT_CONFIGS[currentOrbit].name}
              </div>
              {availableOrbits.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground">Available Destinations:</div>
                  {availableOrbits.map(orbit => (
                    <button
                      key={orbit.id}
                      onClick={() => handleTravelToOrbit(orbit.id)}
                      className="w-full text-left px-2 py-1 text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className={`font-medium ${getOrbitColor(orbit.id)}`}>
                        {orbit.name}
                      </div>
                      <div className="text-muted-foreground">
                        {getOrbitTravelCost(orbit.id)} fuel
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation groups */}
        {data.navMain.map(item => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map(sub => (
                  <SidebarMenuItem key={sub.title}>
                    <SidebarMenuButton
                      asChild={sub.action ? false : true}
                      isActive={
                        sub.action === 'toggleResources'
                          ? rightOpen
                          : sub.action === 'navigateDashboard'
                            ? activeView === 'dashboard'
                            : sub.action === 'navigateSettings'
                              ? activeView === 'settings'
                              : false
                      }
                      onClick={
                        sub.action
                          ? () => handleAction(sub.action!)
                          : undefined
                      }
                      style={
                        sub.action === 'toggleResources' && rightOpen
                          ? { backgroundColor: '#16a34a', color: 'white', fontWeight: 'bold' }
                          : undefined
                      }
                    >
                      {sub.action ? (
                        sub.title
                      ) : (
                        <a href={sub.url}>{sub.title}</a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
