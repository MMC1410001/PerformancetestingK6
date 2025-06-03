const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const { stopOnFailure, testFolder, outputFolder } = require('./config');

const execAsync = promisify(exec);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);

function thresholdsFailed(resultJson) {
  if (!resultJson || !resultJson.metrics) return false;
  return Object.values(resultJson.metrics).some(
    m => m.thresholds && Object.values(m.thresholds).some(t => !t.ok)
  );
}

async function runTestFile(testFile) {
  const testName = path.basename(testFile, '.js');
  const testDir = path.join(outputFolder, testName);
  await mkdir(testDir, { recursive: true });

  const resultPath = path.join(testDir, 'result.json');
  const logPath = path.join(testDir, 'k6_log.txt');

  console.log(`▶ Running ${testFile}...`);
  try {
    await execAsync(`k6 run ${testFile} --summary-export=${resultPath} --no-color > ${logPath}`);
    console.log(`✅ ${testFile} completed.`);
  } catch (err) {
    console.error(`❌ ${testFile} crashed: ${err.message}`);
    // Still continue to analyze result.json if it exists
  }

  // Generate report
  try {
    await execAsync(`node generate-report.js ${resultPath}`);
    console.log(`📊 Report generated for ${testName}`);
  } catch (err) {
    console.error(`⚠️ Report generation failed for ${testName}: ${err.message}`);
  }

  let resultJson = null;
  try {
    const raw = await readFile(resultPath, 'utf-8');
    resultJson = JSON.parse(raw);
  } catch {
    console.warn(`⚠️ Could not read result.json for ${testName}`);
  }

  if (thresholdsFailed(resultJson)) {
    console.warn(`📩 Threshold failure in ${testFile}, sending alert...`);
    try {
      // Pass the full path to the reports folder
      await execAsync(`node alert-email.js ${path.join(outputFolder, testName)}`);
      console.log(`✅ Alert email sent for ${testName}`);
    } catch (err) {
      console.error(`❌ Failed to send email for ${testName}: ${err.message}`);
    }

    if (stopOnFailure) {
      console.log('🛑 Stopping further execution due to failure.');
      process.exit(1);
    }
  } else {
    console.log(`✅ All thresholds passed for ${testFile}`);
  }
}

async function runAllTests() {
  const files = fs.readdirSync(testFolder)
    .filter(f => f.endsWith('.js'))
    .map(f => path.join(testFolder, f));

  for (const file of files) {
    await runTestFile(file);
  }

  console.log('🏁 All tests completed.');
}

runAllTests().catch(err => {
  console.error(`🔥 Unexpected error: ${err.message}`);
  process.exit(1);
});