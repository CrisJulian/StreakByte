import { useEffect, useState } from 'react';
import { LESSON_XP_BY_KEY, TRACKS } from '../data/curriculum';
import { formatStreak, formatXp } from '../data/leaderboard';
import {
  calculateTotalXp,
  calculateWeeklyXp,
  effectiveStreak,
  localDayString,
  mergeLeaderboard,
} from '../domain/rules/xp';
import { useStreakByteStore } from '../store/useStreakByteStore';

export function LeaderboardView() {
  const period = useStreakByteStore((s) => s.leaderboardPeriod);
  const setPeriod = useStreakByteStore((s) => s.setLeaderboardPeriod);
  const openSetup = useStreakByteStore((s) => s.openSetup);
  const refreshLeaderboard = useStreakByteStore((s) => s.refreshLeaderboard);
  const leaderboard = useStreakByteStore((s) => s.leaderboard);
  const completions = useStreakByteStore((s) => s.completions);
  const streak = useStreakByteStore((s) => s.streak);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const xpSpent = useStreakByteStore((s) => s.xpSpent);
  const arenaStats = useStreakByteStore((s) => s.arenaStats);
  const classrooms = useStreakByteStore((s) => s.classrooms);
  const selectedClassroomId = useStreakByteStore((s) => s.selectedClassroomId);
  const selectClassroom = useStreakByteStore((s) => s.selectClassroom);
  const createClassroom = useStreakByteStore((s) => s.createClassroom);
  const joinClassroom = useStreakByteStore((s) => s.joinClassroom);
  const leaveClassroom = useStreakByteStore((s) => s.leaveClassroom);
  const showToast = useStreakByteStore((s) => s.showToast);
  const authUser = useStreakByteStore((s) => s.authUser);
  const isGuest = useStreakByteStore((s) => s.isGuest);
  const selectedTracks = useStreakByteStore((s) => s.profileSettings.selectedTracks);
  const displayName = useStreakByteStore(
    (s) => s.profileSettings.displayName || s.authUser?.displayName || 'Learner',
  );

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [busyRoomAction, setBusyRoomAction] = useState(false);

  useEffect(() => {
    if (!isGuest) {
      void refreshLeaderboard();
    }
  }, [isGuest, period, selectedClassroomId, refreshLeaderboard]);

  const today = localDayString();
  const streakDays = effectiveStreak(streak, today);
  const totalXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp, xpSpent);
  const weeklyXp = calculateWeeklyXp(completions, LESSON_XP_BY_KEY, new Date(), labBonusXp, xpSpent);

  const sorted = mergeLeaderboard(
    isGuest ? [] : leaderboard,
    {
      userId: authUser?.id || 'local-guest',
      displayName,
      avatarUrl: authUser?.avatarUrl,
      weeklyXp,
      allTimeXp: totalXp,
      streakDays,
      ...(arenaStats.wins > 0 ? { duelWins: arenaStats.wins } : {}),
      ...(arenaStats.losses > 0 ? { duelLosses: arenaStats.losses } : {}),
      ...(arenaStats.winStreak > 0 ? { duelWinStreak: arenaStats.winStreak } : {}),
    },
    period,
  );

  const meIndex = sorted.findIndex((r) => r.isYou);
  const above = meIndex > 0 ? sorted[meIndex - 1] : null;
  const below = meIndex >= 0 && meIndex < sorted.length - 1 ? sorted[meIndex + 1] : null;

  let gapCopy =
    sorted.length === 1
      ? 'You are the first learner on this board.'
      : 'You lead the class.';
  if (meIndex > 0 && above) {
    const diff = above.xp - sorted[meIndex].xp;
    const lessonsNeeded = Math.max(1, Math.ceil(diff / 120));
    const lessonPhrase =
      lessonsNeeded === 1 ? 'One more lesson closes' : `${lessonsNeeded} more lessons close`;
    gapCopy = `${formatXp(diff)} XP behind ${above.name}. ${lessonPhrase} the gap.${
      below
        ? ` ${below.name} is ${formatXp(sorted[meIndex].xp - below.xp)} XP behind you.`
        : ''
    }`;
  }

  const podiumSlots =
    sorted.length >= 3
      ? [
          { row: sorted[1], variant: 'p2' as const },
          { row: sorted[0], variant: 'p1' as const },
          { row: sorted[2], variant: 'p3' as const },
        ]
      : sorted.map((row, idx) => ({
          row,
          variant: idx === 0 ? ('p1' as const) : ('p2' as const),
        }));

  const defaultLab = TRACKS[selectedTracks[0] ?? 'hw'].defaultTarget;
  const activeClassroom = classrooms.find((c) => c.id === selectedClassroomId) ?? null;

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyRoomAction || !joinCodeInput.trim()) return;
    setBusyRoomAction(true);
    const res = await joinClassroom(joinCodeInput);
    if (res.ok) setJoinCodeInput('');
    setBusyRoomAction(false);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busyRoomAction || !newRoomName.trim()) return;
    setBusyRoomAction(true);
    const res = await createClassroom(newRoomName);
    if (res.ok) setNewRoomName('');
    setBusyRoomAction(false);
  };

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code).catch(() => undefined);
    }
    showToast(`Copied join code ${code}`);
  };

  return (
    <div>
      <div className="flex justify-between items-end gap-4 flex-wrap mb-5">
        <div>
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]">
            Leaderboard
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[1.0625rem]">
            {activeClassroom
              ? `Classroom: ${activeClassroom.name} · Code ${activeClassroom.joinCode}`
              : period === 'a'
                ? 'All-time XP in StreakByte. This board never resets.'
                : 'XP earned this week. Resets every Monday.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {classrooms.length > 0 && (
            <div
              role="group"
              aria-label="Board scope"
              className="inline-flex p-1 border border-line rounded-xl bg-bg gap-1 flex-wrap"
            >
              <button
                type="button"
                aria-pressed={selectedClassroomId === null}
                onClick={() => selectClassroom(null)}
                className={`min-h-10 px-3.5 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                  selectedClassroomId === null
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-transparent text-muted hover:text-ink'
                }`}
              >
                Global
              </button>
              {classrooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  aria-pressed={selectedClassroomId === room.id}
                  onClick={() => selectClassroom(room.id)}
                  className={`min-h-10 px-3.5 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                    selectedClassroomId === room.id
                      ? 'bg-cyan text-cyan-ink'
                      : 'bg-transparent text-muted hover:text-ink'
                  }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          )}

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
      </div>

      {isGuest && (
        <p className="mb-4 px-4 py-3 rounded-xl border border-line bg-panel text-sm text-muted">
          Guest mode shows only your local progress. Sign in with Google to appear on the live leaderboard.
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_290px] max-[1100px]:grid-cols-1 gap-5 items-start">
        <div className="grid gap-5 min-w-0">
          <div
            className={`grid gap-3.5 max-[760px]:gap-2 items-end mb-0 ${
              podiumSlots.length >= 3
                ? 'grid-cols-[1fr_1.1fr_1fr]'
                : podiumSlots.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-1 max-w-[320px]'
            }`}
          >
            {podiumSlots.map(({ row, variant }) => {
              const isFirst = variant === 'p1';
              const isThird = variant === 'p3';
              return (
                <article
                  key={row.userId}
                  className={`grid justify-items-center gap-1.5 rounded-2xl text-center transition-transform duration-200 hover:-translate-y-0.5 ${
                    isFirst
                      ? 'py-8 px-3 max-[760px]:py-5 max-[760px]:px-1.5 bg-amber text-amber-ink border border-amber'
                      : isThird
                        ? 'py-5 px-3 max-[760px]:py-3.5 max-[760px]:px-1.5 bg-panel border-2 border-cyan'
                        : 'py-5 px-3 max-[760px]:py-3.5 max-[760px]:px-1.5 bg-panel border border-line'
                  }`}
                >
                  <span className="num text-[1.75rem] max-[760px]:text-[1.375rem] font-bold leading-none">
                    {row.rank}
                  </span>
                  {row.avatarUrl ? (
                    <img
                      src={row.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover border border-black/15"
                    />
                  ) : (
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
                  )}
                  <b className="text-base">{row.isYou ? `${row.name} (you)` : row.name}</b>
                  {row.duelWinStreak ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                        isFirst ? 'bg-amber-ink/15 text-amber-ink' : 'bg-amber/18 text-amber'
                      }`}
                    >
                      🔥 {row.duelWinStreak}W Streak
                    </span>
                  ) : null}
                  <span className="num">{formatXp(row.xp)} XP</span>
                  <small className="opacity-85 text-[0.8125rem]">
                    {formatStreak(row.streakDays)}
                    {(row.duelWins || row.duelLosses)
                      ? ` · ${row.duelWins ?? 0}W-${row.duelLosses ?? 0}L`
                      : ''}
                  </small>
                </article>
              );
            })}
          </div>

          {sorted.length > 3 && (
            <ol className="bg-panel border border-line rounded-2xl p-2.5 grid gap-0.5">
              {sorted.slice(3).map((row) => (
                <li
                  key={row.userId}
                  className={`grid grid-cols-[28px_38px_minmax(0,1fr)_auto_auto] max-[760px]:grid-cols-[24px_36px_minmax(0,1fr)_auto] gap-3.5 items-center px-3 py-2.5 rounded-xl transition-colors hover:bg-panel2 ${
                    row.isYou ? 'bg-you' : ''
                  }`}
                >
                  <span className="num text-muted text-sm text-center">{row.rank}</span>
                  {row.avatarUrl ? (
                    <img
                      src={row.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-[38px] h-[38px] max-[760px]:w-9 max-[760px]:h-9 rounded-[10px] object-cover"
                    />
                  ) : (
                    <span className="grid place-items-center w-[38px] h-[38px] max-[760px]:w-9 max-[760px]:h-9 rounded-[10px] bg-panel2 text-ink font-bold text-sm">
                      {row.initial}
                    </span>
                  )}
                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                      {row.isYou ? `${row.name} (you)` : row.name}
                    </span>
                    {row.duelWinStreak ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber/18 text-amber text-[0.6875rem] font-bold whitespace-nowrap">
                        🔥 {row.duelWinStreak}W
                      </span>
                    ) : null}
                    {(row.duelWins || row.duelLosses) ? (
                      <span className="text-xs text-muted whitespace-nowrap">
                        {row.duelWins ?? 0}W–{row.duelLosses ?? 0}L
                      </span>
                    ) : null}
                  </div>
                  <span className="text-muted text-sm max-[760px]:hidden">
                    {formatStreak(row.streakDays)}
                  </span>
                  <b className="num">{formatXp(row.xp)} XP</b>
                </li>
              ))}
            </ol>
          )}
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
                of {sorted.length} {sorted.length === 1 ? 'learner' : 'learners'}
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
              onClick={() => openSetup(defaultLab)}
              className="w-full inline-flex items-center justify-center min-h-[38px] px-4 border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-sm cursor-pointer transition-all hover:brightness-110"
            >
              Earn XP: resume lesson
            </button>
          </aside>

          <aside className="bg-panel border border-line rounded-2xl p-4">
            <h2 className="m-0 mb-1 text-base font-bold">Classrooms & Friends</h2>
            {isGuest ? (
              <p className="m-0 text-muted text-[0.8125rem] leading-[1.45]">
                Sign in with Google to create or join a classroom leaderboard with friends.
              </p>
            ) : (
              <div className="grid gap-3 mt-2">
                {classrooms.length > 0 && (
                  <ul className="grid gap-2 m-0 p-0 list-none">
                    {classrooms.map((room) => (
                      <li
                        key={room.id}
                        className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-line bg-bg"
                      >
                        <div className="min-w-0">
                          <b className="block text-sm truncate">{room.name}</b>
                          <small className="block text-xs text-muted">
                            {room.memberCount} {room.memberCount === 1 ? 'member' : 'members'} ·{' '}
                            <code className="font-mono font-bold text-ink">{room.joinCode}</code>
                          </small>
                        </div>
                        <div className="flex items-center gap-1 flex-none">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(room.joinCode)}
                            className="min-h-8 px-2.5 rounded-lg border border-line bg-panel2 text-ink text-xs font-semibold cursor-pointer hover:border-muted"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => void leaveClassroom(room.id)}
                            className="min-h-8 px-2.5 rounded-lg border border-line bg-transparent text-muted text-xs font-semibold cursor-pointer hover:text-ink"
                          >
                            Leave
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleJoinSubmit} className="grid gap-1.5">
                  <label htmlFor="classroom-join" className="text-xs font-bold text-muted">
                    Join by code
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="classroom-join"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={8}
                      className="flex-1 min-w-0 min-h-9 px-2.5 border border-line rounded-lg bg-bg text-ink text-sm font-mono uppercase focus-visible:outline-none focus-visible:border-cyan"
                    />
                    <button
                      type="submit"
                      disabled={busyRoomAction || !joinCodeInput.trim()}
                      className="min-h-9 px-3 rounded-lg border border-cyan bg-cyan text-cyan-ink text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      Join
                    </button>
                  </div>
                </form>

                <form onSubmit={handleCreateSubmit} className="grid gap-1.5">
                  <label htmlFor="classroom-create" className="text-xs font-bold text-muted">
                    Create classroom
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="classroom-create"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="e.g. CS 101"
                      maxLength={60}
                      className="flex-1 min-w-0 min-h-9 px-2.5 border border-line rounded-lg bg-bg text-ink text-sm focus-visible:outline-none focus-visible:border-cyan"
                    />
                    <button
                      type="submit"
                      disabled={busyRoomAction || !newRoomName.trim()}
                      className="min-h-9 px-3 rounded-lg border border-line bg-panel2 text-ink text-xs font-bold cursor-pointer hover:border-muted disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            )}
          </aside>

          <aside className="bg-panel border border-line rounded-2xl p-4">
            <h2 className="m-0 mb-1 text-base font-bold">How XP is earned</h2>
            <p className="mt-1 mb-2 text-muted text-[0.8125rem] leading-[1.45]">
              Lesson quizzes award up to 150 XP based on your score. Completing the PC and Network
              labs adds bonus XP too.
            </p>
            <p className="m-0 text-muted text-[0.8125rem] leading-[1.45]">
              The weekly board resets every Monday. All-time XP never resets.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
