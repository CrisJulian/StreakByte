import { beforeEach, describe, expect, it } from 'vitest';
import { localProgress } from '../../adapters/local/localProgress';
import { useStreakByteStore } from '../useStreakByteStore';

const store = () => useStreakByteStore.getState();

/** Answers every question of the running quiz. `wrong` of them are answered incorrectly. */
function finishQuiz(wrong: number) {
  const total = store().quiz!.questions.length;
  for (let i = 0; i < total; i += 1) {
    const quiz = store().quiz!;
    const q = quiz.questions[quiz.index];
    store().selectQuizChoice(i < wrong ? (q.correctIndex + 1) % 4 : q.correctIndex);
    store().submitQuizAnswer();
    store().nextQuizQuestion();
  }
}

function completeLesson(key: string) {
  store().syncFromHash(`#quiz/${key}`);
  finishQuiz(0);
}

describe('Learn pages in the store', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    store().resetAll();
  });

  it('opens a Learn page from the hash and is safe to sync twice', () => {
    store().syncFromHash('#learn/hw-3');
    expect(store().view).toBe('learn');
    expect(store().learnKey).toBe('hw-3');
    store().syncFromHash('#learn/hw-3');
    expect(store().view).toBe('learn');
    expect(store().learnKey).toBe('hw-3');
  });

  it('falls back to the curriculum for an unknown Learn page', () => {
    store().syncFromHash('#learn/nope-9');
    expect(store().view).toBe('curriculum');
  });

  it('sends a locked Final Lesson back to the curriculum (Learn page and quiz)', () => {
    store().syncFromHash('#learn/hw-6');
    expect(store().view).toBe('curriculum');
    expect(store().learnKey).toBeNull();

    store().syncFromHash('#quiz/net-5');
    expect(store().view).toBe('curriculum');
    expect(store().quiz).toBeNull();
  });
});

describe('quiz results and lesson completion', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    store().resetAll();
  });

  it('passing at 12 of 15 completes the lesson and saves it offline', async () => {
    store().syncFromHash('#quiz/hw-1');
    finishQuiz(3);
    expect(store().completions.map((c) => c.lessonKey)).toEqual(['hw-1']);
    expect(store().completions[0].correct).toBe(12);
    expect(store().completion?.subtitle).toContain('Lesson complete!');

    const saved = await localProgress.loadLessonCompletions();
    expect(saved.map((c) => c.lessonKey)).toEqual(['hw-1']);
  });

  it('11 of 15 does not complete the lesson', async () => {
    store().syncFromHash('#quiz/hw-1');
    finishQuiz(4);
    expect(store().completions).toHaveLength(0);
    expect(store().completion?.subtitle).toContain('You need 12 correct');
    expect(await localProgress.loadLessonCompletions()).toHaveLength(0);
  });

  it('passing the same lesson twice keeps one record', async () => {
    completeLesson('hw-1');
    completeLesson('hw-1');
    expect(store().completions).toHaveLength(1);
    expect(await localProgress.loadLessonCompletions()).toHaveLength(1);
  });

  it('queues the completion for the backend to sync later', async () => {
    completeLesson('net-1');
    const pending = JSON.parse(localStorage.getItem('streakbyte-sync-queue') ?? '[]') as { type: string }[];
    expect(pending.some((op) => op.type === 'complete-lesson')).toBe(true);
  });

  it('loads saved progress back (after a reload) so lessons stay unlocked offline', async () => {
    for (const n of [1, 2, 3, 4, 5]) completeLesson(`hw-${n}`);
    store().resetAll(); // simulates a fresh app start: memory is empty, storage is not
    expect(store().completions).toHaveLength(0);

    await store().loadCompletions();
    expect(store().completions).toHaveLength(5);

    store().syncFromHash('#learn/hw-6');
    expect(store().view).toBe('learn');
    expect(store().learnKey).toBe('hw-6');
  });

  it('unlocks the Networking Final Lesson after lessons 1 to 4', () => {
    for (const n of [1, 2, 3]) completeLesson(`net-${n}`);
    store().syncFromHash('#learn/net-5');
    expect(store().view).toBe('curriculum');

    completeLesson('net-4');
    store().syncFromHash('#learn/net-5');
    expect(store().view).toBe('learn');
  });

  it('points to the Final Lesson once lesson 5 is done and everything before it is complete', () => {
    for (const n of [1, 2, 3, 4]) completeLesson(`hw-${n}`);
    completeLesson('hw-5');
    expect(store().completion?.next[0]).toBe('Final Lesson: Build a PC');
    expect(store().completion?.next[1]).not.toContain('to unlock');
  });

  it('says what is still needed when the Final Lesson is still locked', () => {
    completeLesson('hw-5'); // lessons 1 to 4 are not done yet
    expect(store().completion?.next[0]).toBe('Final Lesson: Build a PC');
    expect(store().completion?.next[1]).toBe('Finish lessons 1 to 5 to unlock');
  });
});
