---
name: supabase-adapter-migration
description: >-
  Use when implementing or modifying Supabase adapters under
  src/adapters/supabase/, migrating local ports (localProgress, localReminders,
  localSyncQueue), or changing persistence and offline sync behavior.
---

# Supabase Adapter Migration

## Steps

1. **Load Supabase skills first**:
   - Before writing SQL, migrations, or RLS policies, read the installed `supabase` and `supabase-postgres-best-practices` skills.

2. **Inspect ports and local reference adapters**:
   - Read `src/application/ports/index.ts` and `src/composition.ts`.
   - Read the corresponding `src/adapters/local/` implementation (`localProgress.ts`, `localReminders.ts`, or `localSyncQueue.ts`) to preserve exact semantics.

3. **Preserve the offline-first contract**:
   - Reads: return local state first, then refresh from Supabase when online.
   - Writes: save locally immediately and enqueue `save-streak`, `save-settings`, or `complete-lesson` in `SyncQueue`; flush idempotently when online.
   - Conflict resolution: server wins for leaderboard/rank; device wins for in-progress lab state.
   - `saveLessonCompletion` must stay idempotent (best score wins).
   - Streak restores must be validated server-side using the same rules as `src/domain/rules/streak.ts`.

4. **Enforce RLS & clean wiring**:
   - Enable Row Level Security on every user-scoped table and scope policies to `auth.uid()`.
   - Wire swapped adapters only in `src/composition.ts`.
   - If refactoring `AuthService`, fold `onAuthStateChange` and `signInWithGoogle` into `AuthService` so `src/App.tsx` and `src/views/LoginView.tsx` no longer import `src/adapters/supabase/supabaseAuth.ts` directly.

5. **Verify**:
   - Run unit/store tests, `npm test`, `npm run build`, and `npm run test:e2e` (with network routes stubbed in E2E).
