import type { QuizAnswer, QuizQuestion, QuizSession } from '../entities/quiz';

export type Rng = () => number;

/** Fisher–Yates over the four choices; correctIndex follows the correct answer. */
export function shuffleChoices(q: QuizQuestion, rng: Rng = Math.random): QuizQuestion {
  const order = [0, 1, 2, 3];
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const choices = order.map((from) => q.choices[from]) as QuizQuestion['choices'];
  const correctIndex = order.indexOf(q.correctIndex) as QuizQuestion['correctIndex'];
  return { ...q, choices, correctIndex };
}

export function startQuiz(lessonKey: string, bank: QuizQuestion[], rng: Rng = Math.random): QuizSession {
  return {
    lessonKey,
    questions: bank.map((q) => shuffleChoices(q, rng)),
    index: 0,
    selected: null,
    submitted: false,
    answers: [],
  };
}

export function currentQuestion(s: QuizSession): QuizQuestion | null {
  return s.questions[s.index] ?? null;
}

export function isFinished(s: QuizSession): boolean {
  return s.index >= s.questions.length;
}

/** Pick a choice. Ignored once the question has been checked. */
export function selectChoice(s: QuizSession, choiceIndex: number): QuizSession {
  if (s.submitted || isFinished(s) || choiceIndex < 0 || choiceIndex > 3) return s;
  return { ...s, selected: choiceIndex };
}

/** Lock in the selected choice and record whether it was right. */
export function submitAnswer(s: QuizSession): QuizSession {
  const q = currentQuestion(s);
  if (!q || s.submitted || s.selected === null) return s;
  const answer: QuizAnswer = {
    questionId: q.id,
    choiceIndex: s.selected,
    correct: s.selected === q.correctIndex,
  };
  return { ...s, submitted: true, answers: [...s.answers, answer] };
}

export function nextQuestion(s: QuizSession): QuizSession {
  if (!s.submitted) return s;
  return { ...s, index: s.index + 1, selected: null, submitted: false };
}

export interface QuizScore {
  correct: number;
  total: number;
  accuracyPct: number;
  missed: QuizQuestion[];
}

export function scoreQuiz(s: QuizSession): QuizScore {
  const total = s.questions.length;
  const correct = s.answers.filter((a) => a.correct).length;
  const missedIds = new Set(s.answers.filter((a) => !a.correct).map((a) => a.questionId));
  return {
    correct,
    total,
    accuracyPct: total === 0 ? 0 : Math.round((correct / total) * 100),
    missed: s.questions.filter((q) => missedIds.has(q.id)),
  };
}

/** XP is the lesson's XP scaled by how many answers were right. */
export function quizXp(lessonXp: number, correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((lessonXp * correct) / total);
}

/** "hw-3" -> { trackId: 'hw', number: 3 }. Returns null for anything else. */
export function parseLessonKey(key: string): { trackId: string; number: number } | null {
  const m = /^([a-z]+)-(\d+)$/.exec(key);
  return m ? { trackId: m[1], number: Number(m[2]) } : null;
}

/** Trailing consecutive correct answers in the current quiz session. */
export function currentCombo(answers: readonly QuizAnswer[]): number {
  let streak = 0;
  for (let i = answers.length - 1; i >= 0; i -= 1) {
    if (!answers[i].correct) break;
    streak += 1;
  }
  return streak;
}

/** Longest consecutive correct streak in the current quiz session. */
export function maxCombo(answers: readonly QuizAnswer[]): number {
  let best = 0;
  let run = 0;
  for (const ans of answers) {
    if (ans.correct) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

export function comboTier(streak: number): {
  label: string;
  multiplier: number;
  overclocked: boolean;
} {
  if (streak >= 4) return { label: 'OVERCLOCKED', multiplier: 2, overclocked: true };
  if (streak === 3) return { label: 'Turbo 1.5x', multiplier: 1.5, overclocked: false };
  if (streak === 2) return { label: 'Combo 1.25x', multiplier: 1.25, overclocked: false };
  return { label: '', multiplier: 1, overclocked: false };
}
