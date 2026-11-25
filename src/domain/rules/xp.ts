import type { LessonCompletion } from '../entities/progress';
import { isBroken, type StreakState } from './streak';

export const XP_PER_LEVEL = 300;

/** Local calendar day formatted as YYYY-MM-DD. */
export function localDayString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Active streak count as of `today`; resets to 0 once broken. */
export function effectiveStreak(streak: StreakState, today: string): number {
  return isBroken(streak, today) ? 0 : streak.current;
}

const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

/** Derives the 7-day Monday..Sunday strip state from the user's real streak. */
export function deriveWeekStrip(
  streak: StreakState,
  now: Date = new Date(),
): { filledCount: number; todayIndex: number; ariaLabel: string } {
  const today = localDayString(now);
  // JS getDay(): 0 = Sun, 1 = Mon .. 6 = Sat -> Mon = 0 .. Sun = 6
  const todayIndex = (now.getDay() + 6) % 7;
  const activeDays = effectiveStreak(streak, today);

  if (activeDays <= 0) {
    return {
      filledCount: 0,
      todayIndex,
      ariaLabel: `${WEEKDAY_NAMES[todayIndex]}, no streak days yet this week`,
    };
  }

  const activeToday = streak.lastActiveDay === today;
  const maxWeekSlots = activeToday ? todayIndex + 1 : todayIndex;
  const filledCount = Math.min(activeDays, Math.max(0, maxWeekSlots));

  return {
    filledCount,
    todayIndex,
    ariaLabel: `${filledCount} active ${filledCount === 1 ? 'day' : 'days'} this week`,
  };
}

/** Proportional XP earned for a lesson completion. */
export function calculateLessonXp(completion: LessonCompletion, lessonXp: number): number {
  if (completion.total <= 0 || lessonXp <= 0) return 0;
  return Math.round((lessonXp * completion.correct) / completion.total);
}

/** Total all-time XP from completed lessons plus any lab bonus XP. */
export function calculateTotalXp(
  completions: readonly LessonCompletion[],
  lessonXpByKey: Readonly<Record<string, number>>,
  bonusXp = 0,
): number {
  const lessonTotal = completions.reduce(
    (sum, item) => sum + calculateLessonXp(item, lessonXpByKey[item.lessonKey] ?? 0),
    0,
  );
  return lessonTotal + Math.max(0, bonusXp);
}

/** Start of the current week (Monday 00:00:00 local time). */
function startOfLocalWeek(now: Date): number {
  const mondayOffset = (now.getDay() + 6) % 7;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  return start.getTime();
}

/** XP earned since Monday 00:00 local time of `now`'s week. */
export function calculateWeeklyXp(
  completions: readonly LessonCompletion[],
  lessonXpByKey: Readonly<Record<string, number>>,
  now: Date = new Date(),
  weeklyBonusXp = 0,
): number {
  const weekStart = startOfLocalWeek(now);
  const lessonTotal = completions.reduce((sum, item) => {
    const ts = Date.parse(item.completedAt);
    if (Number.isNaN(ts) || ts < weekStart) return sum;
    return sum + calculateLessonXp(item, lessonXpByKey[item.lessonKey] ?? 0);
  }, 0);
  return lessonTotal + Math.max(0, weeklyBonusXp);
}

/** Derives level number, rank title, and XP progress within the current level. */
export function deriveLevel(totalXp: number): {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  xpToNext: number;
  progressPct: number;
} {
  const safeXp = Math.max(0, totalXp);
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = safeXp % XP_PER_LEVEL;
  const nextLevelXp = XP_PER_LEVEL;
  const xpToNext = XP_PER_LEVEL - currentLevelXp;
  const progressPct = Math.round((currentLevelXp / XP_PER_LEVEL) * 100);
  const title =
    level >= 8 ? 'Architect' : level >= 5 ? 'Technician' : level >= 3 ? 'Builder' : 'Beginner';
  return { level, title, currentLevelXp, nextLevelXp, xpToNext, progressPct };
}

export interface LeaderboardRowInput {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  weeklyXp: number;
  allTimeXp: number;
  streakDays: number;
}

export interface RankedLeaderboardRow {
  userId: string;
  name: string;
  initial: string;
  avatarUrl?: string;
  xp: number;
  weeklyXp: number;
  allTimeXp: number;
  streakDays: number;
  rank: number;
  isYou: boolean;
}

function initialFor(name: string): string {
  return (name.trim()[0] || 'L').toUpperCase();
}

/**
 * Merges remote leaderboard rows with the current user's live local state,
 * deduplicates by userId, and sorts descending for the selected period.
 */
export function mergeLeaderboard(
  remoteEntries: readonly LeaderboardRowInput[],
  currentUser: LeaderboardRowInput,
  period: 'w' | 'a',
): RankedLeaderboardRow[] {
  const byId = new Map<string, LeaderboardRowInput>();
  for (const row of remoteEntries) {
    byId.set(row.userId, row);
  }
  byId.set(currentUser.userId, currentUser);

  const items = Array.from(byId.values()).map((row) => ({
    userId: row.userId,
    name: row.displayName.trim() || 'Learner',
    initial: initialFor(row.displayName),
    avatarUrl: row.avatarUrl,
    xp: period === 'a' ? row.allTimeXp : row.weeklyXp,
    weeklyXp: row.weeklyXp,
    allTimeXp: row.allTimeXp,
    streakDays: row.streakDays,
    isYou: row.userId === currentUser.userId,
  }));

  items.sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
    return a.name.localeCompare(b.name);
  });

  return items.map((row, idx) => ({ ...row, rank: idx + 1 }));
}
