import type { ProgressRepository } from '../../application/ports';
import type { LessonCompletion } from '../../domain/entities/progress';
import { recordCompletion } from '../../domain/rules/lessonProgress';
import { createInitialStreak, type StreakState } from '../../domain/rules/streak';
import type { ProfileSettings } from '../../types/streakbyte';
import { safeLocalStorage } from './storage';

const COMPLETIONS_KEY = 'streakbyte-lesson-completions';
const STREAK_KEY = 'streakbyte-streak';
const SETTINGS_KEY = 'streakbyte-settings';
const LAB_BONUS_XP_KEY = 'streakbyte-lab-bonus-xp';

function readCompletions(): LessonCompletion[] {
  const raw = safeLocalStorage.get(COMPLETIONS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LessonCompletion[]) : [];
  } catch {
    return [];
  }
}

export const localProgress: ProgressRepository = {
  async loadStreak() {
    const raw = safeLocalStorage.get(STREAK_KEY);
    if (!raw) return createInitialStreak();
    try {
      return JSON.parse(raw) as StreakState;
    } catch {
      return createInitialStreak();
    }
  },
  async saveStreak(streak) {
    safeLocalStorage.set(STREAK_KEY, JSON.stringify(streak));
  },
  async loadLabBonusXp() {
    const raw = safeLocalStorage.get(LAB_BONUS_XP_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  },
  async saveLabBonusXp(xp) {
    const safeXp = Math.max(0, Math.floor(xp));
    safeLocalStorage.set(LAB_BONUS_XP_KEY, String(safeXp));
  },
  async loadSettings() {
    const raw = safeLocalStorage.get(SETTINGS_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ProfileSettings;
    } catch {
      return null;
    }
  },
  async saveSettings(settings) {
    safeLocalStorage.set(SETTINGS_KEY, JSON.stringify(settings));
  },
  async loadLessonCompletions() {
    return readCompletions();
  },
  async saveLessonCompletion(completion) {
    safeLocalStorage.set(
      COMPLETIONS_KEY,
      JSON.stringify(recordCompletion(readCompletions(), completion)),
    );
  },
  async loadLeaderboard() {
    return [];
  },
  async syncLeaderboardEntry() {
    // Local-only mode has no shared class leaderboard.
  },
  clearLocalCache() {
    safeLocalStorage.remove(COMPLETIONS_KEY);
    safeLocalStorage.remove(STREAK_KEY);
    safeLocalStorage.remove(SETTINGS_KEY);
    safeLocalStorage.remove(LAB_BONUS_XP_KEY);
  },
};
