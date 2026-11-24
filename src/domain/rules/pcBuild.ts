import type { PcBuildState, PcPartId, PcSlotId } from '../../types/streakbyte';

export const PC_SLOT_TO_PART: Record<PcSlotId, PcPartId> = {
  A1: 'ram',
  A2: 'ram',
  B1: 'ram',
  B2: 'ram',
  M2: 'm2',
  PCIE: 'gpu',
  PWR: 'psu',
};

export const PC_HINTS: Record<PcPartId, string> = {
  ram: 'RAM goes in the memory slots, the four tall slots at the top.',
  m2: 'The M.2 SSD goes in the M.2 slot under the CPU.',
  gpu: 'The graphics card goes in the long PCIe x16 slot.',
  psu: 'Power connects at the 24-pin connector on the right.',
};

export const PC_SUCCESS_COPY: Record<PcPartId, string> = {
  ram: 'RAM seated. Match the notch and press until the clips click.',
  m2: 'M.2 SSD installed and secured.',
  gpu: 'Graphics card seated in the PCIe x16 slot.',
  psu: '24-pin power cable connected.',
};

const RAM_SLOTS = ['A1', 'A2', 'B1', 'B2'] as const;

export function createInitialPcState(): PcBuildState {
  return {
    selectedPart: null,
    ram: {},
    m2: false,
    gpu: false,
    psu: false,
    ok: 0,
    bad: 0,
    message: 'Select a part in the tray, then tap its slot on the board.',
    hintSlots: [],
    hintTick: 0,
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

  if (want === 'ram' && ramCount(pc) >= 2) {
    return {
      placed: false,
      state: { ...pc, selectedPart: null, message: 'Both RAM sticks are already installed.' },
    };
  }

  const nextRam = isRamSlot ? { ...pc.ram, [slotId]: true } : pc.ram;
  const nextM2 = want === 'm2' ? true : pc.m2;
  const nextGpu = want === 'gpu' ? true : pc.gpu;
  const nextPsu = want === 'psu' ? true : pc.psu;

  const partExhausted =
    (want === 'ram' && Object.keys(nextRam).length >= 2) ||
    (want === 'm2' && nextM2) ||
    (want === 'gpu' && nextGpu) ||
    (want === 'psu' && nextPsu);

  return {
    placed: true,
    state: {
      ...pc,
      ram: nextRam,
      m2: nextM2,
      gpu: nextGpu,
      psu: nextPsu,
      ok: pc.ok + 1,
      selectedPart: partExhausted && pc.selectedPart === want ? null : pc.selectedPart,
      message: PC_SUCCESS_COPY[want],
    },
  };
}

/** Next hint: points at the first step the learner hasn't finished. */
export function nextHint(pc: PcBuildState): PcBuildState {
  const bump = pc.hintTick + 1;
  if (ramCount(pc) < 2) {
    return {
      ...pc,
      message: `Insert the RAM. ${PC_HINTS.ram} Use A2 and B2 for dual-channel.`,
      hintSlots: ['A2', 'B2'],
      hintTick: bump,
    };
  }
  if (!pc.m2) {
    return { ...pc, message: `Install the M.2 SSD. ${PC_HINTS.m2}`, hintSlots: ['M2'], hintTick: bump };
  }
  if (!pc.gpu) {
    return { ...pc, message: `Install the graphics card. ${PC_HINTS.gpu}`, hintSlots: ['PCIE'], hintTick: bump };
  }
  if (!pc.psu) {
    return { ...pc, message: `Connect the power cables. ${PC_HINTS.psu}`, hintSlots: ['PWR'], hintTick: bump };
  }
  return { ...pc, message: 'All parts are installed. Press Check build.', hintSlots: [] };
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
      : 80;
  return { accuracyPct, missedDualChannel, usedRamSlots };
}
