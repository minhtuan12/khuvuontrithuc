// @ts-ignore Bun test runner.
import { expect, test } from 'bun:test';
import app from '../api/index';

test('Vercel entrypoint dispatches original and rewritten paths without a local database', async () => {
  const server=app.listen(0,'127.0.0.1');
  await new Promise<void>(resolve=>server.listening?resolve():server.once('listening',resolve));
  const port=(server.address() as {port:number}).port;
  try {
    for (const path of ['/api/english/catalog','/api/index?path=english/catalog']) {
      const response=await fetch(`http://127.0.0.1:${port}${path}`);
      expect(response.status).toBe(200);
      expect((await response.json()).version).toBe(1);
    }
    const response=await fetch(`http://127.0.0.1:${port}/api/index?path=teacher/plan`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({age:'1-2',activity:'Invalid'})});
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  } finally { server.close(); }
});
