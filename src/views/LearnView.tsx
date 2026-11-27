import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerBrackets } from '../components/ByteMascotSvg';
import { Icon } from '../components/Icon';
import { getTrackProgress, lessonLabel, TRACKS } from '../data/curriculum';
import { LESSON_CONTENT } from '../data/lessons';
import type { LessonBlock, LessonBullet, LessonImage } from '../data/lessons/types';
import { DEFAULT_PASS_MARK, getCompletedSectionPrefix, lessonKeyFor } from '../domain/rules/lessonProgress';
import { parseLessonKey, QUIZ_LENGTH } from '../domain/rules/quiz';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { TrackId } from '../types/streakbyte';

function LessonFigure({
  image,
  trackId,
  compact = false,
}: {
  image: LessonImage;
  trackId: TrackId;
  compact?: boolean;
}) {
  const src = `${import.meta.env.BASE_URL}lessons/${trackId}/${image.file}`;

  if (image.available) {
    return (
      <figure className="m-0 flex flex-col gap-2">
        <div className="relative border border-line bg-panel2 p-2.5">
          <CornerBrackets />
          <img
            src={src}
            alt={image.alt}
            loading="lazy"
            className={`w-full ${
              compact ? 'max-h-[220px]' : 'max-h-[300px]'
            } object-contain block bg-panel`}
          />
        </div>
        <figcaption className="text-[12.5px] leading-snug text-ink/85">
          {image.caption}
          {image.credit ? <span className="block mt-0.5 text-[11px] text-muted">{image.credit}</span> : null}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="m-0 flex flex-col gap-2">
      <div
        role="img"
        aria-label={`Picture coming soon: ${image.alt}`}
        className="relative sb-blueprint-dots grid place-items-center min-h-[160px] p-4 border border-dashed border-line text-muted text-[12px] uppercase tracking-[0.05em] text-center"
      >
        <CornerBrackets />
        Picture coming soon
      </div>
      <figcaption className="text-[12.5px] leading-snug text-ink/85">
        {image.caption}
      </figcaption>
    </figure>
  );
}

function renderBullet(bullet: LessonBullet) {
  if (typeof bullet === 'string') return bullet;
  return (
    <>
      <b className="font-semibold text-ink">{bullet.label}:</b> {bullet.text}
    </>
  );
}

function LessonBlockView({
  block,
  trackId,
  imageSide,
}: {
  block: LessonBlock;
  trackId: TrackId;
  imageSide: 'left' | 'right';
}) {
  const hasImages = (block.images?.length ?? 0) > 0;
  const images = block.images ?? [];
  const multiImages = images.length > 1;

  const textBody = (
    <div className="min-w-0 grid gap-4">
      {block.heading && (
        <h3 className="m-0 font-head text-[18px] font-bold leading-snug text-ink">
          {block.heading}
        </h3>
      )}

      {block.paragraphs?.map((p, idx) => (
        <p key={idx} className="m-0 text-[15px] leading-[1.7] text-ink/90">
          {p}
        </p>
      ))}

      {block.bullets && block.bullets.length > 0 && (
        <ul className="grid gap-2 m-0 pl-5 list-disc text-[14.5px] leading-[1.65] text-ink/90">
          {block.bullets.map((b, idx) => (
            <li key={idx}>{renderBullet(b)}</li>
          ))}
        </ul>
      )}

      {block.ordered && block.ordered.length > 0 && (
        <ol className="grid gap-2.5 m-0 pl-5 list-decimal text-[14.5px] leading-[1.65] text-ink/90">
          {block.ordered.map((step, idx) => (
            <li key={idx} className="pl-1">
              {step}
            </li>
          ))}
        </ol>
      )}

      {block.table && (
        <div className="overflow-x-auto border border-line bg-panel2/30">
          <table className="w-full border-collapse text-left text-[13.5px]">
            <thead>
              <tr className="bg-panel2 border-b border-line">
                {block.table.headers.map((header) => (
                  <th
                    key={header}
                    scope="col"
                    className="px-3.5 py-2.5 font-head text-[11.5px] font-bold uppercase tracking-[0.05em] text-muted whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-line last:border-b-0 odd:bg-panel even:bg-panel2/20">
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-3.5 py-2.5 align-top leading-snug ${
                        cIdx === 0 ? 'font-semibold text-ink' : 'text-ink/85'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (!hasImages) {
    return <div className={block.table ? 'w-full' : 'max-w-[78ch]'}>{textBody}</div>;
  }

  return (
    <div
      data-image-side={imageSide}
      className="grid grid-cols-1 min-[860px]:grid-cols-12 gap-7 items-start"
    >
      <div
        className={`min-w-0 min-[860px]:col-span-7 ${
          imageSide === 'left' ? 'min-[860px]:order-2' : 'min-[860px]:order-1'
        }`}
      >
        {textBody}
      </div>
      <div
        className={`min-w-0 min-[860px]:col-span-5 ${
          imageSide === 'left' ? 'min-[860px]:order-1' : 'min-[860px]:order-2'
        } grid ${images.length >= 3 ? 'grid-cols-2 max-[520px]:grid-cols-1 gap-3' : 'grid-cols-1 gap-4'}`}
      >
        {images.map((image) => (
          <LessonFigure key={image.file} image={image} trackId={trackId} compact={multiImages} />
        ))}
      </div>
    </div>
  );
}

export function LearnView() {
  const learnKey = useStreakByteStore((s) => s.learnKey);
  const completions = useStreakByteStore((s) => s.completions);
  const navigate = useStreakByteStore((s) => s.navigate);

  const parsed = learnKey ? parseLessonKey(learnKey) : null;
  const track = parsed ? TRACKS[parsed.trackId as TrackId] : undefined;
  const index = parsed ? parsed.number - 1 : -1;
  const lesson = track?.lessons[index];
  const content = learnKey ? LESSON_CONTENT[learnKey] : undefined;

  const [stepIdx, setStepIdx] = useState(0);
  const [sidebarTab, setSidebarTab] = useState<'outline' | 'resources'>('outline');
  const [outlineSearch, setOutlineSearch] = useState('');
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
  const completedByLesson = useStreakByteStore((s) => s.completedSections);
  const markLessonSectionCompleted = useStreakByteStore((s) => s.markLessonSectionCompleted);
  const pendingJumpRef = useRef<{ key: string; idx: number } | null>(null);
  const sectionEndRef = useRef<HTMLDivElement>(null);

  const trackProgress = useMemo(
    () => (track ? getTrackProgress(track.id, completions) : null),
    [track, completions],
  );

  const totalSteps = content ? content.sections.length + 1 : 1;
  const isCurrentLessonDone = Boolean(
    trackProgress && index >= 0 && trackProgress.lessons[index]?.status === 'done',
  );
  const completedSet = useMemo(
    () => new Set(learnKey ? completedByLesson[learnKey] ?? [] : []),
    [completedByLesson, learnKey],
  );
  const maxUnlockedIdx = useMemo(() => {
    if (!learnKey) return 0;
    if (isCurrentLessonDone) return totalSteps - 1;
    return Math.min(getCompletedSectionPrefix(completedByLesson[learnKey], totalSteps), totalSteps - 1);
  }, [completedByLesson, isCurrentLessonDone, learnKey, totalSteps]);

  const clampedStepIdx = Math.min(Math.max(stepIdx, 0), maxUnlockedIdx);
  const isCurrentStepCompleted = isCurrentLessonDone || completedSet.has(clampedStepIdx);

  useEffect(() => {
    if (!learnKey) return;
    const jump = pendingJumpRef.current;
    const nextIdx = jump && jump.key === learnKey ? jump.idx : 0;
    pendingJumpRef.current = null;
    setStepIdx(nextIdx);
    setExpandedLessons((prev) => ({ ...prev, [learnKey]: true }));
  }, [learnKey]);

  useEffect(() => {
    if (!learnKey || isCurrentLessonDone || isCurrentStepCompleted) return;

    const checkReachedEnd = () => {
      const sentinel = sectionEndRef.current;
      if (!sentinel) return;
      const rect = sentinel.getBoundingClientRect();
      const docHeight = document.documentElement.scrollHeight;
      const hasLayout = rect.width > 0 || rect.height > 0 || docHeight > 0;
      if (!hasLayout) return;

      const reachedSentinel = rect.top <= window.innerHeight + 24;
      const reachedDocBottom =
        docHeight > 0 && window.scrollY + window.innerHeight >= docHeight - 24;

      if (reachedSentinel || reachedDocBottom) {
        markLessonSectionCompleted(learnKey, clampedStepIdx);
      }
    };

    window.addEventListener('scroll', checkReachedEnd, { passive: true });
    window.addEventListener('resize', checkReachedEnd, { passive: true });
    const rafId = window.requestAnimationFrame(() => {
      if (window.scrollY <= 10) checkReachedEnd();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', checkReachedEnd);
      window.removeEventListener('resize', checkReachedEnd);
    };
  }, [learnKey, clampedStepIdx, isCurrentLessonDone, isCurrentStepCompleted, markLessonSectionCompleted]);

  useEffect(() => {
    if (!outlineOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOutlineOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [outlineOpen]);

  if (!parsed || !track || !lesson || !content || !learnKey || !trackProgress) return null;

  const trackId = track.id;
  const label = lessonLabel(lesson, index);
  const isFinal = lesson.kind === 'final';
  const isSummaryStep = clampedStepIdx === content.sections.length;
  const activeSection = !isSummaryStep ? content.sections[clampedStepIdx] : null;
  const completedCount = isCurrentLessonDone ? totalSteps : completedSet.size;
  const completedPct = Math.round((completedCount / totalSteps) * 100);

  const selectStep = (nextIdx: number) => {
    const maxStep = isCurrentLessonDone ? totalSteps - 1 : maxUnlockedIdx;
    const target = Math.min(Math.max(nextIdx, 0), maxStep);
    if (typeof window.scrollTo === 'function') {
      try {
        window.scrollTo(0, 0);
      } catch {
        // jsdom doesn't implement scrollTo
      }
    }
    setStepIdx(target);
    setOutlineOpen(false);
  };

  const jumpToLessonStep = (targetKey: string, targetIdx: number) => {
    if (targetKey === learnKey) {
      selectStep(targetIdx);
      return;
    }
    pendingJumpRef.current = { key: targetKey, idx: targetIdx };
    setOutlineOpen(false);
    navigate(`learn/${targetKey}`);
  };

  const nextLessonMeta =
    index + 1 < track.lessons.length
      ? {
          key: lessonKeyFor(trackId, index + 1),
          label: lessonLabel(track.lessons[index + 1], index + 1),
          locked: trackProgress.lessons[index + 1]?.status === 'lock',
        }
      : null;

  const prevStepLabel =
    clampedStepIdx > 0
      ? `${content.sections[clampedStepIdx - 1].number} ${content.sections[clampedStepIdx - 1].title}`
      : null;

  const nextStepLabel = !isSummaryStep
    ? clampedStepIdx + 1 < content.sections.length
      ? `${content.sections[clampedStepIdx + 1].number} ${content.sections[clampedStepIdx + 1].title}`
      : 'Summary & review'
    : null;

  const query = outlineSearch.trim().toLowerCase();

  let imageBlockCounter = 0;

  return (
    <article
      aria-labelledby="learn-title"
      className="w-full bg-panel grid grid-cols-1 min-[1000px]:grid-cols-[minmax(0,1fr)_340px] items-stretch min-h-[calc(100dvh-56px)]"
    >
      {/* Left / Middle reading workspace */}
      <div className="min-w-0 flex flex-col relative">
        <header className="border-b border-line bg-panel2/40 px-6 max-[760px]:px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex items-center gap-4 flex-wrap">
            <a
              href="#curriculum"
              onClick={(e) => {
                e.preventDefault();
                navigate('curriculum');
              }}
              className="inline-flex items-center gap-1.5 min-h-9 px-3 border border-line bg-panel text-ink font-semibold text-[12px] no-underline hover:border-ink hover:bg-panel2 transition-colors"
            >
              <Icon name="back" className="w-3.5 h-3.5" />
              Back to lessons
            </a>
            <div className="min-w-0">
              <p className="m-0 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-muted">
                <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
                {track.heading}
              </p>
              <h1
                id="learn-title"
                className="m-0 mt-0.5 font-disp text-[22px] max-[760px]:text-[19px] leading-tight tracking-[-0.02em] text-ink"
              >
                {label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="num px-2.5 py-1 border border-line bg-panel text-[11px] font-bold text-muted">
              {clampedStepIdx + 1} / {totalSteps}
            </span>
            <button
              type="button"
              aria-expanded={outlineOpen}
              aria-controls="course-outline-sidebar"
              onClick={() => setOutlineOpen((v) => !v)}
              className="min-[1000px]:hidden inline-flex items-center gap-1.5 min-h-9 px-3 border border-line bg-panel text-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:border-ink"
            >
              <Icon name="book" className="w-3.5 h-3.5" />
              Course Outline
            </button>
          </div>
        </header>

        {/* Active Section Body */}
        <div className="flex-1 relative px-10 max-[1100px]:px-6 max-[760px]:px-4 py-8 max-[760px]:py-6">
          {activeSection ? (
            <section aria-labelledby="section-heading" className="max-w-[960px] mx-auto">
              <h2
                id="section-heading"
                className="m-0 font-disp text-[30px] max-[760px]:text-[24px] font-bold leading-[1.15] tracking-[-0.02em] text-ink"
              >
                <span className="num text-cyan mr-2.5">{activeSection.number}</span>
                {activeSection.title}
              </h2>

              {clampedStepIdx === 0 && (
                <p className="mt-3 mb-0 px-4 py-2.5 border-l-2 border-cyan bg-panel2/50 text-[14.5px] leading-[1.6] text-ink/90 max-w-[78ch]">
                  <b className="text-ink font-bold">Goal:</b> {content.goal}
                </p>
              )}

              <div className="mt-7 grid gap-8">
                {activeSection.blocks.map((block, bIdx) => {
                  const hasImages = (block.images?.length ?? 0) > 0;
                  const side =
                    block.imageSide ?? (hasImages && imageBlockCounter % 2 === 1 ? 'left' : 'right');
                  if (hasImages) imageBlockCounter += 1;
                  return (
                    <LessonBlockView
                      key={bIdx}
                      block={block}
                      trackId={trackId}
                      imageSide={side}
                    />
                  );
                })}
              </div>

              <div ref={sectionEndRef} data-testid="section-end" className="h-px w-full" aria-hidden="true" />
            </section>
          ) : (
            <section aria-labelledby="section-heading" className="max-w-[960px] mx-auto grid gap-7">
              <div>
                <p className="m-0 text-[11px] font-bold uppercase tracking-[0.09em] text-cyan">
                  Lesson recap
                </p>
                <h2
                  id="section-heading"
                  className="m-0 mt-1 font-disp text-[30px] max-[760px]:text-[24px] font-bold leading-[1.15] tracking-[-0.02em] text-ink"
                >
                  Summary &amp; review
                </h2>
              </div>

              <div className="grid grid-cols-2 max-[760px]:grid-cols-1 border border-line">
                <div className="p-6 max-[760px]:p-4 border-r border-line max-[760px]:border-r-0 max-[760px]:border-b bg-panel">
                  <h3 className="m-0 mb-3 font-disp text-[19px] font-bold text-ink">Key points</h3>
                  <ul className="grid gap-2.5 m-0 pl-5 list-disc text-[14.5px] leading-[1.6] text-ink">
                    {content.keyPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 max-[760px]:p-4 bg-panel2/60">
                  <h3 className="m-0 mb-3 font-disp text-[19px] font-bold text-ink">
                    Common mistakes
                  </h3>
                  <ul className="grid gap-2.5 m-0 pl-5 list-disc text-[14.5px] leading-[1.6] text-muted">
                    {content.commonMistakes.map((mistake) => (
                      <li key={mistake}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 border-t border-line">
                <h3 className="m-0 mb-3 text-[12px] font-bold text-muted uppercase tracking-[0.08em]">
                  References
                </h3>
                <ol className="grid gap-2 text-[14px] leading-relaxed m-0 pl-5 list-decimal">
                  {content.references.map((ref) => (
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
                </ol>
              </div>

              <div ref={sectionEndRef} data-testid="section-end" className="h-px w-full" aria-hidden="true" />
            </section>
          )}
        </div>

        {/* Bottom Prev / Next bar */}
        <footer className="border-t border-line bg-panel2/30 px-10 max-[1100px]:px-6 max-[760px]:px-4 py-4 max-[999px]:pb-24">
          <div className="max-w-[960px] mx-auto flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              disabled={clampedStepIdx === 0}
              onClick={() => selectStep(clampedStepIdx - 1)}
              className="inline-flex items-center gap-2 min-h-10 px-4 border border-line bg-panel text-ink font-semibold text-[12.5px] cursor-pointer hover:border-ink hover:bg-panel2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Icon name="back" className="w-3.5 h-3.5" />
              {prevStepLabel ? `Previous: ${prevStepLabel}` : 'Previous'}
            </button>

            {nextStepLabel ? (
              <div className="flex items-center gap-3 flex-wrap">
                {!isCurrentStepCompleted && (
                  <span className="text-[11.5px] text-muted">
                    Scroll to the bottom to unlock next
                  </span>
                )}
                <button
                  type="button"
                  disabled={!isCurrentStepCompleted}
                  onClick={() => selectStep(clampedStepIdx + 1)}
                  className="sb-cut-sm inline-flex items-center gap-2 min-h-10 px-4 border border-cyan bg-cyan/15 text-cyan font-bold text-[12.5px] cursor-pointer hover:bg-cyan/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next: {nextStepLabel}</span>
                  <Icon name="back" className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            ) : nextLessonMeta && !nextLessonMeta.locked ? (
              <button
                type="button"
                onClick={() => jumpToLessonStep(nextLessonMeta.key, 0)}
                className="sb-cut-sm inline-flex items-center gap-2 min-h-10 px-4 border border-line bg-panel text-ink font-semibold text-[12.5px] cursor-pointer hover:border-ink hover:bg-panel2 transition-colors"
              >
                <span>Next lesson: {nextLessonMeta.label}</span>
                <Icon name="back" className="w-3.5 h-3.5 rotate-180" />
              </button>
            ) : null}
          </div>
        </footer>
      </div>

      {/* Right Sidebar: Course Outline & Resources */}
      {outlineOpen && (
        <div
          aria-hidden="true"
          onClick={() => setOutlineOpen(false)}
          className="min-[1000px]:hidden fixed inset-0 z-[45] bg-[var(--scrim)]"
        />
      )}

      <aside
        id="course-outline-sidebar"
        aria-label="Course outline"
        className={`${
          outlineOpen
            ? 'fixed right-0 top-[56px] bottom-0 z-50 w-[320px] max-w-[90vw] flex'
            : 'hidden min-[1000px]:flex'
        } min-[1000px]:sticky min-[1000px]:top-[56px] min-[1000px]:h-[calc(100dvh-56px)] flex-col border-l border-line bg-panel2`}
      >
        {/* Top Tabs */}
        <div className="flex items-center border-b border-line bg-panel">
          <div role="tablist" aria-label="Lesson sidebar" className="flex-1 grid grid-cols-2">
            <button
              type="button"
              role="tab"
              id="tab-outline"
              aria-selected={sidebarTab === 'outline'}
              aria-controls="panel-outline"
              onClick={() => setSidebarTab('outline')}
              className={`min-h-11 px-3 flex items-center justify-center gap-1.5 border-0 border-b-2 font-bold text-[11.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${
                sidebarTab === 'outline'
                  ? 'border-cyan text-ink bg-panel2/60'
                  : 'border-transparent text-muted hover:text-ink bg-transparent'
              }`}
            >
              Course Outline
            </button>
            <button
              type="button"
              role="tab"
              id="tab-resources"
              aria-selected={sidebarTab === 'resources'}
              aria-controls="panel-resources"
              onClick={() => setSidebarTab('resources')}
              className={`min-h-11 px-3 flex items-center justify-center gap-1.5 border-0 border-b-2 font-bold text-[11.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${
                sidebarTab === 'resources'
                  ? 'border-cyan text-ink bg-panel2/60'
                  : 'border-transparent text-muted hover:text-ink bg-transparent'
              }`}
            >
              Resources
            </button>
          </div>
          {outlineOpen && (
            <button
              type="button"
              aria-label="Close course outline"
              onClick={() => setOutlineOpen(false)}
              className="min-[1000px]:hidden min-h-11 px-3 border-l border-line bg-panel text-muted hover:text-ink cursor-pointer"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {sidebarTab === 'outline' ? (
            <div role="tabpanel" id="panel-outline" aria-labelledby="tab-outline" className="p-4 grid gap-4">
              <div className="relative flex items-center">
                <Icon name="search" className="w-3.5 h-3.5 absolute left-3 text-muted pointer-events-none" />
                <input
                  type="search"
                  value={outlineSearch}
                  onChange={(e) => setOutlineSearch(e.target.value)}
                  placeholder="Search course outline"
                  aria-label="Search course outline"
                  className="w-full min-h-9 pl-8 pr-3 border border-line bg-bg text-ink text-[12px] placeholder:text-muted focus-visible:outline-none focus-visible:border-cyan"
                />
              </div>

              <div className="p-3 border border-line bg-panel">
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.06em]">
                  <span className="text-ink truncate">{track.heading}</span>
                  <span className="num text-cyan shrink-0">
                    {completedCount}/{totalSteps} · {completedPct}%
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-panel3 overflow-hidden" aria-hidden="true">
                  <div
                    className="h-full bg-green transition-all duration-300"
                    style={{ width: `${completedPct}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                {track.lessons.map((tLesson, lIdx) => {
                  const tKey = lessonKeyFor(trackId, lIdx);
                  const tContent = LESSON_CONTENT[tKey];
                  const tDerived = trackProgress.lessons[lIdx];
                  const isLocked = tDerived?.status === 'lock';
                  const isDone = tDerived?.status === 'done';
                  const isCurrentLesson = tKey === learnKey;
                  const tLabel = lessonLabel(tLesson, lIdx);
                  const tTotalSteps = tContent ? tContent.sections.length + 1 : 1;
                  const tMaxUnlocked = isDone
                    ? tTotalSteps - 1
                    : Math.min(getCompletedSectionPrefix(completedByLesson[tKey], tTotalSteps), tTotalSteps - 1);

                  const matchingSections = tContent
                    ? tContent.sections
                        .map((sec, sIdx) => ({ sec, sIdx }))
                        .filter(
                          ({ sec }) =>
                            !query ||
                            sec.number.toLowerCase().includes(query) ||
                            sec.title.toLowerCase().includes(query) ||
                            tLabel.toLowerCase().includes(query),
                        )
                    : [];

                  const summaryMatches =
                    !query ||
                    'summary & review'.includes(query) ||
                    tLabel.toLowerCase().includes(query);

                  if (query && matchingSections.length === 0 && !summaryMatches) {
                    return null;
                  }

                  const isExpanded = query
                    ? !isLocked
                    : expandedLessons[tKey] ?? isCurrentLesson;

                  return (
                    <div
                      key={tKey}
                      className={`border ${
                        isCurrentLesson ? 'border-cyan/60 bg-panel' : 'border-line bg-panel/60'
                      }`}
                    >
                      <button
                        type="button"
                        disabled={isLocked}
                        aria-expanded={!isLocked && isExpanded}
                        onClick={() => {
                          if (isLocked) return;
                          setExpandedLessons((prev) => ({
                            ...prev,
                            [tKey]: !(prev[tKey] ?? isCurrentLesson),
                          }));
                        }}
                        className={`w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left border-0 bg-transparent transition-colors ${
                          isLocked
                            ? 'text-muted opacity-65 cursor-not-allowed'
                            : 'text-ink cursor-pointer hover:bg-panel2/60'
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 shrink-0 grid place-items-center text-[10px] font-bold ${
                              isDone
                                ? 'bg-green text-green-ink'
                                : isLocked
                                  ? 'bg-panel3 text-muted'
                                  : isCurrentLesson
                                    ? 'bg-cyan text-cyan-ink'
                                    : 'border border-line text-muted'
                            }`}
                          >
                            {isDone ? (
                              <Icon name="check" className="w-3 h-3" strokeWidth={2.75} />
                            ) : isLocked ? (
                              <Icon name="lock" className="w-3 h-3" />
                            ) : (
                              lIdx + 1
                            )}
                          </span>
                          <span className="font-head font-bold text-[12.5px] leading-snug truncate">
                            {tLabel}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {tContent && (
                            <span className="num text-[10.5px] text-muted">
                              {tContent.sections.length + 1}
                            </span>
                          )}
                          {!isLocked && (
                            <Icon
                              name="back"
                              className={`w-3.5 h-3.5 text-muted transition-transform ${
                                isExpanded ? '-rotate-90' : 'rotate-180'
                              }`}
                            />
                          )}
                        </span>
                      </button>

                      {!isLocked && isExpanded && tContent && (
                        <ol className="m-0 px-3 pb-3 pt-1 border-t border-line/60 bg-panel2/30 grid">
                          {matchingSections.map(({ sec, sIdx }) => {
                            const isActive = isCurrentLesson && clampedStepIdx === sIdx;
                            const isCompleted =
                              isDone || (completedByLesson[tKey]?.includes(sIdx) ?? false);
                            const isSectionLocked = !isDone && sIdx > tMaxUnlocked;
                            return (
                              <li key={sec.number} className="relative pl-5">
                                <span
                                  aria-hidden="true"
                                  className="absolute left-[7px] top-0 bottom-0 w-px border-l border-dashed border-line"
                                />
                                <span
                                  aria-hidden="true"
                                  className={`absolute left-[1px] top-2.5 w-3.5 h-3.5 grid place-items-center rounded-full border ${
                                    isCompleted
                                      ? `border-green bg-green text-green-ink ${
                                          isActive ? 'ring-2 ring-cyan ring-offset-1 ring-offset-panel2' : ''
                                        }`
                                      : isActive
                                        ? 'border-cyan bg-cyan text-cyan-ink'
                                        : isSectionLocked
                                          ? 'border-line bg-panel3 text-muted'
                                          : 'border-line bg-panel'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <Icon name="check" className="w-2.5 h-2.5" strokeWidth={3} />
                                  ) : isSectionLocked ? (
                                    <Icon name="lock" className="w-2 h-2" />
                                  ) : null}
                                </span>
                                <button
                                  type="button"
                                  disabled={isSectionLocked}
                                  title={isSectionLocked ? 'Finish the previous section first' : undefined}
                                  aria-current={isActive ? 'step' : undefined}
                                  onClick={() => jumpToLessonStep(tKey, sIdx)}
                                  className={`w-full py-1.5 px-2 my-0.5 text-left text-[12.5px] leading-snug border-0 transition-colors ${
                                    isSectionLocked
                                      ? 'bg-transparent text-muted opacity-55 cursor-not-allowed'
                                      : isActive
                                        ? 'bg-panel3 text-ink font-bold cursor-pointer'
                                        : 'bg-transparent text-muted hover:text-ink hover:bg-panel2/60 cursor-pointer'
                                  }`}
                                >
                                  <span className="num mr-1.5 text-cyan">{sec.number}</span>
                                  <span>{sec.title}</span>
                                </button>
                              </li>
                            );
                          })}

                          {summaryMatches && (
                            <li className="relative pl-5">
                              {(() => {
                                const summaryIdx = tContent.sections.length;
                                const isActive = isCurrentLesson && isSummaryStep;
                                const isCompleted =
                                  isDone || (completedByLesson[tKey]?.includes(summaryIdx) ?? false);
                                const isSectionLocked = !isDone && summaryIdx > tMaxUnlocked;
                                return (
                                  <>
                                    <span
                                      aria-hidden="true"
                                      className="absolute left-[7px] top-0 h-3 w-px border-l border-dashed border-line"
                                    />
                                    <span
                                      aria-hidden="true"
                                      className={`absolute left-[1px] top-2.5 w-3.5 h-3.5 grid place-items-center rounded-full border ${
                                        isCompleted
                                          ? `border-green bg-green text-green-ink ${
                                              isActive ? 'ring-2 ring-cyan ring-offset-1 ring-offset-panel2' : ''
                                            }`
                                          : isActive
                                            ? 'border-cyan bg-cyan text-cyan-ink'
                                            : isSectionLocked
                                              ? 'border-line bg-panel3 text-muted'
                                              : 'border-line bg-panel'
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <Icon name="check" className="w-2.5 h-2.5" strokeWidth={3} />
                                      ) : isSectionLocked ? (
                                        <Icon name="lock" className="w-2 h-2" />
                                      ) : null}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={isSectionLocked}
                                      title={isSectionLocked ? 'Finish the previous section first' : undefined}
                                      aria-current={isActive ? 'step' : undefined}
                                      onClick={() => jumpToLessonStep(tKey, summaryIdx)}
                                      className={`w-full py-1.5 px-2 my-0.5 text-left text-[12.5px] leading-snug border-0 transition-colors ${
                                        isSectionLocked
                                          ? 'bg-transparent text-muted opacity-55 cursor-not-allowed'
                                          : isActive
                                            ? 'bg-panel3 text-ink font-bold cursor-pointer'
                                            : 'bg-transparent text-muted hover:text-ink hover:bg-panel2/60 cursor-pointer'
                                      }`}
                                    >
                                      Summary &amp; review
                                    </button>
                                  </>
                                );
                              })()}
                            </li>
                          )}
                        </ol>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div role="tabpanel" id="panel-resources" aria-labelledby="tab-resources" className="p-4 grid gap-5">
              <div className="p-3.5 border border-line bg-panel">
                <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-cyan">
                  Lesson goal
                </h2>
                <p className="m-0 mt-1.5 text-[13px] leading-relaxed text-ink/90">{content.goal}</p>
              </div>

              <div className="p-3.5 border border-line bg-panel">
                <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                  Key takeaways
                </h2>
                <ul className="m-0 mt-2 pl-4 list-disc grid gap-1.5 text-[12.5px] leading-snug text-ink/85">
                  {content.keyPoints.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="m-0 mb-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                  References
                </h2>
                <ol className="m-0 pl-4 list-decimal grid gap-2 text-[12.5px] leading-snug">
                  {content.references.map((ref) => (
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
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Persistent Sidebar Action Footer (extra bottom padding clears Study Buddy FAB) */}
        <div className="p-4 min-[1000px]:pb-[96px] border-t border-line bg-panel">
          {isFinal ? (
            <button
              type="button"
              onClick={() => navigate('curriculum')}
              className="sb-cut w-full inline-flex items-center justify-center gap-2 min-h-11 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[12px] uppercase tracking-[0.05em] cursor-pointer hover:brightness-110 transition-colors"
            >
              <Icon name="play" className="w-3.5 h-3.5" />
              Go to Boss Lab Sandbox ▶
            </button>
          ) : (
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => navigate(`quiz/${learnKey}`)}
                className="sb-cut w-full inline-flex items-center justify-center gap-2 min-h-11 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[12.5px] cursor-pointer hover:brightness-110 transition-colors"
              >
                Take the quiz
              </button>
              <p className="m-0 text-center text-[11px] text-muted">
                {QUIZ_LENGTH} questions · {DEFAULT_PASS_MARK} of {QUIZ_LENGTH} to pass
              </p>
            </div>
          )}
        </div>
      </aside>
    </article>
  );
}
