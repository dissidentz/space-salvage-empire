import { TechNodeCard } from '@/components/TechNodeCard';
import { getTechsByTier } from '@/config/tech';
import type { TechBranch as BranchType } from '@/types';

interface TechBranchProps {
  branch: BranchType;
}

export function TechBranch({ branch }: TechBranchProps) {
  const tiers = [1, 2, 3, 4, 5] as const;

  return (
    <div className="flex flex-col gap-8 p-4">
      {tiers.map((tier) => {
        const techs = getTechsByTier(branch, tier);
        if (techs.length === 0) return null;

        return (
          <div key={tier} className="relative pl-6 border-l-2 border-slate-800">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-950" />
            <h3 className="text-lg font-bold mb-4 text-slate-400 uppercase tracking-wider">Tier {tier}</h3>
            <div className="flex flex-wrap gap-4">
              {techs.map((tech) => (
                <TechNodeCard key={tech.id} techId={tech.id} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
