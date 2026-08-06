const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await dbHelper.projects.find();
    return res.json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const project = { 
      ...req.body, 
      id: req.body.id || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`, 
      createdAt: new Date().toISOString() 
    };
    await dbHelper.projects.save(project.id, project);
    return res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update project (save deliverables, milestones, worker assignments, status, etc.)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await dbHelper.projects.save(id, req.body);
    return res.json({ success: true, project: req.body });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
