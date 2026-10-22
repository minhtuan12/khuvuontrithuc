import { Router, raw } from 'express';
import { randomBytes, randomUUID } from 'node:crypto';
// @ts-ignore The application server runs on Bun, which provides SQLite natively.
import { Database } from 'bun:sqlite';
import { BADGES_LIST } from '../src/constants/badgesData';
import { findEnglishLesson } from '../src/lib/englishCatalog';

type Document = { value: unknown; version: number };
const object = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const number = (value: unknown, max = 1_000_000_000) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
const text = (value: unknown, max: number) => typeof value === 'string' && value.length <= max;
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const statsKeys = ['mathCount', 'mathStreak', 'speechCount', 'speechStreak', 'streakCount', 'bestStreak', 'scienceCount', 'englishCount', 'artCount', 'physicalCount', 'socialCount'];
const validators: Record<string, (value: unknown) => boolean> = {
  stars: value => number(value),
  'game-stars': value => number(value),
  'learning-stats': value => object(value) && statsKeys.every(key => number(value[key])),
  badges: value => Array.isArray(value) && value.length <= BADGES_LIST.length && value.every(id => BADGES_LIST.some(badge => badge.id === id)),
  emotions: value => Array.isArray(value) && value.length <= 20 && value.every(item => object(item) && ['vui', 'buon', 'tuc-gian'].includes(item.emotion) && date(item.date) && text(item.feedback, 2000)),
  'study-time': value => object(value) && /^\d{4}-\d{2}-\d{2}$/.test(value.day) && number(value.seconds, 86400),
  settings: value => object(value) && [15, 20, 30].includes(value.sessionMinutes) && number(value.dailyActivityTarget, 20) && value.dailyActivityTarget >= 1,
  'family-posts': value => Array.isArray(value) && value.length <= 100 && value.every(item => object(item) && text(item.id, 100) && item.id.length > 0 && text(item.content, 2000) && item.content.trim() && typeof item.liked === 'boolean' && Array.isArray(item.comments) && item.comments.length <= 100 && item.comments.every(comment => text(comment, 1000) && comment.trim())),
  'teacher-notes': value => Array.isArray(value) && value.length <= 100 && value.every(item => object(item) && text(item.id, 100) && item.id.length > 0 && text(item.content, 4000) && item.content.trim() && date(item.date)),
  'english-stars': value => object(value) && Object.keys(value).length <= 5000 && Object.entries(value).every(([key, score]) => key.length <= 200 && number(score, 3)),
  'english-progress': value => object(value) && Object.keys(value).length <= 500 && Object.entries(value).every(([key, item]) => {
    const lesson = findEnglishLesson(key);
    return lesson && object(item) && item.lessonId === key && item.ageBand === lesson.age && date(item.openedAt) && (item.completedAt === null || date(item.completedAt));
  }),
};

export class DeviceStore {
  private db: any;
  constructor(filename: string) {
    this.db = new Database(filename, { create: true });
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS devices(id TEXT PRIMARY KEY); CREATE TABLE IF NOT EXISTS documents(owner TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, version INTEGER NOT NULL, PRIMARY KEY(owner,key)); CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY, owner TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, created_at TEXT NOT NULL);');
  }
  close() { this.db.close(); }
  device(id?: string): { id: string; created: boolean } {
    if (id && /^[a-f0-9]{64}$/.test(id) && this.db.query('SELECT id FROM devices WHERE id=?').get(id)) return { id, created: false };
    const next = randomBytes(32).toString('hex');
    this.db.query('INSERT INTO devices(id) VALUES(?)').run(next);
    return { id: next, created: true };
  }
  read(owner: string, key: string): Document {
    const row = this.db.query('SELECT value,version FROM documents WHERE owner=? AND key=?').get(owner, key);
    return row ? { value: JSON.parse(row.value), version: row.version } : { value: null, version: 0 };
  }
  write(owner: string, key: string, value: unknown, baseVersion: number): Document | null {
    return this.db.transaction(() => {
      const previous = this.read(owner, key);
      if (previous.version !== baseVersion) return null;
      const version = baseVersion + 1;
      this.db.query('INSERT INTO documents(owner,key,value,version) VALUES(?,?,?,?) ON CONFLICT(owner,key) DO UPDATE SET value=excluded.value,version=excluded.version').run(owner, key, JSON.stringify(value), version);
      return { value, version };
    })();
  }
  uploads(owner: string) {
    return this.db.query('SELECT id,name,mime,created_at FROM uploads WHERE owner=? ORDER BY created_at DESC').all(owner).map(row => this.metadata(row));
  }
  private metadata(row: any) { return { id: row.id, name: row.name, type: row.mime.startsWith('image/') ? 'image' : 'video', url: `/api/device/uploads/${row.id}`, createdAt: row.created_at }; }
  upload(owner: string, name: string, mime: string, data: Buffer) {
    const usage = this.db.query('SELECT count(*) AS count,coalesce(sum(length(data)),0) AS bytes FROM uploads WHERE owner=?').get(owner);
    if (usage.count >= 100 || usage.bytes + data.length > 64 * 1024 * 1024) return null;
    const row = { id: randomUUID(), name, mime, created_at: new Date().toISOString() };
    this.db.query('INSERT INTO uploads(id,owner,name,mime,data,created_at) VALUES(?,?,?,?,?,?)').run(row.id, owner, name, mime, data, row.created_at);
    return this.metadata(row);
  }
  file(owner: string, id: string) { return this.db.query('SELECT mime,data FROM uploads WHERE owner=? AND id=?').get(owner, id); }
}

