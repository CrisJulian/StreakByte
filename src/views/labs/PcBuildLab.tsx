import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CornerBrackets } from '../../components/ByteMascotSvg';
import { Icon } from '../../components/Icon';
import { LESSON_XP_BY_KEY } from '../../data/curriculum';
import {
  hasNextPcHint,
  installedPcPartsCount,
  isPcHintUsedForCurrentStep,
  TOTAL_PC_PARTS,
} from '../../domain/rules/pcBuild';
import { calculateTotalXp, LAB_HINT_COST_XP } from '../../domain/rules/xp';
import { useStreakByteStore } from '../../store/useStreakByteStore';
import type { PcPartId, PcSlotId } from '../../types/streakbyte';

const pointerFirstCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  return pointerHits.length > 0 ? pointerHits : rectIntersection(args);
};

interface PcStep {
  label: string;
  done: boolean;
}

const PART_META: { id: PcPartId; swatch: string; label: string }[] = [
  { id: 'cpu', swatch: '#38bdf8', label: 'CPU' },
  { id: 'cooler', swatch: '#cbd5e1', label: 'CPU cooler' },
  { id: 'ram', swatch: '#129954', label: 'RAM stick' },
  { id: 'm2', swatch: '#e5e5e5', label: 'M.2 SSD' },
  { id: 'gpu', swatch: '#9e9e9e', label: 'Graphics card' },
  { id: 'psu', swatch: '#22d3ee', label: 'Power supply' },
];

interface DraggablePartButtonProps {
  partId: PcPartId;
  swatch: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function DraggablePartButton({
  partId,
  swatch,
  label,
  selected,
  disabled,
  onSelect,
}: DraggablePartButtonProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pc-part-${partId}`,
    data: { partId },
    disabled,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      disabled={disabled}
      {...attributes}
      {...listeners}
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex items-center gap-2 min-h-9 px-2.5 border font-bold text-[11px] text-left cursor-pointer transition-colors touch-none ${disabled ? 'opacity-45 cursor-not-allowed pointer-events-none' : ''
        } ${isDragging ? 'opacity-40' : ''} ${selected
          ? 'border-cyan bg-you text-ink'
          : 'border-line bg-panel hover:border-ink hover:bg-panel2'
        }`}
    >
      <i
        className="w-[18px] h-3 flex-none border border-ink/50"
        style={{ background: swatch }}
      />
      <span>{label}</span>
    </button>
  );
}

interface DroppableSlotProps {
  slotId: PcSlotId;
  ariaLabel: string;
  filledPart: PcPartId | null;
  hinted: boolean;
  hintTick: number;
  onActivate: () => void;
  children: ReactNode;
}

function DroppableSlot({
  slotId,
  ariaLabel,
  filledPart,
  hinted,
  hintTick,
  onActivate,
  children,
}: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `pc-slot-${slotId}`,
    data: { slotId },
  });

  const classes = [
    'slot',
    filledPart ? 'filled' : '',
    isOver && !filledPart ? 'over' : '',
    hinted ? 'hint' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g
      key={hinted ? `${slotId}-${hintTick}` : slotId}
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      className={classes}
      data-slot={slotId}
      data-part={filledPart ?? undefined}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate();
        }
      }}
    >
      {children}
    </g>
  );
}

interface StepBadgeProps {
  cx: number;
  cy: number;
  num: number;
  done: boolean;
}

function StepBadge({ cx, cy, num, done }: StepBadgeProps) {
  return (
    <g className={`badge ${done ? 'done' : ''}`} pointerEvents="none">
      <circle cx={cx} cy={cy} r={12} />
      {done ? (
        <path d={`m${cx - 6} ${cy} 4 4 8-8`} />
      ) : (
        <text x={cx} y={cy + 5}>
          {num}
        </text>
      )}
    </g>
  );
}

