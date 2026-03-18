import { test, expect } from '@playwright/test';

test.describe('Special user quota bypass', () => {
  test('special user is not blocked by profile update quota', async ({ page }) => {
    // This test assumes E2E_TEST_MODE and a known test user configured server-side
    // so that hitting /profile as that user reflects specialUser=true in Firestore.
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // The quota warning banner should not be visible for special users.
    const quotaWarning = page.getByText(/profile update limit reached/i);
    if (await quotaWarning.isVisible().catch(() => false)) {
      // If this still appears, fail clearly so we notice in CI.
      throw new Error('Special user still sees profile update limit warning');
    }

    // Generate button should be enabled when birth details exist.
    const generateButton = page.getByRole('button', { name: /generate mystical profile/i });
    if (await generateButton.isVisible().catch(() => false)) {
      await expect(generateButton).toBeEnabled();
    }
  });
});

