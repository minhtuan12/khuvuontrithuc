// @ts-ignore Bun provides its own test runner.
import { afterAll, beforeAll, expect, test } from 'bun:test';
import express from 'express';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createDeviceRouter, DeviceStore } from '../server/deviceRoutes';

const store = new DeviceStore(':memory:');
const app = express();
app.use(express.json());
app.use(createDeviceRouter(store));
let server: ReturnType<typeof app.listen>;
let base = '';
let cookie = '';
beforeAll(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => { server.close(); store.close(); });
async function request(path: string, options: RequestInit = {}, ownCookie = cookie) {
  const response = await fetch(base + path, { ...options, headers: { ...(ownCookie ? { Cookie: ownCookie } : {}), ...options.headers } });
  if (!ownCookie && response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie')!.split(';')[0];
  return response;
}
test('write then read persists a document and scopes it to the requesting device', async () => {
  const initial = await request('/api/device/documents/stars');
  expect(await initial.json()).toEqual({ value: null, version: 0 });
  expect(initial.headers.get('set-cookie')).toContain('HttpOnly');
  const saved = await request('/api/device/documents/stars', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: 7, baseVersion: 0 }) });
  expect(await saved.json()).toEqual({ value: 7, version: 1 });
  expect(await (await request('/api/device/documents/stars')).json()).toEqual({ value: 7, version: 1 });
  const another = await fetch(base + '/api/device/documents/stars');
  expect(await another.json()).toEqual({ value: null, version: 0 });
});
test('stale writes fail without overwriting a newer value', async () => {
  const response = await request('/api/device/documents/stars', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: 2, baseVersion: 0 }) });
  expect(response.status).toBe(409);
  const data = await response.json();
  expect(data.value).toBe(7);
  expect(data.version).toBe(1);
});

test('garden game summaries persist by owner and reject invalid progress', async () => {
  const path='/api/device/documents/english-garden-progress';
  const value={'match:all:3-4':{runs:1,words:3,bestAccuracy:100,lastPlayed:'2026-10-23T08:00:00.000Z'}};
  const save=(data:unknown,baseVersion:number)=>request(path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({value:data,baseVersion})});
  expect((await save(value,0)).status).toBe(200);
  expect((await (await request(path)).json()).value).toEqual(value);
  expect((await (await fetch(base+path)).json()).version).toBe(0);
  expect((await save(value,0)).status).toBe(409);
  expect((await save({'match:all:3-4':{...value['match:all:3-4'],bestAccuracy:101}},1)).status).toBe(400);
});

test('teacher preparation schema validates age and content size without an email field', async () => {
  const {validators} = await import('../server/deviceValidation');
  const value = { age: '4-5', activity: 'Bé khám phá màu sắc', plan: 'Giáo án', selfStudy: 'Từ vựng' };
  expect(validators['teacher-preparation']({...value,age:'0-1'})).toBe(false);
  expect(validators['teacher-preparation']({...value,plan:'a'.repeat(30001)})).toBe(false);
  expect(validators['teacher-preparation'](value)).toBe(true);
  expect((await request('/api/device/documents/teacher-preparation')).status).toBe(401);
});
test('invalid document data, unknown keys and cross-origin writes are rejected', async () => {
  for (const value of [-1, '99', null]) {
    expect((await request('/api/device/documents/stars', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value, baseVersion: 1 }) })).status).toBe(400);
  }
  expect((await request('/api/device/documents/passwords')).status).toBe(404);
  expect((await request('/api/device/documents/stars', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' }, body: JSON.stringify({ value: 8, baseVersion: 1 }) })).status).toBe(403);
});
test('uploaded image survives listing and download, and is not readable by another device', async () => {
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aVRsAAAAASUVORK5CYII=', 'base64');
  const response = await request('/api/device/uploads', { method: 'POST', headers: { 'Content-Type': 'image/png', 'X-File-Name': encodeURIComponent('hoa.png') }, body: image });
  expect(response.status).toBe(201);
  const uploaded = await response.json();
  expect(uploaded.name).toBe('hoa.png');
  expect(uploaded.url).toStartWith('/api/device/uploads/');
  expect(await (await request(uploaded.url)).arrayBuffer()).toEqual(image.buffer.slice(image.byteOffset, image.byteOffset + image.byteLength));
  expect((await (await request('/api/device/uploads')).json()).length).toBe(1);
  expect((await fetch(base + uploaded.url)).status).toBe(404);
  expect((await request('/api/device/uploads', { method: 'POST', headers: { 'Content-Type': 'image/svg+xml', 'X-File-Name': 'bad.svg' }, body: '<svg></svg>' })).status).toBe(400);
});
test('documents persist after closing and reopening the server database', () => {
  mkdirSync('.tmp', { recursive: true });
  const filename = `.tmp/device-persistence-${randomUUID()}.sqlite`;
  const first = new DeviceStore(filename);
  const identity = first.device().id;
  first.write(identity, 'stars', 9, 0);
  first.close();
  const reopened = new DeviceStore(filename);
  expect(reopened.device(identity).created).toBe(false);
  expect(reopened.read(identity, 'stars')).toEqual({ value: 9, version: 1 });
  reopened.close();
});
