import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  currentNetworkHintStep,
  deriveNetworkStepFlags,
  hasNextNetworkHint,
  isNetworkHintUsedForCurrentStep,
  NET_CABLE_NAMES,
} from '../../domain/rules/network';
import { calculateTotalXp, LAB_HINT_COST_XP } from '../../domain/rules/xp';
import {
  CABLE_COLORS,
  NET_DEVICE_NAMES,
  useStreakByteStore,
} from '../../store/useStreakByteStore';
import type { CableType, IconName, NetDeviceId, NetLinkId } from '../../types/streakbyte';

const pointerFirstCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  return pointerHits.length > 0 ? pointerHits : rectIntersection(args);
};

const TRAY_DEVICES: { id: NetDeviceId; label: string; icon: IconName }[] = [
  { id: 'router', label: 'Router', icon: 'net' },
  { id: 'switch', label: '8-Port Switch', icon: 'net' },
  { id: 'pc', label: 'Workstation PC', icon: 'term' },
  { id: 'laptop', label: 'Laptop', icon: 'term' },
];

const CABLE_OPTIONS: { id: CableType; label: string; shortLabel: string; color: string }[] = [
  { id: 'fiber', label: 'Fiber (WAN)', shortLabel: 'FIBER', color: CABLE_COLORS.fiber },
  { id: 'coax', label: 'Coax (WAN)', shortLabel: 'COAX', color: CABLE_COLORS.coax },
  { id: 'eth', label: 'Ethernet Cat6', shortLabel: 'CAT6', color: CABLE_COLORS.eth },
];

interface DraggableDeviceButtonProps {
  deviceId: NetDeviceId;
  label: string;
  icon: IconName;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function DraggableDeviceButton({
  deviceId,
  label,
  icon,
  selected,
  disabled,
  onSelect,
}: DraggableDeviceButtonProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `net-dev-${deviceId}`,
    data: { kind: 'device', deviceId },
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
      <Icon name={icon} className="w-4 h-4 text-muted flex-none" />
      <span className="truncate">{label}</span>
    </button>
  );
}

interface DraggableCableButtonProps {
  cableId: CableType;
  label: string;
  color: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function DraggableCableButton({
  cableId,
  label,
  color,
  selected,
  disabled,
  onSelect,
}: DraggableCableButtonProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `net-cable-${cableId}`,
    data: { kind: 'cable', cableId },
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
      className={`flex items-center gap-1.5 min-h-9 px-2 border font-bold text-[10.5px] text-left cursor-pointer transition-colors touch-none ${disabled ? 'opacity-45 cursor-not-allowed pointer-events-none' : ''
        } ${isDragging ? 'opacity-40' : ''} ${selected
          ? 'border-cyan bg-you text-ink'
          : 'border-line bg-panel hover:border-ink hover:bg-panel2'
        }`}
    >
      <i className="w-3.5 h-1.5 flex-none" style={{ background: color }} aria-hidden="true" />
      <span className="truncate">{label}</span>
    </button>
  );
}

interface DroppableSpotProps {
  spotId: NetDeviceId;
  ariaLabel: string;
  visible: boolean;
  hinted: boolean;
  hintTick: number;
  onActivate: () => void;
  children: ReactNode;
}

