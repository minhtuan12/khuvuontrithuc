// @ts-ignore Bun provides its own test runner.
import {afterEach, expect, test} from 'bun:test';
import {getLearnerScope, setLearnerScope, getLearnerStorage, learnerStorage} from '../src/lib/learnerStorage';
import {beginAccountTransition, endAccountTransition, deviceFetch, DeviceDocument, ensureDeviceSession} from '../src/lib/deviceData';
import {getGuestEnglishProgress, recordEnglishProgress, resetEnglishProgressForAccountChange, syncEnglishProgress} from '../src/lib/englishSync';
import {ENGLISH_LESSONS_BY_AGE} from '../src/lib/englishCatalog';

const originalFetch=globalThis.fetch;
const originalStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
afterEach(()=>{globalThis.fetch=originalFetch;setLearnerScope('guest');beginAccountTransition();endAccountTransition();if(originalStorage)Object.defineProperty(globalThis,'localStorage',originalStorage);else Reflect.deleteProperty(globalThis,'localStorage');});
function storage(){const data=new Map<string,string>();const store:Storage={get length(){return data.size},key:i=>Array.from(data.keys())[i]??null,getItem:k=>data.get(k)??null,setItem:(k,v)=>{data.set(k,String(v))},removeItem:k=>{data.delete(k)},clear:()=>data.clear()};Object.defineProperty(globalThis,'localStorage',{configurable:true,value:store});return store;}
const tick=()=>new Promise(r=>setTimeout(r,0));

test('guest legacy keys and account caches stay isolated, including captured writes and clear',()=>{
 const raw=storage();expect(getLearnerScope()).toBe('guest');learnerStorage.setItem('stars','guest');const guest=getLearnerStorage();
 setLearnerScope('account-a');const a=getLearnerStorage();a.setItem('stars','a');a.setItem('settings','a-settings');
 setLearnerScope('account-b');learnerStorage.setItem('stars','b');a.setItem('late','a-late');guest.setItem('late','guest-late');
 expect(learnerStorage.getItem('late')).toBeNull();expect(a.getItem('late')).toBe('a-late');expect(guest.getItem('stars')).toBe('guest');expect(guest.length).toBe(2);expect(raw.getItem('stars')).toBe('guest');expect(a.length).toBe(3);expect(a.key(0)).toBe('stars');
 a.clear();expect(a.length).toBe(0);expect(learnerStorage.getItem('stars')).toBe('b');expect(guest.getItem('late')).toBe('guest-late');guest.clear();expect(learnerStorage.getItem('stars')).toBe('b');
});

for(const method of ['GET','PUT'])test(`late ${method} response is rejected after scope switch`,async()=>{
 let release!:(r:Response)=>void;let signal:AbortSignal|undefined;
 globalThis.fetch=(async(url,init)=>{if(url==='/api/device/session')return Response.json({ready:true});signal=init?.signal??undefined;return new Promise<Response>(r=>release=r);}) as typeof fetch;
 const pending=deviceFetch('/api/device/documents/stars',{method});const rejected=pending.then(()=>null,error=>error);await tick();beginAccountTransition();setLearnerScope('account-a');endAccountTransition();expect(signal?.aborted).toBe(true);release(Response.json({value:1,version:1}));expect(await rejected).toBeInstanceOf(Error);
});

test('pending bootstrap never dispatches an old write after identity changes',async()=>{
 let release!:(r:Response)=>void;let writes=0;let bootstraps=0;
 globalThis.fetch=(async(url)=>{if(url==='/api/device/session'){bootstraps++;if(bootstraps===1)return new Promise<Response>(r=>release=r);return Response.json({ready:true});}writes++;return Response.json({version:1});}) as typeof fetch;
 const pending=deviceFetch('/api/device/documents/stars',{method:'PUT'});const rejected=pending.then(()=>null,error=>error);beginAccountTransition();setLearnerScope('account-a');endAccountTransition();release(Response.json({ready:true}));expect(await rejected).toBeInstanceOf(Error);expect(writes).toBe(0);await deviceFetch('/api/device/documents/stars');expect(bootstraps).toBe(2);expect(writes).toBe(1);
});

test('transition gate blocks new requests synchronously and failed transition can reopen same scope',async()=>{
 let calls=0;globalThis.fetch=(async()=>{calls++;return Response.json({ready:true});}) as typeof fetch;
 beginAccountTransition();await expect(deviceFetch('/api/device/documents/stars')).rejects.toThrow();expect(calls).toBe(0);endAccountTransition();await deviceFetch('/api/device/documents/stars');expect(calls).toBe(2);
});

