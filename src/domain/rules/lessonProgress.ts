import type {
  DerivedLesson,
  DerivedTrackProgress,
  LessonCompletion,
  LessonKind,
} from '../entities/progress';

/** Default pass mark: 3 correct answers out of 4. */
export const DEFAULT_PASS_MARK = 3;

/** "hw", 0 -> "hw-1". */
export function lessonKeyFor(trackId: string, index: number): string {
  return `${trackId}-${index + 1}`;
}

/** A quiz is passed with at least `passMark` correct answers (never more than the number of questions). */
export function isQuizPassed(correct: number, total: number, passMark: number = DEFAULT_PASS_MARK): boolean {
  if (total <= 0) return false;
  return correct >= Math.min(passMark, total);
}

export function isLessonComplete(completions: readonly LessonCompletion[], lessonKey: string): boolean {
  return completions.some((c) => c.lessonKey === lessonKey);
}

/**
 * Adds a completion. Safe to call twice for the same lesson: the list never gets a duplicate,
 * and the best score is kept (the first completion date is kept too).
 */
export function recordCompletion(
  completions: readonly LessonCompletion[],
  next: LessonCompletion,
): LessonCompletion[] {
  const existing = completions.find((c) => c.lessonKey === next.lessonKey);
  if (!existing) return [...completions, next];
  if (next.correct <= existing.correct) return [...completions];
  return completions.map((c) =>
    c.lessonKey === next.lessonKey ? { ...c, correct: next.correct, total: next.total } : c,
  );
}

function lockMessageFor(finalIndex: number): string {
  return finalIndex <= 1
    ? 'Finish lesson 1 to unlock'
    : `Finish lessons 1 to ${finalIndex} to unlock`;
}

/**
 * Works out every lesson's status from the completions alone (nothing is hardcoded).
 * Rules:
 *  - a lesson is "done" when its quiz was passed;
 *  - a Final Lesson is "lock" until every lesson before it is done;
 *  - the first lesson that is not done and not locked is "cur"; the rest are "open".
 */
export function deriveTrackProgress(
  trackId: string,
  kinds: readonly LessonKind[],
  completions: readonly LessonCompletion[],
  opts?: { unlockFinal?: boolean },
): DerivedTrackProgress {
  let currentTaken = false;
  const lessons: DerivedLesson[] = kinds.map((kind, index) => {
    const key = lessonKeyFor(trackId, index);
    if (isLessonComplete(completions, key)) return { key, status: 'done' };

    const allBeforeDone = kinds
      .slice(0, index)
      .every((_, i) => isLessonComplete(completions, lessonKeyFor(trackId, i)));

    if (kind === 'final' && !allBeforeDone && !opts?.unlockFinal) {
      return { key, status: 'lock', lockMessage: lockMessageFor(index) };
    }
    if (!currentTaken) {
      currentTaken = true;
      return { key, status: 'cur' };
    }
    return { key, status: 'open' };
  });

  return {
    lessons,
    doneCount: lessons.filter((l) => l.status === 'done').length,
    total: lessons.length,
  };
}

export function isLessonUnlocked(
  trackId: string,
  kinds: readonly LessonKind[],
  completions: readonly LessonCompletion[],
  index: number,
): boolean {
  const lesson = deriveTrackProgress(trackId, kinds, completions).lessons[index];
  return !!lesson && lesson.status !== 'lock';
}
