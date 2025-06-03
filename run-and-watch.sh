#!/bin/bash -> For linux and macos

echo "▶ Running K6 test..."
k6 run tests/test.js --summary-export=result.json --no-color > k6_log.txt
STATUS=$?

node generate-report.js

if [ $STATUS -ne 0 ]; then
  echo "❌ K6 failed. Sending email..."
  node alert-email.js
else
  echo "✅ K6 completed successfully."
fi
