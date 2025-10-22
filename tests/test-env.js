// Test environment configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-openai-key-for-testing';
process.env.PORT = '3000';
process.env.MAX_BROWSERS = '1';
process.env.MAX_CONTEXTS_PER_BROWSER = '5';
process.env.BROWSER_TIMEOUT = '15000';
process.env.PAGE_TIMEOUT = '10000';
process.env.IDLE_TIMEOUT = '60000';

// Mock external API responses for testing
global.testConfig = {
  mockApiDelay: 100, // milliseconds
  mockApiTimeout: 5000, // milliseconds
  mockRateMyProfessorsUrl: 'https://www.ratemyprofessors.com',
  mockOpenAIUrl: 'https://api.openai.com'
};

// Test data constants
global.testData = {
  validCourse: {
    courseName: 'CPSC',
    courseNumber: '110',
    universityNumber: '1413'
  },
  validProfessor: {
    firstName: 'Patrice',
    lastName: 'Belleville',
    university: 'University of British Columbia'
  },
  invalidCourse: {
    courseName: 'INVALID',
    courseNumber: '999',
    universityNumber: '9999'
  },
  invalidProfessor: {
    firstName: 'NonExistent',
    lastName: 'Professor',
    university: 'NonExistent University'
  }
};

module.exports = {
  testConfig: global.testConfig,
  testData: global.testData
};
