// @ts-ignore Bun's native test API is provided by the test runner.
import { test, expect } from 'bun:test';
import { AccountService, AccountError, hashToken } from '../server/accountService';
import { SqliteAccountRepository } from '../server/sqliteAccounts';
import { handleAccountHttp, parseAccountCookie } from '../server/accountHttp';
import { SupabaseAccountRepository } from '../server/supabaseAccounts';
import { runTeacherSeed } from '../scripts/seed-teacher-account';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-ignore Bun provides the native SQLite module.
import { Database } from 'bun:sqlite';

const input = { username: 'Garden.Kid', fullName: 'Bạn nhỏ', password: 'garden-password', gender: 'other' };
test('register validates, normalizes, keeps secrets private and stable owner through login', async () => {
  const repo = new SqliteAccountRepository(':memory:'); const service = new AccountService(repo);
  try {
    await expect(service.register({ ...input, username: 'a' })).rejects.toBeInstanceOf(AccountError);
    const created = await service.register(input);
    expect(created.user).toEqual({ id: created.user.id, username: 'garden.kid', fullName: input.fullName, gender: 'other', role: 'learner' });
    expect(created.token).toMatch(/^[a-f0-9]{64}$/);
    const account = await repo.findByUsername('garden.kid');
    expect(account!.passwordHash).not.toContain(input.password);
    expect(account!.ownerId).toMatch(/^[a-f0-9]{64}$/);
    expect(await repo.isAccountOwner(account!.ownerId)).toBe(true);
    expect(await service.requireOwner(created.token)).toBe(account!.ownerId);
    expect(await repo.findSession(created.token)).toBeNull();
    expect(await repo.findSession(await hashToken(created.token))).not.toBeNull();
    await expect(service.register(input)).rejects.toMatchObject({ status: 409 });
    const login = await service.login({ username: 'GARDEN.KID', password: input.password });
    expect(await service.requireOwner(login.token)).toBe(account!.ownerId);
    await service.logout(login.token);
    await expect(service.session(login.token)).rejects.toMatchObject({ status: 401 });
    await expect(service.session('unknown')).rejects.toMatchObject({ status: 401 });
    expect(await service.session(undefined)).toBeNull();
    await repo.createSession({ tokenHash: await hashToken('f'.repeat(64)), accountId: created.user.id, expiresAt: Date.now()-1 });
    await expect(service.session('f'.repeat(64))).rejects.toMatchObject({ status: 401 });
  } finally { repo.close(); }
});
test('wrong and nonexistent credentials have generic errors and atomic attempt limit', async () => {
  const repo = new SqliteAccountRepository(':memory:'); const service = new AccountService(repo);
  try {
    await service.register(input);
    for (let n=0;n<5;n++) await expect(service.login({ username: input.username, password: 'incorrect' })).rejects.toMatchObject({ status: 401, message: 'Tên đăng nhập hoặc mật khẩu chưa đúng.' });
    await expect(service.login({ username: input.username, password: input.password })).rejects.toMatchObject({ status: 429 });
    await expect(service.login({ username: 'missing', password: 'incorrect' })).rejects.toMatchObject({ status: 401, message: 'Tên đăng nhập hoặc mật khẩu chưa đúng.' });
    const attempts = await Promise.all(Array.from({length:10}, () => repo.consumeLoginAttempt('parallel', Date.now())));
    expect(attempts.filter(Boolean)).toHaveLength(5);
  } finally { repo.close(); }
});
test('independent account sessions never resolve to another account owner', async () => {
  const repo=new SqliteAccountRepository(':memory:'); const service=new AccountService(repo);
  try {
    const a=await service.register(input);
    const b=await service.register({...input,username:'another.kid'});
    expect(await service.requireOwner(a.token)).not.toBe(await service.requireOwner(b.token));
    expect((await service.session(a.token))?.id).toBe(a.user.id);
    expect((await service.session(b.token))?.id).toBe(b.user.id);
    await service.logout(a.token);
    expect((await service.session(b.token))?.id).toBe(b.user.id);
    await expect(service.requireOwner(undefined)).rejects.toMatchObject({status:401});
    for(const invalid of [{fullName:'a'},{fullName:'x'.repeat(101)},{password:'short'},{password:'x'.repeat(129)},{username:'bad name'},{gender:'unknown'}]) {
      await expect(service.register({...input,...invalid})).rejects.toMatchObject({status:400});
    }
  } finally {repo.close();}
});
test('HTTP only returns public user, strict cookie and revoked logout', async () => {
  const repo = new SqliteAccountRepository(':memory:'); const service = new AccountService(repo);
  try {
    const request = { route:'/auth/register', method:'POST', body:input, secure:true };
    const registered = await handleAccountHttp(request, service);
    expect(registered.status).toBe(201); expect(Object.keys(registered.body)).toEqual(['user']);
    expect(registered.cookie).toContain('HttpOnly; SameSite=Strict; Secure');
    const cookieHeader=registered.cookie!; const token=parseAccountCookie(cookieHeader)!;
    expect((await handleAccountHttp({route:'/auth/session',method:'GET',cookieHeader,secure:true},service)).status).toBe(200);
    const logout=await handleAccountHttp({route:'/auth/logout',method:'POST',cookieHeader,secure:true},service);
    expect(logout.cookie).toContain('Max-Age=0');
    await expect(service.session(token)).rejects.toMatchObject({status:401});
    const expired=await handleAccountHttp({route:'/auth/session',method:'GET',cookieHeader:'kvtt_account=',secure:true},service);
    expect(expired.body).toEqual({user:null,expired:true}); expect(expired.cookie).toContain('Max-Age=0');
  } finally { repo.close(); }
});
test('Supabase adapter uses private RPC atomic creation and throttle, hashes only in session REST', async () => {
  const originalFetch=globalThis.fetch;
  const calls:{url:string;method:string;body:any;headers:any}[]=[];
  globalThis.fetch=(async (url:any,options:any)=>{
    calls.push({url:String(url),method:options.method,body:options.body?JSON.parse(options.body):null,headers:options.headers});
    if(String(url).includes('/rpc/')) return new Response('true');
    if(options.method==='GET') return new Response(JSON.stringify([{token_hash:'hash',account_id:'id',expires_at:'2026-11-01T00:00:00Z'}]));
    return new Response(null,{status:204});
  }) as any;
  try {
    const repo=new SupabaseAccountRepository('https://example.supabase.co/','server-secret');
    expect(await repo.consumeLoginAttempt('kid',0)).toBe(true);
    expect(await repo.createAccount({id:'id',username:'kid',fullName:'Kid Name',gender:null,role:'learner',ownerId:'owner',passwordHash:'hash',passwordSalt:'salt'})).toBe(true);
    await repo.createSession({tokenHash:'hash',accountId:'id',expiresAt:0});
    expect((await repo.findSession('hash'))?.expiresAt).toBe(Date.parse('2026-11-01T00:00:00Z'));
    expect(calls[0].url).toBe('https://example.supabase.co/rest/v1/rpc/kvtt_consume_login_attempt');
    expect(calls[1].url).toContain('/rpc/kvtt_create_account');
    expect(calls[1].body.p_role).toBe('learner'); expect(calls[1].body.p_seed_key).toBeNull();
    expect(calls[2].body).toEqual({token_hash:'hash',account_id:'id',expires_at:'1970-01-01T00:00:00.000Z'});
    expect(calls[0].headers.Authorization).toBe('Bearer server-secret');
  } finally { globalThis.fetch=originalFetch; }
});
test('local additive role migration preserves existing account identity and defaults to learner',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'kvtt-role-migration-'));const filename=join(directory,'app.sqlite');
  try {
    const db=new Database(filename,{create:true});
    db.exec('CREATE TABLE kvtt_accounts(id TEXT PRIMARY KEY,username TEXT UNIQUE NOT NULL,full_name TEXT NOT NULL,gender TEXT,owner_id TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,password_salt TEXT NOT NULL)');
    db.query('INSERT INTO kvtt_accounts VALUES(?,?,?,?,?,?,?)').run('legacy-id','legacy','Old Name',null,'b'.repeat(64),'old-hash','old-salt');db.close();
    const repo=new SqliteAccountRepository(filename);
    try {expect(await repo.findByUsername('legacy')).toEqual({id:'legacy-id',username:'legacy',fullName:'Old Name',gender:null,ownerId:'b'.repeat(64),passwordHash:'old-hash',passwordSalt:'old-salt',role:'learner',seedKey:null});}
    finally{repo.close();}
    const reopened=new SqliteAccountRepository(filename);expect((await reopened.findByUsername('legacy'))?.role).toBe('learner');reopened.close();
  }finally{rmSync(directory,{recursive:true,force:true});}
});
test('private seed command validates target and input then produces no secret output',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'kvtt-seed-command-'));const filename=join(directory,'app.sqlite');
  try {
    await expect(runTeacherSeed([],{},async()=>{throw Error('must not read input');})).rejects.toBeInstanceOf(Error);
    await expect(runTeacherSeed(['--supabase'],{},async()=>{throw Error('must not read input');})).rejects.toBeInstanceOf(Error);
    await expect(runTeacherSeed([`--sqlite=${filename}`],{},async()=>'short')).rejects.toBeInstanceOf(Error);
    const privateInput=async()=>'private-test-password';
    expect(await runTeacherSeed([`--sqlite=${filename}`],{},privateInput)).toEqual({created:true});
    expect(await runTeacherSeed([`--sqlite=${filename}`],{KVTT_TEACHER_SEED_PASSWORD:'private-test-password'},async()=>{throw Error('must not read input');})).toEqual({created:false});
    await expect(runTeacherSeed([`--sqlite=${filename}`],{},async()=>'different-test-password')).rejects.toMatchObject({status:409});
  }finally{rmSync(directory,{recursive:true,force:true});}
});
test('teacher registration grants teacher access while reserved teacher seed remains private and repeatable', async () => {
  const repo=new SqliteAccountRepository(':memory:'); const service=new AccountService(repo);
  try {
    await expect(service.requireTeacher(undefined)).rejects.toMatchObject({status:401});
    const learner=await service.register(input);
    await expect(service.requireTeacher(learner.token)).rejects.toMatchObject({status:403});
    const registeredTeacher=await service.register({...input,username:'new.teacher',role:'teacher'});
    expect((await service.requireTeacher(registeredTeacher.token)).role).toBe('teacher');
    await expect(service.register({...input,username:'fake.teacher',role:'admin'})).rejects.toMatchObject({status:400});
    await expect(service.register({...input,username:' NGANT '})).rejects.toMatchObject({status:409});
    const seeded=await service.seedTeacher('private-test-password');
    expect(seeded.created).toBe(true); expect(seeded.user).toMatchObject({username:'ngant',fullName:'Cô Nga',role:'teacher'});
    expect(Object.keys(seeded.user).sort()).toEqual(['fullName','gender','id','role','username']);
    const teacher=await service.login({username:'ngant',password:'private-test-password',role:'learner'});
    expect((await service.requireTeacher(teacher.token)).id).toBe(seeded.user.id);
    const old=await repo.findByUsername('ngant');
    const repeated=await service.seedTeacher('private-test-password');
    expect(repeated).toEqual({user:seeded.user,created:false});
    expect((await repo.findByUsername('ngant'))?.passwordHash).toBe(old?.passwordHash);
    await expect(service.seedTeacher('different-test-password')).rejects.toMatchObject({status:409});
    const actualFind=repo.findById.bind(repo);
    repo.findById=async id=>{const account=await actualFind(id);return account?{...account,role:'learner'}:null;};
    await expect(service.requireTeacher(teacher.token)).rejects.toMatchObject({status:403});
    expect((await service.session(teacher.token))?.role).toBe('learner');
    await service.logout(teacher.token);
    await expect(service.requireTeacher(teacher.token)).rejects.toMatchObject({status:401});
  } finally {repo.close();}
});
test('teacher seed refuses an existing unverified username instead of elevating it', async()=>{
  const repo=new SqliteAccountRepository(':memory:'); const service=new AccountService(repo);
  try {
    const created=await service.register(input); const account=(await repo.findById(created.user.id))!;
    await repo.createAccount({...account,id:crypto.randomUUID(),username:'ngant',ownerId:'a'.repeat(64),role:'learner'});
    await expect(service.seedTeacher('private-test-password')).rejects.toMatchObject({status:409});
    expect((await repo.findByUsername('ngant'))?.role).toBe('learner');
    expect((await repo.findByUsername('ngant'))?.passwordHash).toBe(account.passwordHash);
  }finally{repo.close();}
});
