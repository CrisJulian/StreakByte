interface WeekStripProps {
  filledCount: number;
  todayIndex: number;
  ariaLabel: string;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function WeekStrip({ filledCount, todayIndex, ariaLabel }: WeekStripProps) {
  return (
    <div className="grid grid-cols-7 gap-1.5 my-3.5 mb-3" role="img" aria-label={ariaLabel}>
      {DAYS.map((day, idx) => {
        const isOn = idx < filledCount;
        const isToday = idx === todayIndex;
        return (
          <i
            key={`${day}-${idx}`}
            className={`grid place-items-center h-[38px] rounded-lg not-italic font-bold text-[0.8125rem] font-mono ${
              isOn ? 'bg-amber text-amber-ink' : 'bg-panel2 text-muted'
            } ${isToday ? 'outline-2 outline-amber outline-offset-2' : ''}`}
          >
            {day}
          </i>
        );
      })}
    </div>
  );
}
