// This script is designed to test the performance of all different pages under user load of the PlanMyTax website.
// Spike testing is used to check the performance of the website under sudden load.
import { group, sleep, check } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { target: 20, duration: "5s" },
    { target: 1000, duration: "2m30s" },
    { target: 0, duration: "10s" },
  ],
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
      headers: {
      },
      cookies: {},
    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {
      },
      cookies: {},
    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {
      },
      cookies: {},
    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);
    check(resp, { "status equals 200": (r) => r.status === 200 });

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {
      },
      cookies: {},
    };

    url = http.url`https://example.com`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 304": (r) => r.status === 304 });
  });

  sleep(1);
};
