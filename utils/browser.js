// Shared Playwright WebKit browser launcher to minimize process churn
const { webkit } = require('playwright');

let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = webkit.launch({ headless: true });
  }
  return browserPromise;
}

async function closeBrowser() {
  if (browserPromise) {
    try {
      const browser = await browserPromise;
      await browser.close();
    } catch (_) {
      // ignore
    } finally {
      browserPromise = null;
    }
  }
}

// Attempt graceful shutdown on process exit
process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await closeBrowser();
  process.exit(0);
});

module.exports = { getBrowser, closeBrowser };


