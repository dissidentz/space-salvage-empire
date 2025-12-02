import { DerelictCard } from '@/components/DerelictCard';
import { MissionCard } from '@/components/MissionCard';
import { OrbitSelector } from '@/components/OrbitSelector';
import { ShipCard } from '@/components/ShipCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ORBIT_CONFIGS } from '@/config/orbits';
import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import type { OrbitType, ShipType } from '@/types';
import { formatTime } from '@/utils/format';
import { Radar, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';

export function DashboardView() {
  // Select state
  const ships = useGameStore(state => state.ships);
  const currentOrbit = useGameStore(state => state.currentOrbit);
  const missions = useGameStore(state => state.missions);
  const allDerelicts = useGameStore(state => state.derelicts);
  const derelicts = useMemo(() => allDerelicts.filter(d => d.orbit === currentOrbit), [allDerelicts, currentOrbit]);
  const startScoutMission = useGameStore(state => state.startScoutMission);
  const resources = useGameStore(state => state.resources);

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
      // Show all ships (production and active)
      grouped[config.tier].push(shipType);
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
      {/* Missions Section */}
      {(ships.scoutProbe > 0 || ships.salvageFrigate > 0 || missions.length > 0 || derelicts.length > 0) && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-primary">🛰️</span>
            Missions & Salvage
          </h2>

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
                        Scout Probe Missions
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Send a probe to scan {ORBIT_CONFIGS[currentOrbit].name} for derelicts.
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {ships.scoutProbe - missions.filter(m => m.shipType === 'scoutProbe').length} / {ships.scoutProbe} Available
                    </Badge>
                  </div>

                  {/* Show active scout missions */}
                  {missions.filter(m => m.shipType === 'scoutProbe').length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Missions in Progress ({missions.filter(m => m.shipType === 'scoutProbe').length}):
                      </h4>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {missions.filter(m => m.shipType === 'scoutProbe').map(mission => (
                          <MissionCard key={mission.id} mission={mission} />
                        ))}
                      </div>
                    </div>
                  )}
                  
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

      {/* Orbit Selector Dialog */}
      <OrbitSelector
        open={orbitSelectorOpen}
        onClose={() => setOrbitSelectorOpen(false)}
      />
    </div>
  );
}
