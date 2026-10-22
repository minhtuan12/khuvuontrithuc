// @ts-ignore Bun's built-in test runner is available without a Node dependency.
import { afterEach, expect, test } from 'bun:test';
import { getTodayStudySeconds, localDay, readEmotionHistory, readStoredNumber } from '../src/lib/wellbeing';

let values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: (key: string) => values.get(key) ?? null } });
afterEach(() => { values.clear(); });

test('emotion history filters corrupt records and caps retained choices', () => {
  const valid = { emotion: 'vui', date: '2026-10-22T08:00:00Z', feedback: 'Vui cùng con' };
  values.set('kvtt.emotions.v1', JSON.stringify([null, {}, { ...valid, emotion: 'unknown' }, { ...valid, date: 'bad' }, ...Array(25).fill(valid)]));
  expect(readEmotionHistory()).toEqual(Array(20).fill(valid));
});
test('invalid or blocked device storage falls back safely', () => {
  values.set('kvtt.emotions.v1', 'null');
  expect(readEmotionHistory()).toEqual([]);
  values.set('stars', '-20');
  expect(readStoredNumber('stars')).toBe(0);
  values.set('stars', 'NaN');
  expect(readStoredNumber('stars', 3)).toBe(3);
  values.set('stars', '12');
  expect(readStoredNumber('stars')).toBe(12);
});
test('study time belongs to the Vietnam calendar day and resets after midnight', () => {
  expect(localDay(new Date('2026-10-21T18:00:00Z'))).toBe('2026-10-22');
  values.set('kvtt.study-time.v1', JSON.stringify({ day: '2000-01-01', seconds: 999 }));
  expect(getTodayStudySeconds()).toBe(0);
  values.set('kvtt.study-time.v1', JSON.stringify({ day: localDay(), seconds: 42 }));
  expect(getTodayStudySeconds()).toBe(42);
});
