import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { QUIZ_BANK } from '../data/quizBank';
import { getTrackProgress, isLessonKeyLocked, lessonLabel, TRACKS } from '../data/curriculum';
import { LESSON_CONTENT } from '../data/lessons';
import type { LessonCompletion } from '../domain/entities/progress';
import type { QuizSession } from '../domain/entities/quiz';
import { DEFAULT_PASS_MARK, isQuizPassed, recordCompletion } from '../domain/rules/lessonProgress';
import {
  isFinished,
  nextQuestion,
  parseLessonKey,
  scoreQuiz,
  selectChoice,
  startQuiz,
  submitAnswer,
} from '../domain/rules/quiz';
import { services } from '../composition';
import type { AuthUser } from '../application/ports';
import { createInitialNetState, placeDevice, saveDeviceConfig, selectDevice } from '../domain/rules/network';
import { createInitialPcState, nextHint, placePart, selectPart } from '../domain/rules/pcBuild';
import { summarizeNetworkBuild, summarizePcBuild, summarizeQuiz } from '../domain/rules/summaries';
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
    displayName: 'Mika Reyes',
    email: 'mika.reyes@school.edu',
    dailyGoal: '5',
    dailyReminder: true,
    soundEffects: true,
    hintsByDefault: true,
    geminiApiKey: '',
  };
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

export interface StreakByteStore {
  view: ViewId;
  authUser: AuthUser | null;
  isGuest: boolean;
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
  /** Lessons whose quiz was passed. Locks and unlocks are derived from this. */
  completions: LessonCompletion[];
  profileSettings: ProfileSettings;
  chat: ChatState;
  toastMessage: string | null;
  toastTick: number;

  // Auth & session
  setAuthUser: (user: AuthUser | null) => void;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  loadAuthUser: () => Promise<AuthUser | null>;

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
      completions: [],
      profileSettings: createInitialProfileSettings(),
      chat: createInitialChatState(),
      toastMessage: null,
      toastTick: 0,

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
          view: 'dashboard',
          profileSettings: {
            ...get().profileSettings,
            displayName: 'Guest Learner',
            email: 'guest@streakbyte.local',
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
        set({ authUser: null, isGuest: false, view: 'login' });
        get().showToast('Logged out.');
        get().navigate('login');
      },

      loadAuthUser: async () => {
        try {
          const user = await services.auth.currentUser();
          if (user) {
            set({ authUser: user });
            return user;
          }
        } catch {
          // ignore
        }
        return null;
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
      setLeaderboardPeriod: (leaderboardPeriod) => set({ leaderboardPeriod }),

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
        set({ pc: state });
        return placed;
      },

      triggerPcHint: () => set((state) => ({ pc: nextHint(state.pc) })),

      completePcBuild: () => {
        set({ completion: summarizePcBuild(get().pc) });
        get().navigate('complete');
      },

      selectNetworkDevice: (device) =>
        set((state) => ({ net: selectDevice(state.net, device) })),

      placeNetworkDevice: (spot, draggedDevice) => {
        const { state, placed } = placeDevice(get().net, spot, draggedDevice);
        set({ net: state });
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
        set({ net: state });
        return saved;
      },

      completeNetworkBuild: () => {
        set({ completion: summarizeNetworkBuild(get().net) });
        get().navigate('complete');
      },

      selectQuizChoice: (choiceIndex) =>
        set((state) => (state.quiz ? { quiz: selectChoice(state.quiz, choiceIndex) } : {})),

      submitQuizAnswer: () =>
        set((state) => (state.quiz ? { quiz: submitAnswer(state.quiz) } : {})),

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

        set({
          quiz: null,
          completion: summarizeQuiz({
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
          }),
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
        set((state) => ({ completions: recordCompletion(state.completions, completion) }));
        void services.progress.saveLessonCompletion(completion).catch(() => undefined);
        void services.syncQueue
          .enqueue({ type: 'complete-lesson', payload: completion })
          .catch(() => undefined);
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

        const reply = services.studyBuddy.reply(text, {
          history,
          currentLesson: get().learnKey ?? undefined,
          apiKey: get().profileSettings.geminiApiKey || undefined,
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
          completions: [],
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
      }),
    },
  ),
);
