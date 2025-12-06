import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStore } from '@/stores/gameStore';
import { ArrowRight, Clock, Rocket, RotateCcw, Trophy } from 'lucide-react';

export function VictoryView() {
  const stats = useGameStore(state => state.stats);
  const prestige = useGameStore(state => state.prestige);
  const totalShips = Object.values(useGameStore.getState().ships).reduce((a, b) => a + b, 0);
  
  const continueEndlessMode = useGameStore(state => state.continueEndlessMode);
  const prestigeReset = useGameStore(state => state.prestigeReset);

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-slate-950 to-slate-900 p-8 rounded-lg animate-in fade-in duration-1000">
      
      {/* Victory Header */}
      <div className="text-center space-y-6 mb-12">
        <div className="inline-block p-6 bg-yellow-500/10 rounded-full mb-4">
            <Trophy className="w-24 h-24 text-yellow-500" />
        </div>
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
          ARK COMPLETED
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          You have successfully assembled the Ark of Salvation. Humanity's legacy is secured, thanks to your efforts, Commander.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
        <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <Clock className="w-8 h-8 text-blue-400" />
                <span className="text-sm text-muted-foreground">Time Elapsed</span>
                <span className="text-2xl font-bold font-mono">{formatTime(stats.currentRunTime)}</span>
            </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <Rocket className="w-8 h-8 text-green-400" />
                <span className="text-sm text-muted-foreground">Fleet Size</span>
                <span className="text-2xl font-bold text-green-400">{totalShips} Ships</span>
            </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                <RotateCcw className="w-8 h-8 text-purple-400" />
                <span className="text-sm text-muted-foreground">Prestige Rank</span>
                <span className="text-2xl font-bold text-purple-400">Run #{prestige.totalRuns + 1}</span>
            </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        <Button 
            variant="outline" 
            size="lg" 
            className="flex-1 h-32 flex flex-col items-center justify-center gap-4 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white transition-all"
            onClick={continueEndlessMode}
        >
            <span className="text-xl font-bold">Stay Here</span>
            <span className="text-sm text-muted-foreground text-center">Continue playing in this universe without resetting. (Endless Mode)</span>
        </Button>

        <Button 
            variant="default" 
            size="lg" 
            className="flex-1 h-32 flex flex-col items-center justify-center gap-4 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 border-none shadow-lg shadow-blue-900/20"
            onClick={() => {
                // Confirm reset? Maybe standard reset logic handles confirmation, but here we just do it.
                // Assuming prestigeReset handles everything including notification.
                prestigeReset();
            }}
        >
            <div className="flex items-center gap-2">
                <span className="text-xl font-bold">Launch Ark</span>
                <ArrowRight className="w-5 h-5" />
            </div>
            <span className="text-sm text-blue-100/80 text-center">Reset the universe and gain Dark Matter bonuses for your next run.</span>
        </Button>
      </div>
    </div>
  );
}
