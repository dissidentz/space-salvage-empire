import { DerelictCard } from '@/components/DerelictCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/stores/gameStore';
import { Target } from 'lucide-react';
import { useMemo } from 'react';

export function DerelictListView() {
  const currentOrbit = useGameStore(state => state.currentOrbit);
  const allDerelicts = useGameStore(state => state.derelicts);
  
  // Filter and sort derelicts
  const derelicts = useMemo(() => 
    allDerelicts.filter(d => d.orbit === currentOrbit),
    [allDerelicts, currentOrbit]
  );

  if (derelicts.length === 0) {
    return (
      <Card className="bg-linear-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-purple-400" />
            <span>Derelicts in Current Orbit</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No derelicts discovered in this orbit</p>
            <p className="text-xs mt-1">Launch scout missions to discover salvage targets</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by expiration time (soonest first)
  const sortedDerelicts = [...derelicts].sort((a, b) => a.expiresAt - b.expiresAt);

  return (
    <Card className="bg-linear-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-purple-400" />
          <span>Derelicts in Current Orbit</span>
          <Badge variant="secondary" className="ml-auto">
            {derelicts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {sortedDerelicts.map(derelict => (
          <DerelictCard key={derelict.id} derelict={derelict} />
        ))}
      </CardContent>
    </Card>
  );
}
