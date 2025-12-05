import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { ORBIT_CONFIGS, getAdjacentOrbits } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import type { OrbitType, ShipType } from '@/types';
import {
    formatMissionDuration,
    formatNumber,
    getAvailableShipsForMission,
    getShipDisplayName,
} from '@/utils/missionHelpers';
import { Clock, Fuel, MapPin, Rocket, Send } from 'lucide-react';
import { useState } from 'react';
import { AutomationSettings } from './AutomationSettings';

export function MissionLauncher() {
  const currentOrbit = useGameStore(state => state.currentOrbit);
  const ships = useGameStore(state => state.ships);
  const missions = useGameStore(state => state.missions);
  const resources = useGameStore(state => state.resources);
  const startScoutMission = useGameStore(state => state.startScoutMission);
  const startColonyMission = useGameStore(state => state.startColonyMission);
  const canTravelToOrbit = useGameStore(state => state.canTravelToOrbit);
  const colonies = useGameStore(state => state.colonies);
  const techTree = useGameStore(state => state.techTree);
  const isUpgradeUnlocked = useGameStore(state => state.isUpgradeUnlocked);

  const [missionType, setMissionType] = useState<string>('scout');
  const [selectedShip, setSelectedShip] = useState<ShipType | null>(null);
  const [targetOrbit, setTargetOrbit] = useState<OrbitType | null>(null);

  const scoutShips = getAvailableShipsForMission('scout');
  
  // Check if dual missions tech is unlocked
  const hasDualMissions = techTree.purchased.includes('fleet_coordination');
  const maxMissionsPerShip = hasDualMissions ? 2 : 1;

  // Get available ships for each type
  const getAvailableCount = (shipType: ShipType) => {
    const busyShips = missions.filter(m => m.shipType === shipType).length;
    return ships[shipType] * maxMissionsPerShip - busyShips;
  };

  // Get all unlocked orbits (including current)
  const hasLongRangeComms = isUpgradeUnlocked('long_range_comms');
  
  const availableOrbits = (Object.keys(ORBIT_CONFIGS) as OrbitType[]).filter(
    orbit => {
      if (orbit === currentOrbit) return true;
      if (canTravelToOrbit(orbit)) return true;
      
      // Long-Range Comms allows scouting adjacent orbits
      if (missionType === 'scout' && hasLongRangeComms) {
        const adjacent = getAdjacentOrbits(currentOrbit);
        return adjacent.includes(orbit);
      }
      
      return false;
    }
  );

  const handleLaunch = () => {
    if (!targetOrbit) {
      useGameStore.getState().addNotification('error', 'Please select a target orbit');
      return;
    }

    if (missionType === 'scout') {
        if (!selectedShip) {
            useGameStore.getState().addNotification('error', 'Please select a ship');
            return;
        }
        const fuelCost = targetOrbit === 'leo' || targetOrbit === 'geo' ? 0 : 50;
        if (resources.fuel < fuelCost) {
            useGameStore.getState().addNotification('error', `Insufficient fuel. Need ${fuelCost} fuel.`);
            return;
        }
        const success = startScoutMission(selectedShip, targetOrbit);
        if (success) {
            setSelectedShip(null);
            setTargetOrbit(null);
            useGameStore.getState().addNotification('success', 'Scout mission launched successfully!');
        } else {
            // Error notification is handled in startScoutMission if it returns false (e.g. limits)
            // But if it returns false without notification, we might want one here.
            // Checking gameStore, startScoutMission adds notification for limits.
            // So generic failure might be redundant if store handles it.
            // But let's add one just in case if store didn't.
            // Actually, let's trust the return value logic or add a generic one if no specific error.
        }
    } else if (missionType === 'colony') {
        // Check availability
        if (getAvailableCount('colonyShip') <= 0) {
            useGameStore.getState().addNotification('error', 'No Colony Ship available.');
            return;
        }
        // Check fuel
        const fuelCost = ORBIT_CONFIGS[targetOrbit].fuelCost;
        if (resources.fuel < fuelCost) {
            useGameStore.getState().addNotification('error', `Insufficient fuel. Need ${fuelCost} fuel.`);
            return;
        }
        const success = startColonyMission(targetOrbit);
        if (success) {
            setTargetOrbit(null);
            useGameStore.getState().addNotification('success', 'Colony mission launched successfully!');
        } else {
             useGameStore.getState().addNotification('error', 'Failed to launch colony mission.');
        }
    }
  };

  const handleQuickScout = () => {
    // Automatically select the first available scout ship
    const preferredShip = getAvailableCount('scoutProbe') > 0 ? 'scoutProbe' : 
                         getAvailableCount('deepSpaceScanner') > 0 ? 'deepSpaceScanner' : null;
    
    if (!preferredShip) {
      useGameStore.getState().addNotification('error', 'No scout ships available');
      return;
    }

    const fuelCost = currentOrbit === 'leo' || currentOrbit === 'geo' ? 0 : 50;
    if (resources.fuel < fuelCost) {
      useGameStore.getState().addNotification('error', `Insufficient fuel. Need ${fuelCost} fuel.`);
      return;
    }

    const success = startScoutMission(preferredShip, currentOrbit);
    if (success) {
      useGameStore.getState().addNotification('success', `Scout launched to ${ORBIT_CONFIGS[currentOrbit].name}!`);
    }
  };

  const canQuickScout = () => {
    const hasScoutAvailable = getAvailableCount('scoutProbe') > 0 || getAvailableCount('deepSpaceScanner') > 0;
    const fuelCost = currentOrbit === 'leo' || currentOrbit === 'geo' ? 0 : 50;
    return hasScoutAvailable && resources.fuel >= fuelCost;
  };

  const canLaunch = () => {
      if (!targetOrbit) return false;
      if (missionType === 'scout') {
          const fuelCost = targetOrbit === 'leo' || targetOrbit === 'geo' ? 0 : 50;
          return selectedShip && getAvailableCount(selectedShip) > 0 && resources.fuel >= fuelCost;
      } else if (missionType === 'colony') {
          return getAvailableCount('colonyShip') > 0 && resources.fuel >= ORBIT_CONFIGS[targetOrbit].fuelCost;
      }
      return false;
  };

  return (
    <Card className="bg-linear-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="w-5 h-5 text-blue-400" />
          <span>Mission Control</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Automation Settings */}
        <AutomationSettings />

        <div className="flex gap-2 mb-4">
            <Button 
                variant={missionType === 'scout' ? 'default' : 'outline'} 
                onClick={() => setMissionType('scout')}
                className="flex-1"
            >
                Scout
            </Button>
            <Button 
                variant={missionType === 'colony' ? 'default' : 'outline'} 
                onClick={() => setMissionType('colony')}
                className="flex-1"
            >
                Colonize
            </Button>
        </div>
            
        <div className="space-y-3">
            {/* Ship and Target Selection - Side by Side */}
            <div className="grid grid-cols-2 gap-3">
                {/* Ship Selection (Scout only) */}
                {missionType === 'scout' ? (
                    <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Select Ship</label>
                    <Select
                        value={selectedShip || ''}
                        onValueChange={value => setSelectedShip(value as ShipType)}
                    >
                        <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose ship..." />
                        </SelectTrigger>
                        <SelectContent>
                        {scoutShips.map(shipType => {
                            const available = getAvailableCount(shipType);
                            const total = ships[shipType];
                            const totalCapacity = total * maxMissionsPerShip;
                            return (
                            <SelectItem
                                key={shipType}
                                value={shipType}
                                disabled={available <= 0}
                            >
                                <div className="flex items-center justify-between w-full">
                                <span>{getShipDisplayName(shipType)}</span>
                                <Badge
                                    variant={available > 0 ? 'secondary' : 'outline'}
                                    className="ml-2"
                                >
                                    {available}/{totalCapacity}
                                </Badge>
                                </div>
                            </SelectItem>
                            );
                        })}
                        </SelectContent>
                    </Select>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Colony Ship</label>
                        <div className="h-9 px-3 bg-slate-700/30 rounded flex items-center justify-between text-sm">
                            <span>Available:</span>
                            <Badge variant={getAvailableCount('colonyShip') > 0 ? 'default' : 'destructive'}>
                                {getAvailableCount('colonyShip')} / {ships.colonyShip * maxMissionsPerShip}
                            </Badge>
                        </div>
                    </div>
                )}

                {/* Target Orbit Selection */}
                <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Target Orbit</label>
                <Select
                    value={targetOrbit || ''}
                    onValueChange={value => setTargetOrbit(value as OrbitType)}
                >
                    <SelectTrigger className="h-9">
                    <SelectValue placeholder="Choose destination..." />
                    </SelectTrigger>
                    <SelectContent>
                    {availableOrbits.map(orbit => {
                        const config = ORBIT_CONFIGS[orbit];
                        const hasColony = colonies.some(c => c.orbit === orbit);
                        // Filter out orbits that already have colonies if missionType is colony
                        if (missionType === 'colony' && hasColony) return null;
                        
                        return (
                        <SelectItem key={orbit} value={orbit}>
                            <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            <span>{config.name}</span>
                            {hasColony && <Badge variant="secondary" className="ml-2 text-xs">Colony</Badge>}
                            </div>
                        </SelectItem>
                        );
                    })}
                    </SelectContent>
                </Select>
                </div>
            </div>

            {/* Mission Details - Fuel and Duration on same line */}
            <div className="p-2 bg-slate-700/30 rounded flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Fuel className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-muted-foreground">Fuel:</span>
                        <span className="font-medium">
                            {targetOrbit 
                                ? (missionType === 'scout' ? (targetOrbit === 'leo' || targetOrbit === 'geo' ? '0' : '50') : formatNumber(ORBIT_CONFIGS[targetOrbit].fuelCost))
                                : '-'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                            {missionType === 'scout' ? formatMissionDuration(600000) : formatMissionDuration(3600000)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Launch Buttons - Side by Side */}
            <div className="flex gap-2">
              <Button
                onClick={handleQuickScout}
                disabled={!canQuickScout()}
                className="flex-1 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-200 hover:text-cyan-100"
              >
                <Rocket className="w-4 h-4 mr-1" />
                Quick Scout ({ORBIT_CONFIGS[currentOrbit].name})
              </Button>
              <Button
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-200 hover:text-blue-100"
                onClick={handleLaunch}
                disabled={!canLaunch()}
              >
                <Send className="w-4 h-4 mr-1" />
                Launch {missionType === 'scout' ? 'Scout' : 'Colony'}
              </Button>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
