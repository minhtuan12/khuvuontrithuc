// @ts-nocheck -- Bun runner, with browser speech API mocked explicitly.
import { test, expect } from 'bun:test';
import { readAssistantMessage, stopAssistantSpeech } from '../src/lib/assistantSpeech';

test('only an explicit listen request speaks, selects Vietnamese and resolves when finished', async () => {
  const previous = globalThis.window;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const spoken = [];
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.window = { speechSynthesis: { cancel() {}, resume() {}, getVoices: () => [{ lang: 'vi-VN', name: 'Vietnamese' }], speak(utterance) { spoken.push(utterance); queueMicrotask(() => utterance.onend()); } } };
  try {
    await readAssistantMessage('Xin chào');
    expect(spoken).toHaveLength(0);
    await readAssistantMessage('Xin chào', true);
    expect(spoken[0].text).toBe('Xin chào');
    expect(spoken[0].lang).toBe('vi-VN');
    expect(spoken[0].voice.name).toBe('Vietnamese');
    stopAssistantSpeech();
  } finally { globalThis.window = previous; globalThis.SpeechSynthesisUtterance = previousUtterance; }
});

test('unsupported speech rejects an explicit request instead of pretending to play', async () => {
  const previous = globalThis.window;
  globalThis.window = {};
  try { await expect(readAssistantMessage('Xin chào', true)).rejects.toThrow('đọc'); }
  finally { globalThis.window = previous; }
});
