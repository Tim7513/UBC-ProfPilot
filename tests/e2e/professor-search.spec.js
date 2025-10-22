import { test, expect } from '@playwright/test';

test.describe('Professor Search E2E Tests', () => {
  test('should search for professor successfully', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');
    await expect(page.locator('text=Professor Search')).toBeVisible();

    // Fill out the professor search form
    await page.fill('[placeholder="First Name"]', 'Patrice');
    await page.fill('[placeholder="Last Name"]', 'Belleville');
    await page.fill('[placeholder="University"]', 'University of British Columbia');

    // Click search button
    await page.click('button:has-text("Search")');

    // Wait for results and verify
    await expect(page.locator('.professor-details') || page.locator('text=Loading')).toBeVisible({ timeout: 30000 });

    // Should show professor information
    await expect(page.locator('text=Overall Quality') || page.locator('text=Rating')).toBeVisible();
  });

  test('should handle professor not found', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Fill form with non-existent professor
    await page.fill('[placeholder="First Name"]', 'NonExistent');
    await page.fill('[placeholder="Last Name"]', 'Professor');
    await page.fill('[placeholder="University"]', 'NonExistent University');

    await page.click('button:has-text("Search")');

    // Should handle gracefully
    await expect(page.locator('text=Error') || page.locator('text=No results')).toBeVisible({ timeout: 30000 });
  });

  test('should validate required fields for professor search', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Try to search without filling all fields
    await page.fill('[placeholder="First Name"]', 'Patrice');
    await page.fill('[placeholder="Last Name"]', 'Belleville');
    // Leave university field empty

    await page.click('button:has-text("Search")');

    // Should show validation error
    await expect(page.locator('text=Missing required')).toBeVisible();
  });

  test('should handle professor with many reviews', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Search for a professor that likely has many reviews
    await page.fill('[placeholder="First Name"]', 'Patrice');
    await page.fill('[placeholder="Last Name"]', 'Belleville');
    await page.fill('[placeholder="University"]', 'University of British Columbia');

    await page.click('button:has-text("Search")');

    // Should handle large amounts of data
    await expect(page.locator('.professor-details') || page.locator('text=Loading')).toBeVisible({ timeout: 30000 });

    // Should show tag analytics if available
    await expect(page.locator('text=Tags') || page.locator('text=Reviews')).toBeVisible();
  });

  test('should handle professor with special characters in name', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Test with special characters
    await page.fill('[placeholder="First Name"]', 'José-María');
    await page.fill('[placeholder="Last Name"]', "O'Connor");
    await page.fill('[placeholder="University"]', 'University of British Columbia');

    await page.click('button:has-text("Search")');

    // Should handle gracefully
    await expect(page.locator('.professor-details') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should work on mobile for professor search', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('/app');

    // Switch to professor search on mobile
    await page.click('text=Professor Search');
    await expect(page.locator('text=Professor Search')).toBeVisible();

    // Fill form on mobile
    await page.fill('[placeholder="First Name"]', 'Patrice');
    await page.fill('[placeholder="Last Name"]', 'Belleville');
    await page.fill('[placeholder="University"]', 'University of British Columbia');

    await page.click('button:has-text("Search")');

    // Should work on mobile
    await expect(page.locator('.professor-details') || page.locator('text=Loading')).toBeVisible({ timeout: 30000 });
  });

  test('should handle OpenAI API integration', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    await page.fill('[placeholder="First Name"]', 'Patrice');
    await page.fill('[placeholder="Last Name"]', 'Belleville');
    await page.fill('[placeholder="University"]', 'University of British Columbia');

    await page.click('button:has-text("Search")');

    // Wait for AI summary to load
    await expect(page.locator('.insights-panel') || page.locator('text=Loading')).toBeVisible({ timeout: 30000 });

    // Should show AI insights if available
    await expect(page.locator('text=Summary') || page.locator('text=Analysis')).toBeVisible();
  });

  test('should handle missing OpenAI API key', async ({ page }) => {
    // This test assumes we can test without API key
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    await page.fill('[placeholder="First Name"]', 'Test');
    await page.fill('[placeholder="Last Name"]', 'Professor');
    await page.fill('[placeholder="University"]', 'Test University');

    await page.click('button:has-text("Search")');

    // Should handle missing API key gracefully
    await expect(page.locator('.professor-details') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle network timeouts', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Intercept and delay requests excessively
    await page.route('**/professor*', async route => {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second delay
      await route.continue();
    });

    await page.fill('[placeholder="First Name"]', 'Timeout');
    await page.fill('[placeholder="Last Name"]', 'Test');
    await page.fill('[placeholder="University"]', 'Timeout University');

    await page.click('button:has-text("Search")');

    // Should eventually timeout or show error
    await expect(page.locator('text=Error') || page.locator('text=Timeout')).toBeVisible({ timeout: 15000 });
  });

  test('should handle malformed API responses', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Intercept and return malformed JSON
    await page.route('**/professor*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json {'
      });
    });

    await page.fill('[placeholder="First Name"]', 'Malformed');
    await page.fill('[placeholder="Last Name"]', 'Test');
    await page.fill('[placeholder="University"]', 'Test University');

    await page.click('button:has-text("Search")');

    // Should handle malformed response gracefully
    await expect(page.locator('text=Error') || page.locator('.error-message')).toBeVisible({ timeout: 10000 });
  });

  test('should maintain search history between interactions', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Perform first search
    await page.fill('[placeholder="First Name"]', 'Patrice');
    await page.fill('[placeholder="Last Name"]', 'Belleville');
    await page.fill('[placeholder="University"]', 'University of British Columbia');
    await page.click('button:has-text("Search")');

    await expect(page.locator('.professor-details') || page.locator('text=Loading')).toBeVisible({ timeout: 30000 });

    // Navigate away and back (if navigation exists)
    await page.goto('/app');
    await page.click('text=Professor Search');

    // Form should be reset
    expect(await page.locator('[placeholder="First Name"]').inputValue()).toBe('');
  });

  test('should handle rapid successive searches', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Perform multiple rapid searches
    const searches = [
      { firstName: 'Patrice', lastName: 'Belleville', university: 'University of British Columbia' },
      { firstName: 'John', lastName: 'Smith', university: 'University of British Columbia' },
      { firstName: 'Sarah', lastName: 'Johnson', university: 'University of British Columbia' }
    ];

    for (const search of searches) {
      await page.fill('[placeholder="First Name"]', search.firstName);
      await page.fill('[placeholder="Last Name"]', search.lastName);
      await page.fill('[placeholder="University"]', search.university);
      await page.click('button:has-text("Search")');

      // Should handle each search
      await expect(page.locator('.professor-details') || page.locator('text=Loading') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });

      // Clear form for next search
      await page.fill('[placeholder="First Name"]', '');
      await page.fill('[placeholder="Last Name"]', '');
      await page.fill('[placeholder="University"]', '');
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');
    await expect(page.locator('text=Professor Search')).toBeVisible();

    // Go back
    await page.goBack();
    await expect(page.locator('text=Course Search')).toBeVisible();

    // Go forward
    await page.goForward();
    await expect(page.locator('text=Professor Search')).toBeVisible();
  });

  test('should handle page visibility changes', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    await page.fill('[placeholder="First Name"]', 'Patrice');
    await page.fill('[placeholder="Last Name"]', 'Belleville');
    await page.fill('[placeholder="University"]', 'University of British Columbia');
    await page.click('button:has-text("Search")');

    // Hide page (simulate user switching tabs)
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Show page again
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Should still be functional
    await expect(page.locator('text=Professor Search')).toBeVisible();
  });

  test('should handle memory pressure scenarios', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Simulate memory pressure by creating many DOM elements
    await page.evaluate(() => {
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.textContent = `Memory test ${i}`;
        div.style.display = 'none';
        document.body.appendChild(div);
      }
    });

    // App should still be functional
    await expect(page.locator('text=Professor Search')).toBeVisible();

    // Should still be able to search
    await page.fill('[placeholder="First Name"]', 'Memory');
    await page.fill('[placeholder="Last Name"]', 'Test');
    await page.fill('[placeholder="University"]', 'Test University');
    await page.click('button:has-text("Search")');

    await expect(page.locator('.professor-details') || page.locator('text=Loading') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle accessibility requirements', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Check accessibility features
    const firstNameField = page.locator('[placeholder="First Name"]');
    await expect(firstNameField).toHaveAttribute('type', /text/);

    // Should have proper labels
    await expect(page.locator('label')).toBeVisible();

    // Should be keyboard accessible
    await firstNameField.focus();
    await expect(firstNameField).toBeFocused();

    await page.keyboard.type('Patrice');
    await expect(firstNameField).toHaveValue('Patrice');

    // Tab navigation should work
    await page.keyboard.press('Tab');
    await expect(page.locator('[placeholder="Last Name"]')).toBeFocused();
  });

  test('should handle different university formats', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    const universityFormats = [
      'University of British Columbia',
      'UBC',
      'U of British Columbia',
      'British Columbia University'
    ];

    for (const university of universityFormats) {
      await page.fill('[placeholder="First Name"]', 'Test');
      await page.fill('[placeholder="Last Name"]', 'Professor');
      await page.fill('[placeholder="University"]', university);
      await page.click('button:has-text("Search")');

      // Should handle each format
      await expect(page.locator('.professor-details') || page.locator('text=Loading') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });

      // Clear form for next test
      await page.fill('[placeholder="First Name"]', '');
      await page.fill('[placeholder="Last Name"]', '');
      await page.fill('[placeholder="University"]', '');
    }
  });

  test('should handle concurrent user interactions', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Simulate multiple rapid interactions
    await Promise.all([
      page.fill('[placeholder="First Name"]', 'Patrice'),
      page.fill('[placeholder="Last Name"]', 'Belleville'),
      page.fill('[placeholder="University"]', 'University of British Columbia'),
      page.click('button:has-text("Search")')
    ]);

    // Should handle concurrent interactions
    await expect(page.locator('.professor-details') || page.locator('text=Loading')).toBeVisible({ timeout: 30000 });
  });

  test('should handle offline scenarios', async ({ page }) => {
    await page.goto('/app');

    // Switch to professor search
    await page.click('text=Professor Search');

    // Simulate going offline
    await page.context().setOffline(true);

    await page.fill('[placeholder="First Name"]', 'Offline');
    await page.fill('[placeholder="Last Name"]', 'Test');
    await page.fill('[placeholder="University"]', 'Test University');
    await page.click('button:has-text("Search")');

    // Should show offline error
    await expect(page.locator('text=Error') || page.locator('text=offline') || page.locator('text=network')).toBeVisible({ timeout: 10000 });

    // Go back online
    await page.context().setOffline(false);
  });

  test('should handle browser zoom levels', async ({ page }) => {
    await page.goto('/app');

    // Test different zoom levels
    const zoomLevels = [0.5, 1, 1.5, 2];

    for (const zoom of zoomLevels) {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.evaluate((z) => {
        document.body.style.zoom = z;
      }, zoom);

      // Switch to professor search
      await page.click('text=Professor Search');
      await expect(page.locator('text=Professor Search')).toBeVisible();

      // Should be functional at all zoom levels
      await page.fill('[placeholder="First Name"]', 'Zoom');
      await page.fill('[placeholder="Last Name"]', 'Test');
      await page.fill('[placeholder="University"]', 'Test University');

      const searchButton = page.locator('button:has-text("Search")');
      await expect(searchButton).toBeVisible();

      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1';
      });
    }
  });
});
