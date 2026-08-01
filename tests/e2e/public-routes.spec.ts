import { expect, test, type Page } from '@playwright/test';

test('login page exposes the Pickle-lo sign-in form', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle(/Sign In/);
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('login empty submission shows deterministic field validation', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByRole('alert').filter({ hasText: 'Check the highlighted fields and try again.' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Enter your email address.' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Enter your password.' })).toBeVisible();
});

async function expectSignUpControlsToMeetTouchTarget(page: Page) {
  for (const label of ['Display name', 'Email address', 'Password', 'Confirm password']) {
    const box = await page.getByLabel(label, { exact: true }).boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  const buttonBox = await page.getByRole('button', { name: 'Create Account' }).boundingBox();
  expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
}

test('sign-up page exposes all account fields with 44px controls on desktop', async ({ page }) => {
  await page.goto('/sign-up');

  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  await expect(page.getByLabel('Display name')).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Confirm password')).toBeVisible();
  await expectSignUpControlsToMeetTouchTarget(page);
});

test.describe('sign-up mobile controls', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keep all account controls at least 44px tall', async ({ page }) => {
    await page.goto('/sign-up');

    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expectSignUpControlsToMeetTouchTarget(page);
  });
});

test('unauthenticated onboarding redirects to login and preserves next', async ({ page }) => {
  await page.goto('/onboarding');

  await expect(page).toHaveURL(/\/login\?next=%2Fonboarding$/);
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
});

test('unauthenticated reset-password redirects to the invalid-link state', async ({ page }) => {
  await page.goto('/reset-password');

  await expect(page).toHaveURL(/\/forgot-password\?error=invalid-link$/);
  await expect(page.getByRole('heading', { name: 'Reset Password' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'That reset link is invalid or expired.' })).toBeVisible();
});

test('auth callback without a code redirects to the generic callback error', async ({ page }) => {
  await page.goto('/auth/callback?next=/onboarding');

  await expect(page).toHaveURL(/\/login\?error=callback$/);
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'That sign-in link is invalid or expired.' })).toBeVisible();
});

test('fake invitation preserves its destination through login', async ({ page }) => {
  await page.goto('/invite/fake-invitation-token');

  await expect(page).toHaveURL(/\/login\?next=%2Finvite%2Ffake-invitation-token$/);
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

  const signUpLink = page.getByRole('link', { name: 'Sign Up' });
  await expect(signUpLink).toHaveAttribute('href', '/sign-up?next=%2Finvite%2Ffake-invitation-token');
});
