import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../../entities/quiz';
import {
  currentQuestion,
  isFinished,
  nextQuestion,
  parseLessonKey,
  quizXp,
  scoreQuiz,
  selectChoice,
  shuffleChoices,
  startQuiz,
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
});
