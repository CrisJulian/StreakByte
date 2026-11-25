import { useEffect, useState } from 'react';
import { CornerBrackets } from '../components/ByteMascotSvg';
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
    gapCopy = `${formatXp(diff)} XP behind ${above.name}. ${lessonPhrase} the gap.${below
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
    <div className="w-full bg-panel">
      <div className="p-6 max-[760px]:p-4 border-b border-line flex justify-between items-end gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            <span>CLASS LEAGUE · STANDINGS</span>
          </div>
          <h1 className="m-0 mt-1.5 sb-page-title text-[32px]">
            Leaderboard
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[12px]">
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
              className="inline-flex border border-ink bg-panel flex-wrap"
            >
              <button
                type="button"
                aria-pressed={selectedClassroomId === null}
                onClick={() => selectClassroom(null)}
                className={`min-h-10 px-3.5 border-0 font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${selectedClassroomId === null
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-panel text-ink hover:bg-panel2'
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
                  className={`min-h-10 px-3.5 border-0 border-l border-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${selectedClassroomId === room.id
                      ? 'bg-cyan text-cyan-ink'
                      : 'bg-panel text-ink hover:bg-panel2'
                    }`}
                >
                  {room.name}
                </button>
              ))}
            </div>
          )}

          <div role="group" aria-label="Period" className="inline-flex border border-ink bg-panel">
            <button
              type="button"
              aria-pressed={period === 'w'}
              onClick={() => setPeriod('w')}
              className={`min-h-10 px-4 border-0 font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${period === 'w'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-panel text-ink hover:bg-panel2'
                }`}
            >
              This week
            </button>
            <button
              type="button"
              aria-pressed={period === 'a'}
              onClick={() => setPeriod('a')}
              className={`min-h-10 px-4 border-0 border-l border-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${period === 'a'
                  ? 'bg-cyan text-cyan-ink'
                  : 'bg-panel text-ink hover:bg-panel2'
                }`}
            >
              All time
            </button>
          </div>
        </div>
      </div>

      {isGuest && (
        <p className="m-0 px-6 py-3 border-b border-line bg-panel2 text-xs text-muted">
          Guest mode shows only your local progress. Sign in with Google to appear on the live
          leaderboard.
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_320px] max-[1050px]:grid-cols-1 items-stretch">
        <div className="p-6 max-[760px]:p-4 border-r border-line max-[1050px]:border-r-0 max-[1050px]:border-b grid gap-5 content-start">
          <div
            className={`grid items-end border border-line ${podiumSlots.length >= 3
                ? 'grid-cols-[1fr_1.12fr_1fr] max-[600px]:grid-cols-1'
                : podiumSlots.length === 2
                  ? 'grid-cols-2 max-[600px]:grid-cols-1'
                  : 'grid-cols-1 max-w-[340px]'
              }`}
          >
            {podiumSlots.map(({ row, variant }) => {
              const isFirst = variant === 'p1';
              const isThird = variant === 'p3';
              return (
                <article
                  key={row.userId}
                  className={`grid justify-items-center gap-1.5 text-center border-r last:border-r-0 max-[600px]:border-r-0 max-[600px]:border-b max-[600px]:last:border-b-0 border-line ${isFirst
                      ? 'py-8 px-3 bg-cyan text-cyan-ink'
                      : isThird
                        ? 'py-5 px-3 bg-[var(--dark-card)] text-white'
                        : 'py-5 px-3 bg-panel text-ink'
                    }`}
                >
                  <span className="num font-disp text-[26px] leading-none">#{row.rank}</span>
                  {row.avatarUrl ? (
                    <img
                      src={row.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 object-cover border border-black/20"
                    />
                  ) : (
                    <span
                      className={`grid place-items-center w-11 h-11 text-base font-bold ${isFirst
                          ? 'bg-[var(--dark-card)] text-white'
                          : isThird
                            ? 'bg-cyan text-cyan-ink'
                            : 'bg-panel2 text-ink border border-line'
                        }`}
                    >
                      {row.initial}
                    </span>
                  )}
                  <b className="font-head text-sm">{row.isYou ? `${row.name} (you)` : row.name}</b>
                  {row.duelWinStreak ? (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase ${isFirst ? 'bg-[var(--dark-card)]/25 text-white' : 'bg-you text-cyan'
                        }`}
                    >
                      🔥 {row.duelWinStreak}W Streak
                    </span>
                  ) : null}
                  <span className="num font-disp text-base">{formatXp(row.xp)} XP</span>
                  <small className="opacity-80 text-[10px] uppercase tracking-[0.04em]">
                    {formatStreak(row.streakDays)}
                    {row.duelWins || row.duelLosses
                      ? ` · ${row.duelWins ?? 0}W-${row.duelLosses ?? 0}L`
                      : ''}
                  </small>
                </article>
              );
            })}
          </div>

          {sorted.length > 3 && (
            <ol className="border border-line bg-panel">
              {sorted.slice(3).map((row) => (
                <li
                  key={row.userId}
                  className={`grid grid-cols-[28px_36px_minmax(0,1fr)_auto_auto] max-[760px]:grid-cols-[24px_34px_minmax(0,1fr)_auto] gap-3 items-center px-3.5 py-2.5 border-b border-line last:border-b-0 ${row.isYou ? 'bg-you' : 'hover:bg-panel2'
                    }`}
                >
                  <span className="num text-muted text-xs text-center font-bold">{row.rank}</span>
                  {row.avatarUrl ? (
                    <img
                      src={row.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 object-cover border border-line"
                    />
                  ) : (
                    <span className="grid place-items-center w-9 h-9 border border-line bg-panel2 text-ink font-bold text-xs">
                      {row.initial}
                    </span>
                  )}
                  <div className="min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="font-head font-bold text-sm truncate">
                      {row.isYou ? `${row.name} (you)` : row.name}
                    </span>
                    {row.duelWinStreak ? (
                      <span className="px-2 py-0.5 bg-you text-cyan text-[10px] font-bold uppercase whitespace-nowrap">
                        🔥 {row.duelWinStreak}W
                      </span>
                    ) : null}
                    {row.duelWins || row.duelLosses ? (
                      <span className="text-[11px] text-muted whitespace-nowrap">
                        {row.duelWins ?? 0}W–{row.duelLosses ?? 0}L
                      </span>
                    ) : null}
                  </div>
                  <span className="text-muted text-[11px] max-[760px]:hidden">
                    {formatStreak(row.streakDays)}
                  </span>
                  <b className="num font-disp text-sm">{formatXp(row.xp)} XP</b>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="p-6 max-[760px]:p-4 bg-panel2 grid gap-4 content-start">
          <aside className="relative border border-[var(--dark-card)] bg-[var(--dark-card)] text-white p-5">
            <CornerBrackets light />
            <h2 className="m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.09em] text-cyan">
              Your standing
            </h2>
            <div className="num font-disp text-[34px] leading-none mt-1">
              #{meIndex + 1}
              <small className="font-mono text-xs font-medium text-white/65 ml-2">
                of {sorted.length} {sorted.length === 1 ? 'learner' : 'learners'}
              </small>
            </div>
            <p className="my-2.5 text-white/75 text-[11.5px] leading-[1.45]">{gapCopy}</p>
            <div className="grid grid-cols-10 gap-1 my-3" aria-hidden="true">
              {Array.from({ length: 10 }, (_, idx) => (
                <i
                  key={idx}
                  className={`h-2 ${idx < 10 - meIndex ? 'bg-cyan' : 'bg-white/20'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => openSetup(defaultLab)}
              className="sb-cut-sm w-full inline-flex items-center justify-center min-h-10 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00]"
            >
              Earn XP: resume lesson
            </button>
          </aside>

          <aside className="bg-panel border border-line p-4">
            <h2 className="m-0 mb-1 font-head text-base font-bold">Classrooms &amp; Friends</h2>
            {isGuest ? (
              <p className="m-0 text-muted text-[11.5px] leading-[1.45]">
                Sign in with Google to create or join a classroom leaderboard with friends.
              </p>
            ) : (
              <div className="grid gap-3 mt-2.5">
                {classrooms.length > 0 && (
                  <ul className="grid gap-2 m-0 p-0 list-none">
                    {classrooms.map((room) => (
                      <li
                        key={room.id}
                        className="flex items-center justify-between gap-2 p-2.5 border border-line bg-panel2"
                      >
                        <div className="min-w-0">
                          <b className="block font-head text-xs truncate">{room.name}</b>
                          <small className="block text-[10.5px] text-muted">
                            {room.memberCount} {room.memberCount === 1 ? 'member' : 'members'} ·{' '}
                            <code className="font-mono font-bold text-ink">{room.joinCode}</code>
                          </small>
                        </div>
                        <div className="flex items-center gap-1 flex-none">
                          <button
                            type="button"
                            onClick={() => handleCopyCode(room.joinCode)}
                            className="min-h-8 px-2 border border-line bg-panel text-ink text-[10px] font-bold uppercase cursor-pointer hover:border-ink"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => void leaveClassroom(room.id)}
                            className="min-h-8 px-2 border border-line bg-transparent text-muted text-[10px] font-bold uppercase cursor-pointer hover:text-ink"
                          >
                            Leave
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleJoinSubmit} className="grid gap-1.5">
                  <label htmlFor="classroom-join" className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                    Join by code
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="classroom-join"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={8}
                      className="flex-1 min-w-0 min-h-9 px-2.5 border border-line bg-bg text-ink text-xs font-mono uppercase focus-visible:outline-none focus-visible:border-ink"
                    />
                    <button
                      type="submit"
                      disabled={busyRoomAction || !joinCodeInput.trim()}
                      className="sb-cut-sm min-h-9 px-3 border border-cyan bg-cyan text-cyan-ink text-[10px] font-bold uppercase cursor-pointer disabled:opacity-50"
                    >
                      Join
                    </button>
                  </div>
                </form>

                <form onSubmit={handleCreateSubmit} className="grid gap-1.5">
                  <label htmlFor="classroom-create" className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                    Create classroom
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      id="classroom-create"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="e.g. CS 101"
                      maxLength={60}
                      className="flex-1 min-w-0 min-h-9 px-2.5 border border-line bg-bg text-ink text-xs focus-visible:outline-none focus-visible:border-ink"
                    />
                    <button
                      type="submit"
                      disabled={busyRoomAction || !newRoomName.trim()}
                      className="min-h-9 px-3 border border-line bg-panel2 text-ink text-[10px] font-bold uppercase cursor-pointer hover:border-ink disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            )}
          </aside>

          <aside className="bg-panel border border-line p-4">
            <h2 className="m-0 mb-1 font-head text-base font-bold">How XP is earned</h2>
            <p className="mt-1 mb-2 text-muted text-[11.5px] leading-[1.45]">
              Lesson quizzes award up to 150 XP based on your score. Completing the PC and Network
              labs adds bonus XP too.
            </p>
            <p className="m-0 text-muted text-[11.5px] leading-[1.45]">
              The weekly board resets every Monday. All-time XP never resets.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
