import http from 'k6/http';
import { check } from 'k6';

export default function () {
  const res = http.get('https://example.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 1000,
  });
}