import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LESSON_CONTENT } from '../../data/lessons';
import { useStreakByteStore } from '../../store/useStreakByteStore';
import { LearnView } from '../LearnView';

function open(key: string) {
  useStreakByteStore.getState().syncFromHash(`#learn/${key}`);
  return render(<LearnView />);
}

describe('Learn page', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    useStreakByteStore.getState().resetAll();
  });

  it('shows definitions, parts, key points and common mistakes, then the quiz, then references last', () => {
    const { container } = open('hw-3');
    expect(screen.getByRole('heading', { level: 1, name: 'Lesson 3: Memory (RAM)' })).toBeInTheDocument();

    const headings = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent);
    expect(headings).toEqual([
      'Definitions',
      'Necessary parts',
      'How to install',
      'Good to know',
      'Key points',
      'Common mistakes',
      'Quiz',
      'References',
    ]);
  });

  it('puts the quiz after the learning content and the references at the very bottom', () => {
    const { container } = open('net-2');
    const headings = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent);
    expect(headings.slice(-2)).toEqual(['Quiz', 'References']);
    expect(headings.indexOf('Common mistakes')).toBeLessThan(headings.indexOf('Quiz'));
    const lastSection = container.querySelector('article > section:last-of-type');
    expect(lastSection?.querySelector('h2')?.textContent).toBe('References');
  });

  it('every part has a picture slot with alt text or a labelled placeholder', () => {
    open('hw-1');
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0);
    for (const el of screen.getAllByRole('img')) {
      expect(el.getAttribute('aria-label') ?? el.getAttribute('alt')).toBeTruthy();
    }
  });

  it('shows the credit line under a real picture', () => {
    const image = LESSON_CONTENT['net-1'].parts[2].images[0];
    const before = { available: image.available, credit: image.credit };
    image.available = true;
    image.credit = 'Test credit by Someone, public domain, via Wikimedia Commons';
    try {
      open('net-1');
      const picture = screen.getByAltText(image.alt);
      expect(picture).toHaveAttribute('src', expect.stringContaining('lessons/net/net1-hub.jpg'));
      const figure = picture.closest('figure') as HTMLElement;
      expect(within(figure).getByText(image.credit)).toBeInTheDocument();
    } finally {
      image.available = before.available;
      image.credit = before.credit;
    }
  });

  it('the Quiz button opens that lesson’s quiz', async () => {
    const user = userEvent.setup();
    open('hw-2');
    await user.click(screen.getByRole('button', { name: 'Take the quiz' }));
    expect(useStreakByteStore.getState().view).toBe('quiz');
    expect(useStreakByteStore.getState().quiz?.lessonKey).toBe('hw-2');
  });

  it('a Final Lesson (once unlocked) offers the lab and shows its build steps', () => {
    useStreakByteStore.setState({
      completions: [1, 2, 3, 4].map((n) => ({
        lessonKey: `net-${n}`,
        correct: 4,
        total: 4,
        completedAt: 'x',
      })),
    });
    open('net-5');
    expect(screen.getByRole('heading', { level: 1, name: 'Final Lesson: Build a Network' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Build steps' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start the lab' })).toBeInTheDocument();
  });

  it('a lesson that adds no new terms says so instead of an empty list', () => {
    useStreakByteStore.setState({
      completions: [1, 2, 3, 4, 5].map((n) => ({
        lessonKey: `hw-${n}`,
        correct: 4,
        total: 4,
        completedAt: 'x',
      })),
    });
    open('hw-6');
    expect(screen.getByText('No new terms. Use the definitions from Lessons 1 to 5.')).toBeInTheDocument();
  });
});

afterEach(() => {
  useStreakByteStore.getState().resetAll();
});
