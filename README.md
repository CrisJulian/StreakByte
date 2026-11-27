# StreakByte

Gamified IT basics (PC hardware and networking) with hands-on labs.
React 19 + TypeScript + Vite, Tailwind CSS v4, `@dnd-kit/core`, Zustand, Supabase (Auth + Postgres/RLS), Google Gemini (`@google/genai`), Vitest, Playwright, installable PWA (offline-first).

## Architecture (onion / hexagonal)

Dependencies point inward: `views/` & `components/` -> `store/` -> `application/ports/` -> `domain/rules/`. Adapters implement ports.

```text
src/
  domain/rules/       Pure TS: pcBuild, network, streak, quiz, lessonProgress,
                      summaries, xp, progressViews. No React/Zustand/Supabase/dnd-kit.
  application/ports/  Interfaces: AuthService, ProgressRepository, StudyBuddyService,
                      ReminderScheduler, SyncQueue.
  adapters/supabase/  supabaseAuth (PKCE Google OAuth + Email/Password) &
                      supabaseProgress (offline-first Postgres sync with RLS).
  adapters/gemini/    geminiStudyBuddy (falls back to localStudyBuddy offline / no key).
  adapters/local/     Offline/fallback implementations (localAuth, localProgress,
                      localReminders, localStudyBuddy, localSyncQueue).
  composition.ts      The ONLY place that picks adapters (auth, progress, studyBuddy
                      wired to Supabase/Gemini; reminders and syncQueue remain local).
  store/              Zustand: UI/session state; calls domain rules, never owns them.
  views/, components/ React UI. Tailwind and dnd-kit live here only.
```

## Environment setup (`.env.local`)

Create `.env.local` in the project root (already gitignored via `*.local`):

```dotenv
# Supabase (Auth + Postgres progress/leaderboard)
# If omitted, the app still runs in local Guest mode.
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key

# Optional: Google Gemini API key for live Study Buddy responses
# Leave blank to use the built-in offline curriculum responder.
VITE_GEMINI_API_KEY=
VITE_GEMINI_MODEL=gemini-3.5-flash-lite
```

## Auth, onboarding, and live progress

- **Sign-in options**: Google OAuth (PKCE flow so `?code=...` never collides with `#` hash routes), Email/Password, or **Continue as Guest (Dev Mode)**.
- **Curriculum onboarding**: First-time signed-in users choose **Hardware Basics**, **Networking Basics**, or **Both** in `OnboardingView`, and can change active tracks anytime in Profile settings.
- **Derived stats & RLS**: XP, levels, streaks, track progress, achievements, practice review items, the 5-week activity heatmap, and class leaderboard standings are derived from real per-user completions (`lesson_completions`), profile/streak state (`user_profiles`), and `leaderboard_entries` — all protected by Supabase Row Level Security.

## Offline rules

- **Reads**: local first, refreshed from Supabase when online (`supabaseProgress` wraps `localProgress`).
- **Writes**: saved locally immediately, synced to Supabase when signed in and online, and queued in `SyncQueue` (`save-streak`, `save-settings`, `complete-lesson`).
- **Conflicts**: server wins for leaderboard/rank; device wins for in-progress lab state.
- **Online-only**: live class leaderboard updates and Gemini-backed Study Buddy responses (falls back gracefully to `localStudyBuddy` offline).

## Lessons, progress, and locks

- Lesson text lives in typed `src/data/lessons/hw.ts` and `net.ts` (not JSX components). The Learn page is `src/views/LearnView.tsx` (route `#learn/<track>-<n>`, e.g. `#learn/hw-3`). Order on every page: Learn, then Quiz, then References.
- A lesson is complete when its quiz is passed (12 of 15, see `src/domain/rules/lessonProgress.ts`; each attempt draws 15 random questions from the lesson's pool in `src/data/quizBank.ts`). Completion is saved through `ProgressRepository.saveLessonCompletion` (`supabaseProgress` + `localProgress`) and queued in `SyncQueue` as `complete-lesson`.
- `done` / `current` / `locked` flags are never stored; `deriveTrackProgress` computes them from completions. Each Final Lesson stays locked until every lesson before it is complete.
- Pictures go in `public/lessons/hw|net/`. The PWA precaches them (`jpg`, `jpeg`, `webp` are in the workbox glob). See `LESSON_TODO.md` for missing assets.

## Scripts

- `npm run dev` — Start Vite dev server
- `npm test` — Run Vitest unit/component tests (`e2e/` excluded)
- `npm run test:watch` — Run Vitest in watch mode
- `npm run test:e2e` — Run Playwright headless Chromium smoke tests (`e2e/smoke.spec.ts`)
- `npm run build` — Type-check (`tsc -b`) and build production PWA bundle
- `npm run preview` — Preview production build locally
