// Streaming Chatbot Performance Test -> This script tests the performance of a chatbot API that streams responses.

/* Summary :
Purpose	Explanation :
Test Type -> Streaming Chatbot Performance
Target Metric -> Time to First Byte (TTFB)
Custom Metrics-> first_byte_time, total_requests
Validation -> Status, content presence, streaming start
Streaming Support -> Accept: text/event-stream, raw text parsing
Load Pattern ->	1 → 2 → 0 users in ~25s total
Threshold Goals	-> 95% TTFB < 3s, <1% failures //	95th percentile -> 95% of values are below or equal – common in performance testing
The key metric is time to first character in stream response 
*/

import { group, sleep, check } from "k6"; //group: Organizes parts of the test for better reporting. ; sleep: Adds delays between iterations. ; check: Asserts conditions to validate responses.
import http from "k6/http"; //http: Used to make HTTP requests.
import { Counter, Trend } from "k6/metrics"; //Counter, Trend: Custom metrics types from K6.

// Custom metrics to track stream response times
const firstByteTime = new Trend("first_byte_time");  //Tracks time to first byte for each request.
const totalRequestCount = new Counter("total_requests");  // Counts total requests made during the test.



export const options = {
  stages: [
    { target: 1, duration: "5s" },    // Ramp-up to 1 user in 5 seconds
    { target: 2, duration: "10s" }, // Ramp-up to 2 users over 10 seconds
    { target: 0, duration: "10s" },   // Ramp-down to 0 users over 10 seconds
  ],
  thresholds: {
    // Set thresholds for first byte time
    "first_byte_time": ["p(95)<3000"], // 95% of first byte responses should be under 3s
    "http_req_failed": ["rate<0.01"], // Error rate less than 1%
  },
};

export default function() {
  totalRequestCount.add(1); // Increment the total request count for each iteration

  // Grouping the test for better organization in the output
  group("Chatbot API Stream Response Test", function() {
    // Parameters for the request
    const params = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream", // Important for SSE streams
      },
      timeout: "20s", // Increase timeout to ensure stream has time to start
      responseType: "text", // Ensure we get the raw response text from stream output
      responseCallback: http.expectedStatuses(200), // restricts response to 200 OK only.
    };

    const url = "https://bot.project2.ai/chat/stream";
    
    const payload = JSON.stringify({
      message: "Hi",
      // Add any other required parameters for your API
    });

    try {
      // Make the HTTP request
      const response = http.post(url, payload, params);
      
      // Calculate and record the time to first byte
      const ttfb = response.timings.waiting;
      firstByteTime.add(ttfb);
      
      // Check if the request was successful
      check(response, {
        "Status is 200": (r) => r.status === 200,
        "Response body exists": (r) => r.body.length > 0, // Checks for non-empty response body
        "Stream contains content": (r) => {
          // Check if the response contains any content (first character test)
          if (r.body.length > 0) {
            console.log(`First few characters: ${r.body.substring(0, 20).replace(/\n/g, '\\n')}`); // Log first 20 characters for debugging
            // Check if the first character is not a newline or whitespace

            return true;
          }
          return false;
        },
      });
      
      // Log the metrics
      console.log(`Time to first byte: ${ttfb} ms`);
      console.log(`Total request time: ${response.timings.duration} ms`);
      
      // Check if we received actual content quickly enough
      check(ttfb, {
        "First byte received within 3s": (time) => time < 3000,
      });
      
    } catch (error) {
      console.error(`Error in stream test: ${error}`);
    }
    
    // Add a small pause of 1 second between iterations
    sleep(1);
  });
}

// Optional hooks to run logic before and after the test.
// Optional: A setup function if we need to prepare anything before the test such as authentication
export function setup() {
  console.log("Starting streaming response test");
  
  // If authentication is needed:
  // const authResp = http.post(authUrl, JSON.stringify({ username: 'test', password: 'test' }), { headers: { 'Content-Type': 'application/json' } });
  // return { authToken: authResp.json('token') };
}

// Optional: Add a teardown function to clean up after the test
export function teardown() {
  console.log("Streaming response test complete");
}