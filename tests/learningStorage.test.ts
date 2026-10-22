// @ts-ignore Bun's built-in test runner needs no extra dependency.
import { afterEach, expect, test } from 'bun:test';
import { readLearningStats, readUnlockedBadges } from '../src/lib/learningStorage';

const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const values = new Map<string, string>();
function useStorage() {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null } });
}
afterEach(() => {
  values.clear();
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
});

test('missing, null, array and malformed stats return complete zero counts', () => {
  useStorage();
  const defaults = readLearningStats();
  expect(Object.keys(defaults)).toHaveLength(11);
  expect(Object.values(defaults).every(value => value === 0)).toBe(true);
  for (const cache of ['null', '[]', '1', '"bad"', '{broken']) {
    values.set('mamnon_learning_stats', cache);
    expect(readLearningStats()).toEqual(defaults);
  }
});

test('partial stats retain valid integer counts and reject invalid counters', () => {
  useStorage();
  values.set('mamnon_learning_stats', JSON.stringify({ mathCount: 7, englishCount: 2, speechCount: -1, artCount: '4', socialCount: null, physicalCount: 1.5, bestStreak: 1e100, unknown: 3 }));
  expect(readLearningStats()).toEqual({ mathCount: 7, mathStreak: 0, speechCount: 0, speechStreak: 0, streakCount: 0, bestStreak: 0, scienceCount: 0, englishCount: 2, artCount: 0, physicalCount: 0, socialCount: 0 });
});

test('badge cache defaults empty and only retains unique known string IDs', () => {
  useStorage();
  expect(readUnlockedBadges()).toEqual([]);
  for (const cache of ['null', '{}', '"first-star"', '[broken']) {
    values.set('mamnon_unlocked_badges', cache);
    expect(readUnlockedBadges()).toEqual([]);
  }
  values.set('mamnon_unlocked_badges', JSON.stringify(['first-star', null, {}, 4, 'unknown', 'math-superhero', 'first-star']));
  expect(readUnlockedBadges()).toEqual(['first-star', 'math-superhero']);
});

test('storage access failures return safe defaults', () => {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Storage denied'); } });
  expect(Object.values(readLearningStats()).every(value => value === 0)).toBe(true);
  expect(readUnlockedBadges()).toEqual([]);
});
