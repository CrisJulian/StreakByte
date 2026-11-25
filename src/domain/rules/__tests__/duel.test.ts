import { describe, expect, it } from 'vitest';
import { ALL_QUIZ_QUESTIONS, getQuizQuestionById } from '../../../data/quizBank';
import {
  calculateStreakBountyXp,
  calculateStreakSpeedBonusMs,
  canAffordWager,
  canEnterStreakWager,
  determineDuelWinner,
  DUEL_QUESTION_COUNT,
  DUEL_WAGER_OPTIONS,
  formatDuelTime,
  pickDuelQuestionIds,
  resolveLoserStreakAfterLoss,
  shouldAwardStreakShield,
} from '../duel';

describe('duel domain rules', () => {
  it('picks 8 (1 Byte) track-filtered question IDs from the quiz bank without duplicates', () => {
    const allIds = ALL_QUIZ_QUESTIONS.map((q) => q.id);
    expect(DUEL_QUESTION_COUNT).toBe(8);

    const hwIds = pickDuelQuestionIds(allIds, 'hw', DUEL_QUESTION_COUNT, () => 0.42);
    expect(hwIds).toHaveLength(8);
    expect(new Set(hwIds).size).toBe(8);
    expect(hwIds.every((id) => id.startsWith('hw-'))).toBe(true);

    const netIds = pickDuelQuestionIds(allIds, 'net', DUEL_QUESTION_COUNT, () => 0.17);
    expect(netIds).toHaveLength(8);
    expect(netIds.every((id) => id.startsWith('net-'))).toBe(true);

    const mixedIds = pickDuelQuestionIds(allIds, 'mixed', DUEL_QUESTION_COUNT, () => 0.73);
    expect(mixedIds).toHaveLength(8);
    expect(mixedIds.every((id) => Boolean(getQuizQuestionById(id)))).toBe(true);
  });

  it('ranks accuracy first and uses fastest time as tiebreaker', () => {
    expect(
      determineDuelWinner(
        { id: 'host', score: 7, timeMs: 30_000 },
        { id: 'guest', score: 6, timeMs: 8_000 },
      ),
    ).toBe('host');

    expect(
      determineDuelWinner(
        { id: 'host', score: 8, timeMs: 14_200 },
        { id: 'guest', score: 8, timeMs: 11_800 },
      ),
    ).toBe('guest');

    expect(
      determineDuelWinner(
        { id: 'host', score: 8, timeMs: 12_000 },
        { id: 'guest', score: 8, timeMs: 12_000 },
      ),
    ).toBeNull();
  });

  it('calculates answer-streak speed bonuses, breaker bounties, and win-streak shields', () => {
    expect(calculateStreakSpeedBonusMs(2)).toBe(0);
    expect(calculateStreakSpeedBonusMs(3)).toBe(500);
    expect(calculateStreakSpeedBonusMs(6)).toBe(1000);

    expect(calculateStreakBountyXp(1)).toBe(0);
    expect(calculateStreakBountyXp(2)).toBe(50);
    expect(calculateStreakBountyXp(4)).toBe(100);

    expect(shouldAwardStreakShield(1, 0, 0)).toBe(false);
    expect(shouldAwardStreakShield(3, 0, 0)).toBe(true);
    expect(shouldAwardStreakShield(1, 2, 1)).toBe(true);
    expect(shouldAwardStreakShield(3, 4, 3)).toBe(false);

    expect(resolveLoserStreakAfterLoss(4, 1)).toEqual({
      nextWinStreak: 4,
      nextShields: 0,
      shieldConsumed: true,
    });
    expect(resolveLoserStreakAfterLoss(4, 0)).toEqual({
      nextWinStreak: 0,
      nextShields: 0,
      shieldConsumed: false,
    });
  });

  it('validates XP/streak wagers and formats elapsed milliseconds', () => {
    expect(DUEL_WAGER_OPTIONS).toEqual([0, 100, 200]);
    expect(canAffordWager(0, 0)).toBe(true);
    expect(canAffordWager(99, 100)).toBe(false);
    expect(canAffordWager(100, 100)).toBe(true);
    expect(canEnterStreakWager(0)).toBe(false);
    expect(canEnterStreakWager(1)).toBe(true);
    expect(formatDuelTime(14_260)).toBe('14.3s');
    expect(formatDuelTime(null)).toBe('—');
  });
});
