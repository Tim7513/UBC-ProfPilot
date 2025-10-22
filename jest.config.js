module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'utils/**/*.{js}',
    'index.js',
    '!src/index.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx}',
    '<rootDir>/tests/integration/**/*.test.{js,jsx}',
    '<rootDir>/tests/api/**/*.test.js'
  ],
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: ['@babel/preset-env', '@babel/preset-react']
    }]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 0, // Start with 0, increase gradually
      functions: 0,
      lines: 0,
      statements: 0
    }
  }
};
