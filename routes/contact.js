const express = require('express');
const router = express.Router();
const emailService = require('../emailService');
const { validateEmail, rateLimiter } = require('../security');
const { dbHelper } = require('../db');

const contactLimiter = rateLimiter({
  prefix: 'contact',
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 15, // 15 requests per window
  message: 'Too many contact requests from this IP. Please try again after 15 minutes.'
});

// Get all contact enquiries
router.get('/', async (req, res) => {
  try {
    const enquiries = await dbHelper.enquiries.find();
    // Sort by createdAt descending
    const sorted = [...enquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, enquiries: sorted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Process contact form submissions
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const submissionTime = new Date().toLocaleString();
    const enquiryId = `ENQ-${Date.now()}`;

    const enquiryRecord = {
      id: enquiryId,
      name,
      email,
      phone: phone || 'N/A',
      company: company || 'N/A',
      subject: subject || 'N/A',
      message,
      ip,
      submissionTime,
      createdAt: new Date().toISOString()
    };

    // 1. Save validated enquiry to database BEFORE sending emails
    await dbHelper.enquiries.save(enquiryId, enquiryRecord);
    console.log(`[Contact Inquiry Saved] ID: ${enquiryId}, Name: ${name}, Email: ${email}`);

    const hasEmailConfig = process.env.RESEND_API_KEY || process.env.EMAIL_PASS;
    if (hasEmailConfig) {
      try {
        // Email #1: Send inquiry alert to admin
        await emailService.sendContactInquiryToAdmin({
          name,
          email,
          phone,
          company,
          subject,
          message,
          ip,
          submissionTime
        });

        // Email #2: Send confirmation email to customer
        await emailService.sendContactConfirmationToCustomer(email, name);

        return res.status(200).json({ 
          success: true, 
          message: 'Your inquiry has been sent successfully! A confirmation email has been dispatched.' 
        });
      } catch (emailErr) {
        // If email sending fails, log the failure and return appropriate response without losing the enquiry
        console.warn(`❌ [Contact Inquiry Email Failure] Saved enquiry ID: ${enquiryId} but emails failed to send: ${emailErr.message}`);
        return res.status(200).json({
          success: true,
          message: 'Inquiry received and saved successfully, but email confirmations failed to send.'
        });
      }
    } else {
      console.warn('Neither RESEND_API_KEY nor EMAIL_PASS configured in .env. Logging details to console.');
      return res.status(200).json({ 
        success: true, 
        message: 'Inquiry received and saved successfully! (Simulated email submission - configure RESEND_API_KEY in .env to send real emails).' 
      });
    }
  } catch (error) {
    console.error('Error saving or processing contact inquiry:', error);
    return res.status(500).json({ success: false, message: 'Failed to process enquiry. Please try again later.' });
  }
});

module.exports = router;
