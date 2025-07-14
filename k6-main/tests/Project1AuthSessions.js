import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    'http_req_duration': ['p(95)<1000'],
    },
};

export default function () {
  const url = 'https://project1.project1.app/api/auth/session';

  const headers = {
    accept: '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
    'cookie': '__Host-next-auth.csrf-token=9089990997b024d8b79aaa32d6178fbb7b3c45c49088d32b0e491410c5f6cd6d%7Cda22ee3a49798666af14765feb0ac1baa774b6341baed6c8b3992e7ae5cb97da; __Secure-next-auth.callback-url=%2Fsearch; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..AfeZMF3WkNPu3sYo.BAGgYUn5pzeruifcmJKhbxZGF5gyulk7k8w9LlbWWhZMSRzZfVVbtlMmAchf8ac_a-WavXC6M4XBnpK6OvFnPRaGQ0O40Trrr1iShAcHaE9DEUGU_QvuyMrCs8taN3qvh3JtlHjW-zY3j1bKXdJA7SGuqeRyyOpwn6Qy8t8wUszCkVRvXnqs-xh4W3I1Xxb2khgg6XgidCSIrGo49LKXamoAWdDRRNlhOw3yEpXF1Z6A0bMn0FuhIk8xDMxPDg3jGnXxFlP6HhuXhaO58U97FWf4HeJNu8-lc9OHQYFV83fCv5_xfiQIT8q2kHU2ByXhUv0TdodFy_mX2YZUOrjMYhj29lOqoHboqcZ06STJNz72oY61jGnJWXUIJnBIN1z4.nntdqI9eEOgs_zfkmNCqDQ',
  };

  const res = http.get(url, { headers });

  // Parse JSON
  const json = res.json();

  // Validation checks
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
    'user name is correct': () => json.user?.name === 'Mayur Chaudhary',
    'user email is correct': () => json.user?.email === 'mayur.chaudhary@1finance.org.in',
    'user id exists': () => json.user?.id && json.user.id.length > 0,
    'expires date exists': () => json.expires !== undefined,
  });

  console.log(`Session Expires At: ${json.expires}`);
}
