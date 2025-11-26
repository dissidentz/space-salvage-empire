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
import { ORBIT_CONFIGS, getOrbitColor } from '@/config/orbits';
import { useSidebar } from '@/hooks/useSidebar';
import { useGameStore } from '@/stores/gameStore';
import { MapPin, Rocket } from 'lucide-react';

const data = {
  navMain: [
    {
      title: 'Operations',
      url: '#',
      items: [
        { title: 'Dashboard', url: '#', action: 'navigateDashboard' },
        { title: 'Galaxy Map', url: '#', action: 'navigateGalaxyMap' },
        { title: 'Resources', url: '#', action: 'toggleResources' },
      ],
    },
    {
      title: 'System',
      url: '#',
      items: [{ title: 'Settings', url: '#', action: 'navigateSettings' }],
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
  const setActiveView = useGameStore(state => state.setActiveView);
  const activeView = useGameStore(state => state.ui.activeView);
  const travelState = useGameStore(state => state.travelState);
  const getTravelProgress = useGameStore(state => state.getTravelProgress);

  const handleAction = (action: string) => {
    switch (action) {
      case 'toggleResources':
        toggleRightSidebar();
        break;
      case 'navigateDashboard':
        setActiveView('dashboard');
        break;
      case 'navigateGalaxyMap':
        setActiveView('galaxyMap');
        break;
      case 'navigateSettings':
        setActiveView('settings');
        break;
    }
  };

  const handleTravelToOrbit = (orbit: string) => {
    if (canTravelToOrbit(orbit as keyof typeof ORBIT_CONFIGS)) {
      travelToOrbit(orbit as keyof typeof ORBIT_CONFIGS);
    }
  };

  // Get comparison indicators for multipliers
  const getMultiplierComparison = (current: number, target: number) => {
    if (target > current) return 'text-green-400 ↑';
    if (target < current) return 'text-red-400 ↓';
    return 'text-muted-foreground';
  };

  const currentConfig = ORBIT_CONFIGS[currentOrbit];

  // Get available orbits for travel
  const availableOrbits = Object.values(ORBIT_CONFIGS).filter(
    orbit => orbit.id !== currentOrbit && canTravelToOrbit(orbit.id)
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
              <div
                className={`text-sm font-medium ${getOrbitColor(currentOrbit)}`}
              >
                {ORBIT_CONFIGS[currentOrbit].name}
              </div>

              {/* Travel Status */}
              {travelState?.traveling && (
                <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-400 font-medium">
                      Traveling to{' '}
                      {ORBIT_CONFIGS[travelState.destination!]?.name}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{Math.round(getTravelProgress() * 100)}%</span>
                    </div>
                    <div className="w-full bg-blue-950/50 rounded-full h-1">
                      <div
                        className="bg-blue-400 h-1 rounded-full transition-all duration-1000"
                        style={{ width: `${getTravelProgress() * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Production Multipliers */}
              <div className="mt-2 space-y-1">
                <div className="text-xs text-muted-foreground font-medium">
                  Production Multipliers:
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metal:</span>
                    <span className="text-orange-400 font-medium">
                      {ORBIT_CONFIGS[currentOrbit].metalMultiplier}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Electronics:</span>
                    <span className="text-blue-400 font-medium">
                      {ORBIT_CONFIGS[currentOrbit].electronicsMultiplier}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rare:</span>
                    <span className="text-purple-400 font-medium">
                      {ORBIT_CONFIGS[currentOrbit].rareMultiplier}x
                    </span>
                  </div>
                </div>
              </div>
              {availableOrbits.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Available Destinations:
                  </div>
                  {availableOrbits.map(orbit => (
                    <button
                      key={orbit.id}
                      onClick={() => handleTravelToOrbit(orbit.id)}
                      className="w-full text-left px-2 py-2 text-xs rounded hover:bg-accent hover:text-accent-foreground transition-colors border border-border/50 hover:border-accent"
                    >
                      <div
                        className={`font-medium ${getOrbitColor(orbit.id)} mb-1`}
                      >
                        {orbit.name}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="text-orange-400">
                            {orbit.fuelCost} fuel
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="text-blue-400">
                            {orbit.travelTime < 3600000
                              ? `${Math.round(orbit.travelTime / 60000)}m`
                              : `${Math.round(orbit.travelTime / 3600000)}h`}
                          </span>
                        </div>
                        <div className="flex justify-between col-span-2">
                          <span className="text-muted-foreground">
                            Multipliers:
                          </span>
                          <div className="text-right">
                            <div className="text-xs">
                              <span
                                className={getMultiplierComparison(
                                  currentConfig.metalMultiplier,
                                  orbit.metalMultiplier
                                )}
                              >
                                {orbit.metalMultiplier}x metal
                              </span>
                              <span className="mx-1">•</span>
                              <span
                                className={getMultiplierComparison(
                                  currentConfig.electronicsMultiplier,
                                  orbit.electronicsMultiplier
                                )}
                              >
                                {orbit.electronicsMultiplier}x electronics
                              </span>
                              <span className="mx-1">•</span>
                              <span
                                className={getMultiplierComparison(
                                  currentConfig.rareMultiplier,
                                  orbit.rareMultiplier
                                )}
                              >
                                {orbit.rareMultiplier}x rare
                              </span>
                            </div>
                          </div>
                        </div>
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
                            : sub.action === 'navigateGalaxyMap'
                              ? activeView === 'galaxyMap'
                              : sub.action === 'navigateSettings'
                                ? activeView === 'settings'
                                : false
                      }
                      onClick={
                        sub.action ? () => handleAction(sub.action!) : undefined
                      }
                      style={
                        sub.action === 'toggleResources' && rightOpen
                          ? {
                              backgroundColor: '#16a34a',
                              color: 'white',
                              fontWeight: 'bold',
                            }
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
