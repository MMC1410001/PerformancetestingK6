require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Handle the case when just "test" is passed as an argument
let folder = process.argv[2] || 'reports/test';               //process.argv[2]: The first actual argument passed to your script from cmd for folder location if any other than the defined one
if (folder === 'test') {
  folder = 'reports/test';
}

// Check if this is a success or failure notification
const isSuccess = process.argv[3] === 'success';

// For Gmail, you need to:
// 1. Enable 2-Step Verification in your Google account
// 2. Generate an App Password: https://myaccount.google.com/apppasswords
// 3. Use that App Password below instead of your regular password
// This Sets up an email transporter using the nodemailer library to send emails through Gmail's SMTP server.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ALERT_EMAIL_USER,
    pass: process.env.ALERT_EMAIL_PASS // This should be an App Password
  },
  // logger: true,
  // debug: true
});

// Verify connection configuration before sending
transporter.verify()
  .then(() => {
    console.log('✅ SMTP connection verified successfully');
    sendEmail();
  })
  .catch(err => {
    console.error('❌ SMTP verification failed:', err.message);
    process.exit(1);
  });

function sendEmail() {
  // Define files to attach
  const files = ['result.json', 'k6_log.txt', `${path.basename(folder)}_K6_summary_report.xlsx`, 'htmlReport.html'];
  
  // Define chart files to attach from charts subfolder
  const chartFiles = [`${path.basename(folder)}_response_time_summary.png`, `${path.basename(folder)}_checks_success_rate.png`];
  
  // Check if folder exists for results
  if (!fs.existsSync(folder)) {
    console.error(`❌ Folder not found: ${folder}`);
    console.log('Available files in current directory:', fs.readdirSync('.'));
    process.exit(1);
  }
  
  // Log which files we're looking for and where
  console.log(`Looking for files in: ${folder}`);
  console.log('Files in specified folder:', fs.readdirSync(folder));
  
  // Create attachments array with better error handling
  const attachments = [];
  for (const file of files) {
    const filePath = path.join(folder, file);
    if (fs.existsSync(filePath)) {
      try {
        attachments.push({
          filename: path.basename(filePath),
          content: fs.readFileSync(filePath)
        });
        console.log(`✅ Found and attached: ${filePath}`);
      } catch (err) {
        console.error(`❌ Error reading file ${filePath}:`, err.message);
      }
    } else {
      console.warn(`⚠️ File not found: ${filePath}`);
    }
  }
  
  // Add chart files from charts subfolder
  const chartsFolder = path.join(folder, 'charts');
  if (fs.existsSync(chartsFolder)) {
    console.log(`Looking for chart files in: ${chartsFolder}`);
    for (const chartFile of chartFiles) {
      const chartPath = path.join(chartsFolder, chartFile);
      if (fs.existsSync(chartPath)) {
        try {
          attachments.push({
            filename: path.basename(chartPath),
            content: fs.readFileSync(chartPath)
          });
          console.log(`✅ Found and attached chart: ${chartPath}`);
        } catch (err) {
          console.error(`❌ Error reading chart file ${chartPath}:`, err.message);
        }
      } else {
        console.warn(`⚠️ Chart file not found: ${chartPath}`);
      }
    }
  } else {
    console.warn(`⚠️ Charts folder not found: ${chartsFolder}`);
  }
  
  // Check if we have any attachments
  if (attachments.length === 0) {
    console.error('❌ No files found to attach. Email not sent.');
    process.exit(1);
  }

  // Set email subject and content based on success or failure
  const subject = isSuccess 
    ? 'K6 Test Completed Successfully - All Metrics Passed' 
    : 'K6 Test Failed or Crashed';
  
  const htmlContent = isSuccess
    ? `
      <h2>K6 Test Completed Successfully</h2>
      <p>All metrics have passed the thresholds.</p>
      <p>Logs, summary report, and performance charts are attached.</p>
    `
    : `
      <h2>K6 Test Encountered Issues</h2>
      <p>Logs, summary report, and performance charts are attached.</p>
      <p>Please review the attached files for more details.</p>
    `;

  const mailOptions = {
    from: `"K6 Alerts" <${process.env.ALERT_EMAIL_USER}>`,
    to: '<tester.ishere@gmail.com>, <isthere.tester2@gmail.in>',
    subject,
    html: htmlContent,
    attachments
  };

  // Use promise-based approach for better error handling
  transporter.sendMail(mailOptions)
    .then(info => {
      console.log('✅ Email sent:', info.response);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Email send failed:', err.message);
      if (err.message.includes('auth')) {
        console.log('Authentication error. Check your email credentials in .env file.');
        console.log('Make sure you are using an App Password for Gmail.');
      }
      process.exit(1);
    });
}