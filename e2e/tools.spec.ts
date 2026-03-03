/**
 * E2E: Tools page. Unauthenticated users may be redirected to sign-in
 * or see the tools list; we assert the page loads (no 500) and either
 * shows tools or sign-in.
 */
import { test, expect } from '@playwright/test';

test('Tools page loads or redirects to sign-in', async ({ page }) => {
  await page.goto('/tools');
  await expect(page).toHaveURL(/\/(tools|signin)/);
  const url = page.url();
  if (url.includes('/signin')) {
    await expect(page.getByText(/Welcome Back|Sign in with Google|or email/i)).toBeVisible();
  } else {
    await expect(page.getByRole('heading', { name: /Mystical Tools/i })).toBeVisible();
  }
});
