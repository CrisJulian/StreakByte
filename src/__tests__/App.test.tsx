import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { useStreakByteStore } from '../store/useStreakByteStore';

describe('App integration', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
    document.documentElement.setAttribute('data-theme', 'dark');
    useStreakByteStore.getState().resetAll();
  });

  it('renders Dashboard, navigates tabs, toggles dark/light theme, opens Session Setup into PC lab, and chats offline', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Initial Dashboard (streak card hidden until top-bar pill is clicked)
    expect(screen.getByRole('heading', { name: 'Welcome back, Mika' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Daily streak' })).not.toBeInTheDocument();

    const streakBtn = screen.getByRole('button', { name: '5 day streak' });
    await user.click(streakBtn);
    const streakDialog = screen.getByRole('dialog', { name: 'Daily streak' });
    expect(within(streakDialog).getByText('Finish one lesson today to keep it going.')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Daily streak' })).not.toBeInTheDocument();
    expect(streakBtn).toHaveFocus();

    // Theme toggle updates <html data-theme>
    const themeBtn = screen.getByRole('button', { name: 'Switch to light theme' });
    await user.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();

    // Navigate to Curriculum and search
    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('link', { name: 'Curriculum' }));
    expect(screen.getByRole('heading', { name: 'Hardware Basics', level: 1 })).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox', { name: 'Search lessons, parts, topics' });
    await user.type(searchInput, 'Storage');
    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.queryByText('Inside the PC')).not.toBeInTheDocument();

    // Navigate back to Dashboard and open Session Setup modal -> Escape restores focus to opener
    await user.click(within(nav).getByRole('link', { name: 'Dashboard' }));
    const openSetupBtn = screen.getByRole('button', { name: /Start lesson/i });
    await user.click(openSetupBtn);
    expect(screen.getByRole('dialog', { name: 'Session setup' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Session setup' })).not.toBeInTheDocument();
    expect(openSetupBtn).toHaveFocus();

    // Re-open Session Setup modal -> Start lesson
    await user.click(openSetupBtn);

    const dialog = screen.getByRole('dialog', { name: 'Session setup' });
    await user.click(within(dialog).getByRole('button', { name: '10 min' }));
    expect(within(dialog).getByText('+ 160 XP')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Start lesson' }));
    expect(screen.getByText('Partly built PC')).toBeInTheDocument();

    // Open Study Buddy chat and tap a starter prompt
    await user.click(screen.getByRole('button', { name: 'Open study buddy chat' }));
    const chatDialog = screen.getByRole('dialog', { name: 'Study buddy chat' });
    await user.click(within(chatDialog).getByRole('button', { name: 'Explain the RAM key notch' }));
    expect(within(chatDialog).getByText(/off-centre on the gold pins/i)).toBeInTheDocument();
  });
});
