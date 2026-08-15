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

// Reply to contact enquiry with project name context
router.post('/reply', async (req, res) => {
  try {
    const { email, recipientName, projectName, replyMessage } = req.body;
    if (!email || !replyMessage) {
      return res.status(400).json({ success: false, message: 'Email and reply message are required.' });
    }

    const subject = projectName 
      ? `Re: Inquiry Regarding Project [${projectName}] — Zentrio Technology` 
      : `Re: Your Inquiry to Zentrio AI Technology`;

    await emailService.sendEmail({
      to: email,
      subject,
      text: `Hello ${recipientName || 'Client'},\n\n${replyMessage}\n\nProject Context: ${projectName || 'General Inquiry'}\n\nBest Regards,\nZentrio AI Team`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 25px; border-radius: 16px; border: 1px solid #1e293b;">
          <h2 style="color: #6366f1; margin-top: 0;">Response to Your Inquiry</h2>
          <p style="font-size: 14px; color: #cbd5e1;">Hello <strong>${recipientName || 'Client'}</strong>,</p>
          ${projectName ? `<div style="background: rgba(99,102,241,0.1); border-left: 3px solid #6366f1; padding: 10px 14px; margin: 15px 0; border-radius: 6px; font-size: 13px;"><strong>Project Reference:</strong> ${projectName}</div>` : ''}
          <div style="background: #1e293b; padding: 18px; border-radius: 12px; font-size: 14px; line-height: 1.6; color: #f1f5f9; white-space: pre-wrap; margin: 20px 0;">${replyMessage}</div>
          <p style="font-size: 12px; color: #64748b; margin-top: 25px; border-top: 1px solid #1e293b; padding-top: 15px;">
            Sent by Zentrio AI Operations & Desk • <a href="mailto:zentriotechnology3@gmail.com" style="color: #6366f1;">zentriotechnology3@gmail.com</a>
          </p>
        </div>
      `
    });

    return res.json({ success: true, message: 'Reply sent successfully with project reference.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
