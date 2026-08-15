const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { dbHelper } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'zentrio_jwt_secret_key_18273645';

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbHelper.users.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Session expired or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Project auth error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

// Get all projects scoped to the logged-in user's role and identity
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await dbHelper.projects.find();
    
    // Scoping/Isolation Logic
    let scopedProjects = [];
    const role = req.user.role || 'client';
    const email = (req.user.email || '').toLowerCase();
    const userId = (req.user.id || '').toLowerCase();

    if (role === 'admin' || role === 'admin_owner') {
      // Admins see all projects
      scopedProjects = projects;
    } else if (role === 'worker') {
      // Workers see only projects assigned to them
      scopedProjects = projects.filter(p => 
        (p.assignedWorkerId && p.assignedWorkerId.toLowerCase() === userId) ||
        (p.assignedWorkerName && p.assignedWorkerName.toLowerCase() === req.user.username.toLowerCase())
      );
    } else {
      // Clients see only projects they created or are assigned to them
      scopedProjects = projects.filter(p => 
        (p.clientId && p.clientId.toLowerCase() === email) ||
        (p.clientId && p.clientId.toLowerCase() === userId)
      );
    }

    return res.json({ success: true, projects: scopedProjects });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create new project for the authenticated client
router.post('/', authenticate, async (req, res) => {
  try {
    const role = req.user.role || 'client';
    
    // Construct new project object
    const project = { 
      ...req.body, 
      id: req.body.id || `PRJ-${Math.floor(1000 + Math.random() * 9000)}`, 
      clientId: req.user.email,
      clientName: req.user.username,
      clientCompany: req.user.companyName || 'Private client',
      status: 'pending',
      progress: 0,
      milestones: [
        { id: 'm_init', title: 'Project Proposal Review', status: 'pending' },
        { id: 'm_spec', title: 'Detailed Requirement Specification', status: 'pending' }
      ],
      deliverables: req.body.deliverables || [],
      createdAt: new Date().toISOString() 
    };

    await dbHelper.projects.save(project.id, project);
    return res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update project (save deliverables, milestones, worker assignments, status, etc.)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await dbHelper.projects.findOne('id', id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Check permission: Admins can update any, workers/clients can only update if it is their project
    const role = req.user.role || 'client';
    const email = (req.user.email || '').toLowerCase();
    const userId = (req.user.id || '').toLowerCase();
    
    if (role !== 'admin' && role !== 'admin_owner') {
      const isClientOwner = project.clientId && (project.clientId.toLowerCase() === email || project.clientId.toLowerCase() === userId);
      const isAssignedWorker = project.assignedWorkerId && project.assignedWorkerId.toLowerCase() === userId;
      
      if (!isClientOwner && !isAssignedWorker) {
        return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to update this project.' });
      }
    }
    
    const updatedProject = { ...project, ...req.body, id };
    await dbHelper.projects.save(id, updatedProject);
    return res.json({ success: true, project: updatedProject });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
