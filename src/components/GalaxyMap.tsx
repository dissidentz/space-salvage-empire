import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ORBIT_CONFIGS, getOrbitColor } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import type { OrbitType } from '@/types';
import { Clock, Fuel, MapPin, Star, Target, Zap } from 'lucide-react';
import { useMemo } from 'react';

interface OrbitNode {
  orbit: OrbitType;
  x: number;
  y: number;
  radius: number;
  angle: number;
}

export function GalaxyMap() {
  const currentOrbit = useGameStore(state => state.currentOrbit);
  const travelState = useGameStore(state => state.travelState);
  const canTravelToOrbit = useGameStore(state => state.canTravelToOrbit);
  const travelToOrbit = useGameStore(state => state.travelToOrbit);
  const resources = useGameStore(state => state.resources);
  const derelicts = useGameStore(state => state.derelicts);

  // Generate stable star positions (pre-calculated to avoid Math.random in render)
  const stars = useMemo(
    () => [
      { id: 0, left: 12, top: 45, delay: 0.5, duration: 2.8 },
      { id: 1, left: 67, top: 23, delay: 1.2, duration: 3.1 },
      { id: 2, left: 89, top: 78, delay: 2.1, duration: 2.4 },
      { id: 3, left: 34, top: 12, delay: 0.8, duration: 3.5 },
      { id: 4, left: 56, top: 67, delay: 1.5, duration: 2.7 },
      { id: 5, left: 23, top: 89, delay: 2.3, duration: 3.2 },
      { id: 6, left: 78, top: 34, delay: 0.3, duration: 2.9 },
      { id: 7, left: 45, top: 56, delay: 1.8, duration: 3.0 },
      { id: 8, left: 91, top: 45, delay: 2.6, duration: 2.5 },
      { id: 9, left: 12, top: 78, delay: 0.9, duration: 3.3 },
      { id: 10, left: 67, top: 12, delay: 1.4, duration: 2.6 },
      { id: 11, left: 34, top: 89, delay: 2.0, duration: 3.4 },
      { id: 12, left: 89, top: 23, delay: 0.6, duration: 2.8 },
      { id: 13, left: 56, top: 45, delay: 1.7, duration: 3.1 },
      { id: 14, left: 23, top: 67, delay: 2.4, duration: 2.7 },
      { id: 15, left: 78, top: 12, delay: 0.2, duration: 3.2 },
      { id: 16, left: 45, top: 78, delay: 1.9, duration: 2.9 },
      { id: 17, left: 91, top: 34, delay: 2.7, duration: 3.0 },
      { id: 18, left: 12, top: 23, delay: 0.7, duration: 2.5 },
      { id: 19, left: 67, top: 56, delay: 1.3, duration: 3.3 },
      { id: 20, left: 34, top: 45, delay: 2.2, duration: 2.6 },
      { id: 21, left: 89, top: 67, delay: 0.4, duration: 3.4 },
      { id: 22, left: 56, top: 12, delay: 1.6, duration: 2.8 },
      { id: 23, left: 23, top: 34, delay: 2.5, duration: 3.1 },
      { id: 24, left: 78, top: 89, delay: 0.1, duration: 2.7 },
      { id: 25, left: 45, top: 23, delay: 1.0, duration: 3.2 },
      { id: 26, left: 91, top: 56, delay: 2.8, duration: 2.9 },
      { id: 27, left: 12, top: 67, delay: 0.5, duration: 3.0 },
      { id: 28, left: 67, top: 34, delay: 1.2, duration: 2.5 },
      { id: 29, left: 34, top: 78, delay: 2.1, duration: 3.3 },
      { id: 30, left: 89, top: 12, delay: 0.8, duration: 2.6 },
      { id: 31, left: 56, top: 89, delay: 1.5, duration: 3.4 },
      { id: 32, left: 23, top: 45, delay: 2.3, duration: 2.8 },
      { id: 33, left: 78, top: 67, delay: 0.3, duration: 3.1 },
      { id: 34, left: 45, top: 12, delay: 1.8, duration: 2.7 },
      { id: 35, left: 91, top: 78, delay: 2.6, duration: 3.2 },
      { id: 36, left: 12, top: 34, delay: 0.9, duration: 2.9 },
      { id: 37, left: 67, top: 67, delay: 1.4, duration: 3.0 },
      { id: 38, left: 34, top: 23, delay: 2.0, duration: 2.5 },
      { id: 39, left: 89, top: 56, delay: 0.6, duration: 3.3 },
      { id: 40, left: 56, top: 78, delay: 1.7, duration: 2.6 },
      { id: 41, left: 23, top: 12, delay: 2.4, duration: 3.4 },
      { id: 42, left: 78, top: 45, delay: 0.2, duration: 2.8 },
      { id: 43, left: 45, top: 89, delay: 1.9, duration: 3.1 },
      { id: 44, left: 91, top: 23, delay: 2.7, duration: 2.7 },
      { id: 45, left: 12, top: 56, delay: 0.7, duration: 3.2 },
      { id: 46, left: 67, top: 78, delay: 1.3, duration: 2.9 },
      { id: 47, left: 34, top: 12, delay: 2.2, duration: 3.0 },
      { id: 48, left: 89, top: 34, delay: 0.4, duration: 2.5 },
      { id: 49, left: 56, top: 67, delay: 1.6, duration: 3.3 },
    ],
    []
  );

  // Calculate orbit positions in a spiral pattern
  const orbitNodes = useMemo(() => {
    const nodes: Record<OrbitType, OrbitNode> = {} as Record<
      OrbitType,
      OrbitNode
    >;
    const centerX = 300;
    const centerY = 300;
    const baseRadius = 60;
    const radiusIncrement = 45;

    const orbitOrder: OrbitType[] = [
      'leo',
      'geo',
      'lunar',
      'mars',
      'asteroidBelt',
      'jovian',
      'kuiper',
      'deepSpace',
    ];

    orbitOrder.forEach((orbit, index) => {
      const radius = baseRadius + index * radiusIncrement;
      const angle = index * 45 * (Math.PI / 180); // Spread them out

      nodes[orbit] = {
        orbit,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius,
        angle,
      };
    });

    return nodes;
  }, []);

  const handleOrbitClick = (orbit: OrbitType) => {
    if (
      canTravelToOrbit(orbit) &&
      resources.fuel >= ORBIT_CONFIGS[orbit].fuelCost
    ) {
      travelToOrbit(orbit);
    }
  };

  const getOrbitStatus = (orbit: OrbitType) => {
    if (orbit === currentOrbit) return 'current';
    if (travelState?.destination === orbit) return 'traveling';
    if (canTravelToOrbit(orbit)) return 'available';
    return 'locked';
  };

  const getDerelictsInOrbit = (orbit: OrbitType) => {
    return derelicts.filter(d => d.orbit === orbit);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-linear-to-br from-slate-950 via-blue-950/20 to-purple-950/20 border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="relative">
            <Star className="w-8 h-8 text-yellow-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
          </div>
          <span className="bg-linear-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Galaxy Map
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Map Container */}
        <div className="relative w-full h-96 bg-linear-to-br from-slate-900/50 to-slate-800/30 rounded-xl border border-slate-600/30 overflow-hidden">
          {/* Background stars */}
          <div className="absolute inset-0">
            {stars.map(star => (
              <div
                key={star.id}
                className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.duration}s`,
                }}
              />
            ))}
          </div>

          {/* Central Sun */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg shadow-yellow-400/50 animate-pulse" />
            <div className="absolute inset-0 w-8 h-8 bg-yellow-400/30 rounded-full animate-ping" />
          </div>

          {/* Orbit Paths */}
          {Object.values(orbitNodes).map(node => (
            <div
              key={`orbit-${node.orbit}`}
              className="absolute border border-slate-600/30 rounded-full"
              style={{
                width: node.radius * 2,
                height: node.radius * 2,
                left: 300 - node.radius,
                top: 300 - node.radius,
              }}
            />
          ))}

          {/* Orbit Nodes */}
          {Object.entries(orbitNodes).map(([orbitKey, node]) => {
            const orbit = orbitKey as OrbitType;
            const config = ORBIT_CONFIGS[orbit];
            const status = getOrbitStatus(orbit);
            const derelictsInOrbit = getDerelictsInOrbit(orbit);
            const canAfford = resources.fuel >= config.fuelCost;

            return (
              <TooltipProvider key={orbit}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                        status === 'current'
                          ? 'scale-125 z-20'
                          : status === 'available' && canAfford
                            ? 'hover:scale-110 z-10'
                            : 'z-0'
                      }`}
                      style={{ left: node.x, top: node.y }}
                      onClick={() => handleOrbitClick(orbit)}
                    >
                      {/* Orbit Node */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 shadow-lg transition-all duration-300 ${
                          status === 'current'
                            ? 'bg-linear-to-br from-green-400 to-emerald-500 border-green-300 shadow-green-400/50 animate-pulse'
                            : status === 'traveling'
                              ? 'bg-linear-to-br from-blue-400 to-cyan-500 border-blue-300 shadow-blue-400/50 animate-pulse'
                              : status === 'available' && canAfford
                                ? 'bg-linear-to-br from-purple-400 to-pink-500 border-purple-300 shadow-purple-400/50 hover:shadow-purple-400/70'
                                : 'bg-slate-600 border-slate-500 opacity-50'
                        }`}
                      >
                        {/* Current location indicator */}
                        {status === 'current' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                        )}

                        {/* Traveling indicator */}
                        {status === 'traveling' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping" />
                        )}

                        {/* Derelict indicator */}
                        {derelictsInOrbit.length > 0 && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Target className="w-2 h-2 text-yellow-900" />
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>

                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getOrbitColor(orbit)}`}>
                          {config.name}
                        </span>
                        <Badge
                          variant={
                            status === 'current'
                              ? 'default'
                              : status === 'available'
                                ? 'secondary'
                                : 'outline'
                          }
                          className={
                            status === 'current'
                              ? 'bg-green-500/20 text-green-300 border-green-500/50'
                              : status === 'traveling'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                                : status === 'available'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                                  : 'bg-slate-500/20 text-slate-300 border-slate-500/50'
                          }
                        >
                          {status === 'current'
                            ? 'Current'
                            : status === 'traveling'
                              ? 'Traveling'
                              : status === 'available'
                                ? 'Available'
                                : 'Locked'}
                        </Badge>
                      </div>

                      {/* Production Multipliers */}
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="text-center p-1 bg-orange-500/10 rounded border border-orange-500/20">
                          <div className="text-orange-400 font-medium">
                            {config.metalMultiplier}x
                          </div>
                          <div className="text-muted-foreground">Metal</div>
                        </div>
                        <div className="text-center p-1 bg-blue-500/10 rounded border border-blue-500/20">
                          <div className="text-blue-400 font-medium">
                            {config.electronicsMultiplier}x
                          </div>
                          <div className="text-muted-foreground">
                            Electronics
                          </div>
                        </div>
                        <div className="text-center p-1 bg-purple-500/10 rounded border border-purple-500/20">
                          <div className="text-purple-400 font-medium">
                            {config.rareMultiplier}x
                          </div>
                          <div className="text-muted-foreground">Rare</div>
                        </div>
                      </div>

                      {/* Travel Info */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Fuel className="w-3 h-3 text-orange-400" />
                          <span>
                            Cost: {formatNumber(config.fuelCost)} fuel
                          </span>
                          {!canAfford && (
                            <span className="text-red-400">(Insufficient)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>Time: {formatTime(config.travelTime)}</span>
                        </div>
                        {derelictsInOrbit.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Target className="w-3 h-3 text-yellow-400" />
                            <span>
                              {derelictsInOrbit.length} derelict
                              {derelictsInOrbit.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {status === 'available' && canAfford && (
                        <Button
                          size="sm"
                          className="w-full mt-2 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          onClick={() => handleOrbitClick(orbit)}
                        >
                          Travel Here
                        </Button>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-linear-to-br from-green-400 to-emerald-500 rounded-full border border-green-300" />
            <span>Current Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-linear-to-br from-blue-400 to-cyan-500 rounded-full border border-blue-300" />
            <span>Traveling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-linear-to-br from-purple-400 to-pink-500 rounded-full border border-purple-300" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-600 rounded-full border border-slate-500" />
            <span>Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
              <Target className="w-2 h-2 text-yellow-900" />
            </div>
            <span>Derelicts</span>
          </div>
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-600/30">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            <span className="font-medium">
              Current:{' '}
              <span className={getOrbitColor(currentOrbit)}>
                {ORBIT_CONFIGS[currentOrbit].name}
              </span>
            </span>
          </div>
          {travelState?.traveling && (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
              <span className="font-medium">
                Traveling to:{' '}
                <span className={getOrbitColor(travelState.destination!)}>
                  {ORBIT_CONFIGS[travelState.destination!].name}
                </span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-orange-400" />
            <span>Fuel: {formatNumber(resources.fuel)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
