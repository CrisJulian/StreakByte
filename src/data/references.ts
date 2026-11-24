import type { LabId, LessonReference } from '../types/streakbyte';
import { LESSON_CONTENT } from './lessons';

/**
 * References shown at the bottom of each lab page. They come from the Final Lessons in the lesson
 * documents, so they are edited in src/data/lessons/*.ts and never duplicated here.
 */
export const LAB_REFERENCES: Record<LabId, LessonReference[]> = {
  pc: LESSON_CONTENT['hw-6'].references.map(({ title, url }) => ({ title, url })),
  net: LESSON_CONTENT['net-5'].references.map(({ title, url }) => ({ title, url })),
};
