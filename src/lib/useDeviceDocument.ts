import {useCallback,useEffect,useMemo,useState,type Dispatch,type SetStateAction} from 'react';
import {DeviceDocument,deviceFetch} from './deviceData';
import {getLearnerScope,getLearnerStorage} from './learnerStorage';

export function useDeviceDocument<T>(key:string,fallback:()=>T):[T,Dispatch<SetStateAction<T>>,{loading:boolean;saving:boolean;error:string;retry:()=>void;restoreRemote:()=>void}]{
 // Browsers may disable storage; the API still works without an offline cache.
 const scope=getLearnerScope();
 const storage=()=>{try{return typeof window==='undefined'?undefined:getLearnerStorage();}catch{return undefined;}};
 // A fallback is read once per key, just like a useState initializer.
 const document=useMemo(()=>new DeviceDocument(key,fallback,{storage:storage(),fetch:(input,init)=>{
 if(getLearnerScope()!==scope)return Promise.reject(new DOMException('Tài khoản đã thay đổi','AbortError'));
 return deviceFetch(input,init);
 }}),[key,scope]);
 const [snapshot,setSnapshot]=useState(document.snapshot);
 useEffect(()=>{
 const unsubscribe=document.subscribe(()=>setSnapshot(document.snapshot()));setSnapshot(document.snapshot());void document.start();
 const online=()=>{if(getLearnerScope()===scope)void document.retry();};window.addEventListener('online',online);window.addEventListener('kvtt-account-ready',online);
 return ()=>{unsubscribe();window.removeEventListener('online',online);window.removeEventListener('kvtt-account-ready',online);document.dispose();};
 },[document]);
 const setValue=useCallback<Dispatch<SetStateAction<T>>>(value=>document.set(value),[document]);
 const restoreRemote=useCallback(()=>{void document.restoreRemote();},[document]);
 const retry=useCallback(()=>{void document.retry();},[document]);
 return [snapshot.value,setValue,{loading:snapshot.loading,saving:snapshot.saving,error:snapshot.error,retry,restoreRemote}];
}


