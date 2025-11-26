import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DERELICT_CONFIGS } from '@/config/derelicts';
import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import type { Derelict, DerelictRarity } from '@/types';
import { formatTime } from '@/utils/format';
import { AlertTriangle, Clock, Fuel } from 'lucide-react';

interface DerelictCardProps {
  derelict: Derelict;
}

function getRarityColor(rarity: DerelictRarity): string {
  switch (rarity) {
    case 'common': return 'border-slate-500';
    case 'uncommon': return 'border-green-500';
    case 'rare': return 'border-blue-500';
    case 'epic': return 'border-purple-500';
    case 'legendary': return 'border-orange-500';
    default: return 'border-slate-500';
  }
}

function getRarityBadgeVariant(rarity: DerelictRarity): "default" | "secondary" | "destructive" | "outline" {
  switch (rarity) {
    case 'common': return 'secondary';
    case 'uncommon': return 'outline'; // Green-ish usually
    case 'rare': return 'default'; // Blue-ish
    case 'epic': return 'default'; // Purple-ish
    case 'legendary': return 'destructive'; // Orange/Red
    default: return 'secondary';
  }
}

export function DerelictCard({ derelict }: DerelictCardProps) {
  const startSalvageMission = useGameStore(state => state.startSalvageMission);
  const ships = useGameStore(state => state.ships);
  const resources = useGameStore(state => state.resources);
  
  const config = DERELICT_CONFIGS[derelict.type];
  const requiredShipConfig = SHIP_CONFIGS[config.requiredShip];
  
  const hasShip = ships[config.requiredShip] > 0 || ships['heavySalvageFrigate'] > 0;
  const hasFuel = resources.fuel >= config.fuelCost;
  const canSalvage = hasShip && hasFuel;
  
  const timeRemaining = derelict.expiresAt - Date.now();
  const isExpired = timeRemaining <= 0;

  if (isExpired) return null;

  return (
    <Card className={`w-full border-l-4 ${getRarityColor(derelict.rarity)}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{config.name}</CardTitle>
          <Badge variant={getRarityBadgeVariant(derelict.rarity)} className="capitalize">
            {derelict.rarity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 text-sm">
        <p className="text-muted-foreground mb-3">{config.description}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs">
            <Fuel className="h-3 w-3" />
            <span className={hasFuel ? '' : 'text-destructive'}>
              {config.fuelCost} Fuel
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span>{formatTime(config.baseMissionTime)}</span>
          </div>
        </div>

        {config.isHazardous && (
          <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Hazardous - High Risk</span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          Expires in: {formatTime(timeRemaining)}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          className="w-full"
          size="sm"
          onClick={() => startSalvageMission(derelict.id, config.requiredShip, 'salvage')}
          disabled={!canSalvage}
        >
          {!hasShip 
            ? `Need ${requiredShipConfig.name}` 
            : !hasFuel 
              ? 'Not Enough Fuel' 
              : 'Start Salvage'}
        </Button>
      </CardFooter>
    </Card>
  );
}
