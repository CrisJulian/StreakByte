import { describe, expect, it } from 'vitest';
import {
  createInitialNetState,
  currentNetworkHintStep,
  deriveNetworkStepFlags,
  hasNextNetworkHint,
  isNetworkBuildComplete,
  isNetworkHintUsedForCurrentStep,
  isValidIpv4,
  missingNetworkSteps,
  nextNetworkHint,
  placeDevice,
  runPingCheck,
  saveDeviceConfig,
  scoreNetworkBuild,
  wireLink,
} from '../network';

const pcCfg = { ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' };
const laptopCfg = { ip: '192.168.1.20', mask: '255.255.255.0', gw: '192.168.1.1' };

function buildCompleteTopology() {
  let s = createInitialNetState();
  s = placeDevice(s, 'router', 'router').state;
  s = placeDevice(s, 'switch', 'switch').state;
  s = placeDevice(s, 'pc', 'pc').state;
  s = placeDevice(s, 'laptop', 'laptop').state;
  s = wireLink(s, 'wan', 'fiber').state;
  s = wireLink(s, 'uplink', 'eth').state;
  s = wireLink(s, 'pc', 'eth').state;
  s = wireLink(s, 'laptop', 'eth').state;
  return s;
}

describe('network rules', () => {
  it('validates IPv4 shape', () => {
    expect(isValidIpv4('192.168.1.20')).toBe(true);
    expect(isValidIpv4('192.168.1.256')).toBe(false);
    expect(isValidIpv4('192.168.1')).toBe(false);
  });

  it('requires placing devices in matching slots', () => {
    const base = createInitialNetState();
    const wrong = placeDevice(base, 'switch', 'pc');
    expect(wrong.placed).toBe(false);
    expect(wrong.state.bad).toBe(1);
    expect(wrong.state.message).toContain('Workstation PC belongs on the Workstation PC slot');

    const ok = placeDevice(base, 'router', 'router');
    expect(ok.placed).toBe(true);
    expect(ok.state.placed.router).toBe(true);
  });

  it('enforces endpoint placement and WAN vs LAN cable types', () => {
    const base = createInitialNetState();
    // Cannot wire before router placed
    expect(wireLink(base, 'wan', 'fiber').wired).toBe(false);

    let s = placeDevice(base, 'router', 'router').state;
    s = placeDevice(s, 'switch', 'switch').state;

    // Ethernet rejected on WAN
    const badWan = wireLink(s, 'wan', 'eth');
    expect(badWan.wired).toBe(false);
    expect(badWan.state.bad).toBe(1);
    expect(badWan.state.issues).toContain('WAN vs LAN cabling');

    // Fiber accepted on WAN
    const goodWan = wireLink(s, 'wan', 'fiber');
    expect(goodWan.wired).toBe(true);
    s = goodWan.state;

    // Coax/Fiber rejected on LAN uplink
    const badLan = wireLink(s, 'uplink', 'coax');
    expect(badLan.wired).toBe(false);
    expect(badLan.state.bad).toBe(1);

    // Ethernet Cat6 accepted on LAN uplink
    const goodLan = wireLink(s, 'uplink', 'eth');
    expect(goodLan.wired).toBe(true);
  });

  it('validates router IP conflict, duplicate host IPs, subnet mask, gateway, and saves hosts', () => {
    let s = buildCompleteTopology();
    s = { ...s, openDevice: 'pc' };
    s = saveDeviceConfig(s, pcCfg).state;
    expect(s.savedDevices.pc).toBe(true);

    s = { ...s, openDevice: 'laptop' };
    expect(saveDeviceConfig(s, { ...laptopCfg, ip: '192.168.1.1' }).state.errors.ip).toContain('router');
    expect(saveDeviceConfig(s, { ...laptopCfg, ip: '192.168.1.10' }).state.errors.ip).toContain(
      'already uses',
    );

    const bad = saveDeviceConfig(s, { ...laptopCfg, mask: '255.0.0.0', gw: '10.0.0.1' });
    expect(bad.saved).toBe(false);
    expect(bad.state.bad).toBe(1);
    expect(bad.state.issues).toEqual(['Subnet masks', 'Gateways']);

    const ok = saveDeviceConfig(s, laptopCfg);
    expect(ok.saved).toBe(true);
    expect(ok.state.openDevice).toBeNull();
    expect(isNetworkBuildComplete(ok.state)).toBe(true);
    expect(missingNetworkSteps(ok.state)).toEqual([]);
  });

  it('runs ping check and fails until all topology, cabling, and host IPs are complete', () => {
    let s = buildCompleteTopology();
    expect(isNetworkBuildComplete(s)).toBe(false);
    expect(missingNetworkSteps(s)).toEqual(['configure PC', 'configure Laptop']);

    const failedPing = runPingCheck(s);
    expect(failedPing.passed).toBe(false);
    expect(failedPing.state.bad).toBe(1);
    expect(failedPing.state.pingLog[1]).toContain('timed out');

    s = saveDeviceConfig({ ...s, openDevice: 'pc' }, pcCfg).state;
    s = saveDeviceConfig({ ...s, openDevice: 'laptop' }, laptopCfg).state;
    expect(deriveNetworkStepFlags(s)).toEqual([true, true, true, true, false]);

    const passedPing = runPingCheck(s);
    expect(passedPing.passed).toBe(true);
    expect(passedPing.state.pingLog).toHaveLength(3);
    expect(deriveNetworkStepFlags(passedPing.state)).toEqual([true, true, true, true, true]);
  });

  it('walks hints across devices, links, and IPs and locks each hint until advancing', () => {
    const base = createInitialNetState();
    expect(currentNetworkHintStep(base)).toBe('place-router');
    expect(hasNextNetworkHint(base)).toBe(true);

    const h1 = nextNetworkHint(base);
    expect(h1.hintedStep).toBe('place-router');
    expect(h1.hintTarget).toBe('router');
    expect(isNetworkHintUsedForCurrentStep(h1)).toBe(true);
    expect(hasNextNetworkHint(h1)).toBe(false);

    const afterRouter = placeDevice(h1, 'router', 'router').state;
    expect(afterRouter.hintedStep).toBeNull();
    expect(currentNetworkHintStep(afterRouter)).toBe('place-switch');

    let s = buildCompleteTopology();
    expect(currentNetworkHintStep(s)).toBe('config-pc');
    const pcHint = nextNetworkHint(s);
    expect(pcHint.openDevice).toBe('pc');
    expect(pcHint.message).toContain('192.168.1.10');
    expect(isNetworkHintUsedForCurrentStep(pcHint)).toBe(true);

    s = saveDeviceConfig(pcHint, pcCfg).state;
    expect(currentNetworkHintStep(s)).toBe('config-laptop');
    const laptopHint = nextNetworkHint(s);
    expect(laptopHint.openDevice).toBe('laptop');
    expect(laptopHint.message).toContain('192.168.1.20');

    s = saveDeviceConfig(laptopHint, laptopCfg).state;
    expect(currentNetworkHintStep(s)).toBeNull();
    expect(hasNextNetworkHint(s)).toBe(false);
    expect(nextNetworkHint(s).message).toContain('Test connection');
  });

  it('floors accuracy at 60', () => {
    expect(scoreNetworkBuild({ ...createInitialNetState(), bad: 9 }).accuracyPct).toBe(60);
  });
});
