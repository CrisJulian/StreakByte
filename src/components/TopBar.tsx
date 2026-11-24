import { useEffect, useRef, useState } from 'react';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { IconName, ViewId } from '../types/streakbyte';
import { Icon } from './Icon';
import { WeekStrip } from './WeekStrip';

const NAV_TABS: { id: ViewId; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'curriculum', label: 'Curriculum', icon: 'book' },
  { id: 'practice', label: 'Practice', icon: 'target' },
  { id: 'achievements', label: 'Achievements', icon: 'medal' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
];

export function TopBar() {
  const view = useStreakByteStore((s) => s.view);
  const theme = useStreakByteStore((s) => s.theme);
  const navigate = useStreakByteStore((s) => s.navigate);
  const toggleTheme = useStreakByteStore((s) => s.toggleTheme);
  const showToast = useStreakByteStore((s) => s.showToast);

  const [streakOpen, setStreakOpen] = useState(false);
  const streakWrapRef = useRef<HTMLDivElement>(null);
  const streakBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!streakOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setStreakOpen(false);
        streakBtnRef.current?.focus();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (streakWrapRef.current && !streakWrapRef.current.contains(e.target as Node)) {
        setStreakOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [streakOpen]);

  const activeNav: ViewId = view === 'lesson' || view === 'complete' ? 'curriculum' : view;
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <header className="sticky top-0 z-20 grid grid-cols-[auto_1fr_auto] max-[760px]:grid-cols-[1fr_auto] items-center gap-3 h-[60px] px-6 max-[760px]:px-3.5 bg-panel border-b border-line">
      <a
        href="#dashboard"
        onClick={(e) => {
          e.preventDefault();
          navigate('dashboard');
        }}
        className="inline-flex items-center gap-2.5 font-bold text-[1.1875rem] tracking-[-0.01em] text-ink no-underline justify-self-start whitespace-nowrap"
      >
        <i className="buddy-logo block w-10 h-10" aria-hidden="true" />
        <span className="max-[760px]:hidden">StreakByte</span>
      </a>

      <nav
        aria-label="Main"
        className="flex h-[60px] justify-center max-[760px]:fixed max-[760px]:left-0 max-[760px]:right-0 max-[760px]:bottom-0 max-[760px]:h-[calc(62px+env(safe-area-inset-bottom,0px))] max-[760px]:pb-[env(safe-area-inset-bottom,0px)] max-[760px]:bg-panel max-[760px]:border-t max-[760px]:border-line max-[760px]:z-30 max-[760px]:justify-stretch"
      >
        {NAV_TABS.map((tab) => {
          const isCurrent = activeNav === tab.id;
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              aria-current={isCurrent ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                navigate(tab.id);
              }}
              className={`relative flex items-center gap-2 px-4 max-[1100px]:px-3.5 max-[760px]:flex-1 max-[760px]:flex-col max-[760px]:justify-center max-[760px]:gap-0.5 max-[760px]:px-0 max-[760px]:text-[0.6875rem] font-semibold text-[0.9375rem] no-underline whitespace-nowrap transition-colors hover:text-ink hover:bg-panel2 ${
                isCurrent ? 'text-ink' : 'text-muted'
              }`}
            >
              <Icon name={tab.icon} className={`w-5 h-5 ${isCurrent ? 'text-cyan' : ''}`} />
              <span className="max-[1100px]:sr-only max-[760px]:not-sr-only">{tab.label}</span>
              <span
                aria-hidden="true"
                className={`absolute left-2.5 right-2.5 bottom-0 max-[760px]:top-0 max-[760px]:bottom-auto h-[3px] rounded-t-[3px] max-[760px]:rounded-t-none max-[760px]:rounded-b-[3px] bg-cyan transition-transform duration-200 ${
                  isCurrent ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </a>
          );
        })}
      </nav>

      <div className="flex justify-end items-center gap-2.5 flex-none">
        <div ref={streakWrapRef} className="relative flex-none">
          <button
            ref={streakBtnRef}
            type="button"
            onClick={() => setStreakOpen((prev) => !prev)}
            aria-expanded={streakOpen}
            aria-haspopup="dialog"
            aria-controls="streak-popover"
            aria-label="5 day streak"
            title="5-day streak"
            className={`inline-flex items-center gap-2 min-h-10 px-3.5 py-2 border rounded-full bg-bg font-semibold text-sm text-ink whitespace-nowrap cursor-pointer transition-colors hover:border-muted ${
              streakOpen ? 'border-cyan' : 'border-line'
            }`}
          >
            <Icon name="flame" className="w-[18px] h-[18px] text-amber" />
            <span className="num">5</span>
            <span className="max-[1180px]:hidden">day streak</span>
          </button>

          {streakOpen && (
            <section
              id="streak-popover"
              role="dialog"
              aria-label="Daily streak"
              className="sb-pop absolute right-0 top-[calc(100%+10px)] z-50 w-[330px] max-w-[calc(100vw-24px)] max-[760px]:fixed max-[760px]:left-3 max-[760px]:right-3 max-[760px]:top-[68px] max-[760px]:w-auto bg-panel border border-line rounded-2xl p-[18px] shadow-[0_14px_34px_rgba(0,0,0,0.28)]"
            >
              <div className="flex justify-between items-center gap-3">
                <h2 className="m-0 text-base font-bold">5 day streak</h2>
                <span className="text-[0.8125rem] font-semibold text-muted">On</span>
              </div>
              <WeekStrip
                filledCount={5}
                todayIndex={4}
                ariaLabel="Monday to Friday done, weekend still open"
              />
              <p className="m-0 text-muted text-sm">Finish one lesson today to keep it going.</p>
            </section>
          )}
        </div>

        <div
          className="inline-flex items-center gap-2 min-h-10 px-3.5 py-2 border border-line rounded-full bg-bg font-semibold text-sm text-ink whitespace-nowrap flex-none"
          title="Total XP"
        >
          <Icon name="bolt" className="w-[18px] h-[18px] text-cyan" />
          <span className="num">1,240</span>
          <span className="max-[1180px]:hidden">XP</span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={nextThemeLabel}
          title={nextThemeLabel}
          className="max-[760px]:hidden grid place-items-center w-10 h-10 flex-none border border-transparent rounded-full bg-panel2 text-ink cursor-pointer transition-colors hover:border-muted"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => showToast('No new notifications.')}
          aria-label="Notifications"
          className="max-[760px]:hidden grid place-items-center w-10 h-10 flex-none border border-transparent rounded-full bg-panel2 text-ink cursor-pointer transition-colors hover:border-muted"
        >
          <Icon name="bell" className="w-5 h-5" />
        </button>

        <a
          href="#profile"
          aria-label="Profile, Mika Reyes"
          onClick={(e) => {
            e.preventDefault();
            navigate('profile');
          }}
          className="grid place-items-center min-w-[112px] h-10 px-5 py-2 rounded-full bg-cyan text-cyan-ink font-bold text-sm flex-none no-underline whitespace-nowrap transition-all hover:brightness-110"
        >
          Mika R.
        </a>
      </div>
    </header>
  );
}
