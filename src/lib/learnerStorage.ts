let scope='guest';
const accountPrefix='kvtt.account.';
export function getLearnerScope():string{return scope;}
export function setLearnerScope(next:string):void{scope=next;}
/** Capture identity and backing storage for delayed document writes. */
export function getLearnerStorage():Storage{
 const storage=globalThis.localStorage;
 const prefix=scope==='guest'?'':accountPrefix+scope+'.';
 const keys=()=>Array.from({length:storage.length},(_,i)=>storage.key(i)).filter((key):key is string=>key!==null&&(prefix?key.startsWith(prefix):!key.startsWith(accountPrefix)));
 return {
  get length(){return keys().length;},
  key(index:number){const key=keys()[index];return key===undefined?null:key.slice(prefix.length);},
  getItem(key:string){return storage.getItem(prefix+String(key));},
  setItem(key:string,value:string){storage.setItem(prefix+String(key),String(value));},
  removeItem(key:string){storage.removeItem(prefix+String(key));},
  clear(){for(const key of keys())storage.removeItem(key);},
 };
}
export const learnerStorage:Storage={
 get length(){return getLearnerStorage().length;},
 key:index=>getLearnerStorage().key(index),
 getItem:key=>getLearnerStorage().getItem(key),
 setItem:(key,value)=>getLearnerStorage().setItem(key,value),
 removeItem:key=>getLearnerStorage().removeItem(key),
 clear:()=>getLearnerStorage().clear(),
};