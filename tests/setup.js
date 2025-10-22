import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Keep error logs for debugging
};

// Global test utilities
global.testUtils = {
  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock API responses
  mockApiResponse: (data, delay = 0) => ({
    data,
    delay,
    json: () => Promise.resolve(data),
    status: 200,
    ok: true
  }),

  // Create mock professor data
  mockProfessor: (overrides = {}) => ({
    name: 'Dr. Test Professor',
    first_name: 'Test',
    last_name: 'Professor',
    university: 'University of British Columbia',
    overall_quality: '4.5',
    difficulty: '3.2',
    would_take_again: '85%',
    ratings: [
      { comment: 'Great professor!', rating: 5 },
      { comment: 'Very helpful', rating: 4 }
    ],
    ...overrides
  }),

  // Create mock course data
  mockCourse: (overrides = {}) => ({
    course_name: 'CPSC',
    department_number: '110',
    university_number: '1413',
    professors_count: 2,
    professors: [
      {
        name: 'Dr. Smith',
        firstName: 'John',
        lastName: 'Smith',
        department: 'Computer Science',
        profileURL: 'https://example.com/prof1',
        numRatings: 25
      }
    ],
    ...overrides
  })
};
