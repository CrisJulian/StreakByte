---
name: e2e-testing
description: >-
  Use when adding, updating, or running Playwright end-to-end smoke tests for
  StreakByte UI flows, @dnd-kit/core drag-and-drop labs, auth/guest entry,
  hash routing, or offline fallbacks.
---

# StreakByte E2E Testing

## Scope Rules
- Keep 90% of tests in fast Vitest (`src/**/__tests__`).
- Use Playwright (`e2e/`) strictly for `jsdom` blind spots: real pointer `@dnd-kit/core` drag-and-drop, browser reload persistence, auth/hash routing, and network-blocked offline fallbacks.

## Writing & Running Specs
1. **Stub external network calls**:
   - In `test.beforeEach`, abort or mock `**supabase.co/**` and `**generativelanguage.googleapis.com/**` via `page.route` so tests are deterministic, offline-safe, and free.
2. **Real `@dnd-kit/core` pointer drags**:
   - `PcBuildLab` / `NetworkBuildLab` use `MouseSensor` with an activation distance constraint. Use `locator.boundingBox()`, move to source center, `page.mouse.down()`, `page.mouse.move(targetX, targetY, { steps: 12 })`, then `page.mouse.up()`.
3. **Run headless via CLI (save tokens)**:
   - Run a single spec or test first: `npx playwright test e2e/smoke.spec.ts` or `npx playwright test -g "<name>"`.
   - Run the full suite with `npm run test:e2e`.
   - Avoid driving a live browser interactively unless debugging a visual issue that CLI traces cannot explain.
4. **Assertion integrity**:
   - Never weaken user-facing assertions or skip failing checks to make a test pass.
