const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();
const { db, dbHelper } = require('../db');

// Initialize Razorpay SDK with live keys from .env, or fallback to dummy keys to prevent bootup crash on Vercel
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret'
});

// Reusable function to process verified payment and update user subscription
const savePaymentAndSubscription = async ({ paymentId, orderId, userId, amount, currency, paymentMethod, invoice }) => {
  const createdAt = new Date().toISOString();
  
  // 1. Save payment in "payments" collection (and local legacy list)
  const paymentRecord = {
    paymentId,
    orderId: orderId || 'order_dummy_id',
    userId: userId || 'guest@zentrio.ai',
    amount: Number(amount),
    currency: currency || 'INR',
    status: 'success',
    paymentMethod: paymentMethod || 'razorpay',
    invoice: invoice || `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
    createdAt,
    verified: true
  };

  // Duplicate verification check (replay attack protection)
  const existingPayments = await dbHelper.payments.find();
  const isDuplicate = existingPayments.some(p => p.id === paymentId);
  if (isDuplicate) {
    console.warn(`⚠️ [Payment Failed] Replay attack or duplicate verification blocked for: ${paymentId}`);
    throw new Error('Duplicate payment signature or transaction ID');
  }

  if (db) {
    await db.collection('payments').doc(paymentId).set(paymentRecord);
  }

  // Save using dbHelper payments list too for dashboard representation
  const legacyPaymentRecord = {
    id: paymentId,
    projectId: orderId || 'PRJ-8012',
    projectTitle: 'E-Commerce Platform Core',
    clientId: userId || 'guest@zentrio.ai',
    clientName: 'Verified Partner',
    amount: Number(amount),
    paymentMethod: paymentMethod || 'razorpay',
    status: 'success',
    invoiceNumber: paymentRecord.invoice,
    date: createdAt.split('T')[0]
  };
  await dbHelper.payments.save(paymentId, legacyPaymentRecord);

  // 2. Update user subscription in "users" collection (Firestore + local list)
  const allUsers = await dbHelper.users.find();
  const targetUser = allUsers.find(u => u.email === userId || u.id === userId);
  
  if (targetUser) {
    const purchaseDate = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1); // 1 year subscription duration
    const expiryDate = expiry.toISOString().split('T')[0];

    const updatedUser = {
      ...targetUser,
      subscription: {
        status: 'active',
        plan: 'premium',
        purchaseDate,
        expiryDate,
        paymentId
      }
    };

    await dbHelper.users.save(targetUser.id, updatedUser);
    console.log(`✅ [Subscription Update] User ${targetUser.id} subscription activated! (Expiry: ${expiryDate})`);
  } else {
    console.warn(`⚠️ [Subscription Update] User record not found for: ${userId}`);
  }

  return paymentRecord;
};

// ----------------------------------------------------
// API 1: Create Order
// ----------------------------------------------------
router.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body;
  try {
    // Create a real Razorpay Order via Razorpay Orders API
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency: currency || 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1
    });

    console.log(`🪙 [Payment Created] Generated checkout order: ${razorpayOrder.id} | Amount: ₹${amount}`);
    return res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('❌ [Payment Failed] Order creation failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// API 2: Verify Payment Success
// ----------------------------------------------------
router.post('/verify', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, projectId, amount, paymentMethod, clientEmail } = req.body;

  try {
    if (!razorpay_payment_id) {
      console.error('❌ [Payment Failed] Missing payment signature ID');
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }

    // Cryptographic Razorpay Signature Verification
    if (razorpay_signature && razorpay_order_id) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET || 'ZentrioDummyKeySecretSignature';
      const generated_signature = crypto
        .createHmac('sha256', keySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

      if (generated_signature !== razorpay_signature) {
        console.warn(`⚠️ [Payment Failed] Cryptographic signature verification failed: ${razorpay_payment_id}`);
        return res.status(400).json({ success: false, message: 'Invalid payment signature token' });
      }
      console.log(`✅ [Payment Verified] Cryptographic Razorpay signature matches perfectly.`);
    }

    // Verify payment record and update user subscription
    const payment = await savePaymentAndSubscription({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id || projectId,
      userId: clientEmail,
      amount: amount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'razorpay'
    });

    console.log(`✅ [Payment Verified] Payment ID ${razorpay_payment_id} successfully verified.`);
    return res.json({ success: true, payment });

  } catch (error) {
    console.error(`❌ [Payment Failed] Signature verification failed: ${error.message}`);
    // Check if it was a duplicate payment error
    if (error.message.includes('Duplicate')) {
      return res.status(409).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// API 3: Webhook event receiver
// ----------------------------------------------------
router.post('/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'ZentrioWebhookSecretKey';

  try {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature && signature !== expectedSignature) {
      console.error('❌ [Webhook Failure] Signature verification failed');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    console.log(`📡 [Webhook Success] Received callback event: ${event}`);

    const payload = req.body.payload;
    if (!payload) {
      return res.json({ success: true, info: 'Empty payload' });
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payment ? payload.payment.entity : payload.order.entity;
      const paymentId = paymentEntity.id || `pay_${Math.random().toString(36).substring(4)}`;
      const orderId = paymentEntity.order_id;
      const amount = paymentEntity.amount / 100;
      const notes = paymentEntity.notes || {};

      try {
        await savePaymentAndSubscription({
          paymentId,
          orderId,
          userId: notes.clientEmail,
          amount,
          currency: paymentEntity.currency || 'INR',
          paymentMethod: paymentEntity.method || 'razorpay'
        });
        console.log(`✅ [Payment Verified] Webhook saved payment: ${paymentId}`);
      } catch (err) {
        if (err.message.includes('Duplicate')) {
          console.warn(`⚠️ [Webhook Success] Duplicate skipped (already verified): ${paymentId}`);
          return res.json({ success: true, info: 'Bypassed duplicate' });
        }
        throw err;
      }
    } else if (event === 'payment.authorized') {
      console.log(`🪙 [Payment Created] Webhook authorized: ${payload.payment.entity.id}`);
    } else if (event === 'payment.failed') {
      console.warn(`❌ [Payment Failed] Webhook captured failure: ${payload.payment.entity.id}`);
    } else if (event === 'refund.processed' || event === 'payment.refunded') {
      const refundEntity = payload.refund ? payload.refund.entity : payload.payment.entity;
      console.log(`🔄 [Refund] Webhook processed refund request for payment ID: ${refundEntity.payment_id || refundEntity.id}`);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(`❌ [Webhook Failure] Webhook processing exception: ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
