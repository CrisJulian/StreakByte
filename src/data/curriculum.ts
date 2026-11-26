import type { DerivedTrackProgress, LessonCompletion } from '../domain/entities/progress';
import { parseLessonKey } from '../domain/rules/quiz';
import { deriveTrackProgress } from '../domain/rules/lessonProgress';
import type { CurriculumLesson, CurriculumTrack, TrackId } from '../types/streakbyte';

/**
 * Lesson order and titles follow the exported lesson documents.
 * Whether a lesson is done, current or locked is NOT stored here: it is derived from the
 * saved quiz results (see domain/rules/lessonProgress.ts).
 */
export const TRACKS: Record<TrackId, CurriculumTrack> = {
  hw: {
    id: 'hw',
    heading: 'Hardware Basics',
    description: 'Build and understand a computer, one short lesson at a time.',
    badge: 'RAM master',
    defaultTarget: 'pc',
    lessons: [
      {
        title: 'Inside the PC',
        subtitle: 'Case, motherboard, CPU and cooling',
        minutes: 5,
        xp: 110,
        kind: 'learn',
      },
      {
        title: 'The motherboard',
        subtitle: 'Sockets, slots and ports',
        minutes: 6,
        xp: 110,
        kind: 'learn',
      },
      {
        title: 'Memory (RAM)',
        subtitle: 'DIMM slots, DDR4 vs DDR5, dual-channel',
        minutes: 5,
        xp: 120,
        kind: 'learn',
      },
      {
        title: 'Storage',
        subtitle: 'HDD, SSD and M.2',
        minutes: 6,
        xp: 120,
        kind: 'learn',
      },
      {
        title: 'Power supply',
        subtitle: 'Wattage, cables and connectors',
        minutes: 6,
        xp: 120,
        kind: 'learn',
      },
      {
        title: 'Final Lesson: Build a PC',
        subtitle: 'Put the parts together in order, safely',
        minutes: 8,
        xp: 150,
        kind: 'final',
      },
    ],
  },
  net: {
    id: 'net',
    heading: 'Networking Basics',
    description: 'Connect devices and understand how they talk, one short lesson at a time.',
    badge: 'Network ninja',
    defaultTarget: 'network',
    lessons: [
      {
        title: 'What is a network?',
        subtitle: 'Devices, links and the internet',
        minutes: 5,
        xp: 110,
        kind: 'learn',
      },
      {
        title: 'IP address basics',
        subtitle: 'Addresses, masks and gateways',
        minutes: 6,
        xp: 120,
        kind: 'learn',
      },
      {
        title: 'Subnet masks',
        subtitle: 'Split one network into parts',
        minutes: 6,
        xp: 120,
        kind: 'learn',
      },
      {
        title: 'Routers and switches',
        subtitle: 'How traffic finds its way',
        minutes: 6,
        xp: 120,
        kind: 'learn',
      },
      {
        title: 'Final Lesson: Build a Network',
        subtitle: 'Wire up a small LAN and test it with ping',
        minutes: 8,
        xp: 150,
        kind: 'final',
      },
    ],
  },
};

/** Lookup map from lesson key (e.g. "hw-1") to base XP. */
export const LESSON_XP_BY_KEY: Record<string, number> = Object.fromEntries(
  (Object.keys(TRACKS) as TrackId[]).flatMap((trackId) =>
    TRACKS[trackId].lessons.map((lesson, idx) => [`${trackId}-${idx + 1}`, lesson.xp]),
  ),
);

/** "Lesson 3: Memory (RAM)" for normal lessons; Final Lessons already say "Final Lesson". */
export function lessonLabel(lesson: CurriculumLesson, index: number): string {
  return lesson.kind === 'final' ? lesson.title : `Lesson ${index + 1}: ${lesson.title}`;
}

/** The lab a Final Lesson opens. */
export function finalLessonLab(trackId: TrackId): 'pc' | 'network' {
  return trackId === 'net' ? 'network' : 'pc';
}

/** Unlock Final Lessons only on local dev server (`localhost` / `127.0.0.1`), never on deployed hosts or in tests/prod. */
function isLocalDevUnlock(): boolean {
  if (!import.meta.env.DEV || import.meta.env.MODE === 'test') return false;
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/** Status of every lesson in a track, worked out from the saved quiz results. */
export function getTrackProgress(
  trackId: TrackId,
  completions: readonly LessonCompletion[],
): DerivedTrackProgress {
  return deriveTrackProgress(
    trackId,
    TRACKS[trackId].lessons.map((l) => l.kind),
    completions,
    { unlockFinal: isLocalDevUnlock() },
  );
}

/** True for a Final Lesson key (e.g. "hw-6") whose earlier lessons are not all complete yet. */
export function isLessonKeyLocked(key: string, completions: readonly LessonCompletion[]): boolean {
  const parsed = parseLessonKey(key);
  if (!parsed || !(parsed.trackId in TRACKS)) return false;
  const progress = getTrackProgress(parsed.trackId as TrackId, completions);
  return progress.lessons[parsed.number - 1]?.status === 'lock';
}
