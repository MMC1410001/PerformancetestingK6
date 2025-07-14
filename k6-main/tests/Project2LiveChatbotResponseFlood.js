// Streaming Chatbot Performance Test
// The key metric is time to first character in stream response for multiple users instead of a single response
import { group, sleep, check } from "k6";
import http from "k6/http";
import { Counter, Trend } from "k6/metrics";

// Custom metrics to track stream response times
const firstByteTime = new Trend("first_byte_time");
const totalRequestCount = new Counter("total_requests");

export const options = {
  // If cocurrent testing is needed, use the following code: 
    vus: 500,           // Fixed number of virtual users
    duration: '3m',      // Total test duration

  // In case of rampup use the following stages code:
  // stages: [
  //   { target: 1, duration: "5s" },    // Ramp-up to 1 user
  //   { target: 2, duration: "10s" }, // Maintain 2 users for 1.5 minutes
  //   { target: 0, duration: "10s" },   // Ramp-down to 0
  // ],

  thresholds: {
    // Set thresholds for first byte time
    "first_byte_time": ["p(95)<3000"], // 95% of first byte responses should be under 3s
    "http_req_failed": ["rate<0.01"], // Error rate less than 1%
  },
};

export default function() {
  totalRequestCount.add(1);
  
  group("Chatbot API Stream Response Test", function() {
    // Parameters for the request
    const params = {
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream", // Important for SSE streams
      },
      timeout: "20s", // Increase timeout to ensure stream has time to start
      responseType: "text", // Ensure we get the raw response text
      responseCallback: http.expectedStatuses(200), // Allow only 200 status
    };

    const url = "https://bot.project2.ai/chat/stream";
    
    const payload = JSON.stringify({
      message: "Hi",
      // Add any other required parameters for your API
    });

    const startTime = new Date().getTime();
    
    try {
      // Make the HTTP request
      const response = http.post(url, payload, params);
      
      // Calculate and record the time to first byte
      const ttfb = response.timings.waiting;
      firstByteTime.add(ttfb);
      
      // Check if the request was successful
      check(response, {
        "Status is 200": (r) => r.status === 200,
        "Response body exists": (r) => r.body.length > 0,
        "Stream contains content": (r) => {
          // Check if the response contains any content (first character test)
          if (r.body.length > 0) {
            console.log(`First few characters: ${r.body.substring(0, 20).replace(/\n/g, '\\n')}`);
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
    
    // Add a small pause between iterations
    sleep(1);
  });
}

// Optional: Add a setup function if you need to prepare anything before the test
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