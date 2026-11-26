import { describe, expect, it } from 'vitest';
import {
  createInitialNetState,
  hasNextNetworkHint,
  isNetworkBuildComplete,
  isNetworkHintUsedForCurrentStep,
  isValidIpv4,
  missingNetworkSteps,
  nextNetworkHint,
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

  it('derives next-step network hints without duplicate IPs', () => {
    const missingPc = {
      ...createInitialNetState(),
      placed: { pc: false, laptop: false, hub: false },
    };
    expect(hasNextNetworkHint(missingPc)).toBe(true);
    expect(nextNetworkHint(missingPc).message).toContain('PC spot');

    const missingLaptop = {
      ...createInitialNetState(),
      placed: { pc: true, laptop: false, hub: false },
    };
    expect(hasNextNetworkHint(missingLaptop)).toBe(true);
    expect(nextNetworkHint(missingLaptop).message).toContain('Laptop spot');

    // Initial state has PC pre-configured with 192.168.1.10 and laptop unsaved
    const initial = createInitialNetState();
    expect(hasNextNetworkHint(initial)).toBe(true);
    const laptopHint = nextNetworkHint({ ...initial, openDevice: null });
    expect(laptopHint.openDevice).toBe('laptop');
    expect(laptopHint.message).toContain('192.168.1.20');

    // Avoids PC IP if PC already uses 192.168.1.20
    const clashCheck = {
      ...initial,
      openDevice: 'laptop' as const,
      cfg: { ...initial.cfg, pc: { ...good, ip: '192.168.1.20' } },
    };
    expect(nextNetworkHint(clashCheck).message).toContain('192.168.1.21');

    // Once both devices are placed and saved, no paid hint remains
    const allDone = {
      ...initial,
      savedDevices: { pc: true, laptop: true },
      openDevice: null,
    };
    expect(hasNextNetworkHint(allDone)).toBe(false);
    expect(nextNetworkHint(allDone).message).toContain('Test connection');
  });

  it('reports completeness and missing steps before all hosts are configured', () => {
    const initial = createInitialNetState();
    expect(isNetworkBuildComplete(initial)).toBe(false);
    expect(missingNetworkSteps(initial)).toEqual(['configure Laptop']);

    const { state: configured } = saveDeviceConfig(initial, good);
    expect(isNetworkBuildComplete(configured)).toBe(true);
    expect(missingNetworkSteps(configured)).toEqual([]);
  });

  it('locks the network hint for the current step until the step is saved', () => {
    const initial = createInitialNetState();
    expect(hasNextNetworkHint(initial)).toBe(true);
    expect(isNetworkHintUsedForCurrentStep(initial)).toBe(false);

    const hinted = nextNetworkHint(initial);
    expect(hinted.hintedStep).toBe('config-laptop');
    expect(isNetworkHintUsedForCurrentStep(hinted)).toBe(true);
    expect(hasNextNetworkHint(hinted)).toBe(false);

    // Closing the form without saving keeps the hint locked for Laptop
    const closed = { ...hinted, openDevice: null };
    expect(isNetworkHintUsedForCurrentStep(closed)).toBe(true);
    expect(hasNextNetworkHint(closed)).toBe(false);

    // Saving Laptop clears hintedStep and unlocks the hint for PC
    const { state: afterLaptop } = saveDeviceConfig(hinted, good);
    expect(afterLaptop.hintedStep).toBeNull();
    expect(isNetworkHintUsedForCurrentStep(afterLaptop)).toBe(false);
    expect(hasNextNetworkHint(afterLaptop)).toBe(true);
  });
});
