import { TechBranch } from '@/components/TechBranch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameStore } from '@/stores/gameStore';
import { Atom, Database, Rocket, Zap } from 'lucide-react';

export function TechTreeView() {
  const dataFragments = useGameStore((state) => state.resources.dataFragments);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Research & Development</h1>
          <p className="text-slate-400 mt-1">Unlock advanced technologies to expand your empire.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 px-6 py-3 rounded-xl border border-slate-800 shadow-lg">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Database className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-mono text-cyan-400 leading-none">{Math.floor(dataFragments)}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Data Fragments</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="efficiency" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-900/50 p-1 h-auto">
          <TabsTrigger value="efficiency" className="flex items-center gap-2 py-3 data-[state=active]:bg-emerald-950/30 data-[state=active]:text-emerald-400 data-[state=active]:border-emerald-500/30 border border-transparent">
            <Zap className="w-5 h-5" /> 
            <span className="text-lg">Efficiency</span>
          </TabsTrigger>
          <TabsTrigger value="exploration" className="flex items-center gap-2 py-3 data-[state=active]:bg-blue-950/30 data-[state=active]:text-blue-400 data-[state=active]:border-blue-500/30 border border-transparent">
            <Rocket className="w-5 h-5" /> 
            <span className="text-lg">Exploration</span>
          </TabsTrigger>
          <TabsTrigger value="economy" className="flex items-center gap-2 py-3 data-[state=active]:bg-amber-950/30 data-[state=active]:text-amber-400 data-[state=active]:border-amber-500/30 border border-transparent">
            <Atom className="w-5 h-5" /> 
            <span className="text-lg">Economy</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <TabsContent value="efficiency" className="mt-0 h-full">
            <TechBranch branch="efficiency" />
          </TabsContent>
          <TabsContent value="exploration" className="mt-0 h-full">
            <TechBranch branch="exploration" />
          </TabsContent>
          <TabsContent value="economy" className="mt-0 h-full">
            <TechBranch branch="economy" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
