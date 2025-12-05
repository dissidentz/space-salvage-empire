import { useGameStore } from '@/stores/gameStore';
import { Settings2 } from 'lucide-react';

export function AutomationSettings() {
  const { techTree, ui, derelicts, toggleAutoScout, toggleAutoSalvage, setAutoScoutTargetLimit } = useGameStore();
  
  const hasAutoScout = techTree.purchased.includes('auto_scout');
  const hasAutoSalvage = techTree.purchased.includes('auto_salvage');
  
  // Safety check: if automationSettings is undefined (old save data), don't render
  if (!ui?.automationSettings) return null;
  if (!hasAutoScout && !hasAutoSalvage) return null;
  
  const targetLimit = ui.automationSettings.autoScoutTargetLimit ?? 5;
  const currentDerelicts = derelicts?.length ?? 0;
  const isAtLimit = currentDerelicts >= targetLimit;
  
  return (
    <div className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Settings2 className="w-3.5 h-3.5" />
          <span className="font-medium">Auto:</span>
        </div>
        
        {hasAutoScout && (
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={ui.automationSettings.autoScoutEnabled}
                onChange={toggleAutoScout}
                className="w-3.5 h-3.5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-1"
              />
              <span className={ui.automationSettings.autoScoutEnabled ? 'text-blue-300' : 'text-slate-400'}>
                Scout
              </span>
            </label>
            {ui.automationSettings.autoScoutEnabled && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`font-mono ${isAtLimit ? 'text-green-400' : 'text-yellow-400'}`}>
                  {currentDerelicts}/{targetLimit}
                </span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={targetLimit}
                  onChange={(e) => setAutoScoutTargetLimit(parseInt(e.target.value))}
                  className="w-16 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}
          </div>
        )}
        
        {hasAutoSalvage && (
          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={ui.automationSettings.autoSalvageEnabled}
              onChange={toggleAutoSalvage}
              className="w-3.5 h-3.5 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-1"
            />
            <span className={ui.automationSettings.autoSalvageEnabled ? 'text-purple-300' : 'text-slate-400'}>
              Salvage
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
