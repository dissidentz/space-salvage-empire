import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ORBIT_CONFIGS } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import { Clock, Fuel, MapPin, Plane, TrendingUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TravelProgress() {
  const travelState = useGameStore(state => state.travelState);
  const cancelTravel = useGameStore(state => state.cancelTravel);
  const getTravelProgress = useGameStore(state => state.getTravelProgress);
  const currentOrbit = useGameStore(state => state.currentOrbit);

  const [remainingTime, setRemainingTime] = useState<string>('');
  const [eta, setEta] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!travelState?.traveling) return;

    const updateTime = () => {
      const now = Date.now();
      const remainingMs = travelState.endTime - now;
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      setRemainingTime(minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`);

      // Calculate ETA
      const etaDate = new Date(now + remainingMs);
      setEta(
        etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [travelState]);

  if (!travelState?.traveling) {
    return null;
  }

  const destination = travelState.destination!;
  const config = ORBIT_CONFIGS[destination];
  const currentConfig = ORBIT_CONFIGS[currentOrbit];
  const progress = getTravelProgress();
  const progressPercent = Math.round(progress * 100);

  // Calculate production preview
  const metalBonus = config.metalMultiplier / currentConfig.metalMultiplier;
  const electronicsBonus =
    config.electronicsMultiplier / currentConfig.electronicsMultiplier;
  const rareBonus = config.rareMultiplier / currentConfig.rareMultiplier;

  const getTravelPhase = () => {
    if (progress < 0.25)
      return { phase: 'Accelerating', color: 'text-blue-400' };
    if (progress < 0.75) return { phase: 'Cruising', color: 'text-cyan-400' };
    return { phase: 'Decelerating', color: 'text-green-400' };
  };

  const travelPhase = getTravelPhase();

  return (
    <Card className="border-blue-500/50 bg-linear-to-br from-blue-950/50 to-cyan-950/50 backdrop-blur shadow-2xl shadow-blue-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Plane className="w-5 h-5 text-blue-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>Traveling to {config.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full bg-blue-500/20 ${travelPhase.color} font-medium`}
                >
                  {travelPhase.phase}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={cancelTravel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`h-8 w-8 p-0 transition-all duration-200 ${
              isHovered
                ? 'hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20'
                : 'hover:bg-red-500/10 hover:border-red-500/30'
            }`}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Travel Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-mono">
                {progressPercent}%
              </span>
              <span className="text-xs text-muted-foreground">complete</span>
            </div>
          </div>
          <div className="relative">
            <Progress value={progressPercent} className="h-3 bg-blue-950/50" />
            <div
              className="absolute top-0 left-0 h-3 bg-linear-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-pulse rounded-full" />
          </div>
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-muted-foreground">Time Remaining</div>
              <div className="font-mono font-medium text-blue-300">
                {remainingTime}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <div>
              <div className="text-muted-foreground">ETA</div>
              <div className="font-mono font-medium text-green-300">{eta}</div>
            </div>
          </div>
        </div>

        {/* Production Preview */}
        <div className="border-t border-blue-500/20 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-400">
              Production Preview
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-orange-500/10 rounded border border-orange-500/20">
              <div className="text-orange-400 font-medium">
                {metalBonus.toFixed(1)}x
              </div>
              <div className="text-muted-foreground">Metal</div>
            </div>
            <div className="text-center p-2 bg-blue-500/10 rounded border border-blue-500/20">
              <div className="text-blue-400 font-medium">
                {electronicsBonus.toFixed(1)}x
              </div>
              <div className="text-muted-foreground">Electronics</div>
            </div>
            <div className="text-center p-2 bg-purple-500/10 rounded border border-purple-500/20">
              <div className="text-purple-400 font-medium">
                {rareBonus.toFixed(1)}x
              </div>
              <div className="text-muted-foreground">Rare</div>
            </div>
          </div>
        </div>

        {/* Fuel Information */}
        <div className="flex items-center justify-between text-sm border-t border-blue-500/20 pt-3">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-orange-400" />
            <span className="text-muted-foreground">Fuel Cost:</span>
            <span className="text-orange-400 font-medium">
              {config.fuelCost}
            </span>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-xs">Cancel Refund</div>
            <div className="text-green-400 font-medium">
              {Math.floor(config.fuelCost * 0.5)} fuel
            </div>
          </div>
        </div>

        {/* Hover Tooltip for Cancel Button */}
        {isHovered && (
          <div className="absolute top-2 right-2 bg-red-900/90 text-red-200 text-xs px-2 py-1 rounded shadow-lg border border-red-500/50 z-10">
            Cancel travel (50% fuel refund)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
