import { useEffect, useRef } from 'react';
import { useStreakByteStore } from '../store/useStreakByteStore';
import { CornerBrackets, IsometricCubeSvg } from './ByteMascotSvg';

export function LevelUpBanner() {
  const levelUpEvent = useStreakByteStore((s) => s.levelUpEvent);
  const dismissLevelUp = useStreakByteStore((s) => s.dismissLevelUp);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!levelUpEvent) return;
    btnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissLevelUp();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [levelUpEvent, dismissLevelUp]);

  if (!levelUpEvent) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Level up"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismissLevelUp();
      }}
      className="fixed inset-0 z-[70] grid place-items-center p-4"
      style={{ background: 'var(--scrim)' }}
    >
      <section className="sb-pop relative overflow-hidden w-full max-w-[400px] border border-[var(--dark-line)] bg-[var(--dark-card)] text-white p-7 text-center shadow-2xl">
        <CornerBrackets light />

        <div className="mx-auto mb-3 grid place-items-center">
          <IsometricCubeSvg size={58} />
        </div>

        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.12em] text-cyan">
          Level Up!
        </p>
        <h2 className="m-0 mt-1.5 font-head text-2xl font-bold text-white">
          Level {levelUpEvent.level} · {levelUpEvent.title}
        </h2>
        <p className="m-0 mt-2 text-xs text-white/70">
          You crossed a new XP milestone. Keep the streak rolling!
        </p>

        <button
          ref={btnRef}
          type="button"
          onClick={dismissLevelUp}
          className="sb-cut mt-5 w-full min-h-11 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:bg-[#e64b00]"
        >
          Keep going
        </button>
      </section>
    </div>
  );
}
