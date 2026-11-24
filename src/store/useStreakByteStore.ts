import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { services } from '../composition';
import { createInitialNetState, placeDevice, saveDeviceConfig, selectDevice } from '../domain/rules/network';
import { createInitialPcState, nextHint, placePart, selectPart } from '../domain/rules/pcBuild';
import { summarizeNetworkBuild, summarizePcBuild } from '../domain/rules/summaries';
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
];

export { PC_HINTS, PC_SLOT_TO_PART } from '../domain/rules/pcBuild';
export { NET_DEVICE_NAMES } from '../domain/rules/network';

export const CABLE_COLORS: Record<CableType, string> = {
  eth: '#22d3ee',
  fiber: '#22d3ee',
  coax: '#a3add1',
};

export function parseHash(hash: string): { view: ViewId; lab?: LabId } {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [rawHead, sub] = (raw || 'dashboard').split('/');
  const head = rawHead === 'sandboxes' ? 'lesson' : rawHead;
  const view: ViewId = (VALID_VIEWS as readonly string[]).includes(head)
    ? (head as ViewId)
    : 'dashboard';

  if (view === 'lesson') {
    return { view, lab: sub === 'network' ? 'net' : 'pc' };
  }
  return { view };
}

function createInitialSetupModal(): SetupModalState {
  return {
    open: false,
    target: 'pc',
    title: 'Lesson 3: Memory (RAM)',
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
  };
}

function createInitialChatState(): ChatState {
  return {
    open: false,
    hasOpened: false,
    showSuggestions: true,
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
  profileSettings: ProfileSettings;
  chat: ChatState;
  toastMessage: string | null;
  toastTick: number;

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
      view: 'dashboard',
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
      profileSettings: createInitialProfileSettings(),
      chat: createInitialChatState(),
      toastMessage: null,
      toastTick: 0,

      syncFromHash: (hash) => {
        const parsed = parseHash(hash);
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
            title: title || (isNet ? 'Final level: Build a network' : 'Lesson 3: Memory (RAM)'),
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
              messages: [...state.chat.messages, { id: nextMsgId(), role: 'bot', text: reply }],
            },
          }));

        set((state) => ({
          chat: {
            ...state.chat,
            showSuggestions: false,
            messages: [...state.chat.messages, { id: nextMsgId(), role: 'me', text }],
          },
        }));

        // The port may answer synchronously (offline responder) or with a Promise (server-backed).
        const reply = services.studyBuddy.reply(text);
        if (typeof reply === 'string') {
          appendBot(reply);
        } else {
          reply
            .then(appendBot)
            .catch(() => appendBot('I couldn’t reach the study buddy right now. Try again in a moment.'));
        }
      },

      resetAll: () =>
        set({
          view: 'dashboard',
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
      }),
    },
  ),
);
