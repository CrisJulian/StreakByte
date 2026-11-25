import { Icon } from '../components/Icon';
import { PROFILE_BADGES } from '../data/achievements';
import { useStreakByteStore } from '../store/useStreakByteStore';

const HEAT_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const HEAT_LEVELS = ['', 'l1', 'l2', 'l3'] as const;

function heatBg(level: (typeof HEAT_LEVELS)[number]): string {
  if (level === 'l1') return 'color-mix(in srgb, var(--green) 28%, var(--panel2))';
  if (level === 'l2') return 'color-mix(in srgb, var(--green) 58%, var(--panel2))';
  if (level === 'l3') return 'var(--green)';
  return 'var(--panel2)';
}

export function ProfileView() {
  const theme = useStreakByteStore((s) => s.theme);
  const setTheme = useStreakByteStore((s) => s.setTheme);
  const settings = useStreakByteStore((s) => s.profileSettings);
  const updateProfileSettings = useStreakByteStore((s) => s.updateProfileSettings);
  const showToast = useStreakByteStore((s) => s.showToast);
  const logout = useStreakByteStore((s) => s.logout);
  const authUser = useStreakByteStore((s) => s.authUser);

  const fullName = settings.displayName.trim() || authUser?.displayName || 'Learner';
  const initial = (fullName[0] || 'L').toUpperCase();

  return (
    <div>
      <section
        className="grid grid-cols-[auto_minmax(0,1fr)] max-[760px]:grid-cols-1 gap-[22px] items-center p-[26px] mb-5 rounded-2xl border"
        style={{
          background: 'color-mix(in srgb, var(--cyan) 12%, var(--panel))',
          borderColor: 'color-mix(in srgb, var(--cyan) 35%, var(--line))',
        }}
      >
        {authUser?.avatarUrl ? (
          <img
            src={authUser.avatarUrl}
            alt={fullName}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-[18px] object-cover border border-line"
          />
        ) : (
          <span className="grid place-items-center w-20 h-20 rounded-[18px] text-[2rem] font-bold bg-amber text-amber-ink">
            {initial}
          </span>
        )}
        <div>
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em]">
            {fullName}
          </h1>
          <p className="mt-1 mb-3.5 text-muted">Level 4, Beginner · Joined September 2026</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-panel2 overflow-hidden">
              <i className="sb-bar-fill block h-full rounded-full bg-amber" style={{ width: '83%' }} />
            </div>
            <small className="num text-muted text-[0.8125rem] whitespace-nowrap">
              1,240 / 1,500 XP
            </small>
          </div>
          <p className="mt-2 mb-0 text-muted text-sm">260 XP to Level 5</p>
        </div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)_400px] max-[1100px]:grid-cols-1 gap-5 items-start">
        <div className="grid gap-5 min-w-0">
          <section className="bg-panel border border-line rounded-2xl p-[22px]">
            <h2 className="m-0 mb-1 text-[1.125rem] font-bold">Track progress</h2>
            <div className="grid gap-3.5 mt-3.5">
              <div>
                <div className="flex justify-between items-center gap-3 mb-1.5 font-semibold text-[0.9375rem]">
                  <span>Hardware Basics</span>
                  <span className="num text-[0.8125rem] font-semibold text-muted">
                    2 of 12 lessons · 17%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-panel2 overflow-hidden">
                  <i className="sb-bar-fill block h-full rounded-full bg-amber" style={{ width: '17%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center gap-3 mb-1.5 font-semibold text-[0.9375rem]">
                  <span>Networking Basics</span>
                  <span className="num text-[0.8125rem] font-semibold text-muted">
                    1 of 12 lessons · 8%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-panel2 overflow-hidden">
                  <i className="sb-bar-fill block h-full rounded-full bg-cyan" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-panel border border-line rounded-2xl p-[22px]">
            <div className="flex justify-between items-center gap-3">
              <h2 className="m-0 text-[1.125rem] font-bold">Activity, last 5 weeks</h2>
              <span className="flex gap-1 items-center text-muted text-xs font-semibold">
                Less
                {HEAT_LEVELS.map((lvl) => (
                  <i
                    key={lvl || 'l0'}
                    className="w-3.5 h-3.5 rounded-[3px] inline-block"
                    style={{ background: heatBg(lvl) }}
                  />
                ))}
                More
              </span>
            </div>

            <div
              role="img"
              aria-label="Activity heatmap for the last five weeks"
              className="grid grid-cols-[20px_repeat(5,1fr)] gap-1.5 mt-3.5 items-center"
            >
              {HEAT_DAYS.map((day, r) => (
                <div key={`${day}-${r}`} className="contents">
                  <span className="text-muted text-xs font-bold">{day}</span>
                  {Array.from({ length: 5 }, (_, c) => {
                    const lvl = HEAT_LEVELS[(r * 3 + c * 2 + (r % 2)) % 4];
                    return (
                      <i
                        key={c}
                        className="h-7 rounded-md block"
                        style={{ background: heatBg(lvl) }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-panel border border-line rounded-2xl p-[22px]">
            <div className="flex justify-between items-center gap-3">
              <h2 className="m-0 text-[1.125rem] font-bold">Achievements</h2>
              <span className="num text-[0.8125rem] font-semibold text-muted">3 of 8</span>
            </div>

            <ul className="grid grid-cols-4 max-[760px]:grid-cols-2 gap-3 mt-3.5">
              {PROFILE_BADGES.map((badge) => (
                <li
                  key={badge.label}
                  className={`grid justify-items-center gap-1.5 text-center text-[0.8125rem] font-semibold ${
                    badge.unlocked ? '' : 'text-muted'
                  }`}
                >
                  <div
                    className={`grid place-items-center w-[52px] h-[52px] rounded-[14px] ${
                      badge.unlocked ? 'text-amber' : 'bg-panel2 text-muted'
                    }`}
                    style={
                      badge.unlocked
                        ? { background: 'color-mix(in srgb, var(--amber) 16%, transparent)' }
                        : undefined
                    }
                  >
                    <Icon name={badge.unlocked ? 'bolt' : 'lock'} className="w-6 h-6" />
                  </div>
                  {badge.label}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="grid gap-5 min-w-0">
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              showToast('Changes saved');
            }}
            className="bg-panel border border-line rounded-2xl p-[22px]"
          >
            <h2 className="m-0 mb-1 text-[1.125rem] font-bold">Settings</h2>

            <label htmlFor="s-n" className="block mt-3.5 mb-1.5 font-semibold text-sm">
              Display name
            </label>
            <input
              id="s-n"
              autoComplete="name"
              value={settings.displayName}
              onChange={(e) => updateProfileSettings({ displayName: e.target.value })}
              className="w-full min-h-11 px-3 border border-line rounded-[10px] bg-bg text-ink text-[0.9375rem] font-sans focus-visible:outline-none focus-visible:border-cyan"
            />

            <label htmlFor="s-e" className="block mt-3.5 mb-1.5 font-semibold text-sm">
              School email
            </label>
            <input
              id="s-e"
              type="email"
              autoComplete="email"
              value={settings.email}
              onChange={(e) => updateProfileSettings({ email: e.target.value })}
              className="w-full min-h-11 px-3 border border-line rounded-[10px] bg-bg text-ink text-[0.9375rem] font-sans focus-visible:outline-none focus-visible:border-cyan"
            />

            <label htmlFor="s-gemini" className="block mt-3.5 mb-1.5 font-semibold text-sm">
              Gemini API key <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              id="s-gemini"
              type="password"
              placeholder="Leave blank for offline responder"
              autoComplete="off"
              value={settings.geminiApiKey ?? ''}
              onChange={(e) => updateProfileSettings({ geminiApiKey: e.target.value })}
              className="w-full min-h-11 px-3 border border-line rounded-[10px] bg-bg text-ink text-[0.9375rem] font-sans focus-visible:outline-none focus-visible:border-cyan"
            />
            <small className="block mt-1 text-muted text-xs">
              Powers live Study Buddy responses via Google Gemini. If empty or offline, built-in curriculum answers are used.
            </small>

            <span id="theme-l" className="block mt-4 mb-2 text-muted text-[0.8125rem] font-bold">
              Appearance
            </span>
            <div
              role="group"
              aria-labelledby="theme-l"
              className="flex p-1 border border-line rounded-xl bg-bg gap-1"
            >
              <button
                type="button"
                aria-pressed={theme === 'dark'}
                onClick={() => setTheme('dark')}
                className={`flex-1 min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                  theme === 'dark'
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-transparent text-muted hover:text-ink'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                aria-pressed={theme === 'light'}
                onClick={() => setTheme('light')}
                className={`flex-1 min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                  theme === 'light'
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-transparent text-muted hover:text-ink'
                }`}
              >
                Light
              </button>
            </div>

            <span id="goal-l" className="block mt-4 mb-2 text-muted text-[0.8125rem] font-bold">
              Daily goal
            </span>
            <div
              role="group"
              aria-labelledby="goal-l"
              className="flex p-1 border border-line rounded-xl bg-bg gap-1"
            >
              <button
                type="button"
                aria-pressed={settings.dailyGoal === '5'}
                onClick={() => updateProfileSettings({ dailyGoal: '5' })}
                className={`flex-1 min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                  settings.dailyGoal === '5'
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-transparent text-muted hover:text-ink'
                }`}
              >
                5 min
              </button>
              <button
                type="button"
                aria-pressed={settings.dailyGoal === '10'}
                onClick={() => updateProfileSettings({ dailyGoal: '10' })}
                className={`flex-1 min-h-10 px-4 border-0 rounded-lg font-semibold text-sm cursor-pointer transition-colors ${
                  settings.dailyGoal === '10'
                    ? 'bg-cyan text-cyan-ink'
                    : 'bg-transparent text-muted hover:text-ink'
                }`}
              >
                10 min
              </button>
            </div>

            <div className="flex justify-between items-center gap-3.5 py-3 mt-3 border-t border-line">
              <span>
                <b className="block text-[0.9375rem]">Daily reminder</b>
                <small className="text-muted text-[0.8125rem]">
                  Nudge me before my streak ends
                </small>
              </span>
              <ToggleSwitch
                checked={settings.dailyReminder}
                label="Daily reminder"
                onToggle={() => updateProfileSettings({ dailyReminder: !settings.dailyReminder })}
              />
            </div>

            <div className="flex justify-between items-center gap-3.5 py-3 border-t border-line">
              <span>
                <b className="block text-[0.9375rem]">Sound effects</b>
              </span>
              <ToggleSwitch
                checked={settings.soundEffects}
                label="Sound effects"
                onToggle={() => updateProfileSettings({ soundEffects: !settings.soundEffects })}
              />
            </div>

            <div className="flex justify-between items-center gap-3.5 py-3 border-t border-line">
              <span>
                <b className="block text-[0.9375rem]">Hints on by default</b>
              </span>
              <ToggleSwitch
                checked={settings.hintsByDefault}
                label="Hints on by default"
                onToggle={() => updateProfileSettings({ hintsByDefault: !settings.hintsByDefault })}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3.5 inline-flex items-center justify-center min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110"
            >
              Save changes
            </button>
          </form>

          <button
            type="button"
            onClick={logout}
            className="w-full inline-flex items-center justify-center min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] cursor-pointer transition-colors hover:bg-panel2 hover:border-muted"
          >
            Log out
          </button>
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
      className="relative w-[50px] min-h-11 bg-transparent border-0 py-[7px] cursor-pointer flex-none"
    >
      <span
        className={`block relative w-[50px] h-7 rounded-full border transition-colors ${
          checked ? 'bg-green border-green' : 'bg-panel2 border-line'
        }`}
      >
        <span
          className={`block absolute top-0.5 left-0.5 w-[22px] h-[22px] rounded-full transition-transform duration-200 ${
            checked ? 'translate-x-[22px] bg-green-ink' : 'translate-x-0 bg-ink'
          }`}
        />
      </span>
    </button>
  );
}
