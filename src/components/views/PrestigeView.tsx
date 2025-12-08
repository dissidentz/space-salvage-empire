import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ARK_COMPONENTS, calculateDarkMatterGain, PRESTIGE_PERKS } from '@/config/prestige';
import { useGameStore } from '@/stores/gameStore';
import type { ArkComponentType } from '@/types';
import { Atom, Lock, Rocket, Zap } from 'lucide-react';

export function PrestigeView() {
  const { 
    resources, 
    prestige, 
    prestigeReset, 
    buyPerk, 
    unlockArk, 
    buildArkComponent
  } = useGameStore();

  const dmGain = calculateDarkMatterGain(resources.dataFragments);
  const canPrestige = dmGain > 0;

  const handlePrestige = () => {
    if (confirm(`Are you sure you want to perform a Quantum Reset? You will lose all resources, ships, and tech, but gain ${dmGain} Dark Matter.`)) {
      prestigeReset();
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Atom className="h-8 w-8 text-purple-500" />
            Quantum Prestige
          </h1>
          <p className="text-muted-foreground">
            Manipulate the fabric of reality using Dark Matter.
          </p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Dark Matter</p>
                <p className="text-2xl font-bold text-purple-400">{prestige.darkMatter.toLocaleString()}</p>
            </div>
            <Button 
                variant={canPrestige ? "destructive" : "secondary"} 
                size="lg"
                onClick={handlePrestige}
                disabled={!canPrestige}
            >
                <Zap className="mr-2 h-4 w-4" />
                Reset for {dmGain} DM
            </Button>
        </div>
      </div>

      <Tabs defaultValue="perks" className="flex-1 flex flex-col min-h-0">
        <TabsList>
          <TabsTrigger value="perks">Reality Perks</TabsTrigger>
          <TabsTrigger value="ark">Ark Assembly</TabsTrigger>
        </TabsList>

        <TabsContent value="perks" className="">
          <ScrollArea className="pr-4 h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {Object.values(PRESTIGE_PERKS).map((perk) => {
                const currentLevel = prestige.purchasedPerks[perk.id] || 0;
                const isMaxed = currentLevel >= perk.maxLevel;
                const cost = perk.cost * (currentLevel + 1);
                const canAfford = prestige.darkMatter >= cost;
                
                // Check prerequisites
                const prereqsMet = perk.prerequisites.every(prereq => (prestige.purchasedPerks[prereq] || 0) > 0);
                
                if (!prereqsMet && currentLevel === 0) return null; // Hide locked perks? Or show as locked?
                // Let's show them but disabled/locked
                
                return (
                  <Card key={perk.id} className={`relative ${!prereqsMet ? 'opacity-50' : ''}`}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center text-lg">
                        {perk.name}
                        <Badge variant="outline">Lvl {currentLevel} / {perk.maxLevel}</Badge>
                      </CardTitle>
                      <CardDescription>{perk.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-purple-400 font-mono">
                          {isMaxed ? 'MAXED' : `${cost} DM`}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => buyPerk(perk.id)}
                          disabled={isMaxed || !canAfford || !prereqsMet}
                        >
                          {isMaxed ? 'Max Level' : 'Upgrade'}
                        </Button>
                      </div>
                      {!prereqsMet && (
                          <div className="mt-2 text-xs text-red-400">
                              Requires: {perk.prerequisites.map(id => PRESTIGE_PERKS[id].name).join(', ')}
                          </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ark" className="">
            {!prestige.arkUnlocked ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Lock className="h-16 w-16 text-muted-foreground" />
                    <h2 className="text-2xl font-bold">Ark Assembly Locked</h2>
                    <p className="text-muted-foreground">Reach Deep Space to unlock the Ark project.</p>
                    <Button onClick={unlockArk} disabled={resources.dataFragments < 1000 /* Placeholder condition */}>
                        Unlock Ark (Requires 1000 Data Fragments)
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Rocket className="h-6 w-6 text-blue-500" />
                                    The Ark Project
                                </CardTitle>
                                <CardDescription>
                                    Assemble the Ark to save your civilization from the heat death of the universe.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(ARK_COMPONENTS).map(([id, component]) => {
                                        const state = prestige.arkComponents[id as ArkComponentType];
                                        const isBuilt = state?.assembled;
                                        const canBuild = !isBuilt && Object.entries(component.cost).every(([res, amount]) => (resources[res as keyof typeof resources] || 0) >= amount);
                                        
                                        return (
                                            <div key={id} className="border rounded-lg p-4 bg-card/50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold">{component.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{component.description}</p>
                                                    </div>
                                                    {isBuilt && <Badge variant="default" className="bg-green-500">Constructed</Badge>}
                                                </div>
                                                
                                                {!isBuilt && (
                                                    <div className="mt-4">
                                                        {state?.discovered ? (
                                                            <>
                                                                <div className="text-xs font-mono grid grid-cols-2 gap-2 mb-3">
                                                                    {Object.entries(component.cost).map(([res, amount]) => (
                                                                        <span key={res} className={(resources[res as keyof typeof resources] || 0) >= amount ? 'text-green-400' : 'text-red-400'}>
                                                                            {amount.toLocaleString()} {res}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                                <Button 
                                                                    className="w-full" 
                                                                    onClick={() => buildArkComponent(id)}
                                                                    disabled={!canBuild}
                                                                >
                                                                    Construct Component
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded border border-dashed border-slate-700">
                                                                <Lock className="w-8 h-8 text-slate-600 mb-2" />
                                                                <span className="text-sm font-semibold text-slate-400">Blueprint Undiscovered</span>
                                                                <span className="text-xs text-slate-600 text-center mt-1">
                                                                    Salvage Legendary Derelicts to find this blueprint.
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    
                    <div className="space-y-4">
                         <Card>
                            <CardHeader>
                                <CardTitle>Ark Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center p-8">
                                    <div className="relative w-64 h-64 border-4 border-dashed rounded-full flex items-center justify-center">
                                        {/* Visual representation of Ark parts could go here */}
                                        <Rocket className={`h-32 w-32 transition-all duration-1000 ${prestige.arkComplete ? 'text-blue-500 animate-pulse' : 'text-muted-foreground/20'}`} />
                                    </div>
                                    <div className="mt-8 w-full">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Completion</span>
                                            <span>{Object.values(prestige.arkComponents).filter(c => c?.assembled).length} / {Object.keys(ARK_COMPONENTS).length}</span>
                                        </div>
                                        <Progress value={(Object.values(prestige.arkComponents).filter(c => c?.assembled).length / Object.keys(ARK_COMPONENTS).length) * 100} />
                                    </div>
                                    {prestige.arkComplete && (
                                        <div className="mt-8 text-center animate-bounce">
                                            <h3 className="text-2xl font-bold text-yellow-400">ARK COMPLETE</h3>
                                            <p className="text-muted-foreground">You are ready to ascend.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
