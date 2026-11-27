import type {
  DerivedLesson,
  DerivedTrackProgress,
  LessonCompletion,
  LessonKind,
} from '../entities/progress';

/** Default pass mark: 12 correct answers out of 15 (80%). */
export const DEFAULT_PASS_MARK = 12;

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

/** True when `next` is a higher percentage than `prev`. Attempts can have different question counts. */
export function isBetterScore(
  next: Pick<LessonCompletion, 'correct' | 'total'>,
  prev: Pick<LessonCompletion, 'correct' | 'total'>,
): boolean {
  return next.correct * prev.total > prev.correct * next.total;
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
  if (!isBetterScore(next, existing)) return [...completions];
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

export type CompletedSectionsMap = Record<string, number[]>;

const LESSON_KEY_RE = /^[a-z]+-\d+$/;

function sanitizeSectionIndices(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const unique = new Set<number>();
  for (const val of raw) {
    if (typeof val === 'number' && Number.isInteger(val) && val >= 0) {
      unique.add(val);
    }
  }
  return Array.from(unique).sort((a, b) => a - b);
}

/** Normalizes arbitrary JSON/input into a clean lessonKey -> sorted unique non-negative section indices map. */
export function normalizeCompletedSections(raw: unknown): CompletedSectionsMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const result: CompletedSectionsMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!LESSON_KEY_RE.test(key)) continue;
    const indices = sanitizeSectionIndices(value);
    if (indices.length > 0) result[key] = indices;
  }
  return result;
}

/** Monotonic union merge so a section checked on any device is never lost. */
export function mergeCompletedSections(
  a: CompletedSectionsMap,
  b: CompletedSectionsMap,
): CompletedSectionsMap {
  const result: CompletedSectionsMap = {};
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (!LESSON_KEY_RE.test(key)) continue;
    const merged = sanitizeSectionIndices([...(a[key] ?? []), ...(b[key] ?? [])]);
    if (merged.length > 0) result[key] = merged;
  }
  return result;
}

/** Records a completed section index for a lesson (no-op returning same ref if invalid or already recorded). */
export function recordSectionCompletion(
  current: CompletedSectionsMap,
  lessonKey: string,
  sectionIndex: number,
): CompletedSectionsMap {
  if (!LESSON_KEY_RE.test(lessonKey) || !Number.isInteger(sectionIndex) || sectionIndex < 0) {
    return current;
  }
  const existing = current[lessonKey] ?? [];
  if (existing.includes(sectionIndex)) return current;
  return {
    ...current,
    [lessonKey]: [...existing, sectionIndex].sort((a, b) => a - b),
  };
}

/** Counts consecutive section indices starting from 0 present in `completed` up to `totalSteps`. */
export function getCompletedSectionPrefix(
  completed: readonly number[] | undefined,
  totalSteps: number,
): number {
  const set = new Set(completed ?? []);
  let prefix = 0;
  while (prefix < totalSteps && set.has(prefix)) prefix += 1;
  return prefix;
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
