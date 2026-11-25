import { CornerBrackets, IsometricCubeSvg } from '../components/ByteMascotSvg';
import { Icon } from '../components/Icon';
import { WelcomeMascot } from '../components/WelcomeMascot';
import { getTrackProgress, LESSON_XP_BY_KEY, lessonLabel, TRACKS } from '../data/curriculum';
import { formatXp, initialsFor } from '../data/leaderboard';
import { deriveDailyQuests, ensureDailyActivity } from '../domain/rules/dailyQuests';
import { lessonKeyFor } from '../domain/rules/lessonProgress';
import { deriveAchievements } from '../domain/rules/progressViews';
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
        <line x1="66" y1="90" x2="156" y2="90" stroke="#ff5500" strokeWidth="2.5" />
        <line x1="156" y1="90" x2="250" y2="52" stroke="#ff5500" strokeWidth="2.5" />
        <line x1="156" y1="90" x2="250" y2="128" stroke="var(--text)" strokeWidth="2" strokeDasharray="5 3" />
        <rect x="20" y="64" width="66" height="52" fill="var(--panel)" stroke="var(--text)" strokeWidth="1.8" />
        <text x="53" y="87" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="700" fill="var(--text)">
          ROUTER
        </text>
        <text x="53" y="101" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="var(--muted)">
          192.168.1.1
        </text>
        <rect x="122" y="64" width="68" height="52" fill="#141414" />
        <text x="156" y="87" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="700" fill="#ffffff">
          SWITCH
        </text>
        <text x="156" y="101" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#ff5500">
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
      <rect x="68" y="24" width="76" height="68" fill="#141414" />
      <rect x="80" y="36" width="52" height="44" fill="none" stroke="#ff5500" strokeWidth="1.8" />
      <text x="106" y="61" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8.5" fontWeight="700" fill="#ffffff">
        CPU
      </text>
      <g>
        <rect x="162" y="24" width="8" height="68" fill="var(--panel2)" stroke="var(--text)" strokeWidth="1" />
        <rect x="175" y="24" width="8" height="68" fill="#ff5500" stroke="var(--text)" strokeWidth="1" />
        <rect x="188" y="24" width="8" height="68" fill="var(--panel2)" stroke="var(--text)" strokeWidth="1" />
        <rect x="201" y="24" width="8" height="68" fill="#ff5500" stroke="var(--text)" strokeWidth="1" />
        <text x="185" y="105" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="700" fill="var(--text)">
          DIMM A2/B2
        </text>
      </g>
      <rect x="230" y="24" width="70" height="22" fill="#141414" />
      <text x="265" y="38" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="700" fill="#ffffff">
        24-PIN ATX
      </text>
      <rect x="228" y="64" width="72" height="22" fill="var(--you)" stroke="#ff5500" strokeWidth="1.4" strokeDasharray="4 2" />
      <text x="264" y="78" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="700" fill="#ff5500">
        M.2 NVMe
      </text>
      <rect x="68" y="132" width="142" height="16" fill="#141414" />
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
  const previewRows = ranked.slice(0, 5);
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

  const missionCode = String(safeIdx + 1).padStart(2, '0');
  const trackModeLabel = selectedTracks.map((id) => TRACKS[id].heading.replace(' Basics', '').toUpperCase()).join(' + ');

  return (
    <div className="w-full bg-panel">
      {/* Hero Poster Banner */}
      <div className="sb-enter border-b border-line pt-4 bg-panel overflow-hidden">
        <div className="flex justify-between px-5.5 pb-1.5" aria-hidden="true">
          <span className="w-1.5 h-1.5 bg-cyan inline-block" />
          <span className="w-1.5 h-1.5 bg-cyan inline-block" />
        </div>
        <div className="flex items-center gap-4 px-5.5 pb-3 max-[760px]:px-3.5 max-[760px]:gap-2.5">
          <WelcomeMascot />
          <h1 className="sb-hero-mega m-0 min-w-0 text-ink max-[760px]:text-[24px]">
            Welcome back, <span className="text-cyan">{firstName}</span>
          </h1>
        </div>
        <div className="border-t border-line px-5.5 max-[760px]:px-3.5 py-2.5 flex justify-between items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            <span>TRAINING MODE · {trackModeLabel}</span>
          </div>
          <span className="text-[10.5px] text-muted tracking-[0.04em]">{heroSubtitle}</span>
        </div>
      </div>

      {/* 3-Column Hero Matrix */}
      <div className="grid grid-cols-[1.15fr_1fr_0.95fr] max-[1024px]:grid-cols-1 border-b border-line">
        {/* Col 1: Active Mission */}
        <section
          aria-label="Continue learning"
          className="p-6 max-[760px]:p-4 border-r border-line max-[1024px]:border-r-0 max-[1024px]:border-b flex flex-col justify-between gap-4"
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
              MISSION {missionCode} · {activeTrack.heading}
            </div>
            <h2 className="m-0 mt-1.5 mb-2.5 sb-section-title text-[28px] text-balance">
              {nextLessonTitle}
            </h2>
            <p className="m-0 mb-4 text-muted text-[12px] max-w-[40ch]">{nextLesson.subtitle}</p>

            <div className="flex gap-2 flex-wrap mb-4">
              <span className="inline-flex items-center px-2.5 py-1 bg-[var(--dark-card)] text-white text-[10px] font-bold uppercase tracking-[0.06em]">
                +{nextLesson.xp} XP
              </span>
              <span className="inline-flex items-center px-2.5 py-1 border border-line bg-panel text-[10px] font-bold uppercase tracking-[0.06em] text-ink">
                {nextLesson.minutes} min
              </span>
            </div>

            <div className="flex justify-between text-[10.5px] font-bold uppercase tracking-[0.05em] mb-1.5">
              <span className="text-muted">Track progress</span>
              <span className="num text-ink">{trackPct}%</span>
            </div>
            <div
              className="grid grid-cols-10 gap-0.5 mb-1.5"
              role="progressbar"
              aria-label="Track progress"
              aria-valuenow={trackPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {Array.from({ length: 10 }, (_, idx) => (
                <i
                  key={idx}
                  className={`block h-2 ${idx < Math.round((trackPct / 100) * 10) ? 'bg-cyan' : 'bg-panel3'
                    }`}
                />
              ))}
            </div>
            <p className="m-0 text-muted text-[11px]">
              {activeProgress.doneCount} of {activeProgress.total} lessons complete in{' '}
              {activeTrack.heading}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => navigate(`learn/${nextLessonKey}`)}
              className="sb-cut inline-flex items-center justify-center gap-2 min-h-11 px-5 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-colors hover:bg-[#e64b00]"
            >
              <Icon name="play" className="w-4 h-4" />
              Start lesson
            </button>
          </div>
        </section>

        {/* Col 2: Mission Schematic */}
        <button
          type="button"
          onClick={() => navigate(`learn/${nextLessonKey}`)}
          aria-label={`Inspect ${nextLessonTitle} schematic in lesson`}
          className="relative sb-blueprint-dots border-0 border-r border-line max-[1024px]:border-r-0 max-[1024px]:border-b min-h-[276px] p-4 flex flex-col justify-between text-left cursor-pointer transition-colors hover:bg-panel3/40 group"
        >
          <CornerBrackets />
          <div className="w-full flex justify-between items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
              <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
              FIG {missionCode} // {activeTrackId === 'net' ? 'LAN SPEC' : 'BOARD SPEC'}
            </span>
            <span className="px-1.5 py-0.5 border border-line bg-panel text-[9px] font-bold uppercase tracking-[0.06em]">
              {activeTrackId === 'net' ? 'IPv4' : 'ATX'}
            </span>
          </div>
          <div className="flex-1 w-full grid place-items-center py-3 px-1">
            <MissionSchematic trackId={activeTrackId} />
          </div>
          <div className="w-full flex justify-between items-center gap-2 text-[9.5px] uppercase tracking-[0.06em] text-muted">
            <span>
              {activeTrackId === 'net'
                ? '4 NODES · GATEWAY & LAN LINKS'
                : '5 KEY ZONES · SOCKETS, SLOTS & PORTS'}
            </span>
            <span className="font-bold group-hover:text-cyan transition-colors">OPEN LESSON ↗</span>
          </div>
        </button>

        {/* Col 3: Next Reward Dark HUD + XP Level Progress */}
        <div className="grid grid-rows-[1fr_auto]">
          <div className="relative bg-[var(--dark-card)] text-white p-5 flex flex-col items-center justify-center text-center gap-2.5 min-h-[200px]">
            <CornerBrackets light />
            <IsometricCubeSvg size={54} />
            <div className="text-[9.5px] font-bold uppercase tracking-[0.11em] text-white/60">
              NEXT REWARD
            </div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em]">
              LEVEL {level.level + 1} · {nextLevelInfo.title}
            </div>
          </div>
          <div className="border-t border-line p-4 bg-panel grid gap-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.06em]">
              <span className="text-muted">XP TO LEVEL {level.level + 1}</span>
              <span className="num text-ink">
                {formatXp(level.currentLevelXp)} / {formatXp(level.nextLevelXp)}
              </span>
            </div>
            <div className="grid grid-cols-10 gap-[3px]" aria-hidden="true">
              {Array.from({ length: 10 }, (_, idx) => (
                <i
                  key={idx}
                  className={`block h-2.5 ${idx < levelSegmentsFilled ? 'bg-cyan' : 'bg-panel3'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Map / Selected Tracks */}
      <section aria-label="Tracks" className="p-6 max-[760px]:p-4 border-b border-line">
        <div className="flex justify-between items-end gap-4 flex-wrap mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
              MISSION MAP
            </div>
            <h2 id="tracks-heading" className="m-0 mt-1 sb-section-title text-[23px]">
              Clear the chain
            </h2>
            <div className="flex items-center gap-3 flex-wrap mt-1.5">
              {selectedTracks.map((id) => {
                const t = TRACKS[id];
                const prog = getTrackProgress(id, completions);
                const isActive = id === activeTrackId;
                return (
                  <h3
                    key={id}
                    className={`m-0 text-[11px] font-bold uppercase tracking-[0.06em] inline-flex items-center gap-1.5 ${isActive ? 'text-ink' : 'text-muted'
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
            <div role="group" aria-label="Mission track selector" className="inline-flex border border-ink bg-panel">
              {selectedTracks.map((id, idx) => {
                const isActive = id === activeTrackId;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setTrack(id)}
                    className={`px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.08em] border-0 cursor-pointer transition-colors ${idx > 0 ? 'border-l border-ink' : ''
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
          className={`grid border border-line ${activeTrack.lessons.length === 6
            ? 'grid-cols-6 max-[1024px]:grid-cols-3 max-[600px]:grid-cols-2'
            : 'grid-cols-5 max-[1024px]:grid-cols-3 max-[600px]:grid-cols-2'
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

            const cardBg = isBoss && !isLock && !isCur
              ? 'bg-[var(--dark-card)] text-white'
              : isCur
                ? 'bg-cyan text-cyan-ink'
                : isLock
                  ? 'bg-panel3 text-muted'
                  : 'bg-panel text-ink';

            return (
              <article
                key={lesson.title}
                className={`p-4 border-r border-b border-line last:border-r-0 flex flex-col min-h-[182px] ${cardBg}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`font-disp text-[26px] leading-none ${isDone
                      ? 'text-muted/60'
                      : isBoss && !isCur
                        ? 'text-cyan'
                        : isLock
                          ? 'text-muted/70'
                          : ''
                      }`}
                  >
                    {num}
                  </span>
                  <span aria-hidden="true" className="text-xs font-bold">
                    {isDone ? '✓' : isCur ? '▶' : isBoss ? '★' : '🔒'}
                  </span>
                </div>

                <h4 className="m-0 mb-1.5 font-head text-[14.5px] font-bold leading-snug">
                  {isBoss ? `Boss: ${lesson.title.replace(/^Final Lesson:\s*/i, '')}` : lesson.title}
                </h4>
                <div className="text-[10px] uppercase tracking-[0.04em] opacity-75 mb-4">
                  {isBoss ? 'LAB' : `+${lesson.xp} XP`} · {lesson.minutes} MIN
                </div>

                <div className="mt-auto">
                  {isLock ? (
                    <span className="sb-cut-sm inline-flex items-center px-2.5 py-1 bg-panel2 text-muted text-[10px] font-bold uppercase tracking-[0.06em]">
                      Locked
                    </span>
                  ) : isBoss ? (
                    <button
                      type="button"
                      onClick={() => openSetup(activeTrack.defaultTarget, lesson.title)}
                      className="sb-cut-sm inline-flex items-center px-3 py-1.5 border-0 bg-cyan text-cyan-ink text-[10px] font-bold uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00]"
                    >
                      Boss Lab
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`learn/${key}`)}
                      className="sb-cut-sm inline-flex items-center px-3 py-1.5 border-0 bg-[var(--dark-card)] text-white text-[10px] font-bold uppercase tracking-[0.06em] cursor-pointer hover:opacity-90"
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

      {/* Daily Quests */}
      <section aria-label="Daily quests" className="p-6 max-[760px]:p-4 border-b border-line">
        <div className="flex items-end justify-between gap-3 flex-wrap mb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
              DAILY QUESTS · RESETS DAILY
            </div>
            <h2 className="m-0 mt-1 sb-section-title text-[23px]">
              Collect today’s XP
            </h2>
          </div>
          <span className="num text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted">
            {completedQuestsCount} of {dailyQuests.length} done
          </span>
        </div>

        <div className="grid grid-cols-4 max-[1024px]:grid-cols-2 max-[600px]:grid-cols-1 border border-line">
          {dailyQuests.map((q, idx) => {
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
                className="p-4 border-r border-line max-[1024px]:border-b flex flex-col gap-2.5 bg-panel"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
                    QUEST 0{idx + 1}
                  </span>
                  <span className="num px-2 py-0.5 bg-you text-cyan text-[10px] font-bold uppercase tracking-[0.05em]">
                    +{q.xpReward} XP
                  </span>
                </div>

                <h3 className="m-0 font-head text-[15px] font-bold leading-snug">{q.title}</h3>
                <p className="m-0 text-[11px] text-muted flex-1">{q.description}</p>

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
                  <small className="num text-[10px] text-muted font-bold">
                    {q.progress} / {q.target}
                  </small>
                </div>

                {q.claimed ? (
                  <span className="mt-1 inline-flex items-center justify-center gap-1.5 min-h-9 px-3 border border-green bg-green/12 text-green font-bold text-[10.5px] uppercase tracking-[0.06em]">
                    <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Claimed
                  </span>
                ) : q.completed ? (
                  <button
                    type="button"
                    onClick={() => claimDailyQuest(q.id)}
                    className="sb-cut mt-1 w-full inline-flex items-center justify-center gap-1.5 min-h-10 px-3 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00] transition-colors"
                  >
                    Claim +{q.xpReward} XP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerQuestAction(q.id)}
                    className="mt-1 w-full inline-flex items-center justify-center min-h-10 px-3 border border-line bg-panel text-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer hover:border-ink hover:bg-panel2 transition-colors"
                  >
                    {actionLabel}
                  </button>
                )}
              </article>
            );
          })}

          <aside className="p-4 bg-[var(--dark-card)] text-white flex flex-col gap-2.5">
            <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-white/60">
              DAILY BONUS
            </div>
            <div className="font-head text-[20px] font-bold">
              {completedQuestsCount === dailyQuests.length ? 'All Clear' : 'In Progress'}
            </div>
            <div className="grid grid-cols-3 gap-1" aria-hidden="true">
              {dailyQuests.map((q) => (
                <i
                  key={q.id}
                  className={`block h-2.5 ${q.completed ? 'bg-cyan' : 'bg-white/20'}`}
                />
              ))}
            </div>
            <p className="m-0 text-[11px] text-white/70">
              Complete all {dailyQuests.length} daily goals ({completedQuestsCount} of {dailyQuests.length}).
            </p>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="sb-cut-sm mt-auto inline-flex items-center justify-center min-h-9 px-3 border border-[var(--dark-line)] bg-transparent text-white font-bold text-[10px] uppercase tracking-[0.06em] cursor-pointer hover:border-white transition-colors"
            >
              Ask BYTE-01 ▶
            </button>
          </aside>
        </div>
      </section>

      {/* Bottom 2-Column Split: Class League & Trophy Wall */}
      <div className="grid grid-cols-2 max-[1024px]:grid-cols-1">
        <aside aria-label="Leaderboard" className="p-6 max-[760px]:p-4 border-r border-line max-[1024px]:border-r-0 max-[1024px]:border-b flex flex-col">
          <div className="flex justify-between items-end gap-3 mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
                CLASS LEAGUE · {isGuest ? 'LOCAL PROGRESS' : 'THIS WEEK'}
              </div>
              <h2 className="m-0 mt-1 sb-section-title text-[23px]">
                Leaderboard
              </h2>
            </div>
            <a
              href="#leaderboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('leaderboard');
              }}
              className="inline-flex items-center justify-center min-h-8 px-3 border border-line bg-panel text-ink font-bold text-[10px] uppercase tracking-[0.06em] no-underline hover:border-ink hover:bg-panel2 transition-colors"
            >
              View full leaderboard
            </a>
          </div>

          <ol className="border border-line">
            {previewRows.map((row) => (
              <li
                key={row.userId}
                aria-current={row.isYou ? 'true' : undefined}
                className={`grid grid-cols-[24px_30px_minmax(0,1fr)_auto_auto] gap-2.5 items-center px-3.5 py-2.5 border-b border-line last:border-b-0 ${row.isYou ? 'bg-you font-bold' : 'bg-panel'
                  }`}
              >
                <span className="num text-muted text-xs text-center font-bold">{row.rank}</span>
                {row.avatarUrl ? (
                  <img
                    src={row.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-[30px] h-[30px] object-cover border border-line"
                  />
                ) : (
                  <span
                    className={`grid place-items-center w-[30px] h-[30px] font-bold text-[11px] ${row.isYou ? 'bg-cyan text-cyan-ink' : 'bg-panel2 text-ink border border-line'
                      }`}
                  >
                    {initialsFor(row.name)}
                  </span>
                )}
                <span className="font-head font-bold text-[13px] truncate">
                  {row.isYou ? `${row.name} (you)` : row.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.05em] text-muted max-[600px]:hidden">
                  {row.streakDays} streak
                </span>
                <b className="font-disp text-[14px] num">{formatXp(row.xp)}</b>
              </li>
            ))}
          </ol>
        </aside>

        <section aria-label="Achievements" className="p-6 max-[760px]:p-4 flex flex-col">
          <div className="flex justify-between items-end gap-3 mb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
                BADGES · {unlockedCount} OF {achievements.length} UNLOCKED
              </div>
              <h2 className="m-0 mt-1 sb-section-title text-[23px]">
                Trophy wall
              </h2>
            </div>
            <a
              href="#achievements"
              onClick={(e) => {
                e.preventDefault();
                navigate('achievements');
              }}
              className="inline-flex items-center justify-center min-h-8 px-3 border border-line bg-panel text-ink font-bold text-[10px] uppercase tracking-[0.06em] no-underline hover:border-ink hover:bg-panel2 transition-colors"
            >
              View all achievements
            </a>
          </div>

          <ul className="grid grid-cols-4 max-[600px]:grid-cols-2 border border-line">
            {achievements.map((ach, idx) => (
              <li
                key={ach.id}
                className={`p-3.5 text-center flex flex-col items-center gap-1.5 border-r border-b border-line ${idx % 4 === 3 ? 'min-[601px]:border-r-0' : ''
                  } ${idx >= 4 ? 'min-[601px]:border-b-0' : ''} ${ach.unlocked ? 'bg-panel text-ink' : 'bg-panel2 text-muted'
                  }`}
              >
                <div
                  className={`grid place-items-center w-7 h-7 ${ach.unlocked
                    ? 'bg-cyan text-cyan-ink'
                    : 'border border-line bg-panel text-muted'
                    }`}
                >
                  <Icon name={ach.icon} className="w-4 h-4" />
                </div>
                <span className="font-head text-[11.5px] font-bold leading-tight">{ach.title}</span>
                <small className="text-[9px] uppercase tracking-[0.06em] text-muted">
                  {ach.unlocked ? 'Unlocked' : ach.progressText ?? ach.statusText}
                </small>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
