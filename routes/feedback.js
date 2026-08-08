const express = require('express');
const router = express.Router();
const { rateLimiter } = require('../security');
const { dbHelper } = require('../db');

const feedbackLimiter = rateLimiter({
  prefix: 'feedback',
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 15,
  message: 'Too many submissions. Please try again later.'
});

// Get all feedbacks
router.get('/', async (req, res) => {
  try {
    const feedbacks = await dbHelper.feedbacks.find();
    const sorted = [...feedbacks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, feedbacks: sorted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Post feedback
router.post('/', feedbackLimiter, async (req, res) => {
  try {
    const { name, email, rating, comment } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
    }

    const feedbackId = `FB-${Date.now()}`;
    const newFeedback = {
      id: feedbackId,
      name,
      email: email || 'Anonymous',
      rating: parseInt(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    await dbHelper.feedbacks.save(feedbackId, newFeedback);
    return res.status(200).json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit feedback. Please try again.' });
  }
});

module.exports = router;
