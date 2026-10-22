// @ts-ignore Bun's built-in runner needs no extra package.
import { expect, test } from 'bun:test';
import { MATH_GAMES_DATA } from '../src/constants/mathData';
import { ENGLISH_AGES, ENGLISH_LESSONS_BY_AGE, findEnglishLesson, getEnglishRoadmap } from '../src/lib/englishCatalog';

test('every English lesson can be found, grouped and completed with a valid answer', () => {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const age of ENGLISH_AGES) {
    const lessons = ENGLISH_LESSONS_BY_AGE[age.id];
    expect(getEnglishRoadmap(age.id).flatMap(group => group.lessons)).toHaveLength(lessons.length);
    for (const lesson of lessons) {
      if (ids.has(lesson.id)) errors.push(`Duplicate lesson ${lesson.id}`);
      ids.add(lesson.id);
      if (findEnglishLesson(lesson.id)?.age !== age.id) errors.push(`Wrong age ${lesson.id}`);
      if (!lesson.vocabulary.length || !lesson.interactiveGame.questions.length) errors.push(`Empty lesson ${lesson.id}`);
      for (const question of lesson.interactiveGame.questions) {
        if (!question.options.some(option => option.id === question.correctId)) errors.push(`Missing answer ${lesson.id}/${question.id}`);
      }
    }
  }
  expect(errors).toEqual([]);
});

test('all interactive activities have either a playable question set or an external destination', () => {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const game of MATH_GAMES_DATA) {
    if (ids.has(game.id)) errors.push(`Duplicate game ${game.id}`);
    ids.add(game.id);
    if (!game.externalLink && !game.questions.length) errors.push(`Unplayable ${game.id}`);
    if (game.externalLink && !/^https:\/\//.test(game.externalLink)) errors.push(`Invalid link ${game.id}`);
    for (const question of game.questions) {
      if (!question.options.some(option => option.id === question.correctId)) errors.push(`Missing answer ${game.id}/${question.id}`);
      if (new Set(question.options.map(option => option.id)).size !== question.options.length) errors.push(`Duplicate answer ${game.id}/${question.id}`);
    }
  }
  expect(errors).toEqual([]);
});
