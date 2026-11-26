import { Icon } from '../components/Icon';
import { LESSON_XP_BY_KEY, TRACKS } from '../data/curriculum';
import { deriveAchievements } from '../domain/rules/progressViews';
import {
  calculateTotalXp,
  calculateWeeklyXp,
  effectiveStreak,
  localDayString,
  mergeLeaderboard,
} from '../domain/rules/xp';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { AchievementFilter } from '../types/streakbyte';

export function AchievementsView() {
  const filter = useStreakByteStore((s) => s.achievementFilter);
  const setFilter = useStreakByteStore((s) => s.setAchievementFilter);
  const completions = useStreakByteStore((s) => s.completions);
  const streak = useStreakByteStore((s) => s.streak);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const xpSpent = useStreakByteStore((s) => s.xpSpent);
  const leaderboard = useStreakByteStore((s) => s.leaderboard);
  const arenaStats = useStreakByteStore((s) => s.arenaStats);
  const classrooms = useStreakByteStore((s) => s.classrooms);
  const authUser = useStreakByteStore((s) => s.authUser);
  const isGuest = useStreakByteStore((s) => s.isGuest);
  const displayName = useStreakByteStore(
    (s) => s.profileSettings.displayName || s.authUser?.displayName || 'Learner',
  );

  const today = localDayString();
  const totalXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp, xpSpent);
  const weeklyXp = calculateWeeklyXp(completions, LESSON_XP_BY_KEY, new Date(), labBonusXp, xpSpent);
  const streakDays = effectiveStreak(streak, today);

  const ranked = mergeLeaderboard(
    isGuest ? [] : leaderboard,
    {
      userId: authUser?.id || 'local-guest',
      displayName,
      avatarUrl: authUser?.avatarUrl,
      weeklyXp,
      allTimeXp: totalXp,
      streakDays,
    },
    'w',
  );
  const myRank = ranked.find((r) => r.isYou)?.rank ?? null;

  const achievements = deriveAchievements({
    completions,
    streak,
    totalXp,
    hwTotal: TRACKS.hw.lessons.length,
    netTotal: TRACKS.net.lessons.length,
    leaderboardRank: myRank,
    arenaStats,
    classroomCount: classrooms.length,
    today,
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const lockedCount = achievements.length - unlockedCount;
  const filters: { id: AchievementFilter; label: string }[] = [
    { id: 'all', label: `All ${achievements.length}` },
    { id: 'on', label: `Unlocked ${unlockedCount}` },
    { id: 'off', label: `Locked ${lockedCount}` },
  ];

  const nextLocked =
    achievements.find((a) => !a.unlocked && a.progressPct !== undefined) ??
    achievements.find((a) => !a.unlocked) ??
    null;

  const visible = achievements.filter((a) => {
    if (filter === 'all') return true;
    return filter === 'on' ? a.unlocked : !a.unlocked;
  });

  return (
    <div className="w-full bg-panel">
      <div className="p-6 max-[760px]:p-4 border-b border-line flex justify-between items-end gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            <span>BADGES · TROPHY WALL</span>
          </div>
          <h1 className="m-0 mt-1.5 sb-page-title text-[32px]">
            Achievements
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[12px]">
            {unlockedCount} of {achievements.length} unlocked
          </p>
        </div>

        <div role="group" aria-label="Filter achievements" className="inline-flex border border-ink bg-panel">
          {filters.map((f, idx) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={`min-h-10 px-4 border-0 font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${idx > 0 ? 'border-l border-ink' : ''
                  } ${active
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-panel text-ink hover:bg-panel2'
                  }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6 max-[760px]:p-4 border-b border-line bg-panel2">
        <div className="bg-panel border border-line p-5 grid grid-cols-[auto_minmax(0,1fr)] gap-4 items-center">
          <div className="grid place-items-center w-11 h-11 border border-line bg-panel2 text-cyan flex-none">
            <Icon name={nextLocked ? 'lock' : 'trophy'} className="w-5 h-5" />
          </div>
          <div>
            {nextLocked ? (
              <>
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted mb-0.5">
                  NEXT UNLOCK TARGET
                </div>
                <h2 className="m-0 mb-1 font-head text-[18px] font-bold">
                  Next unlock: {nextLocked.title}
                </h2>
                <p className="m-0 mb-2.5 text-muted text-xs">{nextLocked.description}</p>
                {nextLocked.progressPct !== undefined ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 grid grid-cols-10 gap-0.5" aria-hidden="true">
                      {Array.from({ length: 10 }, (_, idx) => (
                        <i
                          key={idx}
                          className={`block h-2 ${idx < Math.round(((nextLocked.progressPct ?? 0) / 100) * 10)
                              ? 'bg-cyan'
                              : 'bg-panel3'
                            }`}
                        />
                      ))}
                    </div>
                    <small className="num text-muted text-[11px] font-bold whitespace-nowrap">
                      {nextLocked.progressText}
                    </small>
                  </div>
                ) : (
                  <p className="m-0 text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted">
                    {nextLocked.statusText}
                  </p>
                )}
              </>
            ) : (
              <>
                <h2 className="m-0 mb-1 font-head text-[18px] font-bold">
                  All achievements unlocked!
                </h2>
                <p className="m-0 text-muted text-xs">
                  You earned every badge across lessons, classrooms, and the 1v1 Arena.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 max-[760px]:p-4">
        {visible.length === 0 ? (
          <div className="p-6 border border-line bg-panel2 text-xs text-muted">
            No unlocked achievements yet. Complete a lesson to earn your first badge.
          </div>
        ) : (
          <ul className="grid grid-cols-4 max-[1024px]:grid-cols-2 max-[560px]:grid-cols-1 border border-line">
            {visible.map((ach) => (
              <li
                key={ach.id}
                className={`flex flex-col gap-2 p-5 border-r border-b border-line ${ach.unlocked ? 'bg-panel' : 'bg-panel2 text-muted'
                  }`}
              >
                <div
                  className={`grid place-items-center w-11 h-11 mb-1 ${ach.unlocked
                      ? 'bg-cyan text-cyan-ink'
                      : 'border border-line bg-panel text-muted'
                    }`}
                >
                  <Icon name={ach.icon} className="w-5 h-5" />
                </div>

                <h3 className="m-0 font-head text-[15px] font-bold leading-snug">{ach.title}</h3>
                <p className="m-0 text-muted text-[11.5px] flex-1">{ach.description}</p>

                {ach.unlocked ? (
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-[0.06em] text-cyan">
                    <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Unlocked
                  </span>
                ) : ach.progressPct !== undefined ? (
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="flex-1 grid grid-cols-5 gap-0.5" aria-hidden="true">
                      {Array.from({ length: 5 }, (_, idx) => (
                        <i
                          key={idx}
                          className={`block h-2 ${idx < Math.round(((ach.progressPct ?? 0) / 100) * 5)
                              ? 'bg-cyan'
                              : 'bg-panel3'
                            }`}
                        />
                      ))}
                    </div>
                    <small className="num text-muted text-[10px] font-bold whitespace-nowrap">
                      {ach.progressText}
                    </small>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                    {ach.statusText === 'Locked' && (
                      <Icon name="lock" className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                    {ach.statusText}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
