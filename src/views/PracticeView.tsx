import { PRACTICE_ITEMS } from '../data/practice';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { PracticeFilter } from '../types/streakbyte';

const FILTERS: { id: PracticeFilter; label: string }[] = [
  { id: 'all', label: 'All · 8' },
  { id: 'need', label: 'Needs review · 3' },
  { id: 'hw', label: 'Hardware · 5' },
  { id: 'net', label: 'Networking · 3' },
];

export function PracticeView() {
  const practiceFilter = useStreakByteStore((s) => s.practiceFilter);
  const setPracticeFilter = useStreakByteStore((s) => s.setPracticeFilter);
  const openSetup = useStreakByteStore((s) => s.openSetup);

  const visibleItems = PRACTICE_ITEMS.filter((item) => {
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
            Redo lessons and activities you have already finished. Items you missed come back first,
            so they stick.
          </p>
          <div className="flex gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => openSetup('pc')}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110"
            >
              Practice missed (3)
            </button>
            <button
              type="button"
              onClick={() => openSetup('pc')}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] cursor-pointer transition-colors hover:bg-panel2 hover:border-muted"
            >
              Mixed review · 5 min
            </button>
          </div>
        </div>

        <div className="flex gap-7 max-[760px]:gap-4 max-[760px]:flex-wrap">
          <div>
            <small className="block text-muted text-[0.8125rem] font-semibold">To review</small>
            <b className="num text-[1.75rem] leading-tight text-amber">3</b>
          </div>
          <div className="pl-7 max-[760px]:pl-4 border-l border-line">
            <small className="block text-muted text-[0.8125rem] font-semibold">Mastered</small>
            <b className="num text-[1.75rem] leading-tight">5</b>
          </div>
          <div className="pl-7 max-[760px]:pl-4 border-l border-line">
            <small className="block text-muted text-[0.8125rem] font-semibold">Done before</small>
            <b className="num text-[1.75rem] leading-tight">8</b>
          </div>
        </div>
      </section>

      <div className="flex justify-between items-center gap-3 mb-3">
        <h2 className="m-0 text-[1.125rem] font-bold">Things you have done</h2>
      </div>

      <div role="group" aria-label="Filter practice items" className="flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => {
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

      <div className="grid gap-2.5">
        {visibleItems.map((item) => {
          const isNeed = item.state === 'need';
          return (
            <article
              key={item.title}
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
                onClick={() => openSetup(item.track === 'net' ? 'network' : 'pc', item.title)}
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
    </div>
  );
}
