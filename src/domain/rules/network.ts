import type {
  NetConfigurableDeviceId,
  NetDeviceConfig,
  NetDeviceId,
  NetFormErrors,
  NetworkHintStep,
  NetworkLabState,
} from '../../types/streakbyte';

export const NET_DEVICE_NAMES: Record<NetDeviceId, string> = {
  pc: 'PC',
  laptop: 'Laptop',
  hub: 'Hub',
};

export const ROUTER_IP = '192.168.1.1';
export const LAN_MASK = '255.255.255.0';

export function isValidIpv4(value: string): boolean {
  return (
    /^(\d{1,3})(\.\d{1,3}){3}$/.test(value) && value.split('.').every((octet) => Number(octet) <= 255)
  );
}

export function createInitialNetState(): NetworkLabState {
  return {
    selectedDevice: null,
    placed: { pc: true, laptop: true, hub: false },
    cfg: {
      pc: { ip: '192.168.1.10', mask: LAN_MASK, gw: ROUTER_IP, cab: 'eth' },
    },
    savedDevices: {},
    openDevice: 'laptop',
    bad: 0,
    issues: [],
    message: 'Click PC or Laptop to configure its IP address, then test the connection.',
    errors: {},
    hintedStep: null,
  };
}

export function selectDevice(net: NetworkLabState, device: NetDeviceId | null): NetworkLabState {
  const next = net.selectedDevice === device ? null : device;
  return {
    ...net,
    selectedDevice: next,
    message: next
      ? `Now tap the ${NET_DEVICE_NAMES[next]} spot on the diagram, or drag it onto the spot.`
      : net.message,
  };
}

export function placeDevice(
  net: NetworkLabState,
  spot: NetDeviceId,
  draggedDevice?: NetDeviceId,
): { state: NetworkLabState; placed: boolean } {
  const dev = draggedDevice ?? net.selectedDevice;

  if (!dev) {
    return {
      placed: false,
      state: { ...net, message: 'Select a device in the tray first, then tap a dashed spot.' },
    };
  }

  if (dev !== spot) {
    return {
      placed: false,
      state: {
        ...net,
        bad: net.bad + 1,
        message: `${NET_DEVICE_NAMES[dev]} belongs on the ${NET_DEVICE_NAMES[dev]} spot.`,
      },
    };
  }

  const nextState: NetworkLabState = {
    ...net,
    placed: { ...net.placed, [dev]: true },
    selectedDevice: net.selectedDevice === dev ? null : net.selectedDevice,
    message:
      dev === 'hub'
        ? 'Hub placed. The router already has free ports, so the hub is optional.'
        : `${NET_DEVICE_NAMES[dev]} placed. Click it to set it up.`,
  };

  return {
    placed: true,
    state:
      currentNetworkHintStep(nextState) !== net.hintedStep
        ? { ...nextState, hintedStep: null }
        : nextState,
  };
}

export interface ConfigValidation {
  errors: NetFormErrors;
  issues: string[];
}

/** Validates one device's settings against the router's /24 LAN. */
export function validateDeviceConfig(
  net: NetworkLabState,
  device: NetConfigurableDeviceId,
  config: NetDeviceConfig,
): ConfigValidation {
  const ip = config.ip.trim();
  const mask = config.mask.trim();
  const gw = config.gw.trim();
  const errors: NetFormErrors = {};
  const issues = new Set(net.issues);

  if (!isValidIpv4(ip)) {
    errors.ip = 'Enter four numbers from 0 to 255, like 192.168.1.20.';
  } else if (ip === ROUTER_IP) {
    errors.ip = '192.168.1.1 belongs to the router. Pick 2 to 254.';
  } else if (
    !ip.startsWith('192.168.1.') ||
    Number(ip.split('.')[3]) < 2 ||
    Number(ip.split('.')[3]) > 254
  ) {
    errors.ip = 'Use 192.168.1.x with x from 2 to 254, on the router’s network.';
    issues.add('IP address basics');
  } else if (
    Object.entries(net.cfg).some(([key, existing]) => key !== device && existing?.ip === ip)
  ) {
    errors.ip = 'Another device on this network already uses that address.';
  }

  if (mask !== LAN_MASK) {
    errors.mask = 'Use 255.255.255.0 for this /24 local network.';
    issues.add('Subnet masks');
  }

  if (gw !== ROUTER_IP) {
    errors.gw = 'Set the gateway to the router IP: 192.168.1.1.';
    issues.add('Gateways');
  }

  if (!config.cab) {
    errors.cab = 'Choose a cable.';
  }

  return { errors, issues: [...issues] };
}

