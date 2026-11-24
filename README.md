# StreakByte

Gamified IT basics (PC hardware and networking) with hands-on labs.
React 19 + TypeScript + Vite, Tailwind CSS v4, dnd-kit, Zustand, installable PWA (offline).

## Architecture (onion / hexagonal)

Dependencies point inward: `ui` -> `application` -> `domain`. Adapters implement ports.

```
src/
  domain/rules/       Pure TS: pcBuild, network, streak, summaries. No React/Supabase/dnd-kit.
  application/ports/  Interfaces: AuthService, ProgressRepository, StudyBuddyService,
                      ReminderScheduler, SyncQueue.
  adapters/local/     Offline/dev implementations (localStorage, Notification API).
  adapters/supabase/  (backend teammate) implements the same ports.
  composition.ts      The ONLY place that picks adapters. Swap local -> Supabase here.
  store/              Zustand: UI/session state; calls domain rules, never owns them.
  views/, components/ React UI. Tailwind and dnd-kit live here only.
```

### Going live with Supabase
1. Implement each interface in `src/application/ports/index.ts` under `src/adapters/supabase/`.
2. Change the imports in `src/composition.ts`. Nothing else should need to change.
3. Streak restore must be validated server-side; `domain/rules/streak.ts` is the shared rule.

## Offline rules
- Reads: local first, refresh from Supabase when online.
- Writes: local immediately, queued in `SyncQueue`, flushed when back online.
- Conflicts: server wins for leaderboard/rank; device wins for in-progress lab state.
- Online-only: leaderboard, live challenge, server-backed Study Buddy (show an offline state).

## Lessons, progress and locks
- Lesson text lives in `src/data/lessons/hw.ts` and `net.ts` (typed data, not components). The Learn page is `src/views/LearnView.tsx` (route `#learn/<track>-<n>`, e.g. `#learn/hw-3`). Order on every page: Learn, then Quiz, then References.
- A lesson is complete when its quiz is passed (3 of 4, see `src/domain/rules/lessonProgress.ts`). Completion is saved through `ProgressRepository.saveLessonCompletion` (local adapter now, Supabase later) and queued in `SyncQueue` as `complete-lesson`.
- Done / current / locked is never stored. `deriveTrackProgress` works it out from the completions. Each Final Lesson is locked until every lesson before it is complete.
- Pictures go in `public/lessons/hw|net/`. The PWA precaches them (`jpg`, `jpeg`, `webp` are in the workbox glob). See `LESSON_TODO.md` for what is still missing.

## Scripts
`npm run dev` | `npm test` | `npm run build` | `npm run preview`
