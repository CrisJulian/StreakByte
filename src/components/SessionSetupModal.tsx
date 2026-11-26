import { useEffect, useRef } from 'react';
import { useStreakByteStore } from '../store/useStreakByteStore';
import { Icon } from './Icon';

export function SessionSetupModal() {
  const setupModal = useStreakByteStore((s) => s.setupModal);
  const closeSetup = useStreakByteStore((s) => s.closeSetup);
  const setSetupMode = useStreakByteStore((s) => s.setSetupMode);
  const setSetupLength = useStreakByteStore((s) => s.setSetupLength);
  const startSessionFromModal = useStreakByteStore((s) => s.startSessionFromModal);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (setupModal.open && !wasOpenRef.current) {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      startButtonRef.current?.focus();
    } else if (!setupModal.open && wasOpenRef.current) {
      openerRef.current?.focus();
      openerRef.current = null;
    }
    wasOpenRef.current = setupModal.open;

    if (!setupModal.open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSetup();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setupModal.open, closeSetup]);

  if (!setupModal.open) return null;

  const modeHint =
    setupModal.mode === 'guided'
      ? 'Hints on. Mistakes cost nothing.'
      : 'No hints. The clock counts. Bonus XP for a clean run.';
  const xpCopy = setupModal.length === '5' ? '+ 120 XP' : '+ 160 XP';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-h2"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSetup();
      }}
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: 'var(--scrim)' }}
    >
      <section className="sb-pop w-full max-w-[400px] bg-panel border border-ink p-[22px]">
        <div className="flex justify-between items-center gap-3 mb-1">
          <h2 id="setup-h2" className="m-0 font-head text-[1.125rem] font-bold leading-snug tracking-[-0.01em]">
            Session setup
          </h2>
          <button
            type="button"
            onClick={closeSetup}
            aria-label="Close session setup"
            className="grid place-items-center w-9 h-9 flex-none border border-line bg-panel2 text-ink cursor-pointer transition-colors hover:border-ink"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        <p className="m-0 text-muted text-xs">{setupModal.title}</p>

        <span id="mode-lbl" className="block mt-4 mb-1.5 text-muted text-[10px] font-bold uppercase tracking-[0.07em]">
          Mode
        </span>
        <div
          role="group"
          aria-labelledby="mode-lbl"
          className="grid grid-cols-2 border border-ink bg-panel"
        >
          <button
            type="button"
            aria-pressed={setupModal.mode === 'guided'}
            onClick={() => setSetupMode('guided')}
            className={`min-h-10 px-4 border-0 font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${setupModal.mode === 'guided'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-ink hover:bg-panel2'
              }`}
          >
            Guided
          </button>
          <button
            type="button"
            aria-pressed={setupModal.mode === 'timed'}
            onClick={() => setSetupMode('timed')}
            className={`min-h-10 px-4 border-0 border-l border-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${setupModal.mode === 'timed'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-ink hover:bg-panel2'
              }`}
          >
            Timed
          </button>
        </div>
        <p className="mt-2 mb-0 text-muted text-xs">{modeHint}</p>

        <span id="len-lbl" className="block mt-4 mb-1.5 text-muted text-[10px] font-bold uppercase tracking-[0.07em]">
          Length
        </span>
        <div
          role="group"
          aria-labelledby="len-lbl"
          className="grid grid-cols-2 border border-ink bg-panel"
        >
          <button
            type="button"
            aria-pressed={setupModal.length === '5'}
            onClick={() => setSetupLength('5')}
            className={`min-h-10 px-4 border-0 font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${setupModal.length === '5'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-ink hover:bg-panel2'
              }`}
          >
            5 min
          </button>
          <button
            type="button"
            aria-pressed={setupModal.length === '10'}
            onClick={() => setSetupLength('10')}
            className={`min-h-10 px-4 border-0 border-l border-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${setupModal.length === '10'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-ink hover:bg-panel2'
              }`}
          >
            10 min
          </button>
        </div>

        <div className="flex gap-2 flex-wrap my-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--dark-card)] text-white font-bold text-[10px] uppercase tracking-[0.05em]">
            <Icon name="bolt" className="w-3.5 h-3.5 text-cyan" />
            <span className="num">{xpCopy}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-line bg-panel2 font-bold text-[10px] uppercase tracking-[0.05em] text-ink">
            <Icon name="flame" className="w-3.5 h-3.5 text-cyan" />
            Keeps streak
          </span>
        </div>

        <button
          ref={startButtonRef}
          type="button"
          onClick={startSessionFromModal}
          className="sb-cut w-full inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:brightness-110"
        >
          Start lesson
        </button>
      </section>
    </div>
  );
}
