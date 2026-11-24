import { Icon } from '../components/Icon';
import { WelcomeMascot } from '../components/WelcomeMascot';
import { DASHBOARD_BOARD_PREVIEW } from '../data/leaderboard';
import { useStreakByteStore } from '../store/useStreakByteStore';

export function DashboardView() {
  const openSetup = useStreakByteStore((s) => s.openSetup);
  const setTrack = useStreakByteStore((s) => s.setTrack);
  const navigate = useStreakByteStore((s) => s.navigate);

  return (
    <div className="grid gap-5">
      {/* Row 0: Welcome header */}
      <div className="sb-enter flex items-center gap-5 max-[760px]:gap-3.5">
        <WelcomeMascot />
        <div className="min-w-0">
          <h1 className="m-0 text-[2.125rem] font-bold leading-[1.15] tracking-[-0.025em] text-balance">
            Welcome back, Mika
          </h1>
          <p className="mt-1.5 mb-0 text-muted text-[1.0625rem] max-w-[65ch]">
            You’re 70 points behind Joel Mendoza this week.
          </p>
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

        <aside
          aria-label="Leaderboard"
          className="bg-panel border border-line rounded-2xl p-5 flex flex-col"
        >
          <div className="flex justify-between items-center gap-3">
            <h2 className="m-0 text-[1.125rem] font-bold">Leaderboard</h2>
            <span className="text-[0.8125rem] font-semibold text-muted">This week</span>
          </div>
          <p className="m-0 text-muted text-sm">Cyber-Ops · Tier 62</p>

          <ol className="grid gap-1 mt-3 mb-3.5">
            {DASHBOARD_BOARD_PREVIEW.map((row) => (
              <li
                key={row.rank}
                aria-current={row.isYou ? 'true' : undefined}
                className={`grid grid-cols-[20px_34px_minmax(0,1fr)_auto] gap-2.5 items-center px-2.5 py-2 rounded-xl ${row.isYou ? 'bg-you font-semibold' : ''
                  }`}
              >
                <span className="num text-muted text-sm text-center">{row.rank}</span>
                <span
                  className={`grid place-items-center w-[34px] h-[34px] rounded-full font-bold text-xs ${row.isYou ? 'bg-cyan text-cyan-ink' : 'bg-panel2 text-ink'
                    }`}
                >
                  {row.initials}
                </span>
                <span className="font-semibold text-sm leading-tight overflow-hidden text-ellipsis whitespace-nowrap">
                  {row.name}
                  <small className="block text-muted text-xs font-medium">{row.streak}</small>
                </span>
                <b className="num text-sm">{row.xp}</b>
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
            View full division
          </a>
        </aside>
      </div>

      {/* Row 2: Hardware Basics, Networking Basics, and Achievements all level on one row */}
      <div className="grid grid-cols-[minmax(0,1fr)_360px] max-[1100px]:grid-cols-1 gap-x-5 gap-y-3 items-stretch mt-1">
        <h2
          id="tracks-heading"
          className="m-0 text-[1.125rem] font-bold leading-snug tracking-[-0.01em] col-start-1"
        >
          Your tracks
        </h2>

        <section
          aria-label="Tracks"
          className="col-start-1 grid grid-cols-2 max-[760px]:grid-cols-1 gap-5"
        >
          <article
            className="bg-panel border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted"
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
            <div className="mt-auto flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-panel2 overflow-hidden">
                  <i
                    className="sb-bar-fill block h-full rounded-full bg-cyan"
                    style={{ width: '17%' }}
                  />
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
            </div>
          </article>

          <article className="bg-panel border border-line rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-muted">
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
            <div className="mt-auto flex flex-col gap-3">
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
            </div>
          </article>
        </section>

        <section
          aria-label="Achievements"
          className="col-start-2 row-start-2 max-[1100px]:col-start-1 max-[1100px]:row-start-auto bg-panel border border-line rounded-2xl p-5 flex flex-col"
        >
          <div className="flex justify-between items-center gap-3">
            <h2 className="m-0 text-[1.125rem] font-bold">Achievements</h2>
            <span className="num text-[0.8125rem] font-semibold text-muted">3 of 8</span>
          </div>

          <ul className="grid grid-cols-2 gap-x-3 gap-y-3.5 my-auto py-3">
            <li className="flex items-center gap-2.5 min-w-0">
              <div
                className="grid place-items-center w-9 h-9 rounded-[10px] text-cyan flex-none"
                style={{ background: 'color-mix(in srgb, var(--cyan) 16%, transparent)' }}
              >
                <Icon name="wrench" className="w-[18px] h-[18px]" />
              </div>
              <span className="min-w-0 text-sm font-semibold leading-tight">
                <span className="block truncate">First Build</span>
                <small className="inline-flex items-center gap-1 text-xs font-medium text-cyan">
                  <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Done
                </small>
              </span>
            </li>

            <li className="flex items-center gap-2.5 min-w-0">
              <div
                className="grid place-items-center w-9 h-9 rounded-[10px] text-amber flex-none"
                style={{ background: 'color-mix(in srgb, var(--amber) 16%, transparent)' }}
              >
                <Icon name="flame" className="w-[18px] h-[18px]" />
              </div>
              <span className="min-w-0 text-sm font-semibold leading-tight">
                <span className="block truncate">5-Day Run</span>
                <small className="inline-flex items-center gap-1 text-xs font-medium text-cyan">
                  <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Done
                </small>
              </span>
            </li>

            <li className="flex items-center gap-2.5 min-w-0">
              <div
                className="grid place-items-center w-9 h-9 rounded-[10px] text-cyan flex-none"
                style={{ background: 'color-mix(in srgb, var(--cyan) 16%, transparent)' }}
              >
                <Icon name="cpu" className="w-[18px] h-[18px]" />
              </div>
              <span className="min-w-0 text-sm font-semibold leading-tight">
                <span className="block truncate">RAM Master</span>
                <small className="inline-flex items-center gap-1 text-xs font-medium text-cyan">
                  <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Done
                </small>
              </span>
            </li>

            <li className="flex items-center gap-2.5 min-w-0 text-muted">
              <div className="grid place-items-center w-9 h-9 rounded-[10px] bg-panel2 text-muted flex-none">
                <Icon name="lock" className="w-[18px] h-[18px]" />
              </div>
              <span className="min-w-0 text-sm font-semibold leading-tight">
                <span className="block truncate">Net Ninja</span>
                <small className="block num text-xs font-medium text-muted">8 / 100 XP</small>
              </span>
            </li>
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
    </div>
  );
}
