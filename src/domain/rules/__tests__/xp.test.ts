import { describe, expect, it } from 'vitest';
import type { LessonCompletion } from '../../entities/progress';
import {
  calculateLessonXp,
  calculateTotalXp,
  calculateWeeklyXp,
  deriveLevel,
  deriveWeekStrip,
  effectiveStreak,
  localDayString,
  mergeLeaderboard,
} from '../xp';
import type { StreakState } from '../streak';

describe('xp & streak domain helpers', () => {
  it('computes localDayString and effectiveStreak (active vs broken)', () => {
    const today = localDayString(new Date(2026, 10, 25)); // 2026-11-25
    expect(today).toBe('2026-11-25');

    const active: StreakState = {
      current: 4,
      longest: 4,
      lastActiveDay: '2026-11-24',
      restoresLeft: 1,
    };
    expect(effectiveStreak(active, '2026-11-25')).toBe(4);

    const broken: StreakState = {
      current: 4,
      longest: 4,
      lastActiveDay: '2026-11-22',
      restoresLeft: 1,
    };
    expect(effectiveStreak(broken, '2026-11-25')).toBe(0);
  });

  it('derives week strip from streak and current weekday', () => {
    // 2026-11-25 is Wednesday (Mon=0, Tue=1, Wed=2)
    const wednesday = new Date(2026, 10, 25, 14, 0);
    expect(deriveWeekStrip({ current: 0, longest: 0, lastActiveDay: null, restoresLeft: 1 }, wednesday)).toEqual({
      filledCount: 0,
      todayIndex: 2,
      ariaLabel: 'Wednesday, no streak days yet this week',
    });

    expect(
      deriveWeekStrip({ current: 5, longest: 5, lastActiveDay: '2026-11-25', restoresLeft: 1 }, wednesday),
    ).toEqual({
      filledCount: 3,
      todayIndex: 2,
      ariaLabel: '3 active days this week',
    });

    expect(
      deriveWeekStrip({ current: 1, longest: 1, lastActiveDay: '2026-11-24', restoresLeft: 1 }, wednesday),
    ).toEqual({
      filledCount: 1,
      todayIndex: 2,
      ariaLabel: '1 active day this week',
    });
  });

  it('calculates proportional lesson XP, total XP, and weekly XP', () => {
    const xpMap = { 'hw-1': 110, 'hw-2': 110, 'net-1': 110 };
    const completions: LessonCompletion[] = [
      { lessonKey: 'hw-1', correct: 4, total: 4, completedAt: '2026-11-24T10:00:00' }, // Tue this week
      { lessonKey: 'hw-2', correct: 3, total: 4, completedAt: '2026-11-18T10:00:00' }, // last week
    ];

    expect(calculateLessonXp(completions[1], 110)).toBe(83);
    expect(calculateTotalXp(completions, xpMap, 120)).toBe(110 + 83 + 120);

    const wednesday = new Date(2026, 10, 25, 14, 0);
    expect(calculateWeeklyXp(completions, xpMap, wednesday, 50)).toBe(110 + 50);
  });

  it('derives levels starting at Level 1 Beginner', () => {
    expect(deriveLevel(0)).toEqual({
      level: 1,
      title: 'Beginner',
      currentLevelXp: 0,
      nextLevelXp: 300,
      xpToNext: 300,
      progressPct: 0,
    });
    expect(deriveLevel(650)).toMatchObject({
      level: 3,
      title: 'Builder',
      currentLevelXp: 50,
      xpToNext: 250,
    });
    expect(deriveLevel(2100)).toMatchObject({ level: 8, title: 'Architect' });
  });

  it('merges, deduplicates, and ranks leaderboard entries by selected period', () => {
    const remote = [
      { userId: 'u-1', displayName: 'Ana Cruz', weeklyXp: 400, allTimeXp: 900, streakDays: 3 },
      { userId: 'me', displayName: 'Old Name', weeklyXp: 100, allTimeXp: 200, streakDays: 1 },
    ];
    const currentUser = {
      userId: 'me',
      displayName: 'Ada Lovelace',
      avatarUrl: 'https://lh3.googleusercontent.com/ada',
      weeklyXp: 500,
      allTimeXp: 500,
      streakDays: 2,
    };

    const weekly = mergeLeaderboard(remote, currentUser, 'w');
    expect(weekly.map((r) => [r.userId, r.rank, r.xp, r.isYou])).toEqual([
      ['me', 1, 500, true],
      ['u-1', 2, 400, false],
    ]);

    const allTime = mergeLeaderboard(remote, currentUser, 'a');
    expect(allTime.map((r) => [r.userId, r.rank, r.xp, r.isYou])).toEqual([
      ['u-1', 1, 900, false],
      ['me', 2, 500, true],
    ]);
  });
});
