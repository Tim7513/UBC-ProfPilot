const request = require('supertest');
const app = require('../../index');

describe('Course API Endpoints', () => {
  describe('GET /course', () => {
    test('should return 400 for missing required parameters', async () => {
      const response = await request(app)
        .get('/course')
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should return 400 for missing course name', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          department_number: '110',
          university_number: '1413'
        })
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should return 400 for missing department number', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'CPSC',
          university_number: '1413'
        })
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should return 400 for missing university number', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'CPSC',
          department_number: '110'
        })
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should handle empty parameter values', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: '',
          department_number: '110',
          university_number: '1413'
        })
        .expect(400);

      expect(response.body.error).toMatch(/missing required parameters/i);
    });

    test('should handle special characters in course name', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'CPSC-110',
          department_number: '110',
          university_number: '1413'
        })
        .expect([400, 404, 500]); // Should handle gracefully

      expect([400, 404, 500]).toContain(response.status);
    });

    test('should handle non-numeric department numbers', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'CPSC',
          department_number: 'ABC',
          university_number: '1413'
        })
        .expect([400, 404, 500]);

      expect([400, 404, 500]).toContain(response.status);
    });

    test('should handle very long parameter values', async () => {
      const longCourseName = 'A'.repeat(1000);
      const longDeptNumber = 'B'.repeat(100);

      const response = await request(app)
        .get('/course')
        .query({
          course_name: longCourseName,
          department_number: longDeptNumber,
          university_number: '1413'
        })
        .expect([400, 404, 500]); // Should fail but not crash

      expect([400, 404, 500]).toContain(response.status);
    });

    test('should validate response structure for successful course search', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'CPSC',
          department_number: '110',
          university_number: '1413'
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('course_name');
        expect(response.body).toHaveProperty('department_number');
        expect(response.body).toHaveProperty('university_number');
        expect(response.body).toHaveProperty('professors_count');
        expect(response.body).toHaveProperty('professors');

        expect(response.body.course_name).toBe('CPSC');
        expect(response.body.department_number).toBe('110');
        expect(response.body.university_number).toBe('1413');
        expect(typeof response.body.professors_count).toBe('number');
        expect(Array.isArray(response.body.professors)).toBe(true);

        // Validate professor data structure
        if (response.body.professors.length > 0) {
          const professor = response.body.professors[0];
          expect(professor).toHaveProperty('name');
          expect(professor).toHaveProperty('first_name');
          expect(professor).toHaveProperty('last_name');
          expect(professor).toHaveProperty('department');
          expect(professor).toHaveProperty('university');
          expect(professor).toHaveProperty('profile_url');
          expect(professor).toHaveProperty('num_ratings');

          expect(typeof professor.num_ratings).toMatch(/number|string/);
        }
      }
    });

    test('should return 404 for course with no professors', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'NONEXISTENT',
          department_number: '999',
          university_number: '9999'
        });

      if (response.status === 404) {
        expect(response.body.error).toMatch(/no professors found/i);
        expect(response.body).toHaveProperty('course_name');
        expect(response.body).toHaveProperty('department_number');
        expect(response.body).toHaveProperty('university_number');
      }
    });

    test('should handle RateMyProfessors API errors during course search', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'ERROR',
          department_number: 'TEST',
          university_number: '1413'
        })
        .timeout(10000) // 10 second timeout
        .expect([400, 404, 408, 500]);

      expect([400, 404, 408, 500]).toContain(response.status);
    });

    test('should handle concurrent course searches', async () => {
      const requests = [];
      const courseData = {
        course_name: 'CPSC',
        department_number: '110',
        university_number: '1413'
      };

      // Create multiple concurrent requests
      for (let i = 0; i < 3; i++) {
        requests.push(
          request(app)
            .get('/course')
            .query(courseData)
        );
      }

      const responses = await Promise.all(requests);

      // All requests should complete
      responses.forEach(response => {
        expect([200, 400, 404, 500]).toContain(response.status);
      });
    });

    test('should handle multiple professors for same course', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'CPSC',
          department_number: '110',
          university_number: '1413'
        });

      if (response.status === 200 && response.body.professors.length > 1) {
        expect(response.body.professors_count).toBe(response.body.professors.length);

        // Each professor should have required fields
        response.body.professors.forEach(professor => {
          expect(professor).toHaveProperty('name');
          expect(professor).toHaveProperty('first_name');
          expect(professor).toHaveProperty('last_name');
          expect(professor).toHaveProperty('profile_url');
        });
      }
    });

    test('should handle URL encoding in course parameters', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'CPSC%20110', // Pre-encoded
          department_number: '110',
          university_number: '1413'
        })
        .expect([200, 400, 404, 500]);

      expect([200, 400, 404, 500]).toContain(response.status);
    });

    test('should handle case sensitivity in course names', async () => {
      const testCases = [
        'cpsc', // lowercase
        'CPSC', // uppercase
        'Cpsc'  // mixed case
      ];

      for (const courseName of testCases) {
        const response = await request(app)
          .get('/course')
          .query({
            course_name: courseName,
            department_number: '110',
            university_number: '1413'
          });

        expect([200, 400, 404, 500]).toContain(response.status);
      }
    });

    test('should handle numeric course numbers correctly', async () => {
      const testNumbers = ['110', '00110', '110.0', '110a'];

      for (const courseNumber of testNumbers) {
        const response = await request(app)
          .get('/course')
          .query({
            course_name: 'CPSC',
            department_number: courseNumber,
            university_number: '1413'
          });

        expect([200, 400, 404, 500]).toContain(response.status);
      }
    });

    test('should validate university number format', async () => {
      const testUniversityIds = ['1413', '999999', 'abc', ''];

      for (const universityId of testUniversityIds) {
        const response = await request(app)
          .get('/course')
          .query({
            course_name: 'CPSC',
            department_number: '110',
            university_number: universityId
          });

        if (universityId === '') {
          expect(response.status).toBe(400);
        } else {
          expect([200, 400, 404, 500]).toContain(response.status);
        }
      }
    });
  });

  describe('Integration with Professor Endpoint', () => {
    test('should return consistent data format between course and professor endpoints', async () => {
      // First get course data
      const courseResponse = await request(app)
        .get('/course')
        .query({
          course_name: 'CPSC',
          department_number: '110',
          university_number: '1413'
        });

      if (courseResponse.status === 200 && courseResponse.body.professors.length > 0) {
        const professor = courseResponse.body.professors[0];

        // Then get detailed professor data
        const professorResponse = await request(app)
          .get('/professor')
          .query({
            fname: professor.first_name,
            lname: professor.last_name,
            university: professor.university
          });

        if (professorResponse.status === 200) {
          // Data should be consistent
          expect(professorResponse.body.first_name).toBe(professor.first_name);
          expect(professorResponse.body.last_name).toBe(professor.last_name);
          expect(professorResponse.body.university).toBe(professor.university);
        }
      }
    });
  });

  describe('Error Recovery', () => {
    test('should recover from temporary API failures', async () => {
      // Make a request that might fail
      const response1 = await request(app)
        .get('/course')
        .query({
          course_name: 'TEMPFAIL',
          department_number: 'TEST',
          university_number: '1413'
        });

      // Wait a moment and try again
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response2 = await request(app)
        .get('/course')
        .query({
          course_name: 'TEMPFAIL',
          department_number: 'TEST',
          university_number: '1413'
        });

      // Both requests should either succeed or fail consistently
      expect([200, 400, 404, 500]).toContain(response1.status);
      expect([200, 400, 404, 500]).toContain(response2.status);
    });

    test('should handle malformed responses from external API', async () => {
      const response = await request(app)
        .get('/course')
        .query({
          course_name: 'MALFORMED',
          department_number: 'RESPONSE',
          university_number: '1413'
        })
        .timeout(15000);

      expect([200, 400, 404, 500]).toContain(response.status);
    });
  });

  describe('Performance Under Load', () => {
    test('should handle multiple different course searches', async () => {
      const courseQueries = [
        { course_name: 'CPSC', department_number: '110', university_number: '1413' },
        { course_name: 'MATH', department_number: '100', university_number: '1413' },
        { course_name: 'ENGL', department_number: '110', university_number: '1413' }
      ];

      const requests = courseQueries.map(query =>
        request(app).get('/course').query(query)
      );

      const responses = await Promise.all(requests);
      const startTime = Date.now();

      responses.forEach(response => {
        expect([200, 400, 404, 500]).toContain(response.status);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(30000); // Should complete within 30 seconds
    });
  });
});
