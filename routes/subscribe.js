const express = require('express');
const router = express.Router();
const emailService = require('../emailService');

// POST /api/subscribe
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const result = await emailService.sendSubscribeWelcomeEmail(email);

    if (result.success) {
      return res.status(200).json({ success: true, message: 'Subscribed! Check your inbox.' });
    } else {
      return res.status(500).json({ success: false, message: 'Could not send email. Please try again.' });
    }
  } catch (error) {
    console.error('Subscribe API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
