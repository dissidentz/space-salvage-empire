import { ShipCard } from '@/components/ShipCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import type { ShipType } from '@/types';
import { Rocket, Zap } from 'lucide-react';
import { useMemo } from 'react';

export function DashboardView() {
  // Select state
  const ships = useGameStore(state => state.ships);
  const clickDebris = useGameStore(state => state.clickDebris);

  // Determine which ships to show
  const tier1Ships: ShipType[] = useMemo(() => {
    const allShips = Object.keys(SHIP_CONFIGS) as ShipType[];
    return allShips.filter(shipType => {
      const config = SHIP_CONFIGS[shipType];
      return config.tier === 1 && config.category === 'production';
    });
  }, []);

  // Check unlock status for each ship
  const shipUnlockStatus = useMemo(() => {
    const status: Record<ShipType, { unlocked: boolean; reason?: string }> =
      {} as Record<ShipType, { unlocked: boolean; reason?: string }>;

    tier1Ships.forEach(shipType => {
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

      status[shipType] = { unlocked: true };
    });

    return status;
  }, [tier1Ships, ships]);

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

      {/* Fleet Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span className="text-primary">⚡</span>
          Your Fleet
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tier1Ships.map(shipType => {
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
    </div>
  );
}
