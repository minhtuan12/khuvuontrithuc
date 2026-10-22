// @ts-nocheck -- Run with Bun's built-in test runner.
import { expect, test } from 'bun:test';
import { createEnglishGameCompletionGuard, createEnglishPracticeLifetime, ungradedEnglishSpeechEvaluation } from '../src/components/EnglishModule';

test('finishing one game twice rewards once, while a new completed run can reward again', () => {
  const guard = createEnglishGameCompletionGuard();
  let rewards = 0;
  guard.finish(() => { rewards++; });
  guard.finish(() => { rewards++; });
  expect(rewards).toBe(1);
  guard.reset();
  guard.finish(() => { rewards++; });
  expect(rewards).toBe(2);
});

test('synchronous answer gate accepts one rapid answer until the next question resets it', () => {
  const answerGate = createEnglishGameCompletionGuard();
  let score = 0;
  const answer = () => answerGate.finish(() => { score++; });
  expect(answer()).toBe(true);
  expect(answer()).toBe(false);
  expect(answer()).toBe(false);
  expect(score).toBe(1);
  answerGate.reset();
  expect(answer()).toBe(true);
  expect(score).toBe(2);
});

test('unavailable speech recognition does not invent a score or earned stars', () => {
  const feedback = ungradedEnglishSpeechEvaluation();
  expect(feedback.score).toBeNull();
  expect(feedback.stars).toBe(0);
  expect(feedback.isSuper).toBe(false);
  expect(feedback.feedback).toContain('thử lại');
});

test('closing practice stops owned microphone tracks and cancels pending feedback', async () => {
  const lifetime = createEnglishPracticeLifetime();
  let stopped = false;
  let feedbackShown = false;
  lifetime.ownStream({ getTracks: () => [{ stop: () => { stopped = true; } }] });
  lifetime.schedule(() => { feedbackShown = true; }, 1);
  lifetime.dispose();
  await new Promise(resolve => setTimeout(resolve, 10));
  expect(stopped).toBe(true);
  expect(feedbackShown).toBe(false);
});

test('microphone permission resolving after practice closes immediately releases the stream', () => {
  const lifetime = createEnglishPracticeLifetime();
  lifetime.dispose();
  let stopped = false;
  const accepted = lifetime.ownStream({ getTracks: () => [{ stop: () => { stopped = true; } }] });
  expect(accepted).toBe(false);
  expect(stopped).toBe(true);
});
