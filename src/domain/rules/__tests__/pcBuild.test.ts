import { describe, expect, it } from 'vitest';
import { createInitialPcState, nextHint, placePart, scorePcBuild, selectPart } from '../pcBuild';

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
    for (const [slot, part] of [['A1', 'ram'], ['B1', 'ram'], ['M2', 'm2'], ['PCIE', 'gpu'], ['PWR', 'psu']] as const) {
      s = placePart(s, slot, part).state;
    }
    expect(scorePcBuild(s)).toEqual({ accuracyPct: 83, missedDualChannel: true, usedRamSlots: 'A1 and B1' });

    let d = createInitialPcState();
    for (const [slot, part] of [['A2', 'ram'], ['B2', 'ram'], ['M2', 'm2'], ['PCIE', 'gpu'], ['PWR', 'psu']] as const) {
      d = placePart(d, slot, part).state;
    }
    expect(scorePcBuild(d).accuracyPct).toBe(100);
  });

  it('hints walk through the steps in order', () => {
    let s = createInitialPcState();
    expect(nextHint(s).hintSlots).toEqual(['A2', 'B2']);
    s = placePart(placePart(s, 'A2', 'ram').state, 'B2', 'ram').state;
    expect(nextHint(s).hintSlots).toEqual(['M2']);
  });
});
