import { describe, expect, it } from 'vitest';
import {
  claimDailyQuest,
  createDailyActivity,
  deriveDailyQuests,
  ensureDailyActivity,
} from '../dailyQuests';

describe('dailyQuests rules', () => {
  it('resets activity on a new calendar day', () => {
    const yesterday = {
      day: '2026-11-24',
      quizzesPassed: 2,
      perfectQuizzes: 1,
      labsCompleted: 1,
      studyBuddyMessages: 3,
      claimedIds: ['daily-quiz'],
    };

    expect(ensureDailyActivity(yesterday, '2026-11-25')).toEqual(
      createDailyActivity('2026-11-25'),
    );
    expect(ensureDailyActivity(yesterday, '2026-11-24')).toEqual(yesterday);
  });

  it('derives quest completion and prevents claiming incomplete or already-claimed quests', () => {
    const base = createDailyActivity('2026-11-25');
    expect(deriveDailyQuests(base).every((q) => !q.completed && !q.claimed)).toBe(true);

    // Cannot claim incomplete quest
    expect(claimDailyQuest(base, 'daily-quiz').rewardXp).toBe(0);

    // Complete quiz + buddy
    const active = { ...base, quizzesPassed: 1, studyBuddyMessages: 1 };
    const quests = deriveDailyQuests(active);
    expect(quests.find((q) => q.id === 'daily-quiz')?.completed).toBe(true);
    expect(quests.find((q) => q.id === 'daily-lab')?.completed).toBe(false);
    expect(quests.find((q) => q.id === 'daily-buddy')?.completed).toBe(true);

    // Claim once -> +40 XP, second claim -> 0 XP
    const first = claimDailyQuest(active, 'daily-quiz');
    expect(first.rewardXp).toBe(40);
    expect(deriveDailyQuests(first.next).find((q) => q.id === 'daily-quiz')?.claimed).toBe(true);

    const second = claimDailyQuest(first.next, 'daily-quiz');
    expect(second.rewardXp).toBe(0);
  });
});
