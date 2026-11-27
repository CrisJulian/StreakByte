import { describe, expect, it, vi } from 'vitest';
import { geminiStudyBuddy, STUDY_BUDDY_SYSTEM_INSTRUCTION } from '../geminiStudyBuddy';
import { STUDY_BUDDY_GREETING } from '../../../data/studyBuddy';

const { capturedPrompts } = vi.hoisted(() => ({
  capturedPrompts: [] as Array<{ contents: unknown[]; config?: { systemInstruction?: string } }>,
}));

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      apiKey: string;
      models = {
        generateContent: vi.fn(async (params: { contents: unknown[]; config?: { systemInstruction?: string } }) => {
          capturedPrompts.push(params);
          if (this.apiKey === 'invalid-key') {
            throw new Error('API key invalid');
          }
          return {
            text: 'BYTE AI: Dual-channel memory doubles bandwidth between CPU and RAM modules.',
          };
        }),
      };
      constructor(options: { apiKey: string }) {
        this.apiKey = options.apiKey;
      }
    },
  };
});

describe('geminiStudyBuddy adapter', () => {
  it('exposes the standard Study Buddy greeting', () => {
    expect(geminiStudyBuddy.greeting).toBe(STUDY_BUDDY_GREETING);
  });

  it('contains comprehensive curriculum guidance and Socratic quiz coaching rules in system instructions', () => {
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('Hardware Track');
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('Networking Track');
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('slots A2 and B2');
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('255.255.255.0');
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('Quiz Integrity & Socratic Coaching');
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('NEVER reveal the final answer');
  });

  it('synchronously falls back to local study buddy when no API key is provided', () => {
    const result = geminiStudyBuddy.reply('Explain the RAM key notch');
    expect(typeof result).toBe('string');
    expect((result as string).toLowerCase()).toContain('notch');
  });

  it('calls Gemini and returns AI response when an API key is provided', async () => {
    const result = await geminiStudyBuddy.reply('What is dual-channel?', {
      apiKey: 'valid-test-key',
      history: [
        { role: 'user', text: 'Hi' },
        { role: 'model', text: 'Hello!' },
      ],
      currentLesson: 'hw-3',
    });

    expect(typeof result).toBe('string');
    expect(result).toContain('BYTE AI: Dual-channel memory');
  });

  it('gracefully falls back to local responder when Gemini API throws an error', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await geminiStudyBuddy.reply('Explain the RAM key notch', {
      apiKey: 'invalid-key',
    });

    expect(typeof result).toBe('string');
    expect((result as string).toLowerCase()).toContain('notch');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('guides learners without revealing the direct answer during an active quiz or pasted choices', async () => {
    // Offline/pasted MCQ coaching
    const offlineCoaching = geminiStudyBuddy.reply(
      'Which slots activate dual-channel first?\nA) A1 and A2\nB) A2 and B2\nC) B1 and B2\nD) Only A1',
    );
    expect(typeof offlineCoaching).toBe('string');
    expect(offlineCoaching as string).toContain('Quiz Coaching (No Spoilers)');
    expect(offlineCoaching as string).not.toContain('A2 and B2');

    // Online Gemini request receives Quiz Coaching Mode directive
    await geminiStudyBuddy.reply('Which slot goes first?', {
      apiKey: 'valid-test-key',
      currentLesson: 'hw-3',
      inActiveQuiz: true,
    });
    const lastCall = capturedPrompts[capturedPrompts.length - 1];
    const lastContent = JSON.stringify(lastCall?.contents ?? []);
    expect(lastContent).toContain('Quiz Coaching Mode');
  });
});
