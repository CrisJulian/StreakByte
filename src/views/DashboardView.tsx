import { Icon } from '../components/Icon';
import { WeekStrip } from '../components/WeekStrip';
import { DASHBOARD_BOARD_PREVIEW } from '../data/leaderboard';
import { useStreakByteStore } from '../store/useStreakByteStore';

export function DashboardView() {
  const openSetup = useStreakByteStore((s) => s.openSetup);
  const setTrack = useStreakByteStore((s) => s.setTrack);
  const navigate = useStreakByteStore((s) => s.navigate);

  return (
    <div>
      <div className="sb-enter flex items-center gap-5 max-[760px]:gap-3.5 mb-6">
        <div
          className="hog w-[88px] h-[88px] flex-none"
          role="img"
          aria-label="Your study buddy, a pixel-art hedgehog"
        />
        <div>
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em] text-balance">
            Welcome back, Mika
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[1.0625rem] max-w-[65ch]">
            You’re 70 points behind Joel Mendoza this week.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_360px] max-[1100px]:grid-cols-1 gap-5 items-start">
        <div className="grid gap-5 min-w-0">
          <section
            aria-label="Continue learning"
            className="bg-panel border border-line rounded-2xl p-[22px] grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] max-[760px]:grid-cols-1 gap-6 items-center"
          >
            <div>
              <div className="flex gap-2 flex-wrap mb-3.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-panel2 text-[0.8125rem] font-semibold text-muted">
                  Hardware Basics
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-panel2 text-[0.8125rem] font-semibold text-muted">
                  5 min left
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.8125rem] font-semibold text-cyan"
                  style={{ background: 'color-mix(in srgb, var(--cyan) 16%, transparent)' }}
                >
                  +120 XP
                </span>
              </div>

              <h2 className="m-0 mb-2.5 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-balance">
                Lesson 3: Memory (RAM)
              </h2>
              <p className="m-0 mb-5 text-muted max-w-[46ch]">
                How a DIMM is built, how clock cycles keep memory in sync, and why the key notch only
                lets a module fit one way.
              </p>

              <div className="flex justify-between text-sm font-semibold mb-2">
                <span>Lesson progress</span>
                <span className="num">60%</span>
              </div>
              <div
                className="h-2 rounded-full bg-panel2 overflow-hidden"
                role="progressbar"
                aria-label="Lesson progress"
                aria-valuenow={60}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <i className="sb-bar-fill block h-full rounded-full bg-cyan" style={{ width: '60%' }} />
              </div>

              <p className="mt-2.5 mb-5 text-muted text-sm">
                Next: Checkpoint 3 of 6, seat the RAM modules
              </p>

              <button
                type="button"
                onClick={() => openSetup('pc')}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110 active:brightness-95"
              >
                <Icon name="play" className="w-[18px] h-[18px]" />
                Start lesson
              </button>
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

          <section aria-label="Tracks">
            <div className="flex justify-between items-center gap-3 mb-3">
              <h2 className="m-0 text-[1.125rem] font-bold leading-snug tracking-[-0.01em]">
                Your tracks
              </h2>
            </div>

            <div className="grid grid-cols-2 max-[760px]:grid-cols-1 gap-5">
              <article
                className="bg-panel border rounded-2xl p-[22px] grid gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted"
                style={{ borderColor: 'color-mix(in srgb, var(--cyan) 55%, var(--line))' }}
              >
                <div className="flex gap-3.5 items-center">
                  <div className="grid place-items-center w-11 h-11 rounded-xl bg-panel2 text-cyan flex-none">
                    <Icon name="cpu" />
                  </div>
                  <h3 className="m-0 text-base font-bold leading-snug">
                    Hardware Basics
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan text-cyan-ink ml-1.5">
                      Current
                    </span>
                  </h3>
                </div>
                <p className="m-0 text-muted text-sm">
                  CPU, RAM, PSU, architecture and physical assembly · 12 lessons
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-panel2 overflow-hidden">
                    <i className="sb-bar-fill block h-full rounded-full bg-cyan" style={{ width: '17%' }} />
                  </div>
                  <small className="num text-muted text-[0.8125rem] whitespace-nowrap">2 of 12</small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTrack('hw');
                    navigate('curriculum');
                  }}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-cyan rounded-[10px] bg-cyan text-cyan-ink font-semibold text-[0.9375rem] cursor-pointer transition-all hover:brightness-110 active:brightness-95"
                >
                  Resume track
                </button>
              </article>

              <article className="bg-panel border border-line rounded-2xl p-[22px] grid gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted">
                <div className="flex gap-3.5 items-center">
                  <div className="grid place-items-center w-11 h-11 rounded-xl bg-panel2 text-cyan flex-none">
                    <Icon name="net" />
                  </div>
                  <h3 className="m-0 text-base font-bold leading-snug">
                    Networking Basics
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-panel2 text-muted ml-1.5">
                      Paused
                    </span>
                  </h3>
                </div>
                <p className="m-0 text-muted text-sm">
                  IP protocols, subnetting, routers and topologies · 12 lessons
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-panel2 overflow-hidden">
                    <i
                      className="sb-bar-fill block h-full rounded-full"
                      style={{ width: '8%', background: 'var(--muted)' }}
                    />
                  </div>
                  <small className="num text-muted text-[0.8125rem] whitespace-nowrap">1 of 12</small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTrack('net');
                    navigate('curriculum');
                  }}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] cursor-pointer transition-colors hover:bg-panel2 hover:border-muted"
                >
                  Switch to track
                </button>
              </article>
            </div>
          </section>
        </div>

        <div className="grid gap-5 min-w-0">
          <aside aria-label="Daily streak" className="bg-panel border border-line rounded-2xl p-[22px]">
            <div className="flex justify-between items-center gap-3">
              <h2 className="m-0 text-[1.125rem] font-bold">5 day streak</h2>
              <span className="text-[0.8125rem] font-semibold text-muted">On</span>
            </div>
            <WeekStrip
              filledCount={5}
              todayIndex={4}
              ariaLabel="Monday to Friday done, weekend still open"
            />
            <p className="m-0 text-muted text-sm">Finish one lesson today to keep it going.</p>
          </aside>

          <aside aria-label="Leaderboard" className="bg-panel border border-line rounded-2xl p-[22px]">
            <div className="flex justify-between items-center gap-3">
              <h2 className="m-0 text-[1.125rem] font-bold">Leaderboard</h2>
              <span className="text-[0.8125rem] font-semibold text-muted">This week</span>
            </div>
            <p className="m-0 text-muted text-sm">Cyber-Ops · Tier 62</p>

            <ol className="grid gap-1 mt-3 mb-4">
              {DASHBOARD_BOARD_PREVIEW.map((row) => (
                <li
                  key={row.rank}
                  aria-current={row.isYou ? 'true' : undefined}
                  className={`grid grid-cols-[22px_36px_minmax(0,1fr)_auto] gap-3 items-center px-3 py-2.5 rounded-xl ${
                    row.isYou ? 'bg-you font-semibold' : ''
                  }`}
                >
                  <span className="num text-muted text-sm text-center">{row.rank}</span>
                  <span
                    className={`grid place-items-center w-9 h-9 rounded-full font-bold text-sm ${
                      row.isYou ? 'bg-cyan text-cyan-ink' : 'bg-panel2 text-ink'
                    }`}
                  >
                    {row.initials}
                  </span>
                  <span className="font-semibold leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                    {row.name}
                    <small className="block text-muted text-[0.8125rem] font-medium">
                      {row.streak}
                    </small>
                  </span>
                  <b className="num">{row.xp}</b>
                </li>
              ))}
            </ol>

            <a
              href="#leaderboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('leaderboard');
              }}
              className="w-full inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] no-underline transition-colors hover:bg-panel2 hover:border-muted"
            >
              View full division
            </a>
          </aside>

          <section aria-label="Achievements" className="bg-panel border border-line rounded-2xl p-[22px]">
            <div className="flex justify-between items-center gap-3">
              <h2 className="m-0 text-[1.125rem] font-bold">Achievements</h2>
              <span className="num text-[0.8125rem] font-semibold text-muted">3 of 8</span>
            </div>

            <ul className="grid gap-2.5 mt-3 mb-4">
              <li className="flex items-center gap-3 font-semibold">
                <div
                  className="grid place-items-center w-9 h-9 rounded-[10px] text-cyan"
                  style={{ background: 'color-mix(in srgb, var(--cyan) 16%, transparent)' }}
                >
                  <Icon name="wrench" />
                </div>
                First Build
                <Icon name="check" className="ml-auto w-[18px] h-[18px] text-cyan" strokeWidth={2.5} />
              </li>
              <li className="flex items-center gap-3 font-semibold">
                <div
                  className="grid place-items-center w-9 h-9 rounded-[10px] text-amber"
                  style={{ background: 'color-mix(in srgb, var(--amber) 16%, transparent)' }}
                >
                  <Icon name="flame" />
                </div>
                5-Day Run
                <Icon name="check" className="ml-auto w-[18px] h-[18px] text-cyan" strokeWidth={2.5} />
              </li>
              <li className="flex items-center gap-3 font-semibold">
                <div
                  className="grid place-items-center w-9 h-9 rounded-[10px] text-cyan"
                  style={{ background: 'color-mix(in srgb, var(--cyan) 16%, transparent)' }}
                >
                  <Icon name="cpu" />
                </div>
                RAM Master
                <Icon name="check" className="ml-auto w-[18px] h-[18px] text-cyan" strokeWidth={2.5} />
              </li>
              <li className="flex items-center gap-3 font-semibold text-muted">
                <div className="grid place-items-center w-9 h-9 rounded-[10px] bg-panel2 text-muted">
                  <Icon name="lock" />
                </div>
                <span>
                  Net Ninja
                  <small className="block text-muted text-[0.8125rem] font-medium">
                    Next unlock · 8 / 100 XP
                  </small>
                </span>
              </li>
            </ul>

            <a
              href="#achievements"
              onClick={(e) => {
                e.preventDefault();
                navigate('achievements');
              }}
              className="w-full inline-flex items-center justify-center gap-2 min-h-11 px-[18px] border border-line rounded-[10px] bg-transparent text-ink font-semibold text-[0.9375rem] no-underline transition-colors hover:bg-panel2 hover:border-muted"
            >
              View all achievements
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
