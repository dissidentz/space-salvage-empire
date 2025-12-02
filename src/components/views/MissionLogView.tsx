import { MissionHistory } from '@/components/MissionHistory';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/stores/gameStore';
import { AlertCircle, Bell, CheckCircle, Info, ScrollText, XCircle } from 'lucide-react';

export function MissionLogView() {
  const eventLog = useGameStore(state => state.ui.eventLog);
  
  // Use eventLog directly, slice in render
  const eventHistory = eventLog ? eventLog.slice(0, 100) : [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ScrollText className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Mission Log</h1>
      </div>

      {/* Notification Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent events</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {eventHistory.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-card/50 border border-border hover:bg-card/80 transition-colors"
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{event.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                  <Badge className={getNotificationBadgeColor(event.type)}>
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Mission History */}
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
