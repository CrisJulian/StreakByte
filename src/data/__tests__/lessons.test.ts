import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TRACKS } from '../curriculum';
import { LESSON_CONTENT } from '../lessons';
import { QUIZ_BANK } from '../quizBank';

const allKeys = Object.values(TRACKS).flatMap((t) => t.lessons.map((_, i) => `${t.id}-${i + 1}`));
const allImages = Object.values(LESSON_CONTENT).flatMap((c) =>
  c.sections.flatMap((s) =>
    s.blocks.flatMap((b) => (b.images ?? []).map((image) => ({ key: c.key, image }))),
  ),
);
const PUBLIC_DIR = join(process.cwd(), 'public', 'lessons');

describe('lesson content', () => {
  it('has a Learn page for every lesson in the curriculum, and nothing extra', () => {
    expect(Object.keys(LESSON_CONTENT).sort()).toEqual([...allKeys].sort());
  });

  it('every lesson has a goal, numbered sections, key points, common mistakes and at least one reference', () => {
    for (const c of Object.values(LESSON_CONTENT)) {
      expect(c.goal.trim().length).toBeGreaterThan(0);
      expect(c.sections.length).toBeGreaterThan(0);
      for (const section of c.sections) {
        expect(section.number).toMatch(/^\d+\.\d+$/);
        expect(section.title.trim().length).toBeGreaterThan(0);
        expect(section.blocks.length).toBeGreaterThan(0);
      }
      expect(c.keyPoints.length).toBeGreaterThan(0);
      expect(c.commonMistakes.length).toBeGreaterThan(0);
      expect(c.references.length).toBeGreaterThan(0);
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

  it('Final Lessons have ordered build steps', () => {
    expect(
      LESSON_CONTENT['hw-6'].sections.some((s) => s.blocks.some((b) => (b.ordered ?? []).length > 0)),
    ).toBe(true);
    expect(
      LESSON_CONTENT['net-5'].sections.some((s) => s.blocks.some((b) => (b.ordered ?? []).length > 0)),
    ).toBe(true);
  });

  it('every lesson has a pool larger than one 15-question attempt', () => {
    for (const key of allKeys) expect((QUIZ_BANK[key] ?? []).length).toBeGreaterThanOrEqual(25);
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
