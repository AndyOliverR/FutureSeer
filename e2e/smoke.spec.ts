/**
 * E2E smoke: public routes that real users hit first.
 * Landing page and sign-in page must load and show key UI.
 */
import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and has key links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FutureSeer|Ask the Seer/i);
    await expect(page.getByRole('heading', { name: /Ask the Seer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In with email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Join the Experiment/i })).toBeVisible();
  });

  test('Sign In button navigates to sign-in page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Sign In with email/i }).click();
    await expect(page).toHaveURL(/\/signin/);
  });

  test('footer has Pricing and contact link', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Pricing/i }).first()).toBeVisible();
    await expect(page.locator('footer a[href="/contact"]').first()).toBeVisible();
  });
});

test.describe('Sign-in page', () => {
  test('loads and shows auth UI', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByText(/Welcome Back|Sign in with Google|or email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Email Address|email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Password/i)).toBeVisible();
  });
});
