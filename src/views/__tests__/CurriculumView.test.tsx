import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import type { LessonCompletion } from '../../domain/entities/progress';
import { useStreakByteStore } from '../../store/useStreakByteStore';
import { CurriculumView } from '../CurriculumView';

const done = (key: string): LessonCompletion => ({
  lessonKey: key,
  correct: 4,
  total: 4,
  completedAt: '2026-11-24T00:00:00.000Z',
});

describe('Curriculum: Final Lesson lock', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    useStreakByteStore.getState().resetAll();
  });

  it('shows the Hardware Final Lesson as locked with a message and no way to open it', () => {
    render(<CurriculumView />);
    expect(screen.getByText('Finish lessons 1 to 5 to unlock')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open Final Lesson: Build a PC/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Lesson 3: Memory (RAM)' })).toBeInTheDocument();
    expect(screen.getByText('0 of 6 lessons complete')).toBeInTheDocument();
  });

  it('shows the Networking Final Lesson as locked with its own message', () => {
    useStreakByteStore.getState().setTrack('net');
    render(<CurriculumView />);
    expect(screen.getByText('Finish lessons 1 to 4 to unlock')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open Final Lesson: Build a Network/ })).not.toBeInTheDocument();
  });

  it('opening Lesson 3 goes to its Learn page, not the PC lab', async () => {
    const user = userEvent.setup();
    render(<CurriculumView />);
    await user.click(screen.getByRole('button', { name: 'Open Lesson 3: Memory (RAM)' }));
    expect(useStreakByteStore.getState().view).toBe('learn');
    expect(useStreakByteStore.getState().learnKey).toBe('hw-3');
  });

  it('unlocks the Final Lesson once lessons 1 to 5 are complete', async () => {
    const user = userEvent.setup();
    useStreakByteStore.setState({ completions: [1, 2, 3, 4, 5].map((n) => done(`hw-${n}`)) });
    render(<CurriculumView />);

    expect(screen.queryByText('Finish lessons 1 to 5 to unlock')).not.toBeInTheDocument();
    expect(screen.getByText('5 of 6 lessons complete')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open Final Lesson: Build a PC' }));
    expect(useStreakByteStore.getState().view).toBe('learn');
    expect(useStreakByteStore.getState().learnKey).toBe('hw-6');
  });

  it('stays locked when only some earlier lessons are done', () => {
    useStreakByteStore.setState({ completions: ['hw-1', 'hw-2', 'hw-4', 'hw-5'].map(done) });
    const { container } = render(<CurriculumView />);
    expect(screen.getByText('Finish lessons 1 to 5 to unlock')).toBeInTheDocument();
    expect(container.querySelector('li[data-status="lock"]')).not.toBeNull();
  });

  it('marks completed lessons with text, not just color', () => {
    useStreakByteStore.setState({ completions: [done('hw-1')] });
    const { container } = render(<CurriculumView />);
    const first = container.querySelector('li') as HTMLElement;
    expect(within(first).getByText('Completed')).toBeInTheDocument();
    expect(within(first).getByRole('button', { name: 'Quiz for Lesson 1: Inside the PC' })).toBeInTheDocument();
  });

  it('disables the sidebar Boss Lab button while the Final Lesson is locked', async () => {
    const user = userEvent.setup();
    render(<CurriculumView />);
    const lockedLabBtn = screen.getByRole('button', { name: /Locked · PC Lab/i });
    expect(lockedLabBtn).toBeDisabled();
    await user.click(lockedLabBtn);
    expect(useStreakByteStore.getState().setupModal.open).toBe(false);
  });

  it('enables the sidebar Boss Lab button once earlier lessons are completed', async () => {
    const user = userEvent.setup();
    useStreakByteStore.setState({ completions: [1, 2, 3, 4, 5].map((n) => done(`hw-${n}`)) });
    render(<CurriculumView />);
    const openLabBtn = screen.getByRole('button', { name: /Open PC Lab/i });
    expect(openLabBtn).toBeEnabled();
    await user.click(openLabBtn);
    expect(useStreakByteStore.getState().setupModal.open).toBe(true);
    expect(useStreakByteStore.getState().setupModal.target).toBe('pc');
  });

  it('requires opening the lesson from Track Telemetry before taking the quiz', async () => {
    const user = userEvent.setup();
    render(<CurriculumView />);
    expect(screen.queryByRole('button', { name: /Take the quiz/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start lesson' }));
    expect(useStreakByteStore.getState().view).toBe('learn');
    expect(useStreakByteStore.getState().learnKey).toBe('hw-1');
  });
});
