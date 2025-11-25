// FleetPanel component - displays all available ships for purchase

import { SHIP_CONFIGS } from '@/config/ships';
import type { ShipType } from '@/types';
import { memo, useState } from 'react';
import { ShipCard } from './ShipCard';

export const FleetPanel = memo(() => {
  const [filter, setFilter] = useState<'all' | 'production' | 'active'>('all');

  // For now, just show salvageDrone and refineryBarge (basic ships)
  // TODO: Use getAvailableShips() when prestige/milestones types are defined
  const availableShips: ShipType[] = ['salvageDrone', 'refineryBarge'];

  // Filter ships by category
  const filteredShips = availableShips.filter(shipType => {
    if (filter === 'all') return true;
    const config = SHIP_CONFIGS[shipType];
    return config.category === filter;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Fleet</h2>
        
        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('production')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'production'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Production
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Active
          </button>
        </div>
      </div>

      {/* Ship Grid */}
      {filteredShips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShips.map(shipType => (
            <ShipCard key={shipType} shipType={shipType} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p>No ships available in this category.</p>
          <p className="text-sm mt-2">
            {filter === 'active' 
              ? 'Active ships unlock as you progress through orbits.'
              : 'Keep playing to unlock more ships!'}
          </p>
        </div>
      )}
    </div>
  );
});

FleetPanel.displayName = 'FleetPanel';
