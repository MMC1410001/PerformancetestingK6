import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import exec from 'k6/execution';
import { textSummary } from 'https://example.com';

// Custom metrics
export const successRate = new Rate('success_rate');
export const failureRate = new Rate('failure_rate');
export const responseTime = new Trend('response_time');
export const successCount = new Counter('success_count');
export const failCount = new Counter('fail_count');

export const options = {
  stages: [
    { duration: '10s', target: 1 },
    { duration: '10s', target: 10 },
    { duration: '10s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '30s', target: 300 },
    { duration: '30s', target: 400 },
    { duration: '30s', target: 500 },
    { duration: '30s', target: 600 },
    { duration: '30s', target: 700 },
    { duration: '30s', target: 800 },
    { duration: '30s', target: 900 },
    { duration: '30s', target: 1000 },
  ],
  thresholds: {
    success_rate: ['rate>0.95'],
    'http_req_duration': ['p(95)<1000'],
  },
};

// Ensure header only prints once
let headerPrinted = false;

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
    console.error(`Failed Request: status=${res.status} | time=${res.timings.duration}ms`);
  }

  if (!headerPrinted && __VU === 1 && __ITER === 0) {
    console.log("Timestamp,VUs,StatusCode,Duration(ms),Success");
    headerPrinted = true;
  }

  console.log(`${new Date().toISOString()},${exec.vusActive},${res.status},${res.timings.duration},${isSuccess ? 1 : 0}`);

  if (failureRate.rate > 0.1) {
    fail(`FAILURE RATE TOO HIGH: ${(failureRate.rate * 100).toFixed(1)}% – aborting test.`);
  }

  sleep(1);
}

export function handleSummary(data) {
  console.log(`Total Successes: ${data.metrics.success_count.values.count}`);
  console.log(`Total Failures: ${data.metrics.fail_count.values.count}`);
  console.log(`95th Percentile Response Time: ${data.metrics.http_req_duration['p(95)']} ms`);

  // Also return the default summary report
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
