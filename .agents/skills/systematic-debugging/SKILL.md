---
name: systematic-debugging
description: >-
  Use when investigating a bug, failing test, runtime error, or unexpected
  UI/state behavior in StreakByte to isolate the root cause without
  guess-and-retry loops.
---

# Systematic Debugging

Follow this sequence strictly to minimize wasted edits and token burn.

## Steps

1. **Reproduce with the smallest command**:
   - Unit/component: `npx vitest run <path-to-test>`
   - E2E: `npx playwright test -g "<test-name>"`
   - Capture the exact error message, stack trace, and failing assertion.

2. **Isolate the layer before editing**:
   - `src/domain/rules/`: pure calculation/validation logic.
   - `src/store/useStreakByteStore.ts`: state transitions, hash sync, port calls.
   - `src/adapters/`: local storage, Supabase, or Gemini fallback behavior.
   - `src/views/` & `src/components/`: rendering, accessibility, `@dnd-kit/core` sensors.
   - Read only the relevant files across the failing boundary.

3. **Form one explicit hypothesis and apply the minimal fix**:
   - State what is broken and why in one sentence before editing.
   - Make the smallest surgical change at the root cause (never mask symptoms).

4. **Add or tighten a regression test**:
   - Put pure logic regressions in `src/domain/rules/__tests__/`.
   - Put store/UI regressions in `src/store/__tests__/` or `src/views/**/__tests__/`.
   - Put pointer drag, reload persistence, or network-abort regressions in `e2e/`.

5. **Verify**:
   - Run the targeted test first, then `npm test` and `npm run build` (and `npm run test:e2e` if UI/routing/auth/labs changed).

## Stop Condition

If **2 consecutive fix hypotheses fail**, stop editing immediately. Summarize what was tested, what each hypothesis ruled out, and the remaining unknowns before proceeding.
