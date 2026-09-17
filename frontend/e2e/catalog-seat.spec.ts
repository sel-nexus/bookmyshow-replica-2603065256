import { test, expect } from '@playwright/test';
/** Confirms the real API catalog is visible after OTP authentication. */
test('a signed-in visitor sees seeded movies', async ({ page }) => { await page.goto('/'); await page.getByLabel('Mobile number').fill('9876543210'); await page.getByRole('button',{name:'Continue'}).click(); await page.getByLabel('Enter OTP').fill('1234'); await page.getByRole('button',{name:'Verify & browse movies'}).click(); await expect(page.getByText('Paradise')).toBeVisible(); await expect(page.getByText('Bloody Romeo')).toBeVisible(); });
