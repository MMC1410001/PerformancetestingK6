import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Custom metrics
export const success_rate = new Rate('success_rate');
export const failure_rate = new Rate('failure_rate');
export const response_time = new Trend('response_time');
export const success_count = new Counter('success_count');
export const fail_count = new Counter('fail_count');

// Options
export const options = {
  vus: 10,
  duration: '10s', 
  // Run until externally stopped using following code and command : k6 run --vus 1000 --duration 1h project3FormSubmit.js
/*
    scenarios: {
    infinite_load: {
    executor: 'externally-controlled',
    vus: 1,
    },
    },
*/
  thresholds: {
    success_rate: ['rate>0.95'],
    'http_req_duration': ['p(95)<1000'],
  },
};

export default function () {
  const url = 'https://project3ai.io/contact';

  const payload = JSON.stringify([
    {
      firstName: 'Tester1',
      lastName: 'Surnames',
      email: 'tester1@gmail.com',
      phone: '7394515545',
      query: 'Test message Sent Via Automation',
      team: 'others',
    },
  ]);

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '10s',
  };

  const res = http.post(url, payload, params);

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
    console.error(`❌ Failed Request: status=${res.status} | time=${res.timings.duration}ms`);
  }

  sleep(1); // Prevents overloading server
}

// Summary output at end
export function handleSummary(data) {
  console.log('\nTest Summary:');
  console.log(`✅ Total Successes: ${data.metrics.success_count?.values?.count ?? 0}`);
  console.log(`❌ Total Failures: ${data.metrics.fail_count?.values?.count ?? 0}`);
  console.log(`⏱️ 95th Percentile Response Time: ${data.metrics.http_req_duration?.values?.['p(95)'] ?? 'N/A'} ms`);

  return {
    stdout: textSummary(data, { indent: ' ', enableColors: false }),
  };
}
