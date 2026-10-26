// @ts-nocheck -- This regression suite runs with Bun's built-in test runner.
import { beforeEach, expect, test } from 'bun:test';
import { getEnglishSession, getGuestEnglishProgress, recordEnglishProgress, resetEnglishProgressForAccountChange } from '../src/lib/englishSync';
import { ENGLISH_LESSONS_BY_AGE } from '../src/lib/englishCatalog';

const values = new Map<string, string>();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
};
globalThis.window = new EventTarget();
beforeEach(() => { values.clear(); resetEnglishProgressForAccountChange(); });

test('invalid stored sessions are treated as signed out', () => {
  values.set('kvtt.supabase.session.v1', JSON.stringify({ access_token: 'invalid' }));
  expect(getEnglishSession()).toBeNull();
  expect(getGuestEnglishProgress()).toEqual({});
});

test('null progress cache can recover when a lesson is opened', async () => {
  const id = ENGLISH_LESSONS_BY_AGE['3-4'][0].id;
  values.set('kvtt.english.progress.v1.guest', 'null');
  await recordEnglishProgress(id, false);
  expect(getGuestEnglishProgress()[id].lessonId).toBe(id);
});

test('invalid cache entries are ignored while valid completion survives reopening', async () => {
  const id = ENGLISH_LESSONS_BY_AGE['3-4'][0].id;
  values.set('kvtt.english.progress.v1.guest', JSON.stringify({ bad: null }));
  expect(getGuestEnglishProgress()).toEqual({});
  await recordEnglishProgress(id, true);
  const completion = getGuestEnglishProgress()[id].completedAt;
  await recordEnglishProgress(id, false);
  expect(getGuestEnglishProgress()[id].completedAt).toBe(completion);
});
