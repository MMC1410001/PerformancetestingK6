import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const url = 'https://project1.project1.app/api/v1/rss';

  const headers = {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
  };

  const res = http.get(url, { headers });
  const json = res.json();

  const categories = [
    'Top Stories',
    'FinTech',
    'Financial Services',
    'Insurance',
    'Policy',
  ];

  const checks = {
    'status is 200': (r) => r.status === 200,
    'response is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
  };

  for (const category of categories) {
    const articles = json[category];

    checks[`${category} is an array`] = () => Array.isArray(articles);
    checks[`${category} has at least 1 article`] = () => articles.length > 0;
    checks[`${category} - title exists`] = () => articles[0]?.title?.length > 0;
    checks[`${category} - valid link`] = () => articles[0]?.link?.startsWith('http');
    checks[`${category} - valid date`] = () => !isNaN(Date.parse(articles[0]?.date));
  }

  check(res, checks);

  console.log(`Fetched RSS categories: ${Object.keys(json).join(', ')}`);
}
