
import { calculateProductionRates, calculateTickProduction } from '@/engine/production';
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';

describe('Ship Upgrades Verification', () => {
    beforeEach(() => {
        useGameStore.setState({
            resources: {
                debris: 100000,
                metal: 100000,
                electronics: 100000,
                fuel: 100000,
                rareMaterials: 100000,
                exoticAlloys: 100000,
                aiCores: 100000,
                dataFragments: 1000,
                darkMatter: 0,
                alienArtifacts: 0,
            },
            ships: {
                refineryBarge: 0,

                electronicsExtractor: 0, // Will set in tests
                matterExtractor: 0, // Will set in tests
                quantumMiner: 0, // Will set in tests
                scoutProbe: 0,
                salvageDrone: 0,
                salvageFrigate: 0,
                colonyShip: 0,
                deepSpaceScanner: 0,
                heavySalvageFrigate: 0,
                fuelSynthesizer: 0,
                aiCoreFabricator: 0,
            },
            shipEnabled: {
                refineryBarge: true,

                scoutProbe: true,
                salvageDrone: true,
                salvageFrigate: true,
                colonyShip: true,
                fuelSynthesizer: true,
                deepSpaceScanner: true,
                heavySalvageFrigate: true,
                aiCoreFabricator: true,
                electronicsExtractor: true,
                matterExtractor: true,
                quantumMiner: true,
            },
            shipUpgrades: {
                 // Will be populated in tests
            },
            techTree: {
                purchased: [],
                available: [],
            },
            currentOrbit: 'leo', 
            colonies: [],
        });
    });

    it('Precision Extraction (Electronics Extractor) should generate Rare Materials', () => {
        const store = useGameStore.getState();
        useGameStore.setState(state => ({
            ships: { ...state.ships, electronicsExtractor: 10 }
        }));

        // Purchase upgrade
        // precision_extraction: unlocks electronicsExtractor_rareMaterials: 0.1
        store.purchaseUpgrade('precision_extraction');
        
        // Verify upgrade purchased
        const upgrade = useGameStore.getState().shipUpgrades['precision_extraction'];
        expect(upgrade.currentLevel).toBe(1);

        // Check Rates
        const rates = calculateProductionRates(useGameStore.getState());
        const expectedRareRate = 10 * 0.1; // 10 ships * 0.1 per ship
        expect(rates.rareMaterials).toBeCloseTo(expectedRareRate);

        // Check Tick Production
        const deltas = calculateTickProduction(useGameStore.getState());
        expect(deltas.rareMaterials).toBeGreaterThan(0);
    });

    it('Atmospheric Filtration (Matter Extractor) should generate Electronics', () => {
         const store = useGameStore.getState();
        useGameStore.setState(state => ({
            ships: { ...state.ships, matterExtractor: 5 }
        }));

        // Purchase upgrade
        // atmospheric_filtration: unlocks matterExtractor_electronics: 5
        store.purchaseUpgrade('atmospheric_filtration');
        
        const rates = calculateProductionRates(useGameStore.getState());
        const expectedElecRate = 5 * 5; // 5 ships * 5 per ship
        expect(rates.electronics).toBeCloseTo(expectedElecRate);
        
        const deltas = calculateTickProduction(useGameStore.getState());
        expect(deltas.electronics).toBeGreaterThan(0);
    });

    it('Zero-Point Extraction (Quantum Miner) should generate Rare Materials', () => {
         const store = useGameStore.getState();
        useGameStore.setState(state => ({
            ships: { ...state.ships, quantumMiner: 2 }
        }));

        // Purchase upgrade
        // zero_point_extraction: unlocks quantumMiner_rareMaterials: 2
        store.purchaseUpgrade('zero_point_extraction');

        const rates = calculateProductionRates(useGameStore.getState());
        const expectedRareRate = 2 * 2; // 2 ships * 2 per ship
        expect(rates.rareMaterials).toBeCloseTo(expectedRareRate);
        
         const deltas = calculateTickProduction(useGameStore.getState());
        expect(deltas.rareMaterials).toBeGreaterThan(0);
    });
    
    it('Throughput Boost (Refinery Barge) should increase production', () => {
        // Verify that existing upgrades still work seamlessly
        const store = useGameStore.getState();
         useGameStore.setState(state => ({
            ships: { ...state.ships, refineryBarge: 10 },
            resources: { ...state.resources, debris: 100000} // Ensure input
        }));
        
        const initialRates = calculateProductionRates(useGameStore.getState());
        
        // throughput_boost: +50% production
        store.purchaseUpgrade('throughput_boost');
        
        const newRates = calculateProductionRates(useGameStore.getState());
        
        // Should be 1.5x metal production
        expect(newRates.metal).toBeCloseTo((initialRates.metal || 0) * 1.5);
    });
});
