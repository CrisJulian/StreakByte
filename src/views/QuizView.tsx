import { Icon } from '../components/Icon';
import { LESSON_XP_BY_KEY, lessonLabel, TRACKS } from '../data/curriculum';
import { comboTier, currentCombo, currentQuestion, parseLessonKey } from '../domain/rules/quiz';
import { useStreakByteStore } from '../store/useStreakByteStore';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

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
  const streak = currentCombo(quiz.answers);
  const tier = comboTier(streak);
  const stepXp = Math.round((LESSON_XP_BY_KEY[quiz.lessonKey] ?? 120) / Math.max(1, total));

  return (
    <div className="w-full bg-panel">
      <div className="px-6 py-3.5 max-[760px]:px-4 border-b border-line bg-panel2 flex items-center justify-between gap-3 flex-wrap">
        <a
          href="#curriculum"
          onClick={(e) => {
            e.preventDefault();
            navigate('curriculum');
          }}
          className="inline-flex items-center justify-center gap-2 min-h-9 px-3.5 border border-line bg-panel text-ink font-bold text-[10.5px] uppercase tracking-[0.06em] no-underline hover:border-ink transition-colors"
        >
          <Icon name="back" className="w-4 h-4" />
          Exit
        </a>
        <div className="flex items-center gap-2 flex-wrap">
          {streak >= 2 && (
            <span
              className={`sb-pop inline-flex items-center gap-1.5 min-h-9 px-3 py-1 font-bold text-[10.5px] uppercase tracking-[0.06em] ${tier.overclocked
                  ? 'bg-cyan text-cyan-ink'
                  : 'border border-cyan text-cyan bg-panel'
                }`}
            >
              <Icon name="bolt" className="w-3.5 h-3.5" />
              {streak}x streak · {tier.label}
            </span>
          )}
          <span className="inline-flex items-center min-h-9 px-3.5 py-1 bg-[var(--dark-card)] text-white font-bold text-[10.5px] uppercase tracking-[0.06em]">
            Question <span className="num mx-1">{quiz.index + 1}</span> of{' '}
            <span className="num ml-1">{total}</span>
          </span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-6 py-7 max-[760px]:px-4">
        <div
          className="grid gap-1 mb-5"
          style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
          aria-hidden="true"
        >
          {quiz.questions.map((q, idx) => {
            const answered = quiz.answers[idx];
            return (
              <i
                key={q.id}
                className={`h-2.5 ${answered
                    ? answered.correct
                      ? 'bg-green'
                      : 'bg-red'
                    : idx === quiz.index
                      ? 'bg-cyan'
                      : 'bg-panel3'
                  }`}
              />
            );
          })}
        </div>

        <section
          key={question.id}
          className={`bg-panel border border-line p-6 max-[760px]:p-4 ${quiz.submitted && !wasCorrect ? 'sb-shake' : ''
            }`}
        >
          <p className="m-0 mb-1.5 flex items-center gap-2 text-muted text-[10px] font-bold uppercase tracking-[0.09em]">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            {quizLabel}
          </p>
          <h1 id="quiz-prompt" className="m-0 mb-5 font-head text-[22px] font-bold leading-snug">
            {question.prompt}
          </h1>

          <div role="radiogroup" aria-labelledby="quiz-prompt" className="grid gap-2">
            {question.choices.map((choice, idx) => {
              const isSelected = quiz.selected === idx;
              const isCorrect = idx === question.correctIndex;
              const showCorrect = quiz.submitted && isCorrect;
              const showWrong = quiz.submitted && isSelected && !isCorrect;

              let rowClasses = 'border-line bg-panel';
              if (showCorrect) {
                rowClasses = 'border-green bg-green/10';
              } else if (showWrong) {
                rowClasses = 'border-red bg-red/10';
              } else if (isSelected) {
                rowClasses = 'border-cyan bg-you';
              }

              return (
                <label
                  key={choice}
                  className={`grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-3 border transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cyan ${rowClasses} ${quiz.submitted ? 'cursor-default' : 'cursor-pointer hover:border-ink hover:bg-panel2'
                    }`}
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
                    className={`grid place-items-center w-8 h-8 border font-bold text-xs font-mono ${showCorrect
                        ? 'bg-green text-green-ink border-green'
                        : showWrong
                          ? 'bg-red text-white border-red'
                          : isSelected
                            ? 'bg-cyan text-cyan-ink border-cyan'
                            : 'bg-panel2 text-muted border-line'
                      }`}
                  >
                    {LETTERS[idx]}
                  </span>
                  <span className="text-[13px] font-medium leading-snug">{choice}</span>
                  {showCorrect && (
                    <span className="inline-flex items-center gap-1 text-green font-bold text-[10.5px] uppercase tracking-[0.05em]">
                      <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Correct answer
                    </span>
                  )}
                  {showWrong && (
                    <span className="text-red font-bold text-[10.5px] uppercase tracking-[0.05em]">
                      Your answer
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {quiz.submitted && (
            <div
              role="status"
              className="mt-5 p-4 border border-line bg-panel2 flex items-start justify-between gap-3"
            >
              <div className="text-[12px]">
                <b className={`uppercase tracking-[0.05em] ${wasCorrect ? 'text-green' : 'text-red'}`}>
                  {wasCorrect ? 'Correct!' : 'Not quite.'}
                </b>{' '}
                <span className="text-muted">{question.explanation}</span>
              </div>
              {wasCorrect && (
                <span className="sb-xp-float shrink-0 px-2.5 py-1 bg-green/15 border border-green text-green font-bold text-[10.5px] num">
                  +{stepXp} XP
                </span>
              )}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            {!quiz.submitted ? (
              <button
                type="button"
                disabled={quiz.selected === null}
                onClick={submitQuizAnswer}
                className="sb-cut inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:bg-[#e64b00] disabled:opacity-45 disabled:cursor-not-allowed"
              >
                Check answer
              </button>
            ) : (
              <button
                type="button"
                autoFocus
                onClick={nextQuizQuestion}
                className="sb-cut inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-[var(--dark-card)] bg-[var(--dark-card)] text-white font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:opacity-90"
              >
                {isLast ? 'See results' : 'Next question'}
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
