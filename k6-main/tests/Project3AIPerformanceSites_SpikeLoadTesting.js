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
      "https://project3ai.io/",
    ];

    for (let i = 0; i < urls.length; i++) {
      let response = http.get(urls[i], params);
      console.log(`Response from ${urls[i]}: ${response.status} - ${response.status_text}`);
      check(response, {
        "status is 200": (r) => r.status === 200,
        'title is present in response': (res) =>
        /<title>\s*project3\s*\|\s*Agentic Intelligence for the Enterprise\s*<\/title>/i.test(res.body),
      });
    }
  });

  sleep(1);
}