export function saveDeviceConfig(
  net: NetworkLabState,
  config: NetDeviceConfig,
): { state: NetworkLabState; saved: boolean } {
  const device = net.openDevice;
  if (!device) return { state: net, saved: false };

  const { errors, issues } = validateDeviceConfig(net, device, config);

  if (Object.keys(errors).length > 0) {
    return { saved: false, state: { ...net, bad: net.bad + 1, issues, errors } };
  }

  const clean: NetDeviceConfig = {
    ip: config.ip.trim(),
    mask: config.mask.trim(),
    gw: config.gw.trim(),
    cab: config.cab,
  };

  const nextState: NetworkLabState = {
    ...net,
    cfg: { ...net.cfg, [device]: clean },
    savedDevices: { ...net.savedDevices, [device]: true },
    openDevice: null,
    errors: {},
    message: `${NET_DEVICE_NAMES[device]} saved (${clean.ip}). Press Test connection to verify the network.`,
  };

  return {
    saved: true,
    state:
      currentNetworkHintStep(nextState) !== net.hintedStep
        ? { ...nextState, hintedStep: null }
        : nextState,
  };
}

/** Returns the active network step needing action, or null when both devices are configured. */
export function currentNetworkHintStep(net: NetworkLabState): NetworkHintStep | null {
  if (!net.placed.pc) return 'place-pc';
  if (!net.placed.laptop) return 'place-laptop';
  const target =
    net.openDevice ?? (!net.savedDevices.laptop ? 'laptop' : !net.savedDevices.pc ? 'pc' : null);
  if (target === 'laptop') return 'config-laptop';
  if (target === 'pc') return 'config-pc';
  return null;
}

/** Returns true if a hint was already purchased for the current incomplete step. */
export function isNetworkHintUsedForCurrentStep(net: NetworkLabState): boolean {
  const step = currentNetworkHintStep(net);
  return step !== null && net.hintedStep === step;
}

/** Returns true when an incomplete step remains and hasn't been hinted yet. */
export function hasNextNetworkHint(net: NetworkLabState): boolean {
  const step = currentNetworkHintStep(net);
  return step !== null && net.hintedStep !== step;
}

/** Next hint: guides placing devices or configures/previews the next unconfigured device. */
export function nextNetworkHint(net: NetworkLabState): NetworkLabState {
  const step = currentNetworkHintStep(net);
  if (step === 'place-pc') {
    return {
      ...net,
      hintedStep: step,
      message: 'Hint: Drag the PC onto the PC spot on the left (or select PC in the tray and tap the PC spot).',
    };
  }
  if (step === 'place-laptop') {
    return {
      ...net,
      hintedStep: step,
      message: 'Hint: Drag the Laptop onto the Laptop spot on the right (or select Laptop in the tray and tap the Laptop spot).',
    };
  }

  const target = step === 'config-laptop' ? 'laptop' : step === 'config-pc' ? 'pc' : null;
  if (!target || !step) {
    return {
      ...net,
      hintedStep: null,
      message: 'Both PC and Laptop are configured. Press Test connection to verify.',
    };
  }

  const suggestedIp =
    target === 'laptop'
      ? net.cfg.pc?.ip === '192.168.1.20'
        ? '192.168.1.21'
        : '192.168.1.20'
      : net.cfg.laptop?.ip === '192.168.1.10'
        ? '192.168.1.11'
        : '192.168.1.10';

  return {
    ...net,
    openDevice: target,
    errors: {},
    hintedStep: step,
    message: `Hint (${NET_DEVICE_NAMES[target]}): Set IP to ${suggestedIp}, Subnet mask ${LAN_MASK}, Gateway ${ROUTER_IP}, and Cable to Ethernet.`,
  };
}

/** Returns true when both PC and Laptop are placed and have valid saved configurations. */
export function isNetworkBuildComplete(net: NetworkLabState): boolean {
  return Boolean(net.placed.pc && net.placed.laptop && net.cfg.pc && net.cfg.laptop);
}

/** Lists human-readable steps remaining before the network connection test can pass. */
export function missingNetworkSteps(net: NetworkLabState): string[] {
  const missing: string[] = [];
  if (!net.placed.pc) missing.push('place PC');
  if (!net.placed.laptop) missing.push('place Laptop');
  if (net.placed.pc && !net.cfg.pc) missing.push('configure PC');
  if (net.placed.laptop && !net.cfg.laptop) missing.push('configure Laptop');
  return missing;
}

export function scoreNetworkBuild(net: NetworkLabState): { accuracyPct: number } {
  return { accuracyPct: Math.max(60, 100 - net.bad * 10) };
}
