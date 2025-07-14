import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 60,
      duration: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],         // <5% request failures
    http_req_duration: ['p(95)<1500'],      // 95% of requests under 1.5s
  },
};

export default function () {
  const url = 'https://project1.project1.app/search';

  const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    referer: 'https://dev-project1.project1.app/',
    'cache-control': 'no-cache',
  };

  const res = http.get(url, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'content-type is HTML': (r) => r.headers['Content-Type']?.includes('text/html'),
    'contains <!DOCTYPE html>': (r) => r.body.includes('<!DOCTYPE html>'),
    'contains <title>project1</title>': (r) => r.body.includes('<title>project1</title>'),
    'contains heading "How can I help you?"': (r) => r.body.includes('How can I help you?'),
    'contains Search input placeholder': (r) => r.body.includes('placeholder="Ask a question..."'),
  });

  console.log(`Search page loaded with ${res.body.length} characters in ${res.timings.duration} ms`);
}
