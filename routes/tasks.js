const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await dbHelper.tasks.find();
    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const task = {
      ...req.body,
      id: req.body.id || `TSK-${Math.floor(100 + Math.random() * 900)}`
    };
    await dbHelper.tasks.save(task.id, task);
    return res.json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update task status / details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbHelper.tasks.save(id, req.body);
    return res.json({ success: true, task: req.body });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
