import { Icon } from '../components/Icon';
import { lessonLabel, TRACKS } from '../data/curriculum';
import { currentQuestion, parseLessonKey } from '../domain/rules/quiz';
import { useStreakByteStore } from '../store/useStreakByteStore';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

const btnBase =
  'inline-flex items-center justify-center gap-2 min-h-11 px-[18px] rounded-[10px] font-semibold text-[0.9375rem] cursor-pointer transition-all';

export function QuizView() {
  const quiz = useStreakByteStore((s) => s.quiz);
  const selectQuizChoice = useStreakByteStore((s) => s.selectQuizChoice);
  const submitQuizAnswer = useStreakByteStore((s) => s.submitQuizAnswer);
  const nextQuizQuestion = useStreakByteStore((s) => s.nextQuizQuestion);
  const navigate = useStreakByteStore((s) => s.navigate);

  const question = quiz ? currentQuestion(quiz) : null;
  if (!quiz || !question) return null;

  const parsed = parseLessonKey(quiz.lessonKey);
  const track = parsed ? TRACKS[parsed.trackId as keyof typeof TRACKS] : undefined;
  const lesson = track && parsed ? track.lessons[parsed.number - 1] : undefined;
  const quizLabel = lesson && parsed ? lessonLabel(lesson, parsed.number - 1) : 'Knowledge check';

  const total = quiz.questions.length;
  const isLast = quiz.index === total - 1;
  const wasCorrect = quiz.submitted && quiz.selected === question.correctIndex;

  return (
    <div className="max-w-[760px] mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <a
          href="#curriculum"
          onClick={(e) => {
            e.preventDefault();
            navigate('curriculum');
          }}
          className={`${btnBase} border border-line bg-transparent text-ink no-underline hover:bg-panel2 hover:border-muted`}
        >
          <Icon name="back" className="w-[18px] h-[18px]" />
          Exit
        </a>
        <span className="inline-flex items-center min-h-10 px-3.5 py-2 border border-line rounded-full bg-panel font-semibold text-sm">
          Question <span className="num mx-1">{quiz.index + 1}</span> of <span className="num ml-1">{total}</span>
        </span>
      </div>

      <div className="grid gap-1 mb-5" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-hidden="true">
        {quiz.questions.map((q, idx) => {
          const answered = quiz.answers[idx];
          return (
            <i
              key={q.id}
              className={`h-2 rounded-[3px] ${
                answered ? (answered.correct ? 'bg-green' : 'bg-amber') : idx === quiz.index ? 'bg-cyan' : 'bg-panel2'
              }`}
            />
          );
        })}
      </div>

      <section key={question.id} className="bg-panel border border-line rounded-2xl p-[22px]">
        <p className="m-0 mb-1 text-muted text-sm font-semibold">{quizLabel}</p>
        <h1 id="quiz-prompt" className="m-0 mb-5 text-[1.375rem] font-bold leading-snug">
          {question.prompt}
        </h1>

        <div role="radiogroup" aria-labelledby="quiz-prompt" className="grid gap-2.5">
          {question.choices.map((choice, idx) => {
            const isSelected = quiz.selected === idx;
            const isCorrect = idx === question.correctIndex;
            const showCorrect = quiz.submitted && isCorrect;
            const showWrong = quiz.submitted && isSelected && !isCorrect;

            let borderColor = 'var(--line)';
            let background = 'transparent';
            if (showCorrect) {
              borderColor = 'var(--green)';
              background = 'color-mix(in srgb, var(--green) 14%, var(--panel))';
            } else if (showWrong) {
              borderColor = 'var(--amber)';
              background = 'color-mix(in srgb, var(--amber) 14%, var(--panel))';
            } else if (isSelected) {
              borderColor = 'var(--cyan)';
              background = 'color-mix(in srgb, var(--cyan) 10%, var(--panel))';
            }

            return (
              <label
                key={choice}
                className={`grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 border rounded-[12px] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan ${
                  quiz.submitted ? 'cursor-default' : 'cursor-pointer hover:border-muted'
                }`}
                style={{ borderColor, background }}
              >
                <input
                  type="radio"
                  name="quiz-choice"
                  className="sr-only"
                  checked={isSelected}
                  disabled={quiz.submitted}
                  onChange={() => selectQuizChoice(idx)}
                />
                <span
                  aria-hidden="true"
                  className={`grid place-items-center w-9 h-9 rounded-full font-bold text-sm font-mono ${
                    showCorrect
                      ? 'bg-green text-green-ink'
                      : showWrong
                        ? 'bg-amber text-amber-ink'
                        : isSelected
                          ? 'bg-cyan text-cyan-ink'
                          : 'bg-panel2 text-muted'
                  }`}
                >
                  {LETTERS[idx]}
                </span>
                <span className="text-[1rem] leading-snug">{choice}</span>
                {showCorrect && (
                  <span className="inline-flex items-center gap-1 text-green font-bold text-sm">
                    <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                    Correct answer
                  </span>
                )}
                {showWrong && <span className="text-amber font-bold text-sm">Your answer</span>}
              </label>
            );
          })}
        </div>

        {quiz.submitted && (
          <div
            role="status"
            className="mt-5 p-4 rounded-[12px] border border-line bg-bg"
          >
            <b className={wasCorrect ? 'text-green' : 'text-amber'}>
              {wasCorrect ? 'Correct!' : 'Not quite.'}
            </b>{' '}
            <span className="text-muted">{question.explanation}</span>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          {!quiz.submitted ? (
            <button
              type="button"
              disabled={quiz.selected === null}
              onClick={submitQuizAnswer}
              className={`${btnBase} border border-cyan bg-cyan text-cyan-ink hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Check answer
            </button>
          ) : (
            <button
              type="button"
              autoFocus
              onClick={nextQuizQuestion}
              className={`${btnBase} border border-cyan bg-cyan text-cyan-ink hover:brightness-110`}
            >
              {isLast ? 'See results' : 'Next question'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
