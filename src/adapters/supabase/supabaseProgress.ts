import type { LeaderboardEntry, ProgressRepository } from '../../application/ports';
import type { LessonCompletion } from '../../domain/entities/progress';
import { recordCompletion } from '../../domain/rules/lessonProgress';
import type { TrackId } from '../../types/streakbyte';
import { localProgress } from '../local/localProgress';
import { supabase } from './supabaseClient';

async function getSignedInUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

function normalizeTracks(raw: unknown): TrackId[] {
  if (!Array.isArray(raw)) return ['hw', 'net'];
  const valid = raw.filter((t): t is TrackId => t === 'hw' || t === 'net');
  return valid.length > 0 ? Array.from(new Set(valid)) : ['hw', 'net'];
}

export const supabaseProgress: ProgressRepository = {
  async loadStreak() {
    const local = await localProgress.loadStreak();
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return local;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('streak_current, streak_longest, streak_last_active_day, streak_restores_left')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return local;
    const remote = {
      current: data.streak_current ?? 0,
      longest: data.streak_longest ?? 0,
      lastActiveDay: data.streak_last_active_day ?? null,
      restoresLeft: data.streak_restores_left ?? 1,
    };
    await localProgress.saveStreak(remote);
    return remote;
  },

  async saveStreak(streak) {
    await localProgress.saveStreak(streak);
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return;

    await supabase.from('user_profiles').upsert(
      {
        user_id: userId,
        streak_current: streak.current,
        streak_longest: streak.longest,
        streak_last_active_day: streak.lastActiveDay,
        streak_restores_left: streak.restoresLeft,
      },
      { onConflict: 'user_id' },
    );
  },

  async loadLabBonusXp() {
    const local = await localProgress.loadLabBonusXp();
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return local;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('lab_bonus_xp')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return local;
    const xp = Math.max(0, Number(data.lab_bonus_xp) || 0);
    await localProgress.saveLabBonusXp(xp);
    return xp;
  },

  async saveLabBonusXp(xp) {
    const safeXp = Math.max(0, Math.floor(xp));
    await localProgress.saveLabBonusXp(safeXp);
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return;

    await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, lab_bonus_xp: safeXp }, { onConflict: 'user_id' });
  },

  async loadSettings() {
    const local = await localProgress.loadSettings();
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return local;

    const { data, error } = await supabase
      .from('user_profiles')
      .select(
        'display_name, selected_tracks, onboarding_completed, daily_goal, daily_reminder, sound_effects, hints_by_default',
      )
      .eq('user_id', userId)
      .maybeSingle();

    if (error) return local;
    if (!data) return null;

    const merged = {
      displayName: data.display_name || local?.displayName || 'Learner',
      email: local?.email ?? '',
      selectedTracks: normalizeTracks(data.selected_tracks),
      onboardingCompleted: Boolean(data.onboarding_completed),
      dailyGoal: (data.daily_goal === '10' ? '10' : '5') as '5' | '10',
      dailyReminder: data.daily_reminder ?? true,
      soundEffects: data.sound_effects ?? true,
      hintsByDefault: data.hints_by_default ?? true,
      geminiApiKey: local?.geminiApiKey ?? '',
    };
    await localProgress.saveSettings(merged);
    return merged;
  },

  async saveSettings(settings) {
    await localProgress.saveSettings(settings);
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return;

    await supabase.from('user_profiles').upsert(
      {
        user_id: userId,
        display_name: settings.displayName.trim() || 'Learner',
        selected_tracks: normalizeTracks(settings.selectedTracks),
        onboarding_completed: settings.onboardingCompleted,
        daily_goal: settings.dailyGoal,
        daily_reminder: settings.dailyReminder,
        sound_effects: settings.soundEffects,
        hints_by_default: settings.hintsByDefault,
      },
      { onConflict: 'user_id' },
    );
  },

  async loadLessonCompletions() {
    const local = await localProgress.loadLessonCompletions();
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return local;

    const { data, error } = await supabase
      .from('lesson_completions')
      .select('lesson_key, correct, total, completed_at')
      .eq('user_id', userId);

    if (error || !data) return local;

    const remote: LessonCompletion[] = data.map((row) => ({
      lessonKey: String(row.lesson_key),
      correct: Number(row.correct),
      total: Number(row.total),
      completedAt: String(row.completed_at),
    }));

    const merged = [...local, ...remote].reduce<LessonCompletion[]>(
      (acc, item) => recordCompletion(acc, item),
      [],
    );
    for (const item of merged) {
      await localProgress.saveLessonCompletion(item);
    }
    return merged;
  },

  async saveLessonCompletion(completion) {
    await localProgress.saveLessonCompletion(completion);
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return;

    const { data: existing } = await supabase
      .from('lesson_completions')
      .select('correct')
      .eq('user_id', userId)
      .eq('lesson_key', completion.lessonKey)
      .maybeSingle();

    if (existing && Number(existing.correct) >= completion.correct) {
      return;
    }

    await supabase.from('lesson_completions').upsert(
      {
        user_id: userId,
        lesson_key: completion.lessonKey,
        correct: completion.correct,
        total: completion.total,
        completed_at: completion.completedAt,
      },
      { onConflict: 'user_id,lesson_key' },
    );
  },

  async loadLeaderboard(period) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return [];

    const orderCol = period === 'a' ? 'all_time_xp' : 'weekly_xp';
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('user_id, display_name, avatar_url, weekly_xp, all_time_xp, streak_days')
      .order(orderCol, { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data.map(
      (row): LeaderboardEntry => ({
        userId: String(row.user_id),
        displayName: String(row.display_name || 'Learner'),
        ...(typeof row.avatar_url === 'string' && row.avatar_url.startsWith('https://')
          ? { avatarUrl: row.avatar_url }
          : {}),
        weeklyXp: Math.max(0, Number(row.weekly_xp) || 0),
        allTimeXp: Math.max(0, Number(row.all_time_xp) || 0),
        streakDays: Math.max(0, Number(row.streak_days) || 0),
      }),
    );
  },

  async syncLeaderboardEntry(entry) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return;

    await supabase.from('leaderboard_entries').upsert(
      {
        user_id: userId,
        display_name: entry.displayName.trim() || 'Learner',
        avatar_url:
          entry.avatarUrl && entry.avatarUrl.startsWith('https://') ? entry.avatarUrl : null,
        weekly_xp: Math.max(0, Math.floor(entry.weeklyXp)),
        all_time_xp: Math.max(0, Math.floor(entry.allTimeXp)),
        streak_days: Math.max(0, Math.floor(entry.streakDays)),
      },
      { onConflict: 'user_id' },
    );
  },

  clearLocalCache() {
    localProgress.clearLocalCache();
  },
};
