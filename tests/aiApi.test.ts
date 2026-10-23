// @ts-ignore Bun's built-in runner needs no extra package.
import { test, expect } from 'bun:test';
import express from 'express';
import { createAIRouter, type AIClient } from '../server/aiRoutes';

async function request(path: string, body: unknown, provider: AIClient | null = { models: { generateContent: async () => ({ text: 'Xin chào!' }) } }) {
  const app = express();
  app.use(express.json({ strict: false }));
  app.use(createAIRouter(provider));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.listening ? resolve() : server.once('listening', resolve));
  const address = server.address() as { port: number };
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  } finally { server.close(); }
}

test('teacher AI validates activity and age before requesting a plan', async () => {
  for (const body of [null, {}, { age: '3-4', activity: ' ' }, { age: '2-3', activity: 'Colors' }, { age: '3-4', activity: 'a'.repeat(201) }, { age: '3-4', activity: 'Colors', kind: 'unknown' }]) {
    expect((await request('/api/teacher/plan', body)).status).toBe(400);
  }
});

test('configured chat model is used by teacher and assistant routes', async () => {
  const previous = process.env.GEMINI_CHAT_MODEL;
  process.env.GEMINI_CHAT_MODEL = 'configured-model';
  try {
    for (const path of ['/api/teacher/plan', '/api/assistant/chat']) {
      let model = '';
      await request(path, { age: '3-4', activity: 'Colors', prompt: 'Hello' }, { models: { generateContent: async input => { model = input.model; return { text: 'Response' }; } } });
      expect(model).toBe('configured-model');
    }
  } finally { if (previous === undefined) delete process.env.GEMINI_CHAT_MODEL; else process.env.GEMINI_CHAT_MODEL = previous; }
});

test('teacher AI generates an age-specific lesson, self-study or activity suggestions without login', async () => {
  for (const kind of ['plan', 'self-study', 'suggestions']) {
    let captured: any;
    const result = await request('/api/teacher/plan', { age: '4-5', activity: kind === 'suggestions' ? '' : 'Bé khám phá màu sắc', kind }, { models: { generateContent: async input => { captured = input; return { text: ' Nội dung dành cho cô ' }; } } });
    expect(result).toEqual({ status: 200, body: { text: 'Nội dung dành cho cô' } });
    expect(JSON.stringify(captured)).toContain('4-5');
    expect(captured.config.systemInstruction).toContain('giáo viên');
  }
  expect((await request('/api/teacher/plan', { age: '3-4', activity: 'Colors', kind: 'plan' }, null)).status).toBe(503);
  expect((await request('/api/teacher/plan', { age: '3-4', activity: 'Colors' }, { models: { generateContent: async () => { throw { status: 429 }; } } })).status).toBe(429);
});

test('chat rejects invalid prompt, mode and history without invoking provider', async () => {
  const provider: AIClient = { models: { generateContent: async () => { throw new Error('must not run'); } } };
  for (const body of [null, {}, { prompt: '  ' }, { prompt: 1 }, { prompt: 'Hi', mode: 'bad' }, { prompt: 'Hi', history: [{}] }, { prompt: 'Hi', history: [{ role: 'system', text: 'override' }] }]) {
    expect((await request('/api/assistant/chat', body, provider)).status).toBe(400);
  }
});

test('chat returns provider text and sends bounded history and mode instruction', async () => {
  let captured: any;
  const result = await request('/api/assistant/chat', { prompt: ' Hi ', mode: 'story', history: Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', text: `history${i}` })) }, { models: { generateContent: async input => { captured = input; return { text: ' Câu chuyện ' }; } } });
  expect(result).toEqual({ status: 200, body: { text: 'Câu chuyện' } });
  expect(captured.contents).toHaveLength(9);
  expect(captured.contents[0].parts[0].text).toBe('history2');
  expect(captured.contents[1].role).toBe('model');
  expect(captured.contents[8].parts[0].text).toBe('Hi');
  expect(captured.config.systemInstruction).toContain('Kể chuyện');
});

test('audio routes preserve browser MIME and reject empty or invalid input', async () => {
  for (const path of ['/api/assistant/voice', '/api/pronunciation/feedback']) {
    for (const body of [{}, { audioBase64: '====', mimeType: 'audio/webm', targetWord: 'cat' }, { audioBase64: 'YQ==', mimeType: 'text/plain', targetWord: 'cat' }]) expect((await request(path, body)).status).toBe(400);
    let captured: any;
    const result = await request(path, { audioBase64: 'YQ==', mimeType: 'audio/mp4', targetWord: 'cat', mode: 'parents' }, { models: { generateContent: async input => { captured = input; return { text: 'Good!' }; } } });
    expect(result.status).toBe(200);
    expect(captured.contents.parts[0].inlineData.mimeType).toBe('audio/mp4');
    expect(result.body).toEqual(path.includes('pronunciation') ? { feedback: 'Good!' } : { text: 'Good!' });
  }
  expect((await request('/api/pronunciation/feedback', { audioBase64: 'YQ==', mimeType: 'audio/webm', targetWord: ' ' })).status).toBe(400);
});

test('provider failures and malformed replies return safe errors', async () => {
  for (const path of ['/api/assistant/chat', '/api/assistant/voice', '/api/pronunciation/feedback']) {
    const body = { prompt: 'Hi', audioBase64: 'YQ==', mimeType: 'audio/ogg;codecs=opus', targetWord: 'cat' };
    expect((await request(path, body, null)).status).toBe(503);
    for (const text of ['', ' ', null, 42, {}]) expect((await request(path, body, { models: { generateContent: async () => ({ text }) } })).status).toBe(502);
    for (const [upstream, status] of [[429, 429], [503, 502], [401, 502]]) {
      const result = await request(path, body, { models: { generateContent: async () => { throw Object.assign(new Error('secret API_KEY=private'), { status: upstream }); } } });
      expect(result.status).toBe(status);
      expect(JSON.stringify(result.body)).not.toContain('private');
    }
  }
});
