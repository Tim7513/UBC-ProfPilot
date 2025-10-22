import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  test('should work on iPhone SE', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Verify mobile layout
    await expect(page.locator('h1')).toBeVisible();

    // Test course search on mobile
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    // Should work on mobile
    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should work on iPhone 12 Pro', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/app');

    // Test professor search on mobile
    await page.click('text=Professor Search');
    await expect(page.locator('text=Professor Search')).toBeVisible();

    await page.fill('[placeholder="First Name"]', 'Patrice');
    await page.fill('[placeholder="Last Name"]', 'Belleville');
    await page.fill('[placeholder="University"]', 'University of British Columbia');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.professor-details') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should work on iPad', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/app');

    // Should handle tablet size
    await expect(page.locator('h1')).toBeVisible();

    // Test both search types
    await page.click('text=Professor Search');
    await page.fill('[placeholder="First Name"]', 'Test');
    await page.fill('[placeholder="Last Name"]', 'Professor');
    await page.fill('[placeholder="University"]', 'Test University');
    await page.click('button:has-text("Search")');

    await expect(page.locator('.professor-details') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should work on Android devices', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 }); // Samsung Galaxy S8

    await page.goto('/app');

    // Test mobile interactions
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle touch interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Test touch interactions
    const courseNameField = page.locator('[placeholder="Course Name"]');
    await courseNameField.tap();
    await page.keyboard.type('CPSC');

    await page.tap('[placeholder="Course Number"]');
    await page.keyboard.type('110');

    await page.tap('[placeholder="University ID"]');
    await page.keyboard.type('1413');

    await page.tap('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle mobile keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Focus on input field to trigger mobile keyboard
    const firstNameField = page.locator('[placeholder="First Name"]');

    // Switch to professor search first
    await page.click('text=Professor Search');

    await firstNameField.tap();
    await expect(firstNameField).toBeFocused();

    // Type with mobile keyboard simulation
    await page.keyboard.type('Patrice');
    await expect(firstNameField).toHaveValue('Patrice');
  });

  test('should handle mobile orientation changes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Test portrait mode
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    // Change to landscape
    await page.setViewportSize({ width: 667, height: 375 });

    // Should still be functional
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[placeholder="Course Name"]')).toHaveValue('CPSC');

    await page.click('button:has-text("Search")');
    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });

    // Change back to portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle mobile browser chrome', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Simulate mobile browser address bar and navigation
    await page.evaluate(() => {
      // Hide address bar (common mobile behavior)
      window.scrollTo(0, 1);
    });

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle mobile network conditions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Simulate slow mobile network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      await route.continue();
    });

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    // Should handle slow network gracefully
    await expect(page.locator('.results-list') || page.locator('text=Loading') || page.locator('text=Error')).toBeVisible({ timeout: 45000 });
  });

  test('should handle mobile scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Fill form
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    // Wait for results
    await expect(page.locator('.results-list')).toBeVisible({ timeout: 30000 });

    // Test scrolling on mobile
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(page.locator('.results-list')).toBeVisible();

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle mobile form validation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Try to submit empty form on mobile
    await page.tap('button:has-text("Search")');

    // Should show validation
    await expect(page.locator('text=Missing required')).toBeVisible();
  });

  test('should handle mobile accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Check that all form fields are accessible on mobile
    const firstNameField = page.locator('[placeholder="First Name"]');
    await expect(firstNameField).toBeVisible();

    // Should be large enough for touch targets
    const boundingBox = await firstNameField.boundingBox();
    expect(boundingBox.width).toBeGreaterThan(44); // Minimum touch target size
    expect(boundingBox.height).toBeGreaterThan(44);
  });

  test('should handle mobile performance', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Monitor performance on mobile
    const startTime = Date.now();

    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list')).toBeVisible({ timeout: 30000 });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Should load within reasonable time on mobile (less than 45 seconds)
    expect(loadTime).toBeLessThan(45000);
  });

  test('should handle mobile browser refresh', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Fill form
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    // Refresh page
    await page.reload();

    // Should return to initial state
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[placeholder="Course Name"]')).toHaveValue('');
  });

  test('should handle mobile browser back button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');
    await expect(page.locator('text=Professor Search')).toBeVisible();

    // Go back using browser back button
    await page.goBack();
    await expect(page.locator('text=Course Search')).toBeVisible();

    // Go forward
    await page.goForward();
    await expect(page.locator('text=Professor Search')).toBeVisible();
  });

  test('should handle mobile zoom gestures', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Simulate zoom in
    await page.evaluate(() => {
      document.body.style.zoom = '1.5';
    });

    await expect(page.locator('h1')).toBeVisible();

    // Should still be functional when zoomed
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
  });

  test('should handle mobile memory constraints', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Simulate memory pressure by creating many elements
    await page.evaluate(() => {
      for (let i = 0; i < 100; i++) {
        const div = document.createElement('div');
        div.textContent = `Memory test element ${i}`;
        div.style.position = 'absolute';
        div.style.left = '-9999px';
        document.body.appendChild(div);
      }
    });

    // App should still be functional
    await expect(page.locator('h1')).toBeVisible();

    // Should still be able to search
    await page.fill('[placeholder="Course Name"]', 'Memory');
    await page.fill('[placeholder="Course Number"]', 'Test');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle mobile battery saver mode', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Simulate reduced performance (battery saver)
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Should still work with reduced performance
    await page.fill('[placeholder="Course Name"]', 'Battery');
    await page.fill('[placeholder="Course Number"]', 'Saver');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle mobile dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Test in dark mode if supported
    await page.emulateMedia({ colorScheme: 'dark' });

    await expect(page.locator('h1')).toBeVisible();

    // Should be functional in dark mode
    await page.fill('[placeholder="Course Name"]', 'Dark');
    await page.fill('[placeholder="Course Number"]', 'Mode');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle mobile pull-to-refresh', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Simulate pull-to-refresh (scroll up and then down quickly)
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(100);
    await page.evaluate(() => window.scrollTo(0, 0));

    // App should still be functional
    await expect(page.locator('h1')).toBeVisible();

    // Should still be able to interact
    await page.fill('[placeholder="Course Name"]', 'Refresh');
    await page.fill('[placeholder="Course Number"]', 'Test');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle mobile tab switching', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Fill form
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Form should be reset for professor search
    expect(await page.locator('[placeholder="Course Name"]').inputValue()).toBe('');

    // Switch back to course search
    await page.click('text=Course Search');

    // Should be back to course form
    await expect(page.locator('[placeholder="Course Name"]')).toBeVisible();
  });

  test('should handle mobile long press', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/app');

    // Test long press on search button
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click({ delay: 500 }); // Long press

    // Should still trigger search
    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });
});
