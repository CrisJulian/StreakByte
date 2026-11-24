import { render, screen, within } from '@testing-library/react';
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

    expect(screen.getByText('Partly built PC')).toBeInTheDocument();
    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument();

    const tray = screen.getByRole('group', { name: 'Parts tray' });
    const ramButton = within(tray).getByRole('button', { name: /RAM stick 2x/i });
    expect(ramButton).toHaveAttribute('aria-roledescription', 'draggable');

    // Wrong slot attempt: select GPU then tap RAM slot A1
    const gpuButton = within(tray).getByRole('button', { name: 'Graphics card' });
    await user.click(gpuButton);
    await user.click(screen.getByRole('button', { name: 'RAM slot A1' }));
    expect(screen.getByText(/Not there.*PCIe x16/i)).toBeInTheDocument();

    // Hint button highlights dual-channel A2/B2
    await user.click(screen.getByRole('button', { name: /Hint/i }));
    expect(screen.getByText(/Use A2 and B2 for dual-channel/i)).toBeInTheDocument();

    // Tap-to-place RAM into A2 and B2
    await user.click(ramButton);
    await user.click(screen.getByRole('button', { name: 'RAM slot A2' }));
    expect(within(tray).getByRole('button', { name: /RAM stick 1x/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'RAM slot B2' }));
    expect(within(tray).getByRole('button', { name: /RAM installed/i })).toBeDisabled();
    expect(screen.getByText('Step 4 of 6')).toBeInTheDocument();

    // Check build transitions to complete view
    await user.click(screen.getByRole('button', { name: /Check build/i }));
    expect(useStreakByteStore.getState().view).toBe('complete');
    expect(useStreakByteStore.getState().completion?.review[0][1]).toBe('Slots A2 and B2 matched');
  });

  it('supports device placement, IP validation errors, valid save, and connection test in NetworkBuildLab', async () => {
    const user = userEvent.setup();
    useStreakByteStore.getState().navigate('lesson/network');

    render(<LessonPlayerView />);

    expect(screen.getByLabelText('Build a network')).toBeInTheDocument();

    // Hub button is draggable via dnd-kit and supports tap-to-place
    const devicesTray = screen.getByRole('group', { name: 'Devices' });
    const hubButton = within(devicesTray).getByRole('button', { name: 'Hub' });
    expect(hubButton).toHaveAttribute('aria-roledescription', 'draggable');
    await user.click(hubButton);
    await user.click(screen.getByRole('button', { name: 'Hub spot, optional' }));
    expect(screen.getByText(/Hub placed\. The router already has free ports/i)).toBeInTheDocument();
    expect(hubButton).toBeDisabled();

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

    // Step badges rendered over M2/PCIE must not block clicks
    const badges = container.querySelectorAll('g.badge');
    expect(badges.length).toBeGreaterThanOrEqual(4);
    badges.forEach((badge) => {
      expect(badge).toHaveAttribute('pointer-events', 'none');
    });
  });
});
