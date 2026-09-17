import { expect, test } from '@playwright/test';

/** Completes the required database-backed booking journey. */
test('visitor books preset seats, retains confirmation after reload, and saves evidence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('/');
  await page.getByLabel('Mobile number').fill('9876543210');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Enter OTP').fill('1234');
  const moviesResponse = page.waitForResponse(
    (response) => response.url().includes('/api/movies') && response.status() === 200,
  );
  await page.getByRole('button', { name: 'Verify & browse movies' }).click();
  await expect(moviesResponse).resolves.toBeTruthy();
  await expect(page.getByRole('button', { name: 'Paradise' })).toBeVisible();
  const theatresResponse = page.waitForResponse(
    (response) => response.url().includes('/api/theatres?movieId=') && response.status() === 200,
  );
  await page.getByRole('button', { name: 'Paradise' }).click();
  await expect(theatresResponse).resolves.toBeTruthy();
  await page.getByRole('button', { name: 'Sandhya 70mm' }).click();
  await page.getByRole('button', { name: 'Select Seats' }).click();

  const bookingResponse = page.waitForResponse(
    (response) => response.url().includes('/api/bookings') && response.status() === 201,
  );
  await page.getByRole('button', { name: 'Pay' }).click();
  await expect(page.getByRole('status')).toHaveText('Processing Payment...');
  await expect(bookingResponse).resolves.toBeTruthy();
  await expect(page.getByText('Congratulations!')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/Paradise at Sandhya 70mm/)).toBeVisible();
  await expect(page.getByText('A1, A2, A3')).toBeVisible();
  await page.screenshot({ path: 'test-results/booking-confirmation.png', fullPage: true });

  await page.reload();
  await expect(page.getByText('Congratulations!')).toBeVisible();
  await expect(page.getByText(/Paradise at Sandhya 70mm/)).toBeVisible();
  await expect(page.getByText('A1, A2, A3')).toBeVisible();
  expect(errors).toEqual([]);
});
