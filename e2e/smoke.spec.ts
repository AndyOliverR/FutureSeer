/**
 * E2E smoke: public routes that real users hit first.
 * Landing page and sign-in page must load and show key UI.
 */
import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and has key links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FutureSeer|Ask the Seer/i);
    await expect(page.getByText(/FutureSeer|Ask the Seer/i).first()).toBeVisible();

    const signInAction = page.locator('a[href*="/signin"], button:has-text("Sign In"), button:has-text("Sign in")').first();
    await expect(signInAction).toBeVisible();

    const joinAction = page.locator('a:has-text("Join"), button:has-text("Join"), a:has-text("Get Started"), button:has-text("Get Started")').first();
    await expect(joinAction).toBeVisible();
  });

  test('Sign In button navigates to sign-in page', async ({ page }) => {
    await page.goto('/');
    const signInAction = page.locator('a[href*="/signin"], button:has-text("Sign In"), button:has-text("Sign in")').first();
    await signInAction.click();
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
    await expect(page.getByText(/Welcome Back|Sign in with Google|or email/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/Email Address|email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Password/i)).toBeVisible();
  });
});
