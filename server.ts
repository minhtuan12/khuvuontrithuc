import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { mkdirSync } from 'node:fs';
import { createAIRouter } from './server/aiRoutes';
import { createDeviceRouter, DeviceStore } from './server/deviceRoutes';
import { AccountService } from './server/accountService';
import { SqliteAccountRepository } from './server/sqliteAccounts';
import { createAccountRouter } from './server/accountRoutes';
import { createTeacherRouter } from './server/teacherRoutes';
import { SqliteTeacherStore, SqliteTeacherFiles } from './server/sqliteTeacherStore';
import { ENGLISH_AGES, ENGLISH_LESSONS_BY_AGE, findEnglishLesson } from './src/lib/englishCatalog';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = process.env.GEMINI_API_KEY && !/^MY_|^YOUR_/i.test(process.env.GEMINI_API_KEY) ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Versioned, read-only catalog for clients that need the current lesson model.
app.get('/api/english/catalog', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ version: 1, ages: ENGLISH_AGES, lessonsByAge: ENGLISH_LESSONS_BY_AGE });
});

app.get('/api/english/lesson/:id', (req, res) => {
  const found = findEnglishLesson(req.params.id);
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!found) return res.status(404).json({ error: 'Lesson not found' });
  return res.json({ version: 1, age: found.age, lesson: found.lesson });
});

// Persistent data is scoped by a server-issued device cookie, not by a shared global row.
const dataDirectory = path.resolve(process.env.KVTT_DATA_DIR || path.join(__dirname, 'data'));
mkdirSync(dataDirectory, { recursive: true });
const deviceStore = new DeviceStore(path.join(dataDirectory, 'app.sqlite'));
const accountService = new AccountService(new SqliteAccountRepository(path.join(dataDirectory, 'app.sqlite')));
app.use(createAccountRouter(accountService));
app.use(createAIRouter(ai, accountService));
app.use(createTeacherRouter({accounts:accountService,store:new SqliteTeacherStore(path.join(dataDirectory,'app.sqlite')),files:new SqliteTeacherFiles(path.join(dataDirectory,'app.sqlite'))}));
app.use(createDeviceRouter(deviceStore, accountService));
app.use('/api', (_req, res) => { res.status(404).json({ error: 'API endpoint not found' }); });
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error?.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : 500;
  res.status(status).json({ error: status === 413 ? 'Request is too large' : status === 400 ? 'Invalid JSON body' : 'Could not save or load data' });
});

// Vite middleware or static serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
