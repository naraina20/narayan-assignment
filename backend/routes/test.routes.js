const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/sendEmail');

router.post('/send-test-email', async (req, res) => {
  const { to } = req.body;

  try {
    await sendEmail({
      to,
      subject: '🚀 Test Email from MyApp',
      html: `<p>This is a <strong>test email</strong> to confirm your email setup is working!</p>`
    });

    res.status(200).json({ message: '✅ Test email sent successfully!' });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ message: '❌ Failed to send test email' });
  }
});

module.exports = router;
