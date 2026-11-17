import { describe, test, expect } from 'vitest';
import { shuffle, reshuffleAvoidingRepeat } from '../utils/shuffle';

describe('shuffle', () => {
  test('keeps every item exactly once and does not change the input', () => {
    const input = Array.from({ length: 50 }, (_, i) => i);
    const copy = [...input];
    const out = shuffle(input);
    expect(input).toEqual(copy);
    expect([...out].sort((a, b) => a - b)).toEqual(copy);
  });

  test('is roughly uniform: each item lands in first place about equally often', () => {
    const counts = [0, 0, 0, 0];
    const runs = 20000;
    for (let i = 0; i < runs; i++) counts[shuffle([0, 1, 2, 3])[0]]++;
    for (const c of counts) {
      expect(c / runs).toBeGreaterThan(0.22);
      expect(c / runs).toBeLessThan(0.28);
    }
  });
});

describe('reshuffleAvoidingRepeat', () => {
  test('never starts with the word that was just shown', () => {
    const pool = [1, 2, 3, 4, 5];
    for (let i = 0; i < 2000; i++) {
      const out = reshuffleAvoidingRepeat(pool, 5);
      expect(out[0]).not.toBe(5);
      expect([...out].sort((a, b) => a - b)).toEqual(pool);
    }
  });

  test('a one-word pool is returned as is', () => {
    expect(reshuffleAvoidingRepeat([7], 7)).toEqual([7]);
  });
});
