import type { LessonImage } from './types';

const CHECK_TODO =
  'Open the source page, confirm the license (CC0, public domain, CC BY or CC BY-SA), author and credit line, save the picture under this file name, then set available to true.';
const FIND_TODO =
  'NO FREE IMAGE FOUND yet. Find a clear picture (CC0, public domain, CC BY or CC BY-SA), save it under this file name and add its credit line.';

/** Builds a picture entry. Nothing is "available" until a person adds the file and checks the license. */
export function img(
  file: string,
  alt: string,
  caption: string,
  opts: { credit?: string | null; sourcePage?: string; todo?: string } = {},
): LessonImage {
  return {
    file,
    available: false,
    alt,
    caption,
    credit: opts.credit ?? null,
    sourcePage: opts.sourcePage,
    todo: opts.todo ?? (opts.sourcePage ? CHECK_TODO : FIND_TODO),
  };
}
