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
      className="fixed inset-0 z-50 grid place-items-center p-4 backdrop-blur-[4px]"
      style={{ background: 'var(--scrim)' }}
    >
      <section className="sb-pop w-full max-w-[380px] bg-panel border border-line rounded-2xl p-[22px]">
        <div className="flex justify-between items-center gap-3 mb-0.5">
          <h2 id="setup-h2" className="m-0 text-[1.125rem] font-bold leading-snug tracking-[-0.01em]">
            Session setup
          </h2>
          <button
            type="button"
            onClick={closeSetup}
            aria-label="Close session setup"
            className="grid place-items-center w-10 h-10 flex-none border border-transparent rounded-full bg-panel2 text-ink cursor-pointer transition-colors hover:border-muted"
          >
            <Icon name="x" />
          </button>
        </div>

        <p className="m-0 text-muted text-sm">{setupModal.title}</p>

        <span id="mode-lbl" className="block mt-4 mb-2 text-muted text-[0.8125rem] font-bold">
          Mode
        </span>
        <div
          role="group"
          aria-labelledby="mode-lbl"
          className="flex p-1 border border-line rounded-xl bg-bg gap-1"
        >
          <button
            type="button"
            aria-pressed={setupModal.mode === 'guided'}
            onClick={() => setSetupMode('guided')}
            className={`flex-1 min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
              setupModal.mode === 'guided'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            Guided
          </button>
          <button
            type="button"
            aria-pressed={setupModal.mode === 'timed'}
            onClick={() => setSetupMode('timed')}
            className={`flex-1 min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
              setupModal.mode === 'timed'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            Timed
          </button>
        </div>
        <p className="mt-2 mb-0 text-muted text-sm">{modeHint}</p>

        <span id="len-lbl" className="block mt-4 mb-2 text-muted text-[0.8125rem] font-bold">
          Length
        </span>
        <div
          role="group"
          aria-labelledby="len-lbl"
          className="flex p-1 border border-line rounded-xl bg-bg gap-1"
        >
          <button
            type="button"
            aria-pressed={setupModal.length === '5'}
            onClick={() => setSetupLength('5')}
            className={`flex-1 min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
              setupModal.length === '5'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            5 min
          </button>
          <button
            type="button"
            aria-pressed={setupModal.length === '10'}
            onClick={() => setSetupLength('10')}
            className={`flex-1 min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
              setupModal.length === '10'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            10 min
          </button>
        </div>

        <div className="flex gap-2 flex-wrap my-4">
          <span className="inline-flex items-center gap-2 min-h-10 px-3.5 py-2 border border-line rounded-full bg-panel font-semibold text-sm">
            <Icon name="bolt" className="w-4 h-4 text-amber" />
            <span className="num">{xpCopy}</span>
          </span>
          <span
            className="inline-flex items-center gap-2 min-h-10 px-3.5 py-2 border rounded-full font-semibold text-sm"
            style={{
              borderColor: 'color-mix(in srgb, var(--amber) 55%, var(--line))',
              background: 'color-mix(in srgb, var(--amber) 12%, var(--panel))',
            }}
          >
            <Icon name="flame" className="w-4 h-4 text-amber" />
            Keeps streak
          </span>
        </div>

        <button
          ref={startButtonRef}
          type="button"
          onClick={startSessionFromModal}
          className="w-full inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110 active:brightness-95"
        >
          Start lesson
        </button>
      </section>
    </div>
  );
}
