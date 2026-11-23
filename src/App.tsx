import { useEffect } from 'react';
import { SessionSetupModal } from './components/SessionSetupModal';
import { StudyBuddyChat } from './components/StudyBuddyChat';
import { Toast } from './components/Toast';
import { TopBar } from './components/TopBar';
import { useStreakByteStore } from './store/useStreakByteStore';
import { AchievementsView } from './views/AchievementsView';
import { CompleteView } from './views/CompleteView';
import { CurriculumView } from './views/CurriculumView';
import { DashboardView } from './views/DashboardView';
import { LeaderboardView } from './views/LeaderboardView';
import { LessonPlayerView } from './views/LessonPlayerView';
import { PracticeView } from './views/PracticeView';
import { ProfileView } from './views/ProfileView';

export function App() {
  const view = useStreakByteStore((s) => s.view);
  const theme = useStreakByteStore((s) => s.theme);
  const syncFromHash = useStreakByteStore((s) => s.syncFromHash);

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
        className="fixed top-2.5 left-3.5 z-[100] px-4 py-2.5 rounded-[10px] bg-cyan text-cyan-ink font-bold no-underline -translate-y-[140%] focus-visible:translate-y-0 transition-transform duration-200"
      >
        Skip to main content
      </a>

      <TopBar />

      <main
        id="main"
        className="max-w-[1180px] mx-auto px-6 pt-7 pb-16 max-[760px]:px-4 max-[760px]:pt-5 max-[760px]:pb-8"
      >
        {view === 'dashboard' && <DashboardView />}
        {view === 'curriculum' && <CurriculumView />}
        {view === 'lesson' && <LessonPlayerView />}
        {view === 'complete' && <CompleteView />}
        {view === 'practice' && <PracticeView />}
        {view === 'achievements' && <AchievementsView />}
        {view === 'leaderboard' && <LeaderboardView />}
        {view === 'profile' && <ProfileView />}
      </main>

      <SessionSetupModal />
      <StudyBuddyChat />
      <Toast />
    </>
  );
}
export default App;
