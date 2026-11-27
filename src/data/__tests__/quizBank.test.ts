import { describe, expect, it } from 'vitest';
import { TRACKS } from '../curriculum';
import { QUIZ_BANK } from '../quizBank';

describe('quiz bank', () => {
  const all = Object.entries(QUIZ_BANK).flatMap(([key, qs]) => qs.map((q) => ({ key, q })));

  it('has a quiz for every lesson in every track', () => {
    for (const track of Object.values(TRACKS)) {
      track.lessons.forEach((_, idx) => {
        const key = `${track.id}-${idx + 1}`;
        expect((QUIZ_BANK[key] ?? []).length >= 4).toBe(true);
      });
    }
  });

  it('every question has exactly four distinct, non-empty choices and a valid answer', () => {
    for (const { q } of all) {
      expect(q.choices.length).toBe(4);
      expect(new Set(q.choices).size).toBe(4);
      expect(q.choices.every((c) => c.trim().length > 0)).toBe(true);
      expect([0, 1, 2, 3].includes(q.correctIndex)).toBe(true);
      expect(q.prompt.trim().length > 0).toBe(true);
      expect(q.explanation.trim().length > 0).toBe(true);
    }
  });

  it('never repeats a prompt inside one lesson', () => {
    for (const qs of Object.values(QUIZ_BANK)) {
      expect(new Set(qs.map((q) => q.prompt.toLowerCase())).size).toBe(qs.length);
    }
  });

  it('question ids are unique and match their lesson key', () => {
    const ids = all.map(({ q }) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const { key, q } of all) expect(q.id.startsWith(`${key}-`)).toBe(true);
  });
});
