import { useEffect } from 'react';
import { services } from './composition';
import { LevelUpBanner } from './components/LevelUpBanner';
import { SessionSetupModal } from './components/SessionSetupModal';
import { StudyBuddyChat } from './components/StudyBuddyChat';
import { Toast } from './components/Toast';
import { TopBar } from './components/TopBar';
import { useStreakByteStore } from './store/useStreakByteStore';
import { AchievementsView } from './views/AchievementsView';
import { ArenaView } from './views/ArenaView';
import { CompleteView } from './views/CompleteView';
import { CurriculumView } from './views/CurriculumView';
import { DashboardView } from './views/DashboardView';
import { LearnView } from './views/LearnView';
import { LeaderboardView } from './views/LeaderboardView';
import { LessonPlayerView } from './views/LessonPlayerView';
import { LoginView } from './views/LoginView';
import { OnboardingView } from './views/OnboardingView';
import { ProfileView } from './views/ProfileView';
import { QuizView } from './views/QuizView';

export function App() {
  const view = useStreakByteStore((s) => s.view);
  const theme = useStreakByteStore((s) => s.theme);
  const authUser = useStreakByteStore((s) => s.authUser);
  const isGuest = useStreakByteStore((s) => s.isGuest);
  const profileLoaded = useStreakByteStore((s) => s.profileLoaded);
  const onboardingCompleted = useStreakByteStore((s) => s.profileSettings.onboardingCompleted);
  const loadAuthUser = useStreakByteStore((s) => s.loadAuthUser);
  const loadUserData = useStreakByteStore((s) => s.loadUserData);
  const syncFromHash = useStreakByteStore((s) => s.syncFromHash);
  const loadCompletions = useStreakByteStore((s) => s.loadCompletions);
  const setOnlineStatus = useStreakByteStore((s) => s.setOnlineStatus);
  const refreshPendingSyncCount = useStreakByteStore((s) => s.refreshPendingSyncCount);

  useEffect(() => {
    void refreshPendingSyncCount();
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingSyncCount, setOnlineStatus]);

  // Saved lesson progress (works offline) decides which lessons are done and unlocked.
  useEffect(() => {
    void loadCompletions();
    void loadAuthUser().then((user) => {
      if (user || useStreakByteStore.getState().isGuest) {
        void loadUserData();
      }
    });
    return services.auth.onAuthStateChange((user) => {
      const store = useStreakByteStore.getState();
      if (user) {
        const userChanged = store.authUser?.id !== user.id;
        store.setAuthUser(user);
        if (userChanged || !store.profileLoaded) {
          void store.loadUserData();
        }
        if (store.view === 'login') {
          store.navigate('dashboard');
        }
      } else if (!store.isGuest && store.authUser) {
        store.setAuthUser(null);
        store.navigate('login');
      }
    });
  }, [loadCompletions, loadAuthUser, loadUserData]);

  const isAuthed = Boolean(authUser || isGuest);
  const needsAuthScreen = !isAuthed || view === 'login';
  const needsLoading = isAuthed && !isGuest && !needsAuthScreen && !profileLoaded;
  const needsOnboarding = isAuthed && !isGuest && !needsAuthScreen && profileLoaded && !onboardingCompleted;
  const showAppShell = isAuthed && !needsAuthScreen && !needsLoading && !needsOnboarding;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#f1f5f9' : '#0b1020');
    }
  }, [theme]);

  useEffect(() => {
    const handleHash = () => {
      syncFromHash(window.location.hash);
      if (typeof window.scrollTo === 'function') {
        try {
          window.scrollTo(0, 0);
        } catch {
          // jsdom doesn't implement scrollTo
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [syncFromHash]);

  return (
    <>
      <a
        href="#main"
        className="fixed top-2.5 left-3.5 z-[100] px-4 py-2.5 bg-cyan text-cyan-ink font-bold text-xs uppercase tracking-[0.06em] no-underline -translate-y-[140%] focus-visible:translate-y-0 transition-transform duration-200"
      >
        Skip to main content
      </a>

      {showAppShell && <TopBar />}

      <main
        id="main"
        className={
          !showAppShell
            ? 'w-full min-h-screen bg-panel2 px-4 py-6 flex items-center justify-center'
            : `w-full min-h-[calc(100dvh-56px)] ${view === 'dashboard' ? 'bg-bg' : 'bg-panel'} pb-12 max-[760px]:pb-20`
        }
      >
        {needsAuthScreen ? (
          <LoginView />
        ) : needsLoading ? (
          <p role="status" className="text-muted text-sm font-semibold">
            Loading your profile…
          </p>
        ) : needsOnboarding ? (
          <OnboardingView />
        ) : (
          <>
            {view === 'dashboard' && <DashboardView />}
            {view === 'curriculum' && <CurriculumView />}
            {view === 'lesson' && <LessonPlayerView />}
            {view === 'complete' && <CompleteView />}
            {(view === 'arena' || view === 'practice') && <ArenaView />}
            {view === 'achievements' && <AchievementsView />}
            {view === 'leaderboard' && <LeaderboardView />}
            {view === 'profile' && <ProfileView />}
            {view === 'quiz' && <QuizView />}
            {view === 'learn' && <LearnView />}
          </>
        )}
      </main>

      <SessionSetupModal />
      <LevelUpBanner />
      {showAppShell && <StudyBuddyChat />}
      <Toast />
    </>
  );
}
export default App;
