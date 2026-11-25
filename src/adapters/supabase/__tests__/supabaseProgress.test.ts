import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSession, mockFrom } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: { getSession: mockGetSession },
    from: mockFrom,
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
});
