import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    // If cocurrent testing is needed, use the following code: 
    vus: 5,               // Fixed number of virtual users
    duration: '10s',      // Total test duration

    // In case of rampup use the following stages code
  // stages: [
  //   { duration: '5s', target: 5 },
  //   { duration: '1m30s', target: 100 },
  //   { duration: '20s', target: 0 },
  // ],
};

export default function () {
  const url = 'https://example.com';

  const headers = {
'cookie': '_ga=GA1.1.1565133060.1747108345; _za_CXZH6MT6H4=GS2.1.s1747110136$o4$g1$t1747111224$j0$l0$h0; token=eyJklbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6Ijg3NzkyOTY1MDAiLCJpYXQiOjE3NDcxMjk4MDAsImV4cCI6MTc0NzMwMjYwMH0.I5UwhurKJ2fkUOV1BzhcYp4Ssn77XFY6j2AovdN2Clk; _ha_JPKL68K0S7=GS2.1.s1747129762$o3$g1$t1747129801$j0$l0$h0'
  };

  const res = http.get(url, { headers });

  check(res, {
    'status was 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  console.log(`Status: ${res.status}`);
  console.log(`Response time: ${res.timings.duration}ms`);
  console.log(`Response body: ${res.body}`);
  sleep(1);
}
