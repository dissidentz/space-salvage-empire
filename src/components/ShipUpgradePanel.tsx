import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getUpgradesForShip } from '@/config/shipUpgrades';
import { useGameStore } from '@/stores/gameStore';
import type { ShipType } from '@/types';
import { formatNumber } from '@/utils/format';
import { ArrowUp } from 'lucide-react';
import React from 'react';

interface ShipUpgradePanelProps {
  shipType: ShipType;
}

export const ShipUpgradePanel: React.FC<ShipUpgradePanelProps> = ({ shipType }) => {
  const upgrades = getUpgradesForShip(shipType);
  console.log('ShipUpgradePanel rendering for', shipType, upgrades);
  const { 
    shipUpgrades, 
    purchaseUpgrade, 
    canAffordUpgrade, 
    resources 
  } = useGameStore();

  if (upgrades.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        No upgrades available for this ship type.
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] w-full pr-4">
      <div className="space-y-4">
        {upgrades.map((upgrade) => {
          const currentLevel = shipUpgrades[upgrade.id]?.currentLevel || 0;
          const isMaxed = currentLevel >= upgrade.maxLevel;
          const canAfford = canAffordUpgrade(upgrade.id);
          
          return (
            <Card key={upgrade.id} className="bg-secondary/20 border-secondary/40">
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {upgrade.name}
                      {isMaxed && <Badge variant="secondary" className="text-xs">MAX</Badge>}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {upgrade.description}
                    </CardDescription>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    Lvl {currentLevel} / {upgrade.maxLevel}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="flex justify-between items-center mt-2">
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-muted-foreground">Cost:</div>
                    {Object.entries(upgrade.baseCost).map(([res, amount]) => {
                      const hasEnough = (resources[res as keyof typeof resources] || 0) >= amount;
                      return (
                        <div key={res} className={`flex items-center gap-1 ${hasEnough ? 'text-foreground' : 'text-destructive'}`}>
                          <span className="capitalize">{res}:</span>
                          <span>{formatNumber(amount)}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button 
                    size="sm" 
                    disabled={isMaxed || !canAfford}
                    onClick={() => purchaseUpgrade(upgrade.id)}
                    className="gap-2"
                  >
                    {isMaxed ? (
                      <>Maxed</>
                    ) : (
                      <>
                        <ArrowUp className="h-4 w-4" />
                        Upgrade
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};
