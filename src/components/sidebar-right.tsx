import * as React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
} from '@/components/ui/sidebar';
import { useSidebar } from '@/hooks/useSidebar';
import { useGameStore } from '@/stores/gameStore';
import type { ResourceType } from '@/types';
import {
    formatNumber,
    formatRate,
    getResourceColor,
    getResourceName,
} from '@/utils/format';

export function SidebarRight({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar('right');

  // Subscribe only to the minimal pieces of state we need to trigger updates.
  const resources = useGameStore(state => state.resources);
  const rates = useGameStore(state => state.computedRates);

  if (!open) return null;

  // Keep a stable ordering for resources (same as types definition)
  const order: ResourceType[] = [
    'debris',
    'metal',
    'electronics',
    'fuel',
    'rareMaterials',
    'exoticAlloys',
    'aiCores',
    'dataFragments',
    'darkMatter',
  ];

  return (
    <Sidebar
      side="left"
      collapsible="none"
      className="sticky top-0 h-svh border-r w-88"
      {...props}
    >
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <h3 className="text-sm font-semibold text-sidebar-foreground">
          Resources
        </h3>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-3 overflow-auto pr-2">
          {order.map(key => {
            const amount = resources[key];
            const value = typeof amount === 'number' ? amount : 0;
            const rate = (rates && (rates as Record<string, number>)[key]) ?? 0;
            const rateClass =
              rate > 0
                ? 'text-emerald-400'
                : rate < 0
                  ? 'text-rose-400'
                  : 'text-sidebar-foreground/60';

            const icons: Record<string, string> = {
              debris: '🧱',
              metal: '🔩',
              electronics: '🔌',
              fuel: '⛽',
              rareMaterials: '🔮',
              exoticAlloys: '⚙️',
              aiCores: '🤖',
              dataFragments: '📡',
              darkMatter: '🪐',
            };

            return (
              <div key={key} className="flex items-center justify-between py-1 px-2 hover:bg-sidebar-accent/50 rounded-md transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-5 text-center shrink-0">{icons[key] ?? '▪️'}</div>
                  <div className="text-sm font-medium text-sidebar-foreground truncate">
                    {getResourceName(key)}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <div className={`text-xs font-mono w-16 text-right ${rateClass}`}>
                    {rate !== 0 ? (rate > 0 ? '+' : '') + formatRate(rate) : ''}
                  </div>
                  <div className={`text-sm font-mono font-semibold w-20 text-right ${getResourceColor(key)}`}>
                    {formatNumber(value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
