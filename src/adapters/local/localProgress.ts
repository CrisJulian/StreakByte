import type { ProgressRepository } from '../../application/ports';
import { createInitialStreak, type StreakState } from '../../domain/rules/streak';
import type { ProfileSettings } from '../../types/streakbyte';
import { safeLocalStorage } from './storage';

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
};
