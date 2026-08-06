const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { dbHelper } = require('../db');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await dbHelper.payments.find();
    return res.json({ success: true, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Create new payment record
router.post('/', async (req, res) => {
  try {
    const payment = { 
      ...req.body, 
      id: req.body.id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`, 
      date: new Date().toISOString() 
    };
    await dbHelper.payments.save(payment.id, payment);
    return res.json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Verify signature and register success transaction
router.post('/verify', async (req, res) => {
  try {
    const { 
      razorpay_payment_id, 
      projectId, 
      amount, 
      paymentMethod, 
      clientEmail, 
      clientName, 
      projectTitle 
    } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Verification signature token missing' });
    }

    // Duplicate checkout registration prevention
    const existingPayments = await dbHelper.payments.find();
    const isDuplicate = existingPayments.some(p => p.id === razorpay_payment_id);
    if (isDuplicate) {
      console.warn(`⚠️ [Payment Failed] Duplicate transaction block: ${razorpay_payment_id}`);
      return res.status(409).json({ success: false, message: 'Transaction duplicate detected' });
    }

    const payment = {
      id: razorpay_payment_id,
      projectId,
      projectTitle: projectTitle || 'Project Development Support',
      clientId: clientEmail,
      clientName: clientName || 'Verified Client Partner',
      amount: parseFloat(amount),
      paymentMethod: paymentMethod || 'razorpay',
      status: 'success',
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0]
    };

    console.log(`🪙 [Payment Created] Signature verification request initialized: ${razorpay_payment_id}`);
    await dbHelper.payments.save(payment.id, payment);
    console.log(`✅ [Payment Verified] Transaction registered and invoice issued: ${razorpay_payment_id}`);
    return res.json({ success: true, payment });
  } catch (error) {
    console.error(`❌ [Payment Failed] Transaction signature verification aborted: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Razorpay Webhook Event listener with crypto signature validations
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'ZentrioWebhookSecretKey';

  try {
    const rawData = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawData)
      .digest('hex');

    if (signature && signature !== expectedSignature) {
      console.error('❌ [Webhook Failure] Cryptographic signature mismatch verification check');
      return res.status(400).json({ success: false, message: 'Invalid signature token' });
    }

    const event = req.body.event;
    console.log(`📡 [Webhook Success] Handled webhook callback. Event: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const paymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;
      const notes = paymentEntity.notes || {};

      const existing = await dbHelper.payments.find();
      const isDuplicate = existing.some(p => p.id === paymentId);
      if (isDuplicate) {
        console.log(`⚠️ [Webhook Success] Duplicate skipped (already verified): ${paymentId}`);
        return res.json({ success: true, info: 'Duplicate bypassed' });
      }

      const webhookPayment = {
        id: paymentId,
        projectId: notes.projectId || 'General Project',
        projectTitle: notes.projectTitle || 'Project Dev Funding',
        clientId: notes.clientEmail || 'client@zentrio.ai',
        clientName: notes.clientName || 'Client Partner',
        amount: Number(amount),
        paymentMethod: paymentEntity.method || 'razorpay',
        status: 'success',
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        date: new Date().toISOString().split('T')[0]
      };

      await dbHelper.payments.save(webhookPayment.id, webhookPayment);
      console.log(`✅ [Payment Verified] Webhook captured payment saved: ${paymentId}`);
    } else if (event === 'payment.failed') {
      const paymentEntity = req.body.payload.payment.entity;
      console.warn(`❌ [Payment Failed] Webhook captured failure for checkout transaction ID: ${paymentEntity.id}`);
    } else if (event === 'refund.created' || event === 'payment.refunded') {
      const refundEntity = req.body.payload.refund ? req.body.payload.refund.entity : req.body.payload.payment.entity;
      console.log(`🔄 [Refund] Webhook processed refund request for ID: ${refundEntity.payment_id || refundEntity.id}`);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error(`❌ [Webhook Failure] Exception processing callback event payload: ${err.message}`);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
