import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js'; //This line imports a utility function named textSummary from an external K6 helper library hosted at: the link. textSummary() is a helper function provided by K6 that allows you to format test result data into a human-readable text summary, typically shown at the end of a test run. We'd use it in an handleSummary() function to customize the test summary output.

export const success_rate = new Rate('success_rate');
export const failure_rate = new Rate('failure_rate');
export const response_time = new Trend('response_time');
export const success_count = new Counter('success_count');
export const fail_count = new Counter('fail_count');

export const options = {
  vus: 1,
  iterations: 1, // Each iteration will attempt 1 delete
  thresholds: {
    success_rate: ['rate>0.95'], // For the delete operation
    'http_req_duration': ['p(95)<100'],
  },
};

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    'Cookie': '_ga=GA1.1.1354052788.1744707320; _ga_JPKL68jK0S7=GS2.1.s1747128392$o6$g0$t1747128392$j0$l0$h0; _ga_CXZH6MT6H4=GS2.1.s1747203109$o17$g1$t1747203291$j0$l0$h0; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZSI6Ijg3NzkyOTY1MDAiLCJpYXQiOjE3NDczMDU4MTUsImV4cCI6MTc0NzQ3ODYxNX0.61vKjIDNKKxSa_kCh4V_6PnNqxFVkbl8vgPloXiub3E; _ga_JPKL68K0S7=GS2.1.s1747309574$o21$g1$t1747309853$j0$l0$h0'
  };

  /*
  // --- SECTION COMMENTED OUT ---
  // 1. Create chatbot conversations/questions
  const messagesToCreate = ["Hi from k6", "Hello from k6"]; 
  const conversationIds = [];

  for (const message of messagesToCreate) {
    const createPayload = JSON.stringify({
      message: message, 
    });

    const createRes = http.post('https://backend.project2.ai/bot/chat', createPayload, { headers });

    let createdId = null;
    try {
      const responseBody = createRes.json();
      if (responseBody && responseBody.id) { 
        createdId = responseBody.id;
      } else if (responseBody && responseBody.message && responseBody.message.id) { 
         createdId = responseBody.message.id;
      } else if (responseBody && Array.isArray(responseBody.message) && responseBody.message.length > 0 && responseBody.message[0].id) {
         createdId = responseBody.message[0].id; 
      }
    } catch (e) {
      console.error(`Error parsing JSON from create response for "${message}": ${e}, body: ${createRes.body}`);
    }
    
    const isCreateSuccess = check(createRes, {
      [`create status for '${message}' is 200 or 201`]: (r) => r.status === 200 || r.status === 201, 
      [`create response for '${message}' has id`]: () => createdId !== null && createdId !== undefined,
    });

    success_rate.add(isCreateSuccess);
    failure_rate.add(!isCreateSuccess);
    response_time.add(createRes.timings.duration);

    if (isCreateSuccess && createdId) {
      success_count.add(1);
      conversationIds.push(createdId);
      console.log(`Created conversation, id: ${createdId} for message: "${message}"`);
    } else {
      fail_count.add(1);
      console.error(`Failed CREATE for message "${message}": status=${createRes.status}, body=${createRes.body}, parsedId: ${createdId}`);
    }
    sleep(1); 
  }

  if (conversationIds.length === 0) { 
    console.error("No conversations were created successfully (or no IDs captured). Skipping delete operations.");
    return; 
  }
  */
  // --- END OF COMMENTED OUT CREATE SECTION ---
  
  // 2. Delete a specific conversation
  // IMPORTANT: We MUST replace 'YOUR_CONVERSATION_ID_TO_DELETE_HERE' with an actual, existing conversation ID.
  // The script cannot automatically find the "first" or any other conversation without a confirmed API endpoint to list them.
  const conversationIdToDelete = 'e5720c61-7f93-41b0-90fe-df16250a97f9'; //Convo id to be deleted

  if (!conversationIdToDelete || conversationIdToDelete === 'YOUR_CONVERSATION_ID_TO_DELETE_HERE') {
    console.error("SCRIPT MODIFICATION NEEDED: The 'conversationIdToDelete' is set to a placeholder. Please edit project2DeleteConversation.js and replace 'YOUR_CONVERSATION_ID_TO_DELETE_HERE' with a valid 'id' of an existing conversation you want to delete. No delete attempt will be made with the placeholder.");
    // Mark this iteration's attempt as a failure if ID is not set
    success_rate.add(false);
    failure_rate.add(true);
    fail_count.add(1);
    response_time.add(0); // Add 0 to response time not to skew metrics if no actual request is made
    sleep(1); // Maintain iteration timing consistency
    return; // Stop this iteration
  }
  
  console.log(`Attempting to delete conversation, id: ${conversationIdToDelete}`);

  const deletePayload = JSON.stringify({
    id: conversationIdToDelete, // Using 'id' as per your initial info
  });

  // Delete endpoint as specified previously
  const deleteRes = http.del('https://backend.project2.ai/bot/delete-question', deletePayload, { headers });

  const isDeleteSuccess = check(deleteRes, {
    [`delete status for id '${conversationIdToDelete}' is 200 or 204`]: (r) => r.status === 200 || r.status === 204,
  });

  success_rate.add(isDeleteSuccess);
  failure_rate.add(!isDeleteSuccess);
  response_time.add(deleteRes.timings.duration);

  if (isDeleteSuccess) {
    success_count.add(1);
    console.log(`Successfully deleted conversation, id: ${conversationIdToDelete}`);
  } else {
    fail_count.add(1);
    console.error(`Failed DELETE for id ${conversationIdToDelete}: status=${deleteRes.status}, body=${deleteRes.body}`);
  }

  sleep(1);
}

export function handleSummary(data) {                                               //data: The test result data K6 provides after the test run.
  // This function formats the test results into a human-readable summary.
  // It will be called automatically at the end of the test run.
  // The 'data' parameter contains all the metrics and results from the test run.
  const success = data.metrics.success_count?.values?.count || 0;
  const failure = data.metrics.fail_count?.values?.count || 0;
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'] || 'N/A';
  const vus = data.metrics.vus_max?.values?.max || 'N/A';
  // Below code is used to safely compute and format the test duration (in seconds) from raw test result data in milliseconds.
  const duration = data.state?.testRunDurationMs //data.state?.testRunDurationMs -> Uses optional chaining (?.) to safely access testRunDurationMs from data.state. If data.state is undefined or null, it won't throw an error — it will just return undefined. testRunDurationMs is the total duration of the test run in milliseconds.
    ? (data.state.testRunDurationMs / 1000).toFixed(2) + 's' // Converts milliseconds to seconds and formats it to 2 decimal places. 's' adds the unit suffix (e.g., "12.34s")
    : 'N/A';                                                 // If testRunDurationMs is not available, it returns 'N/A' (Not Available) to indicate that the duration could not be computed.
  
  // The summary string is constructed using template literals for better readability.
  const summary = `
    Single Conversation Delete Test Results:
    ========================================
    Total Successful Deletes: ${success}
    Total Failed Deletes (or setup issues): ${failure}
    95th Percentile Response Time (Delete Request): ${p95} ms
    Maximum Virtual Users: ${vus}
    Test Duration: ${duration}

    Note: If 'Total Failed Deletes' is > 0 and no delete attempt was logged, 
    ensure 'conversationIdToDelete' in the script is set to a valid ID.

    ${textSummary(data, { indent: ' ', enableColors: false })} //textSummary(data, options): Formats that data into clean, readable text. indent: Controls indentation. enableColors: Adds color to the terminal output (if supported).
  `;

  return {
    stdout: summary,
  };
}
