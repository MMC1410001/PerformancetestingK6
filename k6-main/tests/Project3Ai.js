import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 60,
      duration: '1m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% of requests should complete below 1000ms
    http_req_failed: ['rate<0.05'],     // Less than 5% of requests should fail
  },
};

export default function () {
  const res = http.get('https://project3ai.io/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}