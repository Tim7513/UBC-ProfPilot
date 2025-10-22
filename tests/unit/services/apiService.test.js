import { searchByCourse, searchByProfessor, healthCheck, getServerStatus } from '../../../src/services/apiService';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  describe('apiRequest helper', () => {
    test('should make successful API request', async () => {
      const mockResponse = { data: 'test' };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      // Access the private apiRequest function through module
      const apiService = require('../../../src/services/apiService');
      const result = await apiService.apiRequest('http://test.com');

      expect(fetch).toHaveBeenCalledWith('http://test.com', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      expect(result).toEqual(mockResponse);
    });

    test('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Not found' })
      });

      const apiService = require('../../../src/services/apiService');

      await expect(apiService.apiRequest('http://test.com'))
        .rejects.toThrow('Not found');
    });

    test('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const apiService = require('../../../src/services/apiService');

      await expect(apiService.apiRequest('http://test.com'))
        .rejects.toThrow('Network error');
    });
  });

  describe('searchByCourse', () => {
    test('should search for course successfully', async () => {
      const mockCourseResponse = {
        professors: [
          {
            name: 'Dr. Smith',
            first_name: 'John',
            last_name: 'Smith',
            university: 'University of British Columbia'
          }
        ]
      };

      const mockDetailResponse = {
        overall_quality: '4.5',
        difficulty: '3.2',
        would_take_again: '85%'
      };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCourseResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockDetailResponse)
        });

      const result = await searchByCourse({
        courseName: 'CPSC',
        courseNumber: '110'
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/course?course_name=CPSC&department_number=110&university_number=1413',
        expect.any(Object)
      );

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/professor?fname=John&lname=Smith&university=University%20of%20British%20Columbia',
        expect.any(Object)
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('details');
      expect(result[0].details).toEqual(mockDetailResponse);
    });

    test('should return empty array for course with no professors', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ professors: [] })
      });

      const result = await searchByCourse({
        courseName: 'MATH',
        courseNumber: '100'
      });

      expect(result).toEqual([]);
    });

    test('should handle partial professor detail failures', async () => {
      const mockCourseResponse = {
        professors: [
          {
            name: 'Dr. Smith',
            first_name: 'John',
            last_name: 'Smith',
            university: 'University of British Columbia'
          }
        ]
      };

      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCourseResponse)
        })
        .mockRejectedValueOnce(new Error('Professor not found'));

      const result = await searchByCourse({
        courseName: 'CPSC',
        courseNumber: '110'
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('details.error');
      expect(result[0].details.error).toBe('Professor not found');
    });

    test('should validate required fields', async () => {
      await expect(searchByCourse({ courseName: 'CPSC' }))
        .rejects.toThrow('Please fill in all course search fields');

      await expect(searchByCourse({ courseNumber: '110' }))
        .rejects.toThrow('Please fill in all course search fields');

      await expect(searchByCourse({}))
        .rejects.toThrow('Please fill in all course search fields');
    });

    test('should use production URL in production environment', async () => {
      process.env.NODE_ENV = 'production';

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ professors: [] })
      });

      await searchByCourse({
        courseName: 'CPSC',
        courseNumber: '110'
      });

      expect(fetch).toHaveBeenCalledWith(
        '/course?course_name=CPSC&department_number=110&university_number=1413',
        expect.any(Object)
      );
    });
  });

  describe('searchByProfessor', () => {
    test('should search for professor successfully', async () => {
      const mockResponse = {
        overall_quality: '4.2',
        difficulty: '3.8',
        would_take_again: '78%'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await searchByProfessor({
        firstName: 'Patrice',
        lastName: 'Belleville',
        university: 'University of British Columbia'
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/professor?fname=Patrice&lname=Belleville&university=University%20of%20British%20Columbia',
        expect.any(Object)
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockResponse);
    });

    test('should validate required fields', async () => {
      await expect(searchByProfessor({
        firstName: 'Patrice',
        lastName: 'Belleville'
      })).rejects.toThrow('Please fill in all professor search fields');

      await expect(searchByProfessor({
        firstName: 'Patrice'
      })).rejects.toThrow('Please fill in all professor search fields');

      await expect(searchByProfessor({}))
        .rejects.toThrow('Please fill in all professor search fields');
    });

    test('should handle professor not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Professor not found' })
      });

      await expect(searchByProfessor({
        firstName: 'NonExistent',
        lastName: 'Professor',
        university: 'Test University'
      })).rejects.toThrow('Professor not found');
    });
  });

  describe('healthCheck', () => {
    test('should return health status', async () => {
      const mockHealthResponse = {
        status: 'OK',
        timestamp: '2024-01-01T00:00:00.000Z'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHealthResponse)
      });

      const result = await healthCheck();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/health',
        expect.any(Object)
      );

      expect(result).toEqual(mockHealthResponse);
    });
  });

  describe('getServerStatus', () => {
    test('should return detailed server status', async () => {
      const mockStatusResponse = {
        status: 'healthy',
        uptime: 3600,
        env: {
          nodeEnv: 'test',
          hasOpenAI: true
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStatusResponse)
      });

      const result = await getServerStatus();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/status',
        expect.any(Object)
      );

      expect(result).toEqual(mockStatusResponse);
    });
  });
});
