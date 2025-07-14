// This script is designed to test the performance of all different pages under user load of the project2 website.
// Endurance testing is used to check the performance of the website under heavy load for longer duration.
import { group, sleep, check } from "k6";
import http from "k6/http";

export const options = {
  vus: 1000,           // Fixed number of virtual users
  duration: '30m',      // Total test duration
};

export default function () {
  let params;
  let resp;
  let url;

  group("Default group", function () {
    params = {
      headers: {
        "sec-ch-ua": `"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"`,
        "sec-ch-ua-mobile": `?0`,
        "sec-ch-ua-platform": `"Windows"`,
        "upgrade-insecure-requests": `1`,
        accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
        "sec-fetch-site": `none`,
        "sec-fetch-mode": `navigate`,
        "sec-fetch-user": `?1`,
        "sec-fetch-dest": `document`,
        "accept-encoding": `gzip, deflate, br, zstd`,
        "accept-language": `en-US,en;q=0.9`,
        priority: `u=0, i`,
      },
      cookies: {},
    };

    url = http.url`https://project2.ai/`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {
        "sec-ch-ua": `"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"`,
        "sec-ch-ua-mobile": `?0`,
        "sec-ch-ua-platform": `"Windows"`,
        "upgrade-insecure-requests": `1`,
        accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
        "sec-fetch-site": `same-origin`,
        "sec-fetch-mode": `navigate`,
        "sec-fetch-user": `?1`,
        "sec-fetch-dest": `document`,
        referer: `https://project2.ai/`,
        "accept-encoding": `gzip, deflate, br, zstd`,
        "accept-language": `en-US,en;q=0.9`,
        priority: `u=0, i`,
      },
      cookies: {},
    };

    url = http.url`https://project2.ai/about`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {
        "sec-ch-ua": `"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"`,
        "sec-ch-ua-mobile": `?0`,
        "sec-ch-ua-platform": `"Windows"`,
        "upgrade-insecure-requests": `1`,
        accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
        "sec-fetch-site": `same-origin`,
        "sec-fetch-mode": `navigate`,
        "sec-fetch-user": `?1`,
        "sec-fetch-dest": `document`,
        referer: `https://project2.ai/blogs/what-is-form-26as-how-to-use-it-for-tax-filing-in-india`,
        "accept-encoding": `gzip, deflate, br, zstd`,
        "accept-language": `en-US,en;q=0.9`,
        priority: `u=0, i`,
      },
      cookies: {},
    };

    url = http.url`https://project2.ai/chat`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {
        "sec-ch-ua": `"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"`,
        "sec-ch-ua-mobile": `?0`,
        "sec-ch-ua-platform": `"Windows"`,
        "upgrade-insecure-requests": `1`,
        accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
        "sec-fetch-site": `same-origin`,
        "sec-fetch-mode": `navigate`,
        "sec-fetch-user": `?1`,
        "sec-fetch-dest": `document`,
        referer: `https://project2.ai/blogs`,
        "accept-encoding": `gzip, deflate, br, zstd`,
        "accept-language": `en-US,en;q=0.9`,
        priority: `u=0, i`,
      },
      cookies: {},
    };

    url = http.url`https://project2.ai/blogs`;
    resp = http.request("GET", url, null, params);
    check(resp, { "status equals 200": (r) => r.status === 200 });

    url = http.url`https://project2.ai/check-regime`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 200": (r) => r.status === 200 });

    params = {
      headers: {
        "sec-ch-ua": `"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"`,
        "sec-ch-ua-mobile": `?0`,
        "sec-ch-ua-platform": `"Windows"`,
        "upgrade-insecure-requests": `1`,
        accept: `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7`,
        "sec-fetch-site": `same-origin`,
        "sec-fetch-mode": `navigate`,
        "sec-fetch-user": `?1`,
        "sec-fetch-dest": `document`,
        referer: `https://project2.ai/check-regime`,
        "accept-encoding": `gzip, deflate, br, zstd`,
        "accept-language": `en-US,en;q=0.9`,
        "if-none-match": `"2hhbkc2yh51fwp"`,
        priority: `u=0, i`,
      },
      cookies: {},
    };

    url = http.url`https://project2.ai/chat`;
    resp = http.request("GET", url, null, params);

    check(resp, { "status equals 304": (r) => r.status === 304 });
  });

  sleep(1);
};
