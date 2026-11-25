import { useEffect, useRef } from 'react';
import { Icon } from './Icon';
import { useStreakByteStore } from '../store/useStreakByteStore';

const SPARKS = [
  { left: '12%', delay: '0s', color: 'var(--cyan)' },
  { left: '28%', delay: '0.25s', color: 'var(--amber)' },
  { left: '46%', delay: '0.1s', color: 'var(--green)' },
  { left: '66%', delay: '0.35s', color: 'var(--cyan)' },
  { left: '84%', delay: '0.15s', color: 'var(--amber)' },
];

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
      className="fixed inset-0 z-[70] grid place-items-center p-4 backdrop-blur-[4px]"
      style={{ background: 'var(--scrim)' }}
    >
      <section className="sb-pop relative overflow-hidden w-full max-w-[380px] rounded-2xl border border-cyan bg-panel p-6 text-center shadow-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14" aria-hidden="true">
          {SPARKS.map((spark, idx) => (
            <span
              key={idx}
              className="sb-spark absolute top-2 w-2.5 h-2.5 rounded-sm"
              style={{
                left: spark.left,
                animationDelay: spark.delay,
                background: spark.color,
              }}
            />
          ))}
        </div>

        <div
          className="mx-auto mb-3 grid place-items-center w-14 h-14 rounded-2xl text-cyan"
          style={{ background: 'color-mix(in srgb, var(--cyan) 16%, transparent)' }}
        >
          <Icon name="trophy" className="w-7 h-7" />
        </div>

        <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-cyan">
          Level Up!
        </p>
        <h2 className="m-0 mt-1 text-2xl font-extrabold text-ink">
          Level {levelUpEvent.level} · {levelUpEvent.title}
        </h2>
        <p className="m-0 mt-2 text-sm text-muted">
          You crossed a new XP milestone. Keep the streak rolling!
        </p>

        <button
          ref={btnRef}
          type="button"
          onClick={dismissLevelUp}
          className="mt-5 w-full min-h-11 rounded-[10px] border border-cyan bg-cyan text-cyan-ink font-bold text-sm cursor-pointer hover:brightness-110 transition-all"
        >
          Keep going
        </button>
      </section>
    </div>
  );
}
