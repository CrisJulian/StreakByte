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

## Scripts
`npm run dev` | `npm test` | `npm run build` | `npm run preview`
