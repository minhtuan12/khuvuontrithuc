import {
  CORE_ENGLISH_TOPICS,
  ENGLISH_DATA_3_4,
  ENGLISH_DATA_4_5,
  ENGLISH_DATA_5_6,
  type EnglishLessonTheme,
} from '../constants/englishData';

export type EnglishAge = '3-4' | '4-5' | '5-6';

export const ENGLISH_AGES: { id: EnglishAge; title: string; subtitle: string }[] = [
  { id: '3-4', title: 'Mầm nhỏ', subtitle: 'Làm quen · 3–4 tuổi' },
  { id: '4-5', title: 'Mầm khám phá', subtitle: 'Khám phá · 4–5 tuổi' },
  { id: '5-6', title: 'Mầm tự tin', subtitle: 'Tự tin · 5–6 tuổi' },
];

export const ENGLISH_LESSONS_BY_AGE: Record<EnglishAge, EnglishLessonTheme[]> = {
  '3-4': ENGLISH_DATA_3_4,
  '4-5': ENGLISH_DATA_4_5,
  '5-6': ENGLISH_DATA_5_6,
};

export interface EnglishRoadmapGroup {
  id: string;
  name: string;
  icon: string;
  lessons: EnglishLessonTheme[];
}

const extraTopics: Record<string, { id: string; name: string; icon: string }> = {
  greetings: { id: 'greetings', name: 'Chào hỏi & giao tiếp', icon: '👋' },
  self: { id: 'self', name: 'Bản thân & cơ thể', icon: '🧒' },
  body: { id: 'self', name: 'Bản thân & cơ thể', icon: '🧒' },
  'intro-self': { id: 'self', name: 'Bản thân & cơ thể', icon: '🧒' },
  numbers: { id: 'numbers-shapes', name: 'Số & hình dạng', icon: '🔢' },
  shapes: { id: 'numbers-shapes', name: 'Số & hình dạng', icon: '🔢' },
  toys: { id: 'toys', name: 'Đồ chơi', icon: '🧸' },
  food: { id: 'food', name: 'Món ăn & hoa quả', icon: '🍎' },
  'weather-clothes': { id: 'weather-clothes', name: 'Thời tiết & trang phục', icon: '🌤️' },
  commands: { id: 'commands', name: 'Chỉ dẫn & hành động', icon: '🙌' },
  'phonics-abc': { id: 'phonics-abc', name: 'Chữ cái & âm', icon: '🔤' },
};

/** Presentation-only grouping. The original lesson objects and IDs stay intact. */
export function getEnglishRoadmap(age: EnglishAge): EnglishRoadmapGroup[] {
  const lessons = ENGLISH_LESSONS_BY_AGE[age];
  const groups: EnglishRoadmapGroup[] = [];
  for (const lesson of lessons) {
    const prefix = lesson.id.replace(/-\d{2}$/, '');
    const topic = CORE_ENGLISH_TOPICS.find(item => item.id === lesson.categoryKey) || extraTopics[prefix] || { id: prefix, name: lesson.name, icon: lesson.icon };
    let group = groups.find(item => item.id === topic.id);
    if (!group) {
      group = { id: topic.id, name: topic.name, icon: topic.icon, lessons: [] };
      groups.push(group);
    }
    group.lessons.push(lesson);
  }
  return groups;
}

export function findEnglishLesson(id: string): { age: EnglishAge; lesson: EnglishLessonTheme } | undefined {
  for (const age of ENGLISH_AGES) {
    const lesson = ENGLISH_LESSONS_BY_AGE[age.id].find(item => item.id === id);
    if (lesson) return { age: age.id, lesson };
  }
  return undefined;
}
