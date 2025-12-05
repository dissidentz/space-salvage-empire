import type { ResourceType } from '@/types';

export interface TradeRoute {
  id: string;
  input: ResourceType;
  output: ResourceType;
  inputAmount: number;
  outputAmount: number;
}

export const TRADE_ROUTES: TradeRoute[] = [
  {
    id: 'metal_to_fuel',
    input: 'metal',
    output: 'fuel',
    inputAmount: 50,
    outputAmount: 10,
  },
  {
    id: 'electronics_to_fuel',
    input: 'electronics',
    output: 'fuel',
    inputAmount: 10,
    outputAmount: 5,
  },
  {
    id: 'rare_to_data',
    input: 'rareMaterials',
    output: 'dataFragments',
    inputAmount: 5,
    outputAmount: 1,
  },
  {
    id: 'debris_to_metal',
    input: 'debris',
    output: 'metal',
    inputAmount: 100,
    outputAmount: 25,
  },
  {
    id: 'metal_to_electronics',
    input: 'metal',
    output: 'electronics',
    inputAmount: 100,
    outputAmount: 10,
  },
];
