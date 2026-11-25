import type { ProgressRepository } from '../../application/ports';
import type { LessonCompletion } from '../../domain/entities/progress';
import { createInitialArenaStats } from '../../domain/rules/duel';
import { recordCompletion } from '../../domain/rules/lessonProgress';
import {
  buyRestore,
  canRestore,
  createInitialStreak,
  MAX_STREAK_RESTORES,
  restoreStreak,
  STREAK_RESTORE_COST_XP,
  type StreakState,
} from '../../domain/rules/streak';
import type { ProfileSettings } from '../../types/streakbyte';
import { safeLocalStorage } from './storage';

const COMPLETIONS_KEY = 'streakbyte-lesson-completions';
const STREAK_KEY = 'streakbyte-streak';
const SETTINGS_KEY = 'streakbyte-settings';
const LAB_BONUS_XP_KEY = 'streakbyte-lab-bonus-xp';
const XP_SPENT_KEY = 'streakbyte-xp-spent';

export function saveLocalXpSpent(xpSpent: number): void {
  const safe = Math.max(0, Math.floor(xpSpent));
  safeLocalStorage.set(XP_SPENT_KEY, String(safe));
}

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
  async restoreStreakServer(today) {
    const current = await this.loadStreak();
    if (!canRestore(current, today)) {
      throw new Error('Streak cannot be restored.');
    }
    const restored = restoreStreak(current, today);
    await this.saveStreak(restored);
    return restored;
  },
  async buyStreakRestore(availableXp) {
    const current = await this.loadStreak();
    if (current.restoresLeft >= MAX_STREAK_RESTORES) {
      throw new Error('You already hold the maximum number of streak restores.');
    }
    const { next, cost, bought } = buyRestore(current, availableXp);
    if (!bought) {
      throw new Error(`You need at least ${STREAK_RESTORE_COST_XP} XP to buy a streak restore.`);
    }
    const prevSpent = await this.loadXpSpent();
    const xpSpent = prevSpent + cost;
    await this.saveStreak(next);
    saveLocalXpSpent(xpSpent);
    return { streak: next, xpSpent };
  },
  async loadXpSpent() {
    const raw = safeLocalStorage.get(XP_SPENT_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  },
  async loadArenaStats() {
    return createInitialArenaStats();
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
  async loadMyClassrooms() {
    return [];
  },
  async createClassroom() {
    throw new Error('Sign in with Google to use classrooms.');
  },
  async joinClassroom() {
    throw new Error('Sign in with Google to use classrooms.');
  },
  async leaveClassroom() {
    // Local-only mode has no classrooms.
  },
  clearLocalCache() {
    safeLocalStorage.remove(COMPLETIONS_KEY);
    safeLocalStorage.remove(STREAK_KEY);
    safeLocalStorage.remove(SETTINGS_KEY);
    safeLocalStorage.remove(LAB_BONUS_XP_KEY);
    safeLocalStorage.remove(XP_SPENT_KEY);
  },
};
