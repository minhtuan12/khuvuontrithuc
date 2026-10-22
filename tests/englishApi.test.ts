// @ts-nocheck -- Bun HTTP contract regressions.
import { afterEach, expect, test } from 'bun:test';
import { ENGLISH_LESSONS_BY_AGE } from '../src/lib/englishCatalog';
const originalFetch = globalThis.fetch;
const originalStorage = globalThis.localStorage;
const originalWindow = globalThis.window;
const originalUrl = process.env.VITE_SUPABASE_URL;
const originalKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
process.env.VITE_SUPABASE_URL = 'https://english-contract.invalid';
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = 'contract-key';
const api = await import('../src/lib/englishSync.ts?http-contract');
if(originalUrl === undefined) delete process.env.VITE_SUPABASE_URL; else process.env.VITE_SUPABASE_URL=originalUrl;
if(originalKey === undefined) delete process.env.VITE_SUPABASE_PUBLISHABLE_KEY; else process.env.VITE_SUPABASE_PUBLISHABLE_KEY=originalKey;
const values = new Map();
function setup() {
  values.clear();
  globalThis.localStorage = { getItem: k => values.get(k) ?? null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) };
  globalThis.window = new EventTarget();
}
function session(id, expired = false) {
  const value = {access_token: `token-${id}`, refresh_token: `refresh-${id}`, expires_at: expired ? 0 : Date.now()/1000+3600, user:{id}};
  values.set('kvtt.supabase.session.v1',JSON.stringify(value));
  return value;
}
function deferred() { let resolve; const promise = new Promise(r => resolve=r); return {promise,resolve}; }
const json = data => Response.json(data);
const lesson = ENGLISH_LESSONS_BY_AGE['3-4'][0];
afterEach(() => {globalThis.fetch=originalFetch; globalThis.localStorage=originalStorage; globalThis.window=originalWindow;});
test('refresh response cannot resurrect a signed out account', async () => {
  setup(); session('A',true);
  const request=deferred(); const started=deferred();
  globalThis.fetch=async url => {if(!url.includes('refresh_token')) return json([]); started.resolve(); return request.promise;};
  const pending=api.syncEnglishProgress(); await started.promise;
  api.signOutEnglish();
  request.resolve(json({...sessionPayload('A'),expires_in:3600}));
  await pending;
  expect(api.getEnglishSession()).toBeNull();
});
function sessionPayload(id) {return {access_token:`new-${id}`,refresh_token:`new-refresh-${id}`,user:{id}};}
test('remote read cannot copy account A progress into account B cache', async () => {
 setup(); session('A'); const request=deferred(); const started=deferred();
 globalThis.fetch=async () => {started.resolve(); return request.promise;};
 const pending=api.syncEnglishProgress(); await started.promise; session('B');
 request.resolve(json([{lesson_id:lesson.id,age_band:'3-4',opened_at:'2026-01-01T00:00:00Z',completed_at:'2026-01-01T00:01:00Z'}]));
 await pending;
 expect(api.getGuestEnglishProgress()).toEqual({});
 expect(values.has('kvtt.english.progress.v1.B')).toBe(false);
});
test('completion made during remote read survives response and sends RPC contract', async () => {
 setup(); session('A'); const request=deferred(); const started=deferred(); const writes=[];
 globalThis.fetch=async (url,init) => { if(url.includes('/rpc/')) {writes.push({url,init}); return json(null);} started.resolve(); return request.promise; };
 const pending=api.syncEnglishProgress(); await started.promise;
 await api.recordEnglishProgress(lesson.id,true);
 request.resolve(json([{lesson_id:lesson.id,age_band:'3-4',opened_at:'2026-01-01T00:00:00Z',completed_at:null}])); await pending;
 expect(api.getGuestEnglishProgress()[lesson.id].completedAt).toBeTruthy();
 expect(writes[0].init.headers.Authorization).toBe('Bearer token-A');
 expect(JSON.parse(writes[0].init.body)).toMatchObject({p_lesson_id:lesson.id,p_age_band:'3-4'});
});
test('concurrent expired-session reads share a refresh request', async () => {
 setup(); session('A',true); let refreshes=0; const response=deferred();
 globalThis.fetch=async url => {if(url.includes('refresh_token')) {refreshes++; return response.promise;} return json([]);};
 const first=api.listTeacherPlans(); const second=api.listTeacherPlans();
 response.resolve(json({...sessionPayload('A'),expires_in:3600}));
 await Promise.all([first,second]); expect(refreshes).toBe(1);
});
test('failed progress upload retains device completion and sync retries the RPC', async () => {
 setup(); session('A'); let fail=true; const writes=[];
 globalThis.fetch=async (url,init) => {
  expect(init.headers.Authorization).toBe('Bearer token-A');
  if(url.includes('/rpc/')) {writes.push(JSON.parse(init.body)); return fail ? jsonError('write unavailable',503) : json(null);}
  return json([]);
 };
 await api.recordEnglishProgress(lesson.id,true);
 const completion=api.getGuestEnglishProgress()[lesson.id].completedAt;
 expect(completion).toBeTruthy(); fail=false;
 await api.syncEnglishProgress();
 expect(writes).toHaveLength(2);
 expect(writes[1].p_completed_at).toBe(completion);
});
function jsonError(message,status) {return Response.json({message},{status});}
test('teacher plan create, read, draft update and approval honor HTTP representation contract', async () => {
 setup(); session('A'); const calls=[]; let row;
 globalThis.fetch=async (url,init) => {
  expect(url).toContain('/rest/v1/teacher_english_plans');
  expect(init.headers.Authorization).toBe('Bearer token-A');
  calls.push({url,init});
  if(init.method) {expect(init.headers.Prefer).toBe('return=representation'); row={id:'plan-A',...JSON.parse(init.body)};}
  return json(row ? [row] : []);
 };
 expect(await api.listTeacherPlans()).toEqual([]);
 const draft=await api.saveTeacherPlan(lesson.id,'Opening words','draft');
 expect(draft.status).toBe('draft');
 const approved=await api.saveTeacherPlan(lesson.id,'Revised opening','approved',draft.id);
 expect(approved.teacher_note).toBe('Revised opening');
 expect((await api.listTeacherPlans())[0].status).toBe('approved');
 expect(calls[1].init.method).toBe('POST');
 expect(calls[2].init.method).toBe('PATCH');
 expect(calls[2].url).toContain('?id=eq.plan-A');
 expect(JSON.parse(calls[2].init.body).age_band).toBe('3-4');
});
test('teacher save reports API denial and empty update instead of false success', async () => {
 setup(); session('A');
 globalThis.fetch=async () => jsonError('Approved teacher plans cannot be changed',400);
 await expect(api.saveTeacherPlan(lesson.id,'note','draft','approved-id')).rejects.toThrow('Approved teacher plans cannot be changed');
 globalThis.fetch=async () => json([]);
 await expect(api.saveTeacherPlan(lesson.id,'note','draft','missing-id')).rejects.toThrow();
});
test('transient refresh failure keeps account available for retry', async () => {
 setup(); session('A',true); globalThis.fetch=async () => jsonError('unavailable',503);
 await expect(api.syncEnglishProgress()).rejects.toThrow();
 expect(api.getEnglishSession()?.user.id).toBe('A');
});
test('guest progress hydrates and writes the device HTTP document without a Supabase token', async () => {
 setup(); const calls=[];
 globalThis.fetch=async (url,init) => {
  if(url === '/api/device/session') return json({ready:true});
  calls.push({url,init});
  expect(url).toBe('/api/device/documents/english-progress');
  if(init.method==='PUT') return json({version:1,value:JSON.parse(init.body).value});
  return json({version:0,value:{}});
 };
 await api.recordEnglishProgress(lesson.id,true);
 for(let i=0;i<10 && !calls.some(c=>c.init.method==='PUT');i++) await new Promise(r=>setTimeout(r,0));
 const write=calls.find(c=>c.init.method==='PUT');
 expect(write).toBeTruthy();
 expect(write.init.headers.Authorization).toBeUndefined();
 expect(JSON.parse(write.init.body)).toMatchObject({baseVersion:0,value:{[lesson.id]:{lessonId:lesson.id,ageBand:'3-4'}}});
 expect(api.getGuestEnglishProgress()[lesson.id].completedAt).toBeTruthy();
});

