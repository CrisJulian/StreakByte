import type { ClassroomSummary, LeaderboardEntry, ProgressRepository } from '../../application/ports';
import type { LessonCompletion } from '../../domain/entities/progress';
import { generateJoinCode, isValidJoinCode, normalizeJoinCode } from '../../domain/rules/classroom';
import { createInitialArenaStats } from '../../domain/rules/duel';
import type { ArenaStats } from '../../domain/rules/duel';
import { recordCompletion } from '../../domain/rules/lessonProgress';
import type { StreakState } from '../../domain/rules/streak';
import type { TrackId } from '../../types/streakbyte';
import { localProgress, saveLocalXpSpent } from '../local/localProgress';
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
    const remote: StreakState = {
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

    const { error } = await supabase.from('user_profiles').upsert(
      {
        user_id: userId,
        streak_current: streak.current,
        streak_longest: streak.longest,
        streak_last_active_day: streak.lastActiveDay,
        streak_restores_left: streak.restoresLeft,
      },
      { onConflict: 'user_id' },
    );
    if (error) throw new Error(error.message);
  },

  async restoreStreakServer(today) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) {
      return localProgress.restoreStreakServer(today);
    }

    const { data, error } = await supabase.rpc('restore_user_streak', { p_today: today });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) {
      throw new Error(error?.message || 'Streak could not be restored.');
    }

    const restored: StreakState = {
      current: Number(row.streak_current) || 0,
      longest: Number(row.streak_longest) || 0,
      lastActiveDay: row.streak_last_active_day ? String(row.streak_last_active_day) : today,
      restoresLeft: Math.max(0, Number(row.streak_restores_left) || 0),
    };
    await localProgress.saveStreak(restored);
    return restored;
  },

  async buyStreakRestore(availableXp) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) {
      return localProgress.buyStreakRestore(availableXp);
    }

    const { data, error } = await supabase.rpc('buy_streak_restore');
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) {
      throw new Error(error?.message || 'Could not buy streak restore.');
    }

    const currentStreak = await localProgress.loadStreak();
    const nextStreak: StreakState = {
      ...currentStreak,
      restoresLeft: Math.max(0, Number(row.streak_restores_left) || 0),
    };
    const xpSpent = Math.max(0, Number(row.xp_spent) || 0);
    await localProgress.saveStreak(nextStreak);
    saveLocalXpSpent(xpSpent);
    return { streak: nextStreak, xpSpent };
  },

  async loadXpSpent() {
    const local = await localProgress.loadXpSpent();
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return local;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('xp_spent')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return local;
    const spent = Math.max(0, Number(data.xp_spent) || 0);
    saveLocalXpSpent(spent);
    return spent;
  },

  async saveXpSpent(xpSpent) {
    const safeSpent = Math.max(0, Math.floor(xpSpent));
    saveLocalXpSpent(safeSpent);
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return;

    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, xp_spent: safeSpent }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
  },

  async loadArenaStats(): Promise<ArenaStats> {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return createInitialArenaStats();

    const { data, error } = await supabase
      .from('user_profiles')
      .select('duel_wins, duel_losses, duel_win_streak, duel_best_streak, streak_shields')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return createInitialArenaStats();
    return {
      wins: Math.max(0, Number(data.duel_wins) || 0),
      losses: Math.max(0, Number(data.duel_losses) || 0),
      winStreak: Math.max(0, Number(data.duel_win_streak) || 0),
      bestStreak: Math.max(0, Number(data.duel_best_streak) || 0),
      streakShields: Math.min(3, Math.max(0, Number(data.streak_shields) || 0)),
    };
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

    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, lab_bonus_xp: safeXp }, { onConflict: 'user_id' });
    if (error) throw new Error(error.message);
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

    const { error } = await supabase.from('user_profiles').upsert(
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
    if (error) throw new Error(error.message);
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

    const { error } = await supabase.from('lesson_completions').upsert(
      {
        user_id: userId,
        lesson_key: completion.lessonKey,
        correct: completion.correct,
        total: completion.total,
        completed_at: completion.completedAt,
      },
      { onConflict: 'user_id,lesson_key' },
    );
    if (error) throw new Error(error.message);
  },

  async loadLeaderboard(period, classroomId) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return [];

    const orderCol = period === 'a' ? 'all_time_xp' : 'weekly_xp';
    let memberIds: string[] | null = null;

    if (classroomId) {
      const { data: members, error: memberErr } = await supabase
        .from('classroom_members')
        .select('user_id')
        .eq('classroom_id', classroomId);
      if (memberErr || !members || members.length === 0) return [];
      memberIds = members.map((m) => String(m.user_id));
    }

    const baseQuery = supabase
      .from('leaderboard_entries')
      .select(
        'user_id, display_name, avatar_url, weekly_xp, all_time_xp, streak_days, duel_wins, duel_losses, duel_win_streak',
      );
    const scopedQuery = memberIds ? baseQuery.in('user_id', memberIds) : baseQuery;
    const { data, error } = await scopedQuery.order(orderCol, { ascending: false }).limit(50);

    if (error || !data) return [];

    return data.map(
      (row): LeaderboardEntry => {
        const duelWins = Math.max(0, Number(row.duel_wins) || 0);
        const duelLosses = Math.max(0, Number(row.duel_losses) || 0);
        const duelWinStreak = Math.max(0, Number(row.duel_win_streak) || 0);
        return {
          userId: String(row.user_id),
          displayName: String(row.display_name || 'Learner'),
          ...(typeof row.avatar_url === 'string' && row.avatar_url.startsWith('https://')
            ? { avatarUrl: row.avatar_url }
            : {}),
          weeklyXp: Math.max(0, Number(row.weekly_xp) || 0),
          allTimeXp: Math.max(0, Number(row.all_time_xp) || 0),
          streakDays: Math.max(0, Number(row.streak_days) || 0),
          ...(duelWins > 0 ? { duelWins } : {}),
          ...(duelLosses > 0 ? { duelLosses } : {}),
          ...(duelWinStreak > 0 ? { duelWinStreak } : {}),
        };
      },
    );
  },

  async syncLeaderboardEntry(entry) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return;

    const { error } = await supabase.from('leaderboard_entries').upsert(
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
    if (error) throw new Error(error.message);
  },

  async loadMyClassrooms() {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return [];

    const { data: myRows, error } = await supabase
      .from('classroom_members')
      .select('classroom_id')
      .eq('user_id', userId);
    if (error || !myRows || myRows.length === 0) return [];

    const classroomIds = myRows.map((r) => String(r.classroom_id));
    const [{ data: rooms, error: roomsErr }, { data: allMembers }] = await Promise.all([
      supabase
        .from('classrooms')
        .select('id, name, join_code, created_by')
        .in('id', classroomIds)
        .order('created_at', { ascending: true }),
      supabase.from('classroom_members').select('classroom_id').in('classroom_id', classroomIds),
    ]);

    if (roomsErr || !rooms) return [];

    const counts = new Map<string, number>();
    for (const row of allMembers ?? []) {
      const id = String(row.classroom_id);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    return rooms.map(
      (room): ClassroomSummary => ({
        id: String(room.id),
        name: String(room.name),
        joinCode: String(room.join_code),
        createdBy: String(room.created_by),
        memberCount: counts.get(String(room.id)) ?? 1,
      }),
    );
  },

  async createClassroom(name) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) {
      throw new Error('Sign in with Google to use classrooms.');
    }

    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 60) {
      throw new Error('Classroom name must be 2–60 characters.');
    }

    let created: { id: string; name: string; join_code: string; created_by: string } | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const joinCode = generateJoinCode();
      const { data, error } = await supabase
        .from('classrooms')
        .insert({ name: trimmed, join_code: joinCode, created_by: userId })
        .select('id, name, join_code, created_by')
        .single();

      if (!error && data) {
        created = {
          id: String(data.id),
          name: String(data.name),
          join_code: String(data.join_code),
          created_by: String(data.created_by),
        };
        break;
      }
      if (error?.code !== '23505') {
        throw new Error(error?.message || 'Could not create classroom.');
      }
    }

    if (!created) {
      throw new Error('Could not create classroom. Please try again.');
    }

    const { error: memberErr } = await supabase
      .from('classroom_members')
      .upsert({ classroom_id: created.id, user_id: userId }, { onConflict: 'classroom_id,user_id' });
    if (memberErr) throw new Error(memberErr.message);

    return {
      id: created.id,
      name: created.name,
      joinCode: created.join_code,
      createdBy: created.created_by,
      memberCount: 1,
    };
  },

  async joinClassroom(rawCode) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) {
      throw new Error('Sign in with Google to use classrooms.');
    }

    const code = normalizeJoinCode(rawCode);
    if (!isValidJoinCode(code)) {
      throw new Error('Enter a 6-character classroom code.');
    }

    const { data: room, error: findErr } = await supabase
      .from('classrooms')
      .select('id, name, join_code, created_by')
      .eq('join_code', code)
      .maybeSingle();

    if (findErr || !room) {
      throw new Error('No classroom found with that join code.');
    }

    const { error: joinErr } = await supabase
      .from('classroom_members')
      .upsert(
        { classroom_id: String(room.id), user_id: userId },
        { onConflict: 'classroom_id,user_id' },
      );
    if (joinErr) throw new Error(joinErr.message);

    const { data: members } = await supabase
      .from('classroom_members')
      .select('user_id')
      .eq('classroom_id', String(room.id));

    return {
      id: String(room.id),
      name: String(room.name),
      joinCode: String(room.join_code),
      createdBy: String(room.created_by),
      memberCount: members?.length ?? 1,
    };
  },

  async leaveClassroom(classroomId) {
    const userId = await getSignedInUserId();
    if (!userId || !supabase) return;

    const { error } = await supabase
      .from('classroom_members')
      .delete()
      .eq('classroom_id', classroomId)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  },

  clearLocalCache() {
    localProgress.clearLocalCache();
  },
};
