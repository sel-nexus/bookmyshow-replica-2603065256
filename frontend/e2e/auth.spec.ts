import { expect, test } from '@playwright/test';

test('a visitor sees invalid OTP feedback and can complete demo OTP sign-in', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('401 (Unauthorized)')) {
      errors.push(message.text());
    }
  });

  await page.goto('/');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Enter OTP').fill('0000');
  await page.getByRole('button', { name: 'Verify & browse movies' }).click();
  await expect(page.getByText('The demo OTP is invalid.')).toBeVisible();
  await expect(page.getByLabel('Enter OTP')).toBeVisible();

  await page.getByLabel('Enter OTP').fill('1234');
  await page.getByRole('button', { name: 'Verify & browse movies' }).click();
  await expect(page.getByText('Paradise')).toBeVisible();
  expect(errors).toEqual([]);
});
