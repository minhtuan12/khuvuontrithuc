import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:5174/';
const results = [];
for (const [name, body, status] of [
  ['empty audio is rejected', { audioBase64: '', mimeType: 'audio/webm' }, 400],
  ['unsupported recording type is rejected', { audioBase64: 'AAAA', mimeType: 'text/html' }, 400],
  ['missing AI configuration returns a recoverable service status', { audioBase64: 'AAAA', mimeType: 'audio/webm' }, 503],
]) {
  const response = await fetch(new URL('/api/assistant/voice', base), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (response.status !== status) throw new Error(`${name}: expected ${status}, received ${response.status}. Run this suite against an isolated server without an AI key.`);
  results.push(name);
  console.log('PASS', name);
}
const catalog = await fetch(new URL('/api/english/catalog', base)).then(response => response.json());
if (catalog.ages?.length !== 3 || !catalog.lessonsByAge) throw new Error('Catalog contract failed');
results.push('catalog exposes all three curricula');
const missing = await fetch(new URL('/api/english/lesson/no-such-lesson', base));
if (missing.status !== 404) throw new Error('Unknown lesson must return404');
results.push('unknown lesson returns404');
await mkdir('docs/verification', { recursive: true });
await writeFile('docs/verification/service-results.json', JSON.stringify({ results }, null, 2));
console.log('PASS catalog and missing lesson response');
