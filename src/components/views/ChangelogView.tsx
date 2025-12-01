import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CHANGELOG } from '@/config/changelog';
import { BookOpen, Bug, Sparkles, TrendingUp, Wrench } from 'lucide-react';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'feature':
      return Sparkles;
    case 'improvement':
      return TrendingUp;
    case 'bugfix':
      return Bug;
    case 'balance':
      return Wrench;
    default:
      return BookOpen;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'feature':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    case 'improvement':
      return 'bg-green-500/20 text-green-300 border-green-500/50';
    case 'bugfix':
      return 'bg-red-500/20 text-red-300 border-red-500/50';
    case 'balance':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'feature':
      return 'New Feature';
    case 'improvement':
      return 'Improvement';
    case 'bugfix':
      return 'Bug Fix';
    case 'balance':
      return 'Balance Change';
    default:
      return 'Change';
  }
};

export function ChangelogView() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-muted-foreground">
          Track all updates, improvements, and changes to Space Salvage Empire
        </p>
      </div>

      <div className="space-y-6">
        {CHANGELOG.map((entry, index) => (
          <Card
            key={entry.version}
            className={`bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-slate-700/50 ${
              index === 0 ? 'border-primary/50' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span>Version {entry.version}</span>
                  {index === 0 && (
                    <Badge className="bg-primary/20 text-primary border-primary/50">
                      Latest
                    </Badge>
                  )}
                </CardTitle>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entry.changes.map((change, changeIndex) => {
                  const Icon = getCategoryIcon(change.category);
                  return (
                    <div
                      key={changeIndex}
                      className="flex items-start gap-3 p-3 bg-slate-800/30 rounded border border-slate-700/30"
                    >
                      <div className="mt-0.5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`text-xs ${getCategoryColor(change.category)}`}
                          >
                            {getCategoryLabel(change.category)}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground">
                          {change.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
