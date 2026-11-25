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
import { Icon } from '../../components/Icon';
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
  { id: 'ram', swatch: '#34d399', label: 'RAM stick' },
  { id: 'm2', swatch: '#cbd5e1', label: 'M.2 SSD' },
  { id: 'gpu', swatch: '#94a3b8', label: 'Graphics card' },
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
      className={`flex items-center gap-2.5 min-h-12 px-3 border rounded-xl font-semibold text-sm text-left cursor-pointer transition-colors touch-none ${
        disabled ? 'opacity-45 cursor-not-allowed pointer-events-none' : ''
      } ${isDragging ? 'opacity-40' : ''} ${
        selected
          ? 'border-cyan'
          : 'border-line bg-panel hover:border-muted hover:bg-panel2'
      }`}
      style={
        selected
          ? { background: 'color-mix(in srgb, var(--cyan) 14%, var(--panel))' }
          : undefined
      }
    >
      <i
        className="w-[22px] h-3.5 rounded-[3px] flex-none border border-black/35"
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
  const allInstalled = ramCount >= 2 && pc.m2 && pc.gpu && pc.psu;

  const steps: PcStep[] = [
    { label: 'Install the CPU', done: true },
    { label: 'Mount the CPU cooler', done: true },
    { label: 'Insert the RAM', done: ramCount >= 2 },
    { label: 'Install the M.2 SSD', done: pc.m2 },
    { label: 'Install the graphics card', done: pc.gpu },
    { label: 'Connect the power cables', done: pc.psu },
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerFirstCollision}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingPart(null)}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_380px] max-[1100px]:grid-cols-1 gap-5 items-start">
        <section
          aria-label="Partly built PC"
          className="bg-panel border border-line rounded-2xl p-4"
        >
          <div className="flex justify-between items-center gap-3 flex-wrap mb-3">
            <h2 className="m-0 text-base font-bold">Partly built PC</h2>
            <span className="text-muted text-sm">
              Drag a part onto the board, or select it in the tray and tap a slot.
            </span>
          </div>

          <svg
            className="pcb"
            viewBox="0 0 640 440"
            role="group"
            aria-label="Motherboard with slots for RAM, M.2 SSD, graphics card and power"
          >
            <rect className="bd" x="8" y="8" width="624" height="424" rx="14" />
            <circle className="hole" cx="30" cy="30" r="8" />
            <circle className="hole" cx="610" cy="30" r="8" />
            <circle className="hole" cx="30" cy="410" r="8" />
            <circle className="hole" cx="610" cy="410" r="8" />

            <rect
              x="48"
              y="54"
              width="76"
              height="114"
              rx="4"
              fill="#cbd5e1"
              stroke="#0b1020"
              strokeWidth="1.5"
            />
            <g stroke="#64748b" strokeWidth="1.5">
              <path d="M52 72h68M52 90h68M52 108h68M52 126h68M52 144h68" />
            </g>
            <text className="lab" x="86" y="186">
              Rear I/O
            </text>

            <rect className="part" x="136" y="54" width="16" height="114" rx="2" />
            <text className="lab" x="144" y="186">
              VRM
            </text>

            <rect
              x="168"
              y="44"
              width="150"
              height="134"
              rx="12"
              fill="#eef2ec"
              stroke="#0b1020"
              strokeWidth="1.5"
            />
            <g transform="translate(243 111)">
              <circle r="48" fill="#ffffff" stroke="#0b1020" strokeWidth="1.5" />
              <g fill="#34a371" stroke="#0b1020" strokeWidth="1.2">
                <path d="M0 0C-8-24 8-40 22-34 22-14 12-4 0 0z" />
                <path d="M0 0C24-8 40 8 34 22 14 22 4 12 0 0z" />
                <path d="M0 0C8 24-8 40-22 34-22 14-12 4 0 0z" />
                <path d="M0 0C-24 8-40-8-34-22-14-22-4-12 0 0z" />
              </g>
              <circle r="10" fill="#1e7a56" />
            </g>
            <StepBadge cx={188} cy={64} num={1} done />
            <text className="lab" x="243" y="198">
              CPU + cooler (done)
            </text>

            <DroppableSlot
              slotId="A1"
              ariaLabel="RAM slot A1"
              filledPart={pc.ram.A1 ? 'ram' : null}
              hinted={pc.hintSlots.includes('A1')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('A1')}
            >
              <rect className="sh" x="344" y="44" width="22" height="134" rx="3" />
            </DroppableSlot>
            <DroppableSlot
              slotId="A2"
              ariaLabel="RAM slot A2"
              filledPart={pc.ram.A2 ? 'ram' : null}
              hinted={pc.hintSlots.includes('A2')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('A2')}
            >
              <rect className="sh" x="376" y="44" width="22" height="134" rx="3" />
            </DroppableSlot>
            <DroppableSlot
              slotId="B1"
              ariaLabel="RAM slot B1"
              filledPart={pc.ram.B1 ? 'ram' : null}
              hinted={pc.hintSlots.includes('B1')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('B1')}
            >
              <rect className="sh" x="408" y="44" width="22" height="134" rx="3" />
            </DroppableSlot>
            <DroppableSlot
              slotId="B2"
              ariaLabel="RAM slot B2"
              filledPart={pc.ram.B2 ? 'ram' : null}
              hinted={pc.hintSlots.includes('B2')}
              hintTick={pc.hintTick}
              onActivate={() => placePcPart('B2')}
            >
              <rect className="sh" x="440" y="44" width="22" height="134" rx="3" />
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
              <rect className="sh" x="500" y="56" width="92" height="106" rx="4" />
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
              <rect className="sh" x="130" y="254" width="210" height="24" rx="3" />
              <circle cx="142" cy="266" r="4" fill="#22d3ee" />
            </DroppableSlot>
            <StepBadge cx={240} cy={266} num={4} done={pc.m2} />
            <text className="lab" x="185" y="298">
              M.2 slot (SSD)
            </text>

            <rect className="part" x="424" y="246" width="104" height="88" rx="3" />
            <g stroke="#334155" strokeWidth="2">
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
              <rect className="sh" x="48" y="336" width="320" height="22" rx="3" />
            </DroppableSlot>
            <StepBadge cx={208} cy={347} num={5} done={pc.gpu} />
            <text className="lab" x="115" y="378">
              PCIe x16 (graphics card)
            </text>

            <circle
              cx="268"
              cy="396"
              r="15"
              fill="#d6dbd2"
              stroke="#0b1020"
              strokeWidth="1.5"
            />
            <text className="lab" x="332" y="401">
              CMOS battery
            </text>

            <rect className="part" x="424" y="374" width="36" height="14" rx="2" />
            <rect className="part" x="468" y="374" width="36" height="14" rx="2" />
            <text className="lab" x="444" y="408">
              SATA
            </text>
          </svg>
          {allInstalled && (
            <div
              role="status"
              className="sb-pop mt-3 px-3.5 py-2 rounded-xl border border-green bg-bg text-green font-mono text-xs font-bold flex items-center justify-between gap-2 flex-wrap"
            >
              <span>
                POST READY · Dual-channel {pc.ram.A2 && pc.ram.B2 ? 'OK (A2/B2)' : 'SINGLE'}
              </span>
              <span>Press Check build to boot</span>
            </div>
          )}
        </section>

        <div className="grid gap-4">
          <section aria-label="Build checklist" className="bg-panel border border-line rounded-2xl p-[22px]">
            <h2 className="m-0 mb-1 text-[1.125rem] font-bold">Build checklist</h2>
            <ol className="grid gap-2.5 mt-3">
              {steps.map((step, idx) => {
                const isCur = idx === firstUndoneIdx;
                return (
                  <li
                    key={step.label}
                    className={`flex items-center gap-2.5 font-semibold ${
                      step.done || isCur ? 'text-ink' : 'text-muted'
                    }`}
                  >
                    <span
                      className={`grid place-items-center w-6 h-6 rounded-full font-bold text-xs font-mono flex-none ${
                        step.done
                          ? 'bg-green text-green-ink'
                          : isCur
                            ? 'bg-amber text-amber-ink'
                            : 'bg-panel2 text-muted'
                      }`}
                    >
                      {step.done ? (
                        <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} />
                      ) : (
                        idx + 1
                      )}
                    </span>
                    {step.label}
                  </li>
                );
              })}
            </ol>
          </section>

          <section aria-label="Learn" className="bg-panel border border-line rounded-2xl p-[22px]">
            <h2 className="m-0 mb-1 text-[1.125rem] font-bold flex items-center gap-2">
              <Icon name="book" className="w-[18px] h-[18px] text-cyan" />
              Learn: RAM (memory)
            </h2>
            <p className="mt-2 mb-0 text-muted text-[0.9375rem]">
              RAM is the computer’s short-term memory. It holds the programs and files you are using
              right now.
            </p>
            <p className="mt-2 mb-0 text-muted text-[0.9375rem]">
              Why slots A2 and B2? Two matching sticks in the right slots run in dual-channel mode,
              which moves data faster.
            </p>
            <div
              className="mt-3 px-3.5 py-3 rounded-xl border text-sm text-ink"
              style={{
                background: 'color-mix(in srgb, var(--amber) 12%, var(--panel))',
                borderColor: 'color-mix(in srgb, var(--amber) 40%, var(--line))',
              }}
            >
              <b>Tip:</b> match the notch, then press both ends evenly until the clips click.
            </div>
          </section>

          <p
            role="status"
            className="min-h-11 flex items-center m-0 px-3.5 py-2.5 rounded-[10px] bg-panel2 border border-line text-sm text-ink"
          >
            {pc.message}
          </p>

          <div role="group" aria-label="Parts tray" className="grid grid-cols-2 gap-2.5">
            <DraggablePartButton
              partId="ram"
              swatch="#34d399"
              label={ramLeft > 0 ? `RAM stick ${ramLeft}x` : 'RAM installed'}
              selected={pc.selectedPart === 'ram'}
              disabled={ramLeft <= 0}
              onSelect={() => selectPcPart('ram')}
            />
            <DraggablePartButton
              partId="m2"
              swatch="#cbd5e1"
              label="M.2 SSD"
              selected={pc.selectedPart === 'm2'}
              disabled={pc.m2}
              onSelect={() => selectPcPart('m2')}
            />
            <DraggablePartButton
              partId="gpu"
              swatch="#94a3b8"
              label="Graphics card"
              selected={pc.selectedPart === 'gpu'}
              disabled={pc.gpu}
              onSelect={() => selectPcPart('gpu')}
            />
            <DraggablePartButton
              partId="psu"
              swatch="#22d3ee"
              label="Power supply"
              selected={pc.selectedPart === 'psu'}
              disabled={pc.psu}
              onSelect={() => selectPcPart('psu')}
            />
          </div>

          <div className="grid grid-cols-[auto_1fr] gap-2.5">
            <button
              type="button"
              onClick={triggerPcHint}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] cursor-pointer transition-colors hover:bg-panel2 hover:border-muted"
            >
              <Icon name="bulb" className="w-[18px] h-[18px]" />
              Hint
            </button>
            <button
              type="button"
              onClick={completePcBuild}
              className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110 active:brightness-95"
            >
              Check build
            </button>
          </div>

          <div
            className="flex items-start gap-3 px-3.5 py-3 rounded-xl border text-sm"
            style={{
              background: 'color-mix(in srgb, var(--amber) 12%, var(--panel))',
              borderColor: 'color-mix(in srgb, var(--amber) 40%, var(--line))',
            }}
          >
            <Icon name="warn" className="w-5 h-5 text-amber" />
            <span>
              <b>Safety first:</b> touch the bare metal case to discharge static before handling
              parts.
            </span>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {draggingMeta ? (
          <div className="flex items-center gap-2.5 min-h-12 px-3.5 border-2 border-cyan rounded-xl bg-panel text-ink font-semibold text-sm shadow-xl">
            <i
              className="w-[22px] h-3.5 rounded-[3px] flex-none border border-black/35"
              style={{ background: draggingMeta.swatch }}
            />
            <span>{draggingMeta.label}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
