import { learnerStorage as localStorage } from './learnerStorage';
export const EMOTIONS = [
  { id: 'vui', label: 'Vui vẻ', emoji: '😊', description: 'Con thấy thật vui!', color: 'sun', feedback: 'Mầm vui cùng con! Mình cùng mang nụ cười này vào những khám phá hôm nay nhé.' },
  { id: 'buon', label: 'Buồn bã', emoji: '😢', description: 'Con muốn được ôm.', color: 'sky', feedback: 'Buồn một chút cũng không sao. Con có thể kể với bố mẹ hoặc cô giáo, rồi cùng Mầm nghe một câu chuyện nhẹ nhàng nhé.' },
  { id: 'tuc-gian', label: 'Tức giận', emoji: '😠', description: 'Con cần bình tĩnh lại.', color: 'coral', feedback: 'Mầm ở đây cùng con. Mình thử hít vào chậm, thở ra nhẹ, rồi kể cho người lớn con tin tưởng nghe nhé.' },
] as const;

export type EmotionId = typeof EMOTIONS[number]['id'];
export interface EmotionRecord { emotion: string; date: string; feedback: string }

export function readEmotionHistory(): EmotionRecord[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('kvtt.emotions.v1') || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((record): record is EmotionRecord => !!record && typeof record === 'object' &&
      EMOTIONS.some(item => item.id === record.emotion) && typeof record.date === 'string' &&
      Number.isFinite(Date.parse(record.date)) && typeof record.feedback === 'string').slice(0, 20);
  } catch { return []; }
}

export function readStoredNumber(key: string, fallback = 0): number {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
  } catch { return fallback; }
}

export function localDay(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function getTodayStudySeconds(): number {
  try {
    const value = JSON.parse(localStorage.getItem('kvtt.study-time.v1') || 'null');
    return value?.day === localDay() && Number.isFinite(value.seconds) && value.seconds >= 0 ? Math.floor(value.seconds) : 0;
  } catch { return 0; }
}
