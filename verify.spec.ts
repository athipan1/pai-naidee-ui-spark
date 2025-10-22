import { test, expect } from '@playwright/test';

test('Verify Search Bar is visible on Discover page', async ({ page }) => {
  await page.goto('/discover');
  await expect(page.locator('input[name="search"]')).toBeVisible();
  await page.screenshot({ path: 'discover-page.png' });
});
