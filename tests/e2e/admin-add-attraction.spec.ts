// tests/e2e/admin-add-attraction.spec.ts
import { test, expect } from '@playwright/test';
import { resolve } from 'path';

test.describe('Admin Panel - Add Attraction', () => {
  test('should allow an admin to add a new attraction through the UI', async ({ page }) => {
    // 1. Navigate to the admin panel
    await page.goto('/admin/media');

    // 2. Fill out the form to add a new attraction
    await page.locator('input[placeholder="Place Name"]').fill('Khao Sok National Park');
    await page.locator('input[placeholder="ชื่อภาษาท้องถิ่น"]').fill('อุทยานแห่งชาติเขาสก');
    await page.locator('input[placeholder="Province"]').fill('Surat Thani');
    await page.locator('input[placeholder="Category"]').fill('National Park');
    await page.locator('textarea[placeholder="Description"]').fill('A beautiful national park with a large lake and stunning limestone mountains.');
    await page.locator('input[placeholder="13.7563"]').fill('9.15');
    await page.locator('input[placeholder="100.5018"]').fill('98.78');

    // 3. Upload an image
    const imagePath = resolve(__dirname, '../../src/shared/assets/mountain-nature.jpg');
    await page.locator('input[type="file"]').nth(1).setInputFiles(imagePath);

    // 4. Submit the form
    await page.locator('button:has-text("Create Place")').click();

    // 5. Verify that the new attraction was created successfully
    const successToast = page.locator('div[role="status"]:has-text("Place \\"Khao Sok National Park\\" created successfully!")');
    await expect(successToast).toBeVisible({ timeout: 10000 });
  });
});
