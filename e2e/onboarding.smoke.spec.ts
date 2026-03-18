import { test, expect } from '@playwright/test';

test.describe('Onboarding / profile flow', () => {
  test('existing user can edit and save profile without getting stuck', async ({ page }) => {
    // Assumes a test user can sign in via existing-session or a simple email flow.
    await page.goto('/signin');

    // If a test session already exists, the app should auto-redirect; otherwise we expect
    // a manual email sign-in to be available. Keep this tolerant: just ensure we end up
    // on /profile without errors.
    await page.waitForLoadState('networkidle');

    // Best-effort: try to go to profile explicitly if we are still on /signin.
    if (page.url().includes('/signin')) {
      await page.goto('/profile');
    }

    await expect(page).toHaveURL(/\/profile/);

    // Ensure Personal Data card renders.
    await expect(page.getByText('Personal Data', { exact: false })).toBeVisible();

    // Enter edit mode.
    const editButton = page.getByRole('button', { name: /edit/i }).first();
    await editButton.click();

    // Change display name field if present.
    const displayNameInput = page.getByLabel(/display name/i).first();
    if (await displayNameInput.isVisible()) {
      const current = await displayNameInput.inputValue();
      await displayNameInput.fill(current ? `${current} Test` : 'Test User');
    }

    // Use the bottom Save button if present, otherwise header Save icon.
    const bottomSave = page.getByRole('button', { name: /^save$/i }).first();
    if (await bottomSave.isVisible().catch(() => false)) {
      await bottomSave.click();
    } else {
      const headerSaveIcon = page.locator('button').filter({ hasText: '' }).first();
      await headerSaveIcon.click();
    }

    // Confirm success message appears (text may vary slightly between layouts).
    const successAlert = page.getByText(/profile updated successfully/i);
    await expect(successAlert).toBeVisible();
  });
});

