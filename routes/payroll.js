const express = require('express');
const router = express.Router();
const { dbHelper } = require('../db');

// Get all payslips
router.get('/', async (req, res) => {
  try {
    const payslips = await dbHelper.payslips.find();
    return res.json({ success: true, payslips });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create payslip
router.post('/', async (req, res) => {
  try {
    const payslip = {
      ...req.body,
      id: req.body.id || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString()
    };
    await dbHelper.payslips.save(payslip.id, payslip);
    return res.json({ success: true, payslip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
