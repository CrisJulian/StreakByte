import type { PcBuildState, PcPartId, PcSlotId } from '../../types/streakbyte';

export const PC_SLOT_TO_PART: Record<PcSlotId, PcPartId> = {
  CPU: 'cpu',
  COOLER: 'cooler',
  A1: 'ram',
  A2: 'ram',
  B1: 'ram',
  B2: 'ram',
  M2: 'm2',
  PCIE: 'gpu',
  PWR: 'psu',
};

export const PC_HINTS: Record<PcPartId, string> = {
  cpu: 'The CPU goes in the large central processor socket next to the VRM.',
  cooler: 'The CPU cooler mounts directly on top of the installed CPU.',
  ram: 'RAM goes in the memory slots, the four tall slots at the top.',
  m2: 'The M.2 SSD goes in the M.2 slot under the CPU.',
  gpu: 'The graphics card goes in the long PCIe x16 slot.',
  psu: 'Power connects at the 24-pin connector on the right.',
};

export const PC_SUCCESS_COPY: Record<PcPartId, string> = {
  cpu: 'CPU seated in the socket. Align the corner triangle — never force it.',
  cooler: 'CPU cooler mounted over thermal paste. Next, install dual-channel RAM.',
  ram: 'RAM seated. Match the notch and press until the clips click.',
  m2: 'M.2 SSD installed and secured.',
  gpu: 'Graphics card seated in the PCIe x16 slot.',
  psu: '24-pin power cable connected.',
};

const RAM_SLOTS = ['A1', 'A2', 'B1', 'B2'] as const;

export function createInitialPcState(): PcBuildState {
  return {
    selectedPart: null,
    cpu: false,
    cooler: false,
    ram: {},
    m2: false,
    gpu: false,
    psu: false,
    ok: 0,
    bad: 0,
    message: 'Select a part in the tray, then tap its slot on the board.',
    hintSlots: [],
    hintTick: 0,
    hintedStep: null,
  };
}

export function ramCount(pc: PcBuildState): number {
  return Object.keys(pc.ram).length;
}

export function selectPart(pc: PcBuildState, part: PcPartId | null): PcBuildState {
  const next = pc.selectedPart === part ? null : part;
  return {
    ...pc,
    selectedPart: next,
    message: next ? 'Now tap the matching slot on the board, or drag the part onto it.' : pc.message,
  };
}

export interface PlaceResult {
  state: PcBuildState;
  placed: boolean;
}

/** Pure version of "drop a part on a slot". Returns the next state and whether it was accepted. */
export function placePart(pc: PcBuildState, slotId: PcSlotId, draggedPart?: PcPartId): PlaceResult {
  const part = draggedPart ?? pc.selectedPart;

  if (!part) {
    return {
      placed: false,
      state: { ...pc, message: 'Select a part in the tray first, then tap a slot on the board.' },
    };
  }

  const want = PC_SLOT_TO_PART[slotId];
  if (part !== want) {
    return {
      placed: false,
      state: { ...pc, bad: pc.bad + 1, message: `Not there. ${PC_HINTS[part]}` },
    };
  }

  const isRamSlot = (RAM_SLOTS as readonly string[]).includes(slotId);
  const alreadyFilled = isRamSlot
    ? Boolean(pc.ram[slotId as (typeof RAM_SLOTS)[number]])
    : want === 'cpu'
      ? pc.cpu
      : want === 'cooler'
        ? pc.cooler
        : want === 'm2'
          ? pc.m2
          : want === 'gpu'
            ? pc.gpu
            : pc.psu;

  if (alreadyFilled) {
    return {
      placed: false,
      state: { ...pc, message: 'That slot already has a part installed.' },
    };
  }

  if (want === 'cooler' && !pc.cpu) {
    return {
      placed: false,
      state: {
        ...pc,
        bad: pc.bad + 1,
        message: 'Install the CPU in the socket before mounting the CPU cooler.',
      },
    };
  }

  if (want === 'ram' && ramCount(pc) >= 2) {
    return {
      placed: false,
      state: { ...pc, selectedPart: null, message: 'Both RAM sticks are already installed.' },
    };
  }

  const nextCpu = want === 'cpu' ? true : pc.cpu;
  const nextCooler = want === 'cooler' ? true : pc.cooler;
  const nextRam = isRamSlot ? { ...pc.ram, [slotId]: true } : pc.ram;
  const nextM2 = want === 'm2' ? true : pc.m2;
  const nextGpu = want === 'gpu' ? true : pc.gpu;
  const nextPsu = want === 'psu' ? true : pc.psu;

  const partExhausted =
    (want === 'cpu' && nextCpu) ||
    (want === 'cooler' && nextCooler) ||
    (want === 'ram' && Object.keys(nextRam).length >= 2) ||
    (want === 'm2' && nextM2) ||
    (want === 'gpu' && nextGpu) ||
    (want === 'psu' && nextPsu);

  const nextState: PcBuildState = {
    ...pc,
    cpu: nextCpu,
    cooler: nextCooler,
    ram: nextRam,
    m2: nextM2,
    gpu: nextGpu,
    psu: nextPsu,
    ok: pc.ok + 1,
    selectedPart: partExhausted && pc.selectedPart === want ? null : pc.selectedPart,
    message: PC_SUCCESS_COPY[want],
  };

  const stepChanged = currentPcHintStep(nextState) !== pc.hintedStep;

  return {
    placed: true,
    state: stepChanged
      ? {
          ...nextState,
          hintSlots: [],
          hintedStep: null,
        }
      : nextState,
  };
}

