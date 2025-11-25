// ShipCard component - displays individual ship with purchase options

import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import type { ShipType } from '@/types';
import { formatNumber, getResourceColor } from '@/utils/format';
import { Rocket, Zap } from 'lucide-react';
import { memo } from 'react';

interface ShipCardProps {
  shipType: ShipType;
}

export const ShipCard = memo(({ shipType }: ShipCardProps) => {
  const config = SHIP_CONFIGS[shipType];
  
  // Use stable selectors - only select primitive values
  const shipCount = useGameStore(state => state.ships[shipType]);
  const resources = useGameStore(state => state.resources);
  const buyShip = useGameStore(state => state.buyShip);

  // Calculate cost and affordability in the component (not from store)
  const cost = useGameStore(state => state.getShipCost(shipType, 1));
  
  // Check affordability manually
  const canAfford = Object.entries(cost).every(([resource, amount]) => 
    resources[resource as keyof typeof resources] >= amount
  );

  const handleBuy = (amount: number) => {
    buyShip(shipType, amount);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {config.category === 'production' ? (
            <Zap className="w-5 h-5 text-yellow-400" />
          ) : (
            <Rocket className="w-5 h-5 text-blue-400" />
          )}
          <div>
            <h3 className="font-semibold text-white">{config.name}</h3>
            <p className="text-xs text-slate-400">Owned: {formatNumber(shipCount)}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500">Tier {config.tier}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 mb-3">{config.description}</p>

      {/* Production Info */}
      {config.category === 'production' && config.producesResource && (
        <div className="mb-3 p-2 bg-slate-900 rounded">
          <div className="text-xs text-slate-400 mb-1">Production</div>
          <div className="flex items-center justify-between">
            <span className="text-sm capitalize">{config.producesResource}</span>
            <span className={`text-sm font-mono ${getResourceColor(config.producesResource)}`}>
              {config.baseProduction}/s per ship
            </span>
          </div>
        </div>
      )}

      {/* Cost */}
      <div className="mb-3">
        <div className="text-xs text-slate-400 mb-1">Cost</div>
        <div className="space-y-1">
          {Object.entries(cost).map(([resource, amount]) => (
            <div key={resource} className="flex items-center justify-between text-sm">
              <span className="capitalize">{resource}</span>
              <span className={`font-mono ${getResourceColor(resource)}`}>
                {formatNumber(amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Buy Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleBuy(1)}
          disabled={!canAfford}
          className={`flex-1 px-3 py-2 rounded font-medium text-sm transition-colors ${
            canAfford
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          Buy 1
        </button>
      </div>
    </div>
  );
});

ShipCard.displayName = 'ShipCard';
