// To check if .env variables are being accessed from different file locations of the project
require('dotenv').config();
console.log('ALERT_EMAIL_USER:', process.env.ALERT_EMAIL_USER);
console.log('ALERT_EMAIL_PASS is set:', !!process.env.ALERT_EMAIL_PASS);