/** Returns total installed required PC build parts out of 7 (CPU, cooler, 2 RAM, M.2, GPU, PSU). */
export const TOTAL_PC_PARTS = 7;

export function installedPcPartsCount(pc: PcBuildState): number {
  return (
    (pc.cpu ? 1 : 0) +
    (pc.cooler ? 1 : 0) +
    ramCount(pc) +
    (pc.m2 ? 1 : 0) +
    (pc.gpu ? 1 : 0) +
    (pc.psu ? 1 : 0)
  );
}

/** Returns true once all 7 required PC build parts are installed. */
export function isPcBuildComplete(pc: PcBuildState): boolean {
  return pc.cpu && pc.cooler && ramCount(pc) >= 2 && pc.m2 && pc.gpu && pc.psu;
}

/** Lists human-readable names of required PC build parts that are still missing. */
export function missingPcParts(pc: PcBuildState): string[] {
  const missing: string[] = [];
  if (!pc.cpu) missing.push('CPU');
  if (!pc.cooler) missing.push('CPU cooler');
  if (ramCount(pc) < 2) missing.push(ramCount(pc) === 0 ? '2 RAM sticks' : '1 more RAM stick');
  if (!pc.m2) missing.push('M.2 SSD');
  if (!pc.gpu) missing.push('Graphics card');
  if (!pc.psu) missing.push('Power supply');
  return missing;
}

/** Returns the active next build step needing action, or null when all parts are installed. */
export function currentPcHintStep(pc: PcBuildState): PcPartId | null {
  if (!pc.cpu) return 'cpu';
  if (!pc.cooler) return 'cooler';
  if (ramCount(pc) < 2) return 'ram';
  if (!pc.m2) return 'm2';
  if (!pc.gpu) return 'gpu';
  if (!pc.psu) return 'psu';
  return null;
}

/** Returns true if a hint was already purchased for the current incomplete step. */
export function isPcHintUsedForCurrentStep(pc: PcBuildState): boolean {
  const step = currentPcHintStep(pc);
  return step !== null && pc.hintedStep === step;
}

/** Returns true when at least one required build step remains and hasn't been hinted yet. */
export function hasNextPcHint(pc: PcBuildState): boolean {
  const step = currentPcHintStep(pc);
  return step !== null && pc.hintedStep !== step;
}

/** Next hint: points at the first step the learner hasn't finished. */
export function nextHint(pc: PcBuildState): PcBuildState {
  const bump = pc.hintTick + 1;
  const step = currentPcHintStep(pc);
  if (step === 'cpu') {
    return {
      ...pc,
      message: `Install the CPU. ${PC_HINTS.cpu}`,
      hintSlots: ['CPU'],
      hintTick: bump,
      hintedStep: step,
    };
  }
  if (step === 'cooler') {
    return {
      ...pc,
      message: `Mount the CPU cooler. ${PC_HINTS.cooler}`,
      hintSlots: ['COOLER'],
      hintTick: bump,
      hintedStep: step,
    };
  }
  if (step === 'ram') {
    return {
      ...pc,
      message: `Insert the RAM. ${PC_HINTS.ram} Use A2 and B2 for dual-channel.`,
      hintSlots: ['A2', 'B2'],
      hintTick: bump,
      hintedStep: step,
    };
  }
  if (step === 'm2') {
    return {
      ...pc,
      message: `Install the M.2 SSD. ${PC_HINTS.m2}`,
      hintSlots: ['M2'],
      hintTick: bump,
      hintedStep: step,
    };
  }
  if (step === 'gpu') {
    return {
      ...pc,
      message: `Install the graphics card. ${PC_HINTS.gpu}`,
      hintSlots: ['PCIE'],
      hintTick: bump,
      hintedStep: step,
    };
  }
  if (step === 'psu') {
    return {
      ...pc,
      message: `Connect the power cables. ${PC_HINTS.psu}`,
      hintSlots: ['PWR'],
      hintTick: bump,
      hintedStep: step,
    };
  }
  return { ...pc, message: 'All parts are installed. Press Check build.', hintSlots: [], hintedStep: null };
}

export interface PcBuildScore {
  accuracyPct: number;
  missedDualChannel: boolean;
  usedRamSlots: string;
}

export function scorePcBuild(pc: PcBuildState): PcBuildScore {
  const missedDualChannel = !(pc.ram.A2 && pc.ram.B2);
  const usedRamSlots = Object.keys(pc.ram).sort().join(' and ') || 'A1 and B1';
  const accuracyPct =
    pc.ok + pc.bad > 0
      ? Math.round((pc.ok / (pc.ok + pc.bad + (missedDualChannel ? 1 : 0))) * 100)
      : 0;
  return { accuracyPct, missedDualChannel, usedRamSlots };
}
