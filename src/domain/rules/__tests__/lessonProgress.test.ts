import { describe, expect, it } from 'vitest';
import type { LessonCompletion, LessonKind } from '../../entities/progress';
import {
  deriveTrackProgress,
  DEFAULT_PASS_MARK,
  isLessonComplete,
  isLessonUnlocked,
  isQuizPassed,
  lessonKeyFor,
  recordCompletion,
} from '../lessonProgress';

const done = (key: string, correct = 4): LessonCompletion => ({
  lessonKey: key,
  correct,
  total: 4,
  completedAt: '2026-11-24T00:00:00.000Z',
});

const HW: LessonKind[] = ['learn', 'learn', 'learn', 'learn', 'learn', 'final'];
const NET: LessonKind[] = ['learn', 'learn', 'learn', 'learn', 'final'];

describe('quiz pass mark', () => {
  it('defaults to 3 of 4', () => {
    expect(DEFAULT_PASS_MARK).toBe(3);
    expect(isQuizPassed(3, 4)).toBe(true);
    expect(isQuizPassed(4, 4)).toBe(true);
    expect(isQuizPassed(2, 4)).toBe(false);
    expect(isQuizPassed(0, 4)).toBe(false);
  });

  it('never passes an empty quiz and never needs more than the question count', () => {
    expect(isQuizPassed(0, 0)).toBe(false);
    expect(isQuizPassed(2, 2)).toBe(true);
    expect(isQuizPassed(3, 4, 4)).toBe(false);
  });
});

describe('recordCompletion', () => {
  it('adds a lesson once and is idempotent', () => {
    const once = recordCompletion([], done('hw-1', 3));
    const twice = recordCompletion(once, done('hw-1', 3));
    expect(twice).toHaveLength(1);
    expect(isLessonComplete(twice, 'hw-1')).toBe(true);
  });

  it('keeps the best score and the first date', () => {
    const first = { ...done('hw-1', 3), completedAt: 'first' };
    const better = { ...done('hw-1', 4), completedAt: 'second' };
    const list = recordCompletion([first], better);
    expect(list).toHaveLength(1);
    expect(list[0].correct).toBe(4);
    expect(list[0].completedAt).toBe('first');
    expect(recordCompletion(list, done('hw-1', 3))[0].correct).toBe(4);
  });

  it('does not change the input list', () => {
    const input: LessonCompletion[] = [];
    recordCompletion(input, done('hw-1'));
    expect(input).toHaveLength(0);
  });
});

describe('deriveTrackProgress', () => {
  it('starts with lesson 1 current, the rest open and the Final Lesson locked', () => {
    const p = deriveTrackProgress('hw', HW, []);
    expect(p.lessons.map((l) => l.status)).toEqual(['cur', 'open', 'open', 'open', 'open', 'lock']);
    expect(p.lessons[5].lockMessage).toBe('Finish lessons 1 to 5 to unlock');
    expect(p.doneCount).toBe(0);
    expect(p.total).toBe(6);
  });

  it('uses the right message for the networking track', () => {
    const p = deriveTrackProgress('net', NET, []);
    expect(p.lessons[4].status).toBe('lock');
    expect(p.lessons[4].lockMessage).toBe('Finish lessons 1 to 4 to unlock');
  });

  it('stays locked while even one earlier lesson is missing', () => {
    const completions = [1, 2, 3, 5].map((n) => done(`hw-${n}`));
    const p = deriveTrackProgress('hw', HW, completions);
    expect(p.lessons[3].status).toBe('cur');
    expect(p.lessons[5].status).toBe('lock');
    expect(isLessonUnlocked('hw', HW, completions, 5)).toBe(false);
  });

  it('unlocks the Final Lesson when lessons 1 to 5 are done, and it becomes current', () => {
    const completions = [1, 2, 3, 4, 5].map((n) => done(`hw-${n}`));
    const p = deriveTrackProgress('hw', HW, completions);
    expect(p.lessons.map((l) => l.status)).toEqual(['done', 'done', 'done', 'done', 'done', 'cur']);
    expect(p.lessons[5].lockMessage).toBeUndefined();
    expect(isLessonUnlocked('hw', HW, completions, 5)).toBe(true);
  });

  it('leaves Final Lessons open when unlockFinal is enabled', () => {
    const p = deriveTrackProgress('hw', HW, [], { unlockFinal: true });
    expect(p.lessons.map((l) => l.status)).toEqual(['cur', 'open', 'open', 'open', 'open', 'open']);
    expect(p.lessons[5].lockMessage).toBeUndefined();
  });

  it('counts done lessons for any order of completion', () => {
    const p = deriveTrackProgress('net', NET, [done('net-2'), done('net-1')]);
    expect(p.doneCount).toBe(2);
    expect(p.lessons[2].status).toBe('cur');
  });

  it('ignores completions from another track', () => {
    const p = deriveTrackProgress('net', NET, [done('hw-1'), done('hw-2')]);
    expect(p.doneCount).toBe(0);
  });

  it('builds lesson keys the same way the quiz bank does', () => {
    expect(lessonKeyFor('hw', 0)).toBe('hw-1');
    expect(lessonKeyFor('net', 4)).toBe('net-5');
  });
});
