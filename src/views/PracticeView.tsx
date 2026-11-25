import { lessonLabel, TRACKS } from '../data/curriculum';
import { derivePracticeItems } from '../domain/rules/progressViews';
import { parseLessonKey } from '../domain/rules/quiz';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { PracticeFilter, TrackId } from '../types/streakbyte';

function resolveLessonInfo(lessonKey: string): { title: string; track: TrackId } | null {
  const parsed = parseLessonKey(lessonKey);
  if (!parsed || !(parsed.trackId in TRACKS)) return null;
  const track = parsed.trackId as TrackId;
  const lesson = TRACKS[track].lessons[parsed.number - 1];
  if (!lesson) return null;
  return { title: lessonLabel(lesson, parsed.number - 1), track };
}

export function PracticeView() {
  const practiceFilter = useStreakByteStore((s) => s.practiceFilter);
  const setPracticeFilter = useStreakByteStore((s) => s.setPracticeFilter);
  const completions = useStreakByteStore((s) => s.completions);
  const navigate = useStreakByteStore((s) => s.navigate);

  const items = derivePracticeItems(completions, resolveLessonInfo);
  const needItems = items.filter((i) => i.state === 'need');
  const needCount = needItems.length;
  const masteredCount = items.length - needCount;
  const totalCount = items.length;
  const hwCount = items.filter((i) => i.track === 'hw').length;
  const netCount = items.filter((i) => i.track === 'net').length;

  const filters: { id: PracticeFilter; label: string }[] = [
    { id: 'all', label: `All · ${totalCount}` },
    { id: 'need', label: `Needs review · ${needCount}` },
    { id: 'hw', label: `Hardware · ${hwCount}` },
    { id: 'net', label: `Networking · ${netCount}` },
  ];

  const visibleItems = items.filter((item) => {
    if (practiceFilter === 'all') return true;
    if (practiceFilter === 'need') return item.state === 'need';
    return item.track === practiceFilter;
  });

  return (
    <div>
      <section
        className="grid grid-cols-[minmax(0,1fr)_auto] max-[1100px]:grid-cols-1 gap-6 items-center p-7 mb-5 rounded-2xl border"
        style={{
          background: 'color-mix(in srgb, var(--cyan) 12%, var(--panel))',
          borderColor: 'color-mix(in srgb, var(--cyan) 35%, var(--line))',
        }}
      >
        <div>
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]">
            Answer it again.
          </h1>
          <p className="mt-2 mb-[18px] text-muted max-w-[54ch]">
            Redo lessons and quizzes you have already finished. Items you missed come back first, so
            they stick.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {totalCount === 0 ? (
              <button
                type="button"
                onClick={() => navigate('curriculum')}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110"
              >
                Go to curriculum
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={needCount === 0}
                  onClick={() => needItems[0] && navigate(`quiz/${needItems[0].lessonKey}`)}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Practice missed ({needCount})
                </button>
                <button
                  type="button"
                  onClick={() => items[0] && navigate(`quiz/${items[0].lessonKey}`)}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] cursor-pointer transition-colors hover:bg-panel2 hover:border-muted"
                >
                  Mixed review
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-7 max-[760px]:gap-4 max-[760px]:flex-wrap">
          <div>
            <small className="block text-muted text-[0.8125rem] font-semibold">To review</small>
            <b className="num text-[1.75rem] leading-tight text-amber">{needCount}</b>
          </div>
          <div className="pl-7 max-[760px]:pl-4 border-l border-line">
            <small className="block text-muted text-[0.8125rem] font-semibold">Mastered</small>
            <b className="num text-[1.75rem] leading-tight">{masteredCount}</b>
          </div>
          <div className="pl-7 max-[760px]:pl-4 border-l border-line">
            <small className="block text-muted text-[0.8125rem] font-semibold">Done before</small>
            <b className="num text-[1.75rem] leading-tight">{totalCount}</b>
          </div>
        </div>
      </section>

      <div className="flex justify-between items-center gap-3 mb-3">
        <h2 className="m-0 text-[1.125rem] font-bold">Things you have done</h2>
      </div>

      <div role="group" aria-label="Filter practice items" className="flex gap-2 flex-wrap mb-4">
        {filters.map((f) => {
          const active = practiceFilter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setPracticeFilter(f.id)}
              className={`min-h-11 px-4 border rounded-full font-semibold text-sm cursor-pointer transition-colors ${
                active
                  ? 'bg-panel2 text-ink border-cyan'
                  : 'bg-transparent text-muted border-line hover:text-ink hover:border-muted'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {visibleItems.length === 0 ? (
        <div className="p-6 border border-line rounded-2xl bg-panel text-sm text-muted">
          {totalCount === 0
            ? 'No completed lessons to review yet. Finish a lesson quiz in Curriculum and it will appear here.'
            : 'No completed lessons match this filter.'}
        </div>
      ) : (
        <div className="grid gap-2.5">
          {visibleItems.map((item) => {
            const isNeed = item.state === 'need';
            return (
              <article
                key={item.lessonKey}
                className="grid grid-cols-[minmax(0,1.4fr)_minmax(130px,1fr)_auto_auto] max-[760px]:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center px-[18px] py-4 border border-line rounded-[14px] bg-panel transition-colors hover:border-muted"
                style={
                  isNeed
                    ? { borderColor: 'color-mix(in srgb, var(--amber) 55%, var(--line))' }
                    : undefined
                }
              >
                <div>
                  <h3 className="m-0 text-base font-bold leading-snug">{item.title}</h3>
                  <p className="mt-0.5 mb-0 text-muted text-sm">{item.meta}</p>
                </div>

                <div className="flex items-center gap-3 max-[760px]:col-span-full max-[760px]:order-3">
                  <small className="font-medium text-muted text-[0.8125rem]">Best</small>
                  <div className="flex-1 h-1.5 rounded-full bg-panel2 overflow-hidden">
                    <i
                      className={`sb-bar-fill block h-full rounded-full ${isNeed ? 'bg-amber' : 'bg-green'}`}
                      style={{ width: `${item.best}%` }}
                    />
                  </div>
                  <small className="num min-w-9 text-right font-bold text-ink text-[0.8125rem]">
                    {item.best}%
                  </small>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.8125rem] font-semibold ${
                    isNeed ? 'text-amber' : 'text-green'
                  }`}
                  style={{
                    background: isNeed
                      ? 'color-mix(in srgb, var(--amber) 18%, transparent)'
                      : 'color-mix(in srgb, var(--green) 18%, transparent)',
                  }}
                >
                  {isNeed ? 'Needs review' : 'Mastered'}
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`quiz/${item.lessonKey}`)}
                  className={`inline-flex items-center justify-center min-h-11 px-[18px] border rounded-[10px] font-semibold text-[0.9375rem] cursor-pointer transition-all ${
                    isNeed
                      ? 'bg-cyan border-cyan text-cyan-ink hover:brightness-110'
                      : 'bg-transparent border-line text-ink hover:bg-panel2 hover:border-muted'
                  }`}
                >
                  {isNeed ? 'Answer again' : 'Redo'}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
