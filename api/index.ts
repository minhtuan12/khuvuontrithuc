import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createAIRouter } from '../server/aiRoutes.ts';
import { ENGLISH_AGES, ENGLISH_LESSONS_BY_AGE, findEnglishLesson } from '../src/lib/englishCatalog.ts';

const app = express();
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Vercel rewrites API paths to this entrypoint while preserving the route in a query.
  if (typeof req.query.path === 'string') req.url = `/api/${req.query.path}`;
  next();
});
app.use(express.json({ limit: '4mb' }));
const key = process.env.GEMINI_API_KEY;
const ai = key && !/^(MY_|YOUR_)/i.test(key) ? new GoogleGenAI({ apiKey: key }) : null;
app.get('/api/english/catalog', (_req, res) => res.json({ version: 1, ages: ENGLISH_AGES, lessonsByAge: ENGLISH_LESSONS_BY_AGE }));
app.get('/api/english/lesson/:id', (req, res) => {
  const found = findEnglishLesson(req.params.id);
  return found ? res.json({ version: 1, age: found.age, lesson: found.lesson }) : res.status(404).json({ error: 'Lesson not found' });
});
app.use(createAIRouter(ai));
app.use('/api', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = error?.type === 'entity.too.large' ? 413 : error instanceof SyntaxError ? 400 : 500;
  res.status(status).json({ error: status === 413 ? 'Request is too large' : status === 400 ? 'Invalid JSON body' : 'API request failed' });
});
export default app;
