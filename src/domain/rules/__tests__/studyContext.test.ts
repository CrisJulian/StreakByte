import { describe, expect, it } from 'vitest';
import {
  buildLabMistake,
  buildQuizMistake,
  formatStudyBuddyPrompt,
  looksLikeMultipleChoicePaste,
} from '../studyContext';

describe('studyContext domain helpers', () => {
  it('builds a concise quiz mistake summary and prompt', () => {
    const mistake = buildQuizMistake(
      {
        id: 'q1',
        topic: 'Dual-Channel RAM',
        prompt: 'Which RAM slots activate dual-channel first?',
        choices: ['A1 and A2', 'A2 and B2', 'B1 and B2', 'Only A1'],
        correctIndex: 1,
        explanation: 'A2 and B2 are first.',
      },
      0,
    );

    expect(mistake.topic).toBe('Dual-Channel RAM');
    expect(mistake.summary).toContain('A1 and A2');
    expect(mistake.prompt).toContain('Explain why "A1 and A2" was wrong');
  });

  it('builds lab mistake context and formats prompt headers', () => {
    const labMistake = buildLabMistake('net', 'Default gateway must match the router IP.');
    expect(labMistake.summary).toContain('Network lab:');
    expect(labMistake.prompt).toContain('Default gateway must match the router IP.');

    const formatted = formatStudyBuddyPrompt('Why did that fail?', {
      currentLesson: 'net-2',
      recentMistake: labMistake.summary,
    });
    expect(formatted).toContain('[Current student context: Lesson net-2 | Recent mistake: Network lab:');
    expect(formatted).toContain('Why did that fail?');
  });

  it('detects pasted multiple-choice questions and injects Quiz Coaching Mode', () => {
    expect(looksLikeMultipleChoicePaste('What does RAM stand for?')).toBe(false);
    expect(
      looksLikeMultipleChoicePaste(
        'Which RAM slots enable dual-channel first?\nA) A1 and A2\nB) A2 and B2\nC) B1 and B2\nD) Only A1',
      ),
    ).toBe(true);
    expect(looksLikeMultipleChoicePaste('Which of the following is the subnet mask?')).toBe(true);

    const pastedPrompt = formatStudyBuddyPrompt(
      'Which RAM slots?\nA) A1 and A2\nB) A2 and B2',
    );
    expect(pastedPrompt).toContain('Quiz Coaching Mode: DO NOT reveal the answer');

    const activeQuizPrompt = formatStudyBuddyPrompt('Explain dual-channel', {
      currentLesson: 'hw-3',
      inActiveQuiz: true,
    });
    expect(activeQuizPrompt).toContain('Quiz Coaching Mode: DO NOT reveal the answer');
  });
});
