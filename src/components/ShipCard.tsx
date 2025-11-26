// ShipCard component - displays individual ship with purchase options

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import type { ShipType } from '@/types';
import { formatNumber, getResourceColor, getResourceName } from '@/utils/format';
import { ArrowRight, Rocket, Zap } from 'lucide-react';
import { memo, useMemo } from 'react';

interface ShipCardProps {
  shipType: ShipType;
}

export const ShipCard = memo(({ shipType }: ShipCardProps) => {
  const config = SHIP_CONFIGS[shipType];
  
  // Use stable selectors
  const shipCount = useGameStore(state => state.ships[shipType]);
  const shipEnabled = useGameStore(state => state.shipEnabled[shipType]);
  const resources = useGameStore(state => state.resources);
  const buyShip = useGameStore(state => state.buyShip);
  const getShipCost = useGameStore(state => state.getShipCost);
  const canAffordShip = useGameStore(state => state.canAffordShip);
  const toggleShip = useGameStore(state => state.toggleShip);

  // Calculate costs for different quantities
  const costs = useMemo(() => ({
    buy1: getShipCost(shipType, 1),
    buy10: getShipCost(shipType, 10),
    buy100: getShipCost(shipType, 100),
  }), [shipType, getShipCost]);

  // Calculate affordability for each quantity
  const canAfford = useMemo(() => ({
    buy1: canAffordShip(shipType, 1),
    buy10: canAffordShip(shipType, 10),
    buy100: canAffordShip(shipType, 100),
  }), [shipType, canAffordShip]);

  // Calculate max affordable
  const maxAffordable = useMemo(() => {
    // Simple binary search for max affordable (could be optimized)
    let max = 0;
    for (let i = 1; i <= 1000; i *= 10) {
      if (canAffordShip(shipType, i)) {
        max = i;
      } else {
        break;
      }
    }
    // Fine-tune
    for (let i = max; i <= max * 10; i++) {
      if (canAffordShip(shipType, i)) {
        max = i;
      } else {
        break;
      }
    }
    return max;
  }, [shipType, canAffordShip]);

  const computedRates = useGameStore(state => state.computedRates);

  // Check sustainability (prevent death spirals)
  const sustainability = useMemo(() => {
    if (!config.consumesResource || !config.baseProduction) return { safe: true, message: null };
    
    const resource = config.consumesResource;
    const currentRate = computedRates[resource] ?? 0;
    const consumption = config.baseProduction;
    
    // Allow if we have a massive stockpile (e.g. > 1 hour of consumption)
    // But for now, strict check as requested
    if (currentRate - consumption < -0.1) { // Use -0.1 to avoid floating point issues
      return {
        safe: false,
        message: `Requires +${formatNumber(consumption)}/s ${getResourceName(resource)} production (Current: ${formatNumber(currentRate)}/s)`
      };
    }
    
    return { safe: true, message: null };
  }, [config, computedRates]);

  const handleBuy = (amount: number) => {
    buyShip(shipType, amount);
  };

  return (
    <Card className={`border-border bg-card hover:border-primary/50 transition-all duration-300 ${!shipEnabled ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {config.category === 'production' ? (
                <Zap className="w-5 h-5 text-yellow-400" />
              ) : (
                <Rocket className="w-5 h-5 text-blue-400" />
              )}
              <CardTitle className="text-xl">{config.name}</CardTitle>
              <Badge variant="secondary">Tier {config.tier}</Badge>
              {!shipEnabled && <Badge variant="outline" className="text-orange-400">Disabled</Badge>}
            </div>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {formatNumber(shipCount)}
            </Badge>
            {shipCount > 0 && (
              <div className="flex items-center gap-2">
                <Label htmlFor={`toggle-${shipType}`} className="text-xs cursor-pointer">
                  {shipEnabled ? 'On' : 'Off'}
                </Label>
                <Switch
                  id={`toggle-${shipType}`}
                  checked={shipEnabled}
                  onCheckedChange={() => toggleShip(shipType)}
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Production Info */}
        {config.category === 'production' && (
          <div className="bg-background/50 p-4 rounded-lg border border-border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Production
            </div>
            {config.consumesResource && config.conversionRatio ? (
              // Converter ship (Refinery, Fuel Synthesizer)
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="capitalize text-muted-foreground">
                    {getResourceName(config.consumesResource)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize text-muted-foreground">
                    {getResourceName(config.producesResource!)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="text-lg font-semibold text-primary">
                    {config.baseProduction} : {config.baseProduction! * config.conversionRatio}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Per Ship</span>
                  <span className={`text-sm font-mono ${getResourceColor(config.producesResource!)}`}>
                    +{config.baseProduction! * config.conversionRatio}/s
                  </span>
                </div>
              </div>
            ) : (
              // Simple production ship (Drone, Extractor, Miner)
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <span className="text-lg font-semibold text-green-300">
                    +{config.baseProduction} {getResourceName(config.producesResource!)}/s
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cost for Buy 1 */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Cost (Buy 1)
          </div>
          <div className="space-y-1">
            {Object.entries(costs.buy1).map(([resource, amount]) => {
              const hasEnough = resources[resource as keyof typeof resources] >= amount;
              return (
                <div key={resource} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{getResourceName(resource)}</span>
                  <span className={`font-mono ${hasEnough ? getResourceColor(resource) : 'text-red-400'}`}>
                    {formatNumber(amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sustainability Warning */}
        {!sustainability.safe && (
          <div className="bg-destructive/10 border border-destructive/50 rounded p-3 text-xs text-destructive flex items-start gap-2">
             <div className="mt-0.5">⚠️</div>
             <div>
               <div className="font-bold">Production Deficit Warning</div>
               <div>{sustainability.message}</div>
             </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2">
        {/* Primary buy buttons */}
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => handleBuy(1)}
            disabled={!canAfford.buy1 || !sustainability.safe}
            className="flex-1"
            size="sm"
          >
            Buy 1
          </Button>
          <Button
            onClick={() => handleBuy(10)}
            disabled={!canAfford.buy10 || !sustainability.safe}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Buy 10
          </Button>
        </div>
        
        {/* Secondary buy buttons */}
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => handleBuy(100)}
            disabled={!canAfford.buy100 || !sustainability.safe}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Buy 100
          </Button>
          <Button
            onClick={() => handleBuy(maxAffordable)}
            disabled={maxAffordable === 0 || !sustainability.safe}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            Max ({formatNumber(maxAffordable)})
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});

ShipCard.displayName = 'ShipCard';
