import { formatStreak, formatXp, LEADERBOARD_ROWS } from '../data/leaderboard';
import { useStreakByteStore } from '../store/useStreakByteStore';

export function LeaderboardView() {
  const period = useStreakByteStore((s) => s.leaderboardPeriod);
  const setPeriod = useStreakByteStore((s) => s.setLeaderboardPeriod);
  const openSetup = useStreakByteStore((s) => s.openSetup);

  const sorted = [...LEADERBOARD_ROWS]
    .map((row) => ({
      name: row.name,
      initial: row.initial,
      xp: period === 'a' ? row.allTimeXp : row.weeklyXp,
      streakDays: row.streakDays,
      isYou: row.isYou,
    }))
    .sort((a, b) => b.xp - a.xp);

  const meIndex = sorted.findIndex((r) => r.isYou);
  const above = meIndex > 0 ? sorted[meIndex - 1] : null;
  const below = meIndex >= 0 && meIndex < sorted.length - 1 ? sorted[meIndex + 1] : null;

  let gapCopy = 'You lead the class.';
  if (meIndex > 0 && above) {
    const diff = above.xp - sorted[meIndex].xp;
    const lessonsNeeded = Math.ceil(diff / 120);
    const lessonPhrase =
      lessonsNeeded === 1 ? 'One more lesson closes' : `${lessonsNeeded} more lessons close`;
    gapCopy = `${diff} XP behind ${above.name}. ${lessonPhrase} the gap.${
      below ? ` ${below.name} is ${sorted[meIndex].xp - below.xp} XP behind you.` : ''
    }`;
  }

  const podiumOrder = [
    { rankIdx: 1, variant: 'p2' as const },
    { rankIdx: 0, variant: 'p1' as const },
    { rankIdx: 2, variant: 'p3' as const },
  ];

  return (
    <div>
      <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
        <div>
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]">
            Leaderboard
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[1.0625rem]">
            {period === 'a'
              ? 'All-time XP in your class. This board never resets.'
              : 'XP earned this week in your class. Resets on Sunday.'}
          </p>
        </div>

        <div
          role="group"
          aria-label="Period"
          className="inline-flex p-1 border border-line rounded-xl bg-bg gap-1"
        >
          <button
            type="button"
            aria-pressed={period === 'w'}
            onClick={() => setPeriod('w')}
            className={`min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
              period === 'w'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            This week
          </button>
          <button
            type="button"
            aria-pressed={period === 'a'}
            onClick={() => setPeriod('a')}
            className={`min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
              period === 'a'
                ? 'bg-cyan text-cyan-ink'
                : 'bg-transparent text-muted hover:text-ink'
            }`}
          >
            All time
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_290px] max-[1100px]:grid-cols-1 gap-5 items-start">
        <div className="grid gap-5 min-w-0">
          <div className="grid grid-cols-[1fr_1.1fr_1fr] gap-3.5 max-[760px]:gap-2 items-end mb-0">
            {podiumOrder.map(({ rankIdx, variant }) => {
              const row = sorted[rankIdx];
              const isFirst = variant === 'p1';
              const isThird = variant === 'p3';
              return (
                <article
                  key={row.name}
                  className={`grid justify-items-center gap-1.5 rounded-2xl text-center transition-transform duration-200 hover:-translate-y-0.5 ${
                    isFirst
                      ? 'py-8 px-3 max-[760px]:py-5 max-[760px]:px-1.5 bg-amber text-amber-ink border border-amber'
                      : isThird
                        ? 'py-5 px-3 max-[760px]:py-3.5 max-[760px]:px-1.5 bg-panel border-2 border-cyan'
                        : 'py-5 px-3 max-[760px]:py-3.5 max-[760px]:px-1.5 bg-panel border border-line'
                  }`}
                >
                  <span className="num text-[1.75rem] max-[760px]:text-[1.375rem] font-bold leading-none">
                    {rankIdx + 1}
                  </span>
                  <span
                    className={`grid place-items-center w-12 h-12 text-[1.125rem] font-bold rounded-xl ${
                      isFirst
                        ? 'bg-amber-ink text-amber'
                        : isThird
                          ? 'bg-cyan text-cyan-ink'
                          : 'bg-panel2 text-ink'
                    }`}
                  >
                    {row.initial}
                  </span>
                  <b className="text-base">{row.name}</b>
                  <span className="num">{formatXp(row.xp)} XP</span>
                  <small className="opacity-85 text-[0.8125rem]">{formatStreak(row.streakDays)}</small>
                </article>
              );
            })}
          </div>

          <ol className="bg-panel border border-line rounded-2xl p-2.5 grid gap-0.5">
            {sorted.slice(3).map((row, idx) => (
              <li
                key={row.name}
                className="grid grid-cols-[28px_38px_minmax(0,1fr)_auto_auto] max-[760px]:grid-cols-[24px_36px_minmax(0,1fr)_auto] gap-3.5 items-center px-3 py-2.5 rounded-xl transition-colors hover:bg-panel2"
              >
                <span className="num text-muted text-sm text-center">{idx + 4}</span>
                <span className="grid place-items-center w-[38px] h-[38px] max-[760px]:w-9 max-[760px]:h-9 rounded-[10px] bg-panel2 text-ink font-bold text-sm">
                  {row.initial}
                </span>
                <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                  {row.name}
                </span>
                <span className="text-muted text-sm max-[760px]:hidden">
                  {formatStreak(row.streakDays)}
                </span>
                <b className="num">{formatXp(row.xp)} XP</b>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid gap-3.5 min-w-0">
          <aside
            className="border rounded-2xl p-4"
            style={{
              background: 'color-mix(in srgb, var(--cyan) 12%, var(--panel))',
              borderColor: 'color-mix(in srgb, var(--cyan) 35%, var(--line))',
            }}
          >
            <h2 className="m-0 mb-1 text-base font-bold">Your standing</h2>
            <div className="num text-[2rem] font-bold leading-none mt-1">
              #{meIndex + 1}
              <small className="font-sans text-sm font-medium text-muted ml-1.5">
                of {sorted.length} in your class
              </small>
            </div>
            <p className="my-2 mb-2.5 text-muted text-[0.8125rem] leading-[1.45]">{gapCopy}</p>
            <div className="grid grid-cols-10 gap-1 my-2.5" aria-hidden="true">
              {Array.from({ length: 10 }, (_, idx) => (
                <i
                  key={idx}
                  className={`h-1.5 rounded-[3px] ${idx < 10 - meIndex ? 'bg-amber' : 'bg-panel2'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => openSetup('pc')}
              className="w-full inline-flex items-center justify-center min-h-[38px] px-4 border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
            >
              Earn XP: resume lesson
            </button>
          </aside>

          <aside className="bg-panel border border-line rounded-2xl p-4">
            <h2 className="m-0 mb-1 text-base font-bold">How XP is earned</h2>
            <p className="mt-1 mb-2 text-muted text-[0.8125rem] leading-[1.45]">
              Each lesson gives 110 to 130 XP. Daily streaks and finishing a build without hints add
              bonus XP.
            </p>
            <p className="m-0 text-muted text-[0.8125rem] leading-[1.45]">
              The weekly board resets every Sunday. All-time XP never resets.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
