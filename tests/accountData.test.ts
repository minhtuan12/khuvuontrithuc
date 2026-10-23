// @ts-ignore Bun runner.
import { expect, test } from 'bun:test';
import express from 'express';
import { DeviceStore, createDeviceRouter } from '../server/deviceRoutes';
import { AccountService } from '../server/accountService';
import { SqliteAccountRepository } from '../server/sqliteAccounts';
import { createAccountRouter } from '../server/accountRoutes';

test('account API isolates guest, account A/B documents, uploads, stale writes and logout', async () => {
  const store=new DeviceStore(':memory:');const repo=new SqliteAccountRepository(':memory:');const service=new AccountService(repo);
  const app=express();app.use(express.json());app.use(createAccountRouter(service));app.use(createDeviceRouter(store,service));
  const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.listening?resolve():server.once('listening',resolve));
  const base=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
  let jar:Record<string,string>={};
  async function request(path:string,body?:unknown,method=body===undefined?'GET':'POST',headers:Record<string,string>={}){
    const response=await fetch(base+'/api/device'+path,{method,headers:{Cookie:Object.entries(jar).map(([k,v])=>`${k}=${v}`).join('; '),'Content-Type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
    response.headers.getSetCookie().forEach(cookie=>{const [pair]=cookie.split(';');const [name,value]=pair.split('=');if(value)jar[name]=value;else delete jar[name];});
    return response;
  }
  try {
    await request('/session');
    expect((await request('/documents/stars',{baseVersion:0,value:5},'PUT')).status).toBe(200);
    const a=await (await request('/auth/register',{username:'learner_a',fullName:'Bé An',password:'password-a'})).json();
    expect(a.user.username).toBe('learner_a');
    expect((await (await request('/documents/stars')).json()).value).toBeNull();
    await request('/documents/stars',{baseVersion:0,value:11},'PUT');
    const garden={
      'bee:animals:3-4':{runs:1,words:6,bestAccuracy:100,lastPlayed:'2026-10-23T08:00:00.000Z'},
      'basket:all:5-6':{runs:2,words:12,bestAccuracy:86,lastPlayed:'2026-10-23T09:00:00.000Z'},
      'odd:all:4-5':{runs:1,words:6,bestAccuracy:75,lastPlayed:'2026-10-23T09:30:00.000Z'},
      'train:all:3-4':{runs:1,words:6,bestAccuracy:100,lastPlayed:'2026-10-23T10:00:00.000Z'},
    };
    expect((await request('/documents/english-garden-progress',{baseVersion:0,value:garden},'PUT')).status).toBe(200);
    const tokenA=jar.kvtt_account;
    const ownerA=(await repo.findByUsername('learner_a'))!.ownerId;
    store.upload(ownerA,'private.png','image/png',Buffer.from([1,2,3]));
    const mediaA=await (await request('/uploads')).json();
    expect(mediaA).toHaveLength(1);
    await request('/auth/logout',{},'POST');
    expect((await (await request('/documents/stars')).json()).value).toBe(5);
    const b=await (await request('/auth/register',{username:'learner_b',fullName:'Bé Bình',password:'password-b',gender:'male'})).json();
    expect((await (await request('/documents/english-garden-progress')).json()).value).toBeNull();
    expect((await (await request('/documents/stars')).json()).value).toBeNull();
    expect((await request('/uploads/'+mediaA[0].id)).status).toBe(404);
    await request('/documents/stars',{baseVersion:0,value:22},'PUT');
    expect((await request('/documents/stars',{baseVersion:1,value:99},'PUT',{'X-KVTT-Account':a.user.id})).status).toBe(409);
    expect((await (await request('/documents/stars')).json()).value).toBe(22);
    jar={kvtt_account:tokenA};
    expect((await request('/documents/stars')).status).toBe(401);
    await request('/auth/session');
    await request('/auth/login',{username:'learner_a',password:'password-a'});
    expect((await (await request('/documents/english-garden-progress')).json()).value).toEqual(garden);
    expect((await (await request('/documents/stars')).json()).value).toBe(11);
    await request('/auth/logout',{},'POST');
    jar={kvtt_device:ownerA};
    expect((await (await request('/documents/stars')).json()).value).toBeNull();
    expect((await request('/auth/register',{username:'csrf_user',fullName:'Bad Origin',password:'password-x'},'POST',{Origin:'https://wrong.example'})).status).toBe(403);
    expect(b.user.id).not.toBe(a.user.id);
  }finally{server.close();store.close();repo.close();}
});
