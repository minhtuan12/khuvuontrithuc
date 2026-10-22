import { parse } from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
const configured = existsSync('.env.local') ? parse(readFileSync('.env.local')) : {};
const url = configured.VITE_SUPABASE_URL;
const key = configured.VITE_SUPABASE_PUBLISHABLE_KEY;
const results = [];
if (!url || !key || /YOUR_|MY_/.test(key)) {
  results.push({ configured: false });
} else {
  for (const table of ['english_lesson_progress', 'teacher_english_plans']) {
    const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${table}?select=lesson_id&limit=0`, { headers: { apikey: key }, signal: AbortSignal.timeout(15000) });
    const body = await response.json().catch(() => ({}));
    results.push({ table, status: response.status, code: body.code || null, missingSchema: body.code === 'PGRST205' || body.code === '42P01' });
  }
}
await mkdir('docs/verification', { recursive: true });
await writeFile('docs/verification/supabase-readonly-check.json', JSON.stringify({ readonly: true, results }, null, 2));
console.log(JSON.stringify(results));
