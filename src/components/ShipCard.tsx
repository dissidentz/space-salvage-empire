// ShipCard component - displays individual ship with purchase options
import { ShipUpgradePanel } from '@/components/ShipUpgradePanel';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import type { ShipType } from '@/types';
import {
    formatNumber,
    getResourceColor,
    getResourceName,
} from '@/utils/format';
import { AlertTriangle, ChevronDown, ChevronUp, Rocket, Zap } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { getUpgradesForShip } from '@/config/shipUpgrades';

interface ShipCardProps {
  shipType: ShipType;
}

export const ShipCard = memo(({ shipType }: ShipCardProps) => {
  const config = SHIP_CONFIGS[shipType];
  const [isExpanded, setIsExpanded] = useState(false);

  // Use stable selectors
  const shipCount = useGameStore(state => state.ships[shipType]);
  const shipEnabled = useGameStore(state => state.shipEnabled[shipType]);
  const resources = useGameStore(state => state.resources);
  const buyShip = useGameStore(state => state.buyShip);
  const getShipCost = useGameStore(state => state.getShipCost);
  const canAffordShip = useGameStore(state => state.canAffordShip);
  const toggleShip = useGameStore(state => state.toggleShip);
  const techTree = useGameStore(state => state.techTree);
  const shipUpgrades = useGameStore(state => state.shipUpgrades);

  // Upgrade Progress Calculation
  const { totalLevels, purchasedLevels } = useMemo(() => {
     const upgrades = getUpgradesForShip(shipType);
     return upgrades.reduce((acc, upgrade) => {
         acc.totalLevels += upgrade.maxLevel;
         acc.purchasedLevels += (shipUpgrades[upgrade.id]?.currentLevel || 0);
         return acc;
     }, { totalLevels: 0, purchasedLevels: 0 });
  }, [shipType, shipUpgrades]);
  
  const isFullyUpgraded = totalLevels > 0 && purchasedLevels >= totalLevels;

  // Calculate costs for different quantities
  const costs = useMemo(
    () => ({
      buy1: getShipCost(shipType, 1),
    }),
    [shipType, shipCount, getShipCost]
  );

  // Calculate affordability
  const canAfford = useMemo(
    () => ({
      buy1: canAffordShip(shipType, 1),
      buy10: canAffordShip(shipType, 10),
      buy100: canAffordShip(shipType, 100),
      buyMax: canAffordShip(shipType, 1) // Base check for Max
    }),
    [shipType, shipCount, resources, canAffordShip]
  );
  
  // Max Affordable Calculation
  const maxAffordable = useMemo(() => {
    // Binary search optimization
    let low = 0, high = 10000;
    let max = 0;
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        if (mid === 0) { low = 1; continue; }
        if (canAffordShip(shipType, mid)) {
            max = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return max;
  }, [shipType, shipCount, resources, canAffordShip]);

  const computedRates = useGameStore(state => state.computedRates);

  // Sustainability Check
  const sustainability = useMemo(() => {
    if (!config.consumesResource || !config.baseProduction)
      return { safe: true, message: null };

    const resource = config.consumesResource;
    const currentRate = computedRates[resource] ?? 0;
    const consumption = config.baseProduction;

    // Warning threshold: -0.1 production
    if (currentRate - consumption < -0.1) {
      return {
        safe: false,
        message: `Needs +${formatNumber(consumption)}/s ${getResourceName(resource)}`,
      };
    }
    return { safe: true, message: null };
  }, [config, computedRates]);

  const handleBuy = (amount: number) => {
    buyShip(shipType, amount);
  };

  return (
    <Card className={`border transition-all duration-300 overflow-hidden ${
        !shipEnabled ? 'opacity-75 border-slate-700 bg-slate-900/40' : 
        config.category === 'production' ? 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50' :
        'border-blue-500/30 bg-blue-950/10 hover:border-blue-500/50'
    }`}>
      {/* Compact Header */}
      <CardHeader className="p-4 py-3 flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
             config.category === 'production' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
             {config.category === 'production' ? <Zap className="w-5 h-5"/> : <Rocket className="w-5 h-5"/>}
          </div>
          <div>
            <CardTitle className="text-base font-bold tracking-wide flex items-center gap-2">
                {config.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                <span className="bg-white/5 px-1.5 rounded">Tier {config.tier}</span>
                {config.producesResource && (
                     <span className={`${getResourceColor(config.producesResource)} font-mono font-medium flex items-center gap-1`}>
                        +{formatNumber((config.baseProduction || 0) * (config.conversionRatio || 1))} {getResourceName(config.producesResource)}/s
                     </span>
                )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-2xl font-mono font-bold leading-none">{formatNumber(shipCount)}</div>
                <div className="text-[10px] uppercase text-muted-foreground font-semibold">Active</div>
            </div>
            
            {shipCount > 0 && (
                <div className="flex items-center gap-2 ml-2 border-l border-white/10 pl-4">
                    <Switch
                        id={`toggle-${shipType}`}
                        checked={shipEnabled}
                        onCheckedChange={() => toggleShip(shipType)}
                        className="scale-90"
                    />
                </div>
            )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1">
        {/* Cost Display (Buy 1) */}
        <div className="mb-3 flex flex-wrap gap-2 items-center text-xs">
           <span className="text-muted-foreground uppercase tracking-wider font-bold text-[10px]">Cost:</span>
           {Object.entries(costs.buy1).map(([resource, amount]) => {
               const hasEnough = (resources[resource as keyof typeof resources] || 0) >= amount;
               return (
                   <div key={resource} className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${
                       hasEnough ? 'border-slate-700 bg-slate-800/50 text-slate-300' : 'border-red-900/50 bg-red-950/30 text-red-400'
                   }`}>
                       <span className={`w-2 h-2 rounded-full ${hasEnough ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                       <span className="capitalize">{getResourceName(resource)}</span>
                       <span className="font-mono">{formatNumber(amount)}</span>
                   </div>
               )
           })}
        </div>
        
        {/* Sustainability Warning */}
        {!sustainability.safe && (
           <div className="mb-3 flex items-center gap-2 text-xs text-red-500 bg-red-950/20 border border-red-900/50 p-2 rounded">
               <AlertTriangle className="w-4 h-4" />
               <span className="font-semibold">{sustainability.message}</span>
           </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
            <Button 
                size="sm" 
                variant={canAfford.buy1 ? "default" : "secondary"}
                className={`h-8 text-xs ${canAfford.buy1 ? 'bg-emerald-600 hover:bg-emerald-500' : ''}`}
                disabled={!canAfford.buy1 || !sustainability.safe}
                onClick={() => handleBuy(1)}
            >
                Buy 1
            </Button>

            {techTree.purchased.includes('bulk_purchasing_1') && (
                <Button 
                    size="sm" variant="outline" className="h-8 text-xs border-slate-700 hover:bg-slate-800"
                    disabled={!canAfford.buy10 || !sustainability.safe}
                    onClick={() => handleBuy(10)}
                >
                    Buy 10
                </Button>
            )}

            {techTree.purchased.includes('bulk_purchasing_2') && (
                <Button 
                    size="sm" variant="outline" className="h-8 text-xs border-slate-700 hover:bg-slate-800"
                    disabled={!canAfford.buy100 || !sustainability.safe}
                    onClick={() => handleBuy(100)}
                >
                    Buy 100
                </Button>
            )}
            
            {techTree.purchased.includes('bulk_purchasing_3') && (
                <Button 
                    size="sm" variant="outline" className="h-8 text-xs border-amber-900/30 text-amber-500 hover:bg-amber-950/30"
                    disabled={maxAffordable === 0 || !sustainability.safe}
                    onClick={() => handleBuy(maxAffordable)}
                >
                    Max ({formatNumber(maxAffordable)})
                </Button>
            )}
        </div>
      </CardContent>

      {/* Expandable Upgrade Section */}
      <div className="border-t border-slate-800 bg-black/20">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full flex items-center justify-center gap-2 py-1.5 text-xs transition-colors ${
                isFullyUpgraded ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20' : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
             <span>
                 Manage Upgrades 
                 {totalLevels > 0 && <span className="ml-1 opacity-70">({purchasedLevels}/{totalLevels})</span> }
             </span>
             {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          
          {isExpanded && (
              <div className="p-4 pt-2 border-t border-slate-800 animate-in slide-in-from-top-2 duration-200">
                  <ShipUpgradePanel shipType={shipType} />
              </div>
          )}
      </div>
    </Card>
  );
});

ShipCard.displayName = 'ShipCard';
