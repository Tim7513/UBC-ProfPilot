# 🧪 Testing Guide

This comprehensive testing guide covers the complete testing strategy implemented for Prof Pilot, designed to align with enterprise QA automation standards.

## 📊 Testing Strategy Overview

Our testing approach follows the **Test Pyramid** methodology:

```
End-to-End Tests (5%)     - Playwright
Integration Tests (15%)   - API & Service Tests
Unit Tests (80%)          - Component & Utility Tests
```

## 🏗️ Testing Architecture

### Test Categories

1. **Unit Tests** - Individual components and utilities
2. **Integration Tests** - API endpoints and service interactions
3. **End-to-End Tests** - Complete user workflows
4. **Performance Tests** - Load and stress testing
5. **Security Tests** - Vulnerability and penetration testing
6. **Accessibility Tests** - WCAG compliance testing

### Testing Tools

- **Jest** - Unit and integration testing framework
- **React Testing Library** - Component testing utilities
- **Playwright** - E2E testing and browser automation
- **Supertest** - API testing
- **Artillery** - Performance and load testing
- **Axe Playwright** - Accessibility testing

## 🚀 Getting Started

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Install Artillery globally
npm install -g artillery
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests with coverage
npm run test:api         # API endpoint tests
npm run test:e2e         # End-to-end tests (headed)
npm run test:e2e:ci      # End-to-end tests (headless)
npm run test:mobile      # Mobile responsive tests
npm run test:performance # Performance tests
npm run test:security    # Security tests

# Development mode
npm run test:watch       # Watch mode for unit tests
```

## 📁 Test Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # React component tests
│   ├── services/          # API service tests
│   └── utils/             # Utility function tests
├── integration/           # Integration tests
├── e2e/                   # End-to-end tests
│   ├── course-search.spec.js
│   ├── professor-search.spec.js
│   └── mobile/
├── api/                   # API tests
├── performance/           # Performance tests
├── security/              # Security tests
│   ├── api/
│   └── ui/
└── fixtures/              # Test data
```

## 🧪 Unit Testing

### Component Testing

Unit tests focus on individual React components using React Testing Library:

```javascript
// Example: App component test
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';

test('renders application correctly', () => {
  render(<App />);
  expect(screen.getByText('Prof Pilot')).toBeInTheDocument();
});
```

### Service Testing

API service functions are tested in isolation:

```javascript
// Example: API service test
import { searchByCourse } from '../../src/services/apiService';

test('searches for course successfully', async () => {
  const result = await searchByCourse({
    courseName: 'CPSC',
    courseNumber: '110'
  });
  expect(result).toHaveLength(2);
});
```

### Utility Testing

Browser and helper utilities are tested independently:

```javascript
// Example: Browser pool test
import { BrowserPool } from '../../utils/browser';

test('manages browser instances correctly', async () => {
  const pool = new BrowserPool();
  const browser = await pool.getBrowser();
  expect(browser).toBeDefined();
});
```

## 🔗 Integration Testing

Integration tests verify API endpoints and service interactions:

```javascript
// Example: API integration test
import request from 'supertest';
import app from '../../index';

test('GET /professor returns professor data', async () => {
  const response = await request(app)
    .get('/professor')
    .query({
      fname: 'Patrice',
      lname: 'Belleville',
      university: 'University of British Columbia'
    });

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('overall_quality');
});
```

## 🌐 End-to-End Testing

E2E tests simulate complete user workflows using Playwright:

```javascript
// Example: Course search E2E test
test('searches for course successfully', async ({ page }) => {
  await page.goto('/app');
  await page.fill('[placeholder="Course Name"]', 'CPSC');
  await page.fill('[placeholder="Course Number"]', '110');
  await page.fill('[placeholder="University ID"]', '1413');
  await page.click('button:has-text("Search")');

  await expect(page.locator('.results-list')).toBeVisible();
});
```

### Cross-Browser Testing

Tests run across multiple browsers and devices:

```javascript
// Playwright configuration supports:
// - Desktop Chrome, Firefox, Safari
// - Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
// - Chromebook (Chrome with CrOS user agent)
```

## 📱 Mobile Testing

Mobile-specific tests ensure responsive design works correctly:

```javascript
// Example: Mobile responsiveness test
test('works on mobile devices', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

  await page.goto('/app');
  await page.fill('[placeholder="Course Name"]', 'CPSC');
  await page.click('button:has-text("Search")');

  await expect(page.locator('.results-list')).toBeVisible();
});
```

## ⚡ Performance Testing

Performance tests use Artillery to simulate real-world load:

```yaml
# tests/performance/prof-pilot.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 120
      arrivalRate: 5    # 5 requests/second for 2 minutes
    - duration: 60
      arrivalRate: 20   # 20 requests/second for stress testing
```

Run performance tests:

```bash
npm run test:performance
```

## 🔒 Security Testing

Security tests cover common vulnerabilities:

### API Security Tests

```javascript
// Input validation and sanitization
test('rejects SQL injection attempts', async () => {
  const payload = "'; DROP TABLE professors; --";
  const response = await request(app)
    .get('/professor')
    .query({ fname: payload, lname: 'Test', university: 'Test' });

  expect([400, 404, 500]).toContain(response.status);
});
```

### UI Security Tests

```javascript
// XSS prevention
test('handles XSS in user input safely', async ({ page }) => {
  await page.goto('/app');
  await page.fill('[placeholder="Course Name"]', '<script>alert("xss")</script>');
  await page.click('button:has-text("Search")');

  // Should not execute script
  page.on('dialog', () => {
    throw new Error('XSS script executed');
  });
});
```

Run security tests:

```bash
npm run test:security
```

## ♿ Accessibility Testing

