import { CornerBrackets } from '../components/ByteMascotSvg';
import { WeekStrip } from '../components/WeekStrip';
import { deriveWeekStrip, effectiveStreak, localDayString } from '../domain/rules/xp';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { CompletionSummary } from '../types/streakbyte';

const DEFAULT_COMPLETION: CompletionSummary = {
  title: 'Nice build!',
  subtitle: 'You installed 5 of 5 parts and kept your streak alive.',
  xp: '+120',
  accuracy: '80%',
  partsLabel: 'Parts',
  partsValue: '5 / 5',
  review: [
    ['Dual-channel RAM', 'You used slots A1 and B1'],
    ['DDR4 vs DDR5', 'Not compatible'],
    ['RAM notch', 'Check the orientation'],
  ],
  next: ['Lesson 4: Storage', 'HDD, SSD and M.2', '6 min · +120 XP'],
};

export function CompleteView() {
  const completion = useStreakByteStore((s) => s.completion) ?? DEFAULT_COMPLETION;
  const streak = useStreakByteStore((s) => s.streak);
  const navigate = useStreakByteStore((s) => s.navigate);

  const today = localDayString();
  const streakDays = effectiveStreak(streak, today);
  const weekStrip = deriveWeekStrip(streak);

  return (
    <div className="w-full bg-panel">
      <section className="relative grid grid-cols-[minmax(0,1fr)_auto] max-[960px]:grid-cols-1 gap-7 items-center p-7 max-[760px]:p-5 bg-[var(--dark-card)] text-white border-b border-line">
        <CornerBrackets light />
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-cyan">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            Systems online
          </span>
          <h1 className="m-0 mt-2 mb-1.5 font-disp text-[36px] leading-none uppercase tracking-[-0.02em]">
            {completion.title}
          </h1>
          <p className="m-0 text-white/75 text-[12.5px]">{completion.subtitle}</p>

          <div className="flex gap-7 max-[760px]:gap-4 max-[760px]:flex-wrap mt-6">
            <div className="sb-pop">
              <small className="block text-white/60 text-[10px] font-bold uppercase tracking-[0.07em]">
                XP earned
              </small>
              <b className="num font-disp text-[28px] leading-tight text-cyan">{completion.xp}</b>
            </div>
            <div className="pl-7 max-[760px]:pl-4 border-l border-[var(--dark-line)]">
              <small className="block text-white/60 text-[10px] font-bold uppercase tracking-[0.07em]">
                Accuracy
              </small>
              <b className="num font-disp text-[28px] leading-tight">{completion.accuracy}</b>
            </div>
            <div className="pl-7 max-[760px]:pl-4 border-l border-[var(--dark-line)]">
              <small className="block text-white/60 text-[10px] font-bold uppercase tracking-[0.07em]">
                {completion.partsLabel}
              </small>
              <b className="num font-disp text-[28px] leading-tight">{completion.partsValue}</b>
            </div>
          </div>
        </div>

        <div className="min-w-[270px] max-[960px]:min-w-0 p-4 border border-[var(--dark-line)] bg-[#1b1b1b] text-white">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.07em]">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            {streakDays} day streak
          </div>
          <WeekStrip
            filledCount={weekStrip.filledCount}
            todayIndex={weekStrip.todayIndex}
            ariaLabel={weekStrip.ariaLabel}
          />
          <p className="m-0 text-white/65 text-[11px]">
            {streakDays > 0
              ? 'Streak active. Keep it going tomorrow.'
              : 'Complete a lesson to start your streak.'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] max-[960px]:grid-cols-1 items-stretch">
        <section className="p-6 max-[760px]:p-4 border-r border-line max-[960px]:border-r-0 max-[960px]:border-b">
          <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            CONCEPT LOG
          </div>
          <h2 className="m-0 mt-1 mb-1 font-head text-[20px] font-bold">Review these</h2>
          <p className="m-0 text-muted text-[12px]">
            Mistakes are saved here, never a game over. Practice these to lock them in.
          </p>

          <ul className="border border-line mt-4 mb-5">
            {completion.review.map(([topic, detail]) => (
              <li
                key={topic}
                className="grid grid-cols-[12px_minmax(0,1fr)_auto_auto] gap-3 items-center px-3.5 py-3 border-b border-line last:border-b-0"
              >
                <i className="w-2 h-2 bg-cyan block" />
                <b className="font-head text-[13.5px]">{topic}</b>
                <span className="text-muted text-[11px] text-right">{detail}</span>
                <a
                  href="#practice"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('practice');
                  }}
                  className="inline-flex items-center justify-center min-h-8 px-3 border border-line bg-panel text-ink font-bold text-[10px] uppercase tracking-[0.06em] no-underline hover:border-ink hover:bg-panel2 transition-colors"
                >
                  Review
                </a>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-2.5">
            <a
              href="#practice"
              onClick={(e) => {
                e.preventDefault();
                navigate('practice');
              }}
              className="sb-cut inline-flex items-center justify-center min-h-11 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] no-underline hover:bg-[#e64b00] transition-colors"
            >
              Practice missed
            </a>
            <a
              href="#curriculum"
              onClick={(e) => {
                e.preventDefault();
                navigate('curriculum');
              }}
              className="inline-flex items-center justify-center min-h-11 px-4 border border-line bg-panel text-ink font-bold text-[11px] uppercase tracking-[0.06em] no-underline hover:border-ink hover:bg-panel2 transition-colors"
            >
              Back to Learn
            </a>
          </div>
        </section>

        <section className="p-6 max-[760px]:p-4 flex flex-col gap-2 bg-panel2">
          <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            NEXT MISSION
          </div>
          <h2 className="m-0 font-head text-[24px] font-bold leading-tight">
            Up next: {completion.next[0]}
          </h2>
          <b className="text-sm">{completion.next[1]}</b>
          <p className="m-0 text-muted text-xs num">{completion.next[2]}</p>
          <a
            href="#curriculum"
            onClick={(e) => {
              e.preventDefault();
              navigate('curriculum');
            }}
            className="sb-cut mt-auto inline-flex items-center justify-center min-h-11 px-5 border border-[var(--dark-card)] bg-[var(--dark-card)] text-white font-bold text-[11px] uppercase tracking-[0.06em] no-underline hover:opacity-90 transition-opacity"
          >
            Next lesson ▶
          </a>
        </section>
      </div>
    </div>
  );
}
