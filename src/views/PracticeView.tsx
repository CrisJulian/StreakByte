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
    <div className="w-full bg-panel">
      <section className="grid grid-cols-[minmax(0,1fr)_auto] max-[1000px]:grid-cols-1 gap-6 items-center p-6 max-[760px]:p-4 border-b border-line bg-panel2">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            <span>DRILL &amp; RETENTION</span>
          </div>
          <h1 className="m-0 mt-1.5 sb-page-title text-[30px]">
            Answer it again.
          </h1>
          <p className="mt-1.5 mb-4 text-muted text-[12px] max-w-[54ch]">
            Redo lessons and quizzes you have already finished. Items you missed come back first, so
            they stick.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {totalCount === 0 ? (
              <button
                type="button"
                onClick={() => navigate('curriculum')}
                className="sb-cut inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00]"
              >
                Go to curriculum
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={needCount === 0}
                  onClick={() => needItems[0] && navigate(`quiz/${needItems[0].lessonKey}`)}
                  className="sb-cut inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00] disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  Practice missed ({needCount})
                </button>
                <button
                  type="button"
                  onClick={() => items[0] && navigate(`quiz/${items[0].lessonKey}`)}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-4 border border-line bg-panel text-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:border-ink"
                >
                  Mixed review
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-6 max-[760px]:gap-4 max-[760px]:flex-wrap">
          <div>
            <small className="block text-muted text-[10px] font-bold uppercase tracking-[0.07em]">
              To review
            </small>
            <b className="num font-disp text-[28px] leading-tight text-cyan">{needCount}</b>
          </div>
          <div className="pl-6 max-[760px]:pl-4 border-l border-line">
            <small className="block text-muted text-[10px] font-bold uppercase tracking-[0.07em]">
              Mastered
            </small>
            <b className="num font-disp text-[28px] leading-tight">{masteredCount}</b>
          </div>
          <div className="pl-6 max-[760px]:pl-4 border-l border-line">
            <small className="block text-muted text-[10px] font-bold uppercase tracking-[0.07em]">
              Done before
            </small>
            <b className="num font-disp text-[28px] leading-tight">{totalCount}</b>
          </div>
        </div>
      </section>

      <div className="p-6 max-[760px]:p-4">
        <div className="flex justify-between items-center gap-3 flex-wrap mb-4">
          <h2 className="m-0 font-head text-[18px] font-bold">Things you have done</h2>
          <div role="group" aria-label="Filter practice items" className="inline-flex border border-ink bg-panel flex-wrap">
            {filters.map((f, idx) => {
              const active = practiceFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPracticeFilter(f.id)}
                  className={`min-h-9 px-3.5 border-0 font-bold text-[10px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${idx > 0 ? 'border-l border-ink' : ''
                    } ${active
                      ? 'bg-cyan text-cyan-ink'
                      : 'bg-panel text-ink hover:bg-panel2'
                    }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <div className="p-6 border border-line bg-panel2 text-xs text-muted">
            {totalCount === 0
              ? 'No completed lessons to review yet. Finish a lesson quiz in Curriculum and it will appear here.'
              : 'No completed lessons match this filter.'}
          </div>
        ) : (
          <div className="border border-line">
            {visibleItems.map((item) => {
              const isNeed = item.state === 'need';
              return (
                <article
                  key={item.lessonKey}
                  className={`grid grid-cols-[minmax(0,1.4fr)_minmax(130px,1fr)_auto_auto] max-[760px]:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center px-4 py-3.5 border-b border-line last:border-b-0 bg-panel ${isNeed ? 'shadow-[inset_4px_0_0_var(--cyan)]' : ''
                    }`}
                >
                  <div>
                    <h3 className="m-0 font-head text-[15px] font-bold leading-snug">{item.title}</h3>
                    <p className="mt-0.5 mb-0 text-muted text-[11px]">{item.meta}</p>
                  </div>

                  <div className="flex items-center gap-2.5 max-[760px]:col-span-full max-[760px]:order-3">
                    <small className="font-bold text-muted text-[10px] uppercase">Best</small>
                    <div className="flex-1 grid grid-cols-4 gap-0.5" aria-hidden="true">
                      {[25, 50, 75, 100].map((step) => (
                        <i
                          key={step}
                          className={`block h-2 ${item.best >= step ? (isNeed ? 'bg-cyan' : 'bg-green') : 'bg-panel3'
                            }`}
                        />
                      ))}
                    </div>
                    <small className="num min-w-9 text-right font-bold text-ink text-xs">
                      {item.best}%
                    </small>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${isNeed ? 'bg-you text-cyan' : 'bg-green/15 text-green'
                      }`}
                  >
                    {isNeed ? 'Needs review' : 'Mastered'}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigate(`quiz/${item.lessonKey}`)}
                    className={`sb-cut-sm inline-flex items-center justify-center min-h-9 px-3.5 border font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${isNeed
                        ? 'bg-cyan border-cyan text-cyan-ink hover:bg-[#e64b00]'
                        : 'bg-panel border-line text-ink hover:border-ink hover:bg-panel2'
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
    </div>
  );
}
