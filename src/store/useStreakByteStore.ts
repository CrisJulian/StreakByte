import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { getStudyBuddyReply, STUDY_BUDDY_GREETING } from '../data/studyBuddy';
import type {
  AchievementFilter,
  CableType,
  ChatState,
  CompletionSummary,
  LabId,
  LeaderboardPeriod,
  NetDeviceConfig,
  NetDeviceId,
  NetFormErrors,
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
];

export const PC_SLOT_TO_PART: Record<PcSlotId, PcPartId> = {
  A1: 'ram',
  A2: 'ram',
  B1: 'ram',
  B2: 'ram',
  M2: 'm2',
  PCIE: 'gpu',
  PWR: 'psu',
};

export const PC_HINTS: Record<PcPartId, string> = {
  ram: 'RAM goes in the memory slots, the four tall slots at the top.',
  m2: 'The M.2 SSD goes in the M.2 slot under the CPU.',
  gpu: 'The graphics card goes in the long PCIe x16 slot.',
  psu: 'Power connects at the 24-pin connector on the right.',
};

const PC_SUCCESS_COPY: Record<PcPartId, string> = {
  ram: 'RAM seated. Match the notch and press until the clips click.',
  m2: 'M.2 SSD installed and secured.',
  gpu: 'Graphics card seated in the PCIe x16 slot.',
  psu: '24-pin power cable connected.',
};

export const NET_DEVICE_NAMES: Record<NetDeviceId, string> = {
  pc: 'PC',
  laptop: 'Laptop',
  hub: 'Hub',
};

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

function isValidIpv4(value: string): boolean {
  return (
    /^(\d{1,3})(\.\d{1,3}){3}$/.test(value) &&
    value.split('.').every((octet) => Number(octet) <= 255)
  );
}

function createInitialPcState(): PcBuildState {
  return {
    selectedPart: null,
    ram: {},
    m2: false,
    gpu: false,
    psu: false,
    ok: 0,
    bad: 0,
    message: 'Select a part in the tray, then tap its slot on the board.',
    hintSlots: [],
    hintTick: 0,
  };
}

