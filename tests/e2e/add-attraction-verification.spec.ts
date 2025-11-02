// tests/e2e/add-attraction-verification.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Verify New Attraction', () => {
  test('should find the newly added attraction and verify its details', async ({ page }) => {
    // 1. Navigate to the Discover page
    await page.goto('/discover');

    // Wait for the page to load, assuming a title or a specific element is present
    await expect(page).toHaveTitle(/Travel App/);

    // 2. Search for the new attraction
    const searchInput = page.locator('input[placeholder*="Search destinations"]');
    await searchInput.fill('Cheow Lan Dam');
    await searchInput.press('Enter');

    // 3. Verify that the new attraction appears in the search results
    // Wait for the search results to appear
    await page.waitForSelector('div[role="status"]', { timeout: 10000 });

    const attractionCard = page.locator('div[role="status"]:has-text("Cheow Lan Dam")');

    // Wait for the specific attraction card to be visible
    await expect(attractionCard).toBeVisible({ timeout: 10000 });

    // Verify the name
    await expect(attractionCard.locator('h3')).toHaveText('Cheow Lan Dam');

    // Verify the image is present and has the correct URL
    const attractionImage = attractionCard.locator('img');
    await expect(attractionImage).toHaveAttribute(
      'src',
      /https:\/\/quptneebcplnmzkyuxlu\.supabase\.co\/storage\/v1\/object\/public\/place-images\/cheow-lan-dam\.jpg/
    );

    // 4. Take a screenshot for confirmation
    await page.screenshot({ path: 'tests/e2e/screenshots/cheow-lan-dam-verification.png' });
  });
});
