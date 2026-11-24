import { describe, expect, it } from 'vitest';
import {
  createInitialNetState,
  isValidIpv4,
  placeDevice,
  saveDeviceConfig,
  scoreNetworkBuild,
} from '../network';

const good = { ip: '192.168.1.20', mask: '255.255.255.0', gw: '192.168.1.1', cab: 'eth' as const };

describe('network rules', () => {
  it('validates IPv4 shape', () => {
    expect(isValidIpv4('192.168.1.20')).toBe(true);
    expect(isValidIpv4('192.168.1.256')).toBe(false);
    expect(isValidIpv4('192.168.1')).toBe(false);
  });

  it('saves a valid laptop config', () => {
    const { state, saved } = saveDeviceConfig(createInitialNetState(), good);
    expect(saved).toBe(true);
    expect(state.cfg.laptop?.ip).toBe('192.168.1.20');
    expect(state.openDevice).toBeNull();
  });

  it('rejects router IP, duplicate IP, wrong mask and gateway, and records issues', () => {
    const base = createInitialNetState();
    expect(saveDeviceConfig(base, { ...good, ip: '192.168.1.1' }).state.errors.ip).toContain('router');
    expect(saveDeviceConfig(base, { ...good, ip: '192.168.1.10' }).state.errors.ip).toContain('already uses');

    const bad = saveDeviceConfig(base, { ...good, mask: '255.0.0.0', gw: '10.0.0.1' });
    expect(bad.saved).toBe(false);
    expect(bad.state.bad).toBe(1);
    expect(bad.state.issues).toEqual(['Subnet masks', 'Gateways']);
  });

  it('only accepts a device on its own spot', () => {
    const base = createInitialNetState();
    expect(placeDevice(base, 'hub', 'pc').placed).toBe(false);
    expect(placeDevice(base, 'hub', 'hub').state.placed.hub).toBe(true);
  });

  it('floors accuracy at 60', () => {
    expect(scoreNetworkBuild({ ...createInitialNetState(), bad: 9 }).accuracyPct).toBe(60);
  });
});
