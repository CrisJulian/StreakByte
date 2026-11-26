import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useStreakByteStore } from '../../store/useStreakByteStore';
import { CompleteView } from '../CompleteView';

describe('CompleteView Next mission navigation', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    useStreakByteStore.getState().resetAll();
  });

  it('navigates directly to the next lesson from Next lesson while Back to Learn goes to curriculum', async () => {
    const user = userEvent.setup();
    useStreakByteStore.setState({
      completion: {
        title: 'Nice work, Learner!',
        subtitle: 'You answered 4 of 4 correctly in Lesson 1: Inside the PC. Lesson complete!',
        xp: '+100',
        accuracy: '100%',
        partsLabel: 'Questions',
        partsValue: '4 / 4',
        review: [['All answers correct', 'Nothing to review']],
        next: ['Lesson 2: Processor (CPU)', 'How the processor works', '5 min · +100 XP'],
        nextRoute: 'learn/hw-2',
      },
    });

    render(<CompleteView />);

    await user.click(screen.getByRole('link', { name: /Next lesson/i }));
    expect(useStreakByteStore.getState().view).toBe('learn');
    expect(useStreakByteStore.getState().learnKey).toBe('hw-2');

    await user.click(screen.getByRole('link', { name: 'Back to Learn' }));
    expect(useStreakByteStore.getState().view).toBe('curriculum');
  });
});
