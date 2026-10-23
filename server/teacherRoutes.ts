import {Router,raw,json} from 'express';
import {handleTeacherHttp,type TeacherHttpOptions} from './teacherHttp.ts';
import {TeacherService} from './teacherService.ts';
import type {TeacherStore,TeacherFileStorage} from './teacherTypes.ts';
export function createTeacherRouter(options:Omit<TeacherHttpOptions,'service'>&{store:TeacherStore;files?:TeacherFileStorage;service?:TeacherService}){
 const router=Router();const service=options.service??new TeacherService(options.store,options.files);
 router.use(['/api/teacher','/api/questions','/api/device/questions'],raw({type:'application/octet-stream',limit:'10mb'}),json({limit:'1mb'}),async(req,res)=>{
  const controller=new AbortController();req.on('aborted',()=>controller.abort());
  const headers=new Headers();for(const [name,value] of Object.entries(req.headers))if(value!==undefined)headers.set(name,Array.isArray(value)?value.join(','):value);
  const body=['GET','HEAD'].includes(req.method)?undefined:Buffer.isBuffer(req.body)?new Uint8Array(req.body):JSON.stringify(req.body??{});
  // Body parsers consume transport bytes, so the neutral reader measures its own serialized body.
  headers.delete('content-length');
  const request=new Request(`${req.protocol}://${req.get('host')}${req.originalUrl}`,{method:req.method,headers,body,signal:controller.signal});
  const response=await handleTeacherHttp(request,{...options,service});for(const [name,value] of response.headers)res.setHeader(name,value);res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
 });
 return router;
}
