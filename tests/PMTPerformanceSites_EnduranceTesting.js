// This script is designed to test the performance of all different pages under user load of the PlanMyTax website.
// Endurance testing is used to check the performance of the website under heavy load for longer duration.
import { group, sleep, check } from "k6";
import http from "k6/http";

export const options = {
  vus: 1000,           // Fixed number of virtual users
  duration: '3m',      // Total test duration
};

export default function () {
  let params;
  let resp;
  let url;

  group("Default group", function () {
    params = {
      headers: {
      },
      cookies: {},
    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {}
    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {}

    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {}
    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);
    check(resp, { "status equals 200": (r) => r.status === 200 });

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {}
    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 304": (r) => r.status === 304 });
  });

  sleep(1);
};
