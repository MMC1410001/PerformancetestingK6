import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration
let url = 'https://project1.project1.app/api/chat';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<10000'],
  },
};

/**
 * Custom parser for the non-standard response format
 * The API returns a format that's not standard JSON, with lines like:
 * f:{"messageId":"msg-123"}
 * 0:"Hello "
 * e:{"finishReason":"stop","usage":{"promptTokens":1688,"completionTokens":10}}
 * 
 * This parser handles this format and returns a structured object.
 */
function parseCustomResponse(body) {
  const result = { _fullText: body };
  const lines = body.split('\n');
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const match = line.match(/^([^:]+):(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Try to parse JSON objects
      if (value.startsWith('{') && value.endsWith('}')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if parsing fails
        }
      }
      
      // Handle multiple values with the same key
      if (result[key]) {
        if (!Array.isArray(result[key])) {
          result[key] = [result[key]];
        }
        result[key].push(value);
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

export default function () {
  // Prepare the request payload
  const payload = JSON.stringify({
    id: "a0WgA26DDtBv",
    messages: [
      {
        role: "user",
        content: "Hi",
        parts: [
          {
            type: "text",
            text: "Hi"
          }
        ]
      }
    ],
    useFinanceAgent: "general",
    deepSearch: "deep"
  });

  const headers = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    // Include authentication cookies
    'Cookie': '__Host-next-auth.csrf-token=dd0616596c4cb02097805053f9f7457d033ed73cf4a1602c8826e1144b16d040%7C1421039ba5c04df4e452527d471796e7f4a8ed2dc544a6c5494236019ed720b5; __Secure-next-auth.callback-url=%2Fsearch; search-mode=true; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Vno-GXoPo4NG5WBd.BY2h0BmcQfzo36vjDhrZYG3NfZWNfduMssaAC0vw8VxH51F4AOIVzxoNvZtgc0pzF5njvsSBk_EIL__hwh_d1es-gYhICv3mwjfhot7Aem2IC3XdUEkNztiO5jhnHDXw1CCJ1djeEh6uMSiFqZv7cHayBWeUomnDWeCmcdCGgO5WwuBq_13TJoP8bRZdhPJBqpZo49TyEaE12d_SoG-nJGSwOQt0JuR4hN_KLroy-Gze7k8RfDk2tIHdFTF9hMYkmHiK8-P4YAHJM3R8CYd3DnYuYufvDEkGP18kHgBmegoHG95XI1uYqGHZZNk33WFHedYTdiRtmZ-6xng1V1lqg01gF5oDfQ9t1kx2zG4TpGA1lrzbXXUZLGj-MqZ8GxsP.j9uDTUPu-xJ-bPo_Ilx7UA'
  };

  try {
    // Send the request
    const res = http.post(url, payload, {
      headers,
      timeout: '10s',
    });

    // Log basic response info
    console.log(`Response received in ${res.timings.duration}ms`);
    console.log(`Status: ${res.status}`);
    
    // Basic checks that don't depend on response format
    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 5 seconds': (r) => r.timings.duration < 5000,
    });

    // Only perform content checks if we got a successful response
    if (res.status === 200) {
      // Use string matching on the raw response body for reliable checks
      // This avoids issues with the non-standard JSON format
      check(res, {
        'messageId exists': () => res.body.includes('messageId'),
        'contains Hello': () => res.body.includes('Hi') || res.body.includes('Hello'),
        'contains can': () => res.body.includes('can'),
        'contains help': () => res.body.includes('help'),
        'finishReason is stop': () => res.body.includes('"finishReason":"stop"'),
        'token usage exists': () => res.body.includes('promptTokens'),
      });
    }
  } catch (err) {
    console.error(`Request failed: ${err}`);
  }

  // Add a small sleep to prevent overwhelming the API
  sleep(0.5);
}