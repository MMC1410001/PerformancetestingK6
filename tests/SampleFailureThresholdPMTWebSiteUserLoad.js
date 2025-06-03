import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://example.com';

// Custom metrics
export const success_rate = new Rate('success_rate');
export const failure_rate = new Rate('failure_rate');
export const response_time = new Trend('response_time');
export const success_count = new Counter('success_count');
export const fail_count = new Counter('fail_count');

// Configuration
export const options = {
  vus: 1000,
  duration: '0', // Infinite duration – stop manually or via external controller
  thresholds: {
    success_rate: ['rate>0.95'],          // At least 95% of requests must succeed
    'http_req_duration': ['p(95)<1000'],  // 95% of requests must be < 1000ms
  },
};

export default function () {
  const res = http.get('https://example.com', { timeout: '10s' });

  const isSuccess = check(res, {
    'status is 200': (r) => r.status === 200,
    'not 5xx error': (r) => !String(r.status).startsWith('5'),
  });

  success_rate.add(isSuccess);
  failure_rate.add(!isSuccess);
  response_time.add(res.timings.duration);

  if (isSuccess) {
    success_count.add(1);
  } else {
    fail_count.add(1);
    console.error(`Failed Request: status=${res.status} | time=${res.timings.duration}ms`);
  }

  sleep(1);
}

// Final summary output
export function handleSummary(data) {
  console.log(`\nTest Summary:`);
  console.log(`Total Successes: ${data.metrics.success_count?.values?.count ?? 0}`);
  console.log(`Total Failures: ${data.metrics.fail_count?.values?.count ?? 0}`);
  console.log(`95th Percentile Response Time: ${data.metrics.http_req_duration?.values?.['p(95)'] ?? 'N/A'} ms`);

  return {
    stdout: textSummary(data, { indent: ' ', enableColors: false }),
  };
}
