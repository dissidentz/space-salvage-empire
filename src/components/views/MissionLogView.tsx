import { MissionHistory } from '@/components/MissionHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollText } from 'lucide-react';

export function MissionLogView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ScrollText className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Mission Log</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Mission History</CardTitle>
        </CardHeader>
        <CardContent>
          <MissionHistory />
        </CardContent>
      </Card>
    </div>
  );
}
