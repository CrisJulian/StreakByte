import type { ProgressRepository } from '../../application/ports';
import type { LessonCompletion } from '../../domain/entities/progress';
import { recordCompletion } from '../../domain/rules/lessonProgress';
import { createInitialStreak, type StreakState } from '../../domain/rules/streak';
import type { ProfileSettings } from '../../types/streakbyte';
import { safeLocalStorage } from './storage';

const COMPLETIONS_KEY = 'streakbyte-lesson-completions';

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
    const raw = safeLocalStorage.get('streakbyte-streak');
    return raw ? (JSON.parse(raw) as StreakState) : createInitialStreak();
  },
  async saveStreak(streak) {
    safeLocalStorage.set('streakbyte-streak', JSON.stringify(streak));
  },
  async loadSettings() {
    const raw = safeLocalStorage.get('streakbyte-settings');
    return raw ? (JSON.parse(raw) as ProfileSettings) : null;
  },
  async saveSettings(settings) {
    safeLocalStorage.set('streakbyte-settings', JSON.stringify(settings));
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
};
