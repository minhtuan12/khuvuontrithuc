// @ts-ignore Bun runner.
import { expect, test } from 'bun:test';
import { RemoteTeacherAuthorization } from '../server/remoteTeacherAuth';

test('remote authorization forwards only the account cookie and accepts only server teacher role', async () => {
  const original = globalThis.fetch;
  let captured: RequestInit | undefined;
  const teacher = {id:'id',username:'teacher',fullName:'Teacher',gender:null,role:'teacher'};
  try {
    globalThis.fetch = (async (_url, init) => { captured=init; return Response.json({user:teacher}); }) as typeof fetch;
    const auth = new RemoteTeacherAuthorization('https://example.supabase.co');
    expect(await auth.requireTeacher('a'.repeat(64))).toEqual(teacher);
    expect(new Headers(captured?.headers).get('cookie')).toBe(`kvtt_account=${'a'.repeat(64)}`);
    globalThis.fetch = (async () => Response.json({user:{...teacher,role:'learner'}})) as typeof fetch;
    await expect(auth.requireTeacher('a'.repeat(64))).rejects.toMatchObject({status:403});
    globalThis.fetch = (async () => Response.json({user:null})) as typeof fetch;
    await expect(auth.requireTeacher('a'.repeat(64))).rejects.toMatchObject({status:401});
    globalThis.fetch = (async () => new Response('outage',{status:503})) as typeof fetch;
    await expect(auth.requireTeacher('a'.repeat(64))).rejects.toMatchObject({status:503});
  } finally {globalThis.fetch=original;}
});
