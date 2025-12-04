import { DerelictCard } from '@/components/DerelictCard';
import { MissionLauncher } from '@/components/MissionLauncher';
import { MissionQueue } from '@/components/MissionQueue';
import { OrbitSelector } from '@/components/OrbitSelector';
import { ORBIT_CONFIGS, getOrbitColor } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import type { Derelict, OrbitType } from '@/types';
import { useMemo, useState } from 'react';

export function DashboardView() {
  // Select state
  const ships = useGameStore(state => state.ships);
  const missions = useGameStore(state => state.missions);
  const travelState = useGameStore(state => state.travelState);
  const allDerelicts = useGameStore(state => state.derelicts);
  
  // Group derelicts by orbit
  const derelictsByOrbit = useMemo(() => {
    const grouped: Partial<Record<OrbitType, Derelict[]>> = {};
    allDerelicts.forEach(d => {
      if (!grouped[d.orbit]) grouped[d.orbit] = [];
      grouped[d.orbit]!.push(d);
    });
    return grouped;
  }, [allDerelicts]);

  const orbitOrder: OrbitType[] = ['leo', 'geo', 'lunar', 'mars', 'asteroidBelt', 'jovian', 'kuiper', 'deepSpace'];

  // Orbit selector state
  const [orbitSelectorOpen, setOrbitSelectorOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Missions Section */}
      {(ships.scoutProbe > 0 || ships.salvageFrigate > 0 || missions.length > 0 || allDerelicts.length > 0) && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-primary">🛰️</span>
              Missions & Salvage
            </h2>
            <div className="flex items-center gap-4">
              {travelState?.traveling && travelState.destination && (
                <div className="flex items-center gap-2 text-sm text-blue-400 animate-pulse bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  <span className="text-xs">🚀</span>
                  <span>Traveling to {ORBIT_CONFIGS[travelState!.destination].name}...</span>
                </div>
              )}
            </div>
          </div>

          {/* Mission Control & Active Missions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MissionLauncher />
            <MissionQueue />
          </div>

          {/* Discovered Derelicts */}
          {allDerelicts.length > 0 && (
            <div className="space-y-8">
              {orbitOrder.map(orbit => {
                const orbitDerelicts = derelictsByOrbit[orbit];
                if (!orbitDerelicts || orbitDerelicts.length === 0) return null;

                return (
                  <div key={orbit} className="space-y-3">
                    <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${getOrbitColor(orbit).replace('text-', 'bg-')}`} />
                       Discovered Derelicts in {ORBIT_CONFIGS[orbit].name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {orbitDerelicts.map(derelict => (
                        <DerelictCard key={derelict.id} derelict={derelict} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Orbit Selector Dialog */}
      <OrbitSelector
        open={orbitSelectorOpen}
        onClose={() => setOrbitSelectorOpen(false)}
      />
    </div>
  );
}
