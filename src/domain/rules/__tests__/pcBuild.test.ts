import { describe, expect, it } from 'vitest';
import {
  createInitialPcState,
  hasNextPcHint,
  installedPcPartsCount,
  isPcBuildComplete,
  isPcHintUsedForCurrentStep,
  missingPcParts,
  nextHint,
  placePart,
  scorePcBuild,
  selectPart,
  TOTAL_PC_PARTS,
} from '../pcBuild';

describe('pcBuild rules', () => {
  it('rejects a part in the wrong slot and counts a mistake', () => {
    const { state, placed } = placePart(createInitialPcState(), 'A1', 'gpu');
    expect(placed).toBe(false);
    expect(state.bad).toBe(1);
    expect(state.message).toContain('PCIe x16');
  });

  it('asks for a part when none is selected', () => {
    const { state, placed } = placePart(createInitialPcState(), 'M2');
    expect(placed).toBe(false);
    expect(state.bad).toBe(0);
  });

  it('uses the selected part when none is dragged', () => {
    const selected = selectPart(createInitialPcState(), 'm2');
    const { state, placed } = placePart(selected, 'M2');
    expect(placed).toBe(true);
    expect(state.m2).toBe(true);
    expect(state.selectedPart).toBeNull();
  });

  it('requires CPU to be installed before mounting the CPU cooler', () => {
    const { state, placed } = placePart(createInitialPcState(), 'COOLER', 'cooler');
    expect(placed).toBe(false);
    expect(state.bad).toBe(1);
    expect(state.message).toMatch(/Install the CPU/i);

    const withCpu = placePart(createInitialPcState(), 'CPU', 'cpu').state;
    expect(withCpu.cpu).toBe(true);
    const withCooler = placePart(withCpu, 'COOLER', 'cooler');
    expect(withCooler.placed).toBe(true);
    expect(withCooler.state.cooler).toBe(true);
  });

  it('blocks a filled slot and a third RAM stick', () => {
    let s = createInitialPcState();
    s = placePart(s, 'A1', 'ram').state;
    const dup = placePart(s, 'A1', 'ram');
    expect(dup.placed).toBe(false);
    expect(dup.state.message).toBe('That slot already has a part installed.');
    s = placePart(s, 'B1', 'ram').state;
    const third = placePart(s, 'A2', 'ram');
    expect(third.placed).toBe(false);
    expect(third.state.message).toBe('Both RAM sticks are already installed.');
  });

  it('scores dual-channel correctly', () => {
    let s = createInitialPcState();
    for (const [slot, part] of [
      ['CPU', 'cpu'],
      ['COOLER', 'cooler'],
      ['A1', 'ram'],
      ['B1', 'ram'],
      ['M2', 'm2'],
      ['PCIE', 'gpu'],
      ['PWR', 'psu'],
    ] as const) {
      s = placePart(s, slot, part).state;
    }
    expect(scorePcBuild(s)).toEqual({ accuracyPct: 88, missedDualChannel: true, usedRamSlots: 'A1 and B1' });

    let d = createInitialPcState();
    for (const [slot, part] of [
      ['CPU', 'cpu'],
      ['COOLER', 'cooler'],
      ['A2', 'ram'],
      ['B2', 'ram'],
      ['M2', 'm2'],
      ['PCIE', 'gpu'],
      ['PWR', 'psu'],
    ] as const) {
      d = placePart(d, slot, part).state;
    }
    expect(scorePcBuild(d).accuracyPct).toBe(100);
  });

  it('hints walk through the steps in order', () => {
    let s = createInitialPcState();
    expect(nextHint(s).hintSlots).toEqual(['CPU']);
    s = placePart(s, 'CPU', 'cpu').state;
    expect(nextHint(s).hintSlots).toEqual(['COOLER']);
    s = placePart(s, 'COOLER', 'cooler').state;
    expect(nextHint(s).hintSlots).toEqual(['A2', 'B2']);
    s = placePart(placePart(s, 'A2', 'ram').state, 'B2', 'ram').state;
    expect(nextHint(s).hintSlots).toEqual(['M2']);
  });

  it('tracks installed parts, missing parts, completeness, and scores 0 on empty build', () => {
    const empty = createInitialPcState();
    expect(installedPcPartsCount(empty)).toBe(0);
    expect(isPcBuildComplete(empty)).toBe(false);
    expect(missingPcParts(empty)).toEqual([
      'CPU',
      'CPU cooler',
      '2 RAM sticks',
      'M.2 SSD',
      'Graphics card',
      'Power supply',
    ]);
    expect(scorePcBuild(empty).accuracyPct).toBe(0);

    let full = empty;
    for (const [slot, part] of [
      ['CPU', 'cpu'],
      ['COOLER', 'cooler'],
      ['A2', 'ram'],
      ['B2', 'ram'],
      ['M2', 'm2'],
      ['PCIE', 'gpu'],
      ['PWR', 'psu'],
    ] as const) {
      full = placePart(full, slot, part).state;
    }
    expect(installedPcPartsCount(full)).toBe(TOTAL_PC_PARTS);
    expect(isPcBuildComplete(full)).toBe(true);
    expect(missingPcParts(full)).toEqual([]);
  });

  it('locks the hint for the active step until the learner moves to the next step', () => {
    let s = createInitialPcState();
    expect(hasNextPcHint(s)).toBe(true);
    expect(isPcHintUsedForCurrentStep(s)).toBe(false);

    s = nextHint(s);
    expect(s.hintedStep).toBe('cpu');
    expect(isPcHintUsedForCurrentStep(s)).toBe(true);
    expect(hasNextPcHint(s)).toBe(false);

    // Completing CPU unlocks the cooler step hint
    s = placePart(s, 'CPU', 'cpu').state;
    expect(s.hintedStep).toBeNull();
    expect(isPcHintUsedForCurrentStep(s)).toBe(false);
    expect(hasNextPcHint(s)).toBe(true);

    // Multi-stick RAM step keeps hint marked used until both sticks are placed
    s = placePart(s, 'COOLER', 'cooler').state;
    s = nextHint(s);
    expect(s.hintedStep).toBe('ram');
    expect(isPcHintUsedForCurrentStep(s)).toBe(true);

    s = placePart(s, 'A2', 'ram').state;
    expect(s.hintedStep).toBe('ram');
    expect(isPcHintUsedForCurrentStep(s)).toBe(true);

    s = placePart(s, 'B2', 'ram').state;
    expect(s.hintedStep).toBeNull();
    expect(isPcHintUsedForCurrentStep(s)).toBe(false);
    expect(hasNextPcHint(s)).toBe(true);
  });
});
