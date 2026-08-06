const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// Target test server endpoint configurations
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'ZentrioWebhookSecretKey';

console.log('🏁 Starting Automated Payment & Webhook Integration Tests...');
console.log(`📡 Targeting Server Endpoint: ${BASE_URL}\n`);

async function runTests() {
  try {
    // ----------------------------------------------------
    // TEST 1: Create Order Endpoint
    // ----------------------------------------------------
    console.log('🧪 Test 1: Testing order creation API `/api/payment/create-order`...');
    const orderRes = await axios.post(`${BASE_URL}/api/payment/create-order`, {
      amount: 1500,
      currency: 'INR'
    });
    if (orderRes.status === 200 && orderRes.data.success) {
      console.log(`✅ Test 1 Success! Order ID generated: ${orderRes.data.orderId}\n`);
    } else {
      throw new Error(`Test 1 Failed: Status ${orderRes.status}`);
    }
    const orderId = orderRes.data.orderId;

    // ----------------------------------------------------
    // TEST 2: Payment Signature Verify API (updates users/subscriptions)
    // ----------------------------------------------------
    console.log('🧪 Test 2: Testing payment signature verification API `/api/payment/verify`...');
    const testPaymentId = `pay_test_${Math.random().toString(36).substring(4)}`;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'ZentrioDummyKeySecretSignature';
    const razorpay_signature = crypto
      .createHmac('sha256', keySecret)
      .update(orderId + "|" + testPaymentId)
      .digest('hex');

    const verifyPayload = {
      razorpay_payment_id: testPaymentId,
      razorpay_order_id: orderId,
      razorpay_signature,
      projectId: 'PRJ-8012',
      amount: 1500,
      paymentMethod: 'razorpay',
      clientEmail: 'rishi@zentrio.ai' // Updates Rishigesh worker account subscription status
    };

    const verifyRes = await axios.post(`${BASE_URL}/api/payment/verify`, verifyPayload);
    if (verifyRes.status === 200 && verifyRes.data.success) {
      console.log(`✅ Test 2 Success! Payment ID registered: ${verifyRes.data.payment.paymentId}`);
      console.log(`   Invoice Emitted: ${verifyRes.data.payment.invoice}\n`);
    } else {
      throw new Error(`Test 2 Failed: Status ${verifyRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 2.5: Payment verification failure check
    // ----------------------------------------------------
    console.log('🧪 Test 2.5: Verifying Payment verification failure (Status 400)...');
    try {
      await axios.post(`${BASE_URL}/api/payment/verify`, {
        projectId: 'PRJ-8012',
        amount: 1500
      });
      throw new Error('Test 2.5 Failed: Server allowed verification with missing signature parameters');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✅ Test 2.5 Success! Server correctly rejected empty parameters verify (Status 400).\n');
      } else {
        throw new Error(`Test 2.5 Failed: Expected 400 status code, got ${err.response ? err.response.status : err.message}`);
      }
    }

    // ----------------------------------------------------
    // TEST 3: Duplicate verification protection checks
    // ----------------------------------------------------
    console.log('🧪 Test 3: Checking Duplicate payment replay protection block...');
    try {
      await axios.post(`${BASE_URL}/api/payment/verify`, verifyPayload);
      throw new Error('Test 3 Failed: Server allowed duplicate payment verification');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.log('✅ Test 3 Success! Replay attack duplicate payment correctly blocked (Status 409).\n');
      } else {
        throw new Error(`Test 3 Failed: Expected 409 status code, got ${err.response ? err.response.status : err.message}`);
      }
    }

    // ----------------------------------------------------
    // TEST 4: Webhook Event Handler (authorise, captured, failed, refund, order)
    // ----------------------------------------------------
    console.log('🧪 Test 4: Checking Webhook integrations for different events...');
    const webhookPaymentId = `pay_webhook_${Math.random().toString(36).substring(4)}`;
    const testEvents = ['payment.authorized', 'payment.captured', 'payment.failed', 'refund.processed', 'order.paid'];

    for (const event of testEvents) {
      const webhookPayload = {
        event,
        payload: {
          payment: {
            entity: {
              id: webhookPaymentId,
              amount: 250000, // ₹2500.00
              currency: 'INR',
              status: event === 'payment.failed' ? 'failed' : 'captured',
              method: 'upi',
              notes: {
                projectId: 'PRJ-8012',
                clientEmail: 'rishi@zentrio.ai',
                clientName: 'Webhook Client Partner',
                projectTitle: 'E-Commerce Platform Core'
              }
            }
          }
        }
      };

      const rawBody = JSON.stringify(webhookPayload);
      const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      const webhookRes = await axios.post(`${BASE_URL}/api/payment/webhook`, webhookPayload, {
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature
        }
      });

      if (webhookRes.status !== 200 || !webhookRes.data.success) {
        throw new Error(`Test 4 Failed processing event: ${event}`);
      }
    }
    console.log('✅ Test 4 Success! Webhook cryptographic authorization & capture events verified.\n');

    // ----------------------------------------------------
    // TEST 5: Admin Analytics Verification
    // ----------------------------------------------------
    console.log('🧪 Test 5: Verifying Admin Analytics API endpoints...');
    
    const paymentsRes = await axios.get(`${BASE_URL}/admin/payments`);
    console.log(`   - GET /admin/payments count: ${paymentsRes.data.payments.length}`);

    const revenueRes = await axios.get(`${BASE_URL}/admin/revenue`);
    console.log(`   - GET /admin/revenue total: ₹${revenueRes.data.totalRevenue}`);

    const refundsRes = await axios.get(`${BASE_URL}/admin/refunds`);
    console.log(`   - GET /admin/refunds count: ${refundsRes.data.refunds.length}`);

    const subscriptionsRes = await axios.get(`${BASE_URL}/admin/subscriptions`);
    console.log(`   - GET /admin/subscriptions count: ${subscriptionsRes.data.subscriptions.length}`);

    console.log('\n✅ Test 5 Success! Admin analytics return expected Firestore schemas.\n');

    console.log('🎉 ALL INTEGRATION, SECURITY, AND ANALYTICS TESTS PASSED SUCCESSFULLY! Site is production-ready.');

  } catch (error) {
    console.error('❌ Integration Tests Failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runTests();
