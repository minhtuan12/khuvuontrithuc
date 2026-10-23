import {getLearnerScope} from './learnerStorage';
let generation=0;
let transitioning=false;
const pendingRequests=new Set<AbortController>();
const sessionRequests=new WeakMap<typeof fetch,{generation:number;scope:string;request:Promise<void>}>();
const staleRequest=()=>new DOMException('Learning account changed','AbortError');
function checkIdentity(expectedGeneration:number,expectedScope:string){
 if(transitioning||generation!==expectedGeneration||getLearnerScope()!==expectedScope)throw staleRequest();
}
export function beginAccountTransition():void{
 transitioning=true;generation++;
 for(const controller of pendingRequests)controller.abort();
 pendingRequests.clear();
}
export function endAccountTransition():void{
 transitioning=false;
 if(typeof window!=='undefined')window.dispatchEvent(new Event('kvtt-account-ready'));
}
function notifyExpired(){if(typeof window!=='undefined')window.dispatchEvent(new Event('kvtt-account-expired'));}
export function ensureDeviceSession(fetcher:typeof fetch=globalThis.fetch):Promise<void>{
 const expectedGeneration=generation;const expectedScope=getLearnerScope();
 if(transitioning)return Promise.reject(staleRequest());
 const existing=sessionRequests.get(fetcher);if(existing?.generation===generation&&existing.scope===expectedScope)return existing.request;
 const controller=new AbortController();pendingRequests.add(controller);
 const request=(async()=>{
  try{
   const response=await fetcher('/api/device/session',{credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:{'X-KVTT-Account':expectedScope}});
   checkIdentity(expectedGeneration,expectedScope);if(response.status===401)notifyExpired();
   if(response.status===409){
    let code:string|undefined;try{code=(await response.clone().json()).code;}catch{}
    checkIdentity(expectedGeneration,expectedScope);
    if(code==='ACCOUNT_CHANGED'){notifyExpired();throw staleRequest();}
   }
   if(!response.ok)throw Error('device session');const body=await response.json();checkIdentity(expectedGeneration,expectedScope);if(body.ready!==true)throw Error('device session');
  }finally{pendingRequests.delete(controller);}
 })().catch(error=>{if(sessionRequests.get(fetcher)?.request===request)sessionRequests.delete(fetcher);throw error;});
 sessionRequests.set(fetcher,{generation:expectedGeneration,scope:expectedScope,request});return request;
}
export async function deviceFetch(input:RequestInfo|URL,init?:RequestInit):Promise<Response>{
 const expectedGeneration=generation;const expectedScope=getLearnerScope();
 checkIdentity(expectedGeneration,expectedScope);
 await ensureDeviceSession();checkIdentity(expectedGeneration,expectedScope);
 const controller=new AbortController();pendingRequests.add(controller);
 const signal=init?.signal??(typeof Request!=='undefined'&&input instanceof Request?input.signal:undefined);
 const abort=()=>controller.abort(signal?.reason);
 if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
 const headers=new Headers(init?.headers??(typeof Request!=='undefined'&&input instanceof Request?input.headers:undefined));headers.set('X-KVTT-Account',expectedScope);
 try{
  const response=await globalThis.fetch(input,{...init,headers,credentials:'same-origin',signal:controller.signal});
  checkIdentity(expectedGeneration,expectedScope);
  if(response.status===401)notifyExpired();
  if(response.status===409){
   let code:string|undefined;try{code=(await response.clone().json()).code;}catch{}
   checkIdentity(expectedGeneration,expectedScope);
   if(code==='ACCOUNT_CHANGED'){notifyExpired();throw staleRequest();}
  }
  return response;
 }finally{pendingRequests.delete(controller);signal?.removeEventListener('abort',abort);}
}
export interface DeviceSnapshot<T> { value:T; loading:boolean; saving:boolean; error:string }
type StorageLike=Pick<Storage,'getItem'|'setItem'>;
type Cached<T>={value:T;version:number;dirty:boolean};
const prefix='kvtt.device-cache.v1.';
export function readDeviceCache<T>(key:string, fallback:()=>T, storage?:StorageLike):Cached<T> {
 try { const raw=storage?.getItem(prefix+key); if(raw){const parsed=JSON.parse(raw);if(parsed && 'value' in parsed && Number.isInteger(parsed.version))return parsed;} }catch{}
 return {value:fallback(),version:0,dirty:false};
}
/** One controller per mounted document. PUTs are serialized; later edits coalesce. */
export class DeviceDocument<T> {
 private state:DeviceSnapshot<T>;private version=0;private dirty=false;private hydrated=false;private stopped=false;private epoch=0;private revision=0;private conflict=false;private writing=false;
 private listeners=new Set<()=>void>();private fetcher:typeof fetch;private storage?:StorageLike;
 constructor(private key:string,fallback:()=>T, options:{fetch?:typeof fetch;storage?:StorageLike}={}){
 this.fetcher=options.fetch??deviceFetch;this.storage=options.storage;
 const cached=readDeviceCache(key,fallback,this.storage);this.version=cached.version;this.dirty=cached.dirty;this.state={value:cached.value,loading:true,saving:false,error:''};
 }
 snapshot=()=>this.state;
 subscribe=(listener:()=>void)=>{this.listeners.add(listener);return ()=>{this.listeners.delete(listener);};};
 private emit(patch:Partial<DeviceSnapshot<T>>){this.state={...this.state,...patch};if(!this.stopped)this.listeners.forEach(l=>l());}
 private cache(){try{this.storage?.setItem(prefix+this.key,JSON.stringify({value:this.state.value,version:this.version,dirty:this.dirty}));}catch{}}
 set=(update:T|((previous:T)=>T))=>{if(this.stopped)return;const value=typeof update==='function'?(update as (previous:T)=>T)(this.state.value):update;this.revision++;this.dirty=true;this.emit({value});this.cache();void this.flush();};
 private url(){return '/api/device/documents/'+encodeURIComponent(this.key);}
 async start(){
 this.stopped=false;const epoch=++this.epoch;const revision=this.revision;this.emit({loading:true,error:''});
 try{const response=await this.fetcher(this.url(),{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error('read');const doc=await response.json();if(this.stopped||epoch!==this.epoch)return;
 if(!Number.isInteger(doc.version)||doc.version<0||!('value' in doc))throw Error('invalid');
 if(this.dirty && this.version!==doc.version && doc.version>0){
   if(getLearnerScope()==='guest'){this.version=doc.version;this.dirty=false;this.conflict=false;this.emit({value:doc.value,error:''});}
   else {this.conflict=true;this.emit({error:'Dữ liệu đã đổi ở cửa sổ khác. Hãy đối chiếu thay đổi hoặc tải bản đã lưu.'});}
 }
 else {this.version=doc.version;if(!this.dirty && revision===this.revision && doc.version>0)this.emit({value:doc.value});if(doc.version===0)this.dirty=true;}
 this.hydrated=true;this.cache();this.emit({loading:false});await this.flush();
 }catch{if(!this.stopped&&epoch===this.epoch)this.emit({loading:false,error:'Chưa kết nối được máy chủ. Thay đổi vẫn được giữ trên thiết bị; hãy thử lại.'});}
 }
 private async flush(){
 if(this.stopped||!this.hydrated||!this.dirty||this.writing||this.conflict)return;
 this.writing=true;this.emit({saving:true,error:''});
 try{while(this.dirty&&!this.stopped&&!this.conflict){const revision=this.revision;const value=this.state.value;const response=await this.fetcher(this.url(),{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({value,baseVersion:this.version})});
 if(response.status===409){
   if(getLearnerScope()==='guest'){const remote=await response.json();if(!Number.isInteger(remote.version)||!('value' in remote))throw Error('invalid');this.version=remote.version;this.dirty=false;this.conflict=false;this.emit({value:remote.value,error:''});this.cache();continue;}
   this.conflict=true;throw Error('conflict');
 }if(!response.ok)throw Error('write');const doc=await response.json();if(!Number.isInteger(doc.version)||doc.version<=this.version)throw Error('invalid');this.version=doc.version;if(revision===this.revision)this.dirty=false;this.cache();}
 }catch{this.emit({error:this.conflict?'Dữ liệu đã đổi ở cửa sổ khác. Hãy đối chiếu thay đổi hoặc tải bản đã lưu.':'Chưa lưu được lên máy chủ. Thay đổi vẫn được giữ trên thiết bị; hãy thử lại.'});}
 finally{this.writing=false;this.emit({saving:false});}
 }
 restoreRemote=async()=>{
 if(this.writing||this.stopped)return;
 const epoch=this.epoch;const revision=this.revision;this.emit({loading:true});
 try{const response=await this.fetcher(this.url(),{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error('read');const doc=await response.json();if(this.stopped||epoch!==this.epoch)return;if(revision!==this.revision)throw Error('edited');if(!Number.isInteger(doc.version)||doc.version<=0||!('value' in doc))throw Error('missing');
 try{this.storage?.setItem(prefix+this.key+'.draft-backup',JSON.stringify({value:this.state.value,version:this.version,dirty:this.dirty}));}catch{}
 this.version=doc.version;this.dirty=false;this.conflict=false;this.hydrated=true;this.emit({value:doc.value,error:''});this.cache();
 }catch{if(!this.stopped&&epoch===this.epoch)this.emit({error:'Chưa tải được bản đã lưu. Bản nháp trên thiết bị vẫn được giữ.'});}
 finally{if(!this.stopped&&epoch===this.epoch)this.emit({loading:false});}
 };
 retry=async()=>{if(this.conflict)return;if(!this.hydrated)await this.start();else await this.flush();};
 dispose=()=>{this.stopped=true;this.epoch++;this.listeners.clear();};
}



