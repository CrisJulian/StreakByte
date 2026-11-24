/** A lesson counts as complete once its quiz has been passed. */
export interface LessonCompletion {
  /** e.g. "hw-3" = Hardware track, lesson 3. */
  lessonKey: string;
  /** Best score so far. */
  correct: number;
  total: number;
  /** ISO date string of the first pass. */
  completedAt: string;
}

/** "learn" = normal lesson (Learn page, then quiz). "final" = Final Lesson (lab), locked until every lesson before it is complete. */
export type LessonKind = 'learn' | 'final';

/** done = quiz passed. cur = the next lesson to do. open = available. lock = a Final Lesson that is not unlocked yet. */
export type DerivedLessonStatus = 'done' | 'cur' | 'open' | 'lock';

export interface DerivedLesson {
  key: string;
  status: DerivedLessonStatus;
  /** Only set when status is "lock", e.g. "Finish lessons 1 to 5 to unlock". */
  lockMessage?: string;
}

export interface DerivedTrackProgress {
  lessons: DerivedLesson[];
  doneCount: number;
  total: number;
}
