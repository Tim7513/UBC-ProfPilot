const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, 'opt', 'render', 'project', 'src', '.cache', 'puppeteer'),
};