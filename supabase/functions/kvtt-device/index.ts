// Device bearer credentials stay in HttpOnly cookies. Privileged database keys never leave this function.
import { validators, object, number, allowedMedia } from '../../../server/deviceValidation.ts';
import { AccountService, AccountError } from '../../../server/accountService.ts';
import { SupabaseAccountRepository } from '../../../server/supabaseAccounts.ts';
import { handleAccountHttp, parseAccountCookie } from '../../../server/accountHttp.ts';
import { handleTeacherHttp } from '../../../server/teacherHttp.ts';
import { TeacherService } from '../../../server/teacherService.ts';
import { SupabaseTeacherStore, SupabaseTeacherFiles } from '../../../server/supabaseTeacherStore.ts';
declare const Deno: { env: { get(name: string): string | undefined }; serve(handler: (req: Request) => Promise<Response>): void };
const root = Deno.env.get('SUPABASE_URL')!;
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const accountService = new AccountService(new SupabaseAccountRepository(root, key));
const teacherService = new TeacherService(new SupabaseTeacherStore(root,key),new SupabaseTeacherFiles(root,key));
const databaseHeaders = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
async function db(route: string, body?: unknown, method = body === undefined ? 'GET' : 'POST') {
  const response = await fetch(`${root}/rest/v1/${route}`, { method, headers: databaseHeaders, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  if (!response.ok) throw new Error('Database request failed');
  const bodyText = await response.text();
  return bodyText ? JSON.parse(bodyText) : null;
}
const hex = (bytes: Uint8Array) => {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 4096) parts.push(Array.from(bytes.subarray(i, i + 4096), b => b.toString(16).padStart(2, '0')).join(''));
  return parts.join('');
};
const metadata = (row: any) => ({ id: row.id, name: row.name, type: row.mime.startsWith('image/') ? 'image' : 'video', url: `/api/device/uploads/${row.id}`, createdAt: row.created_at });
async function boundedBody(req: Request, limit: number): Promise<Uint8Array> {
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) { await reader.cancel(); throw new RangeError('Body too large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
Deno.serve(async req => {
  const headers = new Headers({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' });
  const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: new Headers([...headers, ['Content-Type', 'application/json']]) });
  try {
    const origin = req.headers.get('origin');
    const allowedOrigins = ['https://khuvuontrithuc.vercel.app', 'https://khu-vuon-tri-thuc.vercel.app', 'https://khu-vuon-tri-thuc-minhtuan12s-projects.vercel.app', ...(Deno.env.get('KVTT_ALLOWED_ORIGINS') || '').split(',').filter(Boolean)];
    if (origin && !allowedOrigins.includes(origin)) return json({ error: 'Cross-origin access is not allowed' }, 403);
    const requestUrl = new URL(req.url);
    const apiPath = requestUrl.pathname.slice(requestUrl.pathname.indexOf('/api/'));
    if (apiPath.startsWith('/api/teacher/') || /^\/api\/(?:device\/)?questions(?:\/|$)/.test(apiPath)) {
      return handleTeacherHttp(new Request(new URL(apiPath+requestUrl.search,requestUrl.origin),req),{accounts:accountService,service:teacherService,allowedOrigins});
    }
    const route = requestUrl.pathname.split('/api/device')[1];
    if (!route) return json({ error: 'Not found' }, 404);
    if (route.startsWith('/auth/')) {
      let body: unknown;
      if (req.method === 'POST') {
        const text = new TextDecoder().decode(await boundedBody(req, 16384));
        body = text ? JSON.parse(text) : {};
      }
      const result = await handleAccountHttp({ route, method: req.method, body, cookieHeader: req.headers.get('cookie') || undefined, secure: true }, accountService);
      if (result.cookie) headers.append('Set-Cookie', result.cookie);
      return json(result.body, result.status);
    }
    const accountToken = parseAccountCookie(req.headers.get('cookie') || undefined);
    const user = await accountService.session(accountToken);
    const expectedScope = req.headers.get('x-kvtt-account');
    if (expectedScope && expectedScope !== (user?.id || 'guest')) return json({ error: 'Tài khoản đã thay đổi. Hãy tải lại dữ liệu.', code: 'ACCOUNT_CHANGED' }, 409);
    let token = req.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith('kvtt_device='))?.slice(12);
    let owner = '';
    if (user) {
      owner = await accountService.requireOwner(accountToken);
    } else if (token && /^[a-f0-9]{64}$/.test(token)) {
      owner = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))));
      const devices = await db(`kvtt_devices?id=eq.${owner}&select=id`);
      if (!devices.length || await accountService.repo.isAccountOwner(owner)) owner = '';
    }
    if (!owner) {
      token = hex(crypto.getRandomValues(new Uint8Array(32)));
      owner = hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))));
      await db('kvtt_devices', { id: owner });
      headers.append('Set-Cookie', `kvtt_device=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000`);
    }
    if (route === '/session' && req.method === 'GET') return json({ ready: true });
    if (route === '/session' && req.method === 'DELETE') {
      if (user) return json({ error: 'Hãy đăng xuất tài khoản trước khi xóa dữ liệu khách.' }, 409);
      await db(`kvtt_devices?id=eq.${owner}`, undefined, 'DELETE');
      headers.set('Set-Cookie', 'kvtt_device=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
      return new Response(null, { status: 204, headers });
    }
    const document = /^\/documents\/([^/]+)$/.exec(route);
    if (document) {
      const name = document[1];
      if (!Object.hasOwn(validators, name)) return json({ error: 'Unknown data key' }, 404);
      if (name === 'teacher-preparation') await accountService.requireTeacher(accountToken);
      if (req.method === 'GET') {
        const rows = await db(`kvtt_documents?owner=eq.${owner}&key=eq.${name}&select=value,version`);
        return json(rows[0] || { value: null, version: 0 });
      }
      if (req.method === 'PUT') {
        const body = JSON.parse(new TextDecoder().decode(await boundedBody(req, 1024 * 1024)));
        if (!object(body) || !number(body.baseVersion) || !validators[name](body.value)) return json({ error: 'Invalid document' }, 400);
        const saved = await db('rpc/kvtt_write_document', { p_owner: owner, p_key: name, p_value: body.value, p_version: body.baseVersion });
        return saved.conflict ? json({ error: 'This data was changed in another window. Reload before saving.', value: saved.value, version: saved.version }, 409) : json(saved);
      }
    }
    if (route === '/uploads') {
      if (req.method === 'GET') return json((await db(`kvtt_uploads?owner=eq.${owner}&select=id,name,mime,created_at&order=created_at.desc`)).map(metadata));
      if (req.method === 'POST') {
        const mime = req.headers.get('content-type')?.split(';')[0].toLowerCase() || '';
        let name: string;
        try { name = decodeURIComponent(req.headers.get('x-file-name') || ''); } catch { return json({ error: 'Invalid file name' }, 400); }
        if (!allowedMedia.includes(mime) || !name || name.length > 200 || /[\x00-\x1f]/.test(name)) return json({ error: 'Invalid image or video' }, 400);
        const data = await boundedBody(req, 8 * 1024 * 1024);
        if (!data.length) return json({ error: 'Empty file' }, 400);
        const saved = await db('rpc/kvtt_save_upload', { p_owner: owner, p_name: name, p_mime: mime, p_data: '\\x' + hex(data) });
        return saved ? json(metadata(saved), 201) : json({ error: 'The device library is full (64 MB or 100 files).' }, 413);
      }
    }
    const upload = /^\/uploads\/([0-9a-f-]{36})$/.exec(route);
    if (upload && req.method === 'GET') {
      const rows = await db(`kvtt_uploads?owner=eq.${owner}&id=eq.${upload[1]}&select=mime,data`);
      if (!rows.length) return json({ error: 'File not found' }, 404);
      const row = rows[0];
      const data = new Uint8Array((row.data.length - 2) / 2);
      for (let i = 0; i < data.length; i++) data[i] = parseInt(row.data.slice(2 + i * 2, 4 + i * 2), 16);
      headers.set('Content-Type', row.mime);
      headers.set('Accept-Ranges', 'bytes');
      if (req.headers.has('range')) {
        const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.get('range')!);
        const start = Number(range?.[1]);
        const end = range?.[2] ? Number(range[2]) : data.length - 1;
        if (!range || start > end || start >= data.length || end >= data.length) { headers.set('Content-Range', `bytes */${data.length}`); return new Response(null, { status: 416, headers }); }
        headers.set('Content-Range', `bytes ${start}-${end}/${data.length}`);
        return new Response(data.slice(start, end + 1), { status: 206, headers });
      }
      return new Response(data, { headers });
    }
    if (upload && req.method === 'DELETE') {
      await db(`kvtt_uploads?owner=eq.${owner}&id=eq.${upload[1]}`, undefined, 'DELETE');
      return new Response(null, { status: 204, headers });
    }
    return json({ error: 'Not found' }, 404);
  } catch (error) {
    if (error instanceof AccountError) return json({ error: error.message }, error.status);
    return json({ error: error instanceof RangeError ? 'Request is too large' : error instanceof SyntaxError ? 'Invalid JSON body' : 'Could not save or load data' }, error instanceof RangeError ? 413 : error instanceof SyntaxError ? 400 : 503);
  }
});

