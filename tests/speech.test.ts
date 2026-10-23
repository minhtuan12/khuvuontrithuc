// @ts-nocheck -- Bun runner, with browser speech API mocked explicitly.
import { test, expect } from 'bun:test';
import { readAssistantMessage, stopAssistantSpeech } from '../src/lib/assistantSpeech';

test.serial('only an explicit listen request speaks, selects Vietnamese and resolves when finished', async () => {
  const previous = globalThis.window;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const spoken = [];
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.window = { speechSynthesis: { cancel() {}, resume() {}, getVoices: () => [{ lang: 'vi-VN', name: 'Microsoft HoaiMy Online' }], speak(utterance) { spoken.push(utterance); queueMicrotask(() => utterance.onend()); } } };
  try {
    await readAssistantMessage('Xin chào');
    expect(spoken).toHaveLength(0);
    await readAssistantMessage('Xin chào', true);
    expect(spoken[0].text).toBe('Xin chào');
    expect(spoken[0].lang).toBe('vi-VN');
    expect(spoken[0].voice.name).toBe('Microsoft HoaiMy Online');
    stopAssistantSpeech();
  } finally { globalThis.window = previous; globalThis.SpeechSynthesisUtterance = previousUtterance; }
});

test.serial('Vietnamese narration refuses foreign or male fallback voices', async () => {
  const previous = globalThis.window;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const spoken = [];
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.window = { speechSynthesis: { cancel() {}, resume() {}, getVoices: () => [
    { lang: 'en-US', name: 'Microsoft David' },
    { lang: 'vi-VN', name: 'Microsoft NamMinh Online' },
  ], speak(utterance) { spoken.push(utterance); } } };
  try {
    await expect(readAssistantMessage('Xin chào', true)).rejects.toThrow('giọng nữ tiếng Việt');
    expect(spoken).toHaveLength(0);
  } finally { globalThis.window = previous; globalThis.SpeechSynthesisUtterance = previousUtterance; }
});

test.serial('waits for the browser to finish loading its Vietnamese voices', async () => {
  const previous = globalThis.window;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const spoken = [];
  let voices = [];
  let onVoicesChanged;
  globalThis.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
  globalThis.window = { speechSynthesis: {
    cancel() {}, resume() {}, getVoices: () => voices,
    addEventListener(_name, listener) { onVoicesChanged = listener; },
    removeEventListener() {},
    speak(utterance) { spoken.push(utterance); queueMicrotask(() => utterance.onend()); },
  } };
  try {
    const reading = readAssistantMessage('Xin chào', true);
    voices = [{ lang: 'vi-VN', name: 'Microsoft HoaiMy Online' }];
    onVoicesChanged();
    await reading;
    expect(spoken[0].voice.name).toBe('Microsoft HoaiMy Online');
  } finally { globalThis.window = previous; globalThis.SpeechSynthesisUtterance = previousUtterance; }
});

test.serial('prefers the dedicated Vietnamese Female voice when available', async () => {
  const previous = globalThis.window;
  const calls = [];
  globalThis.window = {
    responsiveVoice: {
      cancel() {},
      speak(text, voice, options) {
        calls.push({ text, voice });
        queueMicrotask(() => options.onend());
      },
    },
  };
  try {
    await readAssistantMessage('Xin chào bé', true);
    expect(calls).toEqual([{ text: 'Xin chào bé', voice: 'Vietnamese Female' }]);
  } finally { globalThis.window = previous; }
});

test.serial('unsupported speech rejects an explicit request instead of pretending to play', async () => {
  const previous = globalThis.window;
  globalThis.window = {};
  try { await expect(readAssistantMessage('Xin chào', true)).rejects.toThrow('đọc'); }
  finally { globalThis.window = previous; }
});
