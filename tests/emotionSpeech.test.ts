// @ts-nocheck -- Browser speech APIs are mocked for the Bun runner.
import { expect, test } from 'bun:test';
import { readEmotionFeedback } from '../src/lib/emotionSpeech';
import { EMOTIONS } from '../src/lib/wellbeing';

test('each selected emotion explicitly reads its own Vietnamese feedback', async () => {
  const previousWindow = globalThis.window;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const spoken = [];
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.window = { speechSynthesis: { cancel() {}, resume() {}, getVoices: () => [{ lang: 'vi-VN', name: 'Microsoft HoaiMy Online' }], speak(value) { spoken.push(value); queueMicrotask(() => value.onend()); } } };
  try {
    for (const emotion of EMOTIONS) await readEmotionFeedback(emotion.id);
    expect(spoken.map(value => value.text)).toEqual(EMOTIONS.map(value => value.feedback));
    expect(spoken.every(value => value.lang === 'vi-VN')).toBe(true);
  } finally {
    globalThis.window = previousWindow;
    globalThis.SpeechSynthesisUtterance = previousUtterance;
  }
});

test('unavailable speech returns an error that the emotion selection can display', async () => {
  const previous = globalThis.window;
  globalThis.window = {};
  try { await expect(readEmotionFeedback('buon')).rejects.toThrow('đọc'); }
  finally { globalThis.window = previous; }
});
