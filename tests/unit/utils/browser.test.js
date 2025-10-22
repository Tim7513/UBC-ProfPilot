// Test the browser configuration parsing directly
describe('Browser Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Save original environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  test('should have default configuration values', () => {
    // Clear any environment overrides
    delete process.env.MAX_BROWSERS;
    delete process.env.MAX_CONTEXTS_PER_BROWSER;
    delete process.env.BROWSER_TIMEOUT;
    delete process.env.PAGE_TIMEOUT;
    delete process.env.IDLE_TIMEOUT;
    delete process.env.MEMORY_PRESSURE_THRESHOLD;

    // Re-require to get fresh config
    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MAX_BROWSERS).toBe(2);
    expect(CONFIG.MAX_CONTEXTS_PER_BROWSER).toBe(10);
    expect(CONFIG.BROWSER_TIMEOUT).toBe(30000);
    expect(CONFIG.PAGE_TIMEOUT).toBe(15000);
    expect(CONFIG.IDLE_TIMEOUT).toBe(300000);
    expect(CONFIG.MEMORY_PRESSURE_THRESHOLD).toBe(0.8);
  });

  test('should parse integer environment variables', () => {
    process.env.MAX_BROWSERS = '5';
    process.env.MAX_CONTEXTS_PER_BROWSER = '20';
    process.env.BROWSER_TIMEOUT = '60000';

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MAX_BROWSERS).toBe(5);
    expect(CONFIG.MAX_CONTEXTS_PER_BROWSER).toBe(20);
    expect(CONFIG.BROWSER_TIMEOUT).toBe(60000);
  });

  test('should parse float environment variables', () => {
    process.env.MEMORY_PRESSURE_THRESHOLD = '0.9';

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MEMORY_PRESSURE_THRESHOLD).toBe(0.9);
  });

  test('should handle invalid number values', () => {
    process.env.MAX_BROWSERS = 'invalid';
    process.env.BROWSER_TIMEOUT = 'not-a-number';

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MAX_BROWSERS).toBeNaN();
    expect(CONFIG.BROWSER_TIMEOUT).toBeNaN();
  });

  test('should handle zero values', () => {
    process.env.MAX_BROWSERS = '0';
    process.env.BROWSER_TIMEOUT = '0';

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MAX_BROWSERS).toBe(0);
    expect(CONFIG.BROWSER_TIMEOUT).toBe(0);
  });

  test('should handle negative values', () => {
    process.env.MAX_BROWSERS = '-1';
    process.env.BROWSER_TIMEOUT = '-5000';

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MAX_BROWSERS).toBe(-1);
    expect(CONFIG.BROWSER_TIMEOUT).toBe(-5000);
  });

  test('should handle very large values', () => {
    process.env.MAX_BROWSERS = '999999';
    process.env.IDLE_TIMEOUT = '999999999';

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MAX_BROWSERS).toBe(999999);
    expect(CONFIG.IDLE_TIMEOUT).toBe(999999999);
  });

  test('should handle decimal precision', () => {
    process.env.MEMORY_PRESSURE_THRESHOLD = '0.123456789';

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MEMORY_PRESSURE_THRESHOLD).toBe(0.123456789);
  });

  test('should maintain all configuration properties', () => {
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG).toHaveProperty('MAX_BROWSERS');
    expect(CONFIG).toHaveProperty('MAX_CONTEXTS_PER_BROWSER');
    expect(CONFIG).toHaveProperty('BROWSER_TIMEOUT');
    expect(CONFIG).toHaveProperty('PAGE_TIMEOUT');
    expect(CONFIG).toHaveProperty('IDLE_TIMEOUT');
    expect(CONFIG).toHaveProperty('MEMORY_PRESSURE_THRESHOLD');

    // All values should be numbers
    expect(typeof CONFIG.MAX_BROWSERS).toBe('number');
    expect(typeof CONFIG.MAX_CONTEXTS_PER_BROWSER).toBe('number');
    expect(typeof CONFIG.BROWSER_TIMEOUT).toBe('number');
    expect(typeof CONFIG.PAGE_TIMEOUT).toBe('number');
    expect(typeof CONFIG.IDLE_TIMEOUT).toBe('number');
    expect(typeof CONFIG.MEMORY_PRESSURE_THRESHOLD).toBe('number');
  });

  test('should handle multiple environment variables together', () => {
    process.env.MAX_BROWSERS = '3';
    process.env.MAX_CONTEXTS_PER_BROWSER = '15';
    process.env.BROWSER_TIMEOUT = '45000';
    process.env.PAGE_TIMEOUT = '20000';
    process.env.IDLE_TIMEOUT = '600000';
    process.env.MEMORY_PRESSURE_THRESHOLD = '0.7';

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG } = require('../../../utils/browser');

    expect(CONFIG.MAX_BROWSERS).toBe(3);
    expect(CONFIG.MAX_CONTEXTS_PER_BROWSER).toBe(15);
    expect(CONFIG.BROWSER_TIMEOUT).toBe(45000);
    expect(CONFIG.PAGE_TIMEOUT).toBe(20000);
    expect(CONFIG.IDLE_TIMEOUT).toBe(600000);
    expect(CONFIG.MEMORY_PRESSURE_THRESHOLD).toBe(0.7);
  });

  test('should handle configuration persistence', () => {
    // Test that configuration is consistent across multiple requires
    const { CONFIG: config1 } = require('../../../utils/browser');

    delete require.cache[require.resolve('../../../utils/browser')];
    const { CONFIG: config2 } = require('../../../utils/browser');

    // Should be identical if no environment changes
    expect(config1.MAX_BROWSERS).toBe(config2.MAX_BROWSERS);
    expect(config1.MAX_CONTEXTS_PER_BROWSER).toBe(config2.MAX_CONTEXTS_PER_BROWSER);
    expect(config1.BROWSER_TIMEOUT).toBe(config2.BROWSER_TIMEOUT);
  });
});
