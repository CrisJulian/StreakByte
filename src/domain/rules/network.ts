import type {
  CableType,
  NetConfigurableDeviceId,
  NetDeviceConfig,
  NetDeviceId,
  NetFormErrors,
  NetLinkId,
  NetworkHintStep,
  NetworkLabState,
} from '../../types/streakbyte';

export const NET_DEVICE_NAMES: Record<NetDeviceId, string> = {
  router: 'Router',
  switch: '8-Port Switch',
  pc: 'Workstation PC',
  laptop: 'Laptop',
};

export const NET_LINK_LABELS: Record<NetLinkId, string> = {
  wan: 'ISP → Router WAN',
  uplink: 'Router LAN → Switch',
  pc: 'Switch → PC',
  laptop: 'Switch → Laptop',
};

export const NET_CABLE_NAMES: Record<CableType, string> = {
  eth: 'Ethernet (Cat6)',
  fiber: 'Fiber optic',
  coax: 'Coaxial',
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
    selectedCable: null,
    placed: { router: false, switch: false, pc: false, laptop: false },
    links: {},
    cfg: {},
    savedDevices: {},
    openDevice: null,
    pingPassed: false,
    pingLog: [],
    bad: 0,
    issues: [],
    message: 'Start by placing the Router, Switch, PC, and Laptop onto the topology blueprint.',
    errors: {},
    hintTarget: null,
    hintTick: 0,
    hintedStep: null,
  };
}

export function selectDevice(net: NetworkLabState, device: NetDeviceId | null): NetworkLabState {
  const next = net.selectedDevice === device ? null : device;
  return {
    ...net,
    selectedDevice: next,
    selectedCable: next ? null : net.selectedCable,
    message: next
      ? `Now tap the ${NET_DEVICE_NAMES[next]} slot on the diagram, or drag it onto the slot.`
      : net.message,
  };
}

export function selectCable(net: NetworkLabState, cable: CableType | null): NetworkLabState {
  const next = net.selectedCable === cable ? null : cable;
  return {
    ...net,
    selectedCable: next,
    selectedDevice: next ? null : net.selectedDevice,
    message: next
      ? next === 'eth'
        ? 'Cat6 Ethernet selected — tap a LAN link (Router → Switch, Switch → PC, or Switch → Laptop).'
        : `${NET_CABLE_NAMES[next]} selected — tap the ISP → Router WAN link to wire internet.`
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
      state: { ...net, message: 'Select a device in the tray first, then tap its matching slot.' },
    };
  }

  if (dev !== spot) {
    return {
      placed: false,
      state: {
        ...net,
        bad: net.bad + 1,
        message: `${NET_DEVICE_NAMES[dev]} belongs on the ${NET_DEVICE_NAMES[dev]} slot.`,
      },
    };
  }

  if (net.placed[dev]) {
    return {
      placed: false,
      state: { ...net, message: `${NET_DEVICE_NAMES[dev]} is already placed.` },
    };
  }

  const nextState: NetworkLabState = {
    ...net,
    placed: { ...net.placed, [dev]: true },
    selectedDevice: net.selectedDevice === dev ? null : net.selectedDevice,
    pingPassed: false,
    pingLog: [],
    message:
      dev === 'pc' || dev === 'laptop'
        ? `${NET_DEVICE_NAMES[dev]} placed. Wire it to the Switch, then click it to configure IPv4.`
        : `${NET_DEVICE_NAMES[dev]} placed.`,
  };

  return {
    placed: true,
    state:
      currentNetworkHintStep(nextState) !== net.hintedStep
        ? { ...nextState, hintTarget: null, hintedStep: null }
        : nextState,
  };
}

function prerequisiteMessageForLink(net: NetworkLabState, linkId: NetLinkId): string | null {
  if (linkId === 'wan' && !net.placed.router) {
    return 'Place the Router before wiring the ISP WAN line.';
  }
  if (linkId === 'uplink' && (!net.placed.router || !net.placed.switch)) {
    return 'Place both the Router and the 8-Port Switch before wiring the uplink.';
  }
  if (linkId === 'pc' && (!net.placed.switch || !net.placed.pc)) {
    return 'Place both the 8-Port Switch and Workstation PC before wiring the PC port.';
  }
  if (linkId === 'laptop' && (!net.placed.switch || !net.placed.laptop)) {
    return 'Place both the 8-Port Switch and Laptop before wiring the Laptop port.';
  }
  return null;
}

