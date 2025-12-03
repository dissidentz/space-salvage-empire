// Test for getAdjacentOrbits helper function
import { describe, expect, it } from 'vitest';
import { getAdjacentOrbits } from './orbits';

describe('getAdjacentOrbits', () => {
  it('should return only next orbit for LEO (start of progression)', () => {
    const adjacent = getAdjacentOrbits('leo');
    expect(adjacent).toEqual(['geo']);
  });

  it('should return only previous orbit for Deep Space (end of progression)', () => {
    const adjacent = getAdjacentOrbits('deepSpace');
    expect(adjacent).toEqual(['kuiper']);
  });

  it('should return both previous and next orbits for middle positions', () => {
    // Test Mars (index 3)
    const adjacentMars = getAdjacentOrbits('mars');
    expect(adjacentMars).toEqual(['lunar', 'asteroidBelt']);
    
    // Test Jovian (index 5)
    const adjacentJovian = getAdjacentOrbits('jovian');
    expect(adjacentJovian).toEqual(['asteroidBelt', 'kuiper']);
  });

  it('should return correct adjacent orbits for GEO', () => {
    const adjacent = getAdjacentOrbits('geo');
    expect(adjacent).toEqual(['leo', 'lunar']);
  });

  it('should return correct adjacent orbits for Lunar', () => {
    const adjacent = getAdjacentOrbits('lunar');
    expect(adjacent).toEqual(['geo', 'mars']);
  });

  it('should return correct adjacent orbits for Asteroid Belt', () => {
    const adjacent = getAdjacentOrbits('asteroidBelt');
    expect(adjacent).toEqual(['mars', 'jovian']);
  });

  it('should return correct adjacent orbits for Kuiper', () => {
    const adjacent = getAdjacentOrbits('kuiper');
    expect(adjacent).toEqual(['jovian', 'deepSpace']);
  });
});
