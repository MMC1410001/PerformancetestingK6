import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
//   thresholds: {
//     // Count: Incorrect content cannot be returned more than 99 times.
//     Errors: ['count<100'],
//     // Gauge: returned content must be smaller than 4000 bytes
//     ContentSize: ['value<4000'],
//     // Rate: content must be OK more than 95 times
//     ContentOK: ['rate>0.95'],
//     // Trend: Percentiles, averages, medians, and minimums
//     // must be within specified milliseconds.
//     RTT: ['p(99)<300', 'p(70)<250', 'avg<200', 'med<150', 'min<100'],
//   },
};

export default function () {
  const res = http.get('https://example.com');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}