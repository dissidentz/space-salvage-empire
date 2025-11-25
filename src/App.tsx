// Simple App with game loop and basic ship buying
import { useMemo } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './stores/gameStore';
import { formatNumber } from './utils/format';
import { calculateShipCost } from './utils/formulas';

function App() {
  // Start the game loop
  useGameLoop();

  // Select state
  const debris = useGameStore(state => state.resources.debris);
  const metal = useGameStore(state => state.resources.metal);
  const droneCount = useGameStore(state => state.ships.salvageDrone);
  const clickDebris = useGameStore(state => state.clickDebris);
  const buyShip = useGameStore(state => state.buyShip);

  // Calculate drone cost (memoized to avoid recalculation)
  const droneCost = useMemo(() => 
    calculateShipCost('salvageDrone', droneCount),
    [droneCount]
  );

  // Check if can afford drone
  const canAffordDrone = debris >= (droneCost.debris || 0);

  const handleBuyDrone = () => {
    if (canAffordDrone) {
      buyShip('salvageDrone', 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Space Salvage Empire
      </h1>
      
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Resources */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-sm text-slate-400">Debris</div>
            <div className="text-3xl font-mono font-bold text-gray-300">
              {formatNumber(debris)}
            </div>
            {droneCount > 0 && (
              <div className="text-xs text-green-400 mt-1">
                +{formatNumber(droneCount)}/s
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="text-sm text-slate-400">Metal</div>
            <div className="text-3xl font-mono font-bold text-slate-300">
              {formatNumber(metal)}
            </div>
          </div>
        </div>

        {/* Click Button */}
        <button
          onClick={clickDebris}
          className="w-full py-4 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-xl font-bold shadow-lg transition-all active:scale-95"
        >
          Click for Debris
        </button>

        {/* Salvage Drone Card */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Salvage Drone</h3>
              <p className="text-sm text-slate-400">Owned: {droneCount}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">Tier 1</div>
            </div>
          </div>

          <p className="text-sm text-slate-300 mb-4">
            Basic autonomous salvage unit that collects debris from orbit
          </p>

          <div className="bg-slate-900 p-3 rounded mb-4">
            <div className="text-xs text-slate-400 mb-1">Production</div>
            <div className="text-sm">
              <span className="text-gray-300">1 debris/sec</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-400 mb-1">Cost</div>
            <div className="text-sm text-gray-300">
              {formatNumber(droneCost.debris || 0)} Debris
            </div>
          </div>

          <button
            onClick={handleBuyDrone}
            disabled={!canAffordDrone}
            className={`w-full py-3 rounded font-bold transition-all ${
              canAffordDrone
                ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Buy Drone
          </button>
        </div>

        <div className="text-center text-slate-400 text-sm">
          {droneCount === 0 
            ? 'Click to collect debris, then buy your first drone!'
            : `Your ${droneCount} drone${droneCount > 1 ? 's are' : ' is'} collecting debris automatically!`
          }
        </div>
      </div>
    </div>
  );
}

export default App;
