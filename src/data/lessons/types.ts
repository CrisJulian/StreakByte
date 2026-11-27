import type { LessonReference } from '../../types/streakbyte';

/**
 * One picture on a Learn page.
 * `available` is false until the real file is in public/lessons/<track>/ AND its license and
 * credit are confirmed.
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

export interface LessonTable {
  headers: string[];
  rows: string[][];
}

export type LessonBullet = string | { label: string; text: string };

export interface LessonBlock {
  heading?: string;
  paragraphs?: string[];
  bullets?: LessonBullet[];
  ordered?: string[];
  table?: LessonTable;
  images?: LessonImage[];
  /** Side-by-side image placement relative to text: 'left' (in front) or 'right' (in back). */
  imageSide?: 'left' | 'right';
}

export interface LessonSection {
  /** PDF section number, e.g. "1.1", "1.2", ..., "5.6". */
  number: string;
  /** Exact section title from the PDF. */
  title: string;
  blocks: LessonBlock[];
}

export interface LessonContent {
  /** "<track>-<lesson number>", the same key the quiz bank uses. */
  key: string;
  goal: string;
  sections: LessonSection[];
  keyPoints: string[];
  commonMistakes: string[];
  references: (LessonReference & { note?: string })[];
}