Accessibility tests ensure WCAG compliance:

```javascript
// Example: Accessibility test
test('meets accessibility standards', async ({ page }) => {
  await page.goto('/app');

  // Check for proper ARIA labels
  await expect(page.locator('[placeholder="Course Name"]'))
    .toHaveAttribute('aria-label');

  // Check for keyboard navigation
  await page.keyboard.press('Tab');
  await expect(page.locator('[placeholder="Course Number"]'))
    .toBeFocused();
});
```

## 📊 Test Data Management

Test fixtures provide consistent data for testing:

```javascript
// tests/fixtures/professors.json
[
  {
    "id": 1,
    "name": "Dr. Patrice Belleville",
    "firstName": "Patrice",
    "lastName": "Belleville",
    "university": "University of British Columbia",
    "overall_quality": "4.2",
    "difficulty": "3.8",
    "numRatings": 45
  }
]
```

## 🚀 CI/CD Pipeline

GitHub Actions automates testing and deployment:

### Pipeline Stages

1. **Lint & Code Quality** - ESLint, Prettier, security scanning
2. **Unit Tests** - Jest with coverage reporting
3. **API Tests** - Integration testing with test database
4. **E2E Tests** - Cross-browser testing
5. **Performance Tests** - Load and stress testing
6. **Security Tests** - Vulnerability scanning
7. **Build & Deploy** - Production deployment

### Environment Variables

Required for CI/CD:

```yaml
# .github/workflows/ci.yml
env:
  NODE_ENV: test
  API_BASE_URL: http://localhost:3000
  DATABASE_URL: postgresql://localhost:5432/test_db
```

## 📈 Test Metrics & Reporting

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage thresholds (jest.config.js)
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

### Performance Metrics

- Response time targets: < 2s for API calls, < 5s for searches
- Error rate threshold: < 5%
- Availability target: 99.9%

### Security Metrics

- Zero high/critical vulnerabilities
- All dependencies scanned weekly
- Security headers properly configured

## 🛠️ Development Workflow

### Test-Driven Development (TDD)

1. Write failing test first
2. Implement minimum code to pass
3. Refactor and improve
4. Run full test suite

### Continuous Testing

```bash
# Watch mode for development
npm run test:watch

# Pre-commit hooks
# Add husky for automated testing before commits
npx husky add .husky/pre-commit "npm run test:unit"
```

## 🔧 Configuration Files

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: ['src/**/*.{js,jsx}'],
  testMatch: ['<rootDir>/tests/**/*.test.{js,jsx}']
};
```

### Playwright Configuration

```javascript
// playwright.config.js
export default {
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'Mobile Chrome' },
    { name: 'Mobile Safari' }
  ]
};
```

## 🐛 Debugging Tests

### Visual Debugging

```bash
# Run E2E tests in headed mode
npm run test:e2e:headed

# Generate test reports
npm run test:e2e  # Creates HTML reports in playwright-report/
```

### API Debugging

```bash
# Test API endpoints directly
curl http://localhost:3000/health
curl "http://localhost:3000/professor?fname=Patrice&lname=Belleville&university=University%20of%20British%20Columbia"
```

### Performance Debugging

```bash
# Profile application performance
npm run test:performance -- --output performance-report.json
```

## 📚 Best Practices

### Writing Good Tests

1. **Descriptive Names**: `should search for course successfully`
2. **Arrange-Act-Assert**: Clear test structure
3. **Single Responsibility**: One concept per test
4. **Independent Tests**: No test dependencies
5. **Fast Execution**: Keep tests under 100ms when possible

### Test Data

1. **Realistic Data**: Use production-like test data
2. **Edge Cases**: Test boundaries and error conditions
3. **Consistent Data**: Use fixtures for repeatable tests
4. **Clean State**: Reset data between tests

### Error Handling

1. **Graceful Failures**: Test error recovery
2. **Meaningful Messages**: Clear error descriptions
3. **Logging**: Comprehensive test logging
4. **Screenshots**: Visual evidence for E2E failures

## 🤝 Contributing

### Adding New Tests

1. Follow existing patterns and conventions
2. Add tests for new features before implementation
3. Update test documentation
4. Ensure CI pipeline passes

### Code Review Checklist

- [ ] Unit tests cover new functionality
- [ ] Integration tests verify API contracts
- [ ] E2E tests cover user workflows
- [ ] Performance tests validate scalability
- [ ] Security tests prevent vulnerabilities
- [ ] Accessibility tests ensure compliance

## 📋 Test Execution Order

1. **Linting** - Code quality gates
2. **Unit Tests** - Fast feedback loop
3. **Integration Tests** - Service interactions
4. **API Tests** - Endpoint validation
5. **E2E Tests** - Complete workflows
6. **Performance Tests** - Load validation
7. **Security Tests** - Vulnerability scanning

## 🎯 Quality Gates

All code must pass:

- ✅ **Linting** (ESLint rules)
- ✅ **Unit Tests** (70% coverage minimum)
- ✅ **Integration Tests** (All API contracts)
- ✅ **E2E Tests** (Critical paths)
- ✅ **Performance Tests** (Response time targets)
- ✅ **Security Tests** (No vulnerabilities)
- ✅ **Accessibility Tests** (WCAG AA compliance)

## 📞 Support

For testing-related issues:

1. Check the test documentation above
2. Review CI/CD logs in GitHub Actions
3. Run tests locally to reproduce issues
4. Create detailed bug reports with:
   - Test case that fails
   - Expected vs actual behavior
   - Environment details
   - Steps to reproduce

---

**This testing framework demonstrates enterprise-level QA automation skills including cross-platform testing, security validation, performance monitoring, and CI/CD integration - perfect for showcasing in job applications!** 🚀
