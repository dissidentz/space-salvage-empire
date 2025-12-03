import { TECH_TREE } from '@/config/tech';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';

describe('Tech Tree System', () => {
    beforeEach(() => {
        useGameStore.setState({
            resources: {
                debris: 0,
                metal: 0,
                electronics: 0,
                fuel: 0,
                rareMaterials: 0,
                exoticAlloys: 0,
                aiCores: 0,
                dataFragments: 100, // Enough for tier 1 techs
                darkMatter: 0,
            },
            techTree: {
                purchased: [],
                available: [],
            },
        });
    });

    it('should have 3 branches with multiple tiers', () => {
        const branches = new Set();
        const tiers = new Set();
        
        Object.values(TECH_TREE).forEach(tech => {
            branches.add(tech.branch);
            tiers.add(tech.tier);
        });
        
        expect(branches.size).toBe(3); // efficiency, exploration, economy
        expect(tiers.size).toBeGreaterThanOrEqual(3); // At least 3 tiers
    });

    it('should check prerequisites correctly', () => {
        const store = useGameStore.getState();
        
        // Tier 1 tech with no prerequisites should be unlocked
        const tier1Tech = Object.values(TECH_TREE).find(t => t.tier === 1 && t.prerequisites.length === 0);
        if (tier1Tech) {
            expect(store.isTechUnlocked(tier1Tech.id)).toBe(true);
        }
        
        // Tier 2 tech with prerequisites should be locked
        const tier2Tech = Object.values(TECH_TREE).find(t => t.tier === 2 && t.prerequisites.length > 0);
        if (tier2Tech) {
            expect(store.isTechUnlocked(tier2Tech.id)).toBe(false);
        }
    });

    it('should purchase tech and deduct data fragments', () => {
        const store = useGameStore.getState();
        
        // Find a tier 1 tech
        const tech = Object.values(TECH_TREE).find(t => t.tier === 1 && t.prerequisites.length === 0);
        if (!tech) throw new Error('No tier 1 tech found');
        
        const initialFragments = store.resources.dataFragments;
        const success = store.purchaseTech(tech.id);
        
        expect(success).toBe(true);
        expect(useGameStore.getState().resources.dataFragments).toBe(initialFragments - tech.dataFragmentCost);
        expect(useGameStore.getState().techTree.purchased).toContain(tech.id);
    });

    it('should not purchase tech without sufficient data fragments', () => {
        useGameStore.setState({ resources: { ...useGameStore.getState().resources, dataFragments: 0 } });
        const store = useGameStore.getState();
        
        const tech = Object.values(TECH_TREE).find(t => t.tier === 1);
        if (!tech) throw new Error('No tier 1 tech found');
        
        const success = store.purchaseTech(tech.id);
        expect(success).toBe(false);
    });

    it('should unlock dependent techs after purchasing prerequisites', () => {
        const store = useGameStore.getState();
        
        // Find a tech with prerequisites
        const dependentTech = Object.values(TECH_TREE).find(t => t.prerequisites.length > 0);
        if (!dependentTech) return; // Skip if no dependent techs
        
        // Should be locked initially
        expect(store.isTechUnlocked(dependentTech.id)).toBe(false);
        
        // Purchase all prerequisites
        dependentTech.prerequisites.forEach(prereqId => {
            const prereq = TECH_TREE[prereqId];
            useGameStore.setState({ 
                resources: { ...useGameStore.getState().resources, dataFragments: prereq.dataFragmentCost + 10 }
            });
            useGameStore.getState().purchaseTech(prereqId);
        });
        
        // Should now be unlocked
        expect(useGameStore.getState().isTechUnlocked(dependentTech.id)).toBe(true);
    });
});
