const nodemailer = require('nodemailer');
require('dotenv').config();

const test = async () => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'zentriotechnology3@gmail.com',
      pass: process.env.EMAIL_PASS || 'sbizvwfljhawzqsa'
    }
  });

  console.log('Sending test email...');
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || 'zentriotechnology3@gmail.com',
      to: 'hxri106@gmail.com',
      subject: 'Test Email from Zentrio',
      text: 'This is a test email to verify the SMTP connection.',
      html: '<b>This is a test email to verify the SMTP connection.</b>'
    });
    console.log('✅ Email sent successfully:', info);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

test();
