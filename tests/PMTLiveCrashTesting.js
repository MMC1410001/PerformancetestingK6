// This script is designed to test the performance of the PlanMyTax website till it crashes under load.
// Stress testing
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://example.com';

// Custom metrics
export const successRate = new Rate('success_rate');
export const failureRate = new Rate('failure_rate');
export const responseTime = new Trend('response_time');
export const successCount = new Counter('success_count');
export const failCount = new Counter('fail_count');

// Load stages
export const options = {
  stages: [
    { duration: '10s', target: 1 },
    { duration: '10s', target: 10 },
    { duration: '10s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '30s', target: 300 },
    { duration: '30s', target: 300 },
    // { duration: '30s', target: 400 },
    // { duration: '30s', target: 500 },
    // { duration: '30s', target: 600 },
    // { duration: '30s', target: 700 },
    // { duration: '30s', target: 800 },
    // { duration: '30s', target: 900 },
    // { duration: '30s', target: 1000 },
  ],
  thresholds: {
    success_rate: ['rate>0.95'],
    'http_req_duration': ['p(95)<1000'],
  },
};

export default function () {
  const res = http.get('https://example.com', { timeout: '10s' });

  const isSuccess = check(res, {
    'status is 200': (r) => r.status === 200,
    'not 5xx error': (r) => !String(r.status).startsWith('5'),
  });

  successRate.add(isSuccess);
  failureRate.add(!isSuccess);
  responseTime.add(res.timings.duration);

  if (isSuccess) {
    successCount.add(1);
  } else {
    failCount.add(1);
    console.error(`Failed Request: status=${res.status}, duration=${res.timings.duration}ms`);
  }

  // Just log if failure rate is bad, but do NOT fail test
  if (failureRate.rate > 0.1) {
    console.warn(`Failure rate too high: ${(failureRate.rate * 100).toFixed(1)}%`);
  }

  sleep(1);
}

// Full summary report at end of run
export function handleSummary(data) {
  // Duration
  const durationSec = data.state?.testRunDurationMs? (data.state.testRunDurationMs / 1000).toFixed(2) + 's': 'N/A';
  // VU count
  const maxVUs = data.metrics.vus_max?.values?.max || 'N/A';
  const successCount = data.metrics.success_count?.values?.count || 0;
  const failCount = data.metrics.fail_count?.values?.count || 0;
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] || 'N/A';

  const customSummary = `
  Performance Test Results:
  =========================
  Total Successes: ${successCount}
  Total Failures: ${failCount}
  95th Percentile Response Time: ${p95} ms
  Maximum Virtual Users: ${maxVUs}
  Test Duration: ${durationSec}

  ${textSummary(data, { indent: ' ', enableColors: false })}
  `;

  return {
    stdout: customSummary
  };
}