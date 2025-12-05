import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { TRADE_ROUTES, type TradeRoute } from '@/config/trading';
import { useGameStore } from '@/stores/gameStore';
import { ArrowRight, Coins, Lock, RefreshCcw, TrendingUp } from 'lucide-react';
import { useState } from 'react';

export function TradingView() {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  
  const resources = useGameStore(state => state.resources);
  const techPurchased = useGameStore(state => state.techTree.purchased);
  const tradeResources = useGameStore(state => state.tradeResources);
  const getTechMultiplier = useGameStore(state => state.getTechMultiplier);

  const marketUnlocked = techPurchased.includes('market_access');
  const marketMastery = getTechMultiplier('trading_post_rates');

  const selectedRoute = TRADE_ROUTES.find(r => r.id === selectedRouteId);

  // Calculate Rate Display
  const getOutputAmount = (route: TradeRoute, inputAmt: number) => {
      const baseOutput = (route.outputAmount / route.inputAmount) * inputAmt;
      return Math.floor(baseOutput * marketMastery);
  };

  const handleTrade = () => {
      if (selectedRoute && amount > 0) {
          tradeResources(selectedRoute.id, amount);
      }
  };

  const setMaxAmount = () => {
      if (selectedRoute) {
          const max = Math.floor(resources[selectedRoute.input] / selectedRoute.inputAmount);
          setAmount(Math.max(1, max));
      }
  };

  if (!marketUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
        <div className="p-4 bg-slate-800 rounded-full">
          <Lock className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-400">Trading Post Locked</h2>
        <p className="text-muted-foreground max-w-md">
          Research "Market Access" in the Economy Tech Tree (Tier 2) to unlock resource trading.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Coins className="w-8 h-8 text-amber-400" />
            Trading Post
          </h1>
          <p className="text-muted-foreground">Exchange surplus resources for materials you need.</p>
        </div>
        {marketMastery > 1 && (
            <Badge variant="secondary" className="text-green-400 bg-green-900/20 border-green-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                Market Mastery Active (+50% Yield)
            </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trade Routes List */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800">
            <CardHeader>
                <CardTitle className="text-lg">Trade Routes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                    <div className="flex flex-col">
                        {TRADE_ROUTES.map(route => (
                            <button
                                key={route.id}
                                onClick={() => {
                                    setSelectedRouteId(route.id);
                                    setAmount(1);
                                }}
                                className={`flex items-center justify-between p-4 px-6 border-b border-slate-800/50 transition-colors hover:bg-slate-800/50 ${selectedRouteId === route.id ? 'bg-slate-800 border-l-4 border-l-amber-500' : ''}`}
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <span className="font-medium text-slate-200 capitalize">
                                        {route.input.replace(/([A-Z])/g, ' $1').trim()} 
                                        <span className="text-slate-500 mx-2">→</span> 
                                        {route.output.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        Rate: {route.inputAmount} : {Math.floor(route.outputAmount * marketMastery)}
                                    </span>
                                </div>
                                <ArrowRight className={`w-4 h-4 ${selectedRouteId === route.id ? 'text-amber-500' : 'text-slate-600'}`} />
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Trade Execution Area */}
        <div className="lg:col-span-2">
            {selectedRoute ? (
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="capitalize">{selectedRoute.input}</span>
                            <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                            <span className="capitalize">{selectedRoute.output}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        
                        {/* Exchange Rate Visual */}
                        <div className="flex items-center justify-center p-8 bg-slate-900/50 rounded-lg gap-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-200">{selectedRoute.inputAmount * amount}</div>
                                <div className="text-sm text-muted-foreground capitalize">{selectedRoute.input}</div>
                            </div>
                            <ArrowRight className="w-8 h-8 text-slate-600" />
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-400">{getOutputAmount(selectedRoute, selectedRoute.inputAmount * amount)}</div>
                                <div className="text-sm text-muted-foreground capitalize">{selectedRoute.output}</div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="space-y-4 max-w-md mx-auto">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Multiples</span>
                                <span>available: {Math.floor(resources[selectedRoute.input] / selectedRoute.inputAmount)}</span>
                            </div>
                            
                            <div className="flex gap-4">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setAmount(Math.max(1, amount - 1))}
                                >-</Button>
                                <Input 
                                    type="number" 
                                    value={amount} 
                                    onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                                    className="text-center font-mono"
                                />
                                <Button 
                                    variant="outline"
                                    onClick={() => setAmount(amount + 1)}
                                >+</Button>
                                <Button 
                                    variant="secondary"
                                    onClick={setMaxAmount}
                                >Max</Button>
                            </div>

                            <Slider 
                                value={[amount]} 
                                max={Math.max(10, Math.floor(resources[selectedRoute.input] / selectedRoute.inputAmount))}
                                min={1}
                                step={1}
                                onValueChange={(vals) => setAmount(vals[0])}
                            />
                        </div>

                        <Button 
                            className="w-full h-12 text-lg font-bold bg-amber-600 hover:bg-amber-500 text-black"
                            disabled={resources[selectedRoute.input] < (selectedRoute.inputAmount * amount)}
                            onClick={handleTrade}
                        >
                            Execute Trade
                        </Button>

                    </CardContent>
                </Card>
            ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-muted-foreground">
                    Select a trade route to begin
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
