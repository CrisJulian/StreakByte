import type { LessonReference } from '../../types/streakbyte';

/**
 * One picture on a Learn page.
 * `available` is false until the real file is in public/lessons/<track>/ AND its license and
 * credit are confirmed on the Wikimedia Commons page. Until then the page shows a labelled placeholder.
 */
export interface LessonImage {
  /** File name inside public/lessons/<track>/, e.g. "hw1-case.jpg". */
  file: string;
  available: boolean;
  alt: string;
  caption: string;
  /** Exact credit line to print under the picture, or null while it is unconfirmed. */
  credit: string | null;
  /** Commons (or other) page the picture comes from, if the document gave one. */
  sourcePage?: string;
  /** What a person still has to do for this picture. */
  todo?: string;
}

export interface LessonDefinition {
  term: string;
  text: string;
  /** Set when the document marks the claim VERIFY / NOT FOUND. Only shown in development builds. */
  verify?: string;
}

export interface LessonPart {
  name: string;
  does?: string;
  looksLike?: string;
  images: LessonImage[];
  verify?: string;
}

export interface LessonNote {
  title: string;
  text: string;
}

export interface LessonContent {
  /** "<track>-<lesson number>", the same key the quiz bank uses. */
  key: string;
  goal: string;
  definitions: LessonDefinition[];
  /** Shown instead of definitions when a lesson adds no new terms. */
  definitionsNote?: string;
  parts: LessonPart[];
  /** Build or install steps, in order. */
  steps?: { text: string; verify?: string }[];
  notes?: LessonNote[];
  keyPoints: string[];
  commonMistakes: string[];
  references: (LessonReference & { note?: string })[];
}