export function wireLink(
  net: NetworkLabState,
  linkId: NetLinkId,
  draggedCable?: CableType,
): { state: NetworkLabState; wired: boolean } {
  const cable = draggedCable ?? net.selectedCable;
  if (!cable) {
    return {
      wired: false,
      state: { ...net, message: 'Select a cable in the tray first (or drag one onto a dashed link).' },
    };
  }

  const missingPrereq = prerequisiteMessageForLink(net, linkId);
  if (missingPrereq) {
    return {
      wired: false,
      state: { ...net, message: missingPrereq },
    };
  }

  if (net.links[linkId]) {
    return {
      wired: false,
      state: { ...net, message: `${NET_LINK_LABELS[linkId]} is already wired.` },
    };
  }

  const issues = new Set(net.issues);
  if (linkId === 'wan' && cable === 'eth') {
    issues.add('WAN vs LAN cabling');
    return {
      wired: false,
      state: {
        ...net,
        bad: net.bad + 1,
        issues: [...issues],
        message: 'Plug Fiber or Coax into the ISP → Router WAN port (Cat6 is for local LAN links).',
      },
    };
  }

  if (linkId !== 'wan' && cable !== 'eth') {
    issues.add('WAN vs LAN cabling');
    return {
      wired: false,
      state: {
        ...net,
        bad: net.bad + 1,
        issues: [...issues],
        message: `Use Ethernet (Cat6) for ${NET_LINK_LABELS[linkId]} — Fiber/Coax belongs on the WAN line.`,
      },
    };
  }

  const nextState: NetworkLabState = {
    ...net,
    links: { ...net.links, [linkId]: cable },
    selectedCable: null,
    pingPassed: false,
    pingLog: [],
    message: `${NET_LINK_LABELS[linkId]} connected with ${NET_CABLE_NAMES[cable]}.`,
  };

  return {
    wired: true,
    state:
      currentNetworkHintStep(nextState) !== net.hintedStep
        ? { ...nextState, hintTarget: null, hintedStep: null }
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
  };

  const nextState: NetworkLabState = {
    ...net,
    cfg: { ...net.cfg, [device]: clean },
    savedDevices: { ...net.savedDevices, [device]: true },
    openDevice: null,
    errors: {},
    pingPassed: false,
    pingLog: [],
    message: `${NET_DEVICE_NAMES[device]} saved (${clean.ip}).`,
  };

  return {
    saved: true,
    state:
      currentNetworkHintStep(nextState) !== net.hintedStep
        ? { ...nextState, hintTarget: null, hintedStep: null }
        : nextState,
  };
}

/** 5-step checklist flags shared by NetworkBuildLab and LessonPlayerView. */
export function deriveNetworkStepFlags(net: NetworkLabState): [boolean, boolean, boolean, boolean, boolean] {
  const allPlaced =
    net.placed.router && net.placed.switch && net.placed.pc && net.placed.laptop;
  const coreWired = Boolean(net.links.wan && net.links.uplink);
  const hostsWired = Boolean(net.links.pc && net.links.laptop);
  const hostsConfigured = Boolean(
    net.cfg.pc && net.cfg.laptop && net.savedDevices.pc && net.savedDevices.laptop,
  );
  return [allPlaced, coreWired, hostsWired, hostsConfigured, net.pingPassed];
}