function DroppableSpot({
  spotId,
  ariaLabel,
  visible,
  hinted,
  hintTick,
  onActivate,
  children,
}: DroppableSpotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `net-spot-${spotId}`,
    data: { kind: 'spot', spotId },
    disabled: !visible,
  });

  if (!visible) return null;

  return (
    <g
      key={hinted ? `spot-${spotId}-${hintTick}` : `spot-${spotId}`}
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      className={`spot ${isOver ? 'over' : ''} ${hinted ? 'hint' : ''}`}
      data-spot={spotId}
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

interface DroppableLinkProps {
  linkId: NetLinkId;
  ariaLabel: string;
  wiredCable?: CableType;
  pathD: string;
  pillX: number;
  pillY: number;
  pillLabel: string;
  activeFlow: boolean;
  hinted: boolean;
  hintTick: number;
  onActivate: () => void;
}

function DroppableLink({
  linkId,
  ariaLabel,
  wiredCable,
  pathD,
  pillX,
  pillY,
  pillLabel,
  activeFlow,
  hinted,
  hintTick,
  onActivate,
}: DroppableLinkProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `net-link-${linkId}`,
    data: { kind: 'link', linkId },
    disabled: Boolean(wiredCable),
  });

  if (wiredCable) {
    const color = CABLE_COLORS[wiredCable];
    const badgeText = CABLE_OPTIONS.find((c) => c.id === wiredCable)?.shortLabel ?? 'LINK';
    return (
      <g data-link={linkId}>
        <path className="cab" d={pathD} stroke={color} fill="none" />
        {activeFlow && (
          <path
            className="sb-packet-flow"
            d={pathD}
            stroke="#129954"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        )}
        <rect
          x={pillX - 24}
          y={pillY - 10}
          width="48"
          height="20"
          fill="var(--dark-card)"
          stroke={color}
          strokeWidth="1.5"
        />
        <text
          x={pillX}
          y={pillY + 4}
          style={{ fontSize: '9.5px', fill: '#ffffff', letterSpacing: '0.06em' }}
        >
          {badgeText}
        </text>
      </g>
    );
  }

  return (
    <g
      key={hinted ? `link-${linkId}-${hintTick}` : `link-${linkId}`}
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      className={`link-slot ${isOver ? 'over' : ''} ${hinted ? 'hint' : ''}`}
      data-link={linkId}
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
      <path className="wire-guide" d={pathD} />
      <rect className="wire-pill" x={pillX - 38} y={pillY - 12} width="76" height="24" />
      <text x={pillX} y={pillY + 4} style={{ fontSize: '10px', fill: 'var(--muted)' }}>
        {pillLabel}
      </text>
    </g>
  );
}

