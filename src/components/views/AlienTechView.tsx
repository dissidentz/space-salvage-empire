import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAlienTechList } from '@/config/alienTech';
import { useGameStore } from '@/stores/gameStore';
import { CheckCircle2, Lock, Skull } from 'lucide-react';

export function AlienTechView() {
  const resources = useGameStore(state => state.resources);
  const alienTech = useGameStore(state => state.alienTech);
  const purchaseAlienTech = useGameStore(state => state.purchaseAlienTech);

  const alienTechList = getAlienTechList();
  
  // Check if player has any artifacts
  const hasArtifacts = resources.alienArtifacts > 0;

  if (!hasArtifacts) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="p-4 bg-slate-800 rounded-full">
          <Lock className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-400">Alien Tech Shop Locked</h2>
        <p className="text-muted-foreground max-w-md">
          Discover Alien Artifacts from Epic+ derelicts (Ancient Probe, Alien Relay) to unlock this shop.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Skull className="w-8 h-8 text-teal-400" />
            Alien Tech Shop
          </h1>
          <p className="text-muted-foreground">
            Purchase unique upgrades with Alien Artifacts from Epic+ derelicts
          </p>
        </div>
        <Badge variant="secondary" className="text-teal-400 bg-teal-900/20 border-teal-800 text-lg px-4 py-2">
          <Skull className="w-4 h-4 mr-2" />
          {resources.alienArtifacts} Artifacts
        </Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alienTechList.map(tech => {
            const isPurchased = alienTech[tech.id];
            const canAfford = resources.alienArtifacts >= tech.cost;

            return (
              <Card 
                key={tech.id}
                className={`relative overflow-hidden transition-all ${
                  isPurchased 
                    ? 'bg-teal-950/30 border-teal-800/50' 
                    : canAfford
                    ? 'bg-slate-900/50 border-slate-700 hover:border-teal-700 hover:shadow-lg hover:shadow-teal-900/20'
                    : 'bg-slate-900/30 border-slate-800/50 opacity-60'
                }`}
              >
                {isPurchased && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-teal-600 text-black">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Purchased
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className={isPurchased ? 'text-teal-300' : 'text-slate-200'}>
                      {tech.name}
                    </span>
                    <Badge variant="outline" className="text-teal-400 border-teal-700">
                      {tech.cost} <Skull className="w-3 h-3 ml-1" />
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {tech.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-slate-300">Effect: </span>
                    {tech.effects.map((effect, idx) => (
                      <span key={idx} className="text-teal-400">
                        {effect.type === 'multiplier' && effect.value > 1 && `+${((effect.value - 1) * 100).toFixed(0)}%`}
                        {effect.type === 'multiplier' && effect.value < 1 && `-${((1 - effect.value) * 100).toFixed(0)}%`}
                        {' '}{effect.target.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      isPurchased
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : canAfford
                        ? 'bg-teal-600 hover:bg-teal-500 text-black font-bold'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                    disabled={isPurchased || !canAfford}
                    onClick={() => purchaseAlienTech(tech.id)}
                  >
                    {isPurchased ? 'Purchased' : canAfford ? 'Purchase' : `Need ${tech.cost - resources.alienArtifacts} more`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
