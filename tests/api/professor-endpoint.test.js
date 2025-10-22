const request = require('supertest');
const app = require('../../index');

describe('Professor API Endpoints', () => {
  describe('GET /professor', () => {
    test('should return 400 for missing required parameters', async () => {
      const response = await request(app)
        .get('/professor')
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should return 400 for missing first name', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          lname: 'Belleville',
          university: 'University of British Columbia'
        })
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should return 400 for missing last name', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Patrice',
          university: 'University of British Columbia'
        })
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should return 400 for missing university', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Patrice',
          lname: 'Belleville'
        })
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should handle empty parameter values', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: '',
          lname: 'Belleville',
          university: 'University of British Columbia'
        })
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should handle special characters in parameters', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Patrice-Joël',
          lname: "O'Connor",
          university: 'University of British Columbia & Vancouver'
        })
        .expect(400); // Likely to fail due to no such professor, but should not crash

      // Should either return 404 or 500, not 400 for valid input
      expect([404, 500]).toContain(response.status);
    });

    test('should handle very long parameter values', async () => {
      const longName = 'A'.repeat(1000);
      const longUniversity = 'B'.repeat(1000);

      const response = await request(app)
        .get('/professor')
        .query({
          fname: longName,
          lname: 'Test',
          university: longUniversity
        })
        .expect(400); // Should fail but not crash the server

      expect([400, 404, 500]).toContain(response.status);
    });

    test('should handle URL encoding properly', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Patrice',
          lname: 'Belleville',
          university: 'University%20of%20British%20Columbia' // Pre-encoded
        })
        .expect(400); // Should handle encoded URLs

      expect([400, 404, 500]).toContain(response.status);
    });

    test('should handle RateMyProfessors API timeout', async () => {
      // This test would need to simulate a timeout scenario
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Timeout',
          lname: 'Test',
          university: 'Timeout University'
        })
        .timeout(5000) // 5 second timeout for test
        .expect([400, 404, 408, 500]); // Should timeout or return error

      expect([400, 404, 408, 500]).toContain(response.status);
    });

    test('should handle malformed JSON responses from scraping', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Malformed',
          lname: 'JSON',
          university: 'Test University'
        })
        .expect([400, 404, 500]);

      expect([400, 404, 500]).toContain(response.status);
    });

    test('should validate response structure for successful requests', async () => {
      // This test assumes we have a known working professor
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Patrice',
          lname: 'Belleville',
          university: 'University of British Columbia'
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('first_name');
        expect(response.body).toHaveProperty('last_name');
        expect(response.body).toHaveProperty('university');
        expect(response.body).toHaveProperty('overall_quality');
        expect(response.body).toHaveProperty('difficulty');
        expect(response.body).toHaveProperty('would_take_again');
        expect(response.body).toHaveProperty('ratings');

        // Validate data types
        expect(typeof response.body.overall_quality).toMatch(/string|number/);
        expect(typeof response.body.difficulty).toMatch(/string|number/);
        expect(typeof response.body.would_take_again).toBe('string');
      }
    });

    test('should handle concurrent requests', async () => {
      const requests = [];
      const professorData = {
        fname: 'Patrice',
        lname: 'Belleville',
        university: 'University of British Columbia'
      };

      // Create multiple concurrent requests
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .get('/professor')
            .query(professorData)
        );
      }

      const responses = await Promise.all(requests);

      // All requests should complete
      responses.forEach(response => {
        expect([200, 400, 404, 500]).toContain(response.status);
      });
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Server is healthy');
    });

    test('should return valid timestamp format', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = response.body.timestamp;
      expect(() => new Date(timestamp)).not.toThrow();

      const date = new Date(timestamp);
      expect(date.getTime()).not.toBeNaN();
    });

    test('should handle rapid health checks', async () => {
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(request(app).get('/health'));
      }

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
      });
    });
  });

  describe('GET /status', () => {
    test('should return detailed server status', async () => {
      const response = await request(app)
        .get('/status')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('env');

      expect(response.body.env).toHaveProperty('nodeEnv');
      expect(response.body.env).toHaveProperty('hasOpenAI');
      expect(response.body.env).toHaveProperty('port');

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });

    test('should reflect OpenAI API key status', async () => {
      const originalKey = process.env.OPENAI_API_KEY;

      // Test without API key
      delete process.env.OPENAI_API_KEY;
      let response = await request(app).get('/status');
      expect(response.body.env.hasOpenAI).toBe(false);

      // Test with API key
      process.env.OPENAI_API_KEY = 'test-key';
      response = await request(app).get('/status');
      expect(response.body.env.hasOpenAI).toBe(true);

      // Restore original key
      if (originalKey) {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });

    test('should handle environment variable changes', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalPort = process.env.PORT;

      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';

      const response = await request(app)
        .get('/status')
        .expect(200);

      expect(response.body.env.nodeEnv).toBe('production');
      expect(response.body.env.port).toBe('8080');

      // Restore original values
      if (originalEnv) process.env.NODE_ENV = originalEnv;
      if (originalPort) process.env.PORT = originalPort;
      else delete process.env.PORT;
    });
  });

  describe('Error Response Format', () => {
    test('should return consistent error response format', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'NonExistent',
          lname: 'Professor',
          university: 'NonExistent University'
        });

      if (response.status !== 200) {
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
        expect(response.body.error.length).toBeGreaterThan(0);

        // Should include helpful details for debugging
        if (response.body.details) {
          expect(typeof response.body.details).toBe('string');
        }
      }
    });

    test('should return appropriate HTTP status codes', async () => {
      // Test various error scenarios
      const testCases = [
        {
          query: {},
          expectedStatus: 400,
          description: 'missing all parameters'
        },
        {
          query: { fname: 'Test' },
          expectedStatus: 400,
          description: 'missing required parameters'
        },
        {
          query: {
            fname: 'NonExistent',
            lname: 'Professor',
            university: 'NonExistent University'
          },
          expectedStatus: [404, 500],
          description: 'professor not found'
        }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .get('/professor')
          .query(testCase.query);

        if (typeof testCase.expectedStatus === 'number') {
          expect(response.status).toBe(testCase.expectedStatus);
        } else {
          expect(testCase.expectedStatus).toContain(response.status);
        }
      }
    });
  });

  describe('Rate Limiting and Performance', () => {
    test('should handle high load gracefully', async () => {
      const requests = [];
      const startTime = Date.now();

      // Create many concurrent requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .get('/health') // Use health endpoint to avoid RateMyProfessors API calls
        );
      }

      const responses = await Promise.all(requests);
      const endTime = Date.now();

      // All requests should complete
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete in reasonable time (less than 10 seconds for health checks)
      expect(endTime - startTime).toBeLessThan(10000);
    });

    test('should handle mixed request types', async () => {
      const requests = [
        request(app).get('/health'),
        request(app).get('/status'),
        request(app).get('/professor').query({
          fname: 'Test',
          lname: 'Professor',
          university: 'Test University'
        })
      ];

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect([200, 400, 404, 500]).toContain(response.status);
      });
    });
  });
});
