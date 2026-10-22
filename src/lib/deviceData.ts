// Bootstrap once before parallel API reads so all documents share one HttpOnly device cookie.
const sessionRequests=new WeakMap<typeof fetch,Promise<void>>();
export function ensureDeviceSession(fetcher:typeof fetch=globalThis.fetch):Promise<void>{
 const existing=sessionRequests.get(fetcher);if(existing)return existing;
 const request=fetcher('/api/device/session',{credentials:'same-origin',cache:'no-store'}).then(async response=>{if(!response.ok)throw Error('device session');const body=await response.json();if(body.ready!==true)throw Error('device session');}).catch(error=>{sessionRequests.delete(fetcher);throw error;});
 sessionRequests.set(fetcher,request);return request;
}
export async function deviceFetch(input:RequestInfo|URL,init?:RequestInit):Promise<Response>{await ensureDeviceSession();return globalThis.fetch(input,{...init,credentials:'same-origin'});}
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
 set=(update:T|((previous:T)=>T))=>{const value=typeof update==='function'?(update as (previous:T)=>T)(this.state.value):update;this.revision++;this.dirty=true;this.emit({value});this.cache();void this.flush();};
 private url(){return '/api/device/documents/'+encodeURIComponent(this.key);}
 async start(){
 this.stopped=false;const epoch=++this.epoch;const revision=this.revision;this.emit({loading:true,error:''});
 try{const response=await this.fetcher(this.url(),{credentials:'same-origin',cache:'no-store'});if(!response.ok)throw Error('read');const doc=await response.json();if(this.stopped||epoch!==this.epoch)return;
 if(!Number.isInteger(doc.version)||doc.version<0||!('value' in doc))throw Error('invalid');
 if(this.dirty && this.version!==doc.version && doc.version>0){this.conflict=true;this.emit({error:'Dữ liệu đã đổi ở cửa sổ khác. Hãy đối chiếu thay đổi hoặc tải bản đã lưu.'});}
 else {this.version=doc.version;if(!this.dirty && revision===this.revision && doc.version>0)this.emit({value:doc.value});if(doc.version===0)this.dirty=true;}
 this.hydrated=true;this.cache();this.emit({loading:false});await this.flush();
 }catch{if(!this.stopped&&epoch===this.epoch)this.emit({loading:false,error:'Chưa kết nối được máy chủ. Thay đổi vẫn được giữ trên thiết bị; hãy thử lại.'});}
 }
 private async flush(){
 if(this.stopped||!this.hydrated||!this.dirty||this.writing||this.conflict)return;
 this.writing=true;this.emit({saving:true,error:''});
 try{while(this.dirty&&!this.stopped&&!this.conflict){const revision=this.revision;const value=this.state.value;const response=await this.fetcher(this.url(),{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({value,baseVersion:this.version})});
 if(response.status===409){this.conflict=true;throw Error('conflict');}if(!response.ok)throw Error('write');const doc=await response.json();if(!Number.isInteger(doc.version)||doc.version<=this.version)throw Error('invalid');this.version=doc.version;if(revision===this.revision)this.dirty=false;this.cache();}
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



