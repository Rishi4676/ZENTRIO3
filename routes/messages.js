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

module.exports = router;
