import { afterEach, describe, expect, it, vi } from 'vitest';
import { playSfx } from '../soundEffects';

describe('soundEffects', () => {
  const originalAudioContext = window.AudioContext;

  afterEach(() => {
    window.AudioContext = originalAudioContext;
    vi.restoreAllMocks();
  });

  it('no-ops cleanly when AudioContext is unavailable or disabled', () => {
    expect(() => playSfx('snap', { enabled: false })).not.toThrow();
    expect(() => playSfx('postBeep')).not.toThrow();
  });

  it('synthesizes audio nodes when AudioContext is available and enabled', () => {
    const start = vi.fn();
    const stop = vi.fn();
    const connect = vi.fn();
    const createOscillator = vi.fn(() => ({
      type: 'sine',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect,
      start,
      stop,
    }));
    const createGain = vi.fn(() => ({
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect,
    }));

    window.AudioContext = vi.fn(() => ({
      state: 'running',
      currentTime: 0,
      destination: {},
      resume: vi.fn(),
      createOscillator,
      createGain,
    })) as unknown as typeof AudioContext;

    playSfx('combo', { enabled: true, combo: 3 });
    expect(createOscillator).toHaveBeenCalledTimes(1);
    expect(createGain).toHaveBeenCalledTimes(1);
    expect(start).toHaveBeenCalledTimes(1);
    expect(stop).toHaveBeenCalledTimes(1);

    playSfx('combo', { enabled: false, combo: 3 });
    expect(createOscillator).toHaveBeenCalledTimes(1);
  });
});
