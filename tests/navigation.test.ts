// @ts-ignore Bun's built-in runner needs no extra package.
import { expect, test } from 'bun:test';
import { getSearchDestination } from '../src/lib/navigation';

test('search game opens a visible game screen with the matching curriculum', () => {
  expect(getSearchDestination({ category: 'math', age: '4-5T', type: 'game', gameData: { ageGroups: ['4-5'] } })).toEqual({ view: 'cognitive', age: '4-5', section: 'games' });
  expect(getSearchDestination({ category: 'social', age: '3-4T', type: 'game', gameData: { ageGroups: ['3-4'] } })).toEqual({ view: 'social', age: '3-4', section: 'games' });
});
test('search lessons preserve age and category for previous/next and rewards', () => {
  expect(getSearchDestination({ category: 'language', age: '5 - 6 Tuổi', type: 'lesson' })).toEqual({ view: 'language', age: '5-6', section: 'lessons' });
  expect(getSearchDestination({ category: 'physical', age: 'Nhà trẻ', type: 'lesson' })).toEqual({ view: 'physical', age: 'toddler', section: 'lessons' });
});
