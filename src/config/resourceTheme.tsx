import type { ResourceType } from '@/types';
import {
    Bot,
    Box,
    Cpu,
    Database,
    Flame,
    Gem,
    Hexagon,
    Satellite,
    Skull,
    Sparkles
} from 'lucide-react';

export interface ResourceTheme {
  icon: React.ElementType;
  color: string;
  label: string;
}

export const RESOURCE_THEME: Record<ResourceType, ResourceTheme> = {
  debris: {
    icon: Satellite,
    color: 'text-yellow-400',
    label: 'Debris'
  },
  metal: {
    icon: Box,
    color: 'text-slate-300',
    label: 'Metal'
  },
  electronics: {
    icon: Cpu,
    color: 'text-blue-400',
    label: 'Electronics'
  },
  fuel: {
    icon: Flame,
    color: 'text-orange-400',
    label: 'Fuel'
  },
  rareMaterials: {
    icon: Gem,
    color: 'text-purple-400',
    label: 'Rare Materials'
  },
  exoticAlloys: {
    icon: Hexagon,
    color: 'text-pink-400',
    label: 'Exotic Alloys'
  },
  aiCores: {
    icon: Bot,
    color: 'text-green-400',
    label: 'AI Cores'
  },
  dataFragments: {
    icon: Database,
    color: 'text-cyan-400',
    label: 'Data Fragments'
  },
  darkMatter: {
    icon: Sparkles,
    color: 'text-indigo-400',
    label: 'Dark Matter'
  },
  alienArtifacts: {
    icon: Skull,
    color: 'text-teal-400',
    label: 'Alien Artifacts'
  }
};
