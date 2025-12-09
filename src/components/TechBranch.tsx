import { TechNodeCard } from '@/components/TechNodeCard';
import { getTechsByTier } from '@/config/tech';
import type { TechBranch as BranchType } from '@/types';
import { useState } from 'react';

interface TechBranchProps {
  branch: BranchType;
}

export function TechBranch({ branch }: TechBranchProps) {
  const tiers = [1, 2, 3, 4, 5] as const;
  const [hoveredTechId, setHoveredTechId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 p-4">
      {tiers.map((tier) => {
        const techs = getTechsByTier(branch, tier);
        if (techs.length === 0) return null;

        return (
          <div key={tier} className="relative pl-6 border-l-2 border-slate-800">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950 ring-4 ring-slate-950" />
            
            <div className="flex items-center gap-4 mb-6">
                 <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest flex items-center gap-3">
                    <span className="text-slate-600 font-mono text-sm">///</span> 
                    Tier {tier}
                 </h3>
                 <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {techs.map((tech) => (
                <div key={tech.id} className="h-full">
                    <TechNodeCard 
                        techId={tech.id} 
                        hoveredTechId={hoveredTechId}
                        onHover={setHoveredTechId}
                    />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
