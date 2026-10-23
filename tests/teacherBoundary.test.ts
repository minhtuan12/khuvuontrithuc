// @ts-ignore Bun test runner.
import { expect, test } from 'bun:test';
import express from 'express';
import { AccountService } from '../server/accountService';
import { SqliteAccountRepository } from '../server/sqliteAccounts';
import { DeviceStore, createDeviceRouter } from '../server/deviceRoutes';
import { createAIRouter } from '../server/aiRoutes';

test('teacher preparation document cannot be read or written by a guest', async () => {
  const accounts = new SqliteAccountRepository(':memory:');
  const documents = new DeviceStore(':memory:');
  const app = express();
  app.use(express.json());
  app.use(createDeviceRouter(documents, new AccountService(accounts)));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.listening ? resolve() : server.once('listening', resolve));
  try {
    for (const method of ['GET', 'PUT']) for (const key of ['teacher-preparation','teacher-preparation/','teacher%2dpreparation']) {
      const response = await fetch(`http://127.0.0.1:${(server.address() as {port:number}).port}/api/device/documents/${key}`, {method,headers:{'Content-Type':'application/json'},...(method==='PUT'?{body:JSON.stringify({baseVersion:0,value:{}})}:{})});
      expect(response.status).toBe(401);
    }
  } finally { server.close(); documents.close(); accounts.close(); }
});

test('learner cannot read teacher preparation or generate plans, teacher can, and logout revokes access', async () => {
  const repo = new SqliteAccountRepository(':memory:');
  const documents = new DeviceStore(':memory:');
  const accounts = new AccountService(repo);
  await accounts.seedTeacher('teacher-boundary-fixture');
  const teacher = await accounts.login({username:'ngant',password:'teacher-boundary-fixture'});
  const learner = await accounts.register({username:'boundary.learner',fullName:'Bạn nhỏ',password:'learner-boundary-fixture'});
  let generations=0;
  const app = express(); app.use(express.json());
  app.use(createDeviceRouter(documents, accounts));
  app.use(createAIRouter({models:{generateContent:async()=>{generations++;return {text:'Teacher plan'};}}},accounts));
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.listening?resolve():server.once('listening',resolve));
  const base=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
  try {
    for(const [token,status] of [[learner.token,403],[teacher.token,200]] as const) {
      expect((await fetch(base+'/api/device/documents/teacher-preparation',{headers:{Cookie:`kvtt_account=${token}`}})).status).toBe(status);
      expect((await fetch(base+'/api/teacher/plan',{method:'POST',headers:{Cookie:`kvtt_account=${token}`,'Content-Type':'application/json'},body:JSON.stringify({age:'3-4',activity:'Colors'})})).status).toBe(status);
    }
    expect(generations).toBe(1);
    const preparation={age:'4-5',activity:'Màu sắc',plan:'Giáo án',selfStudy:'Nội dung'};
    const saved=await fetch(base+'/api/device/documents/teacher-preparation',{method:'PUT',headers:{Cookie:`kvtt_account=${teacher.token}`,'Content-Type':'application/json'},body:JSON.stringify({baseVersion:0,value:preparation})});
    expect(saved.status).toBe(200);
    const restored=await fetch(base+'/api/device/documents/teacher-preparation',{headers:{Cookie:`kvtt_account=${teacher.token}`}});
    expect((await restored.json()).value).toEqual(preparation);
    const denied=await fetch(base+'/api/teacher/plan',{method:'POST',headers:{Cookie:`kvtt_account=${teacher.token}`,'Content-Type':'application/json',Origin:'https://other.invalid'},body:JSON.stringify({age:'3-4',activity:'Colors'})});
    expect(denied.status).toBe(403);
    await accounts.logout(teacher.token);
    expect((await fetch(base+'/api/device/documents/teacher-preparation',{headers:{Cookie:`kvtt_account=${teacher.token}`}})).status).toBe(401);
  } finally {server.close();documents.close();repo.close();}
});
