// This script is used to rename the first conversation in the chatbot system.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://example.com';

export const success_rate = new Rate('success_rate');
export const failure_rate = new Rate('failure_rate');
export const response_time = new Trend('response_time');
export const success_count = new Counter('success_count');
export const fail_count = new Counter('fail_count');

export const options = {
  vus: 1,
  duration: '1s',
  thresholds: {
    success_rate: ['rate>0.95'],
    'http_req_duration': ['p(95)<1000'],
  },
};

function isJsonResponse(res) {
  try {
    JSON.parse(res.body);
    return true;
  } catch (e) {
    return false;
  }
}

export default function () {
  // 1. Fetch the list of conversations from /bot/chat
  const chatListUrl = 'https://example.com';
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': '_ha=GA1.1.1354052788.1744707220; _fa_JPKL68jK0S7=GS2.1.s1847128392$o6$g0$t1747128392$j0$l0$h0; _ga_CXYH6MT6H4=GS2.1.s1747203109$o17$g1$t1747203291$j0$l0$h0; token=eyJhbGciOiJKUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6Ijg3NzkyOTY1MDAiLCJpYXQiOjE3NDczMDU4MTUsImV4cCI6MTc0NzQ3ODYxNX0.61vKjIDNKKxSa_kCh4V_6PnNqxFVkbl8vgPloXiub3E; _ha_JPKL68K0S7=GS2.1.s1747304152$o20$g1$t1747305858$j0$l0$h0; _dd_s=logs=1&id=2199a5f9-8cd1-4025-88a2-7337abea1f87&created=1747307331009&expire=1747308232040'
    },
    timeout: '10s',
  };

  const chatListRes = http.get(chatListUrl, params);

  const isChatListSuccess = check(chatListRes, {
    'GET /bot/chat status is 200': (r) => r.status === 200,
    'Valid JSON from /bot/chat': (r) => isJsonResponse(r),
  });

  if (!isChatListSuccess) {
    fail_count.add(1);
    failure_rate.add(1);
    console.error(`Invalid /bot/chat response: status=${chatListRes.status}, body=${chatListRes.body.substring(0, 100)}...`);
    sleep(1);
    return;
  }

  let conversationId, oldTitle;
  try {
    const chatListJson = chatListRes.json();
    if (
      chatListJson.message &&
      Array.isArray(chatListJson.message) &&
      chatListJson.message.length > 0 &&
      chatListJson.message[0].id &&
      chatListJson.message[0].title
    ) {
      conversationId = chatListJson.message[0].id;
      oldTitle = chatListJson.message[0].title;
    } else {
      throw new Error("No conversations found in response or first conversation is malformed");
    }
  } catch (e) {
    fail_count.add(1);
    failure_rate.add(1);
    console.error('Failed to parse conversation id/title from /bot/chat response: ' + e.message);
    console.error('Response body: ' + chatListRes.body.substring(0,200) + '...');
    sleep(1);
    return;
  }

  console.log(`Fetched first conversation id: ${conversationId}`);
  console.log(`Old title: ${oldTitle}`);

  // 2. Rename the conversation title dynamically
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
  const newTitle = `UpdatedResponseByCodeOn_${timestamp}`;

  const renameUrl = 'https://example.com';
  const renamePayload = JSON.stringify({
    id: conversationId,
    newTitle: newTitle,
  });

  const renameRes = http.post(renameUrl, renamePayload, params);

  let renameSuccess = false;
  let renameResponseJson = null;

  // Check response
  const isRenameSuccess = check(renameRes, {
    'POST /bot/rename-question status is 200': (r) => r.status === 200,
    'Valid JSON': (r) => isJsonResponse(r),
  });

  if (!isRenameSuccess) {
    fail_count.add(1);
    failure_rate.add(1);
    console.error(`Invalid response: status=${renameRes.status}, body=${renameRes.body.substring(0, 100)}...`);
    sleep(1);
    return;
  }

  try {
    renameResponseJson = renameRes.json();
    renameSuccess =
      renameResponseJson.updatedConversation &&
      renameResponseJson.updatedConversation.title === newTitle;
  } catch (e) {
    renameSuccess = false;
  }

  check(renameRes, {
    'Title updated': (r) => renameSuccess,
  });

  success_rate.add(renameSuccess);
  failure_rate.add(!renameSuccess);
  response_time.add(renameRes.timings.duration);

  if (renameSuccess) {
    success_count.add(1);
    console.log(`Successfully renamed conversation. New title: ${newTitle}`);
  } else {
    fail_count.add(1);
    console.error(
      `POST /bot/rename-question failed: status=${renameRes.status}, body=${renameRes.body.substring(0, 200)}...`
    );
  }

  sleep(1);
}

export function handleSummary(data) {
  const durationSec = data.state?.testRunDurationMs
    ? (data.state.testRunDurationMs / 1000).toFixed(2) + 's'
    : 'N/A';

  const maxVUs = data.metrics.vus_max?.values?.max || 'N/A';
  const successCount = data.metrics.success_count?.values?.count || 0;
  const failCount = data.metrics.fail_count?.values?.count || 0;
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] || 'N/A';

  const customSummary = `
  Rename Title Test Results:
  ==========================
  Total Successes: ${successCount}
  Total Failures: ${failCount}
  95th Percentile Response Time: ${p95} ms
  Maximum Virtual Users: ${maxVUs}
  Test Duration: ${durationSec}

  ${textSummary(data, { indent: ' ', enableColors: false })}
  `;

  return {
    stdout: customSummary
  };
}
