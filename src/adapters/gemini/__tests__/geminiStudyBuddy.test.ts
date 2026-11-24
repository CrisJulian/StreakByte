import { describe, expect, it, vi } from 'vitest';
import { geminiStudyBuddy, STUDY_BUDDY_SYSTEM_INSTRUCTION } from '../geminiStudyBuddy';
import { STUDY_BUDDY_GREETING } from '../../../data/studyBuddy';

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      apiKey: string;
      models = {
        generateContent: vi.fn(async (_params: { contents: unknown[]; config?: { systemInstruction?: string } }) => {
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

  it('contains comprehensive curriculum guidance in system instructions', () => {
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('Hardware Track');
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('Networking Track');
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('slots A2 and B2');
    expect(STUDY_BUDDY_SYSTEM_INSTRUCTION).toContain('255.255.255.0');
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
});
