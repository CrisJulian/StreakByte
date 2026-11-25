import { CornerBrackets } from '../components/ByteMascotSvg';
import { Icon } from '../components/Icon';
import { finalLessonLab, getTrackProgress, lessonLabel, TRACKS } from '../data/curriculum';
import { lessonKeyFor } from '../domain/rules/lessonProgress';
import { useStreakByteStore } from '../store/useStreakByteStore';

export function CurriculumView() {
  const track = useStreakByteStore((s) => s.track);
  const selectedTracks = useStreakByteStore((s) => s.profileSettings.selectedTracks);
  const searchQuery = useStreakByteStore((s) => s.searchQuery);
  const setTrack = useStreakByteStore((s) => s.setTrack);
  const setSearchQuery = useStreakByteStore((s) => s.setSearchQuery);
  const completions = useStreakByteStore((s) => s.completions);
  const navigate = useStreakByteStore((s) => s.navigate);
  const openSetup = useStreakByteStore((s) => s.openSetup);

  const activeTrackId = selectedTracks.includes(track) ? track : selectedTracks[0] ?? 'hw';
  const activeTrack = TRACKS[activeTrackId];
  // Done / current / locked are worked out from the saved quiz results, never stored.
  const progress = getTrackProgress(activeTrackId, completions);
  const currentIdx = progress.lessons.findIndex((l) => l.status === 'cur');
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
    <div className="w-full bg-panel">
      <div className="p-6 max-[760px]:p-4 border-b border-line flex justify-between items-end gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            <span>MISSION DIRECTORY</span>
          </div>
          <h1 className="m-0 mt-1.5 sb-page-title text-[32px]">
            {activeTrack.heading}
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[12px]">
            {activeTrack.description}
          </p>
        </div>

        {selectedTracks.length > 1 ? (
          <div
            role="group"
            aria-label="Track"
            className="inline-flex border border-ink bg-panel"
          >
            <button
              type="button"
              aria-pressed={activeTrackId === 'hw'}
              onClick={() => setTrack('hw')}
              className={`min-h-10 px-4 border-0 font-bold text-[10.5px] uppercase tracking-[0.07em] cursor-pointer transition-colors ${activeTrackId === 'hw'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-transparent text-ink hover:bg-panel2'
                }`}
            >
              Hardware
            </button>
            <button
              type="button"
              aria-pressed={activeTrackId === 'net'}
              onClick={() => setTrack('net')}
              className={`min-h-10 px-4 border-0 border-l border-ink font-bold text-[10.5px] uppercase tracking-[0.07em] cursor-pointer transition-colors ${activeTrackId === 'net'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-transparent text-ink hover:bg-panel2'
                }`}
            >
              Networking
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('profile')}
            className="min-h-10 px-4 border border-line bg-panel2 text-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:border-ink"
          >
            Studying {activeTrack.heading} · Manage tracks
          </button>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_330px] max-[1000px]:grid-cols-1 items-stretch">
        <div className="p-6 max-[760px]:p-4 border-r border-line max-[1000px]:border-r-0 max-[1000px]:border-b">
          <div className="mb-4">
            <label
              htmlFor="curr-search"
              className="block text-[10px] font-bold uppercase tracking-[0.07em] text-muted mb-1.5"
            >
              Filter lessons, parts, topics
            </label>
            <div className="relative flex items-center">
              <Icon name="search" className="w-4 h-4 absolute left-3 text-muted pointer-events-none" />
              <input
                id="curr-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lessons, parts, topics"
                aria-label="Search lessons, parts, topics"
                className="w-full min-h-10 pl-9 pr-4 border border-line bg-bg text-ink text-xs placeholder:text-muted focus-visible:outline-none focus-visible:border-ink"
              />
            </div>
          </div>

          <ol className="border border-line">
            {filteredLessons.length === 0 ? (
              <li className="p-5 text-muted text-xs">
                No lessons match your search. Clear the search box to see all lessons in this track.
              </li>
            ) : (
              filteredLessons.map(({ lesson, idx }) => {
                const derived = progress.lessons[idx];
                const key = lessonKeyFor(activeTrackId, idx);
                const label = lessonLabel(lesson, idx);
                const isDone = derived.status === 'done';
                const isCur = derived.status === 'cur';
                const isLock = derived.status === 'lock';

                return (
                  <li
                    key={lesson.title}
                    data-status={derived.status}
                    className={`grid grid-cols-[44px_minmax(0,1fr)_auto_auto] max-[760px]:grid-cols-[38px_minmax(0,1fr)] gap-3.5 items-center px-4 py-4 border-b border-line last:border-b-0 ${isLock
                        ? 'bg-panel2 text-muted'
                        : isCur
                          ? 'bg-you shadow-[inset_4px_0_0_var(--cyan)]'
                          : 'bg-panel'
                      }`}
                  >
                    <span
                      className={`grid place-items-center w-9 h-9 border font-disp text-sm ${isDone
                          ? 'bg-[var(--dark-card)] text-white border-[var(--dark-card)]'
                          : isCur
                            ? 'bg-cyan text-cyan-ink border-cyan'
                            : 'bg-panel text-muted border-line'
                        }`}
                    >
                      {isDone ? (
                        <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                      ) : (
                        String(idx + 1).padStart(2, '0')
                      )}
                    </span>

                    <div className="min-w-0">
                      <h3 className="m-0 font-head text-[15px] font-bold leading-snug flex items-center gap-2 flex-wrap">
                        <span>{lesson.title}</span>
                        {lesson.kind === 'final' && (
                          <span className="text-[9.5px] font-mono font-bold uppercase tracking-[0.06em] px-2 py-0.5 bg-[var(--dark-card)] text-cyan">
                            Final Boss Lab
                          </span>
                        )}
                      </h3>
                      <p className="mt-0.5 mb-0 text-muted text-[11.5px]">{lesson.subtitle}</p>
                      {isLock && derived.lockMessage && (
                        <p className="mt-1 mb-0 inline-flex items-center gap-1.5 text-[11px] font-bold">
                          <Icon name="lock" className="w-3.5 h-3.5" />
                          {derived.lockMessage}
                        </p>
                      )}
                    </div>

                    <span className="num px-2 py-1 border border-line bg-panel text-[10px] font-bold uppercase tracking-[0.05em] text-muted whitespace-nowrap max-[760px]:hidden">
                      +{lesson.xp} XP · {lesson.minutes} min
                    </span>

                    <span className="inline-flex items-center justify-end gap-2 flex-wrap max-[760px]:col-span-full max-[760px]:justify-start">
                      {isLock && (
                        <span className="px-2.5 py-1 bg-panel3 text-muted font-bold text-[10px] uppercase tracking-[0.06em]">
                          Locked
                        </span>
                      )}
                      {isDone && (
                        <span className="text-green font-bold text-[10.5px] uppercase tracking-[0.05em]">
                          Completed
                        </span>
                      )}
                      {isCur && (
                        <span className="text-cyan font-bold text-[10.5px] uppercase tracking-[0.05em]">
                          Up next
                        </span>
                      )}
                      {!isLock && (
                        <button
                          type="button"
                          aria-label={`${isDone ? 'Review' : 'Open'} ${label}`}
                          onClick={() => navigate(`learn/${key}`)}
                          className={`sb-cut-sm min-h-9 px-3 border font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${isCur
                              ? 'border-cyan bg-cyan text-cyan-ink hover:bg-[#e64b00]'
                              : 'border-line bg-panel text-ink hover:border-ink hover:bg-panel2'
                            }`}
                        >
                          {isDone ? 'Review' : 'Open'}
                        </button>
                      )}
                      {isDone && (
                        <button
                          type="button"
                          aria-label={`Quiz for ${label}`}
                          onClick={() => navigate(`quiz/${key}`)}
                          className="min-h-9 px-3 border border-line bg-panel text-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer hover:border-ink hover:bg-panel2"
                        >
                          Quiz
                        </button>
                      )}
                    </span>
                  </li>
                );
              })
            )}
          </ol>
        </div>

        <aside
          aria-label="Track progress"
          className="p-6 max-[760px]:p-4 bg-panel2 flex flex-col gap-4"
        >
          <div className="border border-line bg-panel p-5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
              <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
              TRACK TELEMETRY
            </div>
            <h2 className="m-0 mt-1.5 mb-1 font-head text-[18px] font-bold">{activeTrack.heading}</h2>
            <p className="m-0 text-muted text-[11.5px]">
              {progress.doneCount} of {progress.total} lessons complete
            </p>

            <div
              className="grid gap-1 my-3.5"
              style={{ gridTemplateColumns: `repeat(${progress.total}, minmax(0, 1fr))` }}
              aria-hidden="true"
            >
              {progress.lessons.map((l) => (
                <i
                  key={l.key}
                  className={`h-2.5 ${l.status === 'done' ? 'bg-cyan' : 'bg-panel3'}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 p-2.5 border border-line bg-panel2 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                Next badge
              </span>
              <b className="px-2 py-0.5 bg-you text-cyan text-[10px] font-bold uppercase tracking-[0.06em]">
                {activeTrack.badge}
              </b>
            </div>

            {currentIdx >= 0 ? (
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`learn/${lessonKeyFor(activeTrackId, currentIdx)}`)}
                  className="sb-cut w-full inline-flex items-center justify-center gap-2 min-h-11 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:bg-[#e64b00]"
                >
                  Start lesson
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`quiz/${lessonKeyFor(activeTrackId, currentIdx)}`)}
                  className="sb-cut w-full inline-flex items-center justify-center gap-2 min-h-11 px-4 border border-[var(--dark-card)] bg-[var(--dark-card)] text-white font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-opacity hover:opacity-90"
                >
                  Take the quiz
                </button>
              </div>
            ) : (
              <p className="m-0 text-green font-bold text-xs uppercase tracking-[0.05em]">
                All lessons complete!
              </p>
            )}
          </div>

          <div className="relative border border-[var(--dark-card)] bg-[var(--dark-card)] text-white p-5">
            <CornerBrackets light />
            <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-white/60">
              BOSS LAB SANDBOX
            </div>
            <h3 className="m-0 mt-1.5 mb-1.5 font-head text-base font-bold">
              Hands-on Build Simulator
            </h3>
            <p className="m-0 mb-3.5 text-[11px] text-white/70">
              Practice installing components or configuring IPv4 networks anytime.
            </p>
            <button
              type="button"
              onClick={() => openSetup(finalLessonLab(activeTrackId), activeTrack.heading)}
              className="sb-cut-sm w-full min-h-9 px-3 border border-cyan bg-cyan text-cyan-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00]"
            >
              Open {activeTrackId === 'net' ? 'Network' : 'PC'} Lab ▶
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
