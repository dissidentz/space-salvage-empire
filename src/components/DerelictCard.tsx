import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { DERELICT_CONFIGS } from '@/config/derelicts';
import { ORBIT_CONFIGS, getOrbitColor } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import type { Derelict, DerelictAction } from '@/types';
import {
    formatMissionDuration,
    formatRewards,
    getRarityBgColor,
    getRarityColor,
    getShipDisplayName
} from '@/utils/missionHelpers';
import {
    AlertTriangle,
    Clock,
    Fuel,
    MapPin,
    Package,
    Rocket,
    Sparkles,
    Target,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface DerelictCardProps {
  derelict: Derelict;
}

export function DerelictCard({ derelict }: DerelictCardProps) {
  const startSalvageMission = useGameStore(state => state.startSalvageMission);
  const removeDerelict = useGameStore(state => state.removeDerelict);
  const ships = useGameStore(state => state.ships);
  const missions = useGameStore(state => state.missions);
  const resources = useGameStore(state => state.resources);

  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);
  const [missionTimeRemaining, setMissionTimeRemaining] = useState(0);

  const config = DERELICT_CONFIGS[derelict.type];

  // Update expiry countdown
  // Update expiry countdown
  useEffect(() => {
    const updateExpiry = () => {
      setTimeUntilExpiry(Math.max(0, derelict.expiresAt - Date.now()));
    };

    updateExpiry();
    const interval = setInterval(updateExpiry, 1000);
    return () => clearInterval(interval);
  }, [derelict.expiresAt]);

  // Update mission progress
  useEffect(() => {
    const activeMission = missions.find(m => m.targetDerelict === derelict.id);
    if (!activeMission) return;

    const updateProgress = () => {
      const getMissionProgress = useGameStore.getState().getMissionProgress;
      setMissionProgress(getMissionProgress(activeMission.id));
      setMissionTimeRemaining(Math.max(0, activeMission.endTime - Date.now()));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [missions, derelict.id]);

  // Check if ship is available
  const busyShips = missions.filter(m => m.shipType === derelict.requiredShip).length;
  const availableShips = ships[derelict.requiredShip] - busyShips;
  
  // Calculate actual fuel cost - LEO and GEO missions are free
  const currentOrbit = useGameStore(state => state.currentOrbit);
  const actualFuelCost = (derelict.orbit !== currentOrbit && derelict.orbit !== 'leo' && derelict.orbit !== 'geo') ? derelict.fuelCost : 0;
  
  const canAfford = resources.fuel >= actualFuelCost;
  // Check if mission already in progress for this derelict
  const isMissionActive = missions.some(m => m.targetDerelict === derelict.id);
  
  const canLaunch = availableShips > 0 && canAfford && !isMissionActive;

  const handleLaunchSalvage = (action: DerelictAction) => {
    const success = startSalvageMission(derelict.id, derelict.requiredShip, action);
    if (!success) {
      if (availableShips <= 0) {
        useGameStore.getState().addNotification('error', `No ${getShipDisplayName(derelict.requiredShip)} available. All ships are on missions.`);
      } else if (!canAfford) {
        useGameStore.getState().addNotification('error', `Insufficient fuel. Need ${actualFuelCost} fuel.`);
      } else {
         useGameStore.getState().addNotification('error', 'Failed to launch salvage mission.');
      }
    } else {
        useGameStore.getState().addNotification('success', `Salvage mission launched!`);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Target className={`w-4 h-4 ${getRarityColor(derelict.rarity)}`} />
                <span className="font-medium">{config.name}</span>
                <Badge className={getRarityBgColor(derelict.rarity)}>
                  <span className={getRarityColor(derelict.rarity)}>{derelict.rarity}</span>
                </Badge>
                {/* Orbit Location Badge */}
                <Badge variant="outline" className="bg-slate-700/50 border-slate-600">
                  <MapPin className={`w-3 h-3 mr-1 ${getOrbitColor(derelict.orbit)}`} />
                  <span className={getOrbitColor(derelict.orbit)}>{ORBIT_CONFIGS[derelict.orbit].name}</span>
                </Badge>
                {derelict.isArkComponent && (
                  <Badge className="bg-orange-500/20 border-orange-500/50">
                    <Sparkles className="w-3 h-3 text-orange-400 mr-1" />
                    <span className="text-orange-400">Ark Component</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {/* Duration */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>{formatMissionDuration(derelict.baseMissionTime)}</span>
            </div>
            
            {/* Fuel */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Fuel className="w-3 h-3 text-orange-400" />
              <span>{actualFuelCost} fuel</span>
            </div>

            {/* Expiry */}
            <div className="flex items-center gap-1 text-yellow-400">
              <Clock className="w-3 h-3" />
              <span>Expires: {formatMissionDuration(timeUntilExpiry)}</span>
            </div>

            {/* Hazard */}
            {derelict.isHazardous && (
              <div className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="w-3 h-3" />
                <span>Hazard: {(derelict.riskLevel * 100).toFixed(0)}%</span>
              </div>
            )}

            {/* Ship Availability */}
            <div className={`flex items-center gap-1 ${availableShips > 0 ? 'text-green-400' : 'text-red-400'}`}>
              <Package className="w-3 h-3" />
              <span>{availableShips}/{ships[derelict.requiredShip]} {getShipDisplayName(derelict.requiredShip)}</span>
            </div>
          </div>

          {/* Rewards Preview */}
          <div className="p-2 bg-slate-700/30 rounded text-xs">
            <span className="text-muted-foreground">Rewards: </span>
            <span className="text-green-400">{formatRewards(derelict.rewards)}</span>
          </div>

          {/* Active Mission Indicator */}
          {isMissionActive && (() => {
            const activeMission = missions.find(m => m.targetDerelict === derelict.id);
            if (!activeMission) return null;

            return (
              <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-blue-400">
                    <Rocket className="w-4 h-4 animate-pulse" />
                    <span>Mission in Progress...</span>
                    <span className="text-blue-300 font-medium">
                      {Math.floor(missionProgress * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 font-mono">
                      {Math.floor(missionTimeRemaining / 60000)}m {Math.floor((missionTimeRemaining % 60000) / 1000)}s
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        const cancelMission = useGameStore.getState().cancelMission;
                        cancelMission(activeMission.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="w-full bg-blue-950/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${missionProgress * 100}%` }}
                  />
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-200 hover:text-purple-100"
                    onClick={() => handleLaunchSalvage('salvage')}
                    disabled={!canLaunch}
                  >
                    <Target className="w-4 h-4 mr-1 text-purple-300" />
                    Salvage
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Standard salvage operation - collect all resources</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleLaunchSalvage('hack')}
                    disabled={!canLaunch}
                  >
                    Hack
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hack systems - higher data fragment yield</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleLaunchSalvage('dismantle')}
                    disabled={!canLaunch}
                  >
                    Dismantle
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dismantle for parts - higher metal/electronics yield</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>




            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Abandon Derelict?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to abandon this derelict? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => removeDerelict(derelict.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Abandon
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
