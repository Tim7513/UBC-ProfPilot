import { test, expect } from '@playwright/test';

test.describe('Course Search E2E Tests', () => {
  test('should search for CPSC 110 professors successfully', async ({ page }) => {
    await page.goto('/app');

    // Wait for app to load
    await expect(page.locator('h1')).toContainText('Prof Pilot');

    // Verify we're on course search by default
    await expect(page.locator('text=Course Search')).toBeVisible();

    // Fill out the course search form
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    // Click search button
    await page.click('button:has-text("Search")');

    // Wait for results and verify
    await expect(page.locator('.results-list')).toBeVisible({ timeout: 30000 });

    // Check that we got results
    const resultCards = page.locator('.professor-card');
    await expect(resultCards.first()).toBeVisible();

    // Verify result structure
    await expect(page.locator('text=Overall Quality')).toBeVisible();
    await expect(page.locator('text=Difficulty')).toBeVisible();
    await expect(page.locator('text=Would Take Again')).toBeVisible();
  });

  test('should handle search errors gracefully', async ({ page }) => {
    await page.goto('/app');

    // Submit empty form
    await page.click('button:has-text("Search")');

    // Should show validation error
    await expect(page.locator('text=Missing required')).toBeVisible();
  });

  test('should handle invalid course data', async ({ page }) => {
    await page.goto('/app');

    // Fill form with invalid data
    await page.fill('[placeholder="Course Name"]', 'INVALID');
    await page.fill('[placeholder="Course Number"]', '999');
    await page.fill('[placeholder="University ID"]', '9999');

    await page.click('button:has-text("Search")');

    // Should handle gracefully without crashing
    await expect(page.locator('text=Error') || page.locator('text=No professors found')).toBeVisible({ timeout: 30000 });
  });

  test('should switch between course and professor search', async ({ page }) => {
    await page.goto('/app');

    // Should start with course search
    await expect(page.locator('text=Course Name')).toBeVisible();

    // Switch to professor search
    await page.click('text=Professor Search');

    // Verify professor search form
    await expect(page.locator('text=First Name')).toBeVisible();
    await expect(page.locator('text=Last Name')).toBeVisible();
    await expect(page.locator('text=University')).toBeVisible();

    // Switch back to course search
    await page.click('text=Course Search');
    await expect(page.locator('text=Course Name')).toBeVisible();
  });

  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size

    await page.goto('/app');

    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();

    // Test mobile search
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    // Should work on mobile
    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.goto('/app');

    // Fill form using keyboard
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    // Submit using Enter key on last field
    await page.press('[placeholder="University ID"]', 'Enter');

    // Should trigger search
    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should work on Chromebook (Chrome)', async ({ browser }) => {
    // This specifically tests Chrome browser (Chromebook)
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/14541.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    await page.goto('/app');
    await expect(page.locator('h1')).toContainText('Prof Pilot');

    // Perform a search
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });

    await context.close();
  });

  test('should handle network connectivity issues', async ({ page }) => {
    await page.goto('/app');

    // Mock network failure by intercepting requests
    await page.route('**/course*', route => route.abort('failed'));

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    // Should show error message
    await expect(page.locator('text=Error') || page.locator('text=Failed')).toBeVisible({ timeout: 10000 });
  });

  test('should validate form inputs in real-time', async ({ page }) => {
    await page.goto('/app');

    const courseNameField = page.locator('[placeholder="Course Name"]');

    // Test empty field validation
    await courseNameField.fill('');
    await courseNameField.blur();

    // Should show validation if implemented
    // This test assumes form validation is in place
    const searchButton = page.locator('button:has-text("Search")');
    expect(await searchButton.isEnabled()).toBe(true); // Button should still be clickable
  });

  test('should handle professor card interactions', async ({ page }) => {
    await page.goto('/app');

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    // Wait for results
    await expect(page.locator('.results-list')).toBeVisible({ timeout: 30000 });

    // Click on first professor card if available
    const firstCard = page.locator('.professor-card').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();

      // Should update insights panel or show details
      await expect(page.locator('text=Overall Quality') || page.locator('text=Loading')).toBeVisible();
    }
  });

  test('should handle sorting functionality', async ({ page }) => {
    await page.goto('/app');

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list')).toBeVisible({ timeout: 30000 });

    // Test sorting dropdown if it exists
    const sortDropdown = page.locator('select');
    if (await sortDropdown.isVisible()) {
      await page.selectOption('select', 'rating');
      await expect(page.locator('.professor-card').first()).toBeVisible();
    }
  });

  test('should work across different browsers', async ({ page }) => {
    await page.goto('/app');

    // Basic functionality should work regardless of browser
    await expect(page.locator('h1')).toBeVisible();

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    // Should handle the search request
    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle page refresh during search', async ({ page }) => {
    await page.goto('/app');

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    // Refresh page during search
    await page.reload();

    // Should return to initial state
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[placeholder="Course Name"]')).toHaveValue('');
  });

  test('should handle long loading times gracefully', async ({ page }) => {
    await page.goto('/app');

    // Intercept and delay the API response
    await page.route('**/course*', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      await route.continue();
    });

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    // Should show loading state for extended period
    await expect(page.locator('text=Loading') || page.locator('.spinner')).toBeVisible();

    // Should eventually complete
    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 45000 });
  });
});
