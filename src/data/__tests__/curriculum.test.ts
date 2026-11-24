import { describe, expect, it } from 'vitest';
import type { LessonCompletion } from '../../domain/entities/progress';
import { getTrackProgress, isLessonKeyLocked, lessonLabel, TRACKS } from '../curriculum';

const done = (key: string): LessonCompletion => ({
  lessonKey: key,
  correct: 4,
  total: 4,
  completedAt: '2026-11-24T00:00:00.000Z',
});

describe('curriculum structure (matches the lesson documents)', () => {
  it('Hardware has lessons 1-5 and then the Final Lesson: Build a PC', () => {
    expect(TRACKS.hw.lessons.map((l) => l.title)).toEqual([
      'Inside the PC',
      'The motherboard',
      'Memory (RAM)',
      'Storage',
      'Power supply',
      'Final Lesson: Build a PC',
    ]);
    expect(TRACKS.hw.lessons.map((l) => l.kind)).toEqual([
      'learn', 'learn', 'learn', 'learn', 'learn', 'final',
    ]);
  });

  it('Networking has lessons 1-4 and then the Final Lesson: Build a Network', () => {
    expect(TRACKS.net.lessons.map((l) => l.title)).toEqual([
      'What is a network?',
      'IP address basics',
      'Subnet masks',
      'Routers and switches',
      'Final Lesson: Build a Network',
    ]);
    expect(TRACKS.net.lessons.map((l) => l.kind)).toEqual(['learn', 'learn', 'learn', 'learn', 'final']);
  });

  it('labels normal lessons with their number and Final Lessons by name', () => {
    expect(lessonLabel(TRACKS.hw.lessons[2], 2)).toBe('Lesson 3: Memory (RAM)');
    expect(lessonLabel(TRACKS.hw.lessons[5], 5)).toBe('Final Lesson: Build a PC');
  });
});

describe('locks are derived from completion', () => {
  it('locks each Final Lesson at the start, with the right message', () => {
    expect(getTrackProgress('hw', []).lessons[5].lockMessage).toBe('Finish lessons 1 to 5 to unlock');
    expect(getTrackProgress('net', []).lessons[4].lockMessage).toBe('Finish lessons 1 to 4 to unlock');
    expect(isLessonKeyLocked('hw-6', [])).toBe(true);
    expect(isLessonKeyLocked('net-5', [])).toBe(true);
    expect(isLessonKeyLocked('hw-3', [])).toBe(false);
  });

  it('unlocks the Hardware Final Lesson only after lessons 1 to 5', () => {
    const four = ['hw-1', 'hw-2', 'hw-3', 'hw-4'].map(done);
    expect(isLessonKeyLocked('hw-6', four)).toBe(true);
    expect(isLessonKeyLocked('hw-6', [...four, done('hw-5')])).toBe(false);
  });

  it('unlocks the Networking Final Lesson only after lessons 1 to 4', () => {
    const three = ['net-1', 'net-2', 'net-3'].map(done);
    expect(isLessonKeyLocked('net-5', three)).toBe(true);
    expect(isLessonKeyLocked('net-5', [...three, done('net-4')])).toBe(false);
  });

  it('does not unlock one track by finishing the other', () => {
    const allHw = [1, 2, 3, 4, 5].map((n) => done(`hw-${n}`));
    expect(isLessonKeyLocked('net-5', allHw)).toBe(true);
  });

  it('ignores keys it does not know', () => {
    expect(isLessonKeyLocked('nope-9', [])).toBe(false);
    expect(isLessonKeyLocked('garbage', [])).toBe(false);
  });
});
