export type ViewId =
  | 'dashboard'
  | 'curriculum'
  | 'lesson'
  | 'practice'
  | 'achievements'
  | 'leaderboard'
  | 'profile'
  | 'complete'
  | 'login'
  | 'quiz'
  | 'learn';

export type TrackId = 'hw' | 'net';
export type LabId = 'pc' | 'net';
export type ThemeMode = 'dark' | 'light';
export type SessionMode = 'guided' | 'timed';
export type SessionLength = '5' | '10';

export type PcPartId = 'ram' | 'm2' | 'gpu' | 'psu';
export type PcSlotId = 'A1' | 'A2' | 'B1' | 'B2' | 'M2' | 'PCIE' | 'PWR';

export type NetDeviceId = 'pc' | 'laptop' | 'hub';
export type NetConfigurableDeviceId = 'pc' | 'laptop';
export type CableType = 'eth' | 'fiber' | 'coax';

export type PracticeFilter = 'all' | 'need' | 'hw' | 'net';
export type AchievementFilter = 'all' | 'on' | 'off';
export type LeaderboardPeriod = 'w' | 'a';

export type IconName =
  | 'home'
  | 'book'
  | 'target'
  | 'medal'
  | 'trophy'
  | 'bolt'
  | 'flame'
  | 'check'
  | 'play'
  | 'cpu'
  | 'net'
  | 'term'
  | 'bell'
  | 'lock'
  | 'x'
  | 'send'
  | 'wrench'
  | 'clock'
  | 'bulb'
  | 'back'
  | 'warn'
  | 'search'
  | 'sun'
  | 'moon';

export interface LessonReference {
  title: string;
  url: string;
}

export interface CurriculumLesson {
  title: string;
  subtitle: string;
  minutes: number;
  xp: number;
  /** "final" = Final Lesson (opens a lab). It stays locked until every lesson before it is complete. */
  kind: 'learn' | 'final';
}

export interface CurriculumTrack {
  id: TrackId;
  heading: string;
  description: string;
  badge: string;
  defaultTarget: 'pc' | 'network';
  lessons: CurriculumLesson[];
}

export interface PracticeItem {
  title: string;
  meta: string;
  best: number;
  state: 'need' | 'ok';
  track: TrackId;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: IconName;
  accent?: 'cyan' | 'amber';
  progressPct?: number;
  progressText?: string;
  statusText?: string;
}

export interface LeaderboardStudent {
  name: string;
  initial: string;
  weeklyXp: number;
  allTimeXp: number;
  streakDays: number;
  isYou?: boolean;
}

export interface PcBuildState {
  selectedPart: PcPartId | null;
  ram: Partial<Record<'A1' | 'A2' | 'B1' | 'B2', boolean>>;
  m2: boolean;
  gpu: boolean;
  psu: boolean;
  ok: number;
  bad: number;
  message: string;
  hintSlots: PcSlotId[];
  hintTick: number;
}

export interface NetDeviceConfig {
  ip: string;
  mask: string;
  gw: string;
  cab: CableType;
}

export interface NetFormErrors {
  ip?: string;
  mask?: string;
  gw?: string;
  cab?: string;
}

export interface NetworkLabState {
  selectedDevice: NetDeviceId | null;
  placed: Record<NetDeviceId, boolean>;
  cfg: Partial<Record<NetConfigurableDeviceId, NetDeviceConfig>>;
  savedDevices: Partial<Record<NetConfigurableDeviceId, boolean>>;
  openDevice: NetConfigurableDeviceId | null;
  bad: number;
  issues: string[];
  message: string;
  errors: NetFormErrors;
}

export interface CompletionSummary {
  title: string;
  subtitle: string;
  xp: string;
  accuracy: string;
  partsLabel: string;
  partsValue: string;
  review: [string, string][];
  next: [string, string, string];
}

export interface SetupModalState {
  open: boolean;
  target: 'pc' | 'network';
  title: string;
  mode: SessionMode;
  length: SessionLength;
}

export interface ProfileSettings {
  displayName: string;
  email: string;
  dailyGoal: '5' | '10';
  dailyReminder: boolean;
  soundEffects: boolean;
  hintsByDefault: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'bot' | 'me';
  text: string;
}

export interface ChatState {
  open: boolean;
  hasOpened: boolean;
  showSuggestions: boolean;
  messages: ChatMessage[];
}
