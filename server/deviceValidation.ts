import { BADGES_LIST } from '../src/constants/badgesData.ts';
import { findEnglishLesson } from '../src/lib/englishCatalog.ts';
import { validGardenProgress } from '../src/lib/gardenProgress.ts';

export const object = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
export const number = (value: unknown, max = 1_000_000_000) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
const text = (value: unknown, max: number) => typeof value === 'string' && value.length <= max;
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value));
const statsKeys = ['mathCount', 'mathStreak', 'speechCount', 'speechStreak', 'streakCount', 'bestStreak', 'scienceCount', 'englishCount', 'artCount', 'physicalCount', 'socialCount'];
export const validators: Record<string, (value: unknown) => boolean> = {
  stars: value => number(value),
  'game-stars': value => number(value),
  'english-garden-progress': validGardenProgress,
  'learning-stats': value => object(value) && statsKeys.every(key => number(value[key])),
  badges: value => Array.isArray(value) && value.length <= BADGES_LIST.length && value.every(id => BADGES_LIST.some(badge => badge.id === id)),
  emotions: value => Array.isArray(value) && value.length <= 20 && value.every(item => object(item) && ['vui', 'buon', 'tuc-gian'].includes(item.emotion) && date(item.date) && text(item.feedback, 2000)),
  'study-time': value => object(value) && /^\d{4}-\d{2}-\d{2}$/.test(value.day) && number(value.seconds, 86400),
  'daily-activity': value => object(value) && /^\d{4}-\d{2}-\d{2}$/.test(value.day) && number(value.count, 100000) && Array.isArray(value.items) && value.items.length <= 5000 && value.items.every(item => text(item, 300)),
  settings: value => object(value) && [15, 20, 30].includes(value.sessionMinutes) && number(value.dailyActivityTarget, 20) && value.dailyActivityTarget >= 1,
  'family-posts': value => Array.isArray(value) && value.length <= 100 && value.every(item => object(item) && text(item.id, 100) && item.id.length > 0 && text(item.content, 2000) && item.content.trim() && typeof item.liked === 'boolean' && Array.isArray(item.comments) && item.comments.length <= 100 && item.comments.every(comment => text(comment, 1000) && comment.trim())),
  'teacher-notes': value => Array.isArray(value) && value.length <= 100 && value.every(item => object(item) && text(item.id, 100) && item.id.length > 0 && text(item.content, 4000) && item.content.trim() && date(item.date)),
  'teacher-preparation': value => object(value) && ['3-4', '4-5', '5-6'].includes(value.age) && text(value.activity, 200) && text(value.plan, 30000) && text(value.selfStudy, 30000),
  'english-stars': value => object(value) && Object.keys(value).length <= 5000 && Object.entries(value).every(([key, score]) => key.length <= 200 && number(score, 3)),
  'english-progress': value => object(value) && Object.keys(value).length <= 500 && Object.entries(value).every(([key, item]) => {
    const lesson = findEnglishLesson(key);
    return lesson && object(item) && item.lessonId === key && item.ageBand === lesson.age && date(item.openedAt) && (item.completedAt === null || date(item.completedAt));
  }),
};
export const allowedMedia = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];

