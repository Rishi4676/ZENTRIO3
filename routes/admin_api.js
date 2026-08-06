const express = require('express');
const router = express.Router();
const { db, dbHelper } = require('../db');

// ----------------------------------------------------
// API 1: /admin/payments
// ----------------------------------------------------
router.get('/admin/payments', async (req, res) => {
  try {
    let payments = [];
    if (db) {
      const snapshot = await db.collection('payments').get();
      payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      // Fallback
      payments = await dbHelper.payments.find();
    }
    return res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error('❌ [Admin API Error] GET /admin/payments failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// API 2: /admin/revenue
// ----------------------------------------------------
router.get('/admin/revenue', async (req, res) => {
  try {
    let payments = [];
    if (db) {
      const snapshot = await db.collection('payments').get();
      payments = snapshot.docs.map(doc => doc.data());
    } else {
      payments = await dbHelper.payments.find();
    }
    
    // Sum only success status payments
    const totalRevenue = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return res.json({ success: true, totalRevenue });
  } catch (error) {
    console.error('❌ [Admin API Error] GET /admin/revenue failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// API 3: /admin/refunds
// ----------------------------------------------------
router.get('/admin/refunds', async (req, res) => {
  try {
    let payments = [];
    if (db) {
      const snapshot = await db.collection('payments').get();
      payments = snapshot.docs.map(doc => doc.data());
    } else {
      payments = await dbHelper.payments.find();
    }
    
    // Filter refunded payments
    const refunds = payments.filter(p => p.status === 'refunded' || p.status === 'refund');
    
    return res.json({ 
      success: true, 
      count: refunds.length, 
      refunds 
    });
  } catch (error) {
    console.error('❌ [Admin API Error] GET /admin/refunds failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ----------------------------------------------------
// API 4: /admin/subscriptions
// ----------------------------------------------------
router.get('/admin/subscriptions', async (req, res) => {
  try {
    let users = [];
    if (db) {
      const snapshot = await db.collection('users').get();
      users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      users = await dbHelper.users.find();
    }
    
    // Filter active subscriptions
    const activeSubscriptions = users.filter(u => u.subscription && u.subscription.status === 'active');
    
    return res.json({ 
      success: true, 
      count: activeSubscriptions.length, 
      subscriptions: activeSubscriptions 
    });
  } catch (error) {
    console.error('❌ [Admin API Error] GET /admin/subscriptions failed:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
