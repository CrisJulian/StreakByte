import { CornerBrackets, IsometricCubeSvg } from '../components/ByteMascotSvg';
import { Icon } from '../components/Icon';
import { WelcomeMascot } from '../components/WelcomeMascot';
import { getTrackProgress, LESSON_XP_BY_KEY, lessonLabel, TRACKS } from '../data/curriculum';
import { formatXp } from '../data/leaderboard';
import { deriveDailyQuests, ensureDailyActivity } from '../domain/rules/dailyQuests';
import { lessonKeyFor } from '../domain/rules/lessonProgress';
import {
  calculateTotalXp,
  calculateWeeklyXp,
  deriveLevel,
  effectiveStreak,
  localDayString,
  mergeLeaderboard,
  XP_PER_LEVEL,
} from '../domain/rules/xp';
import { useStreakByteStore } from '../store/useStreakByteStore';

function MissionSchematic({ trackId }: { trackId: 'hw' | 'net' }) {
  if (trackId === 'net') {
    return (
      <svg
        viewBox="0 0 320 180"
        className="w-full max-w-[340px] h-auto block"
        role="img"
        aria-label="LAN topology schematic showing Router, Switch, Workstation, and Laptop"
      >
        <rect x="8" y="8" width="304" height="164" fill="var(--panel)" stroke="var(--text)" strokeWidth="2" />
        <line x1="66" y1="90" x2="156" y2="90" stroke="var(--cyan)" strokeWidth="2.5" />
        <line x1="156" y1="90" x2="250" y2="52" stroke="var(--cyan)" strokeWidth="2.5" />
        <line x1="156" y1="90" x2="250" y2="128" stroke="var(--text)" strokeWidth="2" strokeDasharray="5 3" />
        <rect x="20" y="64" width="66" height="52" fill="var(--panel)" stroke="var(--text)" strokeWidth="1.8" />
        <text x="53" y="87" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="700" fill="var(--text)">
          ROUTER
        </text>
        <text x="53" y="101" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="var(--muted)">
          192.168.1.1
        </text>
        <rect x="122" y="64" width="68" height="52" fill="var(--dark-card)" stroke="var(--line)" strokeWidth="1" />
        <text x="156" y="87" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="700" fill="#ffffff">
          SWITCH
        </text>
        <text x="156" y="101" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="var(--cyan)">
          8-PORT L2
        </text>
        <rect x="218" y="30" width="80" height="44" fill="var(--panel)" stroke="var(--text)" strokeWidth="1.6" />
        <text x="258" y="50" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700" fill="var(--text)">
          WORKSTATION
        </text>
        <text x="258" y="63" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="var(--muted)">
          .1.10 /24
        </text>
        <rect x="218" y="106" width="80" height="44" fill="var(--panel)" stroke="var(--text)" strokeWidth="1.6" />
        <text x="258" y="126" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700" fill="var(--text)">
          LAPTOP
        </text>
        <text x="258" y="139" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="var(--muted)">
          .1.11 /24
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 320 180"
      className="w-full max-w-[340px] h-auto block"
      role="img"
      aria-label="ATX Motherboard schematic highlighting CPU socket, DIMM A2/B2, M.2, PCIe x16, and 24-pin power"
    >
      <rect x="8" y="8" width="304" height="164" fill="var(--panel)" stroke="var(--text)" strokeWidth="2" />
      <rect x="16" y="18" width="32" height="144" fill="var(--panel3)" stroke="var(--text)" strokeWidth="1.4" />
      <text x="32" y="92" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700" fill="var(--text)" transform="rotate(-90 32 92)">
        REAR I/O
      </text>
      <rect x="68" y="24" width="76" height="68" fill="var(--dark-card)" stroke="var(--line)" strokeWidth="1" />
      <rect x="80" y="36" width="52" height="44" fill="none" stroke="var(--cyan)" strokeWidth="1.8" />
      <text x="106" y="61" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="700" fill="#ffffff">
        CPU
      </text>
      <g>
        <rect x="162" y="24" width="8" height="68" fill="var(--panel2)" stroke="var(--text)" strokeWidth="1" />
        <rect x="175" y="24" width="8" height="68" fill="var(--cyan)" stroke="var(--text)" strokeWidth="1" />
        <rect x="188" y="24" width="8" height="68" fill="var(--panel2)" stroke="var(--text)" strokeWidth="1" />
        <rect x="201" y="24" width="8" height="68" fill="var(--cyan)" stroke="var(--text)" strokeWidth="1" />
        <text x="185" y="105" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="700" fill="var(--text)">
          DIMM A2/B2
        </text>
      </g>
      <rect x="230" y="24" width="70" height="22" fill="var(--dark-card)" stroke="var(--line)" strokeWidth="1" />
      <text x="265" y="38" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="700" fill="#ffffff">
        24-PIN ATX
      </text>
      <rect x="228" y="64" width="72" height="22" fill="var(--you)" stroke="var(--cyan)" strokeWidth="1.4" strokeDasharray="4 2" />
      <text x="264" y="78" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="700" fill="var(--cyan)">
        M.2 NVMe
      </text>
      <rect x="68" y="132" width="142" height="16" fill="var(--dark-card)" stroke="var(--line)" strokeWidth="1" />
      <text x="139" y="143" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="700" fill="#ffffff">
        PCIe x16 (GPU)
      </text>
      <rect x="242" y="118" width="52" height="40" fill="var(--panel3)" stroke="var(--text)" strokeWidth="1.2" />
      <text x="268" y="141" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fontWeight="700" fill="var(--text)">
        CHIPSET
      </text>
    </svg>
  );
}

export function DashboardView() {
  const openSetup = useStreakByteStore((s) => s.openSetup);
  const setTrack = useStreakByteStore((s) => s.setTrack);
  const navigate = useStreakByteStore((s) => s.navigate);
  const setChatOpen = useStreakByteStore((s) => s.setChatOpen);
  const setArenaTab = useStreakByteStore((s) => s.setArenaTab);
  const claimDailyQuest = useStreakByteStore((s) => s.claimDailyQuest);
  const track = useStreakByteStore((s) => s.track);
  const completions = useStreakByteStore((s) => s.completions);
  const streak = useStreakByteStore((s) => s.streak);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const xpSpent = useStreakByteStore((s) => s.xpSpent);
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
  const totalXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp, xpSpent);
  const weeklyXp = calculateWeeklyXp(completions, LESSON_XP_BY_KEY, new Date(), labBonusXp, xpSpent);
  const level = deriveLevel(totalXp);
  const nextLevelInfo = deriveLevel((level.level) * XP_PER_LEVEL);
  const levelSegmentsFilled = Math.min(10, Math.round((level.progressPct / 100) * 10));

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
  const me = ranked.find((r) => r.isYou) ?? ranked[0];
  const dailyQuests = deriveDailyQuests(ensureDailyActivity(dailyActivity, today));
  const completedQuestsCount = dailyQuests.filter((q) => q.completed).length;

  const triggerQuestAction = (id: (typeof dailyQuests)[number]['id']) => {
    if (id === 'daily-quiz') {
      navigate('curriculum');
    } else if (id === 'daily-lab') {
      openSetup(activeTrack.defaultTarget, nextLessonTitle);
    } else if (id === 'daily-arena') {
      setArenaTab('duel');
      navigate('arena');
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

  const trackModeLabel = selectedTracks.map((id) => TRACKS[id].heading.replace(' Basics', '')).join(' + ');

  return (
    <div className="w-full min-h-full bg-bg">
      <div className="max-w-[1320px] mx-auto px-6 py-7 max-[760px]:px-4 max-[760px]:py-5 grid gap-7">
        {/* Tier 1: Operate-mode Greeting Header */}
        <header className="sb-enter flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <WelcomeMascot />
            <div className="min-w-0">
              <h1 className="m-0 font-disp text-[38px] max-[760px]:text-[26px] leading-[1.1] tracking-[-0.025em] text-ink">
                Welcome back, <span className="text-cyan">{firstName}</span>
              </h1>
              <p className="m-0 mt-1.5 text-[16px] max-[760px]:text-[14.5px] text-muted">{heroSubtitle}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-line bg-panel text-[12.5px] text-muted">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            <span>
              Track mode: <strong className="text-ink font-semibold">{trackModeLabel}</strong>
            </span>
          </div>
        </header>

        {/* Tier 2: Primary Focal Point — Next Lesson Hero */}
        <div className="grid grid-cols-[1.35fr_1fr] max-[1024px]:grid-cols-1 border border-line border-t-2 border-t-cyan bg-panel">
          <section
            aria-label="Continue learning"
            className="p-7 max-[760px]:p-5 border-r border-line max-[1024px]:border-r-0 max-[1024px]:border-b flex flex-col justify-between gap-6"
          >
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-panel2 border border-line text-[12px] font-semibold text-ink">
                  <Icon name={activeTrackId === 'net' ? 'net' : 'cpu'} className="w-3.5 h-3.5 text-cyan" />
                  {activeTrack.heading}
                </span>
                <span className="num inline-flex items-center px-2.5 py-1 bg-you text-cyan text-[12px] font-bold">
                  +{nextLesson.xp} XP
                </span>
                <span className="num inline-flex items-center gap-1.5 px-2.5 py-1 border border-line bg-panel text-[12px] font-medium text-muted">
                  <Icon name="clock" className="w-3.5 h-3.5" />
                  {nextLesson.minutes} min
                </span>
              </div>

              <h2 className="m-0 font-disp text-[32px] max-[760px]:text-[24px] leading-[1.12] tracking-[-0.025em] text-ink text-balance">
                {nextLessonTitle}
              </h2>
              <p className="m-0 mt-2.5 text-[14.5px] leading-[1.55] text-muted max-w-[52ch]">
                {nextLesson.subtitle}
              </p>

              <div className="mt-6">
                <div className="flex justify-between items-baseline gap-2 mb-2">
                  <span className="text-[13px] font-medium text-muted">
                    Track progress · {activeProgress.doneCount} of {activeProgress.total} lessons
                  </span>
                  <span className="num text-[14px] font-bold text-ink">{trackPct}%</span>
                </div>
                <div
                  className="grid grid-cols-10 gap-1"
                  role="progressbar"
                  aria-label="Track progress"
                  aria-valuenow={trackPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {Array.from({ length: 10 }, (_, idx) => (
                    <i
                      key={idx}
                      className={`block h-2 ${
                        idx < Math.round((trackPct / 100) * 10) ? 'bg-cyan' : 'bg-panel3'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`learn/${nextLessonKey}`)}
                className="sb-cut inline-flex items-center justify-center gap-2.5 min-h-12 px-6 border border-cyan bg-cyan text-cyan-ink font-head font-bold text-[14px] cursor-pointer transition-colors hover:brightness-110"
              >
                <Icon name="play" className="w-4 h-4" />
                Start lesson
              </button>
            </div>
          </section>

          <div className="grid grid-rows-[1fr_auto] bg-panel">
            <div className="relative sb-blueprint-dots min-h-[220px] p-5 flex flex-col justify-between">
              <CornerBrackets />
              <div className="w-full flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted">
                  <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
                  {activeTrackId === 'net' ? 'Office LAN Topology' : 'ATX Motherboard'}
                </span>
              </div>
              <div className="flex-1 w-full grid place-items-center py-3 px-1">
                <MissionSchematic trackId={activeTrackId} />
              </div>
            </div>

            <div className="border-t border-line px-5 py-4 bg-[var(--dark-card)] text-white grid gap-2.5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <IsometricCubeSvg size={30} />
                  <div>
                    <div className="text-[11px] font-medium text-white/65">Next level</div>
                    <div className="font-head text-[14px] font-bold leading-tight">
                      Level {level.level + 1} · {nextLevelInfo.title}
                    </div>
                  </div>
                </div>
                <span className="num text-[12px] font-semibold text-white/85">
                  {formatXp(level.currentLevelXp)} / {formatXp(level.nextLevelXp)} XP
                </span>
              </div>
              <div className="grid grid-cols-10 gap-1" aria-hidden="true">
                {Array.from({ length: 10 }, (_, idx) => (
                  <i
                    key={idx}
                    className={`block h-2 ${idx < levelSegmentsFilled ? 'bg-cyan' : 'bg-white/15'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tier 3: Mission Map */}
        <section aria-label="Tracks" className="bg-panel border border-line p-6 max-[760px]:p-4">
          <div className="flex justify-between items-start gap-4 flex-wrap mb-5">
            <div>
              <h2 id="tracks-heading" className="m-0 font-disp text-[22px] leading-tight tracking-[-0.02em] text-ink">
                Mission map
              </h2>
              <div className="flex items-center gap-4 flex-wrap mt-2">
                {selectedTracks.map((id) => {
                  const t = TRACKS[id];
                  const prog = getTrackProgress(id, completions);
                  const isActive = id === activeTrackId;
                  return (
                    <h3
                      key={id}
                      className={`m-0 text-[13px] font-semibold inline-flex items-center gap-1.5 ${
                        isActive ? 'text-ink' : 'text-muted'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 inline-block ${isActive ? 'bg-cyan' : 'bg-muted'}`}
                        aria-hidden="true"
                      />
                      {t.heading} ({prog.doneCount}/{prog.total})
                    </h3>
                  );
                })}
              </div>
            </div>

            {selectedTracks.length > 1 && (
              <div role="group" aria-label="Mission track selector" className="inline-flex border border-line bg-panel">
                {selectedTracks.map((id, idx) => {
                  const isActive = id === activeTrackId;
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setTrack(id)}
                      className={`px-3.5 py-2 text-[13px] font-semibold border-0 cursor-pointer transition-colors ${
                        idx > 0 ? 'border-l border-line' : ''
                      } ${isActive ? 'bg-cyan text-cyan-ink' : 'bg-panel text-ink hover:bg-panel2'}`}
                    >
                      {id === 'hw' ? 'Hardware' : 'Networking'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className={`grid gap-3 ${
              activeTrack.lessons.length === 6
                ? 'grid-cols-6 max-[1180px]:grid-cols-3 max-[600px]:grid-cols-2'
                : 'grid-cols-5 max-[1180px]:grid-cols-3 max-[600px]:grid-cols-2'
            }`}
          >
            {activeTrack.lessons.map((lesson, idx) => {
              const derived = activeProgress.lessons[idx];
              const key = lessonKeyFor(activeTrackId, idx);
              const isDone = derived.status === 'done';
              const isCur = derived.status === 'cur';
              const isLock = derived.status === 'lock';
              const isBoss = lesson.kind === 'final';
              const num = String(idx + 1).padStart(2, '0');

              const cardStyle =
                isBoss && !isLock && !isCur
                  ? 'border-line bg-[var(--dark-card)] text-white'
                  : isCur
                    ? 'border-cyan bg-cyan text-cyan-ink'
                    : isLock
                      ? 'border-line/70 bg-panel2/60 text-muted'
                      : 'border-line bg-panel text-ink';

              return (
                <article key={lesson.title} className={`border p-4 flex flex-col min-h-[168px] ${cardStyle}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="num text-[12px] font-bold opacity-75">{num}</span>
                    <span aria-hidden="true" className="inline-flex items-center">
                      {isDone ? (
                        <Icon name="check" className="w-4 h-4 text-green" strokeWidth={2.5} />
                      ) : isCur ? (
                        <Icon name="play" className="w-4 h-4 text-cyan-ink" />
                      ) : isLock ? (
                        <Icon name="lock" className="w-3.5 h-3.5 text-muted" />
                      ) : isBoss ? (
                        <Icon name="trophy" className="w-4 h-4 text-cyan" />
                      ) : (
                        <Icon name="book" className="w-3.5 h-3.5 text-muted" />
                      )}
                    </span>
                  </div>

                  <h4 className="m-0 mb-1.5 font-head text-[14.5px] font-bold leading-snug">
                    {isBoss ? `Boss: ${lesson.title.replace(/^Final Lesson:\s*/i, '')}` : lesson.title}
                  </h4>
                  <div className="num text-[12px] opacity-80 mb-4">
                    {isBoss ? 'Lab' : `+${lesson.xp} XP`} · {lesson.minutes} min
                  </div>

                  <div className="mt-auto">
                    {isLock ? (
                      <span className="sb-cut-sm inline-flex items-center px-3 py-1.5 bg-panel2 text-muted text-[12px] font-semibold">
                        Locked
                      </span>
                    ) : isBoss ? (
                      <button
                        type="button"
                        onClick={() => openSetup(activeTrack.defaultTarget, lesson.title)}
                        className="sb-cut-sm inline-flex items-center px-3.5 py-1.5 border-0 bg-cyan text-cyan-ink text-[12px] font-semibold cursor-pointer hover:brightness-110"
                      >
                        Boss Lab
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`learn/${key}`)}
                        className={`sb-cut-sm inline-flex items-center px-3.5 py-1.5 border-0 text-[12px] font-semibold cursor-pointer ${
                          isCur
                            ? 'bg-[var(--dark-card)] text-white hover:opacity-90'
                            : 'bg-panel2 text-ink hover:bg-panel3'
                        }`}
                      >
                        {isDone ? 'Cleared' : 'Play now'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Tier 4: Daily Quests */}
        <section aria-label="Daily quests" className="bg-panel border border-line p-6 max-[760px]:p-4">
          <div className="flex items-end justify-between gap-3 flex-wrap mb-5">
            <div>
              <h2 className="m-0 font-disp text-[22px] leading-tight tracking-[-0.02em] text-ink">
                Daily quests
              </h2>
              <p className="m-0 mt-1 text-[13px] text-muted">
                Resets daily · complete goals to claim bonus XP
              </p>
            </div>
            <span className="num text-[13px] font-bold text-ink">
              {completedQuestsCount} / {dailyQuests.length} done
            </span>
          </div>

          <div className="grid grid-cols-4 max-[1024px]:grid-cols-2 max-[600px]:grid-cols-1 gap-3">
            {dailyQuests.map((q) => {
              const pct = q.target > 0 ? Math.round((q.progress / q.target) * 100) : 0;
              const actionLabel =
                q.id === 'daily-quiz'
                  ? 'Go to lessons'
                  : q.id === 'daily-lab'
                    ? 'Open lab'
                    : q.id === 'daily-arena'
                      ? 'Enter Arena'
                      : 'Ask BYTE';
              return (
                <article key={q.id} className="p-4 border border-line bg-bg/40 flex flex-col gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="m-0 font-head text-[15px] font-bold leading-snug text-ink">{q.title}</h3>
                    <span className="num shrink-0 px-2 py-0.5 bg-you text-cyan text-[12px] font-bold">
                      +{q.xpReward} XP
                    </span>
                  </div>

                  <p className="m-0 text-[13px] leading-[1.45] text-muted flex-1">{q.description}</p>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-panel3 overflow-hidden">
                      <i
                        className="sb-bar-fill block h-full"
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
                    <small className="num text-[12px] text-muted font-semibold">
                      {q.progress} / {q.target}
                    </small>
                  </div>

                  {q.claimed ? (
                    <span className="mt-1 inline-flex items-center justify-center gap-1.5 min-h-10 px-3 border border-green bg-green/12 text-green font-semibold text-[12.5px]">
                      <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Claimed
                    </span>
                  ) : q.completed ? (
                    <button
                      type="button"
                      onClick={() => claimDailyQuest(q.id)}
                      className="sb-cut mt-1 w-full inline-flex items-center justify-center gap-1.5 min-h-10 px-3 border border-cyan bg-cyan text-cyan-ink font-semibold text-[12.5px] cursor-pointer hover:brightness-110 transition-colors"
                    >
                      Claim +{q.xpReward} XP
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerQuestAction(q.id)}
                      className="mt-1 w-full inline-flex items-center justify-center min-h-10 px-3 border border-line bg-panel text-ink font-semibold text-[12.5px] cursor-pointer hover:border-ink hover:bg-panel2 transition-colors"
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
    </div>
  );
}
