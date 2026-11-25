import { CornerBrackets } from '../components/ByteMascotSvg';
import { Icon } from '../components/Icon';
import { finalLessonLab, lessonLabel, TRACKS } from '../data/curriculum';
import { LESSON_CONTENT } from '../data/lessons';
import type { LessonImage } from '../data/lessons/types';
import { DEFAULT_PASS_MARK } from '../domain/rules/lessonProgress';
import { parseLessonKey } from '../domain/rules/quiz';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { TrackId } from '../types/streakbyte';

const h2Class = 'm-0 mb-3 font-head text-[20px] font-bold tracking-[-0.015em]';
const sectionClass = 'mt-8';

/** Shows a small "check this" tag, but only in development builds. */
function VerifyTag({ note }: { note?: string }) {
  if (!note || !import.meta.env.DEV) return null;
  return (
    <span
      className="ml-2 inline-block px-2 py-0.5 text-[10px] font-bold uppercase text-amber border border-amber"
      title={note}
    >
      Needs checking: {note}
    </span>
  );
}

function LessonFigure({ image, trackId }: { image: LessonImage; trackId: TrackId }) {
  const src = `${import.meta.env.BASE_URL}lessons/${trackId}/${image.file}`;

  if (image.available) {
    return (
      <figure className="m-0 grid gap-2">
        <div className="relative border border-line bg-panel2 p-2">
          <CornerBrackets />
          <img
            src={src}
            alt={image.alt}
            loading="lazy"
            className="w-full h-auto block bg-panel"
          />
        </div>
        <figcaption className="text-[11.5px] text-muted">
          {image.caption}
          {image.credit ? <span className="block text-[10.5px]">{image.credit}</span> : null}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="m-0 grid gap-2">
      <div
        role="img"
        aria-label={`Picture coming soon: ${image.alt}`}
        className="relative sb-blueprint-dots grid place-items-center min-h-[120px] p-4 border border-dashed border-line text-muted text-xs uppercase tracking-[0.05em] text-center"
      >
        <CornerBrackets />
        Picture coming soon
      </div>
      <figcaption className="text-[11.5px] text-muted">
        {image.caption}
        <span className="block text-[10.5px]">Photo credit: added when the picture is published.</span>
        {import.meta.env.DEV ? (
          <span className="block text-[10.5px] text-amber">
            TODO ({image.file}): {image.todo}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function LearnView() {
  const learnKey = useStreakByteStore((s) => s.learnKey);
  const navigate = useStreakByteStore((s) => s.navigate);
  const openSetup = useStreakByteStore((s) => s.openSetup);

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
      <header className="p-6 max-[760px]:p-4 border-b border-line flex justify-between items-end gap-4 flex-wrap">
        <div>
          <p className="m-0 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            {track.heading}
          </p>
          <h1
            id="learn-title"
            className="m-0 mt-1.5 sb-page-title text-[32px]"
          >
            {label}
          </h1>
          <p className="mt-2 mb-0 text-[12.5px] max-w-[68ch]">
            <b className="uppercase tracking-[0.04em]">Goal:</b> {content.goal}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <a
            href="#curriculum"
            onClick={(e) => {
              e.preventDefault();
              navigate('curriculum');
            }}
            className="inline-flex items-center justify-center gap-2 min-h-10 px-4 border border-line bg-panel text-ink font-bold text-[10.5px] uppercase tracking-[0.06em] no-underline hover:border-ink hover:bg-panel2 transition-colors"
          >
            <Icon name="back" className="w-4 h-4" />
            Back to lessons
          </a>
          <button
            type="button"
            onClick={() => navigate(`quiz/${learnKey}`)}
            className="sb-cut-sm inline-flex items-center justify-center gap-2 min-h-10 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00] transition-colors"
          >
            Take quiz ▶
          </button>
        </div>
      </header>

      <section aria-labelledby="learn-definitions" className="max-w-[1060px] mx-auto px-6 pt-7 max-[760px]:px-4">
        <h2 id="learn-definitions" className={h2Class}>
          Definitions
        </h2>
        {content.definitions.length === 0 ? (
          <p className="m-0 text-muted border border-line bg-panel2 p-4">{content.definitionsNote}</p>
        ) : (
          <dl className="grid grid-cols-2 max-[760px]:grid-cols-1 border border-line m-0">
            {content.definitions.map((d, idx) => (
              <div
                key={d.term}
                className={`p-4 border-b border-line ${idx % 2 === 0 ? 'min-[761px]:border-r' : ''
                  }`}
              >
                <dt className="font-head font-bold text-[15px]">
                  {d.term}
                  <VerifyTag note={d.verify} />
                </dt>
                <dd className="m-0 mt-1.5 text-muted text-[12px]">{d.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="learn-parts" className={`${sectionClass} max-w-[1060px] mx-auto px-6 max-[760px]:px-4`}>
        <h2 id="learn-parts" className={h2Class}>
          Necessary parts
        </h2>
        <ul className="grid gap-4 m-0 p-0 list-none">
          {content.parts.map((part) => (
            <li key={part.name} className="p-5 border border-line bg-panel">
              <h3 className="m-0 font-head text-[16px] font-bold">
                {part.name}
                <VerifyTag note={part.verify} />
              </h3>
              {part.does && (
                <p className="mt-2 mb-0 text-[12.5px]">
                  <b>Does:</b> {part.does}
                </p>
              )}
              {part.looksLike && (
                <p className="mt-1.5 mb-0 text-muted text-[12px]">
                  <b className="text-ink">Looks like:</b> {part.looksLike}
                </p>
              )}
              {part.images.length > 0 && (
                <div className="mt-3.5 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                  {part.images.map((image) => (
                    <LessonFigure key={image.file} image={image} trackId={trackId} />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {content.steps && content.steps.length > 0 && (
        <section aria-labelledby="learn-steps" className={`${sectionClass} max-w-[1060px] mx-auto px-6 max-[760px]:px-4`}>
          <h2 id="learn-steps" className={h2Class}>
            {isFinal ? 'Build steps' : 'How to install'}
          </h2>
          <ol className="grid gap-2 m-0 pl-6 list-decimal">
            {content.steps.map((step) => (
              <li key={step.text} className="text-[12.5px]">
                {step.text}
                <VerifyTag note={step.verify} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {content.notes && content.notes.length > 0 && (
        <section aria-labelledby="learn-notes" className={`${sectionClass} max-w-[1060px] mx-auto px-6 max-[760px]:px-4`}>
          <h2 id="learn-notes" className={h2Class}>
            Good to know
          </h2>
          <div className="grid gap-3">
            {content.notes.map((note) => (
              <div key={note.title} className="p-4 border border-line bg-panel2">
                <h3 className="m-0 font-head text-[15px] font-bold">{note.title}</h3>
                <p className="m-0 mt-1 text-muted text-[12px]">{note.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-[1060px] mx-auto px-6 max-[760px]:px-4 mt-8">
        <div className="grid grid-cols-2 max-[760px]:grid-cols-1 border border-line">
          <section aria-labelledby="learn-key-points" className="p-5 border-r border-line max-[760px]:border-r-0 max-[760px]:border-b">
            <h2 id="learn-key-points" className={h2Class}>
              Key points
            </h2>
            <ul className="grid gap-2 m-0 pl-5 list-disc text-[12px]">
              {content.keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="learn-mistakes" className="p-5 bg-panel2">
            <h2 id="learn-mistakes" className={h2Class}>
              Common mistakes
            </h2>
            <ul className="grid gap-2 m-0 pl-5 list-disc text-[12px] text-muted">
              {content.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {isFinal && (
        <section aria-labelledby="learn-lab" className={`${sectionClass} max-w-[1060px] mx-auto px-6 max-[760px]:px-4`}>
          <div className="p-5 border border-line bg-panel2">
            <h2 id="learn-lab" className={h2Class}>
              Hands-on lab
            </h2>
            <p className="mt-0 mb-3 text-muted text-[12px]">
              Put what you learned to work in the interactive lab.
            </p>
            <button
              type="button"
              onClick={() => openSetup(finalLessonLab(trackId), lesson.title)}
              className="sb-cut-sm inline-flex items-center justify-center gap-2 min-h-10 px-4 border border-ink bg-panel text-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:bg-panel3 transition-colors"
            >
              <Icon name="play" className="w-4 h-4" />
              Start the lab
            </button>
          </div>
        </section>
      )}

      <section
        aria-labelledby="learn-quiz"
        className="mt-8 max-w-[1060px] mx-auto px-6 max-[760px]:px-4"
      >
        <div className="p-6 border border-[var(--dark-card)] bg-[var(--dark-card)] text-white flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 id="learn-quiz" className="m-0 font-head text-[20px] font-bold text-white">
              Quiz
            </h2>
            <p className="m-0 mt-1 text-white/70 text-[12px]">
              4 questions, 4 choices each. Get {DEFAULT_PASS_MARK} of 4 right to complete this lesson.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`quiz/${learnKey}`)}
            className="sb-cut inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00] transition-colors"
          >
            Take the quiz
          </button>
        </div>
      </section>

      <section aria-labelledby="learn-references" className="mt-8 max-w-[1060px] mx-auto px-6 pb-8 max-[760px]:px-4">
        <div className="pt-5 border-t border-line">
          <h2
            id="learn-references"
            className="text-[11px] font-bold text-muted uppercase tracking-[0.08em] mb-2.5"
          >
            References
          </h2>
          <ol className="grid gap-1.5 text-[12px] m-0 pl-5 list-decimal">
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
                {import.meta.env.DEV && ref.note ? (
                  <span className="ml-2 text-[11px] text-amber">Needs checking: {ref.note}</span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </article>
  );
}
