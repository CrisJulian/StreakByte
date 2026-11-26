import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useStreakByteStore } from '../../../store/useStreakByteStore';
import { LessonPlayerView } from '../../LessonPlayerView';

describe('Interactive Labs (PcBuildLab & NetworkBuildLab)', () => {
  beforeEach(() => {
    localStorage.clear();
    useStreakByteStore.getState().resetAll();
  });

  it('supports tap-to-place, wrong-slot hint feedback, Hint button, and Check build in PcBuildLab', async () => {
    const user = userEvent.setup();
    useStreakByteStore.getState().navigate('lesson/pc');

    render(<LessonPlayerView />);

    expect(screen.getByRole('heading', { name: 'Build a PC' })).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();

    const tray = screen.getByRole('group', { name: 'Parts tray' });
    const cpuButton = within(tray).getByRole('button', { name: 'CPU' });
    const coolerButton = within(tray).getByRole('button', { name: 'CPU cooler' });
    const ramButton = within(tray).getByRole('button', { name: /RAM stick 2x/i });
    const m2Button = within(tray).getByRole('button', { name: 'M.2 SSD' });
    const gpuButton = within(tray).getByRole('button', { name: 'Graphics card' });
    const psuButton = within(tray).getByRole('button', { name: 'Power supply' });
    expect(ramButton).toHaveAttribute('aria-roledescription', 'draggable');

    // Trying to submit with 0/7 parts installed refuses completion and lists missing parts
    await user.click(screen.getByRole('button', { name: /Check build \(0\/7\)/i }));
    expect(useStreakByteStore.getState().view).toBe('lesson');
    expect(screen.getByText(/Build incomplete \(0\/7 parts installed\)/i)).toBeInTheDocument();

    // Mounting cooler before installing CPU fails with helpful message
    await user.click(coolerButton);
    await user.click(screen.getByRole('button', { name: 'RAM slot A1' }));
    expect(screen.getByText(/Not there.*CPU cooler mounts/i)).toBeInTheDocument();

    // Install CPU first, then mount cooler
    await user.click(cpuButton);
    await user.click(screen.getByRole('button', { name: 'CPU socket' }));
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();

    await user.click(coolerButton);
    await user.click(screen.getByRole('button', { name: 'CPU cooler mount' }));
    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument();

    // Wrong slot attempt: select GPU then tap RAM slot A1
    await user.click(gpuButton);
    await user.click(screen.getByRole('button', { name: 'RAM slot A1' }));
    expect(screen.getByText(/Not there.*PCIe x16/i)).toBeInTheDocument();

    // Hint button requires 25 XP, then highlights dual-channel A2/B2 and deducts 25 XP
    const hintButton = screen.getByRole('button', { name: /Hint · 25 XP/i });
    expect(hintButton).toBeDisabled();

    act(() => {
      useStreakByteStore.setState({ labBonusXp: 100 });
    });
    expect(hintButton).not.toBeDisabled();
    await user.click(hintButton);
    expect(screen.getByText(/Use A2 and B2 for dual-channel/i)).toBeInTheDocument();
    expect(useStreakByteStore.getState().xpSpent).toBe(25);
    expect(screen.getByRole('button', { name: 'Hint used' })).toBeDisabled();

    // Tap-to-place RAM into A2 (keeps RAM hint locked) and B2 (advances step & re-enables hint)
    await user.click(ramButton);
    await user.click(screen.getByRole('button', { name: 'RAM slot A2' }));
    expect(within(tray).getByRole('button', { name: /RAM stick 1x/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hint used' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'RAM slot B2' }));
    expect(within(tray).getByRole('button', { name: /RAM installed/i })).toBeDisabled();
    expect(screen.getByText('Step 4 of 6')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hint · 25 XP/i })).not.toBeDisabled();

    // Install remaining parts: M.2 SSD, GPU, Power supply
    await user.click(m2Button);
    await user.click(screen.getByRole('button', { name: 'M.2 SSD slot' }));
    await user.click(gpuButton);
    await user.click(screen.getByRole('button', { name: 'PCIe x16 graphics card slot' }));
    await user.click(psuButton);
    await user.click(screen.getByRole('button', { name: '24-pin power connector' }));

    // Check build transitions to complete view once all 7 parts are installed
    await user.click(screen.getByRole('button', { name: 'Check build' }));
    expect(useStreakByteStore.getState().view).toBe('complete');
    expect(useStreakByteStore.getState().completion?.partsValue).toBe('7 / 7');
    expect(useStreakByteStore.getState().completion?.review[0][1]).toBe('Slots A2 and B2 matched');
  });

  it('supports device placement, IP validation errors, valid save, and connection test in NetworkBuildLab', async () => {
    const user = userEvent.setup();
    useStreakByteStore.getState().navigate('lesson/network');

    render(<LessonPlayerView />);

    expect(screen.getByLabelText('Build a network')).toBeInTheDocument();
    expect(screen.queryByText(/Hint: use a free number/i)).not.toBeInTheDocument();

    const netHintButton = screen.getByRole('button', { name: /Hint · 25 XP/i });
    expect(netHintButton).toBeDisabled();

    act(() => {
      useStreakByteStore.setState({ labBonusXp: 100 });
    });
    expect(netHintButton).not.toBeDisabled();
    await user.click(netHintButton);
    expect(screen.getByText(/Set IP to 192\.168\.1\.20/i)).toBeInTheDocument();
    expect(useStreakByteStore.getState().xpSpent).toBe(25);
    expect(screen.getByRole('button', { name: 'Hint used' })).toBeDisabled();

    // Hub button is draggable via dnd-kit and supports tap-to-place
    const devicesTray = screen.getByRole('group', { name: 'Devices' });
    const hubButton = within(devicesTray).getByRole('button', { name: 'Hub' });
    expect(hubButton).toHaveAttribute('aria-roledescription', 'draggable');
    await user.click(hubButton);
    await user.click(screen.getByRole('button', { name: 'Hub spot, optional' }));
    expect(screen.getByText(/Hub placed\. The router already has free ports/i)).toBeInTheDocument();
    expect(hubButton).toBeDisabled();

    // Test connection fails before Laptop is saved
    await user.click(screen.getByRole('button', { name: /Test connection/i }));
    expect(useStreakByteStore.getState().view).toBe('lesson');
    expect(screen.getByText(/Connection test failed\. Still needed: configure Laptop/i)).toBeInTheDocument();

    // Laptop setup form is open by default: submit invalid IP first
    const ipInput = screen.getByLabelText('IP address');
    await user.clear(ipInput);
    await user.type(ipInput, '999.1.1.1');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByText(/Enter four numbers from 0 to 255/i)).toBeInTheDocument();
    expect(ipInput).toHaveAttribute('aria-invalid', 'true');

    // Submit valid IP and save
    await user.clear(ipInput);
    await user.type(ipInput, '192.168.1.20');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.queryByLabelText('IP address')).not.toBeInTheDocument();
    expect(screen.getByText('Laptop: 192.168.1.20')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hint · 25 XP/i })).not.toBeDisabled();

    // Test connection completes the lesson
    await user.click(screen.getByRole('button', { name: /Test connection/i }));
    expect(useStreakByteStore.getState().view).toBe('complete');
    expect(useStreakByteStore.getState().completion?.xp).toBe('+150');
  });

  it('supports keyboard Enter/Space tap-to-place without KeyboardSensor hijack and keeps StepBadges non-blocking', async () => {
    const user = userEvent.setup();
    useStreakByteStore.getState().navigate('lesson/pc');

    const { container } = render(<LessonPlayerView />);

    // Keyboard user focuses RAM button, presses Enter to select, then activates RAM slot A2 with Enter
    const tray = screen.getByRole('group', { name: 'Parts tray' });
    const ramButton = within(tray).getByRole('button', { name: /RAM stick 2x/i });
    ramButton.focus();
    await user.keyboard('{Enter}');
    expect(ramButton).toHaveAttribute('aria-pressed', 'true');

    const slotA2 = screen.getByRole('button', { name: 'RAM slot A2' });
    slotA2.focus();
    await user.keyboard('{Enter}');
    expect(within(tray).getByRole('button', { name: /RAM stick 1x/i })).toBeInTheDocument();

    // Step badges rendered over slots must not block clicks
    const badges = container.querySelectorAll('g.badge');
    expect(badges.length).toBeGreaterThanOrEqual(4);
    badges.forEach((badge) => {
      expect(badge).toHaveAttribute('pointer-events', 'none');
    });
  });

  it('counts down from chosen time in Timed mode and shows Time\'s Up failure modal at zero', async () => {
    const user = userEvent.setup();
    useStreakByteStore.getState().setSetupMode('timed');
    useStreakByteStore.getState().setSetupLength('5');
    useStreakByteStore.getState().openSetup('pc');
    useStreakByteStore.getState().startSessionFromModal();

    expect(useStreakByteStore.getState().lessonSeconds).toBe(300);

    render(<LessonPlayerView />);
    expect(screen.getByText('5:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hint/i })).toBeDisabled();

    // Tick down to 0
    act(() => {
      useStreakByteStore.setState({ lessonSeconds: 1 });
      useStreakByteStore.getState().tickLessonTimer();
    });
    expect(useStreakByteStore.getState().lessonSeconds).toBe(0);
    expect(useStreakByteStore.getState().labTimedOut).toBe(true);

    expect(screen.getByRole('alertdialog', { name: "Time's up" })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(useStreakByteStore.getState().labTimedOut).toBe(false);
    expect(useStreakByteStore.getState().lessonSeconds).toBe(300);
  });
});
