import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TRACKS } from '../curriculum';
import { LESSON_CONTENT } from '../lessons';
import { QUIZ_BANK } from '../quizBank';

const allKeys = Object.values(TRACKS).flatMap((t) => t.lessons.map((_, i) => `${t.id}-${i + 1}`));
const allImages = Object.values(LESSON_CONTENT).flatMap((c) =>
  c.parts.flatMap((p) => p.images.map((image) => ({ key: c.key, image }))),
);
const PUBLIC_DIR = join(process.cwd(), 'public', 'lessons');

describe('lesson content', () => {
  it('has a Learn page for every lesson in the curriculum, and nothing extra', () => {
    expect(Object.keys(LESSON_CONTENT).sort()).toEqual([...allKeys].sort());
  });

  it('every lesson has a goal, key points, common mistakes and at least one reference', () => {
    for (const c of Object.values(LESSON_CONTENT)) {
      expect(c.goal.trim().length).toBeGreaterThan(0);
      expect(c.keyPoints.length).toBeGreaterThan(0);
      expect(c.commonMistakes.length).toBeGreaterThan(0);
      expect(c.references.length).toBeGreaterThan(0);
      expect(c.parts.length).toBeGreaterThan(0);
    }
  });

  it('every lesson has definitions, or a note saying why not', () => {
    for (const c of Object.values(LESSON_CONTENT)) {
      expect(c.definitions.length > 0 || !!c.definitionsNote).toBe(true);
    }
  });

  it('every reference is a real http(s) link with a title', () => {
    for (const c of Object.values(LESSON_CONTENT)) {
      for (const ref of c.references) {
        expect(ref.title.trim().length).toBeGreaterThan(0);
        expect(ref.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('Final Lessons have build steps', () => {
    expect((LESSON_CONTENT['hw-6'].steps ?? []).length).toBeGreaterThan(0);
    expect((LESSON_CONTENT['net-5'].steps ?? []).length).toBeGreaterThan(0);
  });

  it('every lesson has a quiz with four questions', () => {
    for (const key of allKeys) expect((QUIZ_BANK[key] ?? []).length).toBe(4);
  });
});

describe('lesson images', () => {
  it('every image has alt text, a caption and a JPG or WebP file name', () => {
    for (const { image } of allImages) {
      expect(image.alt.trim().length).toBeGreaterThan(0);
      expect(image.caption.trim().length).toBeGreaterThan(0);
      expect(image.file).toMatch(/^[a-z0-9-]+\.(jpg|webp)$/);
    }
  });

  it('an image marked available has its file, a credit line and stays small', () => {
    for (const { key, image } of allImages.filter((i) => i.image.available)) {
      const trackId = key.split('-')[0];
      const path = join(PUBLIC_DIR, trackId, image.file);
      expect(existsSync(path), `${path} is missing`).toBe(true);
      expect(image.credit && image.credit.trim().length > 0, `${image.file} needs a credit line`).toBe(true);
      expect(statSync(path).size, `${image.file} is over about 250 KB`).toBeLessThanOrEqual(250 * 1024);
    }
  });

  it('a picture file added to public/lessons must be switched on in the lesson data', () => {
    const switchedOn = new Set(
      allImages.filter((i) => i.image.available).map((i) => `${i.key.split('-')[0]}/${i.image.file}`),
    );
    for (const trackId of ['hw', 'net']) {
      const dir = join(PUBLIC_DIR, trackId);
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir).filter((f) => /\.(jpg|webp)$/i.test(f))) {
        expect(
          switchedOn.has(`${trackId}/${file}`),
          `${trackId}/${file} exists but no lesson has it with available: true`,
        ).toBe(true);
      }
    }
  });
});
