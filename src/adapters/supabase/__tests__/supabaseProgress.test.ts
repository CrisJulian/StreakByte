import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSession, mockFrom, mockRpc } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: { getSession: mockGetSession },
    from: mockFrom,
    rpc: mockRpc,
  },
}));

import { supabaseProgress } from '../supabaseProgress';
import type { LessonCompletion } from '../../../domain/entities/progress';

describe('supabaseProgress adapter', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('falls back to localProgress when unauthenticated (guest/offline)', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const completion: LessonCompletion = {
      lessonKey: 'hw-1',
      correct: 4,
      total: 4,
      completedAt: '2026-11-25T00:00:00.000Z',
    };
    await supabaseProgress.saveLessonCompletion(completion);
    await expect(supabaseProgress.loadLessonCompletions()).resolves.toEqual([completion]);
    await expect(supabaseProgress.loadLeaderboard('w')).resolves.toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns null from loadSettings for a brand-new authenticated user (triggers onboarding)', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u-1' } } } });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    await expect(supabaseProgress.loadSettings()).resolves.toBeNull();
  });

  it('merges local and remote lesson completions keeping best scores', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });
    await supabaseProgress.saveLessonCompletion({
      lessonKey: 'hw-1',
      correct: 3,
      total: 4,
      completedAt: '2026-11-24T00:00:00.000Z',
    });

    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u-1' } } } });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: vi.fn().mockResolvedValue({
          data: [
            {
              lesson_key: 'hw-1',
              correct: 4,
              total: 4,
              completed_at: '2026-11-25T00:00:00.000Z',
            },
            {
              lesson_key: 'net-1',
              correct: 3,
              total: 4,
              completed_at: '2026-11-25T01:00:00.000Z',
            },
          ],
          error: null,
        }),
      }),
    });

    const merged = await supabaseProgress.loadLessonCompletions();
    expect(merged).toHaveLength(2);
    expect(merged.find((c) => c.lessonKey === 'hw-1')?.correct).toBe(4);
    expect(merged.find((c) => c.lessonKey === 'net-1')?.correct).toBe(3);
  });

  it('loads and syncs leaderboard entries for authenticated users', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u-1' } } } });
    const upsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'leaderboard_entries') {
        return {
          upsert,
          select: () => ({
            order: () => ({
              limit: vi.fn().mockResolvedValue({
                data: [
                  {
                    user_id: 'u-1',
                    display_name: 'Ada Lovelace',
                    avatar_url: 'https://lh3.googleusercontent.com/ada',
                    weekly_xp: 220,
                    all_time_xp: 440,
                    streak_days: 3,
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    await supabaseProgress.syncLeaderboardEntry({
      displayName: 'Ada Lovelace',
      avatarUrl: 'https://lh3.googleusercontent.com/ada',
      weeklyXp: 220,
      allTimeXp: 440,
      streakDays: 3,
    });
    expect(upsert).toHaveBeenCalledTimes(1);

    const rows = await supabaseProgress.loadLeaderboard('w');
    expect(rows).toEqual([
      {
        userId: 'u-1',
        displayName: 'Ada Lovelace',
        avatarUrl: 'https://lh3.googleusercontent.com/ada',
        weeklyXp: 220,
        allTimeXp: 440,
        streakDays: 3,
      },
    ]);
  });

  it('calls restore_user_streak RPC when restoring signed-in user streak', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u-1' } } } });
    mockRpc.mockResolvedValue({
      data: [
        {
          streak_current: 5,
          streak_longest: 5,
          streak_last_active_day: '2026-11-25',
          streak_restores_left: 0,
        },
      ],
      error: null,
    });

    const restored = await supabaseProgress.restoreStreakServer('2026-11-25');
    expect(mockRpc).toHaveBeenCalledWith('restore_user_streak', { p_today: '2026-11-25' });
    expect(restored).toEqual({
      current: 5,
      longest: 5,
      lastActiveDay: '2026-11-25',
      restoresLeft: 0,
    });

    mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'Streak cannot be restored' } });
    await expect(supabaseProgress.restoreStreakServer('2026-11-25')).rejects.toThrow(
      'Streak cannot be restored',
    );
  });

  it('calls buy_streak_restore RPC and loads xp_spent for authenticated users', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u-1' } } } });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { xp_spent: 200 },
            error: null,
          }),
        }),
      }),
    });
    mockRpc.mockResolvedValue({
      data: [{ streak_restores_left: 2, xp_spent: 200 }],
      error: null,
    });

    await expect(supabaseProgress.loadXpSpent()).resolves.toBe(200);
    await expect(supabaseProgress.buyStreakRestore(300)).resolves.toMatchObject({
      streak: { restoresLeft: 2 },
      xpSpent: 200,
    });
    expect(mockRpc).toHaveBeenCalledWith('buy_streak_restore');

    mockRpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'You need at least 200 XP to buy a streak restore' },
    });
    await expect(supabaseProgress.buyStreakRestore(50)).rejects.toThrow(
      'You need at least 200 XP to buy a streak restore',
    );
  });

  it('creates, joins, and scopes leaderboard by classroom members', async () => {
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: 'u-1' } } } });
    const memberUpsert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'classrooms') {
        return {
          insert: (payload: { name: string; join_code: string; created_by: string }) => ({
            select: () => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'c-1', name: payload.name, join_code: payload.join_code, created_by: payload.created_by },
                error: null,
              }),
            }),
          }),
          select: () => ({
            eq: () => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { id: 'c-2', name: 'Net Study Group', join_code: 'NET123', created_by: 'u-2' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'classroom_members') {
        return {
          upsert: memberUpsert,
          select: () => ({
            eq: vi.fn().mockResolvedValue({
              data: [{ user_id: 'u-1' }, { user_id: 'u-2' }],
              error: null,
            }),
          }),
        };
      }
      if (table === 'leaderboard_entries') {
        return {
          select: () => ({
            in: vi.fn((col: string, ids: string[]) => {
              expect(col).toBe('user_id');
              expect(ids).toEqual(['u-1', 'u-2']);
              return {
                order: () => ({
                  limit: vi.fn().mockResolvedValue({
                    data: [
                      {
                        user_id: 'u-2',
                        display_name: 'Grace Hopper',
                        weekly_xp: 310,
                        all_time_xp: 600,
                        streak_days: 4,
                      },
                    ],
                    error: null,
                  }),
                }),
              };
            }),
          }),
        };
      }
      return {};
    });

    const created = await supabaseProgress.createClassroom('Hardware Club');
    expect(created.name).toBe('Hardware Club');
    expect(created.joinCode).toMatch(/^[A-Z0-9]{6}$/);

    const joined = await supabaseProgress.joinClassroom('net-123');
    expect(joined).toMatchObject({ id: 'c-2', name: 'Net Study Group', joinCode: 'NET123', memberCount: 2 });

    const scoped = await supabaseProgress.loadLeaderboard('w', 'c-2');
    expect(scoped).toEqual([
      {
        userId: 'u-2',
        displayName: 'Grace Hopper',
        weeklyXp: 310,
        allTimeXp: 600,
        streakDays: 4,
      },
    ]);
  });
});
