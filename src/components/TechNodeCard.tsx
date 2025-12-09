import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { TECH_TREE } from '@/config/tech';
import { useGameStore } from '@/stores/gameStore';
import { Check, Lock, Unlock } from 'lucide-react';

interface TechNodeCardProps {
  techId: string;
  hoveredTechId?: string | null;
  onHover?: (id: string | null) => void;
}

export function TechNodeCard({ techId, hoveredTechId, onHover }: TechNodeCardProps) {
  const tech = TECH_TREE[techId];
  const purchased = useGameStore((state) => state.techTree.purchased.includes(techId));
  const isUnlocked = useGameStore((state) => state.isTechUnlocked(techId));
  const canAfford = useGameStore((state) => state.canAffordTech(techId));
  const purchaseTech = useGameStore((state) => state.purchaseTech);

  // Dependency Logic
  // I am a PARENT if the Hovered Tech requires ME
  const isParent = hoveredTechId && TECH_TREE[hoveredTechId]?.prerequisites.includes(techId);
  
  // I am a CHILD if I require the Hovered Tech
  const isChild = hoveredTechId && tech.prerequisites.includes(hoveredTechId);

  const handlePurchase = () => {
    if (canAfford) {
      purchaseTech(techId);
    }
  };

  if (!tech) return null;

  // Dynamic Styles
  let borderClass = 'border-slate-800';
  let bgClass = 'bg-slate-900/40';
  let shadowClass = '';
  
  if (isParent) {
      borderClass = 'border-amber-500 ring-2 ring-amber-500/20';
      bgClass = 'bg-amber-950/30';
      shadowClass = 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]';
  } else if (isChild) {
      borderClass = 'border-purple-500 ring-2 ring-purple-500/20';
      bgClass = 'bg-purple-950/30';
      shadowClass = 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.3)]';
  } else if (purchased) {
      borderClass = 'border-emerald-500/50';
      bgClass = 'bg-emerald-950/20';
      shadowClass = 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]';
  } else if (isUnlocked) {
      borderClass = 'border-cyan-500/50';
      bgClass = 'bg-cyan-950/20';
      shadowClass = 'hover:border-cyan-400 hover:shadow-[0_0_15px_-3px_rgba(34,211,238,0.2)]';
  }

  // Opacity for non-relevant items when hovering
  const isDimmed = hoveredTechId && hoveredTechId !== techId && !isParent && !isChild;

  return (
    <Card 
        className={`h-full flex flex-col border transition-all duration-300 ${borderClass} ${bgClass} ${shadowClass} ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}`}
        onMouseEnter={() => onHover?.(techId)}
        onMouseLeave={() => onHover?.(null)}
    >
      <CardHeader className="pb-3 border-b border-slate-800/50 bg-slate-900/20">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className={`text-sm font-bold flex items-center gap-2 ${purchased ? 'text-emerald-400' : isUnlocked ? 'text-cyan-400' : 'text-slate-400'}`}>
            {purchased ? <Check className="w-4 h-4" /> : 
             !isUnlocked ? <Lock className="w-4 h-4" /> : 
             <Unlock className="w-4 h-4" />}
            {tech.name}
          </CardTitle>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-auto whitespace-nowrap ${
            purchased ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-slate-700 text-slate-500'
          }`}>
            Tier {tech.tier}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="py-4 flex-grow relative">
        <CardDescription className="text-xs text-slate-300 leading-relaxed min-h-[40px]">
          {tech.description}
        </CardDescription>

        {/* Requirements Indicator */}
        {!purchased && tech.prerequisites.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/50">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 block">Requires:</span>
                <div className="flex flex-wrap gap-1">
                    {tech.prerequisites.map(reqId => {
                        const reqName = TECH_TREE[reqId]?.name || reqId;
                        const reqPurchased = useGameStore.getState().techTree.purchased.includes(reqId);
                        return (
                            <Badge key={reqId} variant="secondary" className={`text-[9px] px-1.5 py-0 ${reqPurchased ? 'text-emerald-400 bg-emerald-950/30' : 'text-amber-400 bg-amber-950/30'}`}>
                                {reqPurchased ? <Check className="w-3 h-3 mr-1 inline"/> : <Lock className="w-3 h-3 mr-1 inline"/>}
                                {reqName}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        )}
        
        {/* Cost Tag */}
        {!purchased && (
           <div className={`mt-4 inline-flex items-center px-2 py-1 rounded text-[10px] font-mono border ${
             canAfford 
               ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' 
               : 'border-red-500/30 bg-red-500/10 text-red-300'
           }`}>
             {tech.dataFragmentCost} Data Fragments
           </div>
        )}

        {/* Relation Badges (Only show on hover) */}
        {isParent && (
            <div className="absolute top-2 right-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30">
                    REQUIRED
                </Badge>
            </div>
        )}
        {isChild && (
            <div className="absolute top-2 right-2">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30">
                    UNLOCKS
                </Badge>
            </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 pb-3 border-t border-slate-800/50 bg-slate-900/20">
        {!purchased && (
          <Button 
            size="sm" 
            className={`w-full text-xs font-semibold tracking-wide transition-all ${
                isUnlocked && canAfford
                 ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg' 
                 : ''
            }`}
            disabled={!canAfford}
            onClick={handlePurchase}
            variant={!isUnlocked ? 'ghost' : canAfford ? 'default' : 'secondary'}
          >
            {!isUnlocked ? 'LOCKED' : canAfford ? 'RESEARCH' : 'INSUFFICIENT DATA'}
          </Button>
        )}
        {purchased && (
          <div className="w-full text-center text-xs text-emerald-500 font-bold tracking-widest py-1.5 uppercase opacity-80">
            Researched
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