function createInitialNetState(): NetworkLabState {
  return {
    selectedDevice: null,
    placed: { pc: true, laptop: true, hub: false },
    cfg: {
      pc: { ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1', cab: 'eth' },
    },
    savedDevices: {},
    openDevice: 'laptop',
    bad: 0,
    issues: [],
    message: 'Click PC or Laptop to configure its IP address, then test the connection.',
    errors: {},
  };
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

      selectPcPart: (part) =>
        set((state) => {
          const next = state.pc.selectedPart === part ? null : part;
          return {
            pc: {
              ...state.pc,
              selectedPart: next,
              message: next
                ? 'Now tap the matching slot on the board, or drag the part onto it.'
                : state.pc.message,
            },
          };
        }),

      placePcPart: (slotId, draggedPart) => {
        const state = get();
        const part = draggedPart ?? state.pc.selectedPart;

        if (!part) {
          set({
            pc: {
              ...state.pc,
              message: 'Select a part in the tray first, then tap a slot on the board.',
            },
          });
          return false;
        }

        const want = PC_SLOT_TO_PART[slotId];
        if (part !== want) {
          set({
            pc: {
              ...state.pc,
              bad: state.pc.bad + 1,
              message: `Not there. ${PC_HINTS[part]}`,
            },
          });
          return false;
        }

        const isRamSlot = slotId === 'A1' || slotId === 'A2' || slotId === 'B1' || slotId === 'B2';
        const alreadyFilled = isRamSlot
          ? Boolean(state.pc.ram[slotId])
          : want === 'm2'
            ? state.pc.m2
            : want === 'gpu'
              ? state.pc.gpu
              : state.pc.psu;

        if (alreadyFilled) {
          set({
            pc: {
              ...state.pc,
              message: 'That slot already has a part installed.',
            },
          });
          return false;
        }

        if (want === 'ram' && Object.keys(state.pc.ram).length >= 2) {
          set({
            pc: {
              ...state.pc,
              selectedPart: null,
              message: 'Both RAM sticks are already installed.',
            },
          });
          return false;
        }

        const nextRam = isRamSlot ? { ...state.pc.ram, [slotId]: true } : state.pc.ram;
        const nextM2 = want === 'm2' ? true : state.pc.m2;
        const nextGpu = want === 'gpu' ? true : state.pc.gpu;
        const nextPsu = want === 'psu' ? true : state.pc.psu;

        const partExhausted =
          (want === 'ram' && Object.keys(nextRam).length >= 2) ||
          (want === 'm2' && nextM2) ||
          (want === 'gpu' && nextGpu) ||
          (want === 'psu' && nextPsu);

        set({
          pc: {
            ...state.pc,
            ram: nextRam,
            m2: nextM2,
            gpu: nextGpu,
            psu: nextPsu,
            ok: state.pc.ok + 1,
            selectedPart: partExhausted && state.pc.selectedPart === want ? null : state.pc.selectedPart,
            message: PC_SUCCESS_COPY[want],
          },
        });
        return true;
      },

      triggerPcHint: () => {
        const { pc } = get();
        const ramDone = Object.keys(pc.ram).length >= 2;
        if (!ramDone) {
          set({
            pc: {
              ...pc,
              message: `Insert the RAM. ${PC_HINTS.ram} Use A2 and B2 for dual-channel.`,
              hintSlots: ['A2', 'B2'],
              hintTick: pc.hintTick + 1,
            },
          });
          return;
        }
        if (!pc.m2) {
          set({
            pc: {
              ...pc,
              message: `Install the M.2 SSD. ${PC_HINTS.m2}`,
              hintSlots: ['M2'],
              hintTick: pc.hintTick + 1,
            },
          });
          return;
        }
        if (!pc.gpu) {
          set({
            pc: {
              ...pc,
              message: `Install the graphics card. ${PC_HINTS.gpu}`,
              hintSlots: ['PCIE'],
              hintTick: pc.hintTick + 1,
            },
          });
          return;
        }
        if (!pc.psu) {
          set({
            pc: {
              ...pc,
              message: `Connect the power cables. ${PC_HINTS.psu}`,
              hintSlots: ['PWR'],
              hintTick: pc.hintTick + 1,
            },
          });
          return;
        }
        set({
          pc: {
            ...pc,
            message: 'All parts are installed. Press Check build.',
            hintSlots: [],
          },
        });
      },

      completePcBuild: () => {
        const { pc } = get();
        const missedDual = !(pc.ram.A2 && pc.ram.B2);
        const usedSlots = Object.keys(pc.ram).sort().join(' and ') || 'A1 and B1';
        const acc =
          pc.ok + pc.bad > 0
            ? Math.round((pc.ok / (pc.ok + pc.bad + (missedDual ? 1 : 0))) * 100)
            : 80;

        set({
          completion: {
            title: 'Nice build, Mika!',
            subtitle: 'You installed 5 of 5 parts and kept your streak alive.',
            xp: '+120',
            accuracy: `${acc}%`,
            partsLabel: 'Parts',
            partsValue: '5 / 5',
            review: [
              [
                'Dual-channel RAM',
                missedDual ? `You used slots ${usedSlots}` : 'Slots A2 and B2 matched',
              ],
              ['DDR4 vs DDR5', 'Not compatible'],
              ['RAM notch', 'Check the orientation'],
            ],
            next: ['Lesson 4: Storage', 'HDD, SSD and M.2', '6 min · +120 XP'],
          },
        });
        get().navigate('complete');
      },

      selectNetworkDevice: (device) =>
        set((state) => {
          const next = state.net.selectedDevice === device ? null : device;
          return {
            net: {
              ...state.net,
              selectedDevice: next,
              message: next
                ? `Now tap the ${NET_DEVICE_NAMES[next]} spot on the diagram, or drag it onto the spot.`
                : state.net.message,
            },
          };
        }),

      placeNetworkDevice: (spot, draggedDevice) => {
        const state = get();
        const dev = draggedDevice ?? state.net.selectedDevice;

        if (!dev) {
          set({
            net: {
              ...state.net,
              message: 'Select a device in the tray first, then tap a dashed spot.',
            },
          });
          return false;
        }

        if (dev !== spot) {
          set({
            net: {
              ...state.net,
              bad: state.net.bad + 1,
              message: `${NET_DEVICE_NAMES[dev]} belongs on the ${NET_DEVICE_NAMES[dev]} spot.`,
            },
          });
          return false;
        }

        set({
          net: {
            ...state.net,
            placed: { ...state.net.placed, [dev]: true },
            selectedDevice: state.net.selectedDevice === dev ? null : state.net.selectedDevice,
            message:
              dev === 'hub'
                ? 'Hub placed. The router already has free ports, so the hub is optional.'
                : `${NET_DEVICE_NAMES[dev]} placed. Click it to set it up.`,
          },
        });
        return true;
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
        const state = get();
        const device = state.net.openDevice;
        if (!device) return false;

        const ip = config.ip.trim();
        const mask = config.mask.trim();
        const gw = config.gw.trim();
        const cab = config.cab;
        const errors: NetFormErrors = {};
        const nextIssues = new Set(state.net.issues);

        if (!isValidIpv4(ip)) {
          errors.ip = 'Enter four numbers from 0 to 255, like 192.168.1.20.';
        } else if (ip === '192.168.1.1') {
          errors.ip = '192.168.1.1 belongs to the router. Pick 2 to 254.';
        } else if (
          !ip.startsWith('192.168.1.') ||
          Number(ip.split('.')[3]) < 2 ||
          Number(ip.split('.')[3]) > 254
        ) {
          errors.ip = 'Use 192.168.1.x with x from 2 to 254, on the router’s network.';
          nextIssues.add('IP address basics');
        } else if (
          Object.entries(state.net.cfg).some(
            ([key, existing]) => key !== device && existing?.ip === ip,
          )
        ) {
          errors.ip = 'Another device on this network already uses that address.';
        }

        if (mask !== '255.255.255.0') {
          errors.mask = 'Use 255.255.255.0 for this /24 local network.';
          nextIssues.add('Subnet masks');
        }

        if (gw !== '192.168.1.1') {
          errors.gw = 'Set the gateway to the router IP: 192.168.1.1.';
          nextIssues.add('Gateways');
        }

        if (!cab) {
          errors.cab = 'Choose a cable.';
        }

        if (Object.keys(errors).length > 0) {
          set({
            net: {
              ...state.net,
              bad: state.net.bad + 1,
              issues: [...nextIssues],
              errors,
            },
          });
          return false;
        }

        set({
          net: {
            ...state.net,
            cfg: { ...state.net.cfg, [device]: { ip, mask, gw, cab } },
            savedDevices: { ...state.net.savedDevices, [device]: true },
            openDevice: null,
            errors: {},
            message: `${NET_DEVICE_NAMES[device]} saved (${ip}). Press Test connection to verify the network.`,
          },
        });
        return true;
      },

      completeNetworkBuild: () => {
        const { net } = get();
        const acc = Math.max(60, 100 - net.bad * 10);

        set({
          completion: {
            title: 'Nice build, Mika!',
            subtitle: 'Your PC and laptop reached the router and passed the connection check.',
            xp: '+150',
            accuracy: `${acc}%`,
            partsLabel: 'Devices',
            partsValue: '2 / 2',
            review: [
              ['IP address basics', 'Each host needs a unique address on 192.168.1.0/24'],
              ['Subnet masks', '255.255.255.0 keeps both devices on the same LAN'],
            ],
            next: ['Subnet masks', 'Split one network into parts', '6 min · +120 XP'],
          },
        });
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
                messages: [{ id: nextMsgId(), role: 'bot', text: STUDY_BUDDY_GREETING }],
              },
            };
          }
          return { chat: { ...state.chat, open } };
        }),

      sendChatMessage: (raw) => {
        const text = raw.trim();
        if (!text) return;
        const reply = getStudyBuddyReply(text);
        set((state) => ({
          chat: {
            ...state.chat,
            showSuggestions: false,
            messages: [
              ...state.chat.messages,
              { id: nextMsgId(), role: 'me', text },
              { id: nextMsgId(), role: 'bot', text: reply },
            ],
          },
        }));
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
