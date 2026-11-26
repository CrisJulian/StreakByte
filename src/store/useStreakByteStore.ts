import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { playSfx } from '../audio/soundEffects';
import { QUIZ_BANK } from '../data/quizBank';
import { ARENA_SCENARIOS } from '../data/arenaScenarios';
import { getTrackProgress, isLessonKeyLocked, LESSON_XP_BY_KEY, lessonLabel, TRACKS } from '../data/curriculum';
import { LESSON_CONTENT } from '../data/lessons';
import type { LessonCompletion } from '../domain/entities/progress';
import type { QuizSession } from '../domain/entities/quiz';
import { DEFAULT_PASS_MARK, isQuizPassed, recordCompletion } from '../domain/rules/lessonProgress';
import {
  currentCombo,
  isFinished,
  nextQuestion,
  parseLessonKey,
  scoreQuiz,
  selectChoice,
  startQuiz,
  submitAnswer,
} from '../domain/rules/quiz';
import { services } from '../composition';
import type { AuthUser, ClassroomSummary, LeaderboardEntry, SyncOperation } from '../application/ports';
import { generateArenaDuelTokens } from '../domain/rules/arenaQuestions';
import {
  createInitialArenaStats,
  determineDuelWinner,
  DUEL_QUESTION_COUNT,
  type ArenaStats,
  type DuelProgressEvent,
  type DuelRoom,
  type DuelTrack,
  type DuelWagerMode,
} from '../domain/rules/duel';
import { createInitialNetState, placeDevice, saveDeviceConfig, selectDevice } from '../domain/rules/network';
import { createInitialPcState, nextHint, placePart, selectPart } from '../domain/rules/pcBuild';
import {
  claimDailyQuest as claimDailyQuestRule,
  createDailyActivity,
  ensureDailyActivity,
  type DailyActivityState,
  type DailyQuestId,
} from '../domain/rules/dailyQuests';
import {
  canBuyRestore,
  canRestore,
  createInitialStreak,
  MAX_STREAK_RESTORES,
  recordActivity,
  STREAK_RESTORE_COST_XP,
  type StreakState,
} from '../domain/rules/streak';
import { buildLabMistake, buildQuizMistake, type StudyMistake } from '../domain/rules/studyContext';
import { summarizeNetworkBuild, summarizePcBuild, summarizeQuiz } from '../domain/rules/summaries';
import {
  calculateTotalXp,
  calculateWeeklyXp,
  deriveLevel,
  effectiveStreak,
  localDayString,
} from '../domain/rules/xp';
import type {
  AchievementFilter,
  CableType,
  ChatState,
  CompletionSummary,
  LabId,
  LeaderboardPeriod,
  NetDeviceConfig,
  NetDeviceId,
  NetworkLabState,
  PcBuildState,
  PcPartId,
  PcSlotId,
  PracticeFilter,
  ProfileSettings,
  SessionLength,
  SessionMode,
  SetupModalState,
  ThemeMode,
  TrackId,
  ViewId,
} from '../types/streakbyte';

const VALID_VIEWS: readonly ViewId[] = [
  'dashboard',
  'curriculum',
  'lesson',
  'arena',
  'practice',
  'achievements',
  'leaderboard',
  'profile',
  'complete',
  'login',
  'quiz',
  'learn',
];

export { PC_HINTS, PC_SLOT_TO_PART } from '../domain/rules/pcBuild';
export { NET_DEVICE_NAMES } from '../domain/rules/network';
export const LOCAL_TEST_DUEL_ID = 'local-test-duel';

export const CABLE_COLORS: Record<CableType, string> = {
  eth: '#22d3ee',
  fiber: '#22d3ee',
  coax: '#a3add1',
};

export function parseHash(hash: string): { view: ViewId; lab?: LabId; quiz?: string; learn?: string } {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [rawHead, sub] = (raw || 'dashboard').split('/');
  const head = rawHead === 'sandboxes' ? 'lesson' : rawHead;
  const view: ViewId = (VALID_VIEWS as readonly string[]).includes(head)
    ? (head as ViewId)
    : 'dashboard';

  if (view === 'lesson') {
    return { view, lab: sub === 'network' ? 'net' : 'pc' };
  }
  if (view === 'quiz') {
    return { view, quiz: sub ?? '' };
  }
  if (view === 'learn') {
    return { view, learn: sub ?? '' };
  }
  return { view };
}

function createInitialSetupModal(): SetupModalState {
  return {
    open: false,
    target: 'pc',
    title: 'Final Lesson: Build a PC',
    mode: 'guided',
    length: '5',
  };
}

function createInitialProfileSettings(): ProfileSettings {
  return {
    displayName: '',
    email: '',
    selectedTracks: ['hw', 'net'],
    onboardingCompleted: false,
    dailyGoal: '5',
    dailyReminder: true,
    soundEffects: true,
    hintsByDefault: true,
    geminiApiKey: '',
  };
}

function sanitizeTracks(tracks: readonly TrackId[]): TrackId[] {
  const valid = tracks.filter((t): t is TrackId => t === 'hw' || t === 'net');
  return valid.length > 0 ? Array.from(new Set(valid)) : ['hw', 'net'];
}

function learnerFirstName(profileSettings: ProfileSettings, authUser: AuthUser | null): string {
  const full = (profileSettings.displayName || authUser?.displayName || 'Learner').trim();
  return full.split(/\s+/)[0] || 'Learner';
}

function maybeLevelUp(prevXp: number, nextXp: number, soundEnabled: boolean) {
  const prev = deriveLevel(prevXp);
  const next = deriveLevel(nextXp);
  if (next.level > prev.level) {
    playSfx('levelUp', { enabled: soundEnabled });
    return { level: next.level, title: next.title, tick: Date.now() };
  }
  return null;
}

function createInitialChatState(): ChatState {
  return {
    open: false,
    hasOpened: false,
    showSuggestions: true,
    isLoading: false,
    messages: [],
  };
}

let msgCounter = 0;
function nextMsgId(): string {
  msgCounter += 1;
  return `msg-${Date.now()}-${msgCounter}`;
}

async function syncCurrentUserLeaderboard(get: () => StreakByteStore): Promise<void> {
  const state = get();
  if (state.isGuest || !state.authUser) return;
  const today = localDayString();
  const totalXp = calculateTotalXp(state.completions, LESSON_XP_BY_KEY, state.labBonusXp, state.xpSpent);
  await services.progress.syncLeaderboardEntry({
    displayName: state.profileSettings.displayName || state.authUser.displayName || 'Learner',
    avatarUrl: state.authUser.avatarUrl,
    weeklyXp: calculateWeeklyXp(state.completions, LESSON_XP_BY_KEY, new Date(), state.labBonusXp, state.xpSpent),
    allTimeXp: totalXp,
    streakDays: effectiveStreak(state.streak, today),
  });
}

