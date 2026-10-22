// @ts-ignore Bun provides its own test runner.
import {expect,test} from 'bun:test';
import {DeviceDocument} from '../src/lib/deviceData';
const tick=()=>new Promise(r=>setTimeout(r,0));
function cache(){const data=new Map<string,string>();return {getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v)}};}
test('hydrates before migration and preserves pending edits with serialized CAS writes',async()=>{
 let release!:(r:Response)=>void;const writes:any[]=[];
 const fetcher=async (_url:any,init?:RequestInit)=>{if(!init?.method)return new Promise<Response>(r=>release=r);const body=JSON.parse(init.body as string);writes.push(body);return Response.json({value:body.value,version:writes.length});};
 const doc=new DeviceDocument('stars',()=>1,{fetch:fetcher as typeof fetch,storage:cache()});
 const pending=doc.start();doc.set(v=>v+1);expect(writes).toEqual([]);release(Response.json({value:null,version:0}));await pending;await tick();
 expect(doc.snapshot().value).toBe(2);expect(writes).toEqual([{value:2,baseVersion:0}]);
});
test('migrates missing document and retains cached unsaved edits after failure',async()=>{
 const storage=cache();let fail=true;
 const fetcher=async (_url:any,init?:RequestInit)=>{if(!init?.method)return Response.json({value:null,version:0});if(fail)throw Error('offline');return Response.json({value:5,version:1});};
 const doc=new DeviceDocument('stars',()=>5,{fetch:fetcher as typeof fetch,storage});await doc.start();await tick();expect(doc.snapshot().error).toBeTruthy();expect(doc.snapshot().value).toBe(5);expect(storage.getItem('kvtt.device-cache.v1.stars')).toContain('5');fail=false;await doc.retry();await tick();expect(doc.snapshot().error).toBe('');
});
test('conflict keeps draft and blocks automatic overwrite',async()=>{
 let writes=0;const doc=new DeviceDocument('stars',()=>1,{storage:cache(),fetch:(async (_u:any,i?:RequestInit)=>{if(!i?.method)return Response.json({value:2,version:1});writes++;return Response.json({error:'conflict',value:3,version:2},{status:409});}) as typeof fetch});await doc.start();doc.set(4);await tick();await doc.retry();expect(writes).toBe(1);expect(doc.snapshot().value).toBe(4);expect(doc.snapshot().error).toBeTruthy();
});

test('coalesces edits while a write is pending and uses returned CAS version',async()=>{
 let release!:(r:Response)=>void;const writes:any[]=[];
 const doc=new DeviceDocument('stars',()=>0,{storage:cache(),fetch:(async(_u:any,i?:RequestInit)=>{if(!i?.method)return Response.json({value:1,version:2});const body=JSON.parse(i.body as string);writes.push(body);if(writes.length===1)return new Promise<Response>(r=>release=r);return Response.json({value:body.value,version:4});}) as typeof fetch});
 await doc.start();doc.set(2);doc.set(v=>v+1);doc.set(v=>v+1);expect(writes.length).toBe(1);release(Response.json({value:2,version:3}));await tick();expect(writes).toEqual([{value:2,baseVersion:2},{value:4,baseVersion:3}]);expect(doc.snapshot().saving).toBe(false);
});
test('a disposed hydration response cannot replace the local draft or send migration',async()=>{
 let release!:(r:Response)=>void;let writes=0;const doc=new DeviceDocument('stars',()=>7,{fetch:(async(_u:any,i?:RequestInit)=>{if(i?.method){writes++;return Response.json({value:7,version:1});}return new Promise<Response>(r=>release=r);}) as typeof fetch});const started=doc.start();doc.dispose();release(Response.json({value:20,version:3}));await started;expect(doc.snapshot().value).toBe(7);expect(writes).toBe(0);
});
test('offline startup keeps cache and does not PUT without a server version',async()=>{
 const storage=cache();storage.setItem('kvtt.device-cache.v1.stars',JSON.stringify({value:8,version:3,dirty:true}));let writes=0;
 const doc=new DeviceDocument('stars',()=>0,{storage,fetch:(async(_u:any,i?:RequestInit)=>{if(i?.method)writes++;throw Error('offline');}) as typeof fetch});await doc.start();doc.set(9);await tick();expect(doc.snapshot().value).toBe(9);expect(doc.snapshot().error).toBeTruthy();expect(writes).toBe(0);
});

test('editing a stale offline draft during hydration still reports conflict',async()=>{
 const storage=cache();storage.setItem('kvtt.device-cache.v1.stars',JSON.stringify({value:8,version:3,dirty:true}));let release!:(r:Response)=>void;let writes=0;
 const doc=new DeviceDocument('stars',()=>0,{storage,fetch:(async(_u:any,i?:RequestInit)=>{if(i?.method){writes++;return Response.json({value:9,version:5});}return new Promise<Response>(r=>release=r);}) as typeof fetch});const starting=doc.start();doc.set(9);release(Response.json({value:20,version:4}));await starting;expect(writes).toBe(0);expect(doc.snapshot().value).toBe(9);expect(doc.snapshot().error).toBeTruthy();
});
test('parallel first-visit session bootstrap shares exactly one request',async()=>{
 const {ensureDeviceSession}=await import('../src/lib/deviceData');let calls=0;let release!:(r:Response)=>void;
 const fetcher=(async()=>{calls++;return new Promise<Response>(r=>release=r);}) as typeof fetch;
 const pending=Array.from({length:10},()=>ensureDeviceSession(fetcher));expect(calls).toBe(1);release(Response.json({ready:true}));await Promise.all(pending);expect(calls).toBe(1);
});
test('explicit remote restore backs up local draft and never writes',async()=>{
 const storage=cache();let writes=0;let value=2;const doc=new DeviceDocument('stars',()=>1,{storage,fetch:(async(_u:any,i?:RequestInit)=>{if(i?.method){writes++;return Response.json({error:'conflict'},{status:409});}return Response.json({value,version:2});}) as typeof fetch});await doc.start();doc.set(8);await tick();value=4;await doc.restoreRemote();expect(doc.snapshot().value).toBe(4);expect(doc.snapshot().error).toBe('');expect(writes).toBe(1);expect(storage.getItem('kvtt.device-cache.v1.stars.draft-backup')).toContain('8');
});
test('an edit during the first GET cannot overwrite an existing server document',async()=>{
 let release!:(r:Response)=>void;let writes=0;
 const doc=new DeviceDocument('stars',()=>0,{storage:cache(),fetch:(async(_u:any,i?:RequestInit)=>{if(i?.method){writes++;return Response.json({value:1,version:6});}return new Promise<Response>(r=>release=r);}) as typeof fetch});
 const started=doc.start();doc.set(1);release(Response.json({value:20,version:5}));await started;expect(writes).toBe(0);expect(doc.snapshot().value).toBe(1);expect(doc.snapshot().error).toBeTruthy();
});

