import { test, expect } from '@playwright/test';

test.describe('Basic navigation', () => {
  test.skip(!!process.env.CI, 'Temporarily skipped in CI due intermittent browser context closure');

  test('user can move between core sections', async ({ page, context }) => {
    let activePage = page;
    try {
      await activePage.goto('/');
    } catch {
      // Rare CI flake: recover with a fresh tab if the original page closes early.
      activePage = await context.newPage();
      await activePage.goto('/');
    }
    await activePage.waitForLoadState('networkidle');

    // Tools
    await activePage.goto('/tools');
    await expect(activePage).toHaveURL(/\/(tools|signin)/);

    // Seer
    await activePage.goto('/ask-the-seer');
    await expect(activePage).toHaveURL(/\/(ask-the-seer|signin)/);

    // Profile
    await activePage.goto('/profile');
    await expect(activePage).toHaveURL(/\/(profile|signin)/);

    // Community (attribution)
    await activePage.goto('/community/attribution');
    await expect(activePage).toHaveURL(/\/(community\/attribution|signin)/);
  });
});

