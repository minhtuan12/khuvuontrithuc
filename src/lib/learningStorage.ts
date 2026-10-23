import { learnerStorage as localStorage } from './learnerStorage';
import { BADGES_LIST, type LearningProgressStats } from '../constants/badgesData';

const DEFAULT_STATS: LearningProgressStats = {
  mathCount: 0,
  mathStreak: 0,
  speechCount: 0,
  speechStreak: 0,
  streakCount: 0,
  bestStreak: 0,
  scienceCount: 0,
  englishCount: 0,
  artCount: 0,
  physicalCount: 0,
  socialCount: 0,
};

function readCache(key: string): unknown {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? null : JSON.parse(saved);
  } catch {
    return null;
  }
}

export function readLearningStats(): LearningProgressStats {
  const stats = { ...DEFAULT_STATS };
  const saved = readCache('mamnon_learning_stats');
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return stats;
  const record = saved as Record<string, unknown>;
  for (const key of Object.keys(stats) as (keyof LearningProgressStats)[]) {
    const value = record[key];
    if (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) {
      stats[key] = value;
    }
  }
  return stats;
}

export function readUnlockedBadges(): string[] {
  const saved = readCache('mamnon_unlocked_badges');
  if (!Array.isArray(saved)) return [];
  const knownIds = new Set(BADGES_LIST.map(badge => badge.id));
  return [...new Set(saved.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))];
}
