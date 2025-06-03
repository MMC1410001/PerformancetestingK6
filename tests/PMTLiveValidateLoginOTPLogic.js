// This script is used to check whether syestm is able to handle generate OTP logic for multiple users or not. Is there any rate limiting in place.
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,           // Fixed number of virtual users
  duration: '5s',      // Total test duration
  // stages: [
  //   { duration: '30s', target: 2 },
  //   { duration: '1m', target: 5 },
  //   { duration: '30s', target: 0 },
  // ],
};

export default function () {
  const phoneNumber = 88792 * 100000 + Math.floor(Math.random() * 900000); // Genrate a random phone number in the range 8879200000 to 8879299999
  const registerUrl = 'https://example.com';

  // Step 1: Generate OTP
  const registerPayload = JSON.stringify({
    name: 'TestUser',
    phone: `${phoneNumber}`
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const registerRes = http.post(registerUrl, registerPayload, params);

  check(registerRes, {
    'register status is 200': (r) => r.status === 200,
    'register body has otp created': (r) => r.body.includes('otp created'),
  });

  console.log(`Status: ${registerRes.status}`);
  console.log(`Response time: ${registerRes.timings.duration}ms`);
  console.log(`Response body: ${registerRes.body}`);

  // Extract OTP from response (adjust if format changes) -> Commented as the OTP extraction logic is not implemented in the original code and 3rd party is used
  // const otpMatch = registerRes.body.match(/"otp"\s*:\s*"(\d{4})"/);
  // const otp = otpMatch ? otpMatch[1] : null;

  // if (!otp) {
  //   console.error(`OTP not found for phone ${phoneNumber}`);
  //   return;
  // }

  sleep(1); // Simulate delay

  // // Step 2: Verify OTP -> 
  // const verifyUrl = 'https://example.com';
  // const verifyPayload = JSON.stringify({
  //   otp: `${otp}`,
  //   phone: `${phoneNumber}`
  // });

  // const verifyRes = http.post(verifyUrl, verifyPayload, params);

  // check(verifyRes, {
  //   'verify status is 200': (r) => r.status === 200,
  //   'verify success': (r) => r.body.includes('success'),
  // });

  // console.log(`Status: ${registerRes.status}`);
  // console.log(`Verification time: ${registerRes.timings.duration}ms`);

  // console.log(`Phone: ${phoneNumber}, OTP: ${otp}, Login response: ${verifyRes.body}`);
  // sleep(1);
}
