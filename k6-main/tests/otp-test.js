import http from 'k6/http';
import { check, sleep } from 'k6';
import { parseJSON } from 'https://jslib.k6.io/json/1.0.0/index.js';

const otpData = parseJSON(open('./otp.json'));

export default function () {
  const verifyUrl = 'https://backend.project2.ai/auth/verify-otp';

  const payload = JSON.stringify({
    phone: otpData.phone,
    otp: otpData.otp
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(verifyUrl, payload, params);

  check(res, {
    'verify status is 200': (r) => r.status === 200,
    'OTP verified': (r) => r.body.includes('success'),
  });

  console.log(`Phone: ${otpData.phone}, OTP: ${otpData.otp}`);
  sleep(1);
}
