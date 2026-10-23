import {parseAccountCookie} from './accountHttp.ts';
import {TeacherError,TEACHER_FILE_LIMIT} from './teacherTypes.ts';
import type {TeacherService} from './teacherService.ts';
type Identity={id:string;role?:string};
export interface TeacherHttpOptions{accounts:{session(token:string|undefined):Promise<Identity|null>;requireTeacher(token:string|undefined):Promise<Identity>};service:TeacherService;allowedOrigins?:string[]}
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
function json(value:unknown,status=200){return Response.json(value,{status,headers});}
async function readBody(request:Request,limit:number){const length=Number(request.headers.get('content-length'));if(length>limit)throw new TeacherError(413,'BODY_TOO_LARGE','Nội dung quá lớn.');const reader=request.body?.getReader();if(!reader)return new Uint8Array();const parts:Uint8Array[]=[];let size=0;try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>limit){await reader.cancel();throw new TeacherError(413,'BODY_TOO_LARGE','Nội dung quá lớn.');}parts.push(value);}}finally{reader.releaseLock();}const result=new Uint8Array(size);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length;}return result;}
export async function handleTeacherHttp(request:Request,options:TeacherHttpOptions):Promise<Response>{
 try{
  const url=new URL(request.url);const path=url.pathname.replace(/\/$/,'');const method=request.method.toUpperCase();
  const origin=request.headers.get('origin');
  if(request.headers.get('sec-fetch-site')==='cross-site'||(origin&&!new Set([url.origin,...(options.allowedOrigins??[])]).has(origin)))throw new TeacherError(403,'ORIGIN_REJECTED','Không chấp nhận yêu cầu từ trang khác.');
  const token=parseAccountCookie(request.headers.get('cookie')??undefined);const self=/^\/api\/(?:device\/)?questions(?:\/|$)/.test(path);
  const user=self?await options.accounts.session(token):await options.accounts.requireTeacher(token);
  if(!user)throw new TeacherError(401,'SESSION_EXPIRED','Vui lòng đăng nhập lại.');
  const expected=request.headers.get('x-kvtt-account');if(expected&&expected!==user.id)return json({error:{code:'ACCOUNT_CHANGED',message:'Tài khoản đã thay đổi.'},code:'ACCOUNT_CHANGED'},409);
  if(request.signal.aborted)throw new TeacherError(499,'CANCELLED','Yêu cầu đã hủy.');
  const service=options.service;const query=Object.fromEntries(url.searchParams);let input:any;
  const data=async()=>{if(input!==undefined)return input;try{input=JSON.parse(new TextDecoder().decode(await readBody(request,1024*1024)));}catch(error){if(error instanceof TeacherError)throw error;throw new TeacherError(400,'INVALID_JSON','Yêu cầu không hợp lệ.');}return input;};
  if(self){const relative=path.replace(/^\/api\/(?:device\/)?questions/,'');if(!relative&&method==='GET')return json(await service.ownQuestions(user.id));if(!relative&&method==='POST')return json(await service.submitQuestion(user.id,await data()),201);const match=/^\/([^/]+)\/withdraw$/.exec(relative);if(match&&method==='POST')return json(await service.withdrawQuestion(user.id,match[1]));}
  else{
   const relative=path.replace(/^\/api\/teacher/,'');
   if(relative==='/students'&&method==='GET')return json(await service.students(query));
   let match=/^\/students\/([^/]+)(?:\/(profile|plans|plans\/generate))?$/.exec(relative);
   if(match){const [,id,action]=match;if(!action&&method==='GET')return json(await service.student(id));if(action==='profile'&&method==='PATCH')return json(await service.profile(id,await data()));if(action==='plans'&&method==='GET')return json(await service.listLessons(user.id,{...query,studentAccountId:id}));if(action==='plans'&&method==='POST')return json(await service.createLesson(user.id,{...await data(),studentAccountId:id}),201);if(action==='plans/generate'&&method==='POST')return json(await service.generate(user.id,id,await data()));}
   if(relative==='/questions'&&method==='GET')return json(await service.listQuestions(query));
   match=/^\/questions\/([^/]+)$/.exec(relative);if(match){if(method==='GET')return json(await service.teacherQuestion(match[1]));if(method==='PATCH')return json(await service.replyQuestion(match[1],await data()));}
   if(relative==='/lesson-plans'){if(method==='GET')return json(await service.listLessons(user.id,query));if(method==='POST')return json(await service.createLesson(user.id,await data()),201);}
   if(relative==='/lesson-plans/uploads/init'&&method==='POST')return json(await service.initUpload(user.id,await data()),201);
   match=/^\/lesson-plans\/uploads\/([^/]+)(?:\/(content|finalize))?$/.exec(relative);
   if(match){const [,id,action]=match;if(action==='content'&&method==='PUT')return json(await service.uploadContent(user.id,id,url.searchParams.get('ticket')??'',await readBody(request,TEACHER_FILE_LIMIT)));if(action==='finalize'&&method==='POST')return json(await service.finalizeUpload(user.id,id));if(!action&&method==='DELETE')return json(await service.cancelUpload(user.id,id));}
   match=/^\/lesson-plans\/([^/]+)\/files\/([^/]+)\/download$/.exec(relative);
   if(match&&method==='GET'){const file=await service.download(user.id,match[1],match[2]);return new Response(new Uint8Array(file.bytes),{headers:{...headers,'Content-Type':file.type,'Content-Disposition':`attachment; filename="lesson.${file.type==='application/msword'?'doc':'docx'}"; filename*=UTF-8''${encodeURIComponent(file.name)}`}});}
   match=/^\/lesson-plans\/([^/]+)$/.exec(relative);if(match){if(method==='GET')return json(await service.lesson(user.id,match[1]));if(method==='PATCH')return json(await service.updateLesson(user.id,match[1],await data()));if(method==='DELETE')return json(await service.deleteLesson(user.id,match[1],(await data()).expectedVersion));}
  }
  throw new TeacherError(404,'NOT_FOUND','Không tìm thấy yêu cầu.');
 }catch(error){const e=error as any;const status=e instanceof TeacherError?e.status:typeof e.status==='number'&&[400,401,403,404,409,413,415,429].includes(e.status)?e.status:500;return json({error:{code:e instanceof TeacherError?e.code:status===401?'SESSION_EXPIRED':status===403?'TEACHER_REQUIRED':'REQUEST_FAILED',message:status===500?'Chưa xử lý được yêu cầu. Hãy thử lại.':e.message}},status);}
}
