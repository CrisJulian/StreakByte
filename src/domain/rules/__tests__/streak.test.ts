import { describe, expect, it } from 'vitest';
import { canRestore, createInitialStreak, isBroken, recordActivity, restoreStreak } from '../streak';

describe('streak rules', () => {
  it('starts at 1, then increments on consecutive days and ignores repeats', () => {
    let s = recordActivity(createInitialStreak(), '2026-11-20');
    expect(s.current).toBe(1);
    s = recordActivity(s, '2026-11-20');
    expect(s.current).toBe(1);
    s = recordActivity(s, '2026-11-21');
    expect(s.current).toBe(2);
    expect(s.longest).toBe(2);
  });

  it('resets after a missed day without a restore', () => {
    let s = recordActivity(createInitialStreak(), '2026-11-20');
    s = recordActivity(s, '2026-11-21');
    s = recordActivity(s, '2026-11-24');
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
  });

  it('restores a short break once and spends the restore', () => {
    let s = recordActivity(recordActivity(createInitialStreak(), '2026-11-20'), '2026-11-21');
    expect(isBroken(s, '2026-11-23')).toBe(true);
    expect(canRestore(s, '2026-11-23')).toBe(true);
    s = restoreStreak(s, '2026-11-23');
    expect(s.current).toBe(3);
    expect(s.restoresLeft).toBe(0);
    expect(canRestore(s, '2026-11-26')).toBe(false);
  });

  it('refuses to restore a gap longer than two missed days', () => {
    const s = recordActivity(createInitialStreak(), '2026-11-10');
    expect(canRestore(s, '2026-11-23')).toBe(false);
    expect(restoreStreak(s, '2026-11-23')).toBe(s);
  });
});
