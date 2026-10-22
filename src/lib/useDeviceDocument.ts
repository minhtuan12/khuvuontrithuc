import {useCallback,useEffect,useMemo,useState,type Dispatch,type SetStateAction} from 'react';
import {DeviceDocument} from './deviceData';

export function useDeviceDocument<T>(key:string,fallback:()=>T):[T,Dispatch<SetStateAction<T>>,{loading:boolean;saving:boolean;error:string;retry:()=>void;restoreRemote:()=>void}]{
 // Browsers may disable storage; the API still works without an offline cache.
 const storage=()=>{try{return typeof window==='undefined'?undefined:window.localStorage;}catch{return undefined;}};
 // A fallback is read once per key, just like a useState initializer.
 const document=useMemo(()=>new DeviceDocument(key,fallback,{storage:storage()}),[key]);
 const [snapshot,setSnapshot]=useState(document.snapshot);
 useEffect(()=>{
 const unsubscribe=document.subscribe(()=>setSnapshot(document.snapshot()));setSnapshot(document.snapshot());void document.start();
 const online=()=>{void document.retry();};window.addEventListener('online',online);
 return ()=>{unsubscribe();window.removeEventListener('online',online);document.dispose();};
 },[document]);
 const setValue=useCallback<Dispatch<SetStateAction<T>>>(value=>document.set(value),[document]);
 const restoreRemote=useCallback(()=>{void document.restoreRemote();},[document]);
 const retry=useCallback(()=>{void document.retry();},[document]);
 return [snapshot.value,setValue,{loading:snapshot.loading,saving:snapshot.saving,error:snapshot.error,retry,restoreRemote}];
}


