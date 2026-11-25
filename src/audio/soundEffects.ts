export type SfxName = 'snap' | 'error' | 'combo' | 'postBeep' | 'ping' | 'levelUp';

interface SfxOptions {
  enabled?: boolean;
  combo?: number;
}

type AudioContextCtor = typeof AudioContext;

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  const Ctor = win.AudioContext ?? win.webkitAudioContext;
  if (!Ctor) return null;
  const ctx = sharedCtx ?? new Ctor();
  sharedCtx = ctx;
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined);
  }
  return ctx;
}

function playTone(
  ctx: AudioContext,
  freqStart: number,
  freqEnd: number,
  durationSec: number,
  delaySec = 0,
  type: OscillatorType = 'triangle',
  volume = 0.09,
): void {
  const start = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, start);
  if (freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), start + durationSec);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + durationSec + 0.02);
}

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

/** Synthesizes tactile Web Audio sound effects with zero external audio assets. */
export function playSfx(name: SfxName, options: SfxOptions = {}): void {
  if (options.enabled === false) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    switch (name) {
      case 'snap':
        playTone(ctx, 520, 220, 0.065, 0, 'triangle', 0.11);
        break;
      case 'error':
        playTone(ctx, 190, 140, 0.09, 0, 'sawtooth', 0.06);
        playTone(ctx, 160, 120, 0.1, 0.08, 'sawtooth', 0.05);
        break;
      case 'combo': {
        const idx = Math.min(Math.max(0, (options.combo ?? 1) - 1), PENTATONIC.length - 1);
        const freq = PENTATONIC[idx];
        playTone(ctx, freq, freq * 1.02, 0.14, 0, 'sine', 0.1);
        break;
      }
      case 'postBeep':
        playTone(ctx, 880, 880, 0.09, 0, 'square', 0.06);
        playTone(ctx, 523.25, 523.25, 0.11, 0.14, 'triangle', 0.09);
        playTone(ctx, 659.25, 659.25, 0.11, 0.24, 'triangle', 0.09);
        playTone(ctx, 783.99, 783.99, 0.18, 0.34, 'triangle', 0.1);
        break;
      case 'ping':
        playTone(ctx, 660, 660, 0.09, 0, 'sine', 0.08);
        playTone(ctx, 990, 990, 0.15, 0.08, 'sine', 0.09);
        break;
      case 'levelUp':
        playTone(ctx, 523.25, 523.25, 0.1, 0, 'triangle', 0.1);
        playTone(ctx, 659.25, 659.25, 0.1, 0.09, 'triangle', 0.1);
        playTone(ctx, 783.99, 783.99, 0.1, 0.18, 'triangle', 0.1);
        playTone(ctx, 1046.5, 1046.5, 0.24, 0.27, 'sine', 0.11);
        break;
    }
  } catch {
    // Ignore browser autoplay or Web Audio restrictions
  }
}
