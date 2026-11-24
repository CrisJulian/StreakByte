import { Icon } from '../components/Icon';
import { finalLessonLab, lessonLabel, TRACKS } from '../data/curriculum';
import { LESSON_CONTENT } from '../data/lessons';
import type { LessonImage } from '../data/lessons/types';
import { DEFAULT_PASS_MARK } from '../domain/rules/lessonProgress';
import { parseLessonKey } from '../domain/rules/quiz';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { TrackId } from '../types/streakbyte';

const btnBase =
  'inline-flex items-center justify-center gap-2 min-h-11 px-[18px] rounded-[10px] font-semibold text-[0.9375rem] cursor-pointer transition-all';
const h2Class = 'm-0 mb-3 text-[1.25rem] font-bold tracking-[-0.01em]';
const sectionClass = 'mt-8';

/** Shows a small "check this" tag, but only in development builds. */
function VerifyTag({ note }: { note?: string }) {
  if (!note || !import.meta.env.DEV) return null;
  return (
    <span
      className="ml-2 inline-block px-2 py-0.5 rounded-full text-[0.75rem] font-semibold text-amber border border-amber"
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
      <figure className="m-0 grid gap-1.5">
        <img
          src={src}
          alt={image.alt}
          loading="lazy"
          className="w-full h-auto rounded-xl border border-line bg-panel2"
        />
        <figcaption className="text-sm text-muted">
          {image.caption}
          {image.credit ? <span className="block text-[0.8125rem]">{image.credit}</span> : null}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="m-0 grid gap-1.5">
      <div
        role="img"
        aria-label={`Picture coming soon: ${image.alt}`}
        className="grid place-items-center min-h-[120px] p-4 rounded-xl border border-dashed border-line bg-panel2 text-muted text-sm text-center"
      >
        Picture coming soon
      </div>
      <figcaption className="text-sm text-muted">
        {image.caption}
        <span className="block text-[0.8125rem]">Photo credit: added when the picture is published.</span>
        {import.meta.env.DEV ? (
          <span className="block text-[0.75rem] text-amber">
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
    <article aria-labelledby="learn-title" className="max-w-[820px] mx-auto">
      <a
        href="#curriculum"
        onClick={(e) => {
          e.preventDefault();
          navigate('curriculum');
        }}
        className={`${btnBase} border border-line bg-transparent text-ink no-underline hover:bg-panel2 hover:border-muted`}
      >
        <Icon name="back" className="w-[18px] h-[18px]" />
        Back to lessons
      </a>

      <header className="mt-5">
        <p className="m-0 text-sm font-semibold text-muted">{track.heading}</p>
        <h1
          id="learn-title"
          className="m-0 mt-1 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]"
        >
          {label}
        </h1>
        <p className="mt-3 mb-0 text-[1.0625rem]">
          <b>Goal:</b> {content.goal}
        </p>
      </header>

      <section aria-labelledby="learn-definitions" className={sectionClass}>
        <h2 id="learn-definitions" className={h2Class}>
          Definitions
        </h2>
        {content.definitions.length === 0 ? (
          <p className="m-0 text-muted">{content.definitionsNote}</p>
        ) : (
          <dl className="grid gap-3 m-0">
            {content.definitions.map((d) => (
              <div key={d.term} className="p-4 rounded-[14px] border border-line bg-panel">
                <dt className="font-bold">
                  {d.term}
                  <VerifyTag note={d.verify} />
                </dt>
                <dd className="m-0 mt-1 text-muted">{d.text}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section aria-labelledby="learn-parts" className={sectionClass}>
        <h2 id="learn-parts" className={h2Class}>
          Necessary parts
        </h2>
        <ul className="grid gap-4 m-0 p-0 list-none">
          {content.parts.map((part) => (
            <li key={part.name} className="p-[18px] rounded-2xl border border-line bg-panel">
              <h3 className="m-0 text-[1.0625rem] font-bold">
                {part.name}
                <VerifyTag note={part.verify} />
              </h3>
              {part.does && (
                <p className="mt-2 mb-0">
                  <b>Does:</b> {part.does}
                </p>
              )}
              {part.looksLike && (
                <p className="mt-1.5 mb-0 text-muted">
                  <b className="text-ink">Looks like:</b> {part.looksLike}
                </p>
              )}
              {part.images.length > 0 && (
                <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
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
        <section aria-labelledby="learn-steps" className={sectionClass}>
          <h2 id="learn-steps" className={h2Class}>
            {isFinal ? 'Build steps' : 'How to install'}
          </h2>
          <ol className="grid gap-2 m-0 pl-6">
            {content.steps.map((step) => (
              <li key={step.text}>
                {step.text}
                <VerifyTag note={step.verify} />
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
              <div key={note.title} className="p-4 rounded-[14px] border border-line bg-panel">
                <h3 className="m-0 text-base font-bold">{note.title}</h3>
                <p className="m-0 mt-1 text-muted">{note.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="learn-key-points" className={sectionClass}>
        <h2 id="learn-key-points" className={h2Class}>
          Key points
        </h2>
        <ul className="grid gap-1.5 m-0 pl-6">
          {content.keyPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="learn-mistakes" className={sectionClass}>
        <h2 id="learn-mistakes" className={h2Class}>
          Common mistakes
        </h2>
        <ul className="grid gap-1.5 m-0 pl-6">
          {content.commonMistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </section>

      {isFinal && (
        <section aria-labelledby="learn-lab" className={sectionClass}>
          <h2 id="learn-lab" className={h2Class}>
            Hands-on lab
          </h2>
          <p className="mt-0 text-muted">Put what you learned to work in the interactive lab.</p>
          <button
            type="button"
            onClick={() => openSetup(finalLessonLab(trackId), lesson.title)}
            className={`${btnBase} border border-line bg-transparent text-ink hover:bg-panel2 hover:border-muted`}
          >
            <Icon name="play" className="w-[18px] h-[18px]" />
            Start the lab
          </button>
        </section>
      )}

      <section
        aria-labelledby="learn-quiz"
        className="mt-8 p-[22px] rounded-2xl border border-line bg-panel flex items-center justify-between gap-4 flex-wrap"
      >
        <div>
          <h2 id="learn-quiz" className="m-0 text-[1.125rem] font-bold">
            Quiz
          </h2>
          <p className="m-0 mt-1 text-muted text-sm">
            4 questions, 4 choices each. Get {DEFAULT_PASS_MARK} of 4 right to complete this lesson.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`quiz/${learnKey}`)}
          className={`${btnBase} border border-cyan bg-cyan text-cyan-ink hover:brightness-110`}
        >
          Take the quiz
        </button>
      </section>

      <section aria-labelledby="learn-references" className="mt-8 pt-5 border-t border-line">
        <h2 id="learn-references" className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
          References
        </h2>
        <ol className="grid gap-1.5 text-[0.9375rem] m-0 pl-6">
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
                <span className="ml-2 text-[0.75rem] text-amber">Needs checking: {ref.note}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