/** Returns the active network step needing action, or null when topology + IP setup is ready to ping. */
export function currentNetworkHintStep(net: NetworkLabState): NetworkHintStep | null {
  if (!net.placed.router) return 'place-router';
  if (!net.placed.switch) return 'place-switch';
  if (!net.placed.pc) return 'place-pc';
  if (!net.placed.laptop) return 'place-laptop';
  if (!net.links.wan) return 'wire-wan';
  if (!net.links.uplink) return 'wire-uplink';
  if (!net.links.pc) return 'wire-pc';
  if (!net.links.laptop) return 'wire-laptop';
  const target =
    net.openDevice ?? (!net.savedDevices.pc ? 'pc' : !net.savedDevices.laptop ? 'laptop' : null);
  if (target === 'pc') return 'config-pc';
  if (target === 'laptop') return 'config-laptop';
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

/** Next hint: guides placing devices, wiring cables, or configuring the next host IPv4 settings. */
export function nextNetworkHint(net: NetworkLabState): NetworkLabState {
  const bump = net.hintTick + 1;
  const step = currentNetworkHintStep(net);
  if (step === 'place-router') {
    return {
      ...net,
      hintTarget: 'router',
      hintTick: bump,
      hintedStep: step,
      message: 'Hint: Select Router in the tray and tap the Router slot (or drag it onto the slot).',
    };
  }
  if (step === 'place-switch') {
    return {
      ...net,
      hintTarget: 'switch',
      hintTick: bump,
      hintedStep: step,
      message: 'Hint: Select 8-Port Switch and place it in the Switch slot below the Router.',
    };
  }
  if (step === 'place-pc') {
    return {
      ...net,
      hintTarget: 'pc',
      hintTick: bump,
      hintedStep: step,
      message: 'Hint: Place Workstation PC on the bottom-left slot.',
    };
  }
  if (step === 'place-laptop') {
    return {
      ...net,
      hintTarget: 'laptop',
      hintTick: bump,
      hintedStep: step,
      message: 'Hint: Place Laptop on the bottom-right slot.',
    };
  }
  if (step === 'wire-wan') {
    return {
      ...net,
      hintTarget: 'wan',
      hintTick: bump,
      hintedStep: step,
      message: 'Hint: Choose Fiber or Coax, then tap the ISP → Router WAN link.',
    };
  }
  if (step === 'wire-uplink') {
    return {
      ...net,
      hintTarget: 'uplink',
      hintTick: bump,
      hintedStep: step,
      message: 'Hint: Choose Ethernet (Cat6), then tap the Router LAN → Switch uplink.',
    };
  }
  if (step === 'wire-pc') {
    return {
      ...net,
      hintTarget: 'pc',
      hintTick: bump,
      hintedStep: step,
      message: 'Hint: Choose Ethernet (Cat6), then tap the Switch → PC link.',
    };
  }
  if (step === 'wire-laptop') {
    return {
      ...net,
      hintTarget: 'laptop',
      hintTick: bump,
      hintedStep: step,
      message: 'Hint: Choose Ethernet (Cat6), then tap the Switch → Laptop link.',
    };
  }

  const target = step === 'config-pc' ? 'pc' : step === 'config-laptop' ? 'laptop' : null;
  if (!target || !step) {
    return {
      ...net,
      hintTarget: null,
      hintedStep: null,
      message: 'All devices, cables, and IPs are ready. Press Test connection to run ping.',
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
    hintTarget: target,
    hintTick: bump,
    hintedStep: step,
    message: `Hint (${NET_DEVICE_NAMES[target]}): Set IP ${suggestedIp}, Subnet mask ${LAN_MASK}, Gateway ${ROUTER_IP}.`,
  };
}

/** Returns true when all 4 devices are placed, all 4 links are wired, and both hosts are saved. */
export function isNetworkBuildComplete(net: NetworkLabState): boolean {
  return Boolean(
    net.placed.router &&
      net.placed.switch &&
      net.placed.pc &&
      net.placed.laptop &&
      net.links.wan &&
      net.links.uplink &&
      net.links.pc &&
      net.links.laptop &&
      net.cfg.pc &&
      net.cfg.laptop &&
      net.savedDevices.pc &&
      net.savedDevices.laptop,
  );
}

/** Lists human-readable steps remaining before the network connection test can pass. */
export function missingNetworkSteps(net: NetworkLabState): string[] {
  const missing: string[] = [];
  if (!net.placed.router) missing.push('place Router');
  if (!net.placed.switch) missing.push('place Switch');
  if (!net.placed.pc) missing.push('place PC');
  if (!net.placed.laptop) missing.push('place Laptop');
  if (!net.links.wan) missing.push('wire WAN');
  if (!net.links.uplink) missing.push('wire Router → Switch');
  if (!net.links.pc) missing.push('wire Switch → PC');
  if (!net.links.laptop) missing.push('wire Switch → Laptop');
  if (net.placed.pc && !net.savedDevices.pc) missing.push('configure PC');
  if (net.placed.laptop && !net.savedDevices.laptop) missing.push('configure Laptop');
  return missing;
}

/** Runs simulated ICMP ping diagnostics across gateway, PC, and Laptop. */
export function runPingCheck(net: NetworkLabState): { state: NetworkLabState; passed: boolean } {
  if (!isNetworkBuildComplete(net)) {
    const missing = missingNetworkSteps(net);
    return {
      passed: false,
      state: {
        ...net,
        bad: net.bad + 1,
        pingPassed: false,
        pingLog: ['> ping 192.168.1.1', 'Request timed out — wiring or IP config incomplete.'],
        message: `Connection test failed. Still needed: ${missing.join(', ')}.`,
      },
    };
  }

  return {
    passed: true,
    state: {
      ...net,
      pingPassed: true,
      pingLog: [
        `> ping ${ROUTER_IP} (Router Gateway) — 1ms · OK`,
        `> ping ${net.cfg.pc!.ip} (Workstation PC) — 2ms · OK`,
        `> ping ${net.cfg.laptop!.ip} (Laptop) — 3ms · 0% loss`,
      ],
      message: 'All ping checks passed (0% loss)! Press Finish build to complete.',
    },
  };
}

export function scoreNetworkBuild(net: NetworkLabState): { accuracyPct: number } {
  return { accuracyPct: Math.max(60, 100 - net.bad * 10) };
}
