import { useEffect, useRef, useState } from 'react';
import { LESSON_XP_BY_KEY } from '../data/curriculum';
import { formatXp } from '../data/leaderboard';
import {
  canBuyRestore,
  canRestore,
  isWithinRestoreWindow,
  MAX_STREAK_RESTORES,
  STREAK_RESTORE_COST_XP,
} from '../domain/rules/streak';
import { calculateTotalXp, deriveWeekStrip, effectiveStreak, localDayString } from '../domain/rules/xp';
import { useStreakByteStore } from '../store/useStreakByteStore';
import type { IconName, ViewId } from '../types/streakbyte';
import { Icon } from './Icon';
import { WeekStrip } from './WeekStrip';

const NAV_TABS: { id: ViewId; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'curriculum', label: 'Curriculum', icon: 'book' },
  { id: 'arena', label: 'Arena', icon: 'bolt' },
  { id: 'achievements', label: 'Achievements', icon: 'medal' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'trophy' },
];

export function TopBar() {
  const view = useStreakByteStore((s) => s.view);
  const theme = useStreakByteStore((s) => s.theme);
  const navigate = useStreakByteStore((s) => s.navigate);
  const toggleTheme = useStreakByteStore((s) => s.toggleTheme);
  const completions = useStreakByteStore((s) => s.completions);
  const streak = useStreakByteStore((s) => s.streak);
  const labBonusXp = useStreakByteStore((s) => s.labBonusXp);
  const xpSpent = useStreakByteStore((s) => s.xpSpent);
  const isOnline = useStreakByteStore((s) => s.isOnline);
  const isGuest = useStreakByteStore((s) => s.isGuest);
  const authUser = useStreakByteStore((s) => s.authUser);
  const pendingSyncCount = useStreakByteStore((s) => s.pendingSyncCount);
  const isSyncing = useStreakByteStore((s) => s.isSyncing);
  const flushSyncQueue = useStreakByteStore((s) => s.flushSyncQueue);
  const restoreCurrentStreak = useStreakByteStore((s) => s.restoreCurrentStreak);
  const buyStreakRestore = useStreakByteStore((s) => s.buyStreakRestore);
  const isInActiveDuel = useStreakByteStore((s) => s.activeDuel?.status === 'active');
  const canShowSyncCount = !isGuest && Boolean(authUser) && pendingSyncCount > 0;
  const displayName = useStreakByteStore(
    (s) => s.profileSettings.displayName || s.authUser?.displayName || 'Learner',
  );
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
  const shortName =
    nameParts.length >= 2
      ? `${nameParts[0]} ${nameParts[1][0].toUpperCase()}.`
      : nameParts[0] || 'Learner';
  const today = localDayString();
  const streakDays = effectiveStreak(streak, today);
  const restorable = canRestore(streak, today);
  const inRestoreWindow = isWithinRestoreWindow(streak, today);
  const totalXp = calculateTotalXp(completions, LESSON_XP_BY_KEY, labBonusXp, xpSpent);
  const atMaxRestores = streak.restoresLeft >= MAX_STREAK_RESTORES;
  const canAffordRestore = canBuyRestore(streak, totalXp);
  const weekStrip = deriveWeekStrip(streak);
  const streakLabel = `${streakDays} day streak`;
  const streakCopy = restorable
    ? `You missed a day, but your ${streak.current}-day streak can still be saved!`
    : streakDays === 0
      ? 'Finish one lesson today to start your streak.'
      : streak.lastActiveDay === today
        ? 'You’re done for today. Come back tomorrow to keep it going.'
        : 'Finish one lesson today to keep it going.';

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

  const activeNav: ViewId =
    view === 'lesson' || view === 'complete' || view === 'quiz' || view === 'learn'
      ? 'curriculum'
      : view === 'practice'
        ? 'arena'
        : view;
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <header className="sticky top-0 z-20 grid grid-cols-[auto_1fr_auto] max-[760px]:grid-cols-[1fr_auto] items-stretch min-h-[56px] bg-panel border-b border-line">
      <a
        href="#dashboard"
        aria-disabled={isInActiveDuel}
        onClick={(e) => {
          e.preventDefault();
          navigate('dashboard');
        }}
        className={`inline-flex items-center gap-2.5 px-5 max-[760px]:px-3.5 text-ink no-underline justify-self-start whitespace-nowrap ${
          isInActiveDuel ? 'opacity-45 cursor-not-allowed' : ''
        }`}
      >
        <i className="buddy-logo block w-9 h-9 flex-none" aria-hidden="true" />
        <span className="font-disp text-[14px] tracking-[0.02em] uppercase max-[760px]:hidden">
          STREAK<span className="text-cyan">BYTE</span>
        </span>
      </a>

      <nav
        aria-label="Main"
        className="flex items-stretch justify-center gap-0.5 px-2 max-[760px]:fixed max-[760px]:left-0 max-[760px]:right-0 max-[760px]:bottom-0 max-[760px]:h-[calc(58px+env(safe-area-inset-bottom,0px))] max-[760px]:pb-[env(safe-area-inset-bottom,0px)] max-[760px]:bg-panel max-[760px]:border-t max-[760px]:border-line max-[760px]:z-30 max-[760px]:justify-stretch max-[760px]:px-0 max-[760px]:gap-0"
      >
        {NAV_TABS.map((tab) => {
          const isCurrent = activeNav === tab.id;
          const lockedOut = isInActiveDuel && tab.id !== 'arena';
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              aria-current={isCurrent ? 'page' : undefined}
              aria-disabled={lockedOut}
              onClick={(e) => {
                e.preventDefault();
                navigate(tab.id);
              }}
              className={`relative flex items-center gap-2 px-3.5 max-[1100px]:px-3 max-[760px]:flex-1 max-[760px]:flex-col max-[760px]:justify-center max-[760px]:gap-0.5 max-[760px]:px-1 max-[760px]:border-r max-[760px]:border-line max-[760px]:last:border-r-0 text-[11px] max-[760px]:text-[9.5px] uppercase tracking-[0.07em] no-underline whitespace-nowrap transition-colors ${isCurrent
                  ? 'bg-panel3 text-ink font-bold max-[760px]:shadow-[inset_0_3px_0_var(--cyan)]'
                  : 'text-muted font-semibold hover:text-ink hover:bg-panel2'
                } ${lockedOut ? 'opacity-45 cursor-not-allowed' : ''}`}
            >
              <Icon
                name={tab.icon}
                className={`w-4 h-4 hidden max-[1100px]:block ${isCurrent ? 'text-cyan' : ''}`}
              />
              <span className="max-[1100px]:sr-only max-[760px]:not-sr-only">{tab.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="flex justify-end items-center gap-2.5 px-4.5 max-[760px]:px-3 flex-none">
        {!isOnline ? (
          <span
            role="status"
            className="inline-flex items-center gap-1.5 min-h-8 px-2.5 py-1 border border-amber bg-amber/10 text-amber text-[10.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap"
          >
            Offline{canShowSyncCount ? ` · ${pendingSyncCount} queued` : ''}
          </span>
        ) : canShowSyncCount ? (
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => void flushSyncQueue()}
            className="inline-flex items-center gap-1.5 min-h-8 px-2.5 py-1 border border-cyan bg-cyan/10 text-cyan text-[10.5px] font-bold uppercase tracking-[0.05em] whitespace-nowrap cursor-pointer hover:bg-cyan hover:text-cyan-ink disabled:opacity-60"
          >
            {isSyncing ? 'Syncing…' : `Sync (${pendingSyncCount})`}
          </button>
        ) : null}

        <div ref={streakWrapRef} className="relative flex-none">
          <button
            ref={streakBtnRef}
            type="button"
            onClick={() => setStreakOpen((prev) => !prev)}
            aria-expanded={streakOpen}
            aria-haspopup="dialog"
            aria-controls="streak-popover"
            aria-label={streakLabel}
            title={streakLabel}
            className={`inline-flex items-center gap-1.5 min-h-9 px-2.5 py-1.5 border bg-panel font-bold text-[11px] uppercase tracking-[0.05em] text-ink whitespace-nowrap cursor-pointer transition-colors hover:bg-panel2 ${streakOpen ? 'border-cyan' : restorable ? 'border-amber' : 'border-transparent hover:border-line'
              }`}
          >
            <span className="w-1.5 h-1.5 bg-cyan inline-block flex-none" aria-hidden="true" />
            <span className="max-[1180px]:hidden">STREAK</span>
            <span className="num">{streakDays}</span>
            {restorable && (
              <span className="w-1.5 h-1.5 bg-amber" aria-hidden="true" />
            )}
          </button>

          {streakOpen && (
            <section
              id="streak-popover"
              role="dialog"
              aria-label="Daily streak"
              className="sb-pop absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] max-w-[calc(100vw-24px)] max-[760px]:fixed max-[760px]:left-3 max-[760px]:right-3 max-[760px]:top-[64px] max-[760px]:w-auto bg-panel border border-ink p-4 shadow-[6px_6px_0_rgba(20,20,20,0.18)]"
            >
              <div className="flex justify-between items-center gap-3">
                <h2 className="m-0 font-head text-base font-bold">{streakLabel}</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] bg-cyan/12 text-cyan">
                  {restorable ? 'Restorable' : streakDays > 0 ? 'Active' : 'Start'}
                </span>
              </div>
              <WeekStrip
                filledCount={weekStrip.filledCount}
                todayIndex={weekStrip.todayIndex}
                ariaLabel={weekStrip.ariaLabel}
              />
              <p className="m-0 text-muted text-[11.5px]">{streakCopy}</p>
              <div className="mt-3 pt-3 border-t border-line grid gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.04em]">
                  <span className="text-muted">Streak restores</span>
                  <span className="num text-ink">
                    {streak.restoresLeft} / {MAX_STREAK_RESTORES} held
                  </span>
                </div>
                {restorable && (
                  <button
                    type="button"
                    onClick={() => void restoreCurrentStreak()}
                    className="sb-cut-sm w-full inline-flex items-center justify-center min-h-9 px-4 border-0 bg-amber text-amber-ink font-bold text-[11px] uppercase tracking-[0.06em] cursor-pointer transition-all hover:brightness-110"
                  >
                    Restore streak ({streak.restoresLeft} left)
                  </button>
                )}
                {inRestoreWindow && !restorable && (
                  <p className="m-0 text-[11px] text-amber font-semibold">
                    Your {streak.current}-day streak broke — buy a restore below to save it!
                  </p>
                )}
                <button
                  type="button"
                  disabled={!canAffordRestore}
                  onClick={() => void buyStreakRestore()}
                  className="w-full inline-flex items-center justify-center min-h-9 px-3 border border-line bg-panel2 text-ink font-bold text-[10.5px] uppercase tracking-[0.05em] cursor-pointer transition-colors hover:border-ink disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {atMaxRestores
                    ? 'Max restores held'
                    : `Buy restore · ${STREAK_RESTORE_COST_XP} XP`}
                </button>
              </div>
            </section>
          )}
        </div>

        <div
          className="inline-flex items-center gap-1.5 min-h-9 px-2 py-1.5 font-bold text-[11px] uppercase tracking-[0.05em] text-ink whitespace-nowrap flex-none"
          title="Total XP"
        >
          <span className="num">{formatXp(totalXp)}</span>
          <span className="max-[1180px]:hidden">XP</span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={nextThemeLabel}
          title={nextThemeLabel}
          className="max-[760px]:hidden grid place-items-center w-9 h-9 flex-none border border-line bg-panel2 text-ink cursor-pointer transition-colors hover:border-ink"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
        </button>

        <a
          href="#profile"
          aria-label={`Profile, ${displayName}`}
          aria-disabled={isInActiveDuel}
          onClick={(e) => {
            e.preventDefault();
            navigate('profile');
          }}
          className={`sb-cut-sm inline-flex items-center justify-center min-w-[96px] h-9 px-4 bg-cyan text-cyan-ink font-bold text-[11px] uppercase tracking-[0.06em] flex-none no-underline whitespace-nowrap transition-colors hover:brightness-110 ${
            isInActiveDuel ? 'opacity-45 cursor-not-allowed' : ''
          }`}
        >
          {shortName}
        </a>
      </div>
    </header>
  );
}