export function PcBuildLab() {
  const pc = useStreakByteStore((s) => s.pc);
  const labSessionMode = useStreakByteStore((s) => s.labSessionMode);
  const labTimedOut = useStreakByteStore((s) => s.labTimedOut);
  const completions = useStreakByteStore((s) => s.completions);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const xpSpent = useStreakByteStore((s) => s.xpSpent);
  const selectPcPart = useStreakByteStore((s) => s.selectPcPart);
  const placePcPart = useStreakByteStore((s) => s.placePcPart);
  const triggerPcHint = useStreakByteStore((s) => s.triggerPcHint);
  const completePcBuild = useStreakByteStore((s) => s.completePcBuild);
  const [draggingPart, setDraggingPart] = useState<PcPartId | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const ramCount = Object.keys(pc.ram).length;
  const ramLeft = 2 - ramCount;
  const installedCount = installedPcPartsCount(pc);
  const allInstalled = installedCount === TOTAL_PC_PARTS;

  const steps: PcStep[] = [
    { label: 'Install CPU', done: pc.cpu },
    { label: 'Mount cooler', done: pc.cooler },
    { label: 'Insert RAM', done: ramCount >= 2 },
    { label: 'Install M.2 SSD', done: pc.m2 },
    { label: 'Install GPU', done: pc.gpu },
    { label: 'Connect power', done: pc.psu },
  ];

  const firstUndoneIdx = steps.findIndex((s) => !s.done);

  const handleDragStart = (event: DragStartEvent) => {
    const partId = event.active.data.current?.partId as PcPartId | undefined;
    if (partId) {
      setDraggingPart(partId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const partId = event.active.data.current?.partId as PcPartId | undefined;
    const slotId = event.over?.data.current?.slotId as PcSlotId | undefined;
    setDraggingPart(null);
    if (partId && slotId) {
      placePcPart(slotId, partId);
    }
  };

  const draggingMeta = draggingPart ? PART_META.find((p) => p.id === draggingPart) : null;
  const availableXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp, xpSpent);
  const hintUsedForStep = isPcHintUsedForCurrentStep(pc);
  const hasHint = hasNextPcHint(pc);
  const notEnoughXp = availableXp < LAB_HINT_COST_XP;
  const hintDisabled =
    labTimedOut || labSessionMode === 'timed' || allInstalled || hintUsedForStep || notEnoughXp;
  const hintTitle = labTimedOut
    ? 'Time is up'
    : labSessionMode === 'timed'
      ? 'Hints are disabled in Timed mode'
      : allInstalled
        ? 'All parts are already installed'
        : hintUsedForStep
          ? 'Hint already unlocked for this step — complete this step to unlock the next hint'
          : !hasHint || notEnoughXp
            ? `Need ${LAB_HINT_COST_XP} XP to buy a hint (you have ${availableXp} XP)`
            : `Buy next-step hint for ${LAB_HINT_COST_XP} XP`;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerFirstCollision}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingPart(null)}
    >
      <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] max-[1100px]:grid-cols-1 gap-3.5 items-start">
        <section
          aria-label="Build a PC"
          className="relative sb-blueprint-dots border border-line p-3.5"
        >
          <CornerBrackets />
          <div className="flex justify-between items-center gap-3 flex-wrap mb-2">
            <h2 className="m-0 font-head text-[16px] font-bold">Build a PC</h2>
            <span className="text-muted text-[11px]">
              Drag a part onto the board, or select it in the tray and tap a slot.
            </span>
          </div>

          <svg
            className="pcb"
            viewBox="0 0 640 440"
            role="group"
            aria-label="Motherboard with slots for CPU, cooler, RAM, M.2 SSD, graphics card and power"
          >
            <rect className="bd" x="8" y="8" width="624" height="424" />
            <circle className="hole" cx="30" cy="30" r="8" />
            <circle className="hole" cx="610" cy="30" r="8" />
            <circle className="hole" cx="30" cy="410" r="8" />
            <circle className="hole" cx="610" cy="410" r="8" />

            <rect
              x="48"
              y="54"
              width="76"
              height="114"
              fill="#dfdfdf"
              stroke="#0c0c0c"
              strokeWidth="1.5"
            />
            <g stroke="#666666" strokeWidth="1.5">
              <path d="M52 72h68M52 90h68M52 108h68M52 126h68M52 144h68" />
            </g>
            <text className="lab" x="86" y="186">
              Rear I/O
            </text>

            <rect className="part" x="136" y="54" width="16" height="114" />
            <text className="lab" x="144" y="186">
              VRM
            </text>

            {!pc.cpu ? (
              <>
                <DroppableSlot
                  slotId="CPU"
                  ariaLabel="CPU socket"
                  filledPart={null}
                  hinted={pc.hintSlots.includes('CPU')}
                  hintTick={pc.hintTick}
                  onActivate={() => placePcPart('CPU')}
                >
                  <rect className="sh" x="168" y="44" width="150" height="134" />
                  <g fill="#22d3ee" stroke="none" opacity="0.45">
                    {[68, 86, 104, 122, 140, 158].flatMap((cy) =>
                      [194, 214, 234, 254, 274, 294].map((cx) => (
                        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2} />
                      )),
                    )}
                  </g>
                  <polygon points="178,168 190,168 178,156" fill="#22d3ee" />
                </DroppableSlot>
                <StepBadge cx={188} cy={64} num={1} done={false} />
                <text className="lab" x="243" y="198">
                  CPU socket
                </text>
              </>
            ) : !pc.cooler ? (
              <>
                <DroppableSlot
                  slotId="COOLER"
                  ariaLabel="CPU cooler mount"
                  filledPart={null}
                  hinted={pc.hintSlots.includes('COOLER')}
                  hintTick={pc.hintTick}
                  onActivate={() => placePcPart('COOLER')}
                >
                  <rect className="sh" x="168" y="44" width="150" height="134" />
                  <rect
                    x="193"
                    y="61"
                    width="100"
                    height="100"
                    fill="#38bdf8"
                    stroke="#0b1020"
                    strokeWidth="2"
                  />
                  <rect
                    x="208"
                    y="76"
                    width="70"
                    height="70"
                    fill="#cbd5e1"
                    stroke="#0b1020"
                    strokeWidth="1.5"
                  />
                </DroppableSlot>
                <StepBadge cx={188} cy={64} num={2} done={false} />
                <text className="lab" x="243" y="198">
                  Mount CPU cooler
                </text>
              </>
            ) : (
              <>
                <rect
                  x="168"
                  y="44"
                  width="150"
                  height="134"
                  fill="#f3f3f3"
                  stroke="#0c0c0c"
                  strokeWidth="1.5"
                />
                <g transform="translate(243 111)">
                  <circle r="48" fill="#ffffff" stroke="var(--dark-card)" strokeWidth="1.5" />
                  <g fill="var(--cyan)" stroke="var(--dark-card)" strokeWidth="1.2">
                    <path d="M0 0C-8-24 8-40 22-34 22-14 12-4 0 0z" />
                    <path d="M0 0C24-8 40 8 34 22 14 22 4 12 0 0z" />
                    <path d="M0 0C8 24-8 40-22 34-22 14-12 4 0 0z" />
                    <path d="M0 0C-24 8-40-8-34-22-14-22-4-12 0 0z" />
                  </g>
                  <circle r="10" fill="var(--dark-card)" />
                </g>
                <StepBadge cx={188} cy={64} num={2} done />
                <text className="lab" x="243" y="198">
                  CPU + cooler
                </text>
              </>
            )}

            <DroppableSlot
              slotId="A1"
              ariaLabel="RAM slot A1"
              filledPart={pc.ram.A1 ? 'ram' : null}
              hinted={pc.hintSlots.includes('A1')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('A1')}
            >
              <rect className="sh" x="344" y="44" width="22" height="134" />
            </DroppableSlot>
            <DroppableSlot
              slotId="A2"
              ariaLabel="RAM slot A2"
              filledPart={pc.ram.A2 ? 'ram' : null}
              hinted={pc.hintSlots.includes('A2')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('A2')}
            >
              <rect className="sh" x="376" y="44" width="22" height="134" />
            </DroppableSlot>
            <DroppableSlot
              slotId="B1"
              ariaLabel="RAM slot B1"
              filledPart={pc.ram.B1 ? 'ram' : null}
              hinted={pc.hintSlots.includes('B1')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('B1')}
            >
              <rect className="sh" x="408" y="44" width="22" height="134" />
            </DroppableSlot>
            <DroppableSlot
              slotId="B2"
              ariaLabel="RAM slot B2"
              filledPart={pc.ram.B2 ? 'ram' : null}
              hinted={pc.hintSlots.includes('B2')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('B2')}
            >
              <rect className="sh" x="440" y="44" width="22" height="134" />
            </DroppableSlot>

            <text className="lab" x="355" y="194">
              A1
            </text>
            <text className="lab" x="387" y="194">
              A2
            </text>
            <text className="lab" x="419" y="194">
              B1
            </text>
            <text className="lab" x="451" y="194">
              B2
            </text>
            <text className="lab" x="403" y="214">
              RAM slots (DIMM)
            </text>
            <StepBadge cx={387} cy={28} num={3} done={ramCount >= 2} />

            <DroppableSlot
              slotId="PWR"
              ariaLabel="24-pin power connector"
              filledPart={pc.psu ? 'psu' : null}
              hinted={pc.hintSlots.includes('PWR')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('PWR')}
            >
              <rect className="sh" x="500" y="56" width="92" height="106" />
              <g fill="#f4f7ef" stroke="none" opacity="0.65">
                {[76, 96, 116, 136].flatMap((cy) =>
                  [520, 538, 556, 574].map((cx) => (
                    <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} />
                  )),
                )}
              </g>
            </DroppableSlot>
            <text className="lab" x="546" y="182">
              24-pin power
            </text>
            <StepBadge cx={500} cy={54} num={6} done={pc.psu} />

            <DroppableSlot
              slotId="M2"
              ariaLabel="M.2 SSD slot"
              filledPart={pc.m2 ? 'm2' : null}
              hinted={pc.hintSlots.includes('M2')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('M2')}
            >
              <rect className="sh" x="130" y="254" width="210" height="24" />
              <circle cx="142" cy="266" r="4" fill="var(--cyan)" />
            </DroppableSlot>
            <StepBadge cx={240} cy={266} num={4} done={pc.m2} />
            <text className="lab" x="185" y="298">
              M.2 slot (SSD)
            </text>

            <rect className="part" x="424" y="246" width="104" height="88" />
            <g stroke="#555555" strokeWidth="2">
              <path d="M436 254v72M448 254v72M460 254v72M472 254v72M484 254v72M496 254v72M508 254v72M520 254v72" />
            </g>
            <text className="lab" x="476" y="354">
              Chipset
            </text>

            <DroppableSlot
              slotId="PCIE"
              ariaLabel="PCIe x16 graphics card slot"
              filledPart={pc.gpu ? 'gpu' : null}
              hinted={pc.hintSlots.includes('PCIE')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('PCIE')}
            >
              <rect className="sh" x="48" y="336" width="320" height="22" />
            </DroppableSlot>
            <StepBadge cx={208} cy={347} num={5} done={pc.gpu} />
            <text className="lab" x="115" y="378">
              PCIe x16 (graphics card)
            </text>

            <circle cx="268" cy="396" r="15" fill="#dfdfdf" stroke="#0c0c0c" strokeWidth="1.5" />
            <text className="lab" x="332" y="401">
              CMOS battery
            </text>

            <rect className="part" x="424" y="374" width="36" height="14" />
            <rect className="part" x="468" y="374" width="36" height="14" />
            <text className="lab" x="444" y="408">
              SATA
            </text>
          </svg>
          {allInstalled && (
            <div
              role="status"
              className="sb-pop mt-3 px-3.5 py-2 border border-green bg-panel text-green font-mono text-xs font-bold flex items-center justify-between gap-2 flex-wrap"
            >
              <span>
                POST READY · Dual-channel {pc.ram.A2 && pc.ram.B2 ? 'OK (A2/B2)' : 'SINGLE'}
              </span>
              <span>Press Check build to boot</span>
            </div>
          )}
        </section>

        <div className="grid gap-2.5">
          <section aria-label="Build checklist" className="bg-panel border border-line p-3.5">
            <h2 className="m-0 font-head text-[15px] font-bold">Build checklist</h2>
            <ol className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-2">
              {steps.map((step, idx) => {
                const isCur = idx === firstUndoneIdx;
                return (
                  <li
                    key={step.label}
                    className={`flex items-center gap-2 font-semibold text-[11px] ${step.done || isCur ? 'text-ink' : 'text-muted'
                      }`}
                  >
                    <span
                      className={`grid place-items-center w-5 h-5 border font-bold text-[10px] font-mono flex-none ${step.done
                          ? 'bg-green border-green text-green-ink'
                          : isCur
                            ? 'bg-cyan border-cyan text-cyan-ink'
                            : 'bg-panel2 border-line text-muted'
                        }`}
                    >
                      {step.done ? (
                        <Icon name="check" className="w-3 h-3" strokeWidth={3} />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    <span className="truncate">{step.label}</span>
                  </li>
                );
              })}
            </ol>
          </section>

          <p
            role="status"
            className="min-h-9 flex items-center m-0 px-3 py-2 bg-panel2 border border-line text-[11.5px] text-ink"
          >
            {pc.message}
          </p>

          <div role="group" aria-label="Parts tray" className="grid grid-cols-2 gap-1.5">
            <DraggablePartButton
              partId="cpu"
              swatch="#38bdf8"
              label={pc.cpu ? 'CPU installed' : 'CPU'}
              selected={pc.selectedPart === 'cpu'}
              disabled={pc.cpu || labTimedOut}
              onSelect={() => selectPcPart('cpu')}
            />
            <DraggablePartButton
              partId="cooler"
              swatch="#cbd5e1"
              label={pc.cooler ? 'Cooler installed' : 'CPU cooler'}
              selected={pc.selectedPart === 'cooler'}
              disabled={pc.cooler || labTimedOut}
              onSelect={() => selectPcPart('cooler')}
            />
            <DraggablePartButton
              partId="ram"
              swatch="#129954"
              label={ramLeft > 0 ? `RAM stick ${ramLeft}x` : 'RAM installed'}
              selected={pc.selectedPart === 'ram'}
              disabled={ramLeft <= 0 || labTimedOut}
              onSelect={() => selectPcPart('ram')}
            />
            <DraggablePartButton
              partId="m2"
              swatch="#e5e5e5"
              label={pc.m2 ? 'M.2 installed' : 'M.2 SSD'}
              selected={pc.selectedPart === 'm2'}
              disabled={pc.m2 || labTimedOut}
              onSelect={() => selectPcPart('m2')}
            />
            <DraggablePartButton
              partId="gpu"
              swatch="#9e9e9e"
              label={pc.gpu ? 'GPU installed' : 'Graphics card'}
              selected={pc.selectedPart === 'gpu'}
              disabled={pc.gpu || labTimedOut}
              onSelect={() => selectPcPart('gpu')}
            />
            <DraggablePartButton
              partId="psu"
              swatch="#22d3ee"
              label={pc.psu ? 'Power installed' : 'Power supply'}
              selected={pc.selectedPart === 'psu'}
              disabled={pc.psu || labTimedOut}
              onSelect={() => selectPcPart('psu')}
            />
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-2">
            <button
              type="button"
              disabled={hintDisabled}
              onClick={triggerPcHint}
              title={hintTitle}
              className="inline-flex items-center justify-center gap-1.5 min-h-10 px-3.5 border border-line bg-panel text-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:border-ink hover:bg-panel2 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <Icon name="bulb" className="w-4 h-4" />
              {hintUsedForStep ? 'Hint used' : `Hint · ${LAB_HINT_COST_XP} XP`}
            </button>
            <button
              type="button"
              disabled={labTimedOut}
              onClick={completePcBuild}
              className="sb-cut inline-flex items-center justify-center gap-2 min-h-10 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:brightness-110 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              {allInstalled ? 'Check build' : `Check build (${installedCount}/${TOTAL_PC_PARTS})`}
            </button>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingMeta ? (
          <div className="flex items-center gap-2.5 min-h-11 px-3.5 border-2 border-cyan bg-panel text-ink font-bold text-xs shadow-xl">
            <i
              className="w-[18px] h-3 flex-none border border-ink/50"
              style={{ background: draggingMeta.swatch }}
            />
            <span>{draggingMeta.label}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
