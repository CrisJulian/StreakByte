import type { ProfileSettings } from '../../types/streakbyte';
import type { LessonCompletion } from '../../domain/entities/progress';
import type { StreakState } from '../../domain/rules/streak';

/** Ports: what the app needs from the outside world. Adapters (local, Supabase) implement these. */

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AuthService {
  currentUser(): Promise<AuthUser | null>;
  signIn(email: string, password: string, keepLoggedIn: boolean): Promise<AuthUser>;
  signUp(email: string, password: string): Promise<AuthUser>;
  signInWithGoogle(): Promise<void>;
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
  sendPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  weeklyXp: number;
  allTimeXp: number;
  streakDays: number;
}

export interface ProgressRepository {
  loadStreak(): Promise<StreakState>;
  saveStreak(streak: StreakState): Promise<void>;
  loadLabBonusXp(): Promise<number>;
  saveLabBonusXp(xp: number): Promise<void>;
  loadSettings(): Promise<ProfileSettings | null>;
  saveSettings(settings: ProfileSettings): Promise<void>;
  /** Lessons whose quiz was passed. Unlocking is derived from this list. */
  loadLessonCompletions(): Promise<LessonCompletion[]>;
  /** Idempotent: saving the same lesson twice keeps one record (best score wins). */
  saveLessonCompletion(completion: LessonCompletion): Promise<void>;
  loadLeaderboard(period: 'w' | 'a'): Promise<LeaderboardEntry[]>;
  syncLeaderboardEntry(entry: Omit<LeaderboardEntry, 'userId'>): Promise<void>;
  clearLocalCache(): void;
}

export interface StudyBuddyMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StudyBuddyContext {
  history?: StudyBuddyMessage[];
  currentLesson?: string;
  apiKey?: string;
}

/**
 * Study Buddy must only answer from StreakByte's own lesson content.
 * Sync return is allowed so the offline responder stays instant; a server-backed one returns a Promise.
 */
export interface StudyBuddyService {
  greeting: string;
  reply(question: string, context?: StudyBuddyContext): string | Promise<string>;
}

export interface ReminderScheduler {
  isSupported(): boolean;
  requestPermission(): Promise<boolean>;
  scheduleDaily(hour: number, minute: number): Promise<void>;
  cancelAll(): Promise<void>;
}

export interface SyncOperation {
  id: string;
  type: 'save-streak' | 'save-settings' | 'complete-lesson';
  payload: unknown;
  createdAt: number;
}

/** Offline writes land here and are flushed to the backend when the connection returns. */
export interface SyncQueue {
  enqueue(op: Omit<SyncOperation, 'id' | 'createdAt'>): Promise<void>;
  pending(): Promise<SyncOperation[]>;
  flush(send: (op: SyncOperation) => Promise<void>): Promise<void>;
}
