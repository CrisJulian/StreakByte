import { Icon } from '../components/Icon';
import { WelcomeMascot } from '../components/WelcomeMascot';
import { getTrackProgress, LESSON_XP_BY_KEY, lessonLabel, TRACKS } from '../data/curriculum';
import { formatXp, initialsFor } from '../data/leaderboard';
import { lessonKeyFor } from '../domain/rules/lessonProgress';
import { deriveDailyQuests, ensureDailyActivity } from '../domain/rules/dailyQuests';
import { deriveAchievements } from '../domain/rules/progressViews';
import {
  calculateTotalXp,
  calculateWeeklyXp,
  effectiveStreak,
  localDayString,
  mergeLeaderboard,
} from '../domain/rules/xp';
import { useStreakByteStore } from '../store/useStreakByteStore';

export function DashboardView() {
  const openSetup = useStreakByteStore((s) => s.openSetup);
  const setTrack = useStreakByteStore((s) => s.setTrack);
  const navigate = useStreakByteStore((s) => s.navigate);
  const setChatOpen = useStreakByteStore((s) => s.setChatOpen);
  const claimDailyQuest = useStreakByteStore((s) => s.claimDailyQuest);
  const track = useStreakByteStore((s) => s.track);
  const completions = useStreakByteStore((s) => s.completions);
  const streak = useStreakByteStore((s) => s.streak);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const dailyActivity = useStreakByteStore((s) => s.dailyActivity);
  const leaderboard = useStreakByteStore((s) => s.leaderboard);
  const authUser = useStreakByteStore((s) => s.authUser);
  const isGuest = useStreakByteStore((s) => s.isGuest);
  const selectedTracks = useStreakByteStore((s) => s.profileSettings.selectedTracks);
  const displayName = useStreakByteStore(
    (s) => s.profileSettings.displayName || s.authUser?.displayName || 'Learner',
  );
  const firstName = displayName.trim().split(/\s+/)[0] || 'Learner';

  const activeTrackId = selectedTracks.includes(track) ? track : selectedTracks[0] ?? 'hw';
  const activeTrack = TRACKS[activeTrackId];
  const activeProgress = getTrackProgress(activeTrackId, completions);
  const nextIdx = activeProgress.lessons.findIndex((l) => l.status === 'cur');
  const safeIdx = nextIdx >= 0 ? nextIdx : Math.max(0, activeTrack.lessons.length - 1);
  const nextLesson = activeTrack.lessons[safeIdx];
  const nextLessonKey = lessonKeyFor(activeTrackId, safeIdx);
  const nextLessonTitle = lessonLabel(nextLesson, safeIdx);
  const trackPct =
    activeProgress.total === 0
      ? 0
      : Math.round((activeProgress.doneCount / activeProgress.total) * 100);

  const today = localDayString();
  const streakDays = effectiveStreak(streak, today);
  const totalXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp);
  const weeklyXp = calculateWeeklyXp(completions, LESSON_XP_BY_KEY, new Date(), labBonusXp);

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
  const previewRows = ranked.slice(0, 4);
  const me = ranked.find((r) => r.isYou) ?? ranked[0];
  const achievements = deriveAchievements({
    completions,
    streak,
    totalXp,
    hwTotal: TRACKS.hw.lessons.length,
    leaderboardRank: me?.rank ?? null,
    today,
  });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const previewAchievements = achievements.slice(0, 4);
  const dailyQuests = deriveDailyQuests(ensureDailyActivity(dailyActivity, today));
  const completedQuestsCount = dailyQuests.filter((q) => q.completed).length;

  const triggerQuestAction = (id: (typeof dailyQuests)[number]['id']) => {
    if (id === 'daily-quiz') {
      navigate('curriculum');
    } else if (id === 'daily-lab') {
      openSetup(activeTrack.defaultTarget, nextLessonTitle);
    } else {
      setChatOpen(true);
    }
  };
  const above = me && me.rank > 1 ? ranked[me.rank - 2] : null;
  const heroSubtitle = above
    ? `You’re ${formatXp(above.xp - me.xp)} XP behind ${above.name} this week.`
    : totalXp > 0
      ? 'You’re leading the board this week. Keep your streak going!'
      : 'Complete your first lesson to earn XP and start your streak.';

  return (
    <div className="grid gap-5">
      {/* Row 0: Welcome header */}
      <div className="sb-enter flex items-center gap-5 max-[760px]:gap-3.5">
        <WelcomeMascot />
        <div className="min-w-0">
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em] text-balance">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[1.0625rem] max-w-[65ch]">{heroSubtitle}</p>
        </div>
      </div>

      {/* Row 1: Continue learning aligned with Leaderboard */}
      <div className="grid grid-cols-[minmax(0,1fr)_360px] max-[1100px]:grid-cols-1 gap-5 items-stretch">
        <section
          aria-label="Continue learning"
          className="bg-panel border border-line rounded-2xl p-[22px] grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] max-[760px]:grid-cols-1 gap-6 items-center"
        >
          <div>
            <div className="flex gap-2 flex-wrap mb-3.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-panel2 text-[0.8125rem] font-semibold text-muted">
                {activeTrack.heading}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-panel2 text-[0.8125rem] font-semibold text-muted">
                {nextLesson.minutes} min
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.8125rem] font-semibold text-cyan"
                style={{ background: 'color-mix(in srgb, var(--cyan) 16%, transparent)' }}
              >
                +{nextLesson.xp} XP
              </span>
            </div>

            <h2 className="m-0 mb-2.5 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-balance">
              {nextLessonTitle}
            </h2>
            <p className="m-0 mb-5 text-muted max-w-[46ch]">{nextLesson.subtitle}</p>

            <div className="flex justify-between text-sm font-semibold mb-2">
              <span>Track progress</span>
              <span className="num">{trackPct}%</span>
            </div>
            <div
              className="h-2 rounded-full bg-panel2 overflow-hidden"
              role="progressbar"
              aria-label="Track progress"
              aria-valuenow={trackPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <i
                className="sb-bar-fill block h-full rounded-full bg-cyan"
                style={{ width: `${trackPct}%` }}
              />
            </div>

            <p className="mt-2.5 mb-5 text-muted text-sm">
              {activeProgress.doneCount} of {activeProgress.total} lessons complete in{' '}
              {activeTrack.heading}
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => openSetup(activeTrack.defaultTarget, nextLessonTitle)}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110 active:brightness-95"
              >
                <Icon name="play" className="w-[18px] h-[18px]" />
                Start lesson
              </button>
              <button
                type="button"
                onClick={() => navigate(`learn/${nextLessonKey}`)}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] cursor-pointer transition-colors hover:bg-panel2 hover:border-muted"
              >
                Read lesson
              </button>
            </div>
          </div>

          <div className="rounded-[14px] bg-bg border border-line p-2.5">
            <svg
              viewBox="0 0 360 220"
              role="img"
              aria-label="DIMM memory module with eight chips and an off-centre key notch"
              className="w-full h-auto block"
              fill="none"
              strokeWidth={1.5}
            >
              <rect
                x="20"
                y="50"
                width="320"
                height="82"
                rx="6"
                fill="var(--dimm-bg)"
                stroke="var(--dimm-stroke)"
              />
              <g fill="var(--dimm-chip)" stroke="var(--cyan)">
                <rect x="34" y="64" width="32" height="40" rx="3" />
                <rect x="74" y="64" width="32" height="40" rx="3" />
                <rect x="114" y="64" width="32" height="40" rx="3" />
                <rect x="154" y="64" width="32" height="40" rx="3" />
                <rect x="204" y="64" width="32" height="40" rx="3" />
                <rect x="244" y="64" width="32" height="40" rx="3" />
                <rect x="284" y="64" width="32" height="40" rx="3" />
              </g>
              <path
                d="M20 132h138M178 132h162"
                stroke="var(--cyan)"
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />
              <path d="M158 132v-12h20v12" fill="var(--bg)" stroke="var(--cyan)" />
              <path
                d="M168 152v-18m0 0-4 5m4-5 4 5"
                stroke="var(--cyan)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text
                x="168"
                y="176"
                textAnchor="middle"
                fill="var(--text)"
                fontSize="14"
                fontWeight="600"
                stroke="none"
                fontFamily="Instrument Sans, sans-serif"
              >
                Key notch sits off-centre
              </text>
              <text
                x="168"
                y="196"
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="12"
                stroke="none"
                fontFamily="Instrument Sans, sans-serif"
              >
                The module only fits one way
              </text>
            </svg>
          </div>
        </section>

        <aside
          aria-label="Leaderboard"
          className="bg-panel border border-line rounded-2xl p-5 flex flex-col"
        >
          <div className="flex justify-between items-center gap-3">
            <h2 className="m-0 text-[1.125rem] font-bold">Leaderboard</h2>
            <span className="text-[0.8125rem] font-semibold text-muted">This week</span>
          </div>
          <p className="m-0 text-muted text-sm">
            {isGuest ? 'Guest mode · Local progress only' : 'Live class standings'}
          </p>

          <ol className="grid gap-1 mt-3 mb-3.5">
            {previewRows.map((row) => (
              <li
                key={row.userId}
                aria-current={row.isYou ? 'true' : undefined}
                className={`grid grid-cols-[20px_34px_minmax(0,1fr)_auto] gap-2.5 items-center px-2.5 py-2 rounded-xl ${
                  row.isYou ? 'bg-you font-semibold' : ''
                }`}
              >
                <span className="num text-muted text-sm text-center">{row.rank}</span>
                {row.avatarUrl ? (
                  <img
                    src={row.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-[34px] h-[34px] rounded-full object-cover border border-line"
                  />
                ) : (
                  <span
                    className={`grid place-items-center w-[34px] h-[34px] rounded-full font-bold text-xs ${
                      row.isYou ? 'bg-cyan text-cyan-ink' : 'bg-panel2 text-ink'
                    }`}
                  >
                    {initialsFor(row.name)}
                  </span>
                )}
                <span className="font-semibold text-sm leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                  {row.isYou ? `${row.name} (you)` : row.name}
                  <small className="block text-muted text-xs font-medium">
                    {row.streakDays}-day streak
                  </small>
                </span>
                <b className="num text-sm">{formatXp(row.xp)}</b>
              </li>
            ))}
          </ol>

          <a
            href="#leaderboard"
            onClick={(e) => {
              e.preventDefault();
              navigate('leaderboard');
            }}
            className="mt-auto w-full inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] no-underline transition-colors hover:bg-panel2 hover:border-muted"
          >
            View full leaderboard
          </a>
        </aside>
      </div>

      {/* Row 2: Selected tracks + Achievements */}
      <div className="grid grid-cols-[minmax(0,1fr)_360px] max-[1100px]:grid-cols-1 gap-x-5 gap-y-3 items-stretch mt-1">
        <h2
          id="tracks-heading"
          className="m-0 text-[1.125rem] font-bold leading-snug tracking-[-0.01em] col-start-1"
        >
          Your tracks
        </h2>

        <section
          aria-label="Tracks"
          className={`col-start-1 grid ${
            selectedTracks.length > 1 ? 'grid-cols-2 max-[760px]:grid-cols-1' : 'grid-cols-1'
          } gap-5`}
        >
          {selectedTracks.map((id) => {
            const t = TRACKS[id];
            const progress = getTrackProgress(id, completions);
            const pct =
              progress.total === 0 ? 0 : Math.round((progress.doneCount / progress.total) * 100);
            const isActive = id === activeTrackId;
            return (
              <article
                key={id}
                className="bg-panel border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted"
                style={
                  isActive
                    ? { borderColor: 'color-mix(in srgb, var(--cyan) 55%, var(--line))' }
                    : undefined
                }
              >
                <div className="flex gap-3.5 items-center">
                  <div className="grid place-items-center w-11 h-11 rounded-xl bg-panel2 text-cyan flex-none">
                    <Icon name={id === 'net' ? 'net' : 'cpu'} />
                  </div>
                  <h3 className="m-0 text-base font-bold leading-snug">
                    {t.heading}
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ml-1.5 ${
                        isActive ? 'bg-cyan text-cyan-ink' : 'bg-panel2 text-muted'
                      }`}
                    >
                      {isActive ? 'Current' : 'Active'}
                    </span>
                  </h3>
                </div>
                <p className="m-0 text-muted text-sm">
                  {t.description} · {t.lessons.length} lessons
                </p>
                <div className="mt-auto flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full bg-panel2 overflow-hidden">
                      <i
                        className="sb-bar-fill block h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: isActive ? 'var(--cyan)' : 'var(--muted)',
                        }}
                      />
                    </div>
                    <small className="num text-muted text-[0.8125rem] whitespace-nowrap">
                      {progress.doneCount} of {progress.total}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTrack(id);
                      navigate('curriculum');
                    }}
                    className={`inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border rounded-[10px] font-semibold text-[0.9375rem] cursor-pointer transition-all ${
                      isActive
                        ? 'border-cyan bg-cyan text-cyan-ink hover:brightness-110 active:brightness-95'
                        : 'border-line bg-transparent text-ink hover:bg-panel2 hover:border-muted'
                    }`}
                  >
                    {isActive ? 'Resume track' : 'Switch to track'}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section
          aria-label="Achievements"
          className="col-start-2 row-start-2 max-[1100px]:col-start-1 max-[1100px]:row-start-auto bg-panel border border-line rounded-2xl p-5 flex flex-col"
        >
          <div className="flex justify-between items-center gap-3">
            <h2 className="m-0 text-[1.125rem] font-bold">Achievements</h2>
            <span className="num text-[0.8125rem] font-semibold text-muted">
              {unlockedCount} of {achievements.length}
            </span>
          </div>

          <ul className="grid grid-cols-2 gap-x-3 gap-y-3.5 my-auto py-3">
            {previewAchievements.map((ach) => (
              <li
                key={ach.id}
                className={`flex items-center gap-2.5 min-w-0 ${ach.unlocked ? '' : 'text-muted'}`}
              >
                <div
                  className={`grid place-items-center w-9 h-9 rounded-[10px] flex-none ${
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
                  <Icon name={ach.icon} className="w-[18px] h-[18px]" />
                </div>
                <span className="min-w-0 text-sm font-semibold leading-tight">
                  <span className="block truncate">{ach.title}</span>
                  {ach.unlocked ? (
                    <small className="inline-flex items-center gap-1 text-xs font-medium text-cyan">
                      <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Done
                    </small>
                  ) : (
                    <small className="block num text-xs font-medium text-muted">
                      {ach.progressText ?? ach.statusText}
                    </small>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <a
            href="#achievements"
            onClick={(e) => {
              e.preventDefault();
              navigate('achievements');
            }}
            className="mt-auto w-full inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] no-underline transition-colors hover:bg-panel2 hover:border-muted"
          >
            View all achievements
          </a>
        </section>
      </div>

      {/* Row 3: Daily Quests */}
      <section aria-label="Daily quests" className="grid gap-3 mt-1">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="m-0 text-[1.125rem] font-bold leading-snug tracking-[-0.01em]">
            Daily quests
          </h2>
          <div className="flex items-center gap-2">
            <span className="num text-[0.8125rem] font-semibold text-muted">
              {completedQuestsCount} of {dailyQuests.length} done
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-panel2 text-muted">
              Resets daily
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 max-[900px]:grid-cols-1 gap-4">
          {dailyQuests.map((q) => {
            const pct = q.target > 0 ? Math.round((q.progress / q.target) * 100) : 0;
            const actionLabel =
              q.id === 'daily-quiz'
                ? 'Go to lessons'
                : q.id === 'daily-lab'
                  ? 'Open lab'
                  : 'Ask BYTE';
            return (
              <article
                key={q.id}
                className="bg-panel border border-line rounded-2xl p-4 flex flex-col gap-3"
                style={
                  q.completed && !q.claimed
                    ? { borderColor: 'color-mix(in srgb, var(--cyan) 65%, var(--line))' }
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`grid place-items-center w-9 h-9 rounded-[10px] flex-none ${
                        q.completed ? 'text-cyan bg-panel2' : 'text-muted bg-panel2'
                      }`}
                    >
                      <Icon name={q.icon} className="w-[18px] h-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="m-0 text-sm font-bold leading-snug">{q.title}</h3>
                      <p className="m-0 text-xs text-muted">{q.description}</p>
                    </div>
                  </div>
                  <span className="num shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan/15 text-cyan">
                    +{q.xpReward} XP
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 rounded-full bg-panel2 overflow-hidden">
                    <i
                      className="sb-bar-fill block h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: q.claimed
                          ? 'var(--green)'
                          : q.completed
                            ? 'var(--cyan)'
                            : 'var(--muted)',
                      }}
                    />
                  </div>
                  <small className="num text-xs text-muted font-semibold">
                    {q.progress} / {q.target}
                  </small>
                </div>

                {q.claimed ? (
                  <span className="mt-auto inline-flex items-center justify-center gap-1.5 min-h-10 px-3 rounded-[10px] bg-green/15 text-green font-bold text-sm">
                    <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                    Claimed
                  </span>
                ) : q.completed ? (
                  <button
                    type="button"
                    onClick={() => claimDailyQuest(q.id)}
                    className="mt-auto w-full inline-flex items-center justify-center gap-1.5 min-h-10 px-3 border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-bold text-sm cursor-pointer hover:brightness-110 transition-all"
                  >
                    Claim +{q.xpReward} XP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerQuestAction(q.id)}
                    className="mt-auto w-full inline-flex items-center justify-center min-h-10 px-3 border border-line rounded-[10px] bg-transparent text-ink font-semibold text-sm cursor-pointer hover:bg-panel2 hover:border-muted transition-colors"
                  >
                    {actionLabel}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
