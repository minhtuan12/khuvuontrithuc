// @ts-ignore Bun test runner.
import { expect, test } from 'bun:test';
import { validators } from '../server/deviceValidation';

test('production device validation accepts teacher plans and rejects oversized data', () => {
  const plan = { age: '4-5', activity: 'Colors', plan: 'Lesson', selfStudy: 'Vocabulary' };
  expect(typeof validators['teacher-preparation']).toBe('function');
  expect(validators['teacher-preparation'](plan)).toBe(true);
  expect(validators['teacher-preparation']({ ...plan, age: '1-2' })).toBe(false);
  expect(validators['teacher-preparation']({ ...plan, plan: 'x'.repeat(30001) })).toBe(false);
});
