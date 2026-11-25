export function IsometricCubeSvg({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <polygon points="32,6 56,20 56,44 32,58 8,44 8,20" stroke="#ffffff" strokeWidth="1.6" />
      <polyline points="8,20 32,34 56,20" stroke="#ffffff" strokeWidth="1.6" />
      <line x1="32" y1="34" x2="32" y2="58" stroke="#ffffff" strokeWidth="1.6" />
      <circle cx="32" cy="34" r="4.5" fill="#FF5500" />
    </svg>
  );
}

export function CornerBrackets({ light = false }: { light?: boolean }) {
  const borderClass = light ? 'border-white/70' : 'border-ink';
  return (
    <>
      <span aria-hidden="true" className={`pointer-events-none absolute top-2.5 left-2.5 w-[11px] h-[11px] border-t-[1.5px] border-l-[1.5px] ${borderClass}`} />
      <span aria-hidden="true" className={`pointer-events-none absolute top-2.5 right-2.5 w-[11px] h-[11px] border-t-[1.5px] border-r-[1.5px] ${borderClass}`} />
      <span aria-hidden="true" className={`pointer-events-none absolute bottom-2.5 left-2.5 w-[11px] h-[11px] border-b-[1.5px] border-l-[1.5px] ${borderClass}`} />
      <span aria-hidden="true" className={`pointer-events-none absolute bottom-2.5 right-2.5 w-[11px] h-[11px] border-b-[1.5px] border-r-[1.5px] ${borderClass}`} />
    </>
  );
}
