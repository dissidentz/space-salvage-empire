import { FORMATION_CONFIGS } from '@/config/formations';
import { SHIP_CONFIGS } from '@/config/ships';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import type { FormationType, ShipType } from '@/types';
import { Shield, Timer } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

export function FleetFormations() {
  const activeFormation = useGameStore(state => state.activeFormation);
  const formationCooldownEnd = useGameStore(state => state.formationCooldownEnd);
  const setFormation = useGameStore(state => state.setFormation);
  const ships = useGameStore(state => state.ships);
  const techPurchased = useGameStore(state => state.techTree.purchased);

  const isUnlocked = techPurchased.includes('fleet_management');
  const now = Date.now();
  const isOnCooldown = now < formationCooldownEnd;
  const cooldownRemaining = Math.max(0, Math.ceil((formationCooldownEnd - now) / 1000));

  if (!isUnlocked) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fleet Formations
          </CardTitle>
          <CardDescription>
            Research "Fleet Management" (Tier 4 Economy) to unlock advanced fleet coordination.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleSetFormation = (type: FormationType) => {
    if (activeFormation === type) {
      setFormation(null); // Deactivate
    } else {
      setFormation(type);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Fleet Formations
          </CardTitle>
          {isOnCooldown && (
            <Badge variant="outline" className="flex items-center gap-1 text-yellow-500 border-yellow-500">
              <Timer className="h-3 w-3" />
              Cooldown: {cooldownRemaining}s
            </Badge>
          )}
        </div>
        <CardDescription>
          Organize your ships into specialized formations for bonuses. Switching formations triggers a cooldown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid gap-4">
            {Object.values(FORMATION_CONFIGS).map((config) => {
              const isActive = activeFormation === config.id;
              
              // Check requirements
              let meetsRequirements = true;
              const missingRequirements: string[] = [];
              
              Object.entries(config.requirements).forEach(([shipId, count]) => {
                const current = ships[shipId as ShipType] || 0;
                if (current < (count as number)) {
                  meetsRequirements = false;
                  missingRequirements.push(`${count}x ${SHIP_CONFIGS[shipId as ShipType].name}`);
                }
              });

              // Special case for Production Fleet if we implemented "Total Ships"
              if (config.id === 'productionFleet') {
                  const totalShips = Object.values(ships).reduce((a, b) => a + b, 0);
                  if (totalShips < 50) {
                      // Only show if not already failing other reqs (though production fleet currently has other reqs too)
                      // Actually config.requirements handles the specific ships.
                      // If we want to enforce total ships visually:
                      // missingRequirements.push("50 Total Ships");
                  }
              }

              return (
                <div 
                  key={config.id}
                  className={cn(
                    "relative p-4 rounded-lg border transition-all",
                    isActive 
                      ? "border-blue-500 bg-blue-500/10" 
                      : "border-border hover:border-blue-500/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {config.name}
                        {isActive && <Badge className="bg-blue-500">Active</Badge>}
                      </h4>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                    <Button
                      variant={isActive ? "secondary" : "default"}
                      size="sm"
                      disabled={(!isActive && (isOnCooldown || !meetsRequirements))}
                      onClick={() => handleSetFormation(config.id)}
                    >
                      {isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {/* Effects */}
                    <div className="text-sm">
                      <span className="text-muted-foreground font-medium">Effects:</span>
                      <ul className="list-disc list-inside text-green-400">
                        {config.effects.map((effect, idx) => (
                          <li key={idx}>{effect.description}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div className="text-sm">
                      <span className="text-muted-foreground font-medium">Requirements:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(config.requirements).map(([shipId, count]) => {
                          const current = ships[shipId as ShipType] || 0;
                          const met = current >= (count as number);
                          return (
                            <Badge 
                              key={shipId} 
                              variant="outline"
                              className={cn(
                                met ? "text-green-500 border-green-500/30" : "text-red-500 border-red-500/30"
                              )}
                            >
                              {current}/{count} {SHIP_CONFIGS[shipId as ShipType].name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
