/** A multiple-choice question. Always exactly four choices, one correct. */
export interface QuizQuestion {
  id: string;
  /** Short topic name, shown in "Review these" when the learner misses it. */
  topic: string;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  /** Shown after answering, right or wrong. */
  explanation: string;
}

export interface QuizAnswer {
  questionId: string;
  choiceIndex: number;
  correct: boolean;
}

export interface QuizSession {
  /** e.g. "hw-3" = Hardware track, lesson 3. */
  lessonKey: string;
  questions: QuizQuestion[];
  index: number;
  selected: number | null;
  submitted: boolean;
  answers: QuizAnswer[];
}
