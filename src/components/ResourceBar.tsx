// Simplified ResourceBar component - displays resources only

import { useGameStore } from '@/stores/gameStore';
import { formatNumber, getResourceColor, getResourceName } from '@/utils/format';
import { memo } from 'react';

export const ResourceBar = memo(() => {
  const resources = useGameStore(state => state.resources);

  // Only show debris and metal for now (simplest version)
  const resourcesToShow = [
    ['debris', resources.debris],
    ['metal', resources.metal],
  ].filter(([_, amount]) => amount > 0 || _ === 'debris'); // Always show debris

  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-3">
      <div className="flex flex-wrap gap-6">
        {resourcesToShow.map(([resourceType, amount]) => (
          <div key={resourceType} className="flex items-center gap-2">
            <div>
              <div className="text-xs text-slate-400">
                {getResourceName(resourceType as string)}
              </div>
              <div className={`text-lg font-mono font-semibold ${getResourceColor(resourceType as string)}`}>
                {formatNumber(amount as number)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ResourceBar.displayName = 'ResourceBar';
