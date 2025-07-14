import { group, sleep, check } from "k6";
import http from "k6/http";

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 500,
      duration: '3m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% of requests should complete below 1000ms
    http_req_failed: ['rate<0.05'],     // Less than 5% of requests should fail
  },
};

export default function () {
  let params = {
    headers: {},
    cookies: {},
  };

  group("Default group", function () {
    let urls = [
      "https://project2.ai/",
      "https://project2.ai/about",
      "https://project2.ai/chat",
      "https://project2.ai/blogs",
      "https://project2.ai/check-regime",
    ];

    for (let i = 0; i < urls.length; i++) {
      let resp = http.get(urls[i], params);
      console.log(`Response from ${urls[i]}: ${resp.status} - ${resp.status_text}`);
      check(resp, {
        "status is 200": (r) => r.status === 200,
      });
    }
  });

  sleep(1);
}
