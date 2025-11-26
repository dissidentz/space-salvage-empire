import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ORBIT_CONFIGS } from '@/config/orbits';
import { useGameStore } from '@/stores/gameStore';
import type { Mission } from '@/types';
import { formatTime } from '@/utils/format';
import { Loader2, Rocket, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MissionCardProps {
  mission: Mission;
}

export function MissionCard({ mission }: MissionCardProps) {
  const cancelMission = useGameStore(state => state.cancelMission);
  const getMissionProgress = useGameStore(state => state.getMissionProgress);
  
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const prog = getMissionProgress(mission.id);
      setProgress(prog);
      
      const remaining = Math.max(0, mission.endTime - Date.now());
      setTimeRemaining(remaining);
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [mission.id, mission.endTime, getMissionProgress]);

  const isScout = mission.type === 'scout';
  const orbitName = ORBIT_CONFIGS[mission.targetOrbit].name;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {isScout ? (
                <Rocket className="h-4 w-4 text-blue-400" />
              ) : (
                <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
              )}
              {isScout ? 'Scout Mission' : 'Salvage Mission'}
            </CardTitle>
            <CardDescription className="text-xs">
              Target: {orbitName}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => cancelMission(mission.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <Progress value={progress * 100} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{Math.floor(progress * 100)}%</span>
          <span>{formatTime(timeRemaining)} remaining</span>
        </div>
      </CardContent>
    </Card>
  );
}
