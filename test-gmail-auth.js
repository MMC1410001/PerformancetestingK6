// File created just to check if email credentials are actually working or not
require('dotenv').config();
const nodemailer = require('nodemailer');

// Create test account for verification
async function testAuth() {
  console.log('Testing Gmail authentication...');
  console.log(`Using email: ${process.env.ALERT_EMAIL_USER}`);
  
  // Create a test transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ALERT_EMAIL_USER,
      pass: process.env.ALERT_EMAIL_PASS
    }
  });
  
  // Verify connection
  try {
    const result = await transporter.verify();
    console.log('✅ Authentication successful!');
    return true;
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    console.log('\nPossible solutions:');
    console.log('1. Make sure you\'re using an App Password, not your regular password');
    console.log('2. Enable "Less secure app access" in your Google account settings');
    console.log('3. Check that your email and password are correct in the .env file');
    return false;
  }
}

testAuth();