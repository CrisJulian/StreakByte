import { describe, expect, it } from 'vitest';
import { ARENA_SCENARIO_BY_ID, ARENA_SCENARIOS } from '../../../data/arenaScenarios';
import { ALL_QUIZ_QUESTIONS, getQuizQuestionById } from '../../../data/quizBank';
import {
  ARENA_GENERATOR_KEYS,
  generateArenaDuelTokens,
  mulberry32,
  resolveArenaQuestion,
  shuffleChoices,
} from '../arenaQuestions';

describe('arena question engine', () => {
  it('keeps 24 unique Arena-only scenarios separate from curriculum quizBank', () => {
    expect(ARENA_SCENARIOS).toHaveLength(24);
    expect(ARENA_SCENARIOS.filter((s) => s.track === 'hw')).toHaveLength(12);
    expect(ARENA_SCENARIOS.filter((s) => s.track === 'net')).toHaveLength(12);

    const quizIds = new Set(ALL_QUIZ_QUESTIONS.map((q) => q.id));
    for (const s of ARENA_SCENARIOS) {
      expect(quizIds.has(s.id)).toBe(false);
      expect(new Set(s.choices).size).toBe(4);
      expect(s.correctIndex).toBeGreaterThanOrEqual(0);
      expect(s.correctIndex).toBeLessThanOrEqual(3);
    }
  });

  it('generates 8 track-scoped tokens combining procedural generators and Arena scenarios', () => {
    const hwTokens = generateArenaDuelTokens('hw', ARENA_SCENARIOS, 8, mulberry32(101));
    expect(hwTokens).toHaveLength(8);
    expect(hwTokens.filter((t) => t.startsWith('gen:hw-'))).toHaveLength(4);
    expect(hwTokens.filter((t) => t.startsWith('arena:arena-hw-'))).toHaveLength(4);

    const netTokens = generateArenaDuelTokens('net', ARENA_SCENARIOS, 8, mulberry32(202));
    expect(netTokens).toHaveLength(8);
    expect(netTokens.filter((t) => t.startsWith('gen:net-'))).toHaveLength(4);
    expect(netTokens.filter((t) => t.startsWith('arena:arena-net-'))).toHaveLength(4);

    const mixedTokens = generateArenaDuelTokens('mixed', ARENA_SCENARIOS, 8, mulberry32(303));
    expect(mixedTokens).toHaveLength(8);
    expect(mixedTokens.filter((t) => t.startsWith('gen:'))).toHaveLength(4);
    expect(mixedTokens.filter((t) => t.startsWith('arena:'))).toHaveLength(4);
  });

  it('resolves every procedural generator deterministically with 4 unique choices', () => {
    const allGenKeys = [...ARENA_GENERATOR_KEYS.hw, ...ARENA_GENERATOR_KEYS.net];
    for (const key of allGenKeys) {
      for (const seed of [12345, 54321, 98765]) {
        const token = `gen:${key}:${seed}`;
        const a = resolveArenaQuestion(token, ARENA_SCENARIO_BY_ID);
        const b = resolveArenaQuestion(token, ARENA_SCENARIO_BY_ID);
        expect(a).toEqual(b);
        expect(a?.kind).toBe('generated');
        expect(new Set(a?.choices).size).toBe(4);
        expect(a?.correctIndex).toBeGreaterThanOrEqual(0);
        expect(a?.correctIndex).toBeLessThanOrEqual(3);
      }
    }
  });

  it('preserves the correct answer text when shuffling scenario choices and falls back cleanly', () => {
    const original = ARENA_SCENARIOS[0];
    const shuffled = shuffleChoices(original, mulberry32(77777));
    expect(shuffled.choices[shuffled.correctIndex]).toBe(original.choices[original.correctIndex]);

    const resolvedScenario = resolveArenaQuestion(
      `arena:${original.id}:77777`,
      ARENA_SCENARIO_BY_ID,
      getQuizQuestionById,
    );
    expect(resolvedScenario?.kind).toBe('scenario');
    expect(resolvedScenario?.choices[resolvedScenario.correctIndex]).toBe(
      original.choices[original.correctIndex],
    );

    const fallback = resolveArenaQuestion('hw-1-1', ARENA_SCENARIO_BY_ID, getQuizQuestionById);
    expect(fallback?.kind).toBe('quiz');
    expect(fallback?.id).toBe('hw-1-1');
  });
});
