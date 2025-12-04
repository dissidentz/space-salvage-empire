import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DERELICT_CONFIGS } from '@/config/derelicts';
import { ORBIT_CONFIGS } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import type { Mission } from '@/types';
import {
  formatMissionDuration,
  getMissionProgress,
  getMissionTimeRemaining,
  getMissionTypeBgColor,
  getMissionTypeColor,
  getShipDisplayName,
} from '@/utils/missionHelpers';
import { Clock, Fuel, MapPin, Rocket, Target, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MissionCardProps {
  mission: Mission;
}

function MissionCard({ mission }: MissionCardProps) {
  const cancelMission = useGameStore(state => state.cancelMission);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Update progress every second
  useEffect(() => {
    const updateProgress = () => {
      setProgress(getMissionProgress(mission) * 100);
      setTimeRemaining(getMissionTimeRemaining(mission));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, [mission]);

  const handleCancel = () => {
    if (confirm('Cancel this mission? You will receive 50% fuel refund.')) {
      cancelMission(mission.id);
    }
  };

  const getTargetName = () => {
    if (mission.type === 'scout') {
      return ORBIT_CONFIGS[mission.targetOrbit].name;
    } else if (mission.type === 'salvage' && mission.targetDerelict) {
      const derelict = useGameStore
        .getState()
        .derelicts.find(d => d.id === mission.targetDerelict);
      if (derelict) {
        return DERELICT_CONFIGS[derelict.type].name;
      }
    } else if (mission.type === 'colony') {
      return ORBIT_CONFIGS[mission.targetOrbit].name;
    }
    return 'Unknown';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Header Row: Type, Ship, Target, Cancel */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap flex-1">
              <Rocket className={`w-4 h-4 ${getMissionTypeColor(mission.type)}`} />
              <span className="font-medium capitalize">{mission.type}</span>
              <Badge className={getMissionTypeBgColor(mission.type)}>
                {getShipDisplayName(mission.shipType)}
              </Badge>
              <span className="text-muted-foreground">→</span>
              {mission.type === 'scout' ? (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {getTargetName()}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Target className="w-3 h-3" />
                  {getTargetName()}
                </span>
              )}
              {mission.action && (
                <Badge variant="outline" className="text-xs capitalize">
                  {mission.action}
                </Badge>
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cancel mission (50% fuel refund)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Progress Row: Time, Progress Bar, %, Fuel */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{formatMissionDuration(timeRemaining)}</span>
            </div>
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">{progress.toFixed(0)}%</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
              <Fuel className="w-3 h-3 text-orange-400" />
              <span>{mission.fuelCost}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MissionQueue() {
  const missions = useGameStore(state => state.missions);

  if (missions.length === 0) {
    return null;
  }

  return (
    <Card className="bg-linear-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="w-5 h-5 text-blue-400" />
          <span>Active Missions</span>
          <Badge variant="secondary" className="ml-auto">
            {missions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
        {missions.map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </CardContent>
    </Card>
  );
}
