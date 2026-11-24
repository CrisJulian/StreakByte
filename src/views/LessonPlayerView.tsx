import { useEffect } from 'react';
import { Icon } from '../components/Icon';
import { LAB_REFERENCES } from '../data/references';
import { useStreakByteStore } from '../store/useStreakByteStore';
import { NetworkBuildLab } from './labs/NetworkBuildLab';
import { PcBuildLab } from './labs/PcBuildLab';

export function LessonPlayerView() {
  const activeLab = useStreakByteStore((s) => s.activeLab);
  const pc = useStreakByteStore((s) => s.pc);
  const lessonSeconds = useStreakByteStore((s) => s.lessonSeconds);
  const tickLessonTimer = useStreakByteStore((s) => s.tickLessonTimer);
  const navigate = useStreakByteStore((s) => s.navigate);

  useEffect(() => {
    const id = window.setInterval(() => {
      tickLessonTimer();
    }, 1000);
    return () => window.clearInterval(id);
  }, [tickLessonTimer]);

  const stepDoneFlags = [
    true,
    true,
    Object.keys(pc.ram).length >= 2,
    pc.m2,
    pc.gpu,
    pc.psu,
  ];
  const curIdx = stepDoneFlags.findIndex((done) => !done);
  const stepLabel = curIdx < 0 ? 'All steps done' : `Step ${curIdx + 1} of 6`;

  const formattedTime = `${Math.floor(lessonSeconds / 60)}:${String(lessonSeconds % 60).padStart(
    2,
    '0',
  )}`;

  return (
    <div>
      <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
        <div className="flex gap-2 items-center flex-wrap">
          <a
            href="#curriculum"
            onClick={(e) => {
              e.preventDefault();
              navigate('curriculum');
            }}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] no-underline transition-colors hover:bg-panel2 hover:border-muted"
          >
            <Icon name="back" className="w-[18px] h-[18px]" />
            Exit
          </a>

          <div
            role="group"
            aria-label="Lesson activity"
            className="inline-flex p-1 border border-line rounded-xl bg-bg gap-1"
          >
            <button
              type="button"
              aria-pressed={activeLab === 'pc'}
              onClick={() => navigate('lesson/pc')}
              className={`min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                activeLab === 'pc'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              Final Lesson: Build a PC
            </button>
            <button
              type="button"
              aria-pressed={activeLab === 'net'}
              onClick={() => navigate('lesson/network')}
              className={`min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                activeLab === 'net'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-transparent text-muted hover:text-ink'
              }`}
            >
              Final Lesson: Build a Network
            </button>
          </div>
        </div>

        {activeLab === 'pc' && (
          <div
            className="grid grid-cols-6 gap-1 flex-1 min-w-[160px] max-w-[340px]"
            aria-hidden="true"
          >
            {stepDoneFlags.map((done, idx) => (
              <i
                key={idx}
                className={`h-2 rounded-[3px] ${
                  done ? 'bg-green' : idx === curIdx ? 'bg-amber' : 'bg-panel2'
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex gap-2 items-center flex-wrap">
          {activeLab === 'pc' && (
            <span className="inline-flex items-center gap-2 min-h-10 px-3.5 py-2 border border-line rounded-full bg-panel font-semibold text-sm">
              {stepLabel}
            </span>
          )}
          <span
            className="inline-flex items-center gap-2 min-h-10 px-3.5 py-2 border rounded-full font-semibold text-sm"
            style={{
              borderColor: 'color-mix(in srgb, var(--amber) 55%, var(--line))',
              background: 'color-mix(in srgb, var(--amber) 12%, var(--panel))',
            }}
          >
            <Icon name="flame" className="w-4 h-4 text-amber" />
            6-day streak
          </span>
          <span className="inline-flex items-center gap-2 min-h-10 px-3.5 py-2 border border-line rounded-full bg-panel font-semibold text-sm">
            <Icon name="clock" className="w-4 h-4 text-amber" />
            <span className="num">{formattedTime}</span>
          </span>
        </div>
      </div>

      {activeLab === 'pc' ? <PcBuildLab /> : <NetworkBuildLab />}

      <section
        aria-labelledby="lesson-quiz"
        className="mt-8 p-[22px] rounded-2xl border border-line bg-panel flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h2 id="lesson-quiz" className="m-0 text-[1.125rem] font-bold">
            Knowledge check
          </h2>
          <p className="m-0 mt-1 text-muted text-sm">
            4 questions, 4 choices each. Get 3 of 4 right to complete this lesson. Mistakes are saved for review, never a game over.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(activeLab === 'pc' ? 'quiz/hw-6' : 'quiz/net-5')}
          className="inline-flex items-center justify-center min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110"
        >
          Take the quiz
        </button>
      </section>

      <section
        aria-labelledby="lesson-references"
        className="mt-8 pt-5 border-t border-line"
      >
        <h2 id="lesson-references" className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
          References
        </h2>
        <ul className="grid gap-1.5 text-[0.9375rem]">
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
  );
}
