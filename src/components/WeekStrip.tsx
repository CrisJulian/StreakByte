interface WeekStripProps {
  filledCount: number;
  todayIndex: number;
  ariaLabel: string;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeekStrip({ filledCount, todayIndex, ariaLabel }: WeekStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1 my-3" role="img" aria-label={ariaLabel}>
      {DAYS.map((day, idx) => {
        const isOn = idx < filledCount;
        const isToday = idx === todayIndex;
        return (
          <i
            key={`${day}-${idx}`}
            className={`grid place-items-center h-8 border not-italic font-bold text-[10px] font-mono ${isOn
                ? 'bg-cyan border-cyan text-cyan-ink'
                : 'bg-panel2 border-line text-muted'
              } ${isToday ? 'border-ink shadow-[inset_0_-2px_0_var(--text)]' : ''}`}
          >
            {day}
          </i>
        );
      })}
    </div>
  );
}
