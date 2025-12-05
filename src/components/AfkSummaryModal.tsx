import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGameStore } from '@/stores/gameStore';
import { Clock, Package, Zap } from 'lucide-react';

const RESOURCE_ICONS: Record<string, string> = {
  debris: '🛸',
  metal: '⚙️',
  electronics: '💡',
  fuel: '⛽',
  rareMaterials: '💎',
  exoticAlloys: '🔮',
  aiCores: '🤖',
  dataFragments: '📊',
};

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

export function AfkSummaryModal() {
  const afkSummary = useGameStore(state => state.ui.afkSummary);
  
  const handleDismiss = () => {
    useGameStore.setState(s => ({
      ui: {
        ...s.ui,
        afkSummary: null,
      }
    }));
  };

  if (!afkSummary) return null;

  const gainEntries = Object.entries(afkSummary.gains).filter(([, amount]) => (amount as number) > 0);

  return (
    <Dialog open={!!afkSummary} onOpenChange={() => handleDismiss()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-blue-400">
            <Clock className="w-6 h-6" />
            Welcome Back!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Time Away */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Time Away:</span>
              <span className="text-lg font-semibold text-white">
                {formatDuration(afkSummary.timeAway)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                Efficiency:
              </span>
              <span className="text-yellow-400 font-medium">
                {(afkSummary.efficiency * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Resources Gained */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              Resources Earned:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {gainEntries.map(([resource, amount]) => (
                <div 
                  key={resource}
                  className="flex items-center justify-between p-2 bg-slate-800/30 rounded border border-slate-700/30"
                >
                  <span className="flex items-center gap-1.5 text-sm">
                    <span>{RESOURCE_ICONS[resource] || '📦'}</span>
                    <span className="capitalize text-muted-foreground">{resource}</span>
                  </span>
                  <span className="font-medium text-green-400">
                    +{formatNumber(amount as number)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dismiss Button */}
          <Button 
            onClick={handleDismiss}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Collect & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
