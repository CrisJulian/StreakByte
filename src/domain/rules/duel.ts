export type DuelTrack = 'hw' | 'net' | 'mixed';
export type DuelWager = 0 | 100 | 200;
export type DuelWagerMode = 'xp' | 'streak';
export type DuelStatus = 'waiting' | 'active' | 'finished' | 'cancelled';

export const DUEL_WAGER_OPTIONS: readonly DuelWager[] = [0, 100, 200];
export const STREAK_WAGER_REWARD_XP = 100;
export const DUEL_QUESTION_COUNT = 8;
export const MAX_STREAK_SHIELDS = 3;
export const FULL_BYTE_BONUS_XP = 25;
export const STREAK_BREAKER_MIN = 2;
export const STREAK_BREAKER_XP_PER_WIN = 25;
export const SPEED_BONUS_MS_PER_STREAK_3 = 500;

export interface ArenaStats {
  wins: number;
  losses: number;
  winStreak: number;
  bestStreak: number;
  streakShields: number;
}

export function createInitialArenaStats(): ArenaStats {
  return {
    wins: 0,
    losses: 0,
    winStreak: 0,
    bestStreak: 0,
    streakShields: 0,
  };
}

export interface DuelRoom {
  id: string;
  code: string;
  classroomId: string | null;
  classroomName?: string;
  track: DuelTrack;
  wagerXp: number;
  wagerMode: DuelWagerMode;
  status: DuelStatus;
  questionIds: string[];
  hostId: string;
  hostName: string;
  hostReady: boolean;
  hostScore: number | null;
  hostTimeMs: number | null;
  guestId: string | null;
  guestName: string | null;
  guestReady: boolean;
  guestScore: number | null;
  guestTimeMs: number | null;
  startedAt: string | null;
  winnerId: string | null;
  settled: boolean;
  bountyXp: number;
  fullByteBonusXp: number;
  shieldAwarded: boolean;
  shieldConsumed: boolean;
}

export interface DuelProgressEvent {
  userId: string;
  answered: number;
  total: number;
  score: number;
  bits: Array<0 | 1>;
  answerStreak: number;
  finished: boolean;
}

export function pickDuelQuestionIds(
  allQuestionIds: readonly string[],
  track: DuelTrack,
  count: number = DUEL_QUESTION_COUNT,
  rng: () => number = Math.random,
): string[] {
  const filtered = allQuestionIds.filter((id) => {
    if (track === 'hw') return id.startsWith('hw-');
    if (track === 'net') return id.startsWith('net-');
    return true;
  });

  const pool = [...filtered];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1)) % (i + 1);
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }

  return pool.slice(0, Math.min(count, pool.length));
}

export function determineDuelWinner(
  host: { id: string; score: number; timeMs: number },
  guest: { id: string; score: number; timeMs: number },
): string | null {
  if (host.score > guest.score) return host.id;
  if (guest.score > host.score) return guest.id;
  if (host.timeMs < guest.timeMs) return host.id;
  if (guest.timeMs < host.timeMs) return guest.id;
  return null;
}

export function canAffordWager(availableXp: number, wagerXp: number): boolean {
  return wagerXp <= 0 || availableXp >= wagerXp;
}

export function canEnterStreakWager(activeStreakDays: number): boolean {
  return activeStreakDays >= 1;
}

export function calculateStreakSpeedBonusMs(maxAnswerStreak: number): number {
  return Math.floor(Math.max(0, maxAnswerStreak) / 3) * SPEED_BONUS_MS_PER_STREAK_3;
}

export function calculateStreakBountyXp(opponentWinStreak: number): number {
  return opponentWinStreak >= STREAK_BREAKER_MIN
    ? opponentWinStreak * STREAK_BREAKER_XP_PER_WIN
    : 0;
}

export function shouldAwardStreakShield(
  nextWinStreak: number,
  opponentWinStreak: number,
  currentShields: number,
): boolean {
  if (currentShields >= MAX_STREAK_SHIELDS) return false;
  return opponentWinStreak >= STREAK_BREAKER_MIN || (nextWinStreak > 0 && nextWinStreak % 3 === 0);
}

export function resolveLoserStreakAfterLoss(
  currentWinStreak: number,
  currentShields: number,
): { nextWinStreak: number; nextShields: number; shieldConsumed: boolean } {
  if (currentWinStreak > 0 && currentShields > 0) {
    return {
      nextWinStreak: currentWinStreak,
      nextShields: currentShields - 1,
      shieldConsumed: true,
    };
  }
  return {
    nextWinStreak: 0,
    nextShields: Math.max(0, currentShields),
    shieldConsumed: false,
  };
}

export function formatDuelTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms < 0) return '—';
  return `${(ms / 1000).toFixed(1)}s`;
}
