import { CornerBrackets } from '../components/ByteMascotSvg';
import { Icon } from '../components/Icon';
import { lessonLabel, TRACKS } from '../data/curriculum';
import { LESSON_CONTENT } from '../data/lessons';
import type { LessonImage } from '../data/lessons/types';
import { DEFAULT_PASS_MARK } from '../domain/rules/lessonProgress';
import { parseLessonKey, QUIZ_LENGTH } from '../domain/rules/quiz';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { TrackId } from '../types/streakbyte';

const containerClass = 'w-full px-[10%] max-[760px]:px-4';
const h2Class = 'm-0 mb-4 font-disp text-[22px] max-[760px]:text-[20px] font-bold leading-tight tracking-[-0.02em] text-ink';
const sectionClass = `mt-10 ${containerClass}`;

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
              compact ? 'h-[230px] max-[820px]:h-[210px]' : 'h-[240px] max-[640px]:h-[200px]'
            } object-contain block bg-panel`}
          />
        </div>
        <figcaption className="text-[13px] leading-snug text-ink/85">
          {image.caption}
          {image.credit ? <span className="block mt-0.5 text-[11.5px] text-muted">{image.credit}</span> : null}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="m-0 flex flex-col gap-2">
      <div
        role="img"
        aria-label={`Picture coming soon: ${image.alt}`}
        className="relative sb-blueprint-dots grid place-items-center min-h-[170px] p-4 border border-dashed border-line text-muted text-[12.5px] uppercase tracking-[0.05em] text-center"
      >
        <CornerBrackets />
        Picture coming soon
      </div>
      <figcaption className="text-[13px] leading-snug text-ink/85">
        {image.caption}
        <span className="block mt-0.5 text-[11.5px] text-muted">
          Photo credit: added when the picture is published.
        </span>
      </figcaption>
    </figure>
  );
}

export function LearnView() {
  const learnKey = useStreakByteStore((s) => s.learnKey);
  const navigate = useStreakByteStore((s) => s.navigate);

  const parsed = learnKey ? parseLessonKey(learnKey) : null;
  const track = parsed ? TRACKS[parsed.trackId as TrackId] : undefined;
  const index = parsed ? parsed.number - 1 : -1;
  const lesson = track?.lessons[index];
  const content = learnKey ? LESSON_CONTENT[learnKey] : undefined;
  if (!parsed || !track || !lesson || !content) return null;

  const trackId = track.id;
  const label = lessonLabel(lesson, index);
  const isFinal = lesson.kind === 'final';

  return (
    <article aria-labelledby="learn-title" className="w-full bg-panel">
      <header className="border-b border-line bg-panel2/40">
        <div className={`${containerClass} py-7 max-[760px]:py-5 flex justify-between items-start gap-4 flex-wrap`}>
          <div>
            <p className="m-0 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.09em] text-muted">
              <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
              {track.heading}
            </p>
            <h1
              id="learn-title"
              className="m-0 mt-1.5 font-disp text-[34px] max-[760px]:text-[26px] leading-[1.12] tracking-[-0.025em] text-ink"
            >
              {label}
            </h1>
            <p className="mt-3 mb-0 text-[15.5px] leading-[1.6] text-ink/90 max-w-[85ch]">
              <b className="text-ink font-bold">Goal:</b> {content.goal}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <a
              href="#curriculum"
              onClick={(e) => {
                e.preventDefault();
                navigate('curriculum');
              }}
              className="inline-flex items-center justify-center gap-2 min-h-10 px-4 border border-line bg-panel text-ink font-semibold text-[12px] no-underline hover:border-ink hover:bg-panel2 transition-colors"
            >
              <Icon name="back" className="w-4 h-4" />
              Back to lessons
            </a>
          </div>
        </div>
      </header>

      <section aria-labelledby="learn-definitions" className={`pt-8 ${containerClass}`}>
        <h2 id="learn-definitions" className={h2Class}>
          Definitions
        </h2>
        {content.definitions.length === 0 ? (
          <p className="m-0 text-[15px] leading-[1.6] text-muted border border-line bg-panel2 p-5">
            {content.definitionsNote}
          </p>
        ) : (
          <dl className="grid grid-cols-2 max-[760px]:grid-cols-1 border border-line m-0">
            {content.definitions.map((d, idx) => (
              <div
                key={d.term}
                className={`p-5 border-b border-line ${idx % 2 === 0 ? 'min-[761px]:border-r' : ''}`}
              >
                <dt className="font-head font-bold text-[16px] leading-snug text-ink">{d.term}</dt>
                <dd className="m-0 mt-1.5 text-muted text-[14.5px] leading-[1.6]">{d.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="learn-parts" className={sectionClass}>
        <h2 id="learn-parts" className={h2Class}>
          Necessary parts
        </h2>
        <ul className="grid gap-5 m-0 p-0 list-none">
          {content.parts.map((part) => {
            const singleImage = part.images.length === 1;
            const imageGridCols =
              part.images.length >= 3
                ? 'grid-cols-3 max-[900px]:grid-cols-2 max-[640px]:grid-cols-1'
                : 'grid-cols-2 max-[640px]:grid-cols-1';

            const textContent = (
              <div className="min-w-0">
                <h3 className="m-0 font-head text-[18px] font-bold leading-snug text-ink">
                  {part.name}
                </h3>
                {part.does && (
                  <p className="mt-2.5 mb-0 text-[15px] leading-[1.65] text-ink">
                    <b className="font-semibold text-ink">Does:</b> {part.does}
                  </p>
                )}
                {part.looksLike && (
                  <p className="mt-2 mb-0 text-[14.5px] leading-[1.65] text-muted">
                    <b className="font-semibold text-ink">Looks like:</b> {part.looksLike}
                  </p>
                )}
              </div>
            );

            if (singleImage) {
              return (
                <li
                  key={part.name}
                  className="p-6 max-[760px]:p-4 border border-line bg-panel grid grid-cols-[minmax(0,1.4fr)_minmax(280px,400px)] max-[820px]:grid-cols-1 gap-6 items-start"
                >
                  {textContent}
                  <LessonFigure image={part.images[0]} trackId={trackId} compact />
                </li>
              );
            }

            return (
              <li key={part.name} className="p-6 max-[760px]:p-4 border border-line bg-panel">
                {textContent}
                {part.images.length > 0 && (
                  <div className={`mt-5 grid ${imageGridCols} gap-5`}>
                    {part.images.map((image) => (
                      <LessonFigure key={image.file} image={image} trackId={trackId} />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {content.steps && content.steps.length > 0 && (
        <section aria-labelledby="learn-steps" className={sectionClass}>
          <h2 id="learn-steps" className={h2Class}>
            {isFinal ? 'Build steps' : 'How to install'}
          </h2>
          <ol className="grid gap-3 m-0 pl-6 list-decimal">
            {content.steps.map((step) => (
              <li key={step.text} className="text-[15px] leading-[1.65] text-ink pl-1">
                {step.text}
              </li>
            ))}
          </ol>
        </section>
      )}

      {content.notes && content.notes.length > 0 && (
        <section aria-labelledby="learn-notes" className={sectionClass}>
          <h2 id="learn-notes" className={h2Class}>
            Good to know
          </h2>
          <div className="grid gap-3">
            {content.notes.map((note) => (
              <div key={note.title} className="p-5 border border-line bg-panel2">
                <h3 className="m-0 font-head text-[16px] font-bold text-ink">{note.title}</h3>
                <p className="m-0 mt-1.5 text-muted text-[14.5px] leading-[1.65]">
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={sectionClass}>
        <div className="grid grid-cols-2 max-[760px]:grid-cols-1 border border-line">
          <section
            aria-labelledby="learn-key-points"
            className="p-6 max-[760px]:p-4 border-r border-line max-[760px]:border-r-0 max-[760px]:border-b"
          >
            <h2 id="learn-key-points" className={h2Class}>
              Key points
            </h2>
            <ul className="grid gap-2.5 m-0 pl-5 list-disc text-[14.5px] leading-[1.6] text-ink">
              {content.keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="learn-mistakes" className="p-6 max-[760px]:p-4 bg-panel2">
            <h2 id="learn-mistakes" className={h2Class}>
              Common mistakes
            </h2>
            <ul className="grid gap-2.5 m-0 pl-5 list-disc text-[14.5px] leading-[1.6] text-muted">
              {content.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {isFinal ? (
        <section aria-labelledby="learn-lab" className={sectionClass}>
          <div className="p-6 border border-[var(--dark-card)] bg-[var(--dark-card)] text-white flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.09em] text-white/60">
                BOSS LAB SANDBOX
              </div>
              <h2 id="learn-lab" className="m-0 mt-1 font-disp text-[22px] font-bold text-white">
                Hands-on Final Boss Lab
              </h2>
              <p className="m-0 mt-1.5 text-white/80 text-[14.5px] leading-[1.55]">
                Review these steps first. When you are ready, launch the interactive hands-on
                simulator from the Boss Lab Sandbox panel on the Curriculum page.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('curriculum')}
              className="sb-cut inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-cyan bg-cyan text-cyan-ink font-bold text-[12.5px] cursor-pointer hover:brightness-110 transition-colors"
            >
              <Icon name="play" className="w-4 h-4" />
              Go to Boss Lab Sandbox ▶
            </button>
          </div>
        </section>
      ) : (
        <section aria-labelledby="learn-quiz" className={sectionClass}>
          <div className="p-6 border border-[var(--dark-card)] bg-[var(--dark-card)] text-white flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 id="learn-quiz" className="m-0 font-disp text-[22px] font-bold text-white">
                Quiz
              </h2>
              <p className="m-0 mt-1.5 text-white/80 text-[14.5px] leading-[1.55]">
                {QUIZ_LENGTH} random questions, 4 choices each. Get {DEFAULT_PASS_MARK} of {QUIZ_LENGTH} right to
                complete this lesson.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`quiz/${learnKey}`)}
              className="sb-cut inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-cyan bg-cyan text-cyan-ink font-bold text-[12.5px] cursor-pointer hover:brightness-110 transition-colors"
            >
              Take the quiz
            </button>
          </div>
        </section>
      )}

      <section aria-labelledby="learn-references" className={`${sectionClass} pb-10`}>
        <div className="pt-6 border-t border-line">
          <h2
            id="learn-references"
            className="text-[12px] font-bold text-muted uppercase tracking-[0.08em] mb-3"
          >
            References
          </h2>
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
      </section>
    </article>
  );
}
