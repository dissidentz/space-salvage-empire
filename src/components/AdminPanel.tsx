// Debug/Admin panel for development - press ` (backtick) to toggle

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGameStore } from '@/stores/gameStore';
import type { ResourceType, ShipType } from '@/types';
import { Package, Rocket, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('1000');
  const addResource = useGameStore(state => state.addResource);
  const resources = useGameStore(state => state.resources);
  const ships = useGameStore(state => state.ships);

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
    const qty = parseInt(amount) || 1000;
    addResource(resource, qty);
  };

  const handleAddShip = (ship: ShipType) => {
    const qty = parseInt(amount) || 1;
    // Bypass cost by directly modifying ships
    useGameStore.setState((state) => ({
      ships: {
        ...state.ships,
        [ship]: state.ships[ship] + qty,
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[85vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2">
            🛠️ Admin Panel
            <span className="text-sm font-normal text-muted-foreground">(Press ` to close)</span>
          </CardTitle>
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000"
              className="mt-1"
            />
          </div>

          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resources" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="ships" className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Ships
              </TabsTrigger>
            </TabsList>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-4 mt-4">
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
                  <Button onClick={() => handleAddResource('aiCores')} variant="outline" size="sm">
                    + AI Cores
                  </Button>
                  <Button onClick={() => handleAddResource('dataFragments')} variant="outline" size="sm">
                    + Data Fragments
                  </Button>
                  <Button onClick={() => handleAddResource('darkMatter')} variant="outline" size="sm">
                    + Dark Matter
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Current Resources:</h3>
                <div className="grid grid-cols-3 gap-2 text-sm bg-slate-800/50 p-3 rounded">
                  <div>Debris: {Math.floor(resources.debris).toLocaleString()}</div>
                  <div>Metal: {Math.floor(resources.metal).toLocaleString()}</div>
                  <div>Electronics: {Math.floor(resources.electronics).toLocaleString()}</div>
                  <div>Fuel: {Math.floor(resources.fuel).toLocaleString()}</div>
                  <div>Rare Materials: {Math.floor(resources.rareMaterials).toLocaleString()}</div>
                  <div>Exotic Alloys: {Math.floor(resources.exoticAlloys).toLocaleString()}</div>
                  <div>AI Cores: {Math.floor(resources.aiCores).toLocaleString()}</div>
                  <div>Data Fragments: {Math.floor(resources.dataFragments).toLocaleString()}</div>
                  <div>Dark Matter: {Math.floor(resources.darkMatter).toLocaleString()}</div>
                </div>
              </div>
            </TabsContent>

            {/* Ships Tab */}
            <TabsContent value="ships" className="space-y-4 mt-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Add Ships:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => handleAddShip('salvageDrone')} variant="outline" size="sm">
                    + Salvage Drone
                  </Button>
                  <Button onClick={() => handleAddShip('refineryBarge')} variant="outline" size="sm">
                    + Refinery Barge
                  </Button>
                  <Button onClick={() => handleAddShip('electronicsExtractor')} variant="outline" size="sm">
                    + Electronics Extractor
                  </Button>
                  <Button onClick={() => handleAddShip('fuelSynthesizer')} variant="outline" size="sm">
                    + Fuel Synthesizer
                  </Button>
                  <Button onClick={() => handleAddShip('matterExtractor')} variant="outline" size="sm">
                    + Matter Extractor
                  </Button>
                  <Button onClick={() => handleAddShip('quantumMiner')} variant="outline" size="sm">
                    + Quantum Miner
                  </Button>
                  <Button onClick={() => handleAddShip('scoutProbe')} variant="outline" size="sm">
                    + Scout Probe
                  </Button>
                  <Button onClick={() => handleAddShip('salvageFrigate')} variant="outline" size="sm">
                    + Salvage Frigate
                  </Button>
                  <Button onClick={() => handleAddShip('heavySalvageFrigate')} variant="outline" size="sm">
                    + Heavy Salvage Frigate
                  </Button>
                  <Button onClick={() => handleAddShip('deepSpaceScanner')} variant="outline" size="sm">
                    + Deep Space Scanner
                  </Button>
                  <Button onClick={() => handleAddShip('colonyShip')} variant="outline" size="sm">
                    + Colony Ship
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Current Ships:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm bg-slate-800/50 p-3 rounded">
                  <div>Salvage Drone: {ships.salvageDrone}</div>
                  <div>Refinery Barge: {ships.refineryBarge}</div>
                  <div>Electronics Extractor: {ships.electronicsExtractor}</div>
                  <div>Fuel Synthesizer: {ships.fuelSynthesizer}</div>
                  <div>Matter Extractor: {ships.matterExtractor}</div>
                  <div>Quantum Miner: {ships.quantumMiner}</div>
                  <div>Scout Probe: {ships.scoutProbe}</div>
                  <div>Salvage Frigate: {ships.salvageFrigate}</div>
                  <div>Heavy Salvage Frigate: {ships.heavySalvageFrigate}</div>
                  <div>Deep Space Scanner: {ships.deepSpaceScanner}</div>
                  <div>Colony Ship: {ships.colonyShip}</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
