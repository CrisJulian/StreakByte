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
      arenaDuelsFinished: 1,
      claimedIds: ['daily-quiz'],
    };

    expect(ensureDailyActivity(yesterday, '2026-11-25')).toEqual(
      createDailyActivity('2026-11-25'),
    );
    expect(ensureDailyActivity(yesterday, '2026-11-24')).toEqual(yesterday);

    // Backwards-compatible normalization when arenaDuelsFinished is missing from persisted state
    const legacy = {
      day: '2026-11-25',
      quizzesPassed: 1,
      perfectQuizzes: 0,
      labsCompleted: 0,
      studyBuddyMessages: 0,
      claimedIds: [],
    } as unknown as ReturnType<typeof createDailyActivity>;
    expect(ensureDailyActivity(legacy, '2026-11-25').arenaDuelsFinished).toBe(0);
  });

  it('derives quest completion and prevents claiming incomplete or already-claimed quests', () => {
    const base = createDailyActivity('2026-11-25');
    expect(deriveDailyQuests(base)).toHaveLength(4);
    expect(deriveDailyQuests(base).every((q) => !q.completed && !q.claimed)).toBe(true);

    // Cannot claim incomplete quest
    expect(claimDailyQuest(base, 'daily-quiz').rewardXp).toBe(0);
    expect(claimDailyQuest(base, 'daily-arena').rewardXp).toBe(0);

    // Complete quiz + buddy + arena
    const active = { ...base, quizzesPassed: 1, studyBuddyMessages: 1, arenaDuelsFinished: 1 };
    const quests = deriveDailyQuests(active);
    expect(quests.find((q) => q.id === 'daily-quiz')?.completed).toBe(true);
    expect(quests.find((q) => q.id === 'daily-lab')?.completed).toBe(false);
    expect(quests.find((q) => q.id === 'daily-arena')?.completed).toBe(true);
    expect(quests.find((q) => q.id === 'daily-buddy')?.completed).toBe(true);

    // Claim once -> +40 XP, second claim -> 0 XP
    const first = claimDailyQuest(active, 'daily-quiz');
    expect(first.rewardXp).toBe(40);
    expect(deriveDailyQuests(first.next).find((q) => q.id === 'daily-quiz')?.claimed).toBe(true);

    const second = claimDailyQuest(first.next, 'daily-quiz');
    expect(second.rewardXp).toBe(0);

    // Claim daily-arena once -> +50 XP, second claim -> 0 XP
    const arenaClaim = claimDailyQuest(first.next, 'daily-arena');
    expect(arenaClaim.rewardXp).toBe(50);
    expect(claimDailyQuest(arenaClaim.next, 'daily-arena').rewardXp).toBe(0);
  });
});
