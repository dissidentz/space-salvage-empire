import { ORBIT_CONFIGS, getOrbitColor } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import type { OrbitType } from '@/types';
import { formatNumber, formatTime } from '@/utils/format';
import { CheckCircle2, Lock, Rocket } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface OrbitCardProps {
  orbit: OrbitType;
  isCurrent: boolean;
  isUnlocked: boolean;
  canAfford: boolean;
  onTravel: () => void;
}

export function OrbitCard({
  orbit,
  isCurrent,
  isUnlocked,
  canAfford,
  onTravel,
}: OrbitCardProps) {
  const config = ORBIT_CONFIGS[orbit];
  const resources = useGameStore(state => state.resources);
  const orbitColor = getOrbitColor(orbit);

  // Get unlock requirements text
  const getRequirementsText = () => {
    const req = config.unlockRequirements;
    const requirements: string[] = [];

    if (req.resources) {
      for (const [resource, amount] of Object.entries(req.resources)) {
        const current = resources[resource as keyof typeof resources];
        const met = current >= amount;
        requirements.push(
          `${formatNumber(amount)} ${resource} ${met ? '✓' : `(${formatNumber(current)})`}`
        );
      }
    }

    if (req.tech) {
      requirements.push(`Tech: ${req.tech.join(', ')}`);
    }

    if (req.colonies) {
      requirements.push(`Colonies: ${req.colonies.join(', ')}`);
    }

    return requirements.length > 0 ? requirements.join(', ') : 'No requirements';
  };

  return (
    <Card
      className={`transition-all ${
        isCurrent
          ? 'border-blue-500 bg-blue-950/30'
          : isUnlocked
            ? 'border-green-700/50 hover:border-green-600'
            : 'border-gray-700 opacity-60'
      }`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className={`flex items-center gap-2 ${orbitColor}`}>
            {isCurrent && <CheckCircle2 className="h-5 w-5" />}
            {!isUnlocked && <Lock className="h-5 w-5" />}
            {config.name}
          </span>
          {isCurrent && (
            <span className="text-xs font-normal text-blue-400">Current</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Multipliers */}
        <div className="flex flex-wrap gap-2 text-xs">
          {config.metalMultiplier > 1 && (
            <span className="rounded bg-gray-700 px-2 py-1">
              {config.metalMultiplier}x Metal
            </span>
          )}
          {config.electronicsMultiplier > 1 && (
            <span className="rounded bg-blue-700 px-2 py-1">
              {config.electronicsMultiplier}x Electronics
            </span>
          )}
          {config.rareMultiplier > 1 && (
            <span className="rounded bg-purple-700 px-2 py-1">
              {config.rareMultiplier}x Rare
            </span>
          )}
        </div>

        {/* Travel Info */}
        {!isCurrent && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Fuel Cost:</span>
              <span
                className={
                  canAfford ? 'text-green-400' : 'text-red-400'
                }
              >
                {formatNumber(config.fuelCost)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Travel Time:</span>
              <span>{formatTime(config.travelTime)}</span>
            </div>
          </div>
        )}

        {/* Requirements */}
        {!isUnlocked && (
          <div className="rounded bg-gray-800/50 p-2 text-xs text-gray-400">
            <div className="font-semibold text-gray-300">Requirements:</div>
            <div>{getRequirementsText()}</div>
          </div>
        )}

        {/* Travel Button */}
        {!isCurrent && (
          <Button
            onClick={onTravel}
            disabled={!isUnlocked || !canAfford}
            className="w-full"
            size="sm"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Travel
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
