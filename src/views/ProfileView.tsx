import { Icon } from '../components/Icon';
import { getTrackProgress, LESSON_XP_BY_KEY, TRACKS } from '../data/curriculum';
import { formatXp } from '../data/leaderboard';
import { deriveAchievements, deriveActivityHeatmap } from '../domain/rules/progressViews';
import { calculateTotalXp, deriveLevel } from '../domain/rules/xp';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { TrackId } from '../types/streakbyte';

const HEAT_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const HEAT_LEVELS = ['', 'l1', 'l2', 'l3'] as const;

function heatBg(level: (typeof HEAT_LEVELS)[number]): string {
  if (level === 'l1') return 'color-mix(in srgb, var(--cyan) 28%, var(--panel2))';
  if (level === 'l2') return 'color-mix(in srgb, var(--cyan) 60%, var(--panel2))';
  if (level === 'l3') return 'var(--cyan)';
  return 'var(--panel3)';
}

export function ProfileView() {
  const theme = useStreakByteStore((s) => s.theme);
  const setTheme = useStreakByteStore((s) => s.setTheme);
  const settings = useStreakByteStore((s) => s.profileSettings);
  const updateProfileSettings = useStreakByteStore((s) => s.updateProfileSettings);
  const setSelectedTracks = useStreakByteStore((s) => s.setSelectedTracks);
  const saveProfileSettings = useStreakByteStore((s) => s.saveProfileSettings);
  const completions = useStreakByteStore((s) => s.completions);
  const streak = useStreakByteStore((s) => s.streak);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const xpSpent = useStreakByteStore((s) => s.xpSpent);
  const logout = useStreakByteStore((s) => s.logout);
  const authUser = useStreakByteStore((s) => s.authUser);

  const fullName = settings.displayName.trim() || authUser?.displayName || 'Learner';
  const initial = (fullName[0] || 'L').toUpperCase();
  const totalXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp, xpSpent);
  const level = deriveLevel(totalXp);
  const heatmap = deriveActivityHeatmap(completions);
  const achievements = deriveAchievements({
    completions,
    streak,
    totalXp,
    hwTotal: TRACKS.hw.lessons.length,
    leaderboardRank: null,
  });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const trackChoice: 'hw' | 'net' | 'both' =
    settings.selectedTracks.length > 1
      ? 'both'
      : settings.selectedTracks[0] === 'net'
        ? 'net'
        : 'hw';
  const chooseTracks = (choice: 'hw' | 'net' | 'both') => {
    const next: TrackId[] = choice === 'both' ? ['hw', 'net'] : [choice];
    setSelectedTracks(next);
  };

  return (
    <div className="w-full bg-panel">
      <section className="grid grid-cols-[auto_minmax(0,1fr)_auto] max-[760px]:grid-cols-1 gap-5 items-center p-6 max-[760px]:p-4 border-b border-line bg-panel2">
        {authUser?.avatarUrl ? (
          <img
            src={authUser.avatarUrl}
            alt={fullName}
            referrerPolicy="no-referrer"
            className="w-[72px] h-[72px] object-cover border border-ink"
          />
        ) : (
          <span className="grid place-items-center w-[72px] h-[72px] font-disp text-[28px] bg-cyan text-cyan-ink">
            {initial}
          </span>
        )}
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted">
            <span className="w-1.5 h-1.5 bg-cyan inline-block" aria-hidden="true" />
            <span>OPERATOR PROFILE</span>
          </div>
          <h1 className="m-0 mt-1 sb-page-title text-[32px]">
            {fullName}
          </h1>
          <p className="mt-1 mb-3 text-muted text-xs">
            Level {level.level}, {level.title} · {formatXp(totalXp)} total XP
          </p>
          <div className="flex items-center gap-3 max-w-[460px]">
            <div className="flex-1 grid grid-cols-10 gap-0.5" aria-hidden="true">
              {Array.from({ length: 10 }, (_, idx) => (
                <i
                  key={idx}
                  className={`block h-2.5 ${idx < Math.round((level.progressPct / 100) * 10) ? 'bg-cyan' : 'bg-panel3'
                    }`}
                />
              ))}
            </div>
            <small className="num text-muted text-[11px] font-bold whitespace-nowrap">
              {formatXp(level.currentLevelXp)} / {formatXp(level.nextLevelXp)} XP
            </small>
          </div>
          <p className="mt-1.5 mb-0 text-muted text-[11px]">
            {formatXp(level.xpToNext)} XP to Level {level.level + 1}
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center min-h-10 px-4 border border-line bg-panel text-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer hover:border-ink transition-colors justify-self-end max-[760px]:justify-self-start"
        >
          Log out
        </button>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)_390px] max-[1050px]:grid-cols-1 items-stretch">
        <div className="p-6 max-[760px]:p-4 border-r border-line max-[1050px]:border-r-0 max-[1050px]:border-b grid gap-5 content-start">
          <section className="border border-line bg-panel p-5">
            <h2 className="m-0 mb-1 font-head text-[18px] font-bold">Track progress</h2>
            <div className="grid gap-4 mt-3.5">
              {settings.selectedTracks.map((id) => {
                const trackInfo = TRACKS[id];
                const prog = getTrackProgress(id, completions);
                const pct =
                  prog.total === 0 ? 0 : Math.round((prog.doneCount / prog.total) * 100);
                return (
                  <div key={id}>
                    <div className="flex justify-between items-center gap-3 mb-1.5 font-bold text-xs uppercase tracking-[0.04em]">
                      <span>{trackInfo.heading}</span>
                      <span className="num text-[11px] text-muted">
                        {prog.doneCount} of {prog.total} lessons · {pct}%
                      </span>
                    </div>
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${prog.total}, minmax(0, 1fr))` }}
                      aria-hidden="true"
                    >
                      {prog.lessons.map((l) => (
                        <i
                          key={l.key}
                          className={`block h-2.5 ${l.status === 'done'
                              ? id === 'net'
                                ? 'bg-[var(--dark-card)]'
                                : 'bg-cyan'
                              : 'bg-panel3'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="border border-line bg-panel p-5">
            <div className="flex justify-between items-center gap-3">
              <h2 className="m-0 font-head text-[18px] font-bold">Activity, last 5 weeks</h2>
              <span className="flex gap-1 items-center text-muted text-[10px] font-bold uppercase tracking-[0.05em]">
                Less
                {HEAT_LEVELS.map((lvl) => (
                  <i
                    key={lvl || 'l0'}
                    className="w-3 h-3 inline-block border border-line"
                    style={{ background: heatBg(lvl) }}
                  />
                ))}
                More
              </span>
            </div>

            <div
              role="img"
              aria-label="Activity heatmap for the last five weeks"
              className="grid grid-cols-[20px_repeat(5,1fr)] gap-1 mt-3.5 items-center"
            >
              {HEAT_DAYS.map((day, r) => (
                <div key={`${day}-${r}`} className="contents">
                  <span className="text-muted text-[10px] font-bold">{day}</span>
                  {heatmap[r].map((lvl, c) => (
                    <i
                      key={c}
                      className="h-6 block border border-line"
                      style={{ background: heatBg(lvl) }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="border border-line bg-panel p-5">
            <div className="flex justify-between items-center gap-3 mb-3.5">
              <h2 className="m-0 font-head text-[18px] font-bold">Achievements</h2>
              <span className="num text-[11px] font-bold uppercase text-muted">
                {unlockedCount} of {achievements.length}
              </span>
            </div>

            <ul className="grid grid-cols-4 max-[760px]:grid-cols-2 border border-line">
              {achievements.map((badge) => (
                <li
                  key={badge.id}
                  className={`p-3 grid justify-items-center gap-1.5 text-center text-[11px] font-bold border-r border-b border-line ${badge.unlocked ? 'bg-panel text-ink' : 'bg-panel2 text-muted'
                    }`}
                >
                  <div
                    className={`grid place-items-center w-9 h-9 ${badge.unlocked
                        ? 'bg-cyan text-cyan-ink'
                        : 'border border-line bg-panel text-muted'
                      }`}
                  >
                    <Icon name={badge.unlocked ? badge.icon : 'lock'} className="w-4 h-4" />
                  </div>
                  <span className="font-head">{badge.title}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="p-6 max-[760px]:p-4 bg-panel2">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              void saveProfileSettings();
            }}
            className="bg-panel border border-line p-5"
          >
            <h2 className="m-0 mb-1 font-head text-[18px] font-bold">Settings</h2>

            <label
              htmlFor="s-n"
              className="block mt-3.5 mb-1 font-bold text-[10px] uppercase tracking-[0.07em] text-muted"
            >
              Display name
            </label>
            <input
              id="s-n"
              autoComplete="name"
              value={settings.displayName}
              onChange={(e) => updateProfileSettings({ displayName: e.target.value })}
              className="w-full min-h-10 px-3 border border-line bg-bg text-ink text-xs font-mono focus-visible:outline-none focus-visible:border-ink"
            />

            <label
              htmlFor="s-e"
              className="block mt-3.5 mb-1 font-bold text-[10px] uppercase tracking-[0.07em] text-muted"
            >
              School email
            </label>
            <input
              id="s-e"
              type="email"
              autoComplete="email"
              value={settings.email}
              onChange={(e) => updateProfileSettings({ email: e.target.value })}
              className="w-full min-h-10 px-3 border border-line bg-bg text-ink text-xs font-mono focus-visible:outline-none focus-visible:border-ink"
            />

            <label
              htmlFor="s-gemini"
              className="block mt-3.5 mb-1 font-bold text-[10px] uppercase tracking-[0.07em] text-muted"
            >
              Gemini API key <span className="font-normal">(optional)</span>
            </label>
            <input
              id="s-gemini"
              type="password"
              placeholder="Leave blank for offline responder"
              autoComplete="off"
              value={settings.geminiApiKey ?? ''}
              onChange={(e) => updateProfileSettings({ geminiApiKey: e.target.value })}
              className="w-full min-h-10 px-3 border border-line bg-bg text-ink text-xs font-mono focus-visible:outline-none focus-visible:border-ink"
            />
            <small className="block mt-1 text-muted text-[10.5px]">
              Powers live Study Buddy responses via Google Gemini. If empty or offline, built-in
              curriculum answers are used.
            </small>

            <span id="theme-l" className="block mt-4 mb-1.5 text-muted text-[10px] font-bold uppercase tracking-[0.07em]">
              Appearance
            </span>
            <div role="group" aria-labelledby="theme-l" className="grid grid-cols-2 border border-ink bg-panel">
              <button
                type="button"
                aria-pressed={theme === 'dark'}
                onClick={() => setTheme('dark')}
                className={`min-h-10 px-4 border-0 font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${theme === 'dark'
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-panel text-ink hover:bg-panel2'
                  }`}
              >
                Dark
              </button>
              <button
                type="button"
                aria-pressed={theme === 'light'}
                onClick={() => setTheme('light')}
                className={`min-h-10 px-4 border-0 border-l border-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${theme === 'light'
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-panel text-ink hover:bg-panel2'
                  }`}
              >
                Light
              </button>
            </div>

            <span id="tracks-l" className="block mt-4 mb-1.5 text-muted text-[10px] font-bold uppercase tracking-[0.07em]">
              Curriculum tracks
            </span>
            <div role="group" aria-labelledby="tracks-l" className="grid grid-cols-3 border border-ink bg-panel">
              {(
                [
                  ['hw', 'Hardware'],
                  ['net', 'Networking'],
                  ['both', 'Both'],
                ] as const
              ).map(([id, label], idx) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={trackChoice === id}
                  onClick={() => chooseTracks(id)}
                  className={`min-h-10 px-2 border-0 font-bold text-[10px] uppercase tracking-[0.05em] cursor-pointer transition-colors ${idx > 0 ? 'border-l border-ink' : ''
                    } ${trackChoice === id
                      ? 'bg-cyan text-cyan-ink'
                      : 'bg-panel text-ink hover:bg-panel2'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span id="goal-l" className="block mt-4 mb-1.5 text-muted text-[10px] font-bold uppercase tracking-[0.07em]">
              Daily goal
            </span>
            <div role="group" aria-labelledby="goal-l" className="grid grid-cols-2 border border-ink bg-panel">
              <button
                type="button"
                aria-pressed={settings.dailyGoal === '5'}
                onClick={() => updateProfileSettings({ dailyGoal: '5' })}
                className={`min-h-10 px-4 border-0 font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${settings.dailyGoal === '5'
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-panel text-ink hover:bg-panel2'
                  }`}
              >
                5 min
              </button>
              <button
                type="button"
                aria-pressed={settings.dailyGoal === '10'}
                onClick={() => updateProfileSettings({ dailyGoal: '10' })}
                className={`min-h-10 px-4 border-0 border-l border-ink font-bold text-[10.5px] uppercase tracking-[0.06em] cursor-pointer transition-colors ${settings.dailyGoal === '10'
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-panel text-ink hover:bg-panel2'
                  }`}
              >
                10 min
              </button>
            </div>

            <div className="flex justify-between items-center gap-3.5 py-3 mt-4 border-t border-line">
              <span>
                <b className="block text-xs uppercase tracking-[0.04em]">Daily reminder</b>
                <small className="text-muted text-[11px]">Nudge me before my streak ends</small>
              </span>
              <ToggleSwitch
                checked={settings.dailyReminder}
                label="Daily reminder"
                onToggle={() => updateProfileSettings({ dailyReminder: !settings.dailyReminder })}
              />
            </div>

            <div className="flex justify-between items-center gap-3.5 py-3 border-t border-line">
              <span>
                <b className="block text-xs uppercase tracking-[0.04em]">Sound effects</b>
              </span>
              <ToggleSwitch
                checked={settings.soundEffects}
                label="Sound effects"
                onToggle={() => updateProfileSettings({ soundEffects: !settings.soundEffects })}
              />
            </div>

            <div className="flex justify-between items-center gap-3.5 py-3 border-t border-line">
              <span>
                <b className="block text-xs uppercase tracking-[0.04em]">Hints on by default</b>
              </span>
              <ToggleSwitch
                checked={settings.hintsByDefault}
                label="Hints on by default"
                onToggle={() => updateProfileSettings({ hintsByDefault: !settings.hintsByDefault })}
              />
            </div>

            <button
              type="submit"
              className="sb-cut w-full mt-3.5 inline-flex items-center justify-center min-h-11 px-4 border border-cyan bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer hover:bg-[#e64b00] transition-colors"
            >
              Save changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  checked: boolean;
  label: string;
  onToggle: () => void;
}

function ToggleSwitch({ checked, label, onToggle }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className="relative w-12 min-h-10 bg-transparent border-0 py-1.5 cursor-pointer flex-none"
    >
      <span
        className={`block relative w-12 h-[26px] border transition-colors ${checked ? 'bg-cyan border-cyan' : 'bg-panel3 border-ink'
          }`}
      >
        <span
          className={`block absolute top-[2px] left-[2px] w-5 h-5 transition-transform duration-150 ${checked ? 'translate-x-[22px] bg-white' : 'translate-x-0 bg-ink'
            }`}
        />
      </span>
    </button>
  );
}
