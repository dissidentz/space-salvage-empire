// Settings view - save/load/reset functionality

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useGameStore } from '@/stores/gameStore';
import { Copy, Download, RefreshCw, Save, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';

export function SettingsView() {
  const [saveData, setSaveData] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const exportSave = useGameStore(state => state.exportSave);
  const importSave = useGameStore(state => state.importSave);
  const hardReset = useGameStore(state => state.hardReset);
  const stats = useGameStore(state => state.stats);
  const resources = useGameStore(state => state.resources);
  const ships = useGameStore(state => state.ships);

  const handleExport = () => {
    const data = exportSave();
    setSaveData(data);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(saveData);
      alert('Save data copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard');
    }
  };

  const handleImport = () => {
    if (!saveData.trim()) {
      alert('Please paste save data first');
      return;
    }

    const success = importSave(saveData);
    if (success) {
      alert('Save data imported successfully!');
      setSaveData('');
    } else {
      alert('Failed to import save data. Please check the format.');
    }
  };

  const handleReset = () => {
    if (showConfirm) {
      hardReset();
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 5000);
    }
  };

  const totalShips = Object.values(ships ?? {}).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your game data and progress</p>
      </div>

      {/* Game Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Game Statistics</CardTitle>
          <CardDescription>Your current progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Clicks</div>
              <div className="text-2xl font-bold">{(stats?.totalClicks ?? 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Ships</div>
              <div className="text-2xl font-bold">{totalShips.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Debris Collected</div>
              <div className="text-2xl font-bold">{Math.floor(stats?.totalDebrisCollected ?? 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Metal Produced</div>
              <div className="text-2xl font-bold">{Math.floor(stats?.totalMetalProduced ?? 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Current Debris</div>
              <div className="text-2xl font-bold">{Math.floor(resources?.debris ?? 0).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Current Metal</div>
              <div className="text-2xl font-bold">{Math.floor(resources?.metal ?? 0).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Save */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Save
          </CardTitle>
          <CardDescription>
            Export your game data to backup or transfer to another device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExport} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Generate Save Data
          </Button>
          
          {saveData && (
            <>
              <Textarea
                value={saveData}
                readOnly
                className="font-mono text-xs h-40"
                placeholder="Save data will appear here..."
              />
              <Button onClick={handleCopyToClipboard} variant="outline" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Import Save */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Save
          </CardTitle>
          <CardDescription>
            Restore your game from a previously exported save
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={saveData}
            onChange={(e) => setSaveData(e.target.value)}
            className="font-mono text-xs h-40"
            placeholder="Paste your save data here..."
          />
          <Button onClick={handleImport} variant="outline" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Import Save Data
          </Button>
        </CardContent>
      </Card>

      {/* Hard Reset */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete all game data and start over
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/50 rounded p-4 text-sm">
            <strong>⚠️ Warning:</strong> This action cannot be undone! All your progress will be lost.
            {showConfirm && (
              <div className="mt-2 text-destructive font-bold">
                Click "Hard Reset" again to confirm!
              </div>
            )}
          </div>
          <Button 
            onClick={handleReset} 
            variant={showConfirm ? "destructive" : "outline"}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {showConfirm ? 'Confirm Hard Reset' : 'Hard Reset Game'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
