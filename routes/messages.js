const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db');

// Get all chat messages
router.get('/', async (req, res) => {
  try {
    const messages = await dbHelper.messages.find();
    return res.json({ success: true, messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create new chat message
router.post('/', async (req, res) => {
  try {
    const message = { 
      ...req.body, 
      id: req.body.id || `cht${Math.floor(1000 + Math.random() * 9000)}`, 
      timestamp: new Date().toISOString() 
    };
    await dbHelper.messages.save(message.id, message);
    return res.json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

let activeMeeting = null; // In-memory active meeting status: { platform: 'google'|'zoom'|'teams', url: string, startedAt: string, startedBy: string }

// GET current active team meeting
router.get('/meeting', (req, res) => {
  return res.json({ success: true, meeting: activeMeeting });
});

// POST start meeting (Admin only)
router.post('/meeting/start', (req, res) => {
  const { platform, url, startedBy } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'Meeting URL required' });
  }
  activeMeeting = {
    platform: platform || 'google',
    url,
    startedAt: new Date().toISOString(),
    startedBy: startedBy || 'Admin Owner'
  };
  return res.json({ success: true, meeting: activeMeeting });
});

// POST end meeting
router.post('/meeting/end', (req, res) => {
  activeMeeting = null;
  return res.json({ success: true, message: 'Meeting ended' });
});

module.exports = router;

