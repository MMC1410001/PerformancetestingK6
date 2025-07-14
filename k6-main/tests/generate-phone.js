const fs = require('fs');

// Generate random phone number in range 8879200000 to 8879299999
const phoneNumber = 8879200000 + Math.floor(Math.random() * 10000);
const otpType = 'whatsapp'; // or 'login'

fs.writeFileSync('phone.json', JSON.stringify({
  phone: `${phoneNumber}`,
  otptype: otpType
}));
