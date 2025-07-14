import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { target: 10, duration: "10s" },
    { target: 20, duration: "10s" },
    { target: 50, duration: "10s" },
    { target: 80, duration: "10s" },
    { target: 100, duration: "10s" },
    { target: 200, duration: "10s" },
    { target: 300, duration: "10s" },
    { target: 400, duration: "10s" },
    { target: 500, duration: "10s" },
    { target: 600, duration: "10s" },
    { target: 700, duration: "10s" },
    { target: 800, duration: "10s" },
    { target: 900, duration: "10s" },
    { target: 1000, duration: "3m" },
    { target: 900, duration: "10s" },
    { target: 800, duration: "10s" },
    { target: 700, duration: "10s" },
    { target: 600, duration: "10s" },
    { target: 500, duration: "10s" },
    { target: 400, duration: "10s" },
    { target: 300, duration: "10s" },
    { target: 200, duration: "10s" },
    { target: 100, duration: "10s" },
    { target: 50, duration: "5s" },
    { target: 10, duration: "5s" },
    { target: 1, duration: "5s" },
  ],
};

export default function () {
  const res = http.get('https://project3ai.io/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}

// The test starts failing around 15000 requests , around 200 vus.