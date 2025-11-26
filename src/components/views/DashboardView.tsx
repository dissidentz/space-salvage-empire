import { DerelictCard } from '@/components/DerelictCard';
import { MissionCard } from '@/components/MissionCard';
import { MissionHistory } from '@/components/MissionHistory';
import { OrbitSelector } from '@/components/OrbitSelector';
import { ShipCard } from '@/components/ShipCard';
import { TravelProgress } from '@/components/TravelProgress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ORBIT_CONFIGS } from '@/config/orbits';
import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import type { OrbitType, ShipType } from '@/types';
import { formatTime } from '@/utils/format';
import { Globe, Radar, Rocket, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';

export function DashboardView() {
  // Select state
  const ships = useGameStore(state => state.ships);
  const clickDebris = useGameStore(state => state.clickDebris);
  const currentOrbit = useGameStore(state => state.currentOrbit);
  const travelState = useGameStore(state => state.travelState);
  const missions = useGameStore(state => state.missions);
  const allDerelicts = useGameStore(state => state.derelicts);
  const derelicts = useMemo(() => allDerelicts.filter(d => d.orbit === currentOrbit), [allDerelicts, currentOrbit]);
  const startScoutMission = useGameStore(state => state.startScoutMission);
  const resources = useGameStore(state => state.resources);
  const computedRates = useGameStore(state => state.computedRates);

  // Orbit selector state
  const [orbitSelectorOpen, setOrbitSelectorOpen] = useState(false);

  // Group ships by tier
  const shipsByTier = useMemo(() => {
    const allShips = Object.keys(SHIP_CONFIGS) as ShipType[];
    const grouped: Record<number, ShipType[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
    };

    allShips.forEach(shipType => {
      const config = SHIP_CONFIGS[shipType];
      // Only show production ships for now (active ships will be in missions tab)
      if (config.category === 'production') {
        grouped[config.tier].push(shipType);
      }
    });

    return grouped;
  }, []);

  // Check unlock status for each ship
  const shipUnlockStatus = useMemo(() => {
    const status: Record<ShipType, { unlocked: boolean; reason?: string }> =
      {} as Record<ShipType, { unlocked: boolean; reason?: string }>;

    const allProductionShips = Object.values(shipsByTier).flat();

    allProductionShips.forEach(shipType => {
      const config = SHIP_CONFIGS[shipType];
      const req = config.unlockRequirements;

      // Check ship requirements
      if (req.ships) {
        for (const [requiredShip, count] of Object.entries(req.ships)) {
          if (ships[requiredShip as ShipType] < count) {
            status[shipType] = {
              unlocked: false,
              reason: `Requires ${count} ${SHIP_CONFIGS[requiredShip as ShipType].name}${count > 1 ? 's' : ''}`,
            };
            return;
          }
        }
      }

      // Check orbit requirements
      if (req.orbit) {
        const orbitOrder: OrbitType[] = ['leo', 'geo', 'lunar', 'mars', 'asteroidBelt', 'jovian', 'kuiper', 'deepSpace'];
        const currentIndex = orbitOrder.indexOf(currentOrbit);
        const requiredIndex = orbitOrder.indexOf(req.orbit);
        
        if (currentIndex < requiredIndex) {
          status[shipType] = {
            unlocked: false,
            reason: `Requires ${ORBIT_CONFIGS[req.orbit].name}`,
          };
          return;
        }
      }

      status[shipType] = { unlocked: true };
    });

    return status;
  }, [shipsByTier, ships, currentOrbit]);

  return (
    <div className="space-y-6">
      {/* Click Button */}
      <Card className="border-primary/30 bg-linear-to-br from-blue-950/50 to-cyan-950/50 backdrop-blur">
        <CardContent className="pt-6">
          <Button
            onClick={clickDebris}
            variant="default"
            size="lg"
            className="w-full font-bold text-xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
          >
            <Rocket className="w-6 h-6" />
            Collect Debris
            <Rocket className="w-6 h-6" />
          </Button>
        </CardContent>
      </Card>

      {/* Resources Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(resources)
          .filter(([_, value]) => value > 0)
          .map(([resourceType, value]) => {
            // Resource configuration for icons and colors
            const resourceConfig: Record<string, { icon: string | React.ReactElement; color: string; bgGradient: string; label: string }> = {
              debris: {
                icon: <Zap className="h-6 w-6 text-yellow-400" />,
                color: 'text-yellow-300',
                bgGradient: 'from-yellow-950/30 to-amber-950/30',
                label: 'Debris'
              },
              metal: {
                icon: '🔩',
                color: 'text-gray-300',
                bgGradient: 'from-gray-950/30 to-slate-950/30',
                label: 'Metal'
              },
              electronics: {
                icon: '⚡',
                color: 'text-blue-300',
                bgGradient: 'from-blue-950/30 to-cyan-950/30',
                label: 'Electronics'
              },
              fuel: {
                icon: '⛽',
                color: 'text-orange-300',
                bgGradient: 'from-orange-950/30 to-red-950/30',
                label: 'Fuel'
              },
              rareMaterials: {
                icon: '💎',
                color: 'text-purple-300',
                bgGradient: 'from-purple-950/30 to-violet-950/30',
                label: 'Rare Materials'
              },
              exoticAlloys: {
                icon: '🔮',
                color: 'text-pink-300',
                bgGradient: 'from-pink-950/30 to-rose-950/30',
                label: 'Exotic Alloys'
              },
              aiCores: {
                icon: '🤖',
                color: 'text-green-300',
                bgGradient: 'from-green-950/30 to-emerald-950/30',
                label: 'AI Cores'
              },
              dataFragments: {
                icon: '💾',
                color: 'text-cyan-300',
                bgGradient: 'from-cyan-950/30 to-teal-950/30',
                label: 'Data Fragments'
              },
              darkMatter: {
                icon: '🌌',
                color: 'text-indigo-300',
                bgGradient: 'from-indigo-950/30 to-purple-950/30',
                label: 'Dark Matter'
              }
            };

            const config = resourceConfig[resourceType];
            if (!config) return null;

            return (
              <Card key={resourceType} className={`border-${resourceType === 'debris' ? 'yellow' : resourceType === 'metal' ? 'gray' : resourceType === 'electronics' ? 'blue' : resourceType === 'fuel' ? 'orange' : resourceType === 'rareMaterials' ? 'purple' : resourceType === 'exoticAlloys' ? 'pink' : resourceType === 'aiCores' ? 'green' : resourceType === 'dataFragments' ? 'cyan' : 'indigo'}-500/30 bg-gradient-to-br ${config.bgGradient}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    {typeof config.icon === 'string' ? (
                      <div className="h-6 w-6 text-2xl">{config.icon}</div>
                    ) : (
                      config.icon
                    )}
                    <div className="flex-1">
                      <div className="text-xs text-gray-400">{config.label}</div>
                      <div className={`text-xl font-bold ${config.color}`}>
                        {Math.floor(value).toLocaleString()}
                      </div>
                      {computedRates[resourceType as keyof typeof computedRates] !== undefined && (
                        <div className="text-xs text-green-400 flex items-center gap-1">
                          {computedRates[resourceType as keyof typeof computedRates]! > 0 ? (
                            <>
                              <span>↑</span>
                              <span>+{computedRates[resourceType as keyof typeof computedRates]!.toFixed(1)}/s</span>
                            </>
                          ) : computedRates[resourceType as keyof typeof computedRates]! < 0 ? (
                            <>
                              <span className="text-red-400">↓</span>
                              <span className="text-red-400">{computedRates[resourceType as keyof typeof computedRates]!.toFixed(1)}/s</span>
                            </>
                          ) : (
                            <span className="text-gray-500">0.0/s</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Current Orbit Display */}
      <Card className="border-blue-500/30 bg-blue-950/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">Current Orbit</div>
                <div className="text-lg font-semibold text-blue-300">
                  {ORBIT_CONFIGS[currentOrbit].name}
                </div>
              </div>
            </div>
            <Button
              onClick={() => setOrbitSelectorOpen(true)}
              disabled={travelState?.traveling}
              variant="outline"
              size="sm"
            >
              <Globe className="mr-2 h-4 w-4" />
              Change Orbit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Travel Progress */}
      <TravelProgress />

      {/* Missions Section */}
      {(ships.scoutProbe > 0 || ships.salvageFrigate > 0 || missions.length > 0 || derelicts.length > 0) && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-primary">🛰️</span>
            Missions & Salvage
          </h2>

          {/* Active Missions */}
          {missions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-muted-foreground">Active Missions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.map(mission => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </div>
          )}

          {/* Available Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Launch Scout Mission Card */}
            {ships.scoutProbe > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Radar className="h-5 w-5 text-blue-400" />
                        Launch Scout Probe
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Send a probe to scan {ORBIT_CONFIGS[currentOrbit].name} for derelicts.
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {ships.scoutProbe - missions.filter(m => m.shipType === 'scoutProbe').length} / {ships.scoutProbe} Available
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{formatTime(SHIP_CONFIGS.scoutProbe.baseMissionDuration || 600000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Cost:</span>
                      <span className={resources.fuel < 50 ? 'text-destructive' : ''}>50 Fuel</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discovery Chance:</span>
                      <span>{(SHIP_CONFIGS.scoutProbe.baseSuccessRate || 0.15) * 100}%</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => startScoutMission('scoutProbe', currentOrbit)}
                    disabled={
                      resources.fuel < 50 || 
                      ships.scoutProbe <= missions.filter(m => m.shipType === 'scoutProbe').length
                    }
                  >
                    Launch Probe
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Discovered Derelicts */}
          {derelicts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-muted-foreground">
                Discovered Derelicts in {ORBIT_CONFIGS[currentOrbit].name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {derelicts.map(derelict => (
                  <DerelictCard key={derelict.id} derelict={derelict} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fleet Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-primary">⚡</span>
          Your Fleet
        </h2>

        {/* Render ships grouped by tier */}
        {Object.entries(shipsByTier).map(([tier, ships]) => {
          // Skip empty tiers
          if (ships.length === 0) return null;

          // Check if any ships in this tier are unlocked or owned
          const hasVisibleShips = ships.some(
            shipType =>
              shipUnlockStatus[shipType]?.unlocked ||
              useGameStore.getState().ships[shipType] > 0
          );

          if (!hasVisibleShips) return null;

          return (
            <div key={tier} className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-300">
                Tier {tier} Ships
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ships.map((shipType: ShipType) => {
                  const status = shipUnlockStatus[shipType];

                  if (!status.unlocked) {
                    // Show locked ship card
                    return (
                      <Card
                        key={shipType}
                        className="border-border bg-card/50 opacity-60"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-2">
                            <Zap className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <h3 className="font-semibold text-lg">
                                {SHIP_CONFIGS[shipType].name}
                              </h3>
                              <Badge variant="outline" className="mt-1">
                                Locked
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {SHIP_CONFIGS[shipType].description}
                          </p>
                          <div className="text-sm text-yellow-400">
                            🔒 {status.reason}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  return <ShipCard key={shipType} shipType={shipType} />;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      <Card className="border-border bg-card/50">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {ships.salvageDrone === 0
              ? '🚀 Click to collect debris, then buy your first drone!'
              : ships.refineryBarge === 0
                ? `✨ Your ${ships.salvageDrone} drone${ships.salvageDrone > 1 ? 's are' : ' is'} collecting debris! Buy a Refinery Barge to convert debris into metal.`
                : `🏭 Production online! Your fleet is generating resources automatically.`}
          </p>
        </CardContent>
      </Card>

      {/* Mission History */}
      <MissionHistory />

      {/* Orbit Selector Dialog */}
      <OrbitSelector
        open={orbitSelectorOpen}
        onClose={() => setOrbitSelectorOpen(false)}
      />
    </div>
  );
}
