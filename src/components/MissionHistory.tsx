import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DERELICT_CONFIGS } from '@/config/derelicts';
import { ORBIT_CONFIGS } from '@/config/orbits';
import { SHIP_CONFIGS } from '@/config/ships';
import { useGameStore } from '@/stores/gameStore';
import { AlertCircle, CheckCircle2, History } from 'lucide-react';

export function MissionHistory() {
  const missionHistory = useGameStore(state => state.stats.missionHistory);

  if (!missionHistory || missionHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No missions completed yet</p>
      </div>
    );
  }

  return (
    <Card className="border-blue-500/30 bg-blue-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-blue-400" />
          Mission Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-3">
            {missionHistory.map(log => {
              const shipName = SHIP_CONFIGS[log.shipType].name;
              const orbitName = ORBIT_CONFIGS[log.targetOrbit].name;
              
              return (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-lg border ${
                    log.success 
                      ? 'border-green-500/20 bg-green-950/10' 
                      : 'border-red-500/20 bg-red-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {log.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`font-medium ${log.success ? 'text-green-300' : 'text-red-300'}`}>
                        {log.type === 'scout' ? 'Scout Mission' : 'Salvage Mission'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(log.endTime).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-300 ml-6 space-y-1">
                    <div>
                      Ship: <span className="text-gray-300">{shipName}</span> • Orbit: <span className="text-gray-300">{orbitName}</span>
                    </div>
                    
                    {log.success && log.type === 'scout' && log.derelictType && (
                      <div className="text-yellow-300/90">
                        Discovered: {DERELICT_CONFIGS[log.derelictType].name}
                      </div>
                    )}

                    {log.success && log.rewards && Object.keys(log.rewards).length > 0 && (
                      <div className="text-blue-300/90">
                        Rewards: {Object.entries(log.rewards).map(([res, amount]) => (
                          <span key={res} className="mr-2">
                            {amount.toFixed(1)} {res}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
