// @ts-ignore Bun runner.
import { expect, test } from 'bun:test';
import { accountRequest } from '../src/lib/accountApi';

test('account client keeps session cookies server-side and validates returned profiles', async () => {
  let captured: any;
  const user={id:'account-a',username:'be_an',fullName:'Bé An',gender:null};
  const result=await accountRequest('login',{username:'be_an',password:'safe-password'},async (url,init)=>{captured={url,init};return Response.json({user});});
  expect(result).toEqual({...user,role:'learner'});
  expect(captured.url).toBe('/api/device/auth/login');
  expect(captured.init.credentials).toBe('same-origin');
  expect(captured.init.cache).toBe('no-store');
  expect(captured.init.headers.Authorization).toBeUndefined();
  await expect(accountRequest('session',undefined,async()=>Response.json({user:{id:'a'}}))).rejects.toThrow();
});

test('account API errors and missing sessions do not masquerade as successful login', async () => {
  expect(await accountRequest('session',undefined,async()=>Response.json({user:null,expired:true}))).toBeNull();
  await expect(accountRequest('login',{},async()=>Response.json({error:'Tên đăng nhập hoặc mật khẩu chưa đúng.'},{status:401}))).rejects.toThrow('mật khẩu');
  await expect(accountRequest('register',{},async()=>Response.json({user:null}))).rejects.toThrow();
});
