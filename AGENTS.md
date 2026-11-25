# StreakByte Agent Guidelines

## Architecture & Boundaries
- Dependencies point inward: `views/` & `components/` -> `store/` -> `application/ports/` -> `domain/rules/`.
- `src/domain/` is pure TypeScript: NEVER import React, Zustand, `@dnd-kit/core`, Supabase, or Gemini there.
- `src/composition.ts` is the ONLY adapter wiring point (`auth` -> `supabaseAuth`, `studyBuddy` -> `geminiStudyBuddy`; `progress`, `reminders`, `syncQueue` are still local). Never import adapters directly outside `src/composition.ts`.

## Minimalism Discipline (Ponytail)
Before writing new code, walk the reduction ladder:
1. Does it need to exist? (YAGNI — skip speculative abstractions, unused options, and extra wrapper layers.)
2. Does it already exist in `src/domain/rules/` or `src/components/`? Reuse it.
3. Can native JS/Web APIs, React 19, or Tailwind v4 handle it in fewer lines?
4. Write the smallest clean diff that solves the requirement.

Never take shortcuts on input validation, Supabase RLS/security, accessibility (`aria-*`, keyboard navigation, focus restoration), or error handling.

## StreakByte Invariants
- Never store `done`, `current`, or `locked` flags; always derive track state with `deriveTrackProgress` from `LessonCompletion[]`.
- Offline-first contract: read local first then refresh from Supabase when online; write local immediately and enqueue in `SyncQueue` (`save-streak`, `save-settings`, `complete-lesson`) for idempotent flush.
- Conflict rules: server wins for leaderboard/rank; device wins for in-progress lab state. Streak restores must be validated server-side against `src/domain/rules/streak.ts`.
- Lesson text and metadata belong in typed `src/data/lessons/*.ts`, not JSX components.
- Hash routes: `#dashboard`, `#curriculum`, `#learn/<track>-<n>`, `#quiz/<track>-<n>`, `#lesson/pc`, `#lesson/network`, `#practice`, `#achievements`, `#leaderboard`, `#profile`, `#complete`.

## Verification & Token Hygiene
- Test narrow-to-wide: run `npx vitest run <file>` while iterating, then `npm test` and `npm run build` before finishing any code change.
- Run `npm run test:e2e` after changing auth, routing, labs (`PcBuildLab` / `NetworkBuildLab`), quiz progression, or offline/sync flows. Prefer headless Playwright CLI over interactive visual browser driving.
- Never weaken assertions or alter expected behavior just to make a failing test pass.
