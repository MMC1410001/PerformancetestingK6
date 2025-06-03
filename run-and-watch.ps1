# This script runs the K6 test, generates a report, and sends an alert email if the test fails.
# Designed to be executed from PowerShell.

Write-Host "▶ Running K6 test..."
k6 run tests/test.js --summary-export=result.json --no-color > k6_log.txt
$exitCode = $LASTEXITCODE

node .\generate-report.js

if ($exitCode -ne 0) {
    Write-Host "❌ K6 test failed. Sending email..."
    node .\alert-email.js
} else {
    Write-Host "✅ K6 test passed."
}
