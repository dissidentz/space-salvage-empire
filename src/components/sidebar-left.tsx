import { Button } from '@/components/ui/button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Progress } from '@/components/ui/progress';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarRail
} from '@/components/ui/sidebar';
import { ORBIT_CONFIGS, getOrbitColor } from '@/config/orbits';
import { RESOURCE_DEFINITIONS } from '@/config/resources';
import { RESOURCE_THEME } from '@/config/resourceTheme';
import { useGameStore } from '@/stores/gameStore';
import { formatNumber } from '@/utils/format';
import { Database, MapPin, Rocket } from 'lucide-react';

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const currentOrbit = useGameStore(state => state.currentOrbit);

  const travelState = useGameStore(state => state.travelState);
  const getTravelProgress = useGameStore(state => state.getTravelProgress);
  const resources = useGameStore(state => state.resources);
  const productionRates = useGameStore(state => state.computedRates);
  const getMaxStorage = useGameStore(state => state.getMaxStorage);





  return (
    <Sidebar className="border-r-0 min-h-screen sticky top-0 h-svh" collapsible="none" {...props}>
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
              <div className={`rounded-lg border p-3 bg-gradient-to-br from-background to-accent/10 ${getOrbitColor(currentOrbit).replace('text-', 'border-').replace('-300', '-500/30').replace('-400', '-500/30')}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`font-bold ${getOrbitColor(currentOrbit)}`}>
                    {ORBIT_CONFIGS[currentOrbit].name}
                  </div>
                </div>

                {/* Travel Status */}
                {travelState?.traveling ? (
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
                      <Progress value={getTravelProgress() * 100} className="h-2 bg-blue-950/50 [&>div]:bg-blue-400" />
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-8 text-xs mt-2"
                    onClick={() => useGameStore.getState().openModal('orbitSelector')}
                  >
                    <Rocket className="w-3 h-3 mr-2" />
                    Change Orbit
                  </Button>
                )}

                {/* Production Multipliers */}
                <div className="mt-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Multipliers
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs text-center">
                    <div className="bg-background/50 rounded p-1 border border-border/50">
                      <div className="text-orange-400 font-medium">{ORBIT_CONFIGS[currentOrbit].metalMultiplier}x</div>
                      <div className="text-[9px] text-muted-foreground">Metal</div>
                    </div>
                    <div className="bg-background/50 rounded p-1 border border-border/50">
                      <div className="text-blue-400 font-medium">{ORBIT_CONFIGS[currentOrbit].electronicsMultiplier}x</div>
                      <div className="text-[9px] text-muted-foreground">Elec</div>
                    </div>
                    <div className="bg-background/50 rounded p-1 border border-border/50">
                      <div className="text-purple-400 font-medium">{ORBIT_CONFIGS[currentOrbit].rareMultiplier}x</div>
                      <div className="text-[9px] text-muted-foreground">Rare</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Resources
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Collect Debris Button */}
            <div className="px-2 pb-2">
              <Button
                onClick={() => useGameStore.getState().clickDebris()}
                variant="default"
                size="sm"
                className="w-full font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Collect Debris
              </Button>
            </div>
            <div className="space-y-1 px-2">
              {Object.entries(RESOURCE_DEFINITIONS).map(([id, def]) => {
                const value = resources[id as keyof typeof resources];
                const rate = productionRates[id as keyof typeof resources] || 0;
                const theme = RESOURCE_THEME[id as keyof typeof RESOURCE_THEME];
                const max = getMaxStorage(id as any);
                const isFull = value >= max && id !== 'darkMatter';
                
                // Only show discovered resources (value > 0 or rate > 0)
                // Exception: always show debris, metal, electronics, fuel
                const isBasic = ['debris', 'metal', 'electronics', 'fuel'].includes(id);
                if (!isBasic && value <= 0 && rate === 0) return null;

                const Icon = theme.icon;

                return (
                  <div
                    key={id}
                    className="group flex items-center justify-between py-2 px-2 text-sm rounded-md hover:bg-sidebar-accent/50 transition-colors"
                    title={isFull ? "Storage Full! Upgrade capacity or spend resources." : def.description}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-md bg-sidebar-accent/50 ${theme.color.replace('text-', 'bg-').replace('-400', '-500/20')}`}>
                        <Icon className={`w-4 h-4 ${theme.color}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sidebar-foreground/90">{theme.label}</span>
                        <span
                          className={`text-xs ${
                            rate === 0 ? 'text-muted-foreground/50' : rate > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {rate > 0 ? '+' : ''}
                          {formatNumber(rate)}/s
                        </span>
                      </div>
                    </div>
                      <div className="text-right">
                        <div className={`font-mono font-bold ${isFull ? 'text-red-500' : theme.color}`}>
                          <NumberTicker value={value} />
                        </div>
                        {max < 900000 && (
                             <div className="text-[10px] text-muted-foreground/50">
                                / <NumberTicker value={max} />
                             </div>
                        )}
                      </div>
                  </div>
                );
              })}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
