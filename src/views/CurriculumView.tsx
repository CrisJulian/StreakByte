import { Icon } from '../components/Icon';
import { TRACKS } from '../data/curriculum';
import { useStreakByteStore } from '../store/useStreakByteStore';

export function CurriculumView() {
  const track = useStreakByteStore((s) => s.track);
  const searchQuery = useStreakByteStore((s) => s.searchQuery);
  const setTrack = useStreakByteStore((s) => s.setTrack);
  const setSearchQuery = useStreakByteStore((s) => s.setSearchQuery);
  const openSetup = useStreakByteStore((s) => s.openSetup);

  const activeTrack = TRACKS[track];
  const q = searchQuery.trim().toLowerCase();
  const filteredLessons = activeTrack.lessons
    .map((lesson, idx) => ({ lesson, idx }))
    .filter(
      ({ lesson }) =>
        !q ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.subtitle.toLowerCase().includes(q),
    );

  return (
    <div>
      <div className="relative flex items-center mb-5">
        <Icon name="search" className="w-5 h-5 absolute left-3.5 text-muted pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search lessons, parts, topics"
          aria-label="Search lessons, parts, topics"
          className="w-full min-h-11 pl-[42px] pr-4 border border-line rounded-xl bg-panel text-ink text-[0.9375rem] placeholder:text-muted focus-visible:outline-none focus-visible:border-cyan"
        />
      </div>

      <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
        <div>
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]">
            {activeTrack.heading}
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[1.0625rem] max-w-[65ch]">
            {activeTrack.description}
          </p>
        </div>

        <div
          role="group"
          aria-label="Track"
          className="inline-flex p-1 border border-line rounded-xl bg-bg gap-1"
        >
          <button
            type="button"
            aria-pressed={track === 'hw'}
            onClick={() => setTrack('hw')}
            className={`min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
              track === 'hw'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            Hardware
          </button>
          <button
            type="button"
            aria-pressed={track === 'net'}
            onClick={() => setTrack('net')}
            className={`min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
              track === 'net'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            Networking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_360px] max-[1100px]:grid-cols-1 gap-5 items-start">
        <ol className="grid gap-2.5">
          {filteredLessons.length === 0 ? (
            <li className="bg-panel border border-line rounded-2xl p-[22px] text-muted text-sm">
              No lessons match your search. Clear the search box to see all lessons in this track.
            </li>
          ) : (
            filteredLessons.map(({ lesson, idx }) => {
              const isDone = lesson.status === 'done';
              const isCur = lesson.status === 'cur';
              const isLock = lesson.status === 'lock';
              const setupTarget = track === 'net' ? 'network' : 'pc';
              const setupTitle = `Lesson ${idx + 1}: ${lesson.title}`;

              return (
                <li
                  key={lesson.title}
                  tabIndex={isCur ? 0 : undefined}
                  role={isCur ? 'button' : undefined}
                  onClick={isCur ? () => openSetup(setupTarget, setupTitle) : undefined}
                  onKeyDown={
                    isCur
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openSetup(setupTarget, setupTitle);
                          }
                        }
                      : undefined
                  }
                  className={`grid grid-cols-[40px_minmax(0,1fr)_auto_auto_auto] max-[760px]:grid-cols-[36px_minmax(0,1fr)_auto] gap-3.5 items-center px-[18px] py-4 border rounded-[14px] transition-all ${
                    isLock
                      ? 'border-dashed border-line bg-transparent text-muted'
                      : isCur
                        ? 'bg-panel cursor-pointer hover:border-muted'
                        : 'bg-panel border-line hover:border-muted'
                  }`}
                  style={
                    isCur
                      ? { borderColor: 'color-mix(in srgb, var(--amber) 70%, var(--line))' }
                      : undefined
                  }
                >
                  <span
                    className={`grid place-items-center w-9 h-9 rounded-full font-bold text-sm font-mono ${
                      isDone
                        ? 'bg-green text-green-ink'
                        : isCur
                          ? 'bg-amber text-amber-ink'
                          : 'bg-panel2 text-muted'
                    }`}
                  >
                    {isDone ? (
                      <Icon name="check" className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    ) : (
                      idx + 1
                    )}
                  </span>

                  <div>
                    <h3 className="m-0 text-base font-bold leading-snug">{lesson.title}</h3>
                    <p className="mt-0.5 mb-0 text-muted text-sm">{lesson.subtitle}</p>
                  </div>

                  <span className="num text-sm text-muted whitespace-nowrap max-[760px]:hidden">
                    {lesson.minutes} min
                  </span>
                  <span className="num text-sm text-muted whitespace-nowrap max-[760px]:hidden">
                    +{lesson.xp} XP
                  </span>

                  {isDone && (
                    <span className="inline-flex items-center justify-end gap-1.5 text-green font-bold text-sm min-w-[104px]">
                      Completed
                    </span>
                  )}
                  {isCur && (
                    <span className="inline-flex items-center justify-end gap-1.5 text-amber font-bold text-sm min-w-[104px]">
                      In progress
                    </span>
                  )}
                  {isLock && (
                    <span className="inline-flex items-center justify-end gap-1.5 text-muted font-semibold text-sm min-w-[104px]">
                      <Icon name="lock" className="w-4 h-4" />
                      Locked
                    </span>
                  )}
                </li>
              );
            })
          )}
        </ol>

        <div className="grid gap-5 min-w-0">
          <aside aria-label="Track progress" className="bg-panel border border-line rounded-2xl p-[22px]">
            <h2 className="m-0 mb-1 text-[1.125rem] font-bold">{activeTrack.heading}</h2>
            <p className="m-0 text-muted text-sm">
              {activeTrack.done} of {activeTrack.total} lessons complete
            </p>

            <div className="grid grid-cols-12 gap-1 my-3" aria-hidden="true">
              {Array.from({ length: activeTrack.total }, (_, idx) => (
                <i
                  key={idx}
                  className={`h-2 rounded-[3px] ${idx < activeTrack.done ? 'bg-amber' : 'bg-panel2'}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.8125rem] font-semibold text-amber"
                style={{ background: 'color-mix(in srgb, var(--amber) 18%, transparent)' }}
              >
                Next badge
              </span>
              <b>{activeTrack.badge}</b>
            </div>

            <button
              type="button"
              onClick={() =>
                openSetup(
                  activeTrack.defaultTarget,
                  track === 'net' ? 'Lesson 2: IP address basics' : 'Lesson 3: Memory (RAM)',
                )
              }
              className="w-full inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110 active:brightness-95"
            >
              Start lesson
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
