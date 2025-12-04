import { useGameStore } from '@/stores/gameStore';

export function AutomationSettings() {
  const { techTree, ui, toggleAutoScout, toggleAutoSalvage } = useGameStore();
  
  const hasAutoScout = techTree.purchased.includes('auto_scout');
  const hasAutoSalvage = techTree.purchased.includes('auto_salvage');
  
  // Safety check: if automationSettings is undefined (old save data), don't render
  if (!ui?.automationSettings) return null;
  if (!hasAutoScout && !hasAutoSalvage) return null;
  
  return (
    <div className="automation-settings p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <h3 className="text-lg font-semibold text-blue-400 mb-3">Automation</h3>
      
      <div className="space-y-2">
        {hasAutoScout && (
          <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/30 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={ui.automationSettings.autoScoutEnabled}
              onChange={toggleAutoScout}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-slate-200">
              Auto-Scout
              <span className="text-xs text-slate-400 ml-2">
                (Automatically deploy scouts to unlocked orbits)
              </span>
            </span>
          </label>
        )}
        
        {hasAutoSalvage && (
          <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/30 p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={ui.automationSettings.autoSalvageEnabled}
              onChange={toggleAutoSalvage}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-slate-200">
              Auto-Salvage
              <span className="text-xs text-slate-400 ml-2">
                (Auto-salvage common derelicts in colonized orbits)
              </span>
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
