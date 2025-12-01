import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TECH_TREE } from '@/config/tech';
import { useGameStore } from '@/stores/gameStore';
import { Check, Lock, Unlock } from 'lucide-react';

interface TechNodeCardProps {
  techId: string;
}

export function TechNodeCard({ techId }: TechNodeCardProps) {
  const tech = TECH_TREE[techId];
  const purchased = useGameStore((state) => state.techTree.purchased.includes(techId));
  const isUnlocked = useGameStore((state) => state.isTechUnlocked(techId));
  const canAfford = useGameStore((state) => state.canAffordTech(techId));
  const purchaseTech = useGameStore((state) => state.purchaseTech);

  const handlePurchase = () => {
    if (canAfford) {
      purchaseTech(techId);
    }
  };

  if (!tech) return null;

  return (
    <Card className={`w-64 border-2 transition-all duration-300 ${
      purchased 
        ? 'border-green-500/50 bg-green-950/20' 
        : isUnlocked 
          ? 'border-blue-500/50 bg-blue-950/20 hover:border-blue-400' 
          : 'border-slate-700/50 bg-slate-900/50 opacity-75'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base flex items-center gap-2">
            {purchased ? <Check className="w-4 h-4 text-green-400" /> : 
             !isUnlocked ? <Lock className="w-4 h-4 text-slate-500" /> : 
             <Unlock className="w-4 h-4 text-blue-400" />}
            {tech.name}
          </CardTitle>
          <Badge variant={purchased ? 'default' : 'outline'} className={purchased ? 'bg-green-600' : ''}>
            Tier {tech.tier}
          </Badge>
        </div>
        <CardDescription className="text-xs">{tech.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className={`text-xs font-mono ${canAfford || purchased ? 'text-cyan-300' : 'text-red-400'}`}>
          Cost: {tech.dataFragmentCost} Data Fragments
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {!purchased && (
          <Button 
            size="sm" 
            className="w-full" 
            disabled={!canAfford}
            onClick={handlePurchase}
            variant={isUnlocked ? 'default' : 'secondary'}
          >
            {!isUnlocked ? 'Locked' : canAfford ? 'Research' : 'Insufficient Data'}
          </Button>
        )}
        {purchased && (
          <div className="w-full text-center text-xs text-green-400 font-medium py-2">
            Researched
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