test('guest conflict can restore a backed up server version and persist a new completion', async () => {
 setup(); let version=1; let remote={}; let conflict=true; const writes=[];
 globalThis.fetch=async (url,init) => {
  if(url==='/api/device/session') return json({ready:true});
  if(init.method==='PUT') {
   const body=JSON.parse(init.body); writes.push(body);
   if(conflict) {version=2; return jsonError('conflict',409);}
   expect(body.baseVersion).toBe(version); remote=body.value; version++; return json({version,value:remote});
  }
  return json({version,value:remote});
 };
 await api.syncEnglishProgress();
 await api.recordEnglishProgress(lesson.id,true);
 expect(api.getEnglishProgressSyncError()).toBeTruthy();
 const draft=api.getGuestEnglishProgress();
 conflict=false;
 await api.restoreGuestEnglishProgress();
 expect(api.getGuestEnglishProgress()).toEqual({});
 const backup=[...values].find(([key])=>key==='kvtt.device-cache.v1.english-progress.draft-backup');
 expect(backup).toBeTruthy(); expect(JSON.parse(backup[1]).value).toEqual(draft);
 await api.recordEnglishProgress(lesson.id,true);
 for(let i=0;i<10&&!remote[lesson.id];i++) await new Promise(r=>setTimeout(r,0));
 expect(remote[lesson.id].completedAt).toBeTruthy();
 expect(writes.at(-1).baseVersion).toBe(2);
});

test('guest migration excludes corrupt legacy entries from the HTTP write', async () => {
 setup(); values.set('kvtt.english.progress.v1.guest',JSON.stringify({bad:null})); const writes=[];
 globalThis.fetch=async (url,init) => {
  if(url==='/api/device/session') return json({ready:true});
  if(init.method==='PUT') {const body=JSON.parse(init.body); writes.push(body.value);return json({version:1,value:body.value});}
  return json({version:0,value:{}});
 };
 await api.syncEnglishProgress();
 expect(writes).toHaveLength(1);
 expect(writes[0].bad).toBeUndefined();
 expect(Object.keys(writes[0])).toEqual([]);
});

test('teacher API rejects malformed list and save representations', async () => {
 setup(); session('A');
 for(const body of [null,{},[null],[{id:'bad'}]]) {
  globalThis.fetch=async()=>json(body);
  await expect(api.listTeacherPlans()).rejects.toThrow();
  await expect(api.saveTeacherPlan(lesson.id,'note','draft')).rejects.toThrow();
 }
});
