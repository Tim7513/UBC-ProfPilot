// Custom processor for Artillery performance tests

module.exports = {
  // Process response data
  processResponse: function (response, context, ee, next) {
    // Log slow responses
    if (response.duration > 5000) {
      console.log(`Slow response detected: ${response.url} took ${response.duration}ms`);
    }

    // Track error rates
    if (response.statusCode >= 400) {
      context.vars.errorCount = (context.vars.errorCount || 0) + 1;
    }

    return next();
  },

  // Generate custom metrics
  generateMetrics: function (report, done) {
    const scenarios = report.scenariosCompleted;
    const requests = report.requestsCompleted;
    const errors = report.errors;

    console.log('\n=== Custom Performance Metrics ===');
    console.log(`Total scenarios completed: ${scenarios}`);
    console.log(`Total requests completed: ${requests}`);
    console.log(`Error count: ${errors}`);
    console.log(`Error rate: ${((errors / requests) * 100).toFixed(2)}%`);

    // Performance thresholds
    const maxErrorRate = 5; // 5% error rate threshold
    const maxAvgResponseTime = 10000; // 10 seconds max average

    if (report.aggregate) {
      const avgResponseTime = report.aggregate.meanResponseTime;

      console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);

      if (avgResponseTime > maxAvgResponseTime) {
        console.warn(`⚠️  Average response time (${avgResponseTime.toFixed(2)}ms) exceeds threshold (${maxAvgResponseTime}ms)`);
      }

      if ((errors / requests) * 100 > maxErrorRate) {
        console.warn(`⚠️  Error rate (${((errors / requests) * 100).toFixed(2)}%) exceeds threshold (${maxErrorRate}%)`);
      }
    }

    return done();
  }
};