export function NetworkBuildLab() {
  const net = useStreakByteStore((s) => s.net);
  const completions = useStreakByteStore((s) => s.completions);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const xpSpent = useStreakByteStore((s) => s.xpSpent);
  const labSessionMode = useStreakByteStore((s) => s.labSessionMode);
  const labTimedOut = useStreakByteStore((s) => s.labTimedOut);
  const selectNetworkDevice = useStreakByteStore((s) => s.selectNetworkDevice);
  const placeNetworkDevice = useStreakByteStore((s) => s.placeNetworkDevice);
  const selectNetworkCable = useStreakByteStore((s) => s.selectNetworkCable);
  const wireNetworkLink = useStreakByteStore((s) => s.wireNetworkLink);
  const openNetworkConfig = useStreakByteStore((s) => s.openNetworkConfig);
  const closeNetworkConfig = useStreakByteStore((s) => s.closeNetworkConfig);
  const saveNetworkConfig = useStreakByteStore((s) => s.saveNetworkConfig);
  const triggerNetworkHint = useStreakByteStore((s) => s.triggerNetworkHint);
  const runNetworkPing = useStreakByteStore((s) => s.runNetworkPing);
  const completeNetworkBuild = useStreakByteStore((s) => s.completeNetworkBuild);

  const availableXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp, xpSpent);
  const hintUsedForStep = isNetworkHintUsedForCurrentStep(net);
  const hasRemainingStep = currentNetworkHintStep(net) !== null;
  const hasHint = hasNextNetworkHint(net);
  const notEnoughXp = availableXp < LAB_HINT_COST_XP;
  const hintDisabled =
    labTimedOut || labSessionMode === 'timed' || !hasRemainingStep || hintUsedForStep || notEnoughXp;
  const hintTitle = labTimedOut
    ? 'Time is up'
    : labSessionMode === 'timed'
      ? 'Hints are disabled in Timed mode'
      : !hasRemainingStep
        ? 'All topology and IP steps are complete — run Test connection'
        : hintUsedForStep
          ? 'Hint already unlocked for this step — complete this step to unlock the next hint'
          : !hasHint || notEnoughXp
            ? `Need ${LAB_HINT_COST_XP} XP to buy a hint (you have ${availableXp} XP)`
            : `Buy next-step hint for ${LAB_HINT_COST_XP} XP`;

  const [draggingDev, setDraggingDev] = useState<NetDeviceId | null>(null);
  const [draggingCable, setDraggingCable] = useState<CableType | null>(null);
  const [ip, setIp] = useState('192.168.1.10');
  const [mask, setMask] = useState('255.255.255.0');
  const [gw, setGw] = useState('192.168.1.1');
  const ipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!net.openDevice) return;
    const defaultIp = net.openDevice === 'pc' ? '192.168.1.10' : '192.168.1.20';
    const existing = net.cfg[net.openDevice] ?? {
      ip: defaultIp,
      mask: '255.255.255.0',
      gw: '192.168.1.1',
    };
    setIp(existing.ip);
    setMask(existing.mask);
    setGw(existing.gw);
    ipInputRef.current?.focus();
  }, [net.openDevice, net.cfg]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const kind = event.active.data.current?.kind as string | undefined;
    if (kind === 'device') {
      const deviceId = event.active.data.current?.deviceId as NetDeviceId | undefined;
      if (deviceId) setDraggingDev(deviceId);
    } else if (kind === 'cable') {
      const cableId = event.active.data.current?.cableId as CableType | undefined;
      if (cableId) setDraggingCable(cableId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeKind = event.active.data.current?.kind as string | undefined;
    const overKind = event.over?.data.current?.kind as string | undefined;
    const deviceId = event.active.data.current?.deviceId as NetDeviceId | undefined;
    const cableId = event.active.data.current?.cableId as CableType | undefined;
    const spotId = event.over?.data.current?.spotId as NetDeviceId | undefined;
    const linkId = event.over?.data.current?.linkId as NetLinkId | undefined;

    setDraggingDev(null);
    setDraggingCable(null);

    if (activeKind === 'device' && overKind === 'spot' && deviceId && spotId) {
      placeNetworkDevice(spotId, deviceId);
    } else if (activeKind === 'cable' && overKind === 'link' && cableId && linkId) {
      wireNetworkLink(linkId, cableId);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveNetworkConfig({ ip, mask, gw });
  };

  const stepFlags = deriveNetworkStepFlags(net);
  const steps = [
    { label: 'Place 4 devices', done: stepFlags[0] },
    { label: 'Wire WAN & uplink', done: stepFlags[1] },
    { label: 'Wire PC & Laptop', done: stepFlags[2] },
    { label: 'Configure IPs', done: stepFlags[3] },
    { label: 'Run ping test', done: stepFlags[4] },
  ];
  const firstUndoneIdx = steps.findIndex((s) => !s.done);

  const placedCount = Object.values(net.placed).filter(Boolean).length;
  const linksCount = Object.values(net.links).filter(Boolean).length;
  const allLinksWired = linksCount === 4;
  const pcSaved = Boolean(net.savedDevices.pc);
  const laptopSaved = Boolean(net.savedDevices.laptop);
  const dragDevMeta = draggingDev ? TRAY_DEVICES.find((d) => d.id === draggingDev) : null;
  const dragCableMeta = draggingCable ? CABLE_OPTIONS.find((c) => c.id === draggingCable) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerFirstCollision}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setDraggingDev(null);
        setDraggingCable(null);
      }}
    >
      <section
        aria-label="Build a network"
        className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] max-[1100px]:grid-cols-1 gap-3.5 items-start"
      >
        <div className="relative sb-blueprint-dots border border-line p-3.5">
          <CornerBrackets />
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <h2 className="m-0 font-head text-[16px] font-bold">Build an Office LAN</h2>
            <span
              className={`inline-flex items-center gap-2 px-2.5 py-1 text-[10.5px] font-mono font-bold uppercase tracking-[0.05em] border ${net.pingPassed
                  ? 'border-green text-green bg-panel'
                  : 'border-line text-muted bg-panel2'
                }`}
            >
              <i
                className={`w-2 h-2 ${net.pingPassed ? 'bg-green' : linksCount > 0 ? 'bg-cyan' : 'bg-muted'
                  }`}
                aria-hidden="true"
              />
              {net.pingPassed
                ? 'LAN ONLINE · 0% LOSS'
                : `${placedCount}/4 DEVICES · ${linksCount}/4 LINKS`}
            </span>
          </div>

          <svg
            className="net"
            viewBox="0 0 640 420"
            role="group"
            aria-label="Office LAN topology diagram with ISP, Router, 8-Port Switch, PC and Laptop"
          >
            <g className="gridl">
              <path d="M0 40H640M0 80H640M0 120H640M0 160H640M0 200H640M0 240H640M0 280H640M0 320H640M0 360H640M0 400H640M40 0V420M80 0V420M120 0V420M160 0V420M200 0V420M240 0V420M280 0V420M320 0V420M360 0V420M400 0V420M440 0V420M480 0V420M520 0V420M560 0V420M600 0V420" />
            </g>

            {/* Topology Links */}
            <DroppableLink
              linkId="wan"
              ariaLabel="WAN link from ISP to Router"
              wiredCable={net.links.wan}
              pathD="M188 68 H368"
              pillX={278}
              pillY={68}
              pillLabel="Wire WAN"
              activeFlow={net.pingPassed}
              hinted={net.hintedStep === 'wire-wan'}
              hintTick={net.hintTick}
              onActivate={() => wireNetworkLink('wan')}
            />
            <DroppableLink
              linkId="uplink"
              ariaLabel="LAN uplink from Router to Switch"
              wiredCable={net.links.uplink}
              pathD="M462 106 V142 H320 V178"
              pillX={391}
              pillY={142}
              pillLabel="Wire LAN"
              activeFlow={net.pingPassed}
              hinted={net.hintedStep === 'wire-uplink'}
              hintTick={net.hintTick}
              onActivate={() => wireNetworkLink('uplink')}
            />
            <DroppableLink
              linkId="pc"
              ariaLabel="Ethernet link from Switch to Workstation PC"
              wiredCable={net.links.pc}
              pathD="M250 244 V270 H152 V298"
              pillX={201}
              pillY={270}
              pillLabel="Wire PC"
              activeFlow={pcSaved && Boolean(net.links.pc)}
              hinted={net.hintedStep === 'wire-pc'}
              hintTick={net.hintTick}
              onActivate={() => wireNetworkLink('pc')}
            />
            <DroppableLink
              linkId="laptop"
              ariaLabel="Ethernet link from Switch to Laptop"
              wiredCable={net.links.laptop}
              pathD="M390 244 V270 H488 V298"
              pillX={439}
              pillY={270}
              pillLabel="Wire Laptop"
              activeFlow={laptopSaved && Boolean(net.links.laptop)}
              hinted={net.hintedStep === 'wire-laptop'}
              hintTick={net.hintTick}
              onActivate={() => wireNetworkLink('laptop')}
            />

            {/* Fixed ISP / Internet Cloud */}
            <g>
              <path
                d="M72 86h96a22 22 0 0 0 4-43 30 30 0 0 0-56-10 24 24 0 0 0-44 13 20 20 0 0 0 0 40z"
                fill="var(--panel)"
                stroke="var(--text)"
                strokeWidth="2.2"
              />
              <text x="120" y="64" style={{ fontSize: '13px' }}>
                ISP / WAN
              </text>
              <text x="120" y="79" style={{ fontSize: '9.5px', fill: 'var(--muted)' }}>
                Modem Line
              </text>
            </g>

            {/* Empty Device Slots */}
            <DroppableSpot
              spotId="router"
              ariaLabel="Router slot"
              visible={!net.placed.router}
              hinted={net.hintedStep === 'place-router'}
              hintTick={net.hintTick}
              onActivate={() => placeNetworkDevice('router')}
            >
              <rect x="368" y="32" width="188" height="74" />
              <text x="462" y="73">
                Router slot
              </text>
            </DroppableSpot>

            <DroppableSpot
              spotId="switch"
              ariaLabel="8-Port Switch slot"
              visible={!net.placed.switch}
              hinted={net.hintedStep === 'place-switch'}
              hintTick={net.hintTick}
              onActivate={() => placeNetworkDevice('switch')}
            >
              <rect x="214" y="178" width="212" height="66" />
              <text x="320" y="215">
                Switch slot
              </text>
            </DroppableSpot>

            <DroppableSpot
              spotId="pc"
              ariaLabel="Workstation PC slot"
              visible={!net.placed.pc}
              hinted={net.hintedStep === 'place-pc'}
              hintTick={net.hintTick}
              onActivate={() => placeNetworkDevice('pc')}
            >
              <rect x="76" y="298" width="152" height="96" />
              <text x="152" y="350">
                PC slot
              </text>
            </DroppableSpot>

            <DroppableSpot
              spotId="laptop"
              ariaLabel="Laptop slot"
              visible={!net.placed.laptop}
              hinted={net.hintedStep === 'place-laptop'}
              hintTick={net.hintTick}
              onActivate={() => placeNetworkDevice('laptop')}
            >
              <rect x="412" y="298" width="152" height="96" />
              <text x="488" y="350">
                Laptop slot
              </text>
            </DroppableSpot>

            {/* Placed Devices */}
            {net.placed.router && (
              <g
                className={`dev ${net.links.wan && net.links.uplink ? 'ready' : 'pending'}`}
                tabIndex={0}
                role="button"
                aria-label="Router, gateway 192.168.1.1"
                onClick={() => openNetworkConfig('router')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openNetworkConfig('router');
                  }
                }}
              >
                <rect className="ring" x="364" y="28" width="196" height="82" />
                <rect
                  x="368"
                  y="32"
                  width="188"
                  height="74"
                  fill="var(--dark-card)"
                  stroke="var(--cyan)"
                  strokeWidth="2"
                />
                <circle cx="386" cy="52" r="4" fill={net.links.wan ? 'var(--green)' : 'var(--amber)'} />
                <circle cx="399" cy="52" r="4" fill={net.links.uplink ? 'var(--green)' : 'var(--muted)'} />
                <text x="468" y="55" style={{ fontSize: '12px', fill: '#ffffff' }}>
                  Router · Gateway
                </text>
                <text x="462" y="84" style={{ fontSize: '16px', fill: 'var(--cyan)' }}>
                  192.168.1.1 /24
                </text>
              </g>
            )}

            {net.placed.switch && (
              <g
                className={`dev ${net.links.uplink && net.links.pc && net.links.laptop ? 'ready' : 'pending'}`}
                tabIndex={0}
                role="button"
                aria-label="8-Port Switch, click for info"
                onClick={() => openNetworkConfig('switch')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openNetworkConfig('switch');
                  }
                }}
              >
                <rect className="ring" x="210" y="174" width="220" height="74" />
                <rect
                  x="214"
                  y="178"
                  width="212"
                  height="66"
                  fill="var(--dark-card)"
                  stroke="var(--text)"
                  strokeWidth="2"
                />
                <text x="320" y="200" style={{ fontSize: '11.5px', fill: '#ffffff' }}>
                  8-PORT L2 SWITCH
                </text>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const portActive =
                    (idx === 0 && Boolean(net.links.uplink)) ||
                    (idx === 1 && Boolean(net.links.pc)) ||
                    (idx === 2 && Boolean(net.links.laptop));
                  return (
                    <rect
                      key={idx}
                      x={236 + idx * 22}
                      y={212}
                      width="14"
                      height="14"
                      fill={portActive ? 'var(--green)' : '#4b5563'}
                    />
                  );
                })}
              </g>
            )}

            {net.placed.pc && (
              <g
                className={`dev ${pcSaved ? 'ready' : 'pending'}`}
                tabIndex={0}
                role="button"
                aria-label="PC, click to set up"
                onClick={() => openNetworkConfig('pc')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openNetworkConfig('pc');
                  }
                }}
              >
                <rect className="ring" x="72" y="294" width="160" height="104" />
                <rect
                  x="100"
                  y="306"
                  width="66"
                  height="44"
                  fill="var(--cyan)"
                  stroke="var(--text)"
                  strokeWidth="2.2"
                />
                <path d="M133 350v10M116 360h34" stroke="var(--text)" strokeWidth="3" />
                <rect
                  x="174"
                  y="306"
                  width="22"
                  height="54"
                  fill="var(--panel)"
                  stroke="var(--text)"
                  strokeWidth="2"
                />
                <text x="152" y="382" style={{ fontSize: '11.5px' }}>
                  {pcSaved && net.cfg.pc ? `PC: ${net.cfg.pc.ip}` : 'PC: click to set IP'}
                </text>
              </g>
            )}

            {net.placed.laptop && (
              <g
                className={`dev ${laptopSaved ? 'ready' : 'pending'}`}
                tabIndex={0}
                role="button"
                aria-label="Laptop, click to set up"
                onClick={() => openNetworkConfig('laptop')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openNetworkConfig('laptop');
                  }
                }}
              >
                <rect className="ring" x="408" y="294" width="160" height="104" />
                <rect
                  x="454"
                  y="308"
                  width="68"
                  height="42"
                  fill="var(--cyan)"
                  stroke="var(--text)"
                  strokeWidth="2.2"
                />
                <path
                  d="M444 354h88l-6 8h-76z"
                  fill="var(--panel)"
                  stroke="var(--text)"
                  strokeWidth="2.2"
                />
                <text x="488" y="382" style={{ fontSize: '11.5px' }}>
                  {laptopSaved && net.cfg.laptop
                    ? `Laptop: ${net.cfg.laptop.ip}`
                    : 'Laptop: click to set IP'}
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className="grid gap-2.5">
          <section aria-label="Network checklist" className="bg-panel border border-line p-3">
            <h2 className="m-0 font-head text-[15px] font-bold">LAN checklist</h2>
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

          <div
            role="status"
            className="p-2.5 bg-[var(--dark-card)] text-white border border-[var(--dark-line)] font-mono text-[11.5px] grid gap-1"
          >
            <div>{net.message}</div>
            {net.pingLog.length > 0 && (
              <div
                className={`border-t border-[var(--dark-line)] pt-1 grid gap-0.5 text-[10.5px] ${net.pingPassed ? 'text-green' : 'text-danger'
                  }`}
              >
                {net.pingLog.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            )}
          </div>

          {net.openDevice ? (
            <form
              noValidate
              onSubmit={handleSave}
              className="sb-pop p-3 border border-ink bg-panel"
            >
              <div className="flex justify-between items-center mb-1">
                <h2 className="m-0 font-head text-[15px] font-bold">
                  Set up: {NET_DEVICE_NAMES[net.openDevice]}
                </h2>
                <button
                  type="button"
                  onClick={closeNetworkConfig}
                  aria-label="Close setup"
                  className="grid place-items-center w-7 h-7 flex-none border border-line bg-panel2 text-ink cursor-pointer transition-colors hover:border-ink"
                >
                  <Icon name="x" className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div>
                  <label htmlFor="f-ip" className="block mb-1 font-bold text-[10px] uppercase tracking-[0.06em] text-muted">
                    IP address
                  </label>
                  <input
                    ref={ipInputRef}
                    id="f-ip"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="192.168.1.10"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={Boolean(net.errors.ip)}
                    className={`w-full min-h-8 px-2.5 border bg-bg text-ink font-mono font-medium text-xs placeholder:text-muted focus-visible:outline-none focus-visible:border-ink ${net.errors.ip ? 'border-danger' : 'border-line'
                      }`}
                  />
                  {net.errors.ip && (
                    <span className="block mt-1 text-danger text-[10.5px] font-semibold">
                      {net.errors.ip}
                    </span>
                  )}
                </div>

                <div>
                  <label htmlFor="f-mask" className="block mb-1 font-bold text-[10px] uppercase tracking-[0.06em] text-muted">
                    Subnet mask
                  </label>
                  <input
                    id="f-mask"
                    value={mask}
                    onChange={(e) => setMask(e.target.value)}
                    placeholder="255.255.255.0"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={Boolean(net.errors.mask)}
                    className={`w-full min-h-8 px-2.5 border bg-bg text-ink font-mono font-medium text-xs placeholder:text-muted focus-visible:outline-none focus-visible:border-ink ${net.errors.mask ? 'border-danger' : 'border-line'
                      }`}
                  />
                  {net.errors.mask && (
                    <span className="block mt-1 text-danger text-[10.5px] font-semibold">
                      {net.errors.mask}
                    </span>
                  )}
                </div>
              </div>

              <label htmlFor="f-gw" className="block mt-2 mb-1 font-bold text-[10px] uppercase tracking-[0.06em] text-muted">
                Gateway
              </label>
              <input
                id="f-gw"
                value={gw}
                onChange={(e) => setGw(e.target.value)}
                placeholder="192.168.1.1"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={Boolean(net.errors.gw)}
                className={`w-full min-h-8 px-2.5 border bg-bg text-ink font-mono font-medium text-xs placeholder:text-muted focus-visible:outline-none focus-visible:border-ink ${net.errors.gw ? 'border-danger' : 'border-line'
                  }`}
              />
              {net.errors.gw && (
                <span className="block mt-1 text-danger text-[10.5px] font-semibold">
                  {net.errors.gw}
                </span>
              )}

              <button
                type="submit"
                disabled={labTimedOut}
                className="sb-cut w-full mt-2.5 inline-flex items-center justify-center min-h-9 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:brightness-110 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="grid gap-2">
              <div className="bg-panel border border-line p-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted mb-1.5">
                  1 · Devices (drag or tap slot)
                </div>
                <div role="group" aria-label="Devices" className="grid grid-cols-2 gap-1.5">
                  {TRAY_DEVICES.map((dev) => (
                    <DraggableDeviceButton
                      key={dev.id}
                      deviceId={dev.id}
                      label={dev.label}
                      icon={dev.icon}
                      selected={net.selectedDevice === dev.id}
                      disabled={net.placed[dev.id] || labTimedOut}
                      onSelect={() => selectNetworkDevice(dev.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-panel border border-line p-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted mb-1.5">
                  2 · Cables (drag or tap dashed link)
                </div>
                <div role="group" aria-label="Cables" className="grid grid-cols-3 gap-1.5">
                  {CABLE_OPTIONS.map((cabOpt) => (
                    <DraggableCableButton
                      key={cabOpt.id}
                      cableId={cabOpt.id}
                      label={cabOpt.label}
                      color={cabOpt.color}
                      selected={net.selectedCable === cabOpt.id}
                      disabled={allLinksWired || labTimedOut}
                      onSelect={() => selectNetworkCable(cabOpt.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-[auto_1fr] gap-2">
            <button
              type="button"
              disabled={hintDisabled}
              onClick={triggerNetworkHint}
              title={hintTitle}
              className="inline-flex items-center justify-center gap-1.5 min-h-10 px-3.5 border border-line bg-panel text-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:border-ink hover:bg-panel2 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <Icon name="bulb" className="w-4 h-4" />
              {hintUsedForStep ? 'Hint used' : `Hint · ${LAB_HINT_COST_XP} XP`}
            </button>
            {net.pingPassed ? (
              <button
                type="button"
                disabled={labTimedOut}
                onClick={completeNetworkBuild}
                className="sb-cut inline-flex items-center justify-center min-h-10 px-4 border border-green bg-green text-green-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:brightness-110 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                Finish build
              </button>
            ) : (
              <button
                type="button"
                disabled={labTimedOut}
                onClick={runNetworkPing}
                className="sb-cut inline-flex items-center justify-center min-h-10 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:brightness-110 transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
              >
                Test connection
              </button>
            )}
          </div>
        </div>
      </section>

      <DragOverlay dropAnimation={null}>
        {dragDevMeta ? (
          <div className="flex items-center gap-2 min-h-10 px-3 border-2 border-cyan bg-panel text-ink font-bold text-xs shadow-xl">
            <Icon name={dragDevMeta.icon} className="w-4 h-4 text-cyan" />
            <span>{dragDevMeta.label}</span>
          </div>
        ) : dragCableMeta ? (
          <div className="flex items-center gap-2 min-h-10 px-3 border-2 border-cyan bg-panel text-ink font-bold text-xs shadow-xl">
            <i className="w-4 h-1.5 flex-none" style={{ background: dragCableMeta.color }} />
            <span>{NET_CABLE_NAMES[dragCableMeta.id]}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
