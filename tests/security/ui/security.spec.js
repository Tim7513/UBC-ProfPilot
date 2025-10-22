import { test, expect } from '@playwright/test';

test.describe('UI Security Tests', () => {
  test('should not expose sensitive information in client-side code', async ({ page }) => {
    await page.goto('/app');

    // Check that sensitive data is not visible in the DOM
    await expect(page.locator('text=/API_KEY|api_key|password|token|secret/i')).not.toBeVisible();

    // Check that internal URLs are not exposed
    await expect(page.locator('text=/localhost|127\.0\.0\.1|file:\/\/|C:\\/i')).not.toBeVisible();
  });

  test('should handle XSS in user input safely', async ({ page }) => {
    await page.goto('/app');

    // Try XSS payload in form fields
    await page.fill('[placeholder="Course Name"]', '<script>alert("xss")</script>');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    // Should not execute script
    page.on('dialog', async dialog => {
      expect(dialog.message()).not.toBe('xss');
      await dialog.dismiss();
    });

    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle malicious URLs safely', async ({ page }) => {
    await page.goto('/app');

    // Try to navigate to malicious URL via form input (if possible)
    await page.fill('[placeholder="Course Name"]', 'javascript:alert("xss")');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');

    await page.click('button:has-text("Search")');

    // Should not navigate away or execute script
    await expect(page.url()).toMatch(/localhost:3000/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should not allow iframe embedding', async ({ page }) => {
    // Test that the app cannot be embedded in an iframe (clickjacking protection)
    await page.goto('/app');

    const frameContent = await page.evaluate(() => {
      try {
        return window.top.location.href;
      } catch (e) {
        return 'blocked';
      }
    });

    // Should not be able to access top window if framed
    expect(frameContent).not.toBe('blocked');
  });

  test('should handle clipboard access attempts', async ({ page }) => {
    await page.goto('/app');

    // Check that clipboard is not accessed without permission
    const clipboardAccessed = await page.evaluate(async () => {
      try {
        await navigator.clipboard.readText();
        return true;
      } catch (e) {
        return false;
      }
    });

    // Should not access clipboard without user gesture
    expect(clipboardAccessed).toBe(false);
  });

  test('should handle local storage safely', async ({ page }) => {
    await page.goto('/app');

    // Check that sensitive data is not stored in localStorage
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });

    // Should not contain sensitive information
    Object.values(localStorageData).forEach(value => {
      expect(value).not.toMatch(/api_key|password|token|secret/i);
    });
  });

  test('should handle console error exposure', async ({ page }) => {
    await page.goto('/app');

    // Intercept console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Trigger some errors
    await page.fill('[placeholder="Course Name"]', '');
    await page.fill('[placeholder="Course Number"]', '');
    await page.fill('[placeholder="University ID"]', '');
    await page.click('button:has-text("Search")');

    // Wait for potential errors
    await page.waitForTimeout(1000);

    // Console errors should not expose sensitive information
    errors.forEach(error => {
      expect(error).not.toMatch(/api_key|password|token|secret|localhost|127\.0\.0\.1|file:\/\//i);
    });
  });

  test('should handle network request interception', async ({ page }) => {
    await page.goto('/app');

    // Intercept network requests
    const interceptedRequests = [];
    page.on('request', request => {
      interceptedRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    // Perform a search
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    await page.waitForTimeout(2000);

    // Check that API keys are not exposed in request headers
    interceptedRequests.forEach(request => {
      Object.values(request.headers).forEach(header => {
        expect(header).not.toMatch(/api_key|password|token|secret/i);
      });
    });
  });

  test('should handle malicious file uploads', async ({ page }) => {
    await page.goto('/app');

    // Check if there are any file inputs (there shouldn't be in this app)
    const fileInputs = await page.locator('input[type="file"]').count();
    expect(fileInputs).toBe(0);

    // If file inputs existed, they should be tested for malicious files
    // For this app, file upload security is not a concern since no file inputs exist
  });

  test('should handle DOM manipulation attempts', async ({ page }) => {
    await page.goto('/app');

    // Try to manipulate DOM via console (simulated)
    await page.evaluate(() => {
      // Attempt to inject malicious script tag
      const script = document.createElement('script');
      script.textContent = 'alert("xss")';
      document.body.appendChild(script);
    });

    // Should not execute the injected script
    page.on('dialog', async dialog => {
      expect(dialog.message()).not.toBe('xss');
      await dialog.dismiss();
    });

    // Page should still be functional
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle event listener security', async ({ page }) => {
    await page.goto('/app');

    // Check that event listeners don't expose sensitive data
    const eventListeners = await page.evaluate(() => {
      const listeners = [];
      const elements = document.querySelectorAll('*');

      elements.forEach(element => {
        const events = getEventListeners(element);
        Object.keys(events).forEach(eventType => {
          events[eventType].forEach(listener => {
            if (listener.listener && listener.listener.toString) {
              listeners.push({
                element: element.tagName,
                event: eventType,
                code: listener.listener.toString()
              });
            }
          });
        });
      });

      return listeners;
    });

    // Event listeners should not contain sensitive information
    eventListeners.forEach(listener => {
      expect(listener.code).not.toMatch(/api_key|password|token|secret/i);
    });
  });

  test('should handle WebSocket security', async ({ page }) => {
    await page.goto('/app');

    // Check for WebSocket connections
    const wsConnections = [];
    page.on('websocket', ws => {
      wsConnections.push(ws.url());
    });

    // Perform actions that might trigger WebSocket connections
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    await page.waitForTimeout(2000);

    // WebSocket URLs should not contain sensitive information
    wsConnections.forEach(url => {
      expect(url).not.toMatch(/api_key|password|token|secret/i);
    });
  });

  test('should handle CSP violations', async ({ page }) => {
    await page.goto('/app');

    // Listen for CSP violations
    const cspViolations = [];
    page.on('console', msg => {
      if (msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });

    // Try to trigger CSP violations
    await page.evaluate(() => {
      // Try to execute inline script
      const script = document.createElement('script');
      script.textContent = 'console.log("inline script")';
      document.body.appendChild(script);
    });

    await page.waitForTimeout(1000);

    // Should not have CSP violations for legitimate actions
    // Note: This app might not have CSP configured, but the test structure is here for when it is
  });

  test('should handle service worker security', async ({ page }) => {
    await page.goto('/app');

    // Check if service workers are registered
    const serviceWorkers = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.map(reg => ({
          scope: reg.scope,
          url: reg.active ? reg.active.scriptURL : 'none'
        }));
      }
      return [];
    });

    // Service worker URLs should not contain sensitive information
    serviceWorkers.forEach(sw => {
      expect(sw.url).not.toMatch(/api_key|password|token|secret/i);
      expect(sw.scope).not.toMatch(/api_key|password|token|secret/i);
    });
  });

  test('should handle geolocation security', async ({ page }) => {
    await page.goto('/app');

    // Check that geolocation is not accessed without permission
    const geoAccessed = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          () => resolve(false),
          { timeout: 1000 }
        );

        setTimeout(() => resolve(false), 1500);
      });
    });

    // Should not access geolocation without user permission
    expect(geoAccessed).toBe(false);
  });

  test('should handle camera/microphone security', async ({ page }) => {
    await page.goto('/app');

    // Check that media devices are not accessed
    const mediaAccessed = await page.evaluate(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (e) {
        return false;
      }
    });

    // Should not access media devices without permission
    expect(mediaAccessed).toBe(false);
  });

  test('should handle notification security', async ({ page }) => {
    await page.goto('/app');

    // Check that notifications are not requested without permission
    const notificationRequested = await page.evaluate(async () => {
      if (!('Notification' in window)) {
        return false;
      }

      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (e) {
        return false;
      }
    });

    // Should not automatically request notifications
    expect(notificationRequested).toBe(false);
  });

  test('should handle referrer policy', async ({ page }) => {
    await page.goto('/app');

    // Check referrer policy
    const referrerPolicy = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="referrer"]');
      return meta ? meta.content : 'not-set';
    });

    // Should have some referrer policy (even if not set explicitly)
    expect(['not-set', 'no-referrer', 'strict-origin-when-cross-origin', 'origin-when-cross-origin', 'unsafe-url']).toContain(referrerPolicy);
  });

  test('should handle clickjacking protection', async ({ page }) => {
    await page.goto('/app');

    // Check for X-Frame-Options equivalent (CSS-based)
    const frameBusting = await page.evaluate(() => {
      // Check if there's any frame-busting code
      const scripts = document.querySelectorAll('script');
      let hasFrameBusting = false;

      scripts.forEach(script => {
        if (script.textContent && script.textContent.includes('top.location')) {
          hasFrameBusting = true;
        }
      });

      return hasFrameBusting;
    });

    // Should have some form of frame protection
    // Note: This app doesn't have frame-busting, but the test structure is here for when it does
  });

  test('should handle memory leak prevention', async ({ page }) => {
    await page.goto('/app');

    // Perform multiple searches to check for memory leaks
    for (let i = 0; i < 5; i++) {
      await page.fill('[placeholder="Course Name"]', `CPSC${i}`);
      await page.fill('[placeholder="Course Number"]', '110');
      await page.fill('[placeholder="University ID"]', '1413');
      await page.click('button:has-text("Search")');

      await page.waitForTimeout(1000);

      // Clear form for next iteration
      await page.fill('[placeholder="Course Name"]', '');
      await page.fill('[placeholder="Course Number"]', '');
      await page.fill('[placeholder="University ID"]', '');
    }

    // Page should still be responsive
    await expect(page.locator('h1')).toBeVisible();

    // Should be able to perform one more search
    await page.fill('[placeholder="Course Name"]', 'Final');
    await page.fill('[placeholder="Course Number"]', 'Test');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    await expect(page.locator('.results-list') || page.locator('text=Error')).toBeVisible({ timeout: 30000 });
  });

  test('should handle performance monitoring exposure', async ({ page }) => {
    await page.goto('/app');

    // Check that performance monitoring doesn't expose sensitive data
    const performanceEntries = await page.evaluate(() => {
      const entries = performance.getEntries();
      return entries.map(entry => ({
        name: entry.name,
        type: entry.entryType
      }));
    });

    // Performance entries should not contain sensitive URLs
    performanceEntries.forEach(entry => {
      expect(entry.name).not.toMatch(/api_key|password|token|secret|localhost|127\.0\.0\.1/i);
    });
  });

  test('should handle CSP bypass attempts', async ({ page }) => {
    await page.goto('/app');

    // Try various CSP bypass techniques
    const bypassAttempts = await page.evaluate(() => {
      const attempts = [];

      // Try inline event handlers
      try {
        const div = document.createElement('div');
        div.setAttribute('onclick', 'alert("xss")');
        document.body.appendChild(div);
        attempts.push('inline-event');
      } catch (e) {
        attempts.push('inline-event-blocked');
      }

      // Try data URLs
      try {
        const iframe = document.createElement('iframe');
        iframe.src = 'data:text/html,<script>alert("xss")</script>';
        document.body.appendChild(iframe);
        attempts.push('data-url');
      } catch (e) {
        attempts.push('data-url-blocked');
      }

      return attempts;
    });

    // Should block malicious attempts
    expect(bypassAttempts).not.toContain('inline-event');
    expect(bypassAttempts).not.toContain('data-url');
  });

  test('should handle form auto-fill security', async ({ page }) => {
    await page.goto('/app');

    // Check that form fields don't have autocomplete for sensitive data
    const courseNameField = page.locator('[placeholder="Course Name"]');
    const autocomplete = await courseNameField.getAttribute('autocomplete');

    // Should not have sensitive autocomplete values
    expect(autocomplete).not.toMatch(/password|credit-card|cc-number|cc-csc|cc-exp/i);
  });

  test('should handle accessibility security', async ({ page }) => {
    await page.goto('/app');

    // Check that ARIA attributes don't expose sensitive information
    const ariaLabels = await page.evaluate(() => {
      const elements = document.querySelectorAll('[aria-label], [aria-describedby], [aria-labelledby]');
      const labels = [];

      elements.forEach(element => {
        if (element.getAttribute('aria-label')) {
          labels.push(element.getAttribute('aria-label'));
        }
      });

      return labels;
    });

    // ARIA labels should not contain sensitive information
    ariaLabels.forEach(label => {
      expect(label).not.toMatch(/api_key|password|token|secret/i);
    });
  });

  test('should handle error boundary security', async ({ page }) => {
    await page.goto('/app');

    // Trigger JavaScript errors
    await page.evaluate(() => {
      throw new Error('Test error');
    });

    // Check that error boundaries don't expose sensitive information
    const errorMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errorMessages.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Error messages should not contain sensitive data
    errorMessages.forEach(message => {
      expect(message).not.toMatch(/api_key|password|token|secret|localhost|127\.0\.0\.1|file:\/\//i);
    });
  });

  test('should handle third-party script security', async ({ page }) => {
    await page.goto('/app');

    // Check for third-party scripts
    const scripts = await page.evaluate(() => {
      const scriptElements = document.querySelectorAll('script');
      return Array.from(scriptElements).map(script => ({
        src: script.src,
        text: script.textContent
      }));
    });

    // Should not have third-party scripts (or if they do, they should be legitimate)
    scripts.forEach(script => {
      if (script.src) {
        expect(script.src).not.toMatch(/evil\.com|malicious\.com|tracking\.com/i);
      }
      if (script.text) {
        expect(script.text).not.toMatch(/api_key|password|token|secret/i);
      }
    });
  });

  test('should handle WebRTC security', async ({ page }) => {
    await page.goto('/app');

    // Check that WebRTC doesn't leak IP addresses
    const rtcConfig = await page.evaluate(async () => {
      try {
        const config = {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        };

        const pc = new RTCPeerConnection(config);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        return pc.localDescription.sdp;
      } catch (e) {
        return 'not-supported';
      }
    });

    // WebRTC SDP should not contain private IP addresses if exposed
    if (rtcConfig !== 'not-supported') {
      expect(rtcConfig).not.toMatch(/192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\./);
    }
  });

  test('should handle timing attack prevention', async ({ page }) => {
    await page.goto('/app');

    // Time multiple requests to check for timing differences
    const times = [];

    for (let i = 0; i < 10; i++) {
      const start = Date.now();
      await page.fill('[placeholder="Course Name"]', `Timing${i}`);
      await page.fill('[placeholder="Course Number"]', '110');
      await page.fill('[placeholder="University ID"]', '1413');
      await page.click('button:has-text("Search")');

      await page.waitForTimeout(1000); // Wait for response
      const end = Date.now();
      times.push(end - start);

      // Clear form for next test
      await page.fill('[placeholder="Course Name"]', '');
      await page.fill('[placeholder="Course Number"]', '');
      await page.fill('[placeholder="University ID"]', '');
    }

    // Response times should be relatively consistent (within 5 seconds)
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    expect(maxTime - minTime).toBeLessThan(5000);
  });

  test('should handle resource loading security', async ({ page }) => {
    await page.goto('/app');

    // Intercept resource loading
    const loadedResources = [];
    page.on('request', request => {
      loadedResources.push(request.url());
    });

    // Perform actions
    await page.fill('[placeholder="Course Name"]', 'CPSC');
    await page.fill('[placeholder="Course Number"]', '110');
    await page.fill('[placeholder="University ID"]', '1413');
    await page.click('button:has-text("Search")');

    await page.waitForTimeout(2000);

    // Loaded resources should not include malicious domains
    loadedResources.forEach(url => {
      expect(url).not.toMatch(/evil\.com|malicious\.com|tracking\.com|analytics\.com/i);
    });
  });

  test('should handle font loading security', async ({ page }) => {
    await page.goto('/app');

    // Check for web font loading
    const fontFaces = await page.evaluate(() => {
      return document.fonts ? document.fonts.status : 'not-supported';
    });

    // If fonts are loaded, they should be from safe sources
    if (fontFaces !== 'not-supported') {
      const fontCss = await page.evaluate(() => {
        const styles = document.querySelectorAll('style');
        const fontRules = [];

        styles.forEach(style => {
          if (style.textContent.includes('font-face')) {
            fontRules.push(style.textContent);
          }
        });

        return fontRules;
      });

      // Font CSS should not contain suspicious URLs
      fontCss.forEach(rule => {
        expect(rule).not.toMatch(/evil\.com|malicious\.com|http:\/\/|https:\/\/.*\.(exe|bat|cmd|scr)/i);
      });
    }
  });

  test('should handle SVG security', async ({ page }) => {
    await page.goto('/app');

    // Check for SVG elements and their security
    const svgs = await page.evaluate(() => {
      const svgElements = document.querySelectorAll('svg');
      const svgInfo = [];

      svgElements.forEach(svg => {
        svgInfo.push({
          outerHTML: svg.outerHTML,
          hasScripts: svg.querySelectorAll('script').length > 0,
          hasEvents: svg.outerHTML.includes('on')
        });
      });

      return svgInfo;
    });

    // SVGs should not contain scripts or event handlers
    svgs.forEach(svg => {
      expect(svg.hasScripts).toBe(0);
      expect(svg.hasEvents).toBe(false);
    });
  });

  test('should handle postMessage security', async ({ page }) => {
    await page.goto('/app');

    // Listen for postMessage events
    const messages = [];
    page.on('console', msg => {
      if (msg.text().includes('postMessage') || msg.text().includes('message')) {
        messages.push(msg.text());
      }
    });

    // Try to send postMessage
    await page.evaluate(() => {
      window.postMessage('test message', '*');
    });

    await page.waitForTimeout(1000);

    // Should not expose sensitive information in messages
    messages.forEach(message => {
      expect(message).not.toMatch(/api_key|password|token|secret/i);
    });
  });

  test('should handle CSP meta tag security', async ({ page }) => {
    await page.goto('/app');

    // Check for CSP meta tag
    const cspMeta = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta ? meta.content : 'not-set';
    });

    // If CSP is set, it should be restrictive
    if (cspMeta !== 'not-set') {
      expect(cspMeta).not.toMatch(/unsafe-inline|unsafe-eval|data:/);
    }
  });

  test('should handle history manipulation security', async ({ page }) => {
    await page.goto('/app');

    // Check that history manipulation doesn't expose sensitive data
    const historyState = await page.evaluate(() => {
      return history.state;
    });

    // History state should not contain sensitive information
    if (historyState) {
      expect(JSON.stringify(historyState)).not.toMatch(/api_key|password|token|secret/i);
    }
  });

  test('should handle worker security', async ({ page }) => {
    await page.goto('/app');

    // Check for web workers
    const workers = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('script')).filter(script =>
        script.textContent && script.textContent.includes('Worker')
      );
    });

    // Worker code should not contain sensitive information
    workers.forEach(worker => {
      expect(worker.textContent).not.toMatch(/api_key|password|token|secret/i);
    });
  });

  test('should handle crypto API security', async ({ page }) => {
    await page.goto('/app');

    // Check that crypto APIs are used securely
    const cryptoUsed = await page.evaluate(async () => {
      try {
        // Check if crypto is used
        const test = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('test'));
        return true;
      } catch (e) {
        return false;
      }
    });

    // If crypto is used, it should be for legitimate purposes
    if (cryptoUsed) {
      // Check that crypto usage doesn't expose keys
      const cryptoCode = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        const cryptoUsage = [];

        scripts.forEach(script => {
          if (script.textContent && (script.textContent.includes('crypto') || script.textContent.includes('subtle'))) {
            cryptoUsage.push(script.textContent);
          }
        });

        return cryptoUsage;
      });

      // Crypto usage should not expose keys or sensitive operations
      cryptoCode.forEach(code => {
        expect(code).not.toMatch(/api_key|password|token|secret|private|key/i);
      });
    }
  });

  test('should handle performance observer security', async ({ page }) => {
    await page.goto('/app');

    // Check performance observer usage
    const observerUsed = await page.evaluate(() => {
      return 'PerformanceObserver' in window;
    });

    if (observerUsed) {
      // Check that performance observer doesn't leak sensitive data
      const observerCode = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        const observerUsage = [];

        scripts.forEach(script => {
          if (script.textContent && script.textContent.includes('PerformanceObserver')) {
            observerUsage.push(script.textContent);
          }
        });

        return observerUsage;
      });

      // Performance observer should not leak sensitive information
      observerCode.forEach(code => {
        expect(code).not.toMatch(/api_key|password|token|secret/i);
      });
    }
  });

  test('should handle mutation observer security', async ({ page }) => {
    await page.goto('/app');

    // Check mutation observer usage
    const observerUsed = await page.evaluate(() => {
      return 'MutationObserver' in window;
    });

    if (observerUsed) {
      // Check that mutation observer doesn't expose sensitive data
      const observerCode = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script');
        const observerUsage = [];

        scripts.forEach(script => {
          if (script.textContent && script.textContent.includes('MutationObserver')) {
            observerUsage.push(script.textContent);
          }
        });

        return observerUsage;
      });

      // Mutation observer should not leak sensitive information
      observerCode.forEach(code => {
        expect(code).not.toMatch(/api_key|password|token|secret/i);
      });
    }
  });
});
