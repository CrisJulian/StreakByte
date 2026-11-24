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
import { Icon } from '../../components/Icon';
import {
  CABLE_COLORS,
  NET_DEVICE_NAMES,
  useStreakByteStore,
} from '../../store/useStreakByteStore';
import type { CableType, IconName, NetDeviceId } from '../../types/streakbyte';

const pointerFirstCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  return pointerHits.length > 0 ? pointerHits : rectIntersection(args);
};

const TRAY_DEVICES: { id: NetDeviceId; label: string; icon: IconName }[] = [
  { id: 'pc', label: 'PC', icon: 'term' },
  { id: 'laptop', label: 'Laptop', icon: 'term' },
  { id: 'hub', label: 'Hub', icon: 'net' },
];

const CABLE_OPTIONS: { id: CableType; label: string }[] = [
  { id: 'eth', label: 'Ethernet (Cat6)' },
  { id: 'fiber', label: 'Fiber optic' },
  { id: 'coax', label: 'Coaxial' },
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
    data: { deviceId },
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
      className={`flex items-center gap-2.5 min-h-12 min-w-[116px] px-3 border rounded-xl font-semibold text-sm text-left cursor-pointer transition-colors touch-none ${
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
      <Icon name={icon} className="w-5 h-5 text-muted" />
      <span>{label}</span>
    </button>
  );
}

interface DroppableSpotProps {
  spotId: NetDeviceId;
  ariaLabel: string;
  visible: boolean;
  onActivate: () => void;
  children: ReactNode;
}

function DroppableSpot({
  spotId,
  ariaLabel,
  visible,
  onActivate,
  children,
}: DroppableSpotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `net-spot-${spotId}`,
    data: { spotId },
    disabled: !visible,
  });

  if (!visible) return null;

  return (
    <g
      ref={setNodeRef as unknown as React.Ref<SVGGElement>}
      className={`spot ${isOver ? 'over' : ''}`}
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

export function NetworkBuildLab() {
  const net = useStreakByteStore((s) => s.net);
  const selectNetworkDevice = useStreakByteStore((s) => s.selectNetworkDevice);
  const placeNetworkDevice = useStreakByteStore((s) => s.placeNetworkDevice);
  const openNetworkConfig = useStreakByteStore((s) => s.openNetworkConfig);
  const closeNetworkConfig = useStreakByteStore((s) => s.closeNetworkConfig);
  const saveNetworkConfig = useStreakByteStore((s) => s.saveNetworkConfig);
  const completeNetworkBuild = useStreakByteStore((s) => s.completeNetworkBuild);

  const [draggingDev, setDraggingDev] = useState<NetDeviceId | null>(null);
  const [ip, setIp] = useState('192.168.1.20');
  const [mask, setMask] = useState('255.255.255.0');
  const [gw, setGw] = useState('192.168.1.1');
  const [cab, setCab] = useState<CableType>('eth');
  const ipInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!net.openDevice) return;
    const existing = net.cfg[net.openDevice] ?? {
      ip: '192.168.1.20',
      mask: '255.255.255.0',
      gw: '192.168.1.1',
      cab: 'eth' as CableType,
    };
    setIp(existing.ip);
    setMask(existing.mask);
    setGw(existing.gw);
    setCab(existing.cab);
    ipInputRef.current?.focus();
  }, [net.openDevice, net.cfg]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deviceId = event.active.data.current?.deviceId as NetDeviceId | undefined;
    if (deviceId) setDraggingDev(deviceId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const deviceId = event.active.data.current?.deviceId as NetDeviceId | undefined;
    const spotId = event.over?.data.current?.spotId as NetDeviceId | undefined;
    setDraggingDev(null);
    if (deviceId && spotId) {
      placeNetworkDevice(spotId, deviceId);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveNetworkConfig({ ip, mask, gw, cab });
  };

  const pcSaved = Boolean(net.savedDevices.pc);
  const laptopSaved = Boolean(net.savedDevices.laptop);
  const pcCableColor = pcSaved && net.cfg.pc ? CABLE_COLORS[net.cfg.pc.cab] : 'var(--text)';
  const laptopCableColor =
    laptopSaved && net.cfg.laptop ? CABLE_COLORS[net.cfg.laptop.cab] : 'var(--text)';

  const draggingMeta = draggingDev ? TRAY_DEVICES.find((d) => d.id === draggingDev) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerFirstCollision}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDraggingDev(null)}
    >
      <section
        aria-label="Build a network"
        className="relative bg-panel border border-line rounded-2xl p-5"
      >
        <p className="m-0 mb-3.5 text-ink text-[0.9375rem]">
          Drag a device onto a dashed spot, or tap it and then tap the spot. Click a placed device to
          set it up.
        </p>

        <div role="group" aria-label="Devices" className="flex gap-2 flex-wrap mb-3.5">
          <button
            type="button"
            disabled
            className="flex items-center gap-2.5 min-h-12 min-w-[116px] px-3 border border-line rounded-xl bg-panel font-semibold text-sm text-left opacity-45 cursor-not-allowed pointer-events-none"
          >
            <Icon name="net" className="w-5 h-5 text-muted" />
            Router
          </button>

          {TRAY_DEVICES.map((dev) => (
            <DraggableDeviceButton
              key={dev.id}
              deviceId={dev.id}
              label={dev.label}
              icon={dev.icon}
              selected={net.selectedDevice === dev.id}
              disabled={net.placed[dev.id]}
              onSelect={() => selectNetworkDevice(dev.id)}
            />
          ))}
        </div>

        <div className="relative border border-line rounded-[14px] bg-bg overflow-hidden">
          <svg
            className="net"
            viewBox="0 0 680 410"
            role="group"
            aria-label="Network diagram: internet, router, PC and laptop"
          >
            <g className="gridl">
              <path d="M0 40H680M0 80H680M0 120H680M0 160H680M0 200H680M0 240H680M0 280H680M0 320H680M0 360H680M40 0V410M80 0V410M120 0V410M160 0V410M200 0V410M240 0V410M280 0V410M320 0V410M360 0V410M400 0V410M440 0V410M480 0V410M520 0V410M560 0V410M600 0V410M640 0V410" />
            </g>

            <path d="M310 92V144" stroke="#3b82f6" strokeWidth="4" fill="none" />

            <g>
              <path
                d="M262 76h96a22 22 0 0 0 4-43 30 30 0 0 0-56-10 24 24 0 0 0-44 13 20 20 0 0 0 0 40z"
                fill="var(--panel)"
                stroke="var(--text)"
                strokeWidth="2.2"
              />
              <text x="310" y="62" style={{ fontSize: '16px' }}>
                Internet
              </text>
            </g>

            <g>
              <rect
                x="28"
                y="130"
                width="194"
                height="64"
                rx="10"
                fill="var(--panel)"
                stroke="var(--amber)"
                strokeWidth="2.2"
              />
              <text x="125" y="154" style={{ fontSize: '13px', fill: 'var(--muted)' }}>
                Router IP address
              </text>
              <text
                x="125"
                y="180"
                style={{ fontSize: '22px', fontFamily: 'var(--mono)', fontWeight: 700 }}
              >
                192.168.1.1
              </text>
              <path
                d="M222 162H256"
                stroke="var(--amber)"
                strokeWidth="2.2"
                strokeDasharray="4 4"
              />
            </g>

            <g>
              <rect
                x="256"
                y="144"
                width="108"
                height="38"
                rx="8"
                fill="var(--panel2)"
                stroke="var(--text)"
                strokeWidth="2"
              />
              <circle cx="272" cy="163" r="4" fill="#34d399" />
              <circle cx="284" cy="163" r="4" fill="#22d3ee" />
              <g fill="var(--muted)">
                <rect x="298" y="156" width="14" height="14" rx="2" />
                <rect x="318" y="156" width="14" height="14" rx="2" />
                <rect x="338" y="156" width="14" height="14" rx="2" />
              </g>
              <path d="M270 144l-8-22M350 144l8-22" stroke="var(--text)" strokeWidth="3" />
              <text x="310" y="202">
                Router: click to set up
              </text>
            </g>

            <path
              className="cab"
              d="M292 182V226H164V268"
              stroke={pcCableColor}
              fill="none"
            />
            <path className="cab" d="M310 182V268" stroke={laptopCableColor} fill="none" />

            <DroppableSpot
              spotId="hub"
              ariaLabel="Hub spot, optional"
              visible={!net.placed.hub}
              onActivate={() => placeNetworkDevice('hub')}
            >
              <rect x="28" y="210" width="148" height="44" rx="8" />
              <text x="102" y="237">
                Hub spot (optional)
              </text>
            </DroppableSpot>

            <DroppableSpot
              spotId="pc"
              ariaLabel="PC spot"
              visible={!net.placed.pc}
              onActivate={() => placeNetworkDevice('pc')}
            >
              <rect x="104" y="264" width="120" height="102" rx="10" />
              <text x="164" y="320">
                PC spot
              </text>
            </DroppableSpot>

            <DroppableSpot
              spotId="laptop"
              ariaLabel="Laptop spot"
              visible={!net.placed.laptop}
              onActivate={() => placeNetworkDevice('laptop')}
            >
              <rect x="248" y="264" width="124" height="102" rx="10" />
              <text x="310" y="320">
                Laptop spot
              </text>
            </DroppableSpot>

            {net.placed.hub && (
              <g
                className="dev"
                tabIndex={0}
                role="button"
                aria-label="Hub, placed"
                onClick={() => openNetworkConfig('hub')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openNetworkConfig('hub');
                  }
                }}
              >
                <rect className="ring" x="24" y="206" width="156" height="52" rx="10" />
                <rect
                  x="36"
                  y="214"
                  width="132"
                  height="36"
                  rx="6"
                  fill="var(--panel2)"
                  stroke="var(--text)"
                  strokeWidth="2"
                />
                <text x="102" y="237">
                  Hub placed
                </text>
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
                <rect className="ring" x="100" y="258" width="128" height="114" rx="10" />
                <rect
                  x="112"
                  y="272"
                  width="66"
                  height="46"
                  rx="4"
                  fill="#60a5fa"
                  stroke="var(--text)"
                  strokeWidth="2.2"
                />
                <path d="M145 318v12M128 330h34" stroke="var(--text)" strokeWidth="3" />
                <rect
                  x="184"
                  y="272"
                  width="22"
                  height="58"
                  rx="3"
                  fill="var(--panel2)"
                  stroke="var(--text)"
                  strokeWidth="2"
                />
                <text x="164" y="356">
                  {pcSaved && net.cfg.pc ? `PC: ${net.cfg.pc.ip}` : 'PC: click to set up'}
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
                <rect className="ring" x="244" y="258" width="132" height="114" rx="10" />
                <rect
                  x="276"
                  y="274"
                  width="68"
                  height="44"
                  rx="4"
                  fill="#60a5fa"
                  stroke="var(--text)"
                  strokeWidth="2.2"
                />
                <path
                  d="M266 322h88l-6 8h-76z"
                  fill="var(--panel2)"
                  stroke="var(--text)"
                  strokeWidth="2.2"
                />
                <text x="310" y="356">
                  {laptopSaved && net.cfg.laptop
                    ? `Laptop: ${net.cfg.laptop.ip}`
                    : 'Laptop: click to set up'}
                </text>
              </g>
            )}
          </svg>

          {net.openDevice && (
            <form
              noValidate
              onSubmit={handleSave}
              className="sb-pop absolute top-3.5 right-3.5 w-[min(310px,calc(100%-28px))] max-[760px]:static max-[760px]:w-auto max-[760px]:mt-3 p-[18px] border border-cyan rounded-[14px] bg-panel"
            >
              <div className="flex justify-between items-center mb-1.5">
                <h2 className="m-0 text-[1.125rem] font-bold">
                  Set up: {NET_DEVICE_NAMES[net.openDevice]}
                </h2>
                <button
                  type="button"
                  onClick={closeNetworkConfig}
                  aria-label="Close setup"
                  className="grid place-items-center w-10 h-10 flex-none border border-transparent rounded-full bg-panel2 text-ink cursor-pointer transition-colors hover:border-muted"
                >
                  <Icon name="x" />
                </button>
              </div>

              <label htmlFor="f-ip" className="block mt-2.5 mb-1 font-semibold text-sm">
                IP address
              </label>
              <input
                ref={ipInputRef}
                id="f-ip"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="x.x.x.x"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={Boolean(net.errors.ip)}
                className={`w-full min-h-11 px-3 border rounded-[10px] bg-bg text-ink font-mono font-medium text-[0.9375rem] placeholder:text-muted focus-visible:outline-none focus-visible:border-cyan ${
                  net.errors.ip ? 'border-danger' : 'border-line'
                }`}
              />
              {net.errors.ip && (
                <span className="block mt-1 text-danger text-[0.8125rem] font-semibold">
                  {net.errors.ip}
                </span>
              )}

              <label htmlFor="f-mask" className="block mt-2.5 mb-1 font-semibold text-sm">
                Subnet mask
              </label>
              <input
                id="f-mask"
                value={mask}
                onChange={(e) => setMask(e.target.value)}
                placeholder="x.x.x.x"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={Boolean(net.errors.mask)}
                className={`w-full min-h-11 px-3 border rounded-[10px] bg-bg text-ink font-mono font-medium text-[0.9375rem] placeholder:text-muted focus-visible:outline-none focus-visible:border-cyan ${
                  net.errors.mask ? 'border-danger' : 'border-line'
                }`}
              />
              {net.errors.mask && (
                <span className="block mt-1 text-danger text-[0.8125rem] font-semibold">
                  {net.errors.mask}
                </span>
              )}

              <label htmlFor="f-gw" className="block mt-2.5 mb-1 font-semibold text-sm">
                Gateway
              </label>
              <input
                id="f-gw"
                value={gw}
                onChange={(e) => setGw(e.target.value)}
                placeholder="x.x.x.x"
                inputMode="decimal"
                autoComplete="off"
                aria-invalid={Boolean(net.errors.gw)}
                className={`w-full min-h-11 px-3 border rounded-[10px] bg-bg text-ink font-mono font-medium text-[0.9375rem] placeholder:text-muted focus-visible:outline-none focus-visible:border-cyan ${
                  net.errors.gw ? 'border-danger' : 'border-line'
                }`}
              />
              {net.errors.gw && (
                <span className="block mt-1 text-danger text-[0.8125rem] font-semibold">
                  {net.errors.gw}
                </span>
              )}

              <label id="cab-l" className="block mt-2.5 mb-1 font-semibold text-sm">
                Cable to the router
              </label>
              <div role="group" aria-labelledby="cab-l" className="flex gap-2 flex-wrap">
                {CABLE_OPTIONS.map((opt) => {
                  const active = cab === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCab(opt.id)}
                      className={`min-h-11 px-3 border rounded-[10px] font-semibold text-sm cursor-pointer transition-colors ${
                        active
                          ? 'bg-cyan text-cyan-ink border-cyan'
                          : 'bg-transparent text-ink border-line hover:border-muted'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {net.errors.cab && (
                <span className="block mt-1 text-danger text-[0.8125rem] font-semibold">
                  {net.errors.cab}
                </span>
              )}

              <p className="mt-2 mb-0 text-muted text-sm">
                Hint: use a free number from 2 to 254.
              </p>

              <button
                type="submit"
                className="w-full mt-3 inline-flex items-center justify-center min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110"
              >
                Save
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 grid gap-2.5">
          <p
            role="status"
            className="min-h-11 flex items-center m-0 px-3.5 py-2.5 rounded-[10px] bg-panel2 border border-line text-sm text-ink"
          >
            {net.message}
          </p>
          <button
            type="button"
            onClick={completeNetworkBuild}
            className="w-full inline-flex items-center justify-center min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110"
          >
            Test connection
          </button>
        </div>
      </section>

      <DragOverlay dropAnimation={null}>
        {draggingMeta ? (
          <div className="flex items-center gap-2.5 min-h-12 px-3.5 border-2 border-cyan rounded-xl bg-panel text-ink font-semibold text-sm shadow-xl">
            <Icon name={draggingMeta.icon} className="w-5 h-5 text-cyan" />
            <span>{draggingMeta.label}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
