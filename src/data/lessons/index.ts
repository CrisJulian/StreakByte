import { HW_LESSONS } from './hw';
import { NET_LESSONS } from './net';
import type { LessonContent } from './types';

export type {
  LessonBlock,
  LessonBullet,
  LessonContent,
  LessonImage,
  LessonSection,
  LessonTable,
} from './types';

/** All Learn-page content, keyed "<track>-<lesson number>" (same keys as the quiz bank). */
export const LESSON_CONTENT: Record<string, LessonContent> = { ...HW_LESSONS, ...NET_LESSONS };
