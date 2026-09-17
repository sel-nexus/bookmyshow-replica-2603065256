import { expect, test } from '@playwright/test';

test.describe('catalog and seat selection', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a mobile visitor loads protected catalog data and reaches payment after selecting seats', async ({ page }) => {
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
    await expect(page.getByRole('button', { name: 'Sandhya 70mm' })).toBeVisible();
    await page.getByRole('button', { name: 'Sandhya 70mm' }).click();
    await page.getByRole('button', { name: 'Select Seats' }).click();

    await expect(page.getByRole('heading', { name: 'Payment' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Card Number' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('shows the catalog empty state when the live app receives no catalog data', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    // This is deliberately isolated to the controlled no-data UI contract; the normal journey above uses the live server.
    await page.route('**/api/movies', async (route) => {
      await route.fulfill({ contentType: 'application/json', body: '[]' });
    });

    await page.goto('/');
    await page.getByLabel('Mobile number').fill('9876543210');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Enter OTP').fill('1234');
    await page.getByRole('button', { name: 'Verify & browse movies' }).click();

    await expect(page.getByText(/No movies or theatres are available right now/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Paradise' })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
