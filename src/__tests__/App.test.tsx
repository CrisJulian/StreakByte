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

    // Login screen appears first when not logged in
    expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
    const guestBtn = screen.getByRole('button', { name: /Continue as Guest/i });
    expect(guestBtn).toBeInTheDocument();

    // Enter app via guest mode
    await user.click(guestBtn);

    // Initial Dashboard (streak card hidden until top-bar pill is clicked)
    expect(screen.getByRole('heading', { name: 'Welcome back, Guest' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Daily streak' })).not.toBeInTheDocument();

    const streakBtn = screen.getByRole('button', { name: '0 day streak' });
    await user.click(streakBtn);
    const streakDialog = screen.getByRole('dialog', { name: 'Daily streak' });
    expect(within(streakDialog).getByText('Finish one lesson today to start your streak.')).toBeInTheDocument();
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

    // Navigate back to Dashboard: Read lesson is removed and Start lesson opens the Learn page
    await user.click(within(nav).getByRole('link', { name: 'Dashboard' }));
    expect(screen.queryByRole('button', { name: 'Read lesson' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Start lesson/i }));
    expect(screen.getByRole('heading', { name: /Inside the PC/i, level: 1 })).toBeInTheDocument();

    // Open Session Setup modal from Leaderboard -> Escape restores focus to opener
    await user.click(within(nav).getByRole('link', { name: 'Leaderboard' }));
    const openSetupBtn = screen.getByRole('button', { name: 'Earn XP: resume lesson' });
    await user.click(openSetupBtn);
    expect(screen.getByRole('dialog', { name: 'Session setup' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Session setup' })).not.toBeInTheDocument();
    expect(openSetupBtn).toHaveFocus();

    // Re-open Session Setup modal -> Start lesson into PC lab
    await user.click(openSetupBtn);

    const dialog = screen.getByRole('dialog', { name: 'Session setup' });
    await user.click(within(dialog).getByRole('button', { name: '10 min' }));
    expect(within(dialog).getByText('+ 160 XP')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Start lesson' }));
    expect(screen.getByRole('heading', { name: 'Build a PC' })).toBeInTheDocument();

    // Open Study Buddy chat and tap a starter prompt
    await user.click(screen.getByRole('button', { name: 'Open study buddy chat' }));
    const chatDialog = screen.getByRole('dialog', { name: 'Study buddy chat' });
    await user.click(within(chatDialog).getByRole('button', { name: 'Explain the RAM key notch' }));
    expect(within(chatDialog).getByText(/off-centre on the gold pins/i)).toBeInTheDocument();

    // Navigate back to Dashboard and claim the Daily Quest reward earned from chatting with BYTE
    await user.click(within(nav).getByRole('link', { name: 'Dashboard' }));
    const quests = screen.getByRole('region', { name: 'Daily quests' });
    await user.click(within(quests).getByRole('button', { name: 'Claim +25 XP' }));
    expect(within(quests).getByText('Claimed')).toBeInTheDocument();
    expect(screen.getByTitle('Total XP')).toHaveTextContent('25');
  });

  it('displays signed-in Google user name, real XP/level, and avatar across Dashboard, TopBar, and Profile', async () => {
    const user = userEvent.setup();
    useStreakByteStore.getState().setAuthUser({
      id: 'g-1',
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
      avatarUrl: 'https://lh3.googleusercontent.com/ada',
    });
    useStreakByteStore.setState((s) => ({
      profileLoaded: true,
      profileSettings: { ...s.profileSettings, onboardingCompleted: true },
    }));
    useStreakByteStore.getState().navigate('dashboard');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Welcome back, Ada' })).toBeInTheDocument();
    const profileLink = screen.getByRole('link', { name: 'Profile, Ada Lovelace' });
    expect(profileLink).toHaveTextContent('Ada L.');

    await user.click(profileLink);
    expect(screen.getByRole('heading', { name: 'Ada Lovelace', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Level 1, Beginner · 0 total XP/i)).toBeInTheDocument();
    const avatarImg = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(avatarImg).toHaveAttribute('src', 'https://lh3.googleusercontent.com/ada');
    expect(avatarImg).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('shows first-time curriculum onboarding for new signed-in users and filters Dashboard tracks', async () => {
    const user = userEvent.setup();
    useStreakByteStore.getState().setAuthUser({
      id: 'g-new',
      email: 'new@example.com',
      displayName: 'Grace Hopper',
    });
    useStreakByteStore.setState((s) => ({
      profileLoaded: true,
      profileSettings: { ...s.profileSettings, onboardingCompleted: false },
    }));
    useStreakByteStore.getState().navigate('dashboard');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Choose what you want to study' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Networking Basics/i }));
    await user.click(screen.getByRole('button', { name: 'Start learning' }));

    expect(screen.getByRole('heading', { name: 'Welcome back, Grace' })).toBeInTheDocument();
    const tracksSection = screen.getByRole('region', { name: 'Tracks' });
    expect(within(tracksSection).getByRole('heading', { name: /Networking Basics/i })).toBeInTheDocument();
    expect(within(tracksSection).queryByRole('heading', { name: /Hardware Basics/i })).not.toBeInTheDocument();
  });

  it('shows 0 unlocked achievements and empty practice state for a brand-new user', async () => {
    const user = userEvent.setup();
    useStreakByteStore.getState().setAuthUser({
      id: 'g-empty',
      email: 'fresh@example.com',
      displayName: 'Fresh Learner',
    });
    useStreakByteStore.setState((s) => ({
      profileLoaded: true,
      profileSettings: { ...s.profileSettings, onboardingCompleted: true },
    }));
    useStreakByteStore.getState().navigate('dashboard');

    render(<App />);

    const nav = screen.getByRole('navigation', { name: 'Main' });
    await user.click(within(nav).getByRole('link', { name: 'Achievements' }));
    expect(screen.getByText('0 of 16 unlocked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unlocked 0' })).toBeInTheDocument();

    await user.click(within(nav).getByRole('link', { name: 'Arena' }));
    expect(screen.getByRole('heading', { name: 'Arena', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Live 1v1 Duels' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Solo Practice' }));
    expect(screen.getByText('Go to curriculum')).toBeInTheDocument();
    expect(
      screen.getByText(/No completed lessons to review yet/i),
    ).toBeInTheDocument();
  });
});
