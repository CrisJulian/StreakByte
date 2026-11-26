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

export function formatStudyBuddyPrompt(
  question: string,
  context?: { currentLesson?: string; recentMistake?: string },
): string {
  const parts: string[] = [];
  if (context?.currentLesson) {
    parts.push(`Lesson ${context.currentLesson}`);
  }
  if (context?.recentMistake) {
    parts.push(`Recent mistake: ${context.recentMistake}`);
  }
  if (parts.length === 0) return question;
  return `[Current student context: ${parts.join(' | ')}]\n${question}`;
}
