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
  const leaderboard = useStreakByteStore((s) => s.leaderboard);
  const authUser = useStreakByteStore((s) => s.authUser);
  const isGuest = useStreakByteStore((s) => s.isGuest);
  const displayName = useStreakByteStore(
    (s) => s.profileSettings.displayName || s.authUser?.displayName || 'Learner',
  );

  const today = localDayString();
  const totalXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp);
  const weeklyXp = calculateWeeklyXp(completions, LESSON_XP_BY_KEY, new Date(), labBonusXp);
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
    leaderboardRank: myRank,
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
    <div>
      <div className="mb-6">
        <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]">
          Achievements
        </h1>
        <p className="mt-1.5 mb-0 text-muted text-[1.0625rem]">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <div className="bg-panel border border-line rounded-2xl p-[22px] grid grid-cols-[auto_minmax(0,1fr)] gap-4 items-center mb-5">
        <div className="grid place-items-center w-11 h-11 rounded-xl bg-panel2 text-cyan flex-none">
          <Icon name={nextLocked ? 'lock' : 'trophy'} />
        </div>
        <div>
          {nextLocked ? (
            <>
              <h2 className="m-0 mb-1 text-[1.125rem] font-bold">
                Next unlock: {nextLocked.title}
              </h2>
              <p className="m-0 mb-2.5 text-muted text-sm">{nextLocked.description}</p>
              {nextLocked.progressPct !== undefined ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-panel2 overflow-hidden">
                    <i
                      className="sb-bar-fill block h-full rounded-full bg-cyan"
                      style={{ width: `${nextLocked.progressPct}%` }}
                    />
                  </div>
                  <small className="num text-muted text-[0.8125rem] whitespace-nowrap">
                    {nextLocked.progressText}
                  </small>
                </div>
              ) : (
                <p className="m-0 text-xs font-semibold text-muted">{nextLocked.statusText}</p>
              )}
            </>
          ) : (
            <>
              <h2 className="m-0 mb-1 text-[1.125rem] font-bold">All achievements unlocked!</h2>
              <p className="m-0 text-muted text-sm">
                You earned every badge in Hardware and Networking.
              </p>
            </>
          )}
        </div>
      </div>

      <div role="group" aria-label="Filter achievements" className="flex gap-2 flex-wrap mb-4">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={`min-h-11 px-4 border rounded-full font-semibold text-sm cursor-pointer transition-colors ${
                active
                  ? 'bg-panel2 text-ink border-cyan'
                  : 'bg-transparent text-muted border-line hover:text-ink hover:border-muted'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="p-6 border border-line rounded-2xl bg-panel text-sm text-muted">
          No unlocked achievements yet. Complete a lesson to earn your first badge.
        </div>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-4">
          {visible.map((ach) => (
            <li
              key={ach.id}
              className="flex flex-col gap-1.5 p-5 border border-line rounded-2xl bg-panel transition-all duration-200 hover:-translate-y-0.5 hover:border-muted"
            >
              <div
                className={`grid place-items-center w-[52px] h-[52px] mb-2 rounded-[14px] ${
                  !ach.unlocked
                    ? 'bg-panel2 text-muted'
                    : ach.accent === 'amber'
                      ? 'text-amber'
                      : 'text-cyan'
                }`}
                style={
                  ach.unlocked
                    ? {
                        background:
                          ach.accent === 'amber'
                            ? 'color-mix(in srgb, var(--amber) 16%, transparent)'
                            : 'color-mix(in srgb, var(--cyan) 16%, transparent)',
                      }
                    : undefined
                }
              >
                <Icon name={ach.icon} className="w-6 h-6" />
              </div>

              <h3 className="m-0 text-base font-bold leading-snug">{ach.title}</h3>
              <p className="m-0 text-muted text-sm flex-1">{ach.description}</p>

              {ach.unlocked ? (
                <span className="inline-flex items-center gap-1.5 mt-2.5 text-[0.8125rem] font-bold text-cyan">
                  <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                  Unlocked
                </span>
              ) : ach.progressPct !== undefined ? (
                <div className="flex items-center gap-3 mt-2.5">
                  <div className="flex-1 h-1.5 rounded-full bg-panel2 overflow-hidden">
                    <i
                      className="sb-bar-fill block h-full rounded-full bg-cyan"
                      style={{ width: `${ach.progressPct}%` }}
                    />
                  </div>
                  <small className="num text-muted text-[0.8125rem] whitespace-nowrap">
                    {ach.progressText}
                  </small>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 mt-2.5 text-[0.8125rem] font-bold text-muted">
                  {ach.statusText === 'Locked' && <Icon name="lock" className="w-4 h-4" strokeWidth={2.5} />}
                  {ach.statusText}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
