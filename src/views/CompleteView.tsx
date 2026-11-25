import { Icon } from '../components/Icon';
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
    <div>
      <section
        className="grid grid-cols-[minmax(0,1fr)_auto] max-[1100px]:grid-cols-1 gap-7 items-center mb-5 p-7 rounded-2xl border"
        style={{
          background: 'color-mix(in srgb, var(--green) 14%, var(--panel))',
          borderColor: 'color-mix(in srgb, var(--green) 38%, var(--line))',
        }}
      >
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-2 rounded-full bg-green/20 text-green font-mono text-xs font-bold uppercase tracking-wider">
            Systems online
          </span>
          <h1 className="m-0 mb-1.5 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]">
            {completion.title}
          </h1>
          <p className="m-0 text-muted text-[1.0625rem]">{completion.subtitle}</p>

          <div className="flex gap-7 max-[760px]:gap-4 max-[760px]:flex-wrap mt-[22px]">
            <div className="sb-pop">
              <small className="block text-muted text-[0.8125rem] font-semibold">XP earned</small>
              <b className="num text-[1.75rem] leading-tight text-green">{completion.xp}</b>
            </div>
            <div className="pl-7 max-[760px]:pl-4 border-l border-line">
              <small className="block text-muted text-[0.8125rem] font-semibold">Accuracy</small>
              <b className="num text-[1.75rem] leading-tight">{completion.accuracy}</b>
            </div>
            <div className="pl-7 max-[760px]:pl-4 border-l border-line">
              <small className="block text-muted text-[0.8125rem] font-semibold">
                {completion.partsLabel}
              </small>
              <b className="num text-[1.75rem] leading-tight">{completion.partsValue}</b>
            </div>
          </div>
        </div>

        <div className="min-w-[290px] max-[1100px]:min-w-0 p-4 rounded-[14px] bg-bg border border-line">
          <div className="flex items-center gap-2 font-bold">
            <Icon name="flame" className="w-5 h-5 text-amber" />
            {streakDays} day streak
          </div>
          <WeekStrip
            filledCount={weekStrip.filledCount}
            todayIndex={weekStrip.todayIndex}
            ariaLabel={weekStrip.ariaLabel}
          />
          <p className="m-0 text-muted text-sm">
            {streakDays > 0 ? 'Streak active. Keep it going tomorrow.' : 'Complete a lesson to start your streak.'}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] max-[1100px]:grid-cols-1 gap-5 items-stretch">
        <section className="bg-panel border border-line rounded-2xl p-[22px]">
          <h2 className="m-0 mb-1 text-[1.125rem] font-bold">Review these</h2>
          <p className="m-0 text-muted text-sm">
            Mistakes are saved here, never a game over. Practice these to lock them in.
          </p>

          <ul className="grid mt-3 mb-[18px]">
            {completion.review.map(([topic, detail]) => (
              <li
                key={topic}
                className="grid grid-cols-[14px_minmax(0,1fr)_auto_auto] gap-3.5 items-center py-3 border-t border-line"
              >
                <i className="w-3 h-3 rounded-[3px] bg-amber block" />
                <b>{topic}</b>
                <span className="text-muted text-sm text-right">{detail}</span>
                <a
                  href="#practice"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('practice');
                  }}
                  className="inline-flex items-center justify-center min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] no-underline transition-colors hover:bg-panel2 hover:border-muted"
                >
                  Review
                </a>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-2.5">
            <a
              href="#practice"
              onClick={(e) => {
                e.preventDefault();
                navigate('practice');
              }}
              className="inline-flex items-center justify-center min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] no-underline transition-all hover:brightness-110"
            >
              Practice missed
            </a>
            <a
              href="#curriculum"
              onClick={(e) => {
                e.preventDefault();
                navigate('curriculum');
              }}
              className="inline-flex items-center justify-center min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] no-underline transition-colors hover:bg-panel2 hover:border-muted"
            >
              Back to Learn
            </a>
          </div>
        </section>

        <section className="bg-panel border border-line rounded-2xl p-[22px] flex flex-col gap-2">
          <h2 className="m-0 text-2xl font-bold leading-tight">Up next: {completion.next[0]}</h2>
          <b>{completion.next[1]}</b>
          <p className="m-0 text-muted text-sm num">{completion.next[2]}</p>
          <a
            href="#curriculum"
            onClick={(e) => {
              e.preventDefault();
              navigate('curriculum');
            }}
            className="mt-auto inline-flex items-center justify-center min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] no-underline transition-all hover:brightness-110"
          >
            Next lesson
          </a>
        </section>
      </div>
    </div>
  );
}
