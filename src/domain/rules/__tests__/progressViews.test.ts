import { describe, expect, it } from 'vitest';
import type { LessonCompletion } from '../../entities/progress';
import { createInitialStreak } from '../streak';
import { deriveAchievements, deriveActivityHeatmap, derivePracticeItems } from '../progressViews';

describe('progressViews domain derivations', () => {
  it('returns 0 unlocked achievements, 0 practice items, and an empty heatmap for a new user', () => {
    const achievements = deriveAchievements({
      completions: [],
      streak: createInitialStreak(),
      totalXp: 0,
      hwTotal: 6,
      leaderboardRank: 1,
      today: '2026-11-25',
    });

    expect(achievements).toHaveLength(8);
    expect(achievements.filter((a) => a.unlocked)).toHaveLength(0);

    const practice = derivePracticeItems([], () => ({ title: 'Any', track: 'hw' }));
    expect(practice).toEqual([]);

    const heatmap = deriveActivityHeatmap([], new Date(2026, 10, 25));
    expect(heatmap).toHaveLength(7);
    expect(heatmap.every((row) => row.length === 5 && row.every((cell) => cell === ''))).toBe(true);
  });

  it('unlocks achievements, prioritizes missed practice items, and populates today heatmap cell', () => {
    const now = new Date(2026, 10, 25, 14, 0); // Wednesday
    const completions: LessonCompletion[] = [
      { lessonKey: 'hw-1', correct: 3, total: 4, completedAt: '2026-11-25T10:00:00' },
      { lessonKey: 'hw-3', correct: 4, total: 4, completedAt: '2026-11-25T11:00:00' },
      { lessonKey: 'net-3', correct: 4, total: 4, completedAt: '2026-11-24T09:00:00' },
    ];

    const achievements = deriveAchievements({
      completions,
      streak: { current: 5, longest: 5, lastActiveDay: '2026-11-25', restoresLeft: 1 },
      totalXp: 350,
      hwTotal: 6,
      leaderboardRank: 1,
      today: '2026-11-25',
    });

    const unlockedIds = achievements.filter((a) => a.unlocked).map((a) => a.id);
    expect(unlockedIds).toEqual([
      'first-step',
      '5-day-run',
      'ram-master',
      'top-of-board',
      'subnet-sage',
    ]);

    const practice = derivePracticeItems(
      completions,
      (key) =>
        key === 'hw-1'
          ? { title: 'Lesson 1: Inside the PC', track: 'hw' }
          : key === 'hw-3'
            ? { title: 'Lesson 3: Memory (RAM)', track: 'hw' }
            : { title: 'Lesson 3: Subnet masks', track: 'net' },
      now,
    );

    expect(practice.map((p) => [p.lessonKey, p.state, p.best])).toEqual([
      ['hw-1', 'need', 75],
      ['hw-3', 'ok', 100],
      ['net-3', 'ok', 100],
    ]);

    const heatmap = deriveActivityHeatmap(completions, now);
    // Wednesday = row 2, current week = col 4 -> 2 completions ('l2')
    // Tuesday = row 1, current week = col 4 -> 1 completion ('l1')
    expect(heatmap[2][4]).toBe('l2');
    expect(heatmap[1][4]).toBe('l1');
  });
});
