const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db');
const fs = require('fs');
const path = require('path');

const MOCK_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..');
const MOCK_AUDIT_PATH = path.join(MOCK_DIR, 'audit_logs.json');

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { db } = require('../db');
    if (db) {
      const snapshot = await db.collection('audit_logs').orderBy('timestamp', 'desc').limit(200).get();
      const logs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp) : new Date()
        };
      });
      return res.json({ success: true, logs });
    } else {
      const logs = fs.existsSync(MOCK_AUDIT_PATH) ? JSON.parse(fs.readFileSync(MOCK_AUDIT_PATH, 'utf8')) : [];
      const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 200);
      return res.json({ success: true, logs: sorted });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get all users (passwords omitted)
router.get('/', async (req, res) => {
  try {
    const dbUsers = await dbHelper.users.find();
    // Strip password field securely
    const users = dbUsers.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
