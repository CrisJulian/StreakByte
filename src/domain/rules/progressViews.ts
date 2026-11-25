import type { AchievementItem, PracticeItem, TrackId } from '../../types/streakbyte';
import type { LessonCompletion } from '../entities/progress';
import type { StreakState } from './streak';
import { effectiveStreak, localDayString } from './xp';

export interface DeriveAchievementsInput {
  completions: readonly LessonCompletion[];
  streak: StreakState;
  totalXp: number;
  hwTotal: number;
  leaderboardRank: number | null;
  today?: string;
}

export function deriveAchievements({
  completions,
  streak,
  totalXp,
  hwTotal,
  leaderboardRank,
  today = localDayString(),
}: DeriveAchievementsInput): AchievementItem[] {
  const bestStreak = Math.max(streak.longest, effectiveStreak(streak, today));
  const hwDone = completions.filter((c) => c.lessonKey.startsWith('hw-')).length;
  const hasKey = (key: string) => completions.some((c) => c.lessonKey === key);
  const acedNet3 = completions.some(
    (c) => c.lessonKey === 'net-3' && c.total > 0 && c.correct === c.total,
  );

  const firstDone = completions.length >= 1;
  const run5Unlocked = bestStreak >= 5;
  const ramUnlocked = hasKey('hw-3');
  const netUnlocked = hasKey('net-1');
  const run30Unlocked = bestStreak >= 30;
  const topUnlocked = totalXp > 0 && leaderboardRank === 1;
  const hwGradUnlocked = hwTotal > 0 && hwDone >= hwTotal;

  return [
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Complete your first lesson quiz.',
      unlocked: firstDone,
      icon: firstDone ? 'wrench' : 'lock',
      accent: 'cyan',
      ...(firstDone ? {} : { progressPct: 0, progressText: '0 / 1 lesson' }),
    },
    {
      id: '5-day-run',
      title: '5-Day Run',
      description: 'Keep a 5-day streak.',
      unlocked: run5Unlocked,
      icon: run5Unlocked ? 'flame' : 'lock',
      accent: 'amber',
      ...(run5Unlocked
        ? {}
        : {
            progressPct: Math.round((Math.min(bestStreak, 5) / 5) * 100),
            progressText: `${Math.min(bestStreak, 5)} / 5 days`,
          }),
    },
    {
      id: 'ram-master',
      title: 'RAM Master',
      description: 'Complete Lesson 3: Memory (RAM).',
      unlocked: ramUnlocked,
      icon: ramUnlocked ? 'cpu' : 'lock',
      accent: 'cyan',
      ...(ramUnlocked ? {} : { statusText: 'Locked' }),
    },
    {
      id: 'net-ninja',
      title: 'Net Ninja',
      description: 'Complete Lesson 1: What is a network?',
      unlocked: netUnlocked,
      icon: netUnlocked ? 'net' : 'lock',
      accent: 'cyan',
      ...(netUnlocked ? {} : { statusText: 'Locked' }),
    },
    {
      id: '30-day-run',
      title: '30-Day Run',
      description: 'Keep a 30-day streak.',
      unlocked: run30Unlocked,
      icon: run30Unlocked ? 'flame' : 'lock',
      accent: 'amber',
      ...(run30Unlocked
        ? {}
        : {
            progressPct: Math.round((Math.min(bestStreak, 30) / 30) * 100),
            progressText: `${Math.min(bestStreak, 30)} / 30 days`,
          }),
    },
    {
      id: 'top-of-board',
      title: 'Top of the Board',
      description: 'Reach rank 1 on the weekly leaderboard.',
      unlocked: topUnlocked,
      icon: topUnlocked ? 'trophy' : 'lock',
      accent: 'amber',
      ...(topUnlocked
        ? {}
        : {
            statusText:
              totalXp === 0
                ? 'Earn XP to rank'
                : leaderboardRank
                  ? `Currently #${leaderboardRank}`
                  : 'Locked',
          }),
    },
    {
      id: 'hardware-grad',
      title: 'Hardware Finisher',
      description: 'Complete all Hardware Basics lessons.',
      unlocked: hwGradUnlocked,
      icon: hwGradUnlocked ? 'cpu' : 'lock',
      accent: 'cyan',
      ...(hwGradUnlocked
        ? {}
        : {
            progressPct: hwTotal > 0 ? Math.round((hwDone / hwTotal) * 100) : 0,
            progressText: `${hwDone} / ${hwTotal} lessons`,
          }),
    },
    {
      id: 'subnet-sage',
      title: 'Subnet Sage',
      description: 'Score 100% on Lesson 3: Subnet masks.',
      unlocked: acedNet3,
      icon: acedNet3 ? 'bolt' : 'lock',
      accent: 'cyan',
      ...(acedNet3 ? {} : { statusText: 'Locked' }),
    },
  ];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function formatPracticeDay(iso: string, todayDay: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  const day = localDayString(parsed);
  if (day === todayDay) return 'Today';
  return `${MONTHS[parsed.getMonth()]} ${parsed.getDate()}`;
}

export function derivePracticeItems(
  completions: readonly LessonCompletion[],
  resolveLesson: (lessonKey: string) => { title: string; track: TrackId } | null,
  now: Date = new Date(),
): PracticeItem[] {
  const todayDay = localDayString(now);
  const items: (PracticeItem & { completedAt: string })[] = [];

  for (const c of completions) {
    const info = resolveLesson(c.lessonKey);
    if (!info || c.total <= 0) continue;
    const best = Math.round((c.correct / c.total) * 100);
    const state = best < 100 ? 'need' : 'ok';
    const trackName = info.track === 'net' ? 'Networking' : 'Hardware';
    const dayLabel = formatPracticeDay(c.completedAt, todayDay);
    items.push({
      lessonKey: c.lessonKey,
      title: info.title,
      meta: `${trackName} · Quiz · ${c.correct}/${c.total} best · ${dayLabel}`,
      best,
      state,
      track: info.track,
      completedAt: c.completedAt,
    });
  }

  items.sort((a, b) => {
    if (a.state !== b.state) return a.state === 'need' ? -1 : 1;
    if (a.state === 'need') return a.best - b.best;
    return b.completedAt.localeCompare(a.completedAt);
  });

  return items.map(({ completedAt: _ts, ...rest }) => rest);
}

export type HeatLevel = '' | 'l1' | 'l2' | 'l3';

/** Returns a 7 (Mon..Sun) x 5 (oldest..current week) heatmap of completions. */
export function deriveActivityHeatmap(
  completions: readonly LessonCompletion[],
  now: Date = new Date(),
): HeatLevel[][] {
  const countsByDay = new Map<string, number>();
  for (const c of completions) {
    const d = new Date(c.completedAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = localDayString(d);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const todayWeekday = (now.getDay() + 6) % 7; // Mon=0 .. Sun=6
  const currentMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayWeekday);
  const startMonday = new Date(
    currentMonday.getFullYear(),
    currentMonday.getMonth(),
    currentMonday.getDate() - 28,
  );

  return Array.from({ length: 7 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => {
      const cellDate = new Date(
        startMonday.getFullYear(),
        startMonday.getMonth(),
        startMonday.getDate() + col * 7 + row,
      );
      const count = countsByDay.get(localDayString(cellDate)) ?? 0;
      if (count >= 3) return 'l3';
      if (count === 2) return 'l2';
      if (count === 1) return 'l1';
      return '';
    }),
  );
}
