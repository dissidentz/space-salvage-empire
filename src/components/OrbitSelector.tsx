import { ORBIT_CONFIGS } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import type { OrbitType } from '@/types';
import { OrbitCard } from './OrbitCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

interface OrbitSelectorProps {
  open: boolean;
  onClose: () => void;
}

export function OrbitSelector({ open, onClose }: OrbitSelectorProps) {
  const currentOrbit = useGameStore(state => state.currentOrbit);
  const resources = useGameStore(state => state.resources);
  const canTravelToOrbit = useGameStore(state => state.canTravelToOrbit);
  const travelToOrbit = useGameStore(state => state.travelToOrbit);
  const addNotification = useGameStore(state => state.addNotification);

  const orbits: OrbitType[] = [
    'leo',
    'geo',
    'lunar',
    'mars',
    'asteroidBelt',
    'jovian',
    'kuiper',
    'deepSpace',
  ];

  const handleTravel = (orbit: OrbitType) => {
    const config = ORBIT_CONFIGS[orbit];

    // Check if can afford
    if (resources.fuel < config.fuelCost) {
      addNotification(
        'error',
        `Not enough fuel! Need ${config.fuelCost}, have ${resources.fuel}`
      );
      return;
    }

    // Attempt travel
    const success = travelToOrbit(orbit);
    if (success) {
      addNotification('success', `Traveling to ${config.name}...`);
      onClose();
    } else {
      addNotification('error', 'Cannot travel to this orbit');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Orbit Selection</DialogTitle>
          <DialogDescription>
            Select a destination orbit to travel to. Each orbit offers different
            production multipliers and derelict spawn rates.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="grid gap-4 md:grid-cols-2">
            {orbits.map(orbit => {
              const config = ORBIT_CONFIGS[orbit];
              const isCurrent = orbit === currentOrbit;
              const isUnlocked = canTravelToOrbit(orbit) || isCurrent;
              const canAfford = resources.fuel >= config.fuelCost;

              return (
                <OrbitCard
                  key={orbit}
                  orbit={orbit}
                  isCurrent={isCurrent}
                  isUnlocked={isUnlocked}
                  canAfford={canAfford}
                  onTravel={() => handleTravel(orbit)}
                />
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
