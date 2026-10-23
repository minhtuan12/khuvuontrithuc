// @ts-nocheck Bun runner.
import {expect,test} from 'bun:test';
import {handleTeacherHttp} from '../server/teacherHttp';
import {TeacherService} from '../server/teacherService';
import {SqliteTeacherStore,SqliteTeacherFiles} from '../server/sqliteTeacherStore';
import {AccountService} from '../server/accountService';
import {SqliteAccountRepository} from '../server/sqliteAccounts';
import {DeviceStore} from '../server/deviceRoutes';
import {mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('teacher HTTP integrates live roles, student summaries and explicit owner question sharing',async()=>{
 const dir=join(tmpdir(),'kvtt-teacher-'+crypto.randomUUID());mkdirSync(dir);const path=join(dir,'test.sqlite');
 const repo=new SqliteAccountRepository(path),docs=new DeviceStore(path),store=new SqliteTeacherStore(path),files=new SqliteTeacherFiles(path);const accounts=new AccountService(repo),service=new TeacherService(store,files);
 const call=(path,token,method='GET',data)=>handleTeacherHttp(new Request('https://garden.test'+path,{method,headers:{...(token?{Cookie:'kvtt_account='+token}:{}),'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{})}),{accounts,service});
 try{
 await accounts.seedTeacher('fixture-teacher-password');const teacher=await accounts.login({username:'ngant',password:'fixture-teacher-password'}),learner=await accounts.register({username:'http.learner',fullName:'Bé An',password:'fixture-learner-password'});
 const owner=await accounts.requireOwner(learner.token);docs.ensureOwner(owner);docs.write(owner,'stars',12,0);docs.write(owner,'teacher-notes',[{content:'PRIVATE DRAFT'}],0);
 expect((await call('/api/teacher/students')).status).toBe(401);expect((await call('/api/teacher/students',learner.token)).status).toBe(403);
 const stats=await(await call('/api/teacher/students',teacher.token)).json();expect(stats.total).toBe(1);expect(stats.items[0].summary.stars).toBe(12);expect(JSON.stringify(stats)).not.toContain('PRIVATE DRAFT');expect(JSON.stringify(stats)).not.toContain(owner);
 const q=await(await call('/api/questions',learner.token,'POST',{content:'Bé thích học gì?',idempotencyKey:'http-question-001'})).json();expect(q.accountId).toBe(learner.user.id);
 const inbox=await(await call('/api/teacher/questions',teacher.token)).json();expect(inbox.items.map(i=>i.id)).toContain(q.id);
 expect((await call('/api/teacher/questions/'+q.id,teacher.token,'PATCH',{reply:'Cô sẽ cùng bé khám phá.',expectedVersion:q.version})).status).toBe(200);
 const own=await(await call('/api/questions',learner.token)).json();expect(own.items[0].reply).toContain('khám phá');
 await call('/api/questions/'+q.id+'/withdraw',learner.token,'POST',{});expect((await call('/api/teacher/questions/'+q.id,teacher.token)).status).toBe(404);
 await accounts.logout(teacher.token);expect((await call('/api/teacher/students',teacher.token)).status).toBe(401);
 }finally{repo.close();docs.close();store.close();files.close();rmSync(dir,{recursive:true,force:true});}
});
