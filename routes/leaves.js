const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db');

// Get leaves
router.get('/', async (req, res) => {
  try {
    const leaves = await dbHelper.leaves.find();
    return res.json({ success: true, leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Submit leave
router.post('/', async (req, res) => {
  try {
    const leave = {
      ...req.body,
      id: req.body.id || `LEV-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    await dbHelper.leaves.save(leave.id, leave);
    return res.json({ success: true, leave });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update leave status (Approve/Reject)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbHelper.leaves.save(id, req.body);
    return res.json({ success: true, leave: req.body });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
