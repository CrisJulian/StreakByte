/**
 * Streak rules. Dates are ISO day strings (YYYY-MM-DD) in the learner's local time,
 * passed in by the caller so these stay pure and testable.
 */
export interface StreakState {
  current: number;
  longest: number;
  /** Last day with qualifying activity (a lesson or a practice review). */
  lastActiveDay: string | null;
  /** Restores available. Replenished by the backend, never by the client. */
  restoresLeft: number;
}

export const MAX_RESTORE_GAP_DAYS = 2;

export function createInitialStreak(): StreakState {
  return { current: 0, longest: 0, lastActiveDay: null, restoresLeft: 1 };
}

export function dayDiff(fromDay: string, toDay: string): number {
  const a = Date.UTC(+fromDay.slice(0, 4), +fromDay.slice(5, 7) - 1, +fromDay.slice(8, 10));
  const b = Date.UTC(+toDay.slice(0, 4), +toDay.slice(5, 7) - 1, +toDay.slice(8, 10));
  return Math.round((b - a) / 86_400_000);
}

/** Record qualifying activity on `today`. */
export function recordActivity(s: StreakState, today: string): StreakState {
  if (s.lastActiveDay === today) return s;
  const gap = s.lastActiveDay === null ? null : dayDiff(s.lastActiveDay, today);
  const current = gap === 1 ? s.current + 1 : 1;
  return { ...s, current, longest: Math.max(s.longest, current), lastActiveDay: today };
}

/** True when the streak has already broken as of `today`. */
export function isBroken(s: StreakState, today: string): boolean {
  return s.lastActiveDay !== null && dayDiff(s.lastActiveDay, today) > 1;
}

/** A broken streak can be restored if the gap is small and a restore is left. */
export function canRestore(s: StreakState, today: string): boolean {
  if (!isBroken(s, today) || s.restoresLeft <= 0) return false;
  return dayDiff(s.lastActiveDay as string, today) - 1 <= MAX_RESTORE_GAP_DAYS;
}

/**
 * Restore: spends one restore and counts today as the continuation of the streak.
 * The authoritative check must also run server-side (Supabase) to prevent cheating.
 */
export function restoreStreak(s: StreakState, today: string): StreakState {
  if (!canRestore(s, today)) return s;
  const current = s.current + 1;
  return {
    current,
    longest: Math.max(s.longest, current),
    lastActiveDay: today,
    restoresLeft: s.restoresLeft - 1,
  };
}