export function createDeviceRouter(store: DeviceStore) {
  const router = Router();
  router.use('/api/device', (req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.headers.origin) {
      try { if (new URL(req.headers.origin).host !== req.headers.host) return res.status(403).json({ error: 'Cross-origin access is not allowed' }); }
      catch { return res.status(403).json({ error: 'Invalid origin' }); }
    }
    const cookie = req.headers.cookie?.split(';').map(item => item.trim()).find(item => item.startsWith('kvtt_device='))?.slice('kvtt_device='.length);
    const identity = store.device(cookie);
    if (identity.created) res.cookie('kvtt_device', identity.id, { httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: 365 * 24 * 60 * 60 * 1000, path: '/' });
    res.locals.device = identity.id;
    next();
  });
  router.get('/api/device/documents/:key', (req, res) => {
    if (!Object.hasOwn(validators, req.params.key)) return res.status(404).json({ error: 'Unknown data key' });
    return res.json(store.read(res.locals.device, req.params.key));
  });
  router.get('/api/device/session', (_req, res) => res.json({ ready: true }));
  router.put('/api/device/documents/:key', (req, res) => {
    const key = req.params.key;
    if (!Object.hasOwn(validators, key)) return res.status(404).json({ error: 'Unknown data key' });
    if (!object(req.body) || !number(req.body.baseVersion) || !validators[key](req.body.value)) return res.status(400).json({ error: 'Invalid document' });
    const saved = store.write(res.locals.device, key, req.body.value, req.body.baseVersion);
    return saved ? res.json(saved) : res.status(409).json({ error: 'This data was changed in another window. Reload before saving.', ...store.read(res.locals.device, key) });
  });
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
  router.get('/api/device/uploads', (_req, res) => res.json(store.uploads(res.locals.device)));
  router.post('/api/device/uploads', raw({ type: allowed, limit: '8mb' }), (req, res) => {
    const mime = req.headers['content-type']?.split(';')[0].toLowerCase() || '';
    let name: string;
    try { name = decodeURIComponent(String(req.headers['x-file-name'] || '')); }
    catch { return res.status(400).json({ error: 'Invalid file name' }); }
    if (!allowed.includes(mime) || !Buffer.isBuffer(req.body) || !req.body.length || !name || name.length > 200 || /[\x00-\x1f]/.test(name)) return res.status(400).json({ error: 'Choose an image or video smaller than 8 MB.' });
    const uploaded = store.upload(res.locals.device, name, mime, req.body);
    return uploaded ? res.status(201).json(uploaded) : res.status(413).json({ error: 'The device library is full (64 MB or 100 files).' });
  });
  router.get('/api/device/uploads/:id', (req, res) => {
    const file = store.file(res.locals.device, req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    const data = Buffer.from(file.data);
    res.setHeader('Content-Type', file.mime);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Accept-Ranges', 'bytes');
    if (req.headers.range) {
      const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      const start = Number(range?.[1]);
      const end = range?.[2] ? Number(range[2]) : data.length - 1;
      if (!range || start > end || start >= data.length || end >= data.length) return res.status(416).setHeader('Content-Range', `bytes */${data.length}`).end();
      res.status(206).setHeader('Content-Range', `bytes ${start}-${end}/${data.length}`);
      return res.send(data.subarray(start, end + 1));
    }
    return res.send(data);
  });
  return router;
}
