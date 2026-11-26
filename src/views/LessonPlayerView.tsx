import { useEffect } from 'react';
import { Icon } from '../components/Icon';
import { LAB_REFERENCES } from '../data/references';
import { effectiveStreak, localDayString } from '../domain/rules/xp';
import { useStreakByteStore } from '../store/useStreakByteStore';
import { NetworkBuildLab } from './labs/NetworkBuildLab';
import { PcBuildLab } from './labs/PcBuildLab';

export function LessonPlayerView() {
  const activeLab = useStreakByteStore((s) => s.activeLab);
  const pc = useStreakByteStore((s) => s.pc);
  const streak = useStreakByteStore((s) => s.streak);
  const lessonSeconds = useStreakByteStore((s) => s.lessonSeconds);
  const labSessionMode = useStreakByteStore((s) => s.labSessionMode);
  const labTimedOut = useStreakByteStore((s) => s.labTimedOut);
  const tickLessonTimer = useStreakByteStore((s) => s.tickLessonTimer);
  const retryTimedLab = useStreakByteStore((s) => s.retryTimedLab);
  const navigate = useStreakByteStore((s) => s.navigate);
  const streakDays = effectiveStreak(streak, localDayString());

  useEffect(() => {
    if (labTimedOut) return undefined;
    const id = window.setInterval(() => {
      tickLessonTimer();
    }, 1000);
    return () => window.clearInterval(id);
  }, [labTimedOut, tickLessonTimer]);

  const stepDoneFlags = [
    pc.cpu,
    pc.cooler,
    Object.keys(pc.ram).length >= 2,
    pc.m2,
    pc.gpu,
    pc.psu,
  ];
  const curIdx = stepDoneFlags.findIndex((done) => !done);
  const stepLabel = curIdx < 0 ? 'All steps done' : `Step ${curIdx + 1} of 6`;
  const timerUrgent = labSessionMode === 'timed' && lessonSeconds <= 30;

  const formattedTime = `${Math.floor(lessonSeconds / 60)}:${String(lessonSeconds % 60).padStart(
    2,
    '0',
  )}`;

  return (
    <div className="w-full bg-panel">
      <div className="px-4 py-2 max-[760px]:px-3 border-b border-line bg-panel2 flex justify-between items-center gap-3 flex-wrap">
        <div className="flex gap-2.5 items-center flex-wrap">
          <a
            href="#curriculum"
            onClick={(e) => {
              e.preventDefault();
              navigate('curriculum');
            }}
            className="inline-flex items-center justify-center gap-2 min-h-9 px-3.5 border border-line bg-panel text-ink font-bold text-[10.5px] uppercase tracking-[0.06em] no-underline hover:border-ink transition-colors"
          >
            <Icon name="back" className="w-4 h-4" />
            Exit
          </a>

          <div
            role="group"
            aria-label="Lesson activity"
            className="inline-flex border border-ink bg-panel flex-wrap"
          >
            <button
              type="button"
              aria-pressed={activeLab === 'pc'}
              onClick={() => navigate('lesson/pc')}
              className={`min-h-9 px-3.5 border-0 font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${activeLab === 'pc'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-transparent text-ink hover:bg-panel2'
                }`}
            >
              Final Lesson: Build a PC
            </button>
            <button
              type="button"
              aria-pressed={activeLab === 'net'}
              onClick={() => navigate('lesson/network')}
              className={`min-h-9 px-3.5 border-0 border-l border-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${activeLab === 'net'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-transparent text-ink hover:bg-panel2'
                }`}
            >
              Final Lesson: Build a Network
            </button>
          </div>
        </div>

        {activeLab === 'pc' && (
          <div
            className="grid grid-cols-6 gap-1 flex-1 min-w-[140px] max-w-[280px]"
            aria-hidden="true"
          >
            {stepDoneFlags.map((done, idx) => (
              <i
                key={idx}
                className={`h-2.5 ${done ? 'bg-green' : idx === curIdx ? 'bg-cyan' : 'bg-panel3'
                  }`}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2 items-center flex-wrap">
          {activeLab === 'pc' && (
            <span className="inline-flex items-center gap-2 min-h-9 px-3 py-1 bg-cyan text-cyan-ink font-bold text-[10.5px] uppercase tracking-[0.06em]">
              {stepLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 min-h-9 px-3 py-1 border border-line bg-panel font-bold text-[10.5px] uppercase tracking-[0.05em]">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            {streakDays}-day streak
          </span>
          <span
            className={`inline-flex items-center gap-1.5 min-h-9 px-3 py-1 border bg-panel font-bold text-[10.5px] uppercase tracking-[0.05em] ${
              timerUrgent ? 'border-red text-red' : 'border-line text-ink'
            }`}
          >
            <Icon name="clock" className={`w-3.5 h-3.5 ${timerUrgent ? 'text-red' : 'text-cyan'}`} />
            {labSessionMode === 'timed' && <span>TIMED ·</span>}
            <span className="num">{formattedTime}</span>
          </span>
        </div>
      </div>

      <div className="p-3.5 max-[760px]:p-3">
        {activeLab === 'pc' ? <PcBuildLab /> : <NetworkBuildLab />}

        {labTimedOut && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label="Time's up"
            className="fixed inset-0 z-50 grid place-items-center p-4"
            style={{ background: 'var(--scrim)' }}
          >
            <section className="sb-pop w-full max-w-[400px] bg-panel border border-red p-6 text-center grid gap-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-red">
                TIMED RUN FAILED
              </div>
              <h2 className="m-0 font-disp text-2xl uppercase">Time&apos;s Up!</h2>
              <p className="m-0 text-xs text-muted">
                The clock reached 0:00 before you completed and verified your build. Try again to
                earn full XP.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={retryTimedLab}
                  className="sb-cut-sm min-h-10 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:brightness-110"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => navigate('curriculum')}
                  className="min-h-10 px-4 border border-line bg-panel2 text-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:border-ink"
                >
                  Exit Lab
                </button>
              </div>
            </section>
          </div>
        )}

        <section
          aria-labelledby="lesson-quiz"
          className="mt-8 p-6 border border-[var(--dark-card)] bg-[var(--dark-card)] text-white flex items-center justify-between gap-4 flex-wrap"
        >
          <div>
            <h2 id="lesson-quiz" className="m-0 font-head text-[20px] font-bold text-white">
              Knowledge check
            </h2>
            <p className="m-0 mt-1 text-white/70 text-[12px]">
              Optional 4-question knowledge check to review your build. Mistakes are saved for
              review, never a game over.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(activeLab === 'pc' ? 'quiz/hw-6' : 'quiz/net-5')}
            className="sb-cut inline-flex items-center justify-center min-h-11 px-5 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:brightness-110 transition-colors"
          >
            Take the quiz
          </button>
        </section>

        <section aria-labelledby="lesson-references" className="mt-8 pt-5 border-t border-line">
          <h2
            id="lesson-references"
            className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-2.5"
          >
            References
          </h2>
          <ul className="grid gap-1.5 text-[12px]">
            {LAB_REFERENCES[activeLab].map((ref) => (
              <li key={ref.url}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan underline underline-offset-2"
                >
                  {ref.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
