import type { LeaderboardStudent } from '../types/streakbyte';

export const LEADERBOARD_ROWS: LeaderboardStudent[] = [
  { name: 'Ana Cruz', initial: 'A', weeklyXp: 1420, allTimeXp: 1980, streakDays: 14 },
  { name: 'Joel Mendoza', initial: 'J', weeklyXp: 1310, allTimeXp: 1640, streakDays: 9 },
  { name: 'Mika Reyes (you)', initial: 'M', weeklyXp: 1240, allTimeXp: 1240, streakDays: 5, isYou: true },
  { name: 'Paolo Reyes', initial: 'P', weeklyXp: 1180, allTimeXp: 1200, streakDays: 7 },
  { name: 'Bea Santos', initial: 'B', weeklyXp: 1090, allTimeXp: 1130, streakDays: 3 },
  { name: 'Carlo Dizon', initial: 'C', weeklyXp: 960, allTimeXp: 1010, streakDays: 11 },
  { name: 'Lia Ramos', initial: 'L', weeklyXp: 910, allTimeXp: 960, streakDays: 2 },
  { name: 'Noel Tan', initial: 'N', weeklyXp: 840, allTimeXp: 880, streakDays: 6 },
  { name: 'Gabby Cruz', initial: 'G', weeklyXp: 770, allTimeXp: 790, streakDays: 1 },
  { name: 'Ken Lopez', initial: 'K', weeklyXp: 700, allTimeXp: 720, streakDays: 4 },
];

export const DASHBOARD_BOARD_PREVIEW = [
  { rank: 1, initials: 'AC', name: 'Ana Cruz', streak: '14-day streak', xp: '1,420', isYou: false },
  { rank: 2, initials: 'JM', name: 'Joel Mendoza', streak: '9-day streak', xp: '1,310', isYou: false },
  { rank: 3, initials: 'MR', name: 'Mika Reyes (you)', streak: '5-day streak', xp: '1,240', isYou: true },
  { rank: 4, initials: 'PR', name: 'Paolo Reyes', streak: '7-day streak', xp: '1,180', isYou: false },
];

export function formatXp(value: number): string {
  return value.toLocaleString('en-US');
}

export function formatStreak(days: number): string {
  return `${days} day streak`;
}
