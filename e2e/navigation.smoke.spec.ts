import { test, expect } from '@playwright/test';

test.describe('Basic navigation', () => {
  test('user can move between core sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Tools
    await page.goto('/tools');
    await expect(page).toHaveURL(/\/tools/);

    // Seer
    await page.goto('/ask-the-seer');
    await expect(page).toHaveURL(/ask-the-seer/);

    // Profile
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);

    // Community (attribution)
    await page.goto('/community/attribution');
    await expect(page).toHaveURL(/community\/attribution/);
  });
});