async function persistOrQueue(
  get: () => StreakByteStore,
  set: (partial: Partial<StreakByteStore>) => void,
  op: Omit<SyncOperation, 'id' | 'createdAt'>,
  saveFn: () => Promise<void>,
): Promise<void> {
  // Always enqueue synchronously so offline writes are durable immediately.
  void services.syncQueue.enqueue(op).catch(() => undefined);

  const isSignedIn = !get().isGuest && Boolean(get().authUser);
  if (!isSignedIn) {
    await saveFn().catch(() => undefined);
    return;
  }

  if (get().isOnline) {
    // Batch ops enqueued in the same synchronous turn, then flush once to backend.
    await Promise.resolve();
    await get().flushSyncQueue();
    return;
  }

  await saveFn().catch(() => undefined);
  const pending = await services.syncQueue.pending().catch(() => []);
  set({ pendingSyncCount: pending.length });
}

export interface StreakByteStore {
  view: ViewId;
  authUser: AuthUser | null;
  isGuest: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  activeLab: LabId;
  theme: ThemeMode;
  track: TrackId;
  searchQuery: string;
  practiceFilter: PracticeFilter;
  achievementFilter: AchievementFilter;
  leaderboardPeriod: LeaderboardPeriod;
  lessonSeconds: number;
  setupModal: SetupModalState;
  pc: PcBuildState;
  net: NetworkLabState;
  completion: CompletionSummary | null;
  quiz: QuizSession | null;
  /** Lesson key shown on the Learn page, e.g. "hw-3". */
  learnKey: string | null;
  /** Most recent quiz or lab error, offered as 1-click context for Study Buddy. */
  lastMistake: StudyMistake | null;
  /** Lessons whose quiz was passed. Locks and unlocks are derived from this. */
  completions: LessonCompletion[];
  streak: StreakState;
  labBonusXp: number;
  xpSpent: number;
  dailyActivity: DailyActivityState;
  leaderboard: LeaderboardEntry[];
  classrooms: ClassroomSummary[];
  selectedClassroomId: string | null;
  arenaTab: 'duel' | 'practice';
  arenaStats: ArenaStats;
  activeDuel: DuelRoom | null;
  openClassroomDuels: DuelRoom[];
  opponentProgress: DuelProgressEvent | null;
  profileLoaded: boolean;
  profileSettings: ProfileSettings;
  chat: ChatState;
  toastMessage: string | null;
  toastTick: number;
  levelUpEvent: { level: number; title: string; tick: number } | null;
  dismissLevelUp: () => void;
  claimDailyQuest: (questId: DailyQuestId) => void;
  restoreCurrentStreak: () => Promise<void>;
  buyStreakRestore: () => Promise<void>;

  // Arena & Live 1v1 Duels
  setArenaTab: (tab: 'duel' | 'practice') => void;
  refreshClassroomDuels: () => Promise<void>;
  createDuelRoom: (opts: {
    track: DuelTrack;
    wagerXp: number;
    wagerMode?: DuelWagerMode;
    classroomId: string | null;
  }) => Promise<boolean>;
  startBotTestDuel: (track: DuelTrack) => void;
  joinDuelRoom: (code: string) => Promise<boolean>;
  setDuelReady: (ready: boolean) => Promise<void>;
  submitDuelResult: (score: number, timeMs: number) => Promise<void>;
  cancelOrForfeitDuel: () => Promise<void>;
  setActiveDuel: (room: DuelRoom | null) => void;
  setOpponentProgress: (progress: DuelProgressEvent | null) => void;

  // Offline sync
  setOnlineStatus: (online: boolean) => void;
  refreshPendingSyncCount: () => Promise<void>;
  flushSyncQueue: () => Promise<void>;

  // Auth & session
  setAuthUser: (user: AuthUser | null) => void;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  loadAuthUser: () => Promise<AuthUser | null>;
  loadUserData: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  completeOnboarding: (tracks: TrackId[]) => Promise<void>;
  setSelectedTracks: (tracks: TrackId[]) => void;
  saveProfileSettings: () => Promise<void>;

  // Classrooms
  selectClassroom: (classroomId: string | null) => void;
  createClassroom: (name: string) => Promise<{ ok: boolean; error?: string }>;
  joinClassroom: (code: string) => Promise<{ ok: boolean; error?: string }>;
  leaveClassroom: (classroomId: string) => Promise<void>;

  // Navigation & shell
  syncFromHash: (hash: string) => void;
  navigate: (route: string) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;

  // Curriculum & filters
  setTrack: (track: TrackId) => void;
  setSearchQuery: (query: string) => void;
  setPracticeFilter: (filter: PracticeFilter) => void;
  setAchievementFilter: (filter: AchievementFilter) => void;
  setLeaderboardPeriod: (period: LeaderboardPeriod) => void;

  // Session setup modal
  openSetup: (target: 'pc' | 'network', title?: string) => void;
  closeSetup: () => void;
  setSetupMode: (mode: SessionMode) => void;
  setSetupLength: (length: SessionLength) => void;
  startSessionFromModal: () => void;

  // Lesson player timer
  tickLessonTimer: () => void;

  // PC Build lab
  selectPcPart: (part: PcPartId | null) => void;
  placePcPart: (slotId: PcSlotId, draggedPart?: PcPartId) => boolean;
  triggerPcHint: () => void;
  completePcBuild: () => void;

  // Network Build lab
  selectNetworkDevice: (device: NetDeviceId | null) => void;
  placeNetworkDevice: (spot: NetDeviceId, draggedDevice?: NetDeviceId) => boolean;
  openNetworkConfig: (device: NetDeviceId) => void;
  closeNetworkConfig: () => void;
  saveNetworkConfig: (config: NetDeviceConfig) => boolean;
  completeNetworkBuild: () => void;

  // Quiz
  selectQuizChoice: (choiceIndex: number) => void;
  submitQuizAnswer: () => void;
  nextQuizQuestion: () => void;

  // Lesson progress
  loadCompletions: () => Promise<void>;
  recordLessonResult: (lessonKey: string, correct: number, total: number) => void;

  // Profile
  updateProfileSettings: (patch: Partial<ProfileSettings>) => void;

  // Chat
  setChatOpen: (open: boolean) => void;
  sendChatMessage: (text: string) => void;

