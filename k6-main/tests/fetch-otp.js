const { Client } = require('pg');
const fs = require('fs');

async function fetchOTP() {
  const { phone, otptype } = JSON.parse(fs.readFileSync('phone.json', 'utf8'));

  const client = new Client({
    user: 'project1Dev',
    host: 'project1-dqu-db-instance-1.cm3wf490d0pn.ap-south-1.rds.amazonaws.com',
    database: 'postgres',
    password: 'nAppDdem4ovtZcUHTHwp',
    port: 5432,
  });

  await client.connect();

  const res = await client.query(`
    SELECT otp FROM public."Otp"
    WHERE mobile = $1 AND "Otptype" = $2
    ORDER BY "createdAt" DESC
    LIMIT 1
  `, [phone, otptype]);

  await client.end();

  const otp = res.rows[0]?.otp || null;

  fs.writeFileSync('otp.json', JSON.stringify({ phone, otp }));
}

fetchOTP();
