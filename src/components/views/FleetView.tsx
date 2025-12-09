import { FleetFormations } from '@/components/FleetFormations';
import { ShipCard } from '@/components/ShipCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ORBIT_CONFIGS } from '@/config/orbits';
import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import type { OrbitType, ShipType } from '@/types';
import { Zap } from 'lucide-react';
import { useMemo } from 'react';

export function FleetView() {
  const ships = useGameStore(state => state.ships);
  const currentOrbit = useGameStore(state => state.currentOrbit);

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
      if (req?.ships) {
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
      if (req?.orbit) {
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
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <span className="text-primary">⚡</span>
        Your Fleet
      </h2>

      {/* Fleet Formations */}
      <FleetFormations />


      {/* Render ships grouped by tier */}
      {Object.entries(shipsByTier).map(([tier, shipList]) => {
        // Skip empty tiers
        if (shipList.length === 0) return null;

        // Check if any ships in this tier are unlocked or owned
        const hasVisibleShips = shipList.some(
          shipType =>
            shipUnlockStatus[shipType]?.unlocked ||
            ships[shipType] > 0
        );

        if (!hasVisibleShips) return null;

        return (
          <div key={tier} className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-300">
              Tier {tier} Ships
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
              {shipList.map((shipType: ShipType) => {
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
  );
}