test('request carries captured account identity and preserves caller headers',async()=>{
 setLearnerScope('account-a');let headers!:Headers;
 globalThis.fetch=(async(url,init)=>{if(url==='/api/device/session')return Response.json({ready:true});headers=new Headers(init?.headers);return Response.json({version:1});}) as typeof fetch;
 await deviceFetch('/api/device/documents/stars',{headers:{'Content-Type':'application/json','X-KVTT-Account':'wrong'}});
 expect(headers.get('X-KVTT-Account')).toBe('account-a');expect(headers.get('Content-Type')).toBe('application/json');
});

test('ACCOUNT_CHANGED response refreshes identity and cannot become a document CAS conflict',async()=>{
 const originalWindow=Object.getOwnPropertyDescriptor(globalThis,'window');const events=new EventTarget();let expired=0;events.addEventListener('kvtt-account-expired',()=>expired++);
 Object.defineProperty(globalThis,'window',{configurable:true,value:events});
 try{
  globalThis.fetch=(async(url)=>url==='/api/device/session'?Response.json({ready:true}):Response.json({code:'ACCOUNT_CHANGED'},{status:409})) as typeof fetch;
  await expect(deviceFetch('/api/device/documents/stars',{method:'PUT'})).rejects.toThrow('Learning account changed');expect(expired).toBe(1);
  globalThis.fetch=(async(url)=>url==='/api/device/session'?Response.json({ready:true}):Response.json({error:'expired'},{status:401})) as typeof fetch;
  expect((await deviceFetch('/api/device/documents/stars')).status).toBe(401);expect(expired).toBe(2);
 }finally{if(originalWindow)Object.defineProperty(globalThis,'window',originalWindow);else Reflect.deleteProperty(globalThis,'window');}
});

test('disposed document never runs stale updater side effects',()=>{
 let updates=0;const doc=new DeviceDocument('stars',()=>1);doc.dispose();doc.set(previous=>{updates++;return previous+1;});expect(updates).toBe(0);expect(doc.snapshot().value).toBe(1);
});

test('bootstrap pins expected identity and refreshes on ACCOUNT_CHANGED',async()=>{
 const originalWindow=Object.getOwnPropertyDescriptor(globalThis,'window');const events=new EventTarget();let expired=0;events.addEventListener('kvtt-account-expired',()=>expired++);Object.defineProperty(globalThis,'window',{configurable:true,value:events});
 try{
  setLearnerScope('account-a');let header:string|null=null;
  const fetcher=(async(_url,init)=>{header=new Headers(init?.headers).get('X-KVTT-Account');return Response.json({code:'ACCOUNT_CHANGED'},{status:409});}) as typeof fetch;
  await expect(ensureDeviceSession(fetcher)).rejects.toThrow('Learning account changed');expect(header).toBe('account-a');expect(expired).toBe(1);
 }finally{if(originalWindow)Object.defineProperty(globalThis,'window',originalWindow);else Reflect.deleteProperty(globalThis,'window');}
});

test('English progress keeps syncing and retains in-memory completion when browser storage is blocked',async()=>{
 const originalWindow=Object.getOwnPropertyDescriptor(globalThis,'window');Object.defineProperty(globalThis,'window',{configurable:true,value:new EventTarget()});
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new DOMException('blocked','SecurityError');}});
 resetEnglishProgressForAccountChange();const id=ENGLISH_LESSONS_BY_AGE['3-4'][0].id;const writes:any[]=[];let version=0;
 globalThis.fetch=(async(url,init)=>{if(url==='/api/device/session')return Response.json({ready:true});if(init?.method==='PUT'){const body=JSON.parse(init.body as string);writes.push(body);return Response.json({version:++version});}return Response.json({value:null,version:0});}) as typeof fetch;
 try{
  await recordEnglishProgress(id,true);const completed=getGuestEnglishProgress()[id]?.completedAt;expect(completed).toBeTruthy();expect(writes.length).toBe(1);expect(writes[0].value[id].completedAt).toBe(completed);
  await recordEnglishProgress(id,false);expect(getGuestEnglishProgress()[id].completedAt).toBe(completed);expect((await syncEnglishProgress())[id].completedAt).toBe(completed);
  setLearnerScope('account-b');expect(getGuestEnglishProgress()).toEqual({});expect(await syncEnglishProgress()).toEqual({});
 }finally{resetEnglishProgressForAccountChange();if(originalWindow)Object.defineProperty(globalThis,'window',originalWindow);else Reflect.deleteProperty(globalThis,'window');}
});
