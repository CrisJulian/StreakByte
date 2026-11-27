import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LESSON_CONTENT } from '../../data/lessons';
import { useStreakByteStore } from '../../store/useStreakByteStore';
import { LearnView } from '../LearnView';

function open(key: string) {
  act(() => {
    useStreakByteStore.getState().syncFromHash(`#learn/${key}`);
  });
  return render(<LearnView />);
}

function mockScrolledToBottom(container: HTMLElement) {
  const sentinel = container.querySelector('[data-testid="section-end"]') as HTMLElement;
  vi.spyOn(sentinel, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 400,
    top: 400,
    bottom: 401,
    left: 0,
    right: 800,
    width: 800,
    height: 1,
    toJSON: () => ({}),
  });
  act(() => {
    fireEvent.scroll(window);
  });
}

describe('Learn page', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    useStreakByteStore.getState().resetAll();
  });

  it('removes floating side edge arrows and leaves bottom navigation', () => {
    open('hw-3');
    expect(screen.queryByRole('button', { name: /Previous section:/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next section:/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next: 3\.2 DDR4 and DDR5/i })).toBeInTheDocument();
  });

  it('requires scrolling to the bottom of a section before checking it and unlocking the next section', async () => {
    const user = userEvent.setup();
    const { container } = open('hw-3');

    const outline = screen.getByRole('complementary', { name: 'Course outline' });
    expect(within(outline).getByText('0/8 · 0%')).toBeInTheDocument();

    const btn31 = within(outline).getByRole('button', { name: /3\.1\s*What RAM is/i });
    const btn32 = within(outline).getByRole('button', { name: /3\.2\s*DDR4 and DDR5/i });
    const btn33 = within(outline).getByRole('button', { name: /3\.3\s*How much RAM is needed/i });
    const btnSummary = within(outline).getByRole('button', { name: /Summary & review/i });
    const nextBtn = screen.getByRole('button', { name: /Next: 3\.2 DDR4 and DDR5/i });

    expect(btn31).toHaveAttribute('aria-current', 'step');
    expect(btn32).toBeDisabled();
    expect(btn33).toBeDisabled();
    expect(btnSummary).toBeDisabled();
    expect(nextBtn).toBeDisabled();
    expect(screen.getByText('Scroll to the bottom to unlock next')).toBeInTheDocument();

    // Scroll to the bottom of 3.1 -> marks 3.1 checked and unlocks 3.2 (3.3 stays locked)
    mockScrolledToBottom(container);
    expect(within(outline).getByText('1/8 · 13%')).toBeInTheDocument();
    expect(nextBtn).toBeEnabled();
    expect(btn32).toBeEnabled();
    expect(btn33).toBeDisabled();

    await user.click(nextBtn);
    expect(screen.getByRole('heading', { level: 2, name: /3\.2\s*DDR4 and DDR5/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next: 3\.3 How much RAM is needed/i })).toBeDisabled();
    expect(btn33).toBeDisabled();

    // Scroll to the bottom of 3.2 -> unlocks 3.3
    mockScrolledToBottom(container);
    expect(within(outline).getByText('2/8 · 25%')).toBeInTheDocument();
    expect(btn33).toBeEnabled();
  });

  it('keeps checked sections saved when going back and returning to the lesson', () => {
    const firstRender = open('hw-3');
    mockScrolledToBottom(firstRender.container);
    firstRender.unmount();

    act(() => {
      useStreakByteStore.getState().navigate('curriculum');
    });

    open('hw-3');
    const outline = screen.getByRole('complementary', { name: 'Course outline' });
    expect(within(outline).getByText('1/8 · 13%')).toBeInTheDocument();
    expect(within(outline).getByRole('button', { name: /3\.2\s*DDR4 and DDR5/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Next: 3\.2 DDR4 and DDR5/i })).toBeEnabled();
  });

  it('unlocks all sections and summary on a completed lesson for free review', async () => {
    const user = userEvent.setup();
    act(() => {
      useStreakByteStore.setState({
        completions: [
          { lessonKey: 'hw-1', correct: 15, total: 15, completedAt: 'x' },
          { lessonKey: 'hw-2', correct: 15, total: 15, completedAt: 'x' },
          { lessonKey: 'hw-3', correct: 15, total: 15, completedAt: 'x' },
        ],
      });
    });
    open('hw-3');

    const outline = screen.getByRole('complementary', { name: 'Course outline' });
    expect(within(outline).getByText('8/8 · 100%')).toBeInTheDocument();

    await user.click(within(outline).getByRole('button', { name: /3\.7\s*If the PC does not start/i }));
    expect(
      screen.getByRole('heading', { level: 2, name: /3\.7\s*If the PC does not start/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Next: Summary & review/i }));
    expect(screen.getByRole('heading', { level: 2, name: /Summary & review/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Key points' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Common mistakes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'References' })).toBeInTheDocument();
  });

  it('places pictures side-by-side in front (left) or behind (right) the text with credits', () => {
    const { container } = open('hw-1');
    const blocksWithImages = Array.from(container.querySelectorAll('[data-image-side]'));
    expect(blocksWithImages.length).toBe(2);
    expect(blocksWithImages[0]).toHaveAttribute('data-image-side', 'right');
    expect(blocksWithImages[1]).toHaveAttribute('data-image-side', 'left');

    const img = LESSON_CONTENT['hw-1'].sections[0].blocks[0].images![0];
    const picture = screen.getByAltText(img.alt);
    expect(picture).toHaveAttribute('src', expect.stringContaining(`lessons/hw/${img.file}`));
    const figure = picture.closest('figure') as HTMLElement;
    expect(within(figure).getByText(img.credit!)).toBeInTheDocument();
  });

  it('filters the Course Outline with search and displays references in the Resources tab', async () => {
    const user = userEvent.setup();
    open('net-1');

    const outline = screen.getByRole('complementary', { name: 'Course outline' });
    const search = within(outline).getByRole('searchbox', { name: 'Search course outline' });
    await user.type(search, 'bandwidth');
    expect(
      within(outline).getByRole('button', {
        name: /1\.7\s*Measuring a network: bandwidth and latency/i,
      }),
    ).toBeInTheDocument();
    expect(within(outline).queryByRole('button', { name: /1\.1\s*What is a network\?/i })).not.toBeInTheDocument();

    await user.click(within(outline).getByRole('tab', { name: 'Resources' }));
    expect(within(outline).getByRole('link', { name: /What is a LAN/i })).toBeInTheDocument();
  });

  it('has a single Take the quiz button without a Take quiz shortcut', async () => {
    const user = userEvent.setup();
    open('hw-2');
    expect(screen.queryByRole('button', { name: /Take quiz/i })).not.toBeInTheDocument();
    const quizButtons = screen.getAllByRole('button', { name: 'Take the quiz' });
    expect(quizButtons).toHaveLength(1);
    await user.click(quizButtons[0]);
    expect(useStreakByteStore.getState().view).toBe('quiz');
    expect(useStreakByteStore.getState().quiz?.lessonKey).toBe('hw-2');
  });

  it('a Final Lesson (once unlocked) shows Build steps after completing 5.1 and Go to Boss Lab Sandbox without a quiz', async () => {
    const user = userEvent.setup();
    act(() => {
      useStreakByteStore.setState({
        completions: [1, 2, 3, 4].map((n) => ({
          lessonKey: `net-${n}`,
          correct: 4,
          total: 4,
          completedAt: 'x',
        })),
      });
    });
    const { container } = open('net-5');
    expect(screen.getByRole('heading', { level: 1, name: 'Final Lesson: Build a Network' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Take the quiz/i })).not.toBeInTheDocument();

    mockScrolledToBottom(container);
    const outline = screen.getByRole('complementary', { name: 'Course outline' });
    await user.click(within(outline).getByRole('button', { name: /5\.2\s*Build steps/i }));
    expect(screen.getByRole('heading', { level: 2, name: /5\.2\s*Build steps/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Go to Boss Lab Sandbox/i }));
    expect(useStreakByteStore.getState().view).toBe('curriculum');
  });

  it('keeps locked lessons disabled in the Course Outline', () => {
    open('hw-1');
    const outline = screen.getByRole('complementary', { name: 'Course outline' });
    const finalLessonBtn = within(outline).getByRole('button', { name: /Final Lesson: Build a PC/i });
    expect(finalLessonBtn).toBeDisabled();
  });

  it('never renders Needs checking tags', () => {
    act(() => {
      useStreakByteStore.setState({
        completions: [1, 2, 3, 4].map((n) => ({
          lessonKey: `net-${n}`,
          correct: 4,
          total: 4,
          completedAt: 'x',
        })),
      });
    });
    open('net-5');
    expect(screen.queryByText(/Needs checking:/i)).not.toBeInTheDocument();
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  cleanup();
  act(() => {
    useStreakByteStore.getState().resetAll();
  });
});
