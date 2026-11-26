import type { QuizQuestion } from '../entities/quiz';

export interface StudyMistake {
  summary: string;
  prompt: string;
  topic?: string;
}

export function buildQuizMistake(question: QuizQuestion, chosenIndex: number): StudyMistake {
  const chosenText = question.choices[chosenIndex] ?? 'that option';
  const summary = `Missed "${question.prompt}" (picked "${chosenText}").`;
  return {
    topic: question.topic,
    summary,
    prompt: `Explain why "${chosenText}" was wrong for: "${question.prompt}"`,
  };
}

export function buildLabMistake(lab: 'pc' | 'net', message: string): StudyMistake {
  const area = lab === 'pc' ? 'PC Build lab' : 'Network lab';
  const clean = message.trim() || `Feedback in ${area}`;
  return {
    topic: area,
    summary: `${area}: ${clean}`,
    prompt: `Explain this ${area} mistake and how to fix it: "${clean}"`,
  };
}

const CHOICE_MARKER_RE = /(?:^|[\s\n])([A-Da-d])[).](?:\s+\S)/gm;

/** Heuristic detector for pasted multiple-choice quiz questions & options. */
export function looksLikeMultipleChoicePaste(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const matchedLetters = new Set<string>();
  for (const match of trimmed.matchAll(CHOICE_MARKER_RE)) {
    matchedLetters.add(match[1].toLowerCase());
  }
  if (matchedLetters.size >= 2) return true;

  const nonEmptyLines = trimmed.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (nonEmptyLines.length >= 3 && trimmed.includes('?')) return true;

  const lower = trimmed.toLowerCase();
  return (
    lower.includes('which of the following') ||
    lower.includes('which option') ||
    lower.includes('which choice') ||
    lower.includes('what is the correct answer')
  );
}

export function formatStudyBuddyPrompt(
  question: string,
  context?: { currentLesson?: string; recentMistake?: string; inActiveQuiz?: boolean },
): string {
  const parts: string[] = [];
  if (context?.currentLesson) {
    parts.push(`Lesson ${context.currentLesson}`);
  }
  if (context?.recentMistake) {
    parts.push(`Recent mistake: ${context.recentMistake}`);
  }
  if (context?.inActiveQuiz || looksLikeMultipleChoicePaste(question)) {
    parts.push(
      'Quiz Coaching Mode: DO NOT reveal the answer, option letter, or exact winning choice. Give a short concept clue, explain how to eliminate distractors, and end with a guiding question.',
    );
  }
  if (parts.length === 0) return question;
  return `[Current student context: ${parts.join(' | ')}]\n${question}`;
}
