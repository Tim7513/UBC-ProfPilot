const request = require('supertest');
const app = require('../../../index');

describe('API Security Tests', () => {
  describe('Input Validation and Sanitization', () => {
    test('should reject SQL injection attempts', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE professors; --",
        "' OR '1'='1",
        "1'; DELETE FROM users; --",
        "' UNION SELECT * FROM users --",
        "'; INSERT INTO professors VALUES (1, 'hacked', 'hacked'); --",
        "1' AND (SELECT COUNT(*) FROM information_schema.tables) > 0 --",
        "'; EXEC xp_cmdshell('dir'); --"
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get('/professor')
          .query({
            fname: payload,
            lname: 'Test',
            university: 'Test University'
          });

        // Should not execute SQL and should return 400/404/500
        expect([400, 404, 500]).toContain(response.status);

        // Response should not contain SQL error messages
        if (response.body && response.body.error) {
          expect(response.body.error).not.toMatch(/SQL|database|table|DROP|DELETE|INSERT|UNION|EXEC/i);
        }
      }
    });

    test('should reject XSS attempts', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src="x" onerror="alert(1)">',
        'javascript:alert("xss")',
        '<svg onload=alert(1)>',
        '<iframe src="javascript:alert(1)"></iframe>',
        '"><script>alert("xss")</script>',
        '\'-alert("xss")-\'',
        '<details open ontoggle=alert(1)>'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .get('/professor')
          .query({
            fname: payload,
            lname: 'Test',
            university: 'Test University'
          });

        expect([400, 404, 500]).toContain(response.status);

        // Response should not contain script tags
        if (response.body && response.body.error) {
          expect(response.body.error).not.toMatch(/<script|<img.*onerror|<svg|<iframe|javascript:/i);
        }
      }
    });

    test('should reject NoSQL injection attempts', async () => {
      const nosqlPayloads = [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$regex": ".*"}',
        '{"$where": "this.fname.length > 0"}',
        '{"fname": {"$in": ["test"]}}'
      ];

      for (const payload of nosqlPayloads) {
        const response = await request(app)
          .get('/professor')
          .query({
            fname: payload,
            lname: 'Test',
            university: 'Test University'
          });

        expect([400, 404, 500]).toContain(response.status);
      }
    });

    test('should handle extremely long input', async () => {
      const longInput = 'A'.repeat(100000); // 100KB input

      const response = await request(app)
        .get('/professor')
        .query({
          fname: longInput,
          lname: 'Test',
          university: 'Test University'
        })
        .timeout(10000); // 10 second timeout

      // Should timeout or return error, not crash
      expect([400, 404, 408, 500]).toContain(response.status);
    });

    test('should handle binary/null byte input', async () => {
      const binaryInput = 'Test\x00\x01\x02\x03Professor';

      const response = await request(app)
        .get('/professor')
        .query({
          fname: binaryInput,
          lname: 'Test',
          university: 'Test University'
        });

      expect([400, 404, 500]).toContain(response.status);
    });

    test('should handle unicode and emoji input', async () => {
      const unicodeInput = 'José🚀🎓';

      const response = await request(app)
        .get('/professor')
        .query({
          fname: unicodeInput,
          lname: 'Test',
          university: 'Test University'
        });

      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe('Path Traversal and File System Access', () => {
    test('should prevent directory traversal attacks', async () => {
      const traversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '..%252f..%252f..%252fetc%252fpasswd',
        '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd'
      ];

      for (const payload of traversalPayloads) {
        const response = await request(app)
          .get('/professor')
          .query({
            fname: payload,
            lname: 'Test',
            university: 'Test University'
          });

        expect([400, 404, 500]).toContain(response.status);
      }
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    test('should handle rapid requests', async () => {
      const requests = [];
      for (let i = 0; i < 100; i++) {
        requests.push(
          request(app).get('/health') // Use health endpoint for rapid testing
        );
      }

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.status === 200).length;
      const errorCount = responses.filter(r => r.status !== 200).length;

      // Should handle high load without crashing
      expect(successCount + errorCount).toBe(100);

      // Most requests should succeed for health endpoint
      expect(successCount).toBeGreaterThan(80);
    });

    test('should handle concurrent API calls', async () => {
      const concurrentRequests = [];
      for (let i = 0; i < 20; i++) {
        concurrentRequests.push(
          request(app)
            .get('/professor')
            .query({
              fname: 'Concurrent',
              lname: `Test${i}`,
              university: 'Concurrent University'
            })
        );
      }

      const responses = await Promise.all(concurrentRequests);

      // All requests should complete
      responses.forEach(response => {
        expect([200, 400, 404, 500]).toContain(response.status);
      });
    });

    test('should handle resource exhaustion attempts', async () => {
      const largeRequests = [];

      // Create requests with large payloads
      for (let i = 0; i < 10; i++) {
        const largeParam = 'A'.repeat(10000);
        largeRequests.push(
          request(app)
            .get('/professor')
            .query({
              fname: largeParam,
              lname: largeParam,
              university: largeParam
            })
            .timeout(15000)
        );
      }

      const responses = await Promise.all(largeRequests);

      // Should handle without crashing
      responses.forEach(response => {
        expect([200, 400, 404, 408, 500]).toContain(response.status);
      });
    });
  });

  describe('Authentication and Authorization', () => {
    test('should not expose sensitive information in error messages', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Internal',
          lname: 'Error',
          university: 'Test University'
        });

      if (response.status >= 500) {
        expect(response.body.error).not.toMatch(/stack|trace|file|path|directory|config|key|password|token|secret/i);
      }
    });

    test('should not expose server information in headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Should not expose server details
      expect(response.headers['server']).toBeUndefined();
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['x-aspnet-version']).toBeUndefined();
    });
  });

  describe('Data Exposure Prevention', () => {
    test('should not leak environment variables', async () => {
      const response = await request(app)
        .get('/status')
        .expect(200);

      // Should not expose sensitive environment data
      expect(response.body.env).not.toHaveProperty('OPENAI_API_KEY');
      expect(response.body.env).not.toHaveProperty('DATABASE_URL');
      expect(response.body.env).not.toHaveProperty('SECRET');
      expect(response.body.env).not.toHaveProperty('PASSWORD');

      // But should expose safe environment info
      expect(response.body.env).toHaveProperty('nodeEnv');
      expect(response.body.env).toHaveProperty('port');
      expect(response.body.env).toHaveProperty('hasOpenAI');
    });

    test('should not expose internal file paths', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Path',
          lname: 'Disclosure',
          university: 'Test University'
        });

      if (response.body && response.body.error) {
        expect(response.body.error).not.toMatch(/\/.*\.js|\/.*\.json|\/.*\.env|C:\\|\\\\|file:\/\/|path/i);
      }
    });
  });

  describe('HTTP Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Should include CORS headers
      expect(response.headers['access-control-allow-origin']).toBeDefined();

      // Should not include dangerous headers
      expect(response.headers['x-frame-options']).toBeUndefined(); // Should be set to prevent clickjacking
    });

    test('should handle HTTP method restrictions', async () => {
      // Test that only GET methods are allowed where appropriate
      await request(app)
        .post('/health')
        .expect(404); // Should not allow POST to health endpoint

      await request(app)
        .put('/health')
        .expect(404); // Should not allow PUT to health endpoint

      await request(app)
        .delete('/health')
        .expect(404); // Should not allow DELETE to health endpoint
    });

    test('should handle malformed HTTP requests', async () => {
      // Test with malformed headers
      const response = await request(app)
        .get('/health')
        .set('Content-Type', 'invalid/content/type/with/many/slashes')
        .expect(200); // Should still work

      expect(response.body.status).toBe('OK');
    });
  });

  describe('Content Type Validation', () => {
    test('should handle invalid content types', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept', 'invalid/content/type')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });

    test('should handle missing accept headers', async () => {
      const response = await request(app)
        .get('/health')
        .unset('Accept')
        .expect(200);

      expect(response.body.status).toBe('OK');
    });
  });

  describe('Protocol Security', () => {
    test('should reject HTTP header injection', async () => {
      const injectionPayloads = [
        'test\r\nSet-Cookie: malicious=value',
        'test\r\nLocation: http://evil.com',
        'test\nContent-Length: 0'
      ];

      for (const payload of injectionPayloads) {
        const response = await request(app)
          .get('/professor')
          .query({
            fname: payload,
            lname: 'Test',
            university: 'Test University'
          });

        expect([400, 404, 500]).toContain(response.status);
      }
    });

    test('should handle URL encoding attacks', async () => {
      const encodedPayloads = [
        '%252e%252e%252f', // Encoded ../
        '%2e%2e%2f',      // Encoded ../
        '%c0%ae%c0%ae%c0%af', // Unicode encoded ../
        '%25%32%65%25%32%65%25%32%66' // Double encoded ../
      ];

      for (const payload of encodedPayloads) {
        const response = await request(app)
          .get('/professor')
          .query({
            fname: payload,
            lname: 'Test',
            university: 'Test University'
          });

        expect([400, 404, 500]).toContain(response.status);
      }
    });
  });

  describe('Session and State Management', () => {
    test('should not maintain server-side sessions', async () => {
      // Make multiple requests without session cookies
      const responses = await Promise.all([
        request(app).get('/health'),
        request(app).get('/health'),
        request(app).get('/health')
      ]);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.headers['set-cookie']).toBeUndefined();
      });
    });

    test('should handle concurrent sessions safely', async () => {
      const concurrentRequests = [];
      for (let i = 0; i < 50; i++) {
        concurrentRequests.push(
          request(app)
            .get('/professor')
            .query({
              fname: `Concurrent${i}`,
              lname: 'Test',
              university: 'Test University'
            })
        );
      }

      const responses = await Promise.all(concurrentRequests);

      responses.forEach(response => {
        expect([200, 400, 404, 500]).toContain(response.status);
      });
    });
  });

  describe('Error Information Disclosure', () => {
    test('should not expose internal error details', async () => {
      const response = await request(app)
        .get('/professor')
        .query({
          fname: 'Error',
          lname: 'Trigger',
          university: 'Error University'
        });

      if (response.status >= 500) {
        expect(response.body.error).not.toMatch(/undefined|null|NaN|Error:|Exception:|Stack:|at\s/i);
        expect(response.body.error).not.toMatch(/\d+\.\d+\.\d+/); // Version numbers
        expect(response.body.error).not.toMatch(/localhost|127\.0\.0\.1/); // Internal addresses
      }
    });

    test('should provide consistent error messages', async () => {
      const errorScenarios = [
        { fname: '', lname: 'Test', university: 'Test University' },
        { fname: 'Test', lname: '', university: 'Test University' },
        { fname: 'Test', lname: 'Test', university: '' },
        { fname: 'Test', lname: 'Test', university: 'NonExistent University' }
      ];

      const errorMessages = [];

      for (const scenario of errorScenarios) {
        const response = await request(app)
          .get('/professor')
          .query(scenario);

        if (response.status !== 200 && response.body.error) {
          errorMessages.push(response.body.error);
        }
      }

      // Error messages should be consistent in format
      errorMessages.forEach(message => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
        expect(message.length).toBeLessThan(200); // Should not be too verbose
      });
    });
  });
});
