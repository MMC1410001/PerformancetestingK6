// This script is designed to test the performance of all different pages under user load of the PlanMyTax website.
// Soak testing is used to check the performance of the website under increasing heavy load.

import { group, sleep, check } from "k6";
import http from "k6/http";

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

  // New Chatbot POST request to measure response time
  params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  url = "https://example.com"; //Chatbot's real POST endpoint!

  let payload = JSON.stringify({
    message: "What is the tax slab for FY 2025-26?",
  });

  let chatbotResp = http.post(url, payload, params);

  
  // console.log(`Response Body: ${chatbotResp.body}`);
  // Check if chatbot responded successfully and measure timing
  check(chatbotResp, {
    "chatbot response status 200": (r) => r.status === 200,
    "chatbot responded within 1s": (r) => r.timings.duration < 1000,
  });

  // Debug log to inspect status and body
  console.log(`Status Code: ${chatbotResp.status}`);
  console.log(`Chatbot response time: ${chatbotResp.timings.duration} ms`);
  
  sleep(1);
};
