import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../../entities/quiz';
import {
  comboTier,
  currentCombo,
  currentQuestion,
  isFinished,
  maxCombo,
  nextQuestion,
  parseLessonKey,
  quizXp,
  scoreQuiz,
  selectChoice,
  shuffleChoices,
  startQuiz,
  pickQuestions,
  QUIZ_LENGTH,
  submitAnswer,
} from '../quiz';

const bank: QuizQuestion[] = [
  { id: 'a', topic: 'Topic A', prompt: 'A?', choices: ['a0', 'a1', 'a2', 'a3'], correctIndex: 2, explanation: 'ea' },
  { id: 'b', topic: 'Topic B', prompt: 'B?', choices: ['b0', 'b1', 'b2', 'b3'], correctIndex: 0, explanation: 'eb' },
];
const noShuffle = () => 0.999999; // keeps the original order in Fisher–Yates

describe('quiz rules', () => {
  it('shuffling keeps the correct answer correct and keeps all four choices', () => {
    for (let seed = 0; seed < 50; seed += 1) {
      let x = seed + 1;
      const rng = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
      const out = shuffleChoices(bank[0], rng);
      expect(out.choices[out.correctIndex]).toBe('a2');
      expect([...out.choices].sort()).toEqual(['a0', 'a1', 'a2', 'a3']);
    }
  });

  it('cannot submit before choosing, and cannot change the choice after submitting', () => {
    let s = startQuiz('hw-3', bank, noShuffle);
    expect(submitAnswer(s)).toBe(s);
    s = submitAnswer(selectChoice(s, 2));
    expect(s.answers).toEqual([{ questionId: 'a', choiceIndex: 2, correct: true }]);
    expect(selectChoice(s, 0)).toBe(s);
    expect(submitAnswer(s)).toBe(s);
  });

  it('cannot skip a question without answering it', () => {
    const s = startQuiz('hw-3', bank, noShuffle);
    expect(nextQuestion(s)).toBe(s);
  });

  it('runs through all questions and scores them, listing the missed ones', () => {
    let s = startQuiz('hw-3', bank, noShuffle);
    s = nextQuestion(submitAnswer(selectChoice(s, 2))); // correct
    expect(currentQuestion(s)?.id).toBe('b');
    s = nextQuestion(submitAnswer(selectChoice(s, 3))); // wrong
    expect(isFinished(s)).toBe(true);

    const score = scoreQuiz(s);
    expect(score.correct).toBe(1);
    expect(score.total).toBe(2);
    expect(score.accuracyPct).toBe(50);
    expect(score.missed.map((m) => m.id)).toEqual(['b']);
  });

  it('scales XP by correct answers', () => {
    expect(quizXp(120, 4, 4)).toBe(120);
    expect(quizXp(120, 3, 4)).toBe(90);
    expect(quizXp(120, 0, 4)).toBe(0);
    expect(quizXp(120, 0, 0)).toBe(0);
  });

  it('parses lesson keys', () => {
    expect(parseLessonKey('hw-3')).toEqual({ trackId: 'hw', number: 3 });
    expect(parseLessonKey('net-12')).toEqual({ trackId: 'net', number: 12 });
    expect(parseLessonKey('nope')).toBeNull();
  });

  it('tracks currentCombo, maxCombo, and comboTier multipliers', () => {
    const answers = [
      { questionId: '1', choiceIndex: 0, correct: true },
      { questionId: '2', choiceIndex: 1, correct: true },
      { questionId: '3', choiceIndex: 2, correct: false },
      { questionId: '4', choiceIndex: 0, correct: true },
      { questionId: '5', choiceIndex: 1, correct: true },
      { questionId: '6', choiceIndex: 2, correct: true },
    ];
    expect(currentCombo(answers)).toBe(3);
    expect(maxCombo(answers)).toBe(3);
    expect(comboTier(1)).toEqual({ label: '', multiplier: 1, overclocked: false });
    expect(comboTier(2)).toEqual({ label: 'Combo 1.25x', multiplier: 1.25, overclocked: false });
    expect(comboTier(3)).toEqual({ label: 'Turbo 1.5x', multiplier: 1.5, overclocked: false });
    expect(comboTier(4)).toEqual({ label: 'OVERCLOCKED', multiplier: 2, overclocked: true });
  });
});

describe('pickQuestions', () => {
  const pool = Array.from({ length: 25 }, (_, i) => ({
    id: `x-${i}`,
    topic: 't',
    prompt: `p${i}`,
    choices: ['a', 'b', 'c', 'd'] as [string, string, string, string],
    correctIndex: 0 as const,
    explanation: 'e',
  }));

  it('draws 15 different questions and leaves the bank untouched', () => {
    const before = pool.map((q) => q.id);
    for (const r of [0, 0.37, 0.999999]) {
      const picked = pickQuestions(pool, QUIZ_LENGTH, () => r);
      expect(picked).toHaveLength(15);
      expect(new Set(picked.map((q) => q.id)).size).toBe(15);
    }
    expect(pool.map((q) => q.id)).toEqual(before);
  });

  it('can draw any question and varies between attempts', () => {
    const seen = new Set<string>();
    const draws = new Set<string>();
    for (let n = 0; n < 200; n += 1) {
      const ids = pickQuestions(pool, QUIZ_LENGTH).map((q) => q.id);
      ids.forEach((id) => seen.add(id));
      draws.add(ids.join());
    }
    expect(seen.size).toBe(pool.length);
    expect(draws.size).toBeGreaterThan(1);
  });

  it('returns the whole bank when it is smaller than a quiz', () => {
    expect(pickQuestions(pool.slice(0, 4), QUIZ_LENGTH)).toHaveLength(4);
  });
});