  // Reset helper (for tests)
  resetAll: () => void;
}

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return typeof window !== 'undefined' && window.localStorage
        ? window.localStorage.getItem(name)
        : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(name, value);
      }
    } catch {
      // Ignore storage quota / private-mode errors
    }
  },
  removeItem: (name) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(name);
      }
    } catch {
      // Ignore storage errors
    }
  },
};

export const useStreakByteStore = create<StreakByteStore>()(
  persist(
    (set, get) => ({
      view: 'login',
      authUser: null,
      isGuest: false,
      isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
      pendingSyncCount: 0,
      isSyncing: false,
      activeLab: 'pc',
      theme: 'dark',
      track: 'hw',
      searchQuery: '',
      practiceFilter: 'all',
      achievementFilter: 'all',
      leaderboardPeriod: 'w',
      lessonSeconds: 42,
      setupModal: createInitialSetupModal(),
      pc: createInitialPcState(),
      net: createInitialNetState(),
      completion: null,
      quiz: null,
      learnKey: null,
      lastMistake: null,
      completions: [],
      streak: createInitialStreak(),
      labBonusXp: 0,
      xpSpent: 0,
      dailyActivity: createDailyActivity(localDayString()),
      leaderboard: [],
      classrooms: [],
      selectedClassroomId: null,
      arenaTab: 'duel',
      arenaStats: createInitialArenaStats(),
      activeDuel: null,
      openClassroomDuels: [],
      opponentProgress: null,
      profileLoaded: false,
      profileSettings: createInitialProfileSettings(),
      chat: createInitialChatState(),
      toastMessage: null,
      toastTick: 0,
      levelUpEvent: null,
      dismissLevelUp: () => set({ levelUpEvent: null }),

      setOnlineStatus: (online) => {
        const wasOffline = !get().isOnline;
        set({ isOnline: online });
        if (online && (wasOffline || get().pendingSyncCount > 0)) {
          void get().flushSyncQueue();
        }
      },

      refreshPendingSyncCount: async () => {
        try {
          const items = await services.syncQueue.pending();
          set({ pendingSyncCount: items.length });
        } catch {
          set({ pendingSyncCount: 0 });
        }
      },

      flushSyncQueue: async () => {
        const current = get();
        if (current.isSyncing || !current.isOnline || current.isGuest || !current.authUser) return;
        const before = await services.syncQueue.pending().catch(() => []);
        if (before.length === 0) {
          set({ pendingSyncCount: 0 });
          return;
        }
        set({ isSyncing: true });
        try {
          await services.syncQueue.flush(async (op) => {
            if (op.type === 'save-streak') {
              await services.progress.saveStreak(op.payload as StreakState);
            } else if (op.type === 'save-settings') {
              await services.progress.saveSettings(op.payload as ProfileSettings);
            } else if (op.type === 'complete-lesson') {
              await services.progress.saveLessonCompletion(op.payload as LessonCompletion);
            } else if (op.type === 'save-lab-bonus-xp') {
              await services.progress.saveLabBonusXp(Number(op.payload) || 0);
            }
          });
          const after = await services.syncQueue.pending().catch(() => []);
          const syncedCount = Math.max(0, before.length - after.length);
          set({ pendingSyncCount: after.length, isSyncing: false });
          if (syncedCount > 0) {
            void syncCurrentUserLeaderboard(get)
              .then(() => get().refreshLeaderboard())
              .catch(() => undefined);
            get().showToast(
              `Synced ${syncedCount} offline ${syncedCount === 1 ? 'change' : 'changes'}.`,
            );
          }
        } catch {
          const after = await services.syncQueue.pending().catch(() => []);
          set({ pendingSyncCount: after.length, isSyncing: false });
        }
      },

      restoreCurrentStreak: async () => {
        const current = get();
        const today = localDayString();
        if (!canRestore(current.streak, today)) {
          get().showToast('No streak restore available right now.');
          return;
        }
        try {
          const restored = await services.progress.restoreStreakServer(today);
          playSfx('levelUp', { enabled: get().profileSettings.soundEffects });
          set({ streak: restored });
          if (!get().isGuest && get().authUser) {
            void syncCurrentUserLeaderboard(get)
              .then(() => get().refreshLeaderboard())
              .catch(() => undefined);
          }
          get().showToast(`Streak restored! ${restored.current} day streak.`);
        } catch (err) {
          get().showToast(err instanceof Error ? err.message : 'Could not restore streak.');
        }
      },

      buyStreakRestore: async () => {
        const current = get();
        if (current.streak.restoresLeft >= MAX_STREAK_RESTORES) {
          get().showToast('You already hold the maximum number of streak restores.');
          return;
        }
        const availableXp = calculateTotalXp(
          current.completions,
          LESSON_XP_BY_KEY,
          current.labBonusXp,
          current.xpSpent,
        );
        if (!canBuyRestore(current.streak, availableXp)) {
          get().showToast(`You need ${STREAK_RESTORE_COST_XP} XP to buy a streak restore.`);
          return;
        }
        try {
          if (!current.isGuest && current.authUser) {
            await syncCurrentUserLeaderboard(get);
          }
          const { streak, xpSpent } = await services.progress.buyStreakRestore(availableXp);
          playSfx('combo', { enabled: get().profileSettings.soundEffects, combo: 4 });
          set({ streak, xpSpent });
          if (!get().isGuest && get().authUser) {
            void get().refreshLeaderboard();
          }
          get().showToast(`Streak restore bought (-${STREAK_RESTORE_COST_XP} XP).`);
        } catch (err) {
          get().showToast(err instanceof Error ? err.message : 'Could not buy streak restore.');
        }
      },

      claimDailyQuest: (questId) => {
        const current = get();
        const today = localDayString();
        const normalized = ensureDailyActivity(current.dailyActivity, today);
        const { next, rewardXp } = claimDailyQuestRule(normalized, questId);
        if (rewardXp <= 0) return;

        const prevXp = calculateTotalXp(
          current.completions,
          LESSON_XP_BY_KEY,
          current.labBonusXp,
          current.xpSpent,
        );
        const nextBonus = current.labBonusXp + rewardXp;
        const nextXp = calculateTotalXp(
          current.completions,
          LESSON_XP_BY_KEY,
          nextBonus,
          current.xpSpent,
        );
        const levelUp = maybeLevelUp(prevXp, nextXp, current.profileSettings.soundEffects);
        if (!levelUp) {
          playSfx('combo', { enabled: current.profileSettings.soundEffects, combo: 4 });
        }

        set({
          dailyActivity: next,
          labBonusXp: nextBonus,
          ...(levelUp ? { levelUpEvent: levelUp } : {}),
        });
        void persistOrQueue(
          get,
          set,
          { type: 'save-lab-bonus-xp', payload: nextBonus },
          () => services.progress.saveLabBonusXp(nextBonus),
        );

        if (!current.isGuest && current.authUser) {
          void syncCurrentUserLeaderboard(get)
            .then(() => get().refreshLeaderboard())
            .catch(() => undefined);
        }
        get().showToast(`+${rewardXp} XP claimed!`);
      },

      setAuthUser: (user) => {
        set({ authUser: user, isGuest: false });
        if (user) {
          set((state) => ({
            profileSettings: {
              ...state.profileSettings,
              displayName: user.displayName || state.profileSettings.displayName,
              email: user.email || state.profileSettings.email,
            },
          }));
        }
      },

      loginAsGuest: () => {
        const guestUser: AuthUser = {
          id: 'local-guest',
          email: 'guest@streakbyte.local',
          displayName: 'Guest Learner',
        };
        set({
          authUser: guestUser,
          isGuest: true,
          profileLoaded: true,
          view: 'dashboard',
          profileSettings: {
            ...get().profileSettings,
            displayName: 'Guest Learner',
            email: 'guest@streakbyte.local',
            selectedTracks: ['hw', 'net'],
            onboardingCompleted: true,
          },
        });
        get().showToast('Welcome, Guest! (Dev Mode)');
        get().navigate('dashboard');
      },

      logout: async () => {
        try {
          await services.auth.signOut();
        } catch {
          // Ignore
        }
        services.progress.clearLocalCache();
        set({
          authUser: null,
          isGuest: false,
          pendingSyncCount: 0,
          isSyncing: false,
          view: 'login',
          completions: [],
          streak: createInitialStreak(),
          labBonusXp: 0,
          xpSpent: 0,
          dailyActivity: createDailyActivity(localDayString()),
          leaderboard: [],
          classrooms: [],
          selectedClassroomId: null,
          arenaTab: 'duel',
          arenaStats: createInitialArenaStats(),
          activeDuel: null,
          openClassroomDuels: [],
          opponentProgress: null,
          lastMistake: null,
          profileLoaded: false,
          levelUpEvent: null,
          profileSettings: createInitialProfileSettings(),
        });
        get().showToast('Logged out.');
        get().navigate('login');
      },

      loadAuthUser: async () => {
        try {
          const user = await services.auth.currentUser();
          if (user) {
            get().setAuthUser(user);
            return user;
          }
        } catch {
          // ignore
        }
        return null;
      },

      loadUserData: async () => {
        const currentAuth = get().authUser;
        const isGuest = get().isGuest;
        try {
          const [
            savedCompletions,
            savedStreak,
            savedBonusXp,
            savedXpSpent,
            savedArenaStats,
            remoteSettings,
            myClassrooms,
          ] = await Promise.all([
            services.progress.loadLessonCompletions(),
            services.progress.loadStreak(),
            services.progress.loadLabBonusXp(),
            services.progress.loadXpSpent(),
            currentAuth && !isGuest
              ? services.progress.loadArenaStats()
              : Promise.resolve(createInitialArenaStats()),
            currentAuth && !isGuest ? services.progress.loadSettings() : Promise.resolve(null),
            currentAuth && !isGuest ? services.progress.loadMyClassrooms() : Promise.resolve([]),
          ]);

          set((state) => {
            const mergedCompletions = savedCompletions.reduce(
              (all, c) => recordCompletion(all, c),
              state.completions,
            );

            if (!currentAuth || isGuest) {
              return {
                completions: mergedCompletions,
                streak: savedStreak,
                labBonusXp: savedBonusXp,
                xpSpent: savedXpSpent,
                arenaStats: createInitialArenaStats(),
                classrooms: [],
                selectedClassroomId: null,
                profileLoaded: true,
              };
            }

            const selectedTracks = remoteSettings
              ? sanitizeTracks(remoteSettings.selectedTracks)
              : state.profileSettings.selectedTracks;
            const nextSettings: ProfileSettings = remoteSettings
              ? {
                ...state.profileSettings,
                ...remoteSettings,
                selectedTracks,
                displayName: remoteSettings.displayName || currentAuth.displayName || 'Learner',
                email: remoteSettings.email || currentAuth.email || '',
              }
              : {
                ...state.profileSettings,
                displayName: currentAuth.displayName || state.profileSettings.displayName,
                email: currentAuth.email || state.profileSettings.email,
                selectedTracks: ['hw', 'net'],
                onboardingCompleted: false,
              };

            return {
              completions: mergedCompletions,
              streak: savedStreak,
              labBonusXp: savedBonusXp,
              xpSpent: savedXpSpent,
              arenaStats: savedArenaStats,
              classrooms: myClassrooms,
              selectedClassroomId: myClassrooms.some((c) => c.id === state.selectedClassroomId)
                ? state.selectedClassroomId
                : null,
              profileSettings: nextSettings,
              track: selectedTracks.includes(state.track) ? state.track : selectedTracks[0],
              profileLoaded: true,
            };
          });

          await get().refreshPendingSyncCount();
          if (currentAuth && !isGuest && get().isOnline) {
            await get().flushSyncQueue();
          }

          if (currentAuth && !isGuest && get().profileSettings.onboardingCompleted) {
            await syncCurrentUserLeaderboard(get);
          }
          if (currentAuth && !isGuest) {
            await get().refreshLeaderboard();
          }
        } catch {
          set({ profileLoaded: true });
        }
      },

      refreshLeaderboard: async () => {
        if (get().isGuest || !get().authUser) return;
        try {
          const rows = await services.progress.loadLeaderboard(
            get().leaderboardPeriod,
            get().selectedClassroomId,
          );
          set({ leaderboard: rows });
        } catch {
          // Offline / unavailable: keep current leaderboard state
        }
      },

      selectClassroom: (classroomId) => {
        set({ selectedClassroomId: classroomId });
        void get().refreshLeaderboard();
      },

      createClassroom: async (name) => {
        try {
          const room = await services.progress.createClassroom(name);
          set((state) => ({
            classrooms: [...state.classrooms, room],
            selectedClassroomId: room.id,
          }));
          await get().refreshLeaderboard();
          get().showToast(`Classroom created (${room.joinCode}).`);
          return { ok: true };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Could not create classroom.';
          get().showToast(msg);
          return { ok: false, error: msg };
        }
      },

      joinClassroom: async (code) => {
        try {
          const room = await services.progress.joinClassroom(code);
          set((state) => {
            const exists = state.classrooms.some((c) => c.id === room.id);
            return {
              classrooms: exists
                ? state.classrooms.map((c) => (c.id === room.id ? room : c))
                : [...state.classrooms, room],
              selectedClassroomId: room.id,
            };
          });
          await get().refreshLeaderboard();
          get().showToast(`Joined ${room.name}!`);
          return { ok: true };
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Could not join classroom.';
          get().showToast(msg);
          return { ok: false, error: msg };
        }
      },

      leaveClassroom: async (classroomId) => {
        try {
          await services.progress.leaveClassroom(classroomId);
          set((state) => ({
            classrooms: state.classrooms.filter((c) => c.id !== classroomId),
            selectedClassroomId:
              state.selectedClassroomId === classroomId ? null : state.selectedClassroomId,
          }));
          await get().refreshLeaderboard();
          get().showToast('Left classroom.');
        } catch (err) {
          get().showToast(err instanceof Error ? err.message : 'Could not leave classroom.');
        }
      },

      setArenaTab: (arenaTab) => set({ arenaTab }),

      setOpponentProgress: (opponentProgress) => set({ opponentProgress }),

      setActiveDuel: (room) => {
        if (room?.status === 'cancelled') {
          set({ activeDuel: null, opponentProgress: null });
          get().showToast('Duel room was closed.');
          return;
        }
        const prev = get().activeDuel;
        set({ activeDuel: room });
        if (room && room.status === 'finished' && (!prev || prev.status !== 'finished')) {
          const authId = get().authUser?.id || 'local-guest';
          if (room.winnerId) {
            playSfx(room.winnerId === authId ? 'levelUp' : 'error', {
              enabled: get().profileSettings.soundEffects,
            });
          }
          if (room.id !== LOCAL_TEST_DUEL_ID) {
            const playerScore = room.hostId === authId ? room.hostScore : room.guestScore;
            if (playerScore !== null || room.winnerId === authId) {
              const prevDaily = ensureDailyActivity(get().dailyActivity, localDayString());
              set({
                dailyActivity: {
                  ...prevDaily,
                  arenaDuelsFinished: prevDaily.arenaDuelsFinished + 1,
                },
              });
            }
            void get().loadUserData();
          }
        }
      },

      startBotTestDuel: (track) => {
        const current = get();
        const hostId = current.authUser?.id || 'local-guest';
        const hostName =
          current.profileSettings.displayName || current.authUser?.displayName || 'Learner';
        const questionIds = generateArenaDuelTokens(
          track,
          ARENA_SCENARIOS,
          DUEL_QUESTION_COUNT,
        );
        set({
          opponentProgress: null,
          activeDuel: {
            id: LOCAL_TEST_DUEL_ID,
            code: 'TEST1V',
            classroomId: null,
            track,
            wagerXp: 0,
            wagerMode: 'xp',
            status: 'active',
            questionIds,
            hostId,
            hostName,
            hostReady: true,
            hostScore: null,
            hostTimeMs: null,
            guestId: 'byte-bot',
            guestName: 'BYTE Bot (Test)',
            guestReady: true,
            guestScore: null,
            guestTimeMs: null,
            startedAt: new Date(Date.now() + 2000).toISOString(),
            winnerId: null,
            settled: true,
            bountyXp: 0,
            fullByteBonusXp: 0,
            shieldAwarded: false,
            shieldConsumed: false,
          },
        });
      },

      refreshClassroomDuels: async () => {
        const ids = get().classrooms.map((c) => c.id);
        if (ids.length === 0 || get().isGuest || !get().authUser) {
          set({ openClassroomDuels: [] });
          return;
        }
        try {
          const list = await services.duel.listOpenClassroomDuels(ids);
          set({ openClassroomDuels: list });
        } catch {
          // ignore network hiccup
        }
      },

      createDuelRoom: async ({ track, wagerXp, wagerMode = 'xp', classroomId }) => {
        try {
          if ((wagerXp > 0 || wagerMode === 'streak') && !get().isGuest && get().authUser) {
            await services.progress.saveStreak(get().streak).catch(() => undefined);
            await syncCurrentUserLeaderboard(get);
          }
          const questionIds = generateArenaDuelTokens(
            track,
            ARENA_SCENARIOS,
            DUEL_QUESTION_COUNT,
          );
          const room = await services.duel.createDuel({
            track,
            wagerXp: wagerMode === 'streak' ? 0 : wagerXp,
            wagerMode,
            questionIds,
            classroomId,
          });
          set({ activeDuel: room, opponentProgress: null });
          get().showToast(`Duel room ${room.code} ready!`);
          return true;
        } catch (err) {
          get().showToast(err instanceof Error ? err.message : 'Could not create duel room.');
          return false;
        }
      },

      joinDuelRoom: async (code) => {
        try {
          if (!get().isGuest && get().authUser) {
            await syncCurrentUserLeaderboard(get);
          }
          const room = await services.duel.joinDuel(code);
          set({ activeDuel: room, opponentProgress: null });
          get().showToast(`Joined duel ${room.code}!`);
          return true;
        } catch (err) {
          get().showToast(err instanceof Error ? err.message : 'Could not join duel.');
          return false;
        }
      },

      setDuelReady: async (ready) => {
        const active = get().activeDuel;
        if (!active) return;
        try {
          const updated = await services.duel.setReady(active.id, ready);
          get().setActiveDuel(updated);
        } catch (err) {
          get().showToast(err instanceof Error ? err.message : 'Could not update ready state.');
        }
      },

      submitDuelResult: async (score, timeMs) => {
        const active = get().activeDuel;
        if (!active) return;
        if (active.id === LOCAL_TEST_DUEL_ID) {
          const opp = get().opponentProgress;
          const total = active.questionIds.length;
          const botScore =
            opp && opp.finished
              ? opp.score
              : Math.min(total, Math.max(4, total - 2));
          const botTimeMs = Math.max(8000, Math.round(timeMs * 1.15));
          const winnerId = determineDuelWinner(
            { id: active.hostId, score, timeMs },
            { id: active.guestId || 'byte-bot', score: botScore, timeMs: botTimeMs },
          );
          get().setActiveDuel({
            ...active,
            status: 'finished',
            hostScore: score,
            hostTimeMs: timeMs,
            guestScore: botScore,
            guestTimeMs: botTimeMs,
            winnerId,
          });
          return;
        }
        try {
          const updated = await services.duel.submitResult(active.id, score, timeMs);
          get().setActiveDuel(updated);
        } catch (err) {
          get().showToast(err instanceof Error ? err.message : 'Could not submit duel score.');
        }
      },

      cancelOrForfeitDuel: async () => {
        const active = get().activeDuel;
        if (!active) return;
        if (active.id === LOCAL_TEST_DUEL_ID) {
          set({ activeDuel: null, opponentProgress: null });
          get().showToast('Exited test duel.');
          return;
        }
        try {
          const updated = await services.duel.cancelOrForfeitDuel(active.id);
          if (active.status === 'waiting') {
            set({ activeDuel: null, opponentProgress: null });
            get().showToast('Left duel room.');
          } else {
            get().setActiveDuel(updated);
          }
        } catch (err) {
          get().showToast(err instanceof Error ? err.message : 'Could not leave duel.');
        }
      },

      completeOnboarding: async (tracks) => {
        const selectedTracks = sanitizeTracks(tracks);
        const currentAuth = get().authUser;
        const nextSettings: ProfileSettings = {
          ...get().profileSettings,
          displayName: get().profileSettings.displayName || currentAuth?.displayName || 'Learner',
          email: get().profileSettings.email || currentAuth?.email || '',
          selectedTracks,
          onboardingCompleted: true,
        };
        set({
          profileSettings: nextSettings,
          track: selectedTracks[0],
          profileLoaded: true,
        });
        await Promise.all([
          persistOrQueue(
            get,
            set,
            { type: 'save-settings', payload: nextSettings },
            () => services.progress.saveSettings(nextSettings),
          ),
          persistOrQueue(
            get,
            set,
            { type: 'save-streak', payload: get().streak },
            () => services.progress.saveStreak(get().streak),
          ),
          syncCurrentUserLeaderboard(get).catch(() => undefined),
        ]);
        await get().refreshLeaderboard();
        get().navigate('dashboard');
      },

      setSelectedTracks: (tracks) => {
        const selectedTracks = sanitizeTracks(tracks);
        set((state) => ({
          profileSettings: { ...state.profileSettings, selectedTracks },
          track: selectedTracks.includes(state.track) ? state.track : selectedTracks[0],
        }));
        const updated = get().profileSettings;
        void persistOrQueue(
          get,
          set,
          { type: 'save-settings', payload: updated },
          () => services.progress.saveSettings(updated),
        );
      },

      saveProfileSettings: async () => {
        const settings = get().profileSettings;
        const currentAuth = get().authUser;
        await persistOrQueue(
          get,
          set,
          { type: 'save-settings', payload: settings },
          () => services.progress.saveSettings(settings),
        );
        if (!get().isGuest && currentAuth) {
          await syncCurrentUserLeaderboard(get).catch(() => undefined);
          await get().refreshLeaderboard();
        }
        get().showToast('Changes saved');
      },

      syncFromHash: (hash) => {
        const parsed = parseHash(hash);

        if (parsed.view === 'learn') {
          const key = parsed.learn ?? '';
          if (!LESSON_CONTENT[key]) {
            get().navigate('curriculum');
            return;
          }
          if (isLessonKeyLocked(key, get().completions)) {
            get().showToast('Finish the earlier lessons to unlock this one.');
            get().navigate('curriculum');
            return;
          }
          // Safe to run twice for one navigation: it only sets state.
          set({ view: 'learn', learnKey: key });
          return;
        }

        if (parsed.view === 'quiz') {
          const key = parsed.quiz ?? '';
          const bank = QUIZ_BANK[key];
          if (!bank) {
            get().navigate('curriculum');
            return;
          }
          if (isLessonKeyLocked(key, get().completions)) {
            get().showToast('Finish the earlier lessons to unlock this one.');
            get().navigate('curriculum');
            return;
          }
          // Hash sync can fire twice for one navigation; never restart a quiz in progress.
          if (get().quiz?.lessonKey !== key) {
            set({ view: 'quiz', quiz: startQuiz(key, bank) });
          } else {
            set({ view: 'quiz' });
          }
          return;
        }

        set((state) => ({
          view: parsed.view,
          activeLab: parsed.lab ?? state.activeLab,
          arenaTab:
            parsed.view === 'practice'
              ? 'practice'
              : parsed.view === 'arena'
                ? 'duel'
                : state.arenaTab,
        }));
      },

      navigate: (route) => {
        const normalized = route.startsWith('#') ? route : `#${route}`;
        if (typeof window !== 'undefined') {
          if (window.location.hash !== normalized) {
            window.location.hash = normalized;
          }
        }
        get().syncFromHash(normalized);
      },

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      showToast: (message) =>
        set((state) => ({ toastMessage: message, toastTick: state.toastTick + 1 })),

      clearToast: () => set({ toastMessage: null }),

      setTrack: (track) => set({ track }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setPracticeFilter: (practiceFilter) => set({ practiceFilter }),
      setAchievementFilter: (achievementFilter) => set({ achievementFilter }),
      setLeaderboardPeriod: (leaderboardPeriod) => {
        set({ leaderboardPeriod });
        void get().refreshLeaderboard();
      },

      openSetup: (target, title) => {
        const isNet = target === 'network';
        set((state) => ({
          setupModal: {
            ...state.setupModal,
            open: true,
            target: isNet ? 'network' : 'pc',
            title: title || (isNet ? 'Final Lesson: Build a Network' : 'Final Lesson: Build a PC'),
          },
        }));
      },

      closeSetup: () =>
        set((state) => ({
          setupModal: { ...state.setupModal, open: false },
        })),

      setSetupMode: (mode) =>
        set((state) => ({
          setupModal: { ...state.setupModal, mode },
        })),

      setSetupLength: (length) =>
        set((state) => ({
          setupModal: { ...state.setupModal, length },
        })),

      startSessionFromModal: () => {
        const target = get().setupModal.target;
        get().closeSetup();
        get().navigate(`lesson/${target}`);
      },

      tickLessonTimer: () =>
        set((state) => ({ lessonSeconds: state.lessonSeconds + 1 })),

      selectPcPart: (part) => set((state) => ({ pc: selectPart(state.pc, part) })),

      placePcPart: (slotId, draggedPart) => {
        const { state, placed } = placePart(get().pc, slotId, draggedPart);
        set({
          pc: state,
          lastMistake: placed ? null : buildLabMistake('pc', state.message),
        });
        playSfx(placed ? 'snap' : 'error', { enabled: get().profileSettings.soundEffects });
        return placed;
      },

      triggerPcHint: () => set((state) => ({ pc: nextHint(state.pc) })),

      completePcBuild: () => {
        const current = get();
        const today = localDayString();
        const name = learnerFirstName(current.profileSettings, current.authUser);
        const prevXp = calculateTotalXp(current.completions, LESSON_XP_BY_KEY, current.labBonusXp, current.xpSpent);
        const nextBonus = current.labBonusXp + 120;
        const nextXp = calculateTotalXp(current.completions, LESSON_XP_BY_KEY, nextBonus, current.xpSpent);
        const nextStreak = recordActivity(current.streak, today);
        const prevDaily = ensureDailyActivity(current.dailyActivity, today);
        const nextDaily = { ...prevDaily, labsCompleted: prevDaily.labsCompleted + 1 };
        const levelUp = maybeLevelUp(prevXp, nextXp, current.profileSettings.soundEffects);
        if (!levelUp) {
          playSfx('postBeep', { enabled: current.profileSettings.soundEffects });
        }
        set({
          completion: summarizePcBuild(current.pc, name),
          labBonusXp: nextBonus,
          streak: nextStreak,
          dailyActivity: nextDaily,
          lastMistake: null,
          ...(levelUp ? { levelUpEvent: levelUp } : {}),
        });
        void persistOrQueue(
          get,
          set,
          { type: 'save-lab-bonus-xp', payload: nextBonus },
          () => services.progress.saveLabBonusXp(nextBonus),
        );
        void persistOrQueue(
          get,
          set,
          { type: 'save-streak', payload: nextStreak },
          () => services.progress.saveStreak(nextStreak),
        );
        if (!get().isGuest && get().authUser) {
          void syncCurrentUserLeaderboard(get)
            .then(() => get().refreshLeaderboard())
            .catch(() => undefined);
        }
        get().navigate('complete');
      },

      selectNetworkDevice: (device) =>
        set((state) => ({ net: selectDevice(state.net, device) })),

      placeNetworkDevice: (spot, draggedDevice) => {
        const { state, placed } = placeDevice(get().net, spot, draggedDevice);
        set({
          net: state,
          lastMistake: placed ? null : buildLabMistake('net', state.message),
        });
        playSfx(placed ? 'snap' : 'error', { enabled: get().profileSettings.soundEffects });
        return placed;
      },

      openNetworkConfig: (device) => {
        if (device === 'hub') {
          set((state) => ({
            net: {
              ...state.net,
              message: 'The hub needs no IP setup. It repeats traffic across ports.',
            },
          }));
          return;
        }

        set((state) => ({
          net: {
            ...state.net,
            openDevice: device,
            errors: {},
          },
        }));
      },

      closeNetworkConfig: () =>
        set((state) => ({
          net: {
            ...state.net,
            openDevice: null,
            errors: {},
          },
        })),

      saveNetworkConfig: (config) => {
        const { state, saved } = saveDeviceConfig(get().net, config);
        const errText = Object.values(state.errors).filter(Boolean).join(' ') || state.message;
        set({
          net: state,
          lastMistake: saved ? null : buildLabMistake('net', errText),
        });
        playSfx(saved ? 'ping' : 'error', { enabled: get().profileSettings.soundEffects });
        return saved;
      },

      completeNetworkBuild: () => {
        const current = get();
        const today = localDayString();
        const name = learnerFirstName(current.profileSettings, current.authUser);
        const prevXp = calculateTotalXp(current.completions, LESSON_XP_BY_KEY, current.labBonusXp, current.xpSpent);
        const nextBonus = current.labBonusXp + 150;
        const nextXp = calculateTotalXp(current.completions, LESSON_XP_BY_KEY, nextBonus, current.xpSpent);
        const nextStreak = recordActivity(current.streak, today);
        const prevDaily = ensureDailyActivity(current.dailyActivity, today);
        const nextDaily = { ...prevDaily, labsCompleted: prevDaily.labsCompleted + 1 };
        const levelUp = maybeLevelUp(prevXp, nextXp, current.profileSettings.soundEffects);
        if (!levelUp) {
          playSfx('ping', { enabled: current.profileSettings.soundEffects });
        }
        set({
          completion: summarizeNetworkBuild(current.net, name),
          labBonusXp: nextBonus,
          streak: nextStreak,
          dailyActivity: nextDaily,
          lastMistake: null,
          ...(levelUp ? { levelUpEvent: levelUp } : {}),
        });
        void persistOrQueue(
          get,
          set,
          { type: 'save-lab-bonus-xp', payload: nextBonus },
          () => services.progress.saveLabBonusXp(nextBonus),
        );
        void persistOrQueue(
          get,
          set,
          { type: 'save-streak', payload: nextStreak },
          () => services.progress.saveStreak(nextStreak),
        );
        if (!get().isGuest && get().authUser) {
          void syncCurrentUserLeaderboard(get)
            .then(() => get().refreshLeaderboard())
            .catch(() => undefined);
        }
        get().navigate('complete');
      },

      selectQuizChoice: (choiceIndex) =>
        set((state) => (state.quiz ? { quiz: selectChoice(state.quiz, choiceIndex) } : {})),

      submitQuizAnswer: () => {
        const current = get();
        if (!current.quiz) return;
        const nextQuiz = submitAnswer(current.quiz);
        if (nextQuiz === current.quiz) return;
        const last = nextQuiz.answers[nextQuiz.answers.length - 1];
        const q = current.quiz.questions[current.quiz.index];
        const mistake = last && !last.correct && q ? buildQuizMistake(q, last.choiceIndex) : null;
        set({ quiz: nextQuiz, lastMistake: mistake });
        if (last?.correct) {
          playSfx('combo', {
            enabled: current.profileSettings.soundEffects,
            combo: currentCombo(nextQuiz.answers),
          });
        } else {
          playSfx('error', { enabled: current.profileSettings.soundEffects });
        }
      },

      nextQuizQuestion: () => {
        const session = get().quiz;
        if (!session || !session.submitted) return;

        const next = nextQuestion(session);
        if (!isFinished(next)) {
          set({ quiz: next });
          return;
        }

        const parsed = parseLessonKey(next.lessonKey);
        const track = parsed ? TRACKS[parsed.trackId as keyof typeof TRACKS] : undefined;
        const lessonIdx = parsed ? parsed.number - 1 : -1;
        const lesson = track?.lessons[lessonIdx];
        const following = track?.lessons[lessonIdx + 1];
        const score = scoreQuiz(next);
        const passed = isQuizPassed(score.correct, score.total);

        // Passing the quiz completes the lesson. Saving twice keeps one record (idempotent).
        if (passed) get().recordLessonResult(next.lessonKey, score.correct, score.total);

        const progress = track
          ? getTrackProgress(track.id, get().completions)
          : null;
        const followingLock = progress?.lessons[lessonIdx + 1]?.lockMessage;
        const followingMeta = following
          ? `${following.minutes} min · +${following.xp} XP`
          : '';

        const name = learnerFirstName(get().profileSettings, get().authUser);
        set({
          quiz: null,
          lastMistake: null,
          completion: summarizeQuiz(
            {
              lessonTitle: lesson && parsed ? lessonLabel(lesson, lessonIdx) : 'this lesson',
              lessonXp: lesson?.xp ?? 0,
              score,
              passed,
              passMark: DEFAULT_PASS_MARK,
              next: following
                ? [
                  lessonLabel(following, lessonIdx + 1),
                  followingLock ?? following.subtitle,
                  followingMeta,
                ]
                : ['Back to the curriculum', 'Pick your next lesson', 'Keep your streak going'],
            },
            name,
          ),
        });
        get().navigate('complete');
      },

      loadCompletions: async () => {
        try {
          const saved = await services.progress.loadLessonCompletions();
          if (saved.length === 0) return;
          set((state) => ({
            completions: saved.reduce(
              (all, c) => recordCompletion(all, c),
              state.completions,
            ),
          }));
        } catch {
          // Progress could not be read (private mode, storage error): start with none.
        }
      },

      recordLessonResult: (lessonKey, correct, total) => {
        const completion: LessonCompletion = {
          lessonKey,
          correct,
          total,
          completedAt: new Date().toISOString(),
        };
        const current = get();
        const today = localDayString();
        const prevXp = calculateTotalXp(current.completions, LESSON_XP_BY_KEY, current.labBonusXp, current.xpSpent);
        const nextCompletions = recordCompletion(current.completions, completion);
        const nextXp = calculateTotalXp(nextCompletions, LESSON_XP_BY_KEY, current.labBonusXp, current.xpSpent);
        const nextStreak = recordActivity(current.streak, today);
        const prevDaily = ensureDailyActivity(current.dailyActivity, today);
        const nextDaily = {
          ...prevDaily,
          quizzesPassed: prevDaily.quizzesPassed + 1,
          perfectQuizzes: prevDaily.perfectQuizzes + (correct === total ? 1 : 0),
        };
        const levelUp = maybeLevelUp(prevXp, nextXp, current.profileSettings.soundEffects);
        set({
          completions: nextCompletions,
          streak: nextStreak,
          dailyActivity: nextDaily,
          ...(levelUp ? { levelUpEvent: levelUp } : {}),
        });
        void persistOrQueue(
          get,
          set,
          { type: 'complete-lesson', payload: completion },
          () => services.progress.saveLessonCompletion(completion),
        );
        void persistOrQueue(
          get,
          set,
          { type: 'save-streak', payload: nextStreak },
          () => services.progress.saveStreak(nextStreak),
        );
        if (!get().isGuest && get().authUser) {
          void syncCurrentUserLeaderboard(get)
            .then(() => get().refreshLeaderboard())
            .catch(() => undefined);
        }
      },

      updateProfileSettings: (patch) =>
        set((state) => ({
          profileSettings: { ...state.profileSettings, ...patch },
        })),

      setChatOpen: (open) =>
        set((state) => {
          if (open && !state.chat.hasOpened) {
            return {
              chat: {
                ...state.chat,
                open: true,
                hasOpened: true,
                messages: [{ id: nextMsgId(), role: 'bot', text: services.studyBuddy.greeting }],
              },
            };
          }
          return { chat: { ...state.chat, open } };
        }),

      sendChatMessage: (raw) => {
        const text = raw.trim();
        if (!text) return;

        const today = localDayString();
        const prevDaily = ensureDailyActivity(get().dailyActivity, today);
        set({
          dailyActivity: { ...prevDaily, studyBuddyMessages: prevDaily.studyBuddyMessages + 1 },
        });

        const appendBot = (reply: string) =>
          set((state) => ({
            chat: {
              ...state.chat,
              isLoading: false,
              messages: [...state.chat.messages, { id: nextMsgId(), role: 'bot', text: reply }],
            },
          }));

        const history = get().chat.messages.map((m) => ({
          role: m.role === 'me' ? ('user' as const) : ('model' as const),
          text: m.text,
        }));

        const state = get();
        const currentLesson =
          state.learnKey ??
          state.quiz?.lessonKey ??
          (state.view === 'lesson' ? (state.activeLab === 'net' ? 'net-lab' : 'hw-lab') : undefined);

        const reply = services.studyBuddy.reply(text, {
          history,
          currentLesson,
          recentMistake: state.lastMistake?.summary,
          apiKey: state.profileSettings.geminiApiKey || undefined,
        });

        if (typeof reply === 'string') {
          set((state) => ({
            chat: {
              ...state.chat,
              showSuggestions: false,
              isLoading: false,
              messages: [...state.chat.messages, { id: nextMsgId(), role: 'me', text }],
            },
          }));
          appendBot(reply);
        } else {
          set((state) => ({
            chat: {
              ...state.chat,
              showSuggestions: false,
              isLoading: true,
              messages: [...state.chat.messages, { id: nextMsgId(), role: 'me', text }],
            },
          }));
          reply
            .then(appendBot)
            .catch(() => {
              appendBot('I couldn’t reach the study buddy right now. Try again in a moment.');
            });
        }
      },

      resetAll: () =>
        set({
          view: 'login',
          authUser: null,
          isGuest: false,
          isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
          pendingSyncCount: 0,
          isSyncing: false,
          activeLab: 'pc',
          theme: 'dark',
          track: 'hw',
          searchQuery: '',
          practiceFilter: 'all',
          achievementFilter: 'all',
          leaderboardPeriod: 'w',
          lessonSeconds: 42,
          setupModal: createInitialSetupModal(),
          pc: createInitialPcState(),
          net: createInitialNetState(),
          completion: null,
          quiz: null,
          learnKey: null,
          lastMistake: null,
          completions: [],
          streak: createInitialStreak(),
          labBonusXp: 0,
          xpSpent: 0,
          dailyActivity: createDailyActivity(localDayString()),
          leaderboard: [],
          classrooms: [],
          selectedClassroomId: null,
          arenaTab: 'duel',
          arenaStats: createInitialArenaStats(),
          activeDuel: null,
          openClassroomDuels: [],
          opponentProgress: null,
          profileLoaded: false,
          levelUpEvent: null,
          profileSettings: createInitialProfileSettings(),
          chat: createInitialChatState(),
          toastMessage: null,
          toastTick: 0,
        }),
    }),
    {
      name: 'streakbyte-session',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        theme: state.theme,
        profileSettings: state.profileSettings,
        authUser: state.authUser,
        isGuest: state.isGuest,
        dailyActivity: state.dailyActivity,
      }),
    },
  ),
);
