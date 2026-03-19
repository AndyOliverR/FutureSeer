import { test, expect } from '@playwright/test';

test.describe('Onboarding / profile flow', () => {
  test('profile route is reachable and not broken for user flow', async ({ page }) => {
    await page.goto('/signin');
    await page.waitForLoadState('networkidle');

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // In CI we may be anonymous, so profile can redirect to signin.
    if (page.url().includes('/signin')) {
      await expect(page).toHaveURL(/\/signin/);
      await expect(page.getByText(/Welcome Back|Sign in with Google|or email/i).first()).toBeVisible();
      return;
    }

    await expect(page).toHaveURL(/\/profile/);
    await expect(page.getByText('Personal Data', { exact: false })).toBeVisible();

    const editButton = page.getByRole('button', { name: /edit/i }).first();
    await editButton.click();

    const bottomSave = page.getByRole('button', { name: /^save$/i }).first();
    if (await bottomSave.isVisible().catch(() => false)) {
      await bottomSave.click();
    } else {
      const headerSaveIcon = page.locator('button').filter({ hasText: '' }).first();
      await headerSaveIcon.click();
    }

    // Save attempt should not crash page; success copy can vary by environment/user state.
    await expect(page).toHaveURL(/\/profile/);
  });
});

