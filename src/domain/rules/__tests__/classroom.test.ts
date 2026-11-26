import { describe, expect, it } from 'vitest';
import { generateJoinCode, isValidJoinCode, normalizeJoinCode } from '../classroom';

describe('classroom join code rules', () => {
  it('normalizes user input to uppercase alphanumeric characters', () => {
    expect(normalizeJoinCode(' ab-c 123 ')).toBe('ABC123');
    expect(normalizeJoinCode('k9p-2m!')).toBe('K9P2M');
  });

  it('validates 6-character alphanumeric join codes', () => {
    expect(isValidJoinCode('ABC123')).toBe(true);
    expect(isValidJoinCode('ABC12')).toBe(false);
    expect(isValidJoinCode('ABC1234')).toBe(false);
    expect(isValidJoinCode('abc123')).toBe(false);
  });

  it('generates valid 6-character codes deterministically with custom rng', () => {
    const code = generateJoinCode(() => 0);
    expect(code).toHaveLength(6);
    expect(isValidJoinCode(code)).toBe(true);
  });
});
