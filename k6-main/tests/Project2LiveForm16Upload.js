// This file checks the form 16 upload functionality of the project2 application.
import { group, sleep, check } from "k6";
import http from "k6/http";
import { Counter } from "k6/metrics";

const totalRequestCount = new Counter("total_requests");

export const options = {
  vus: 5,          // Number of virtual users to simulate    // Observation : Response time increases after 4 requests of form 16 upload
  duration: '1s',  // Total duration of the test
  // Fails after 16 requests of form 16 upload for ramp up testing
/*   stages: [
  { target: 1, duration: "5s" },
  { target: 2, duration: "10s" },
  { target: 0, duration: "10s" },
 ],
*/
  thresholds: {
    "http_req_failed": ["rate<0.01"],
  },
};

// Below code is used in K6 to load a binary file (like a PDF) into your script so you can send it in an HTTP request — such as for file upload tests.
const pdfBinary = open("./sample.pdf", "b");  // open() loads local file into function memory as a binary file. sample.pdf is the filepath. The "b" flag indicates that the file should be opened in binary mode, which is necessary for non-text files like PDFs.

export default function () {
  totalRequestCount.add(1);

  let uploadedFileUrl = "";

  // 1. Upload PDF File to project2
  group("1. Upload PDF to project2", function () {
    const formData = {
      file: http.file(pdfBinary, "sample.pdf", "application/pdf"),
      phoneNumber: "9779296600",
      isEncrypted: "true",
    };

    const uploadRes = http.post(
      "https://dev-backend.project2.ai/bot/upload-file",
      formData,
      {
        headers: {
          Origin: "https://dev.project2.ai",
          Referer: "https://dev.project2.ai/",
        },
        timeout: "30s",
      }
    );

    check(uploadRes, {
      "Upload status is 200": (res) => res.status === 200,
      "Upload response is JSON": (res) =>
        res.headers["Content-Type"].includes("application/json"),
    });

    let responseJson;
    try {
      responseJson = JSON.parse(uploadRes.body);
    } catch (e) {
      console.error("Failed to parse upload response as JSON:", uploadRes.body);
      return;
    }

    check(responseJson, {
      "Success is true": (json) => json.success === true,
      "Message is correct": (json) =>
        json.message === "File uploaded and added to Form16 successfully",
      "File URL is valid": (json) =>
        json.data && json.data.fileUrl.startsWith("https://"),
    });

    uploadedFileUrl = responseJson?.data?.fileUrl || "";  //This is a concise and safe way to extract the uploaded file URL from a JSON response — with a fallback in case the path doesn't exist. || "" is Fallback value: If fileUrl is missing or undefined, it assigns an empty string ("") instead. Prevents your code from breaking or passing undefined to another part of the script. responseJson is expected to be the parsed JSON object returned from an HTTP response. .data is the key under which your actual data lives. .fileUrl is the specific URL of the uploaded file.  Optional chaining ensures: If responseJson, data, or fileUrl is undefined or null, it won't throw an error — it just returns undefined.
    console.log("Uploaded file URL:", uploadedFileUrl);
  });

  // 2. Send file to project1 endpoint for tax extraction
  group("2. POST PDF to project1 Taxation", function () {
    const formData = {
      file: http.file(pdfBinary, "sample.pdf", "application/pdf"),
    };

    const taxRes = http.post(
      "https://taxation.project1.app/website/project2_form16",
      formData,
      {
        headers: {
          Origin: "https://dev.project2.ai",
          Referer: "https://dev.project2.ai/",
        },
        timeout: "30s",
      }
    );

    check(taxRes, {
      "project1 status is 200": (res) => res.status === 200,
      "project1 response is JSON": (res) =>
        res.headers["Content-Type"].includes("application/json"),
    });

    let taxJson;
    try {
      taxJson = JSON.parse(taxRes.body);
    } catch (e) {
      console.error("Failed to parse project1 response:", taxRes.body);
      return;
    }

    check(taxJson, {
      "Has employer name": (json) =>
        json.employer_name &&
        typeof json.employer_name === "string" &&
        json.employer_name.length > 0,
      "Includes TDS data": (json) =>
        Array.isArray(json.tds) && json.tds.length > 0,
      "Includes total salary": (json) =>
        json.total_amount_of_salary_recieved !== undefined,
    });

    console.log("Extracted employer:", taxJson.employer_name);
    console.log("Total TDS entries:", taxJson.tds?.length);
  });

  sleep(1);
}
