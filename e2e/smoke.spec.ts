import { expect, test, type Page } from '@playwright/test';

async function enterAsGuest(page: Page) {
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.getByRole('button', { name: /Continue as Guest/i }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back, Guest' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route('**supabase.co/**', (route) => route.abort());
  await page.route('**generativelanguage.googleapis.com/**', (route) => route.abort());
});

test('guest entry, theme toggle, and curriculum navigation', async ({ page }) => {
  await page.goto('/');
  await enterAsGuest(page);

  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();

  const nav = page.getByRole('navigation', { name: 'Main' });
  await nav.getByRole('link', { name: 'Curriculum' }).click();
  await expect(page.getByRole('heading', { name: 'Hardware Basics', level: 1 })).toBeVisible();
});

test('learn to quiz completion persists across reload', async ({ page }) => {
  await page.goto('/');
  await enterAsGuest(page);

  await page.evaluate(() => {
    window.location.hash = '#learn/hw-1';
  });
  await expect(page.getByRole('heading', { name: /Inside the PC/i, level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Take the quiz' }).click();

  const answers = [
    'CPU',
    'Remove heat so the CPU stays at a safe temperature',
    'Motherboard',
    'To fill tiny gaps so heat can pass across more easily',
  ];

  for (let i = 0; i < answers.length; i += 1) {
    await page.getByText(answers[i], { exact: true }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await expect(page.getByText('Correct!')).toBeVisible();
    await page
      .getByRole('button', { name: i === answers.length - 1 ? 'See results' : 'Next question' })
      .click();
  }

  await expect(page.getByText('100%')).toBeVisible();

  await page.reload();
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Curriculum' }).click();

  const lessonRow = page.locator('li', { hasText: 'Inside the PC' });
  await expect(lessonRow).toHaveAttribute('data-status', 'done');
  await expect(lessonRow.getByText('Completed')).toBeVisible();
});

test('real pointer drag-and-drop in PcBuildLab', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1080 });
  await page.goto('/');
  await enterAsGuest(page);

  await page.getByRole('button', { name: /Start lesson/i }).click();
  const setupDialog = page.getByRole('dialog', { name: 'Session setup' });
  await expect(setupDialog).toBeVisible();
  await setupDialog.getByRole('button', { name: 'Start lesson' }).click();

  await expect(page.getByText('Partly built PC')).toBeVisible();

  const tray = page.getByRole('group', { name: 'Parts tray' });
  const ramButton = tray.getByRole('button', { name: /RAM stick 2x/i });
  const slotA2 = page.getByRole('button', { name: 'RAM slot A2' });

  await ramButton.scrollIntoViewIfNeeded();
  const ramBox = await ramButton.boundingBox();
  const slotBox = await slotA2.boundingBox();
  expect(ramBox).not.toBeNull();
  expect(slotBox).not.toBeNull();

  const startX = ramBox!.x + ramBox!.width / 2;
  const startY = ramBox!.y + ramBox!.height / 2;
  const endX = slotBox!.x + slotBox!.width / 2;
  const endY = slotBox!.y + slotBox!.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Exceed MouseSensor's 6px activationConstraint so @dnd-kit enters dragging state and measures droppables
  await page.mouse.move(startX - 12, startY - 12, { steps: 4 });
  await page.mouse.move(endX, endY, { steps: 15 });
  await page.mouse.up();

  await expect(tray.getByRole('button', { name: /RAM stick 1x/i })).toBeVisible();
});

test('offline study buddy fallback when external requests are blocked', async ({ page }) => {
  await page.goto('/');
  await enterAsGuest(page);

  await page.getByRole('button', { name: 'Open study buddy chat' }).click();
  const chatDialog = page.getByRole('dialog', { name: 'Study buddy chat' });
  await expect(chatDialog).toBeVisible();

  await chatDialog.getByRole('button', { name: 'Explain the RAM key notch' }).click();
  await expect(chatDialog.getByText(/off-centre on the gold pins/i)).toBeVisible();
});

test('oauth redirect error displays alert and cleans URL', async ({ page }) => {
  await page.goto('/?error=access_denied&error_description=Google+sign-in+was+cancelled');
  await expect(page.getByRole('alert')).toHaveText('Google sign-in was cancelled');
  const search = await page.evaluate(() => window.location.search);
  expect(search).toBe('');
});
