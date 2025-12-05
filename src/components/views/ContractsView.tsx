import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getContractDescription } from '@/engine/contracts';
import { useGameStore } from '@/stores/gameStore';
import { formatResourceRewards } from '@/utils/missionHelpers';
import { CheckCircle2, Clock, FileText, Lock, PlayCircle, Trophy, XCircle } from 'lucide-react';
import { useEffect } from 'react';

export function ContractsView() {
  const contracts = useGameStore(state => state.contracts);
  const generateContracts = useGameStore(state => state.generateContracts);
  const acceptContract = useGameStore(state => state.acceptContract);
  const claimContractReward = useGameStore(state => state.claimContractReward);
  const abandonContract = useGameStore(state => state.abandonContract);
  const techPurchased = useGameStore(state => state.techTree.purchased);

  const unlocked = techPurchased.includes('contracts');

  useEffect(() => {
    if (unlocked) {
      generateContracts(); // Ensure we have contracts available
    }
  }, [unlocked, generateContracts]);

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="p-4 bg-slate-800 rounded-full">
          <Lock className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-400">Contracts System Locked</h2>
        <p className="text-muted-foreground max-w-md">
          Research "Contracts" in the Economy Tech Tree (Tier 3) to unlock optional objectives and earn bonus rewards.
        </p>
      </div>
    );
  }

  const activeContracts = contracts.filter(c => c.status === 'active' || c.status === 'completed' || c.status === 'failed');
  const availableContracts = contracts.filter(c => c.status === 'available');

  const formatTime = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}m ${sec}s`;
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-400" />
            Contracts
          </h1>
          <p className="text-muted-foreground">Complete optional objectives for bonus resources.</p>
        </div>
        <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
                Active Limit: 3
            </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contracts Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-200 flex items-center gap-2">
            <PlayCircle className="w-5 h-5" />
            Active Contracts
          </h2>
          
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {activeContracts.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg text-muted-foreground">
                  No active contracts. Accept one from the available list!
                </div>
              ) : (
                activeContracts.map(contract => (
                  <Card key={contract.id} className={`bg-slate-800/50 ${contract.status === 'completed' ? 'border-green-500/50 bg-green-900/10' : 'border-blue-500/30'}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-slate-200">
                          {getContractDescription(contract)}
                        </CardTitle>
                        {contract.status === 'completed' && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Completed</Badge>
                        )}
                        {contract.status === 'active' && (
                            <Badge variant="outline" className="text-blue-400 border-blue-500/50">In Progress</Badge>
                        )}
                        {contract.status === 'failed' && (
                            <Badge variant="destructive">Failed</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                         <div className="flex justify-between text-sm">
                             <span>Progress</span>
                             <span>{contract.progress} / {contract.targetAmount}</span>
                         </div>
                         <Progress value={(contract.progress / contract.targetAmount) * 100} className="h-2" />
                      </div>

                      {/* Time Remaining */}
                      {contract.status === 'active' && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>Time Remaining: {formatTime(Math.max(0, contract.expiresAt - Date.now()))}</span>
                          </div>
                      )}

                      {/* Rewards */}
                      <div className="p-2 bg-slate-900/50 rounded text-sm">
                          <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                              <Trophy className="w-3 h-3" />
                              <span>Rewards:</span>
                          </div>
                          <span className="text-green-400 font-mono">{formatResourceRewards(contract.rewards)}</span>
                      </div>

                      {/* Action Button */}
                      {contract.status === 'completed' && (
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-500 text-white"
                            onClick={() => claimContractReward(contract.id)}
                          >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Claim Reward
                          </Button>
                      )}
                      
                      {contract.status === 'failed' && (
                          <Button 
                            variant="destructive"
                            className="w-full"
                            onClick={() => abandonContract(contract.id)}
                          >
                              <XCircle className="w-4 h-4 mr-2" />
                              Dismiss Failed Contract
                          </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Available Contracts Column */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Available Contracts
          </h2>

          <div className="grid gap-4">
             {availableContracts.length === 0 ? (
                 <div className="p-4 bg-slate-800/50 rounded text-center text-muted-foreground">
                     Generating new contracts...
                 </div>
             ) : (
                 availableContracts.map(contract => (
                     <Card key={contract.id} className="bg-slate-800/30 border-slate-700 hover:border-slate-600 transition-colors">
                         <CardContent className="p-4 space-y-3">
                             <div>
                                 <h3 className="font-medium text-slate-200">{getContractDescription(contract)}</h3>
                                 <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                     <span className="flex items-center gap-1">
                                         <Clock className="w-3 h-3" />
                                         {formatTime(contract.duration)} limit
                                     </span>
                                 </div>
                             </div>

                             <div className="p-2 bg-slate-900/30 rounded text-xs">
                                 <span className="text-muted-foreground">Reward: </span>
                                 <span className="text-green-400">{formatResourceRewards(contract.rewards)}</span>
                             </div>

                             <Button 
                                variant="secondary" 
                                size="sm" 
                                className="w-full"
                                onClick={() => acceptContract(contract.id)}
                             >
                                 Accept Contract
                             </Button>
                         </CardContent>
                     </Card>
                 ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
