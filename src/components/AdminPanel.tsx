// Debug/Admin panel for development - press ` (backtick) to toggle

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGameStore } from '@/stores/gameStore';
import type { ResourceType } from '@/types';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [resourceAmount, setResourceAmount] = useState('1000');
  const addResource = useGameStore(state => state.addResource);
  const resources = useGameStore(state => state.resources);

  // Toggle with backtick key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '`') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isOpen) return null;

  const handleAddResource = (resource: ResourceType) => {
    const amount = parseInt(resourceAmount) || 1000;
    addResource(resource, amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>🛠️ Admin Panel (Press ` to close)</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount input */}
          <div>
            <label className="text-sm font-medium">Amount to Add:</label>
            <Input
              type="number"
              value={resourceAmount}
              onChange={(e) => setResourceAmount(e.target.value)}
              placeholder="1000"
            />
          </div>

          {/* Resource buttons */}
          <div>
            <h3 className="text-sm font-medium mb-2">Add Resources:</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => handleAddResource('debris')} variant="outline" size="sm">
                + Debris
              </Button>
              <Button onClick={() => handleAddResource('metal')} variant="outline" size="sm">
                + Metal
              </Button>
              <Button onClick={() => handleAddResource('electronics')} variant="outline" size="sm">
                + Electronics
              </Button>
              <Button onClick={() => handleAddResource('fuel')} variant="outline" size="sm">
                + Fuel
              </Button>
              <Button onClick={() => handleAddResource('rareMaterials')} variant="outline" size="sm">
                + Rare Materials
              </Button>
              <Button onClick={() => handleAddResource('exoticAlloys')} variant="outline" size="sm">
                + Exotic Alloys
              </Button>
            </div>
          </div>

          {/* Current resources */}
          <div>
            <h3 className="text-sm font-medium mb-2">Current Resources:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Debris: {Math.floor(resources.debris)}</div>
              <div>Metal: {Math.floor(resources.metal)}</div>
              <div>Electronics: {Math.floor(resources.electronics)}</div>
              <div>Fuel: {Math.floor(resources.fuel)}</div>
              <div>Rare Materials: {Math.floor(resources.rareMaterials)}</div>
              <div>Exotic Alloys: {Math.floor(resources.exoticAlloys)}</div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded p-3 text-sm">
            <strong>⚠️ Development Tool:</strong> This panel is for debugging only. 
            Remove before production!
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
