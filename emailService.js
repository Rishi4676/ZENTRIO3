const nodemailer = require('nodemailer');
require('dotenv').config();

const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const PUBLIC_DOMAIN = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : (process.env.PUBLIC_URL || APP_URL);

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  pool: true,
  maxConnections: 3,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER || 'zentriotechnology3@gmail.com',
    pass: process.env.EMAIL_PASS || ''
  }
});
if (!process.env.VERCEL) {
  transporter.verify((error, success) => {
    if (error) {
      console.warn(`⚠️ [EmailService] SMTP Transporter connection test failed: ${error.message}. (Server will start but emails may not send).`);
    } else {
      console.log('✅ [EmailService] SMTP Transporter ready to dispatch mail.');
    }
  });
}

const ADMIN_EMAIL = process.env.EMAIL_USER || 'zentriotechnology3@gmail.com';
const FROM_SENDER = process.env.RESEND_API_KEY 
  ? '"Zentrio AI Support" <onboarding@resend.dev>' 
  : `"Zentrio AI Operations" <${ADMIN_EMAIL}>`;

// Core send helper to prevent failures (e.g., handles Resend free tier email sandbox restrictions)
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: FROM_SENDER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo || ADMIN_EMAIL
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Email dispatched → ${options.to} | MsgID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`❌ [EmailService] Failed to send to ${options.to}: ${error.message}`);
    
    // Resend free-tier sandbox restriction: can only deliver to the verified account email.
    // Redirect a copy to admin with a clear banner so OTP / transactional content is not lost.
    if (process.env.RESEND_API_KEY && options.to !== ADMIN_EMAIL) {
      try {
        console.log(`⚠️  [EmailService] Resend sandbox restriction: rerouting copy to admin (${ADMIN_EMAIL}).`);
        console.log(`    ↳ Original recipient: ${options.to}`);
        console.log(`    ↳ Subject: ${options.subject}`);
        const sandboxOptions = {
          from: FROM_SENDER,
          to: ADMIN_EMAIL,
          replyTo: options.to,
          subject: `[Sandbox → ${options.to}] ${options.subject}`,
          text: `[SANDBOX REDIRECT]\nOriginal recipient: ${options.to}\n\n${options.text}`,
          html: `<div style="background:#1e1b4b;padding:16px;border-left:4px solid #f43f5e;color:#fca5a5;font-family:monospace;margin-bottom:20px;border-radius:6px;">` +
                `<strong>⚠️ Resend Sandbox Redirect</strong><br/>` +
                `This email was targeted to <strong>${options.to}</strong>.<br/>` +
                `Under Resend's free tier only your verified account email can receive mail.<br/>` +
                `<strong>To send to real users, upgrade your Resend plan.</strong>` +
                `</div>` + options.html
        };
        const info = await transporter.sendMail(sandboxOptions);
        console.log(`✅ [EmailService] Sandbox redirect copy sent to admin inbox (${ADMIN_EMAIL}).`);
        return { success: true, redirected: true, messageId: info.messageId };
      } catch (subError) {
        console.error(`❌ [EmailService] Sandbox redirect also failed: ${subError.message}`);
      }
    }
    return { success: false, error: error.message };
  }
};

// Base HTML Wrapper containing Dark Theme, Gradient Header, Spacing, and Branding
const wrapTemplate = (contentTitle, innerHtml) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${contentTitle}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #0A0A0A;
            color: #E2E8F0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #121212;
            border: 1px solid #1E293B;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          }
          .header-gradient {
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%);
            padding: 35px 30px;
            text-align: center;
            border-bottom: 1px solid #1E293B;
          }
          .header-logo {
            font-size: 24px;
            font-weight: 800;
            color: #FFFFFF;
            letter-spacing: -0.02em;
            text-decoration: none;
            display: inline-block;
          }
          .header-logo span {
            color: #00DFD8;
          }
          .body-content {
            padding: 40px 30px;
          }
          .body-title {
            font-size: 22px;
            font-weight: 700;
            color: #FFFFFF;
            margin-top: 0;
            margin-bottom: 20px;
          }
          .body-text {
            font-size: 15px;
            line-height: 1.6;
            color: #94A3B8;
            margin-bottom: 25px;
          }
          .badge-box {
            background-color: rgba(99, 102, 241, 0.08);
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
          }
          .badge-label {
            font-size: 11px;
            font-weight: 700;
            color: #6366F1;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
          }
          .badge-value {
            font-size: 16px;
            font-weight: 600;
            color: #FFFFFF;
          }
          .action-btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
            color: #FFFFFF !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            margin: 15px 0;
          }
          .footer-section {
            padding: 30px;
            border-top: 1px solid #1E293B;
            background-color: #0d0d0d;
            text-align: center;
          }
          .footer-text {
            font-size: 12px;
            color: #64748B;
            line-height: 1.5;
            margin-bottom: 15px;
          }
          .footer-links {
            margin-bottom: 15px;
          }
          .footer-links a {
            color: #6366F1;
            text-decoration: none;
            margin: 0 10px;
            font-size: 13px;
            font-weight: 500;
          }
          .footer-socials {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 10px;
          }
          .social-link {
            color: #475569;
            text-decoration: none;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .social-link:hover {
            color: #6366F1;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header-gradient" style="text-align: center; padding: 30px; background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #311042 100%); border-bottom: 2px solid #6366F1;">
            <div style="display: inline-flex; align-items: center; justify-content: center; gap: 12px;">
              <img src="${PUBLIC_DOMAIN}/LOGOO.png" alt="Zentrio Logo" style="width: 44 h-auto; max-height: 44px; vertical-align: middle;" />
              <a href="${PUBLIC_DOMAIN}" class="header-logo" style="font-size: 26px; font-weight: 900; color: #FFFFFF; font-family: 'Inter', sans-serif; letter-spacing: -0.03em; text-decoration: none; text-transform: uppercase;">
                ZENTRIO<span style="color: #6366F1; text-shadow: 0 0 12px rgba(99, 102, 241, 0.6);">.AI</span>
              </a>
            </div>
          </div>
          <div class="body-content">
            ${innerHtml}
          </div>
          <div class="footer-section">
            <div class="footer-links">
              <a href="${PUBLIC_DOMAIN}/#solutions">blueprints</a>
              <a href="${PUBLIC_DOMAIN}/#pricing">pricing</a>
              <a href="${PUBLIC_DOMAIN}/#contact">team directory</a>
            </div>
            <div class="footer-text">
              &copy; 2026 Zentrio AI Technology. All rights reserved.<br>
              Zentrio Tech Park, Cyber City, Phase III, Chennai, Tamil Nadu 600001<br>
              Have questions? Reach our developer operations desk at <a href="mailto:zentriotechnology3@gmail.com" style="color:#6366F1; font-weight: 600;">zentriotechnology3@gmail.com</a>.
            </div>
            <div class="footer-socials">
              <a href="https://github.com/Rishi4676/ZENTRIO3" class="social-link" target="_blank">github</a>
              <a href="${PUBLIC_DOMAIN}" class="social-link" target="_blank">linkedin</a>
              <a href="${PUBLIC_DOMAIN}" class="social-link" target="_blank">x-twitter</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// 1. sendWelcomeEmail()
const sendWelcomeEmail = async (to, name, clientData = {}) => {
  const subject = 'Registration Successful - Welcome to Zentrio Technology';
  const text = `Hello ${name},\n\nRegistration Successful! Welcome to Zentrio AI! Your client developer workspace has been created successfully.\nMobile: ${clientData.mobile || 'N/A'}\nLog in at: ${PUBLIC_DOMAIN}/portal/client-login`;
  
  const innerHtml = `
    <h1 class="body-title">Registration Successful</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">We are excited to welcome you to the Zentrio AI engineering ecosystem. Your registration was completed successfully, and your workspace account is now active.</p>
    
    <div class="badge-box">
      <div class="badge-label">Account Privilege</div>
      <div class="badge-value">Verified Client Hub Access</div>
      <div style="margin-top:10px; font-size:13px; color:#CBD5E1;">
        <strong>Registered Mobile:</strong> ${clientData.mobile || 'N/A'}<br>
        <strong>Client ID:</strong> ${clientData.clientId || clientData.companyName || to}
      </div>
    </div>

    <p class="body-text">You can now submit project blueprints, approve engineering estimates, download deliverables, and interact directly with your assigned engineering team.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${PUBLIC_DOMAIN}/portal/client-login" class="action-btn">Enter Client Hub</a>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// 2. sendVerificationOTPEmail()
const sendVerificationOTPEmail = async (to, name, otpCode) => {
  const subject = `Zentrio AI — Verification Code: ${otpCode}`;
  const text = `Hello ${name},\n\nYour one-time verification code is: ${otpCode}\n\nThis code is valid for 10 minutes. If you did not request this code, please ignore this email.`;
  
  const innerHtml = `
    <h1 class="body-title">Verification Required</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">To establish your secure client workspace, please verify your email address using the one-time verification code below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; background-color: rgba(99, 102, 241, 0.06); border: 2px dashed #6366F1; border-radius: 12px; padding: 18px 40px; font-size: 28px; font-weight: 800; letter-spacing: 0.25em; color: #FFFFFF; font-family: monospace;">
        ${otpCode}
      </div>
    </div>

    <div class="badge-box" style="margin-top:20px;">
      <div class="badge-label">Security Note</div>
      <div class="badge-value" style="font-size:12px; color:#94A3B8;">This verification code is valid for exactly <strong>10 minutes</strong>. Never share this code with anyone.</div>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// 3. sendPasswordResetEmail()
const sendPasswordResetEmail = async (to, name, resetUrl) => {
  const subject = 'Reset Your Zentrio Session Password';
  const text = `Hello ${name},\n\nYou requested a password reset. Reset your password at: ${resetUrl}\n\nThis link is valid for 15 minutes.`;
  
  const innerHtml = `
    <h1 class="body-title">Password Reset Request</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">A session password reset was requested for your Zentrio AI developer account. Click the button below to specify a new password:</p>
    
    <div style="text-align: center; margin: 35px 0;">
      <a href="${resetUrl}" class="action-btn">Reset My Password</a>
    </div>

    <div class="badge-box">
      <div class="badge-label">Expirations</div>
      <div class="badge-value" style="font-size:12px; color:#94A3B8;">For security reasons, this reset link will expire in <strong>15 minutes</strong>. If you did not initiate this request, you can safely ignore this email.</div>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// 4. sendAccountApprovedEmail()
const sendAccountApprovedEmail = async (to, name) => {
  const subject = 'Your Worker Account has been Approved';
  const text = `Hello ${name},\n\nYour Worker account has been approved by the Zentrio Admin. Log in at: ${APP_URL}/portal/worker-login`;
  
  const innerHtml = `
    <h1 class="body-title">Worker Account Approved</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">We are pleased to inform you that your engineering/developer account credentials have been verified and approved by the Zentrio administration desk.</p>
    
    <div class="badge-box">
      <div class="badge-label">Assigned Privilege</div>
      <div class="badge-value">Worker Terminal Console</div>
    </div>

    <p class="body-text">You can now access your assigned task lists, record workspace attendance logs, and upload completed deliverable repositories.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/portal/worker-login" class="action-btn">Open Worker Terminal</a>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// 5. sendProjectAssignedEmail()
const sendProjectAssignedEmail = async (to, name, projectName, clientName, deadline) => {
  const subject = `New Project Assignment: ${projectName}`;
  const text = `Hello ${name},\n\nYou have been assigned to project: "${projectName}".\nClient: ${clientName}\nDeadline: ${deadline}`;
  
  const innerHtml = `
    <h1 class="body-title">New Project Assignment</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">You have been assigned as a developer to the following active workspace project:</p>
    
    <div class="badge-box">
      <div style="margin-bottom: 12px;">
        <div class="badge-label">Project Name</div>
        <div class="badge-value" style="font-size:18px; color:#6366F1;">${projectName}</div>
      </div>
      <div style="margin-bottom: 12px;">
        <div class="badge-label">Assigned Client</div>
        <div class="badge-value">${clientName}</div>
      </div>
      <div>
        <div class="badge-label">Delivery Deadline</div>
        <div class="badge-value" style="color:#EC4899;">${deadline}</div>
      </div>
    </div>

    <p class="body-text">Please review the project parameters, check ticket files, and sync with your co-workers in the internal chat.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/portal/worker-login" class="action-btn">View Assigned Tasks</a>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// 6. sendProjectCompletedEmail()
const sendProjectCompletedEmail = async (to, name, projectName) => {
  const subject = `Project Completed: ${projectName}`;
  const text = `Hello ${name},\n\nWe are happy to notify you that project "${projectName}" has been marked as Completed!`;
  
  const innerHtml = `
    <h1 class="body-title">Project Pipeline Completed</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">We are delighted to report that the development pipeline for your project has been successfully completed, tested, and marked ready for delivery.</p>
    
    <div class="badge-box">
      <div class="badge-label">Project Completed</div>
      <div class="badge-value" style="color:#10B981;">${projectName}</div>
    </div>

    <p class="body-text">You can now access your dashboard to view the project reports, inspect commit logs, and download all associated deliverables.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/portal/client-login" class="action-btn">Inspect Deliverables</a>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// 7. sendAccountRejectedEmail()
const sendAccountRejectedEmail = async (to, name) => {
  const subject = 'Worker Account Status Update';
  const text = `Hello ${name},\n\nWe regret to inform you that your worker account registration could not be approved at this time.`;
  
  const innerHtml = `
    <h1 class="body-title">Worker Account Application Status</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">We regret to inform you that your registration application for worker/engineer privileges could not be approved at this time.</p>
    
    <div class="badge-box" style="border-color: rgba(239, 68, 68, 0.2); background-color: rgba(239, 68, 68, 0.04);">
      <div class="badge-label" style="color:#EF4444;">Status</div>
      <div class="badge-value" style="color:#EF4444;">Application Declined</div>
    </div>

    <p class="body-text">If you believe this is an error or have questions about credentials compliance, please contact our support desk.</p>
  `;
  
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// 8. sendAdminNotification()
const sendAdminNotification = async (subject, text, htmlContent) => {
  const defaultHtml = `<h1 class="body-title">Admin Alert Notification</h1><p class="body-text">${text}</p>`;
  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `[Zentrio Admin Alert] ${subject}`,
    text,
    html: wrapTemplate(subject, htmlContent || defaultHtml)
  });
};

// Additional Transactional Templates

// A. sendProjectRequestNotification
const sendProjectRequestNotification = async (to, name, projectName) => {
  const subject = 'Zentrio AI: Project Request Received';
  const text = `Hello ${name},\n\nWe have received your project request for "${projectName}". Our team will review it shortly.`;
  const innerHtml = `
    <h1 class="body-title">Project Request Logged</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">Your new project request has been successfully submitted and entered into our engineering triage queue.</p>
    
    <div class="badge-box">
      <div class="badge-label">Project Title</div>
      <div class="badge-value">${projectName}</div>
    </div>

    <p class="body-text">An AI Lead Engineer will analyze your technical specifications and prepare a formal modular quotation shortly.</p>
  `;
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// B. sendQuotationNotification
const sendQuotationNotification = async (to, name, projectName, amount) => {
  const subject = 'Zentrio AI: Quotation Ready for Approval';
  const text = `Hello ${name},\n\nA quotation of ₹${amount} is ready for your project "${projectName}".`;
  const innerHtml = `
    <h1 class="body-title">Quotation Ready</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">Our engineering team has analyzed your specifications and uploaded a new budget estimate for your review:</p>
    
    <div class="badge-box">
      <div style="margin-bottom:10px;">
        <div class="badge-label">Target Project</div>
        <div class="badge-value">${projectName}</div>
      </div>
      <div>
        <div class="badge-label">Total Quotation Amount</div>
        <div class="badge-value" style="color:#00DFD8; font-size:20px;">₹${amount}</div>
      </div>
    </div>

    <p class="body-text">Please log in to your developer console to inspect the milestone breakdown and approve or reject the quotation.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/portal/client-login" class="action-btn">Review Quotation</a>
    </div>
  `;
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// C. sendInvoiceNotification
const sendInvoiceNotification = async (to, name, invoiceId, amount, dueDate) => {
  const subject = `Zentrio AI: Invoice Generated [${invoiceId}]`;
  const text = `Hello ${name},\n\nA new invoice ${invoiceId} has been generated for ₹${amount}. Due: ${dueDate}`;
  const innerHtml = `
    <h1 class="body-title">Invoice Generated</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">A new payment invoice has been generated for your active development workspace:</p>
    
    <div class="badge-box">
      <div style="margin-bottom:10px;">
        <div class="badge-label">Invoice Reference</div>
        <div class="badge-value">${invoiceId}</div>
      </div>
      <div style="margin-bottom:10px;">
        <div class="badge-label">Amount Due</div>
        <div class="badge-value" style="color:#00DFD8; font-size:18px;">₹${amount}</div>
      </div>
      <div>
        <div class="badge-label">Payment Due Date</div>
        <div class="badge-value" style="color:#EC4899;">${dueDate}</div>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}/portal/client-login" class="action-btn">Pay Invoice Online</a>
    </div>
  `;
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

// 9. sendContactInquiryToAdmin
const sendContactInquiryToAdmin = async (details) => {
  const subject = `[Website Inquiry] ${details.subject || 'New Contact Request'} - ${details.name}`;
  const text = `Name: ${details.name}\nEmail: ${details.email}\nPhone: ${details.phone || 'N/A'}\nCompany: ${details.company || 'N/A'}\nTime: ${details.submissionTime}\nIP: ${details.ip}\n\nMessage:\n${details.message}`;
  
  const innerHtml = `
    <h1 class="body-title">Inbound Website Inquiry</h1>
    <div class="badge-box">
      <div style="margin-bottom:8px;"><span class="badge-label">Name:</span> <span style="color:#FFF;">${details.name}</span></div>
      <div style="margin-bottom:8px;"><span class="badge-label">Email:</span> <a href="mailto:${details.email}" style="color:#6366F1;">${details.email}</a></div>
      <div style="margin-bottom:8px;"><span class="badge-label">Phone:</span> <span style="color:#FFF;">${details.phone || 'N/A'}</span></div>
      <div style="margin-bottom:8px;"><span class="badge-label">Company:</span> <span style="color:#FFF;">${details.company || 'N/A'}</span></div>
      <div style="margin-bottom:8px;"><span class="badge-label">Time:</span> <span style="color:#FFF;">${details.submissionTime}</span></div>
      <div><span class="badge-label">IP:</span> <span style="color:#FFF;">${details.ip}</span></div>
    </div>
    
    <p class="body-text" style="color:#FFF; font-weight:600; margin-bottom:10px;">Message Body:</p>
    <div style="background-color:rgba(255,255,255,0.03); border:1px solid #1E293B; padding:15px; border-radius:8px; font-style:italic; line-height:1.6; color:#E2E8F0; white-space:pre-wrap;">${details.message}</div>
  `;
  
  return sendEmail({
    to: ADMIN_EMAIL,
    subject,
    text,
    html: wrapTemplate(subject, innerHtml),
    replyTo: details.email
  });
};

// 10. sendContactConfirmationToCustomer
const sendContactConfirmationToCustomer = async (to, name) => {
  const subject = 'Thank You for Contacting Zentrio Technology';
  const text = `Hello ${name},\n\nThank you for reaching out to Zentrio AI. We have received your inquiry and our team will get back to you within 24 hours.\n\nConnect with us:\n💬 WhatsApp: https://chat.whatsapp.com/E5S9aCFY4vj0fglz8874Yj\n📸 Instagram: https://instagram.com/zentrio3\n📧 Email: zentriotechnology3@gmail.com`;
  
  const innerHtml = `
    <h1 class="body-title">Inquiry Logged Successfully</h1>
    <p class="body-text">Hello <strong>${name}</strong>,</p>
    <p class="body-text">Thank you for contacting Zentrio AI. We have successfully received your inquiry and logged it into our developer dashboard.</p>
    <div class="badge-box">
      <div class="badge-label">Response Commitment</div>
      <div class="badge-value">Within 24 Hours</div>
    </div>
    <p class="body-text">An engineer or account representative is currently reviewing your message and will reply to you directly at this email address.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${APP_URL}" class="action-btn">Visit Our Website</a>
    </div>
    <div style="margin: 28px 0 0; padding: 20px 24px; background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 12px;">
      <p style="margin: 0 0 14px; color: #a0a0b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;">Connect With Us</p>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding: 0 6px 0 0; width: 25%;"><a href="https://chat.whatsapp.com/E5S9aCFY4vj0fglz8874Yj" target="_blank" style="display:block;text-decoration:none;text-align:center;padding:10px 6px;background:rgba(37,211,102,0.1);border:1px solid rgba(37,211,102,0.25);border-radius:10px;"><div style="font-size:18px;margin-bottom:4px;">💬</div><div style="color:#25d366;font-size:11px;font-weight:700;">WhatsApp</div></a></td>
          <td style="padding: 0 6px; width: 25%;"><a href="https://instagram.com/zentrio3" target="_blank" style="display:block;text-decoration:none;text-align:center;padding:10px 6px;background:rgba(225,48,108,0.1);border:1px solid rgba(225,48,108,0.25);border-radius:10px;"><div style="font-size:18px;margin-bottom:4px;">📸</div><div style="color:#e1306c;font-size:11px;font-weight:700;">Instagram</div></a></td>
          <td style="padding: 0 6px; width: 25%;"><a href="#" target="_blank" style="display:block;text-decoration:none;text-align:center;padding:10px 6px;background:rgba(255,0,0,0.1);border:1px solid rgba(255,0,0,0.25);border-radius:10px;"><div style="font-size:18px;margin-bottom:4px;">▶️</div><div style="color:#ff0000;font-size:11px;font-weight:700;">YouTube</div></a></td>
          <td style="padding: 0 0 0 6px; width: 25%;"><a href="mailto:zentriotechnology3@gmail.com" style="display:block;text-decoration:none;text-align:center;padding:10px 6px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:10px;"><div style="font-size:18px;margin-bottom:4px;">📧</div><div style="color:#6366f1;font-size:11px;font-weight:700;">Email</div></a></td>
        </tr>
        <tr>
          <td style="padding: 10px 6px 0 0; width: 25%;"><a href="#" target="_blank" style="display:block;text-decoration:none;text-align:center;padding:10px 6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;"><div style="font-size:18px;margin-bottom:4px;">𝕏</div><div style="color:#ffffff;font-size:11px;font-weight:700;">X / Twitter</div></a></td>
          <td style="padding: 10px 6px 0; width: 25%;"><a href="#" target="_blank" style="display:block;text-decoration:none;text-align:center;padding:10px 6px;background:rgba(10,102,194,0.1);border:1px solid rgba(10,102,194,0.25);border-radius:10px;"><div style="font-size:18px;margin-bottom:4px;">💼</div><div style="color:#0a66c2;font-size:11px;font-weight:700;">LinkedIn</div></a></td>
          <td style="padding: 10px 6px 0; width: 25%;"><a href="#" target="_blank" style="display:block;text-decoration:none;text-align:center;padding:10px 6px;background:rgba(88,101,242,0.1);border:1px solid rgba(88,101,242,0.25);border-radius:10px;"><div style="font-size:18px;margin-bottom:4px;">🎮</div><div style="color:#5865f2;font-size:11px;font-weight:700;">Discord</div></a></td>
          <td style="padding: 10px 0 0 6px; width: 25%;"><a href="#" target="_blank" style="display:block;text-decoration:none;text-align:center;padding:10px 6px;background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.25);border-radius:10px;"><div style="font-size:18px;margin-bottom:4px;">🔴</div><div style="color:#ff4500;font-size:11px;font-weight:700;">Reddit</div></a></td>
        </tr>
      </table>
    </div>
  `;
  
  return sendEmail({ to, subject, text, html: wrapTemplate(subject, innerHtml) });
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationOTPEmail,
  sendPasswordResetEmail,
  sendAccountApprovedEmail,
  sendProjectAssignedEmail,
  sendProjectCompletedEmail,
  sendAccountRejectedEmail,
  sendAdminNotification,
  sendProjectRequestNotification,
  sendQuotationNotification,
  sendInvoiceNotification,
  sendContactInquiryToAdmin,
  sendContactConfirmationToCustomer,
  sendSubscribeWelcomeEmail
};

// ─── Subscribe Welcome Email ─────────────────────────────────────────────────
async function sendSubscribeWelcomeEmail(toEmail) {
  const subject = '🎉 Welcome to Zentrio — You\'re In!';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Zentrio</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#111118;border-radius:16px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#00dfd8 100%);padding:36px 32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">ZENTRIO</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:0.04em;">AI Engineering &amp; Solutions</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="margin:0 0 12px;color:#ffffff;font-size:22px;font-weight:700;">You're now subscribed! 🚀</h2>
              <p style="margin:0 0 24px;color:#a0a0b8;font-size:15px;line-height:1.7;">
                Thank you for joining the Zentrio community. You'll receive our quarterly engineering releases, AI insights, and product updates directly in your inbox.
              </p>
              <p style="margin:0 0 28px;color:#a0a0b8;font-size:15px;line-height:1.7;">
                In the meantime, connect with us across our community channels:
              </p>

              <!-- Community Links -->
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- WhatsApp -->
                <tr>
                  <td style="padding:0 0 14px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.25);border-radius:12px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right:14px;vertical-align:middle;">
                                <div style="width:40px;height:40px;background:rgba(37,211,102,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;text-align:center;line-height:40px;font-size:20px;">💬</div>
                              </td>
                              <td style="vertical-align:middle;">
                                <p style="margin:0 0 2px;color:#25d366;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">WhatsApp Community</p>
                                <a href="https://chat.whatsapp.com/E5S9aCFY4vj0fglz8874Yj" style="color:#ffffff;font-size:14px;text-decoration:none;word-break:break-all;">Join our WhatsApp Group →</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Instagram -->
                <tr>
                  <td style="padding:0 0 14px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(225,48,108,0.08);border:1px solid rgba(225,48,108,0.25);border-radius:12px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right:14px;vertical-align:middle;">
                                <div style="width:40px;height:40px;background:rgba(225,48,108,0.15);border-radius:50%;text-align:center;line-height:40px;font-size:20px;">📸</div>
                              </td>
                              <td style="vertical-align:middle;">
                                <p style="margin:0 0 2px;color:#e1306c;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Instagram</p>
                                <a href="https://instagram.com/zentrio3" style="color:#ffffff;font-size:14px;text-decoration:none;">@zentrio3 →</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Gmail -->
                <tr>
                  <td style="padding:0 0 0 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.25);border-radius:12px;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-right:14px;vertical-align:middle;">
                                <div style="width:40px;height:40px;background:rgba(99,102,241,0.15);border-radius:50%;text-align:center;line-height:40px;font-size:20px;">📧</div>
                              </td>
                              <td style="vertical-align:middle;">
                                <p style="margin:0 0 2px;color:#6366f1;font-size:13px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Email Us</p>
                                <a href="mailto:zentriotechnology3@gmail.com" style="color:#ffffff;font-size:14px;text-decoration:none;">zentriotechnology3@gmail.com →</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;color:#555570;font-size:12px;line-height:1.6;">
                © 2026 Zentrio AI Corp. · You're receiving this because you subscribed at zentrio.in<br/>
                <a href="mailto:zentriotechnology3@gmail.com" style="color:#6366f1;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Welcome to Zentrio!\n\nThank you for subscribing. Connect with us:\n\n💬 WhatsApp: https://chat.whatsapp.com/E5S9aCFY4vj0fglz8874Yj\n📸 Instagram: @zentrio3 — https://instagram.com/zentrio3\n📧 Email: zentriotechnology3@gmail.com\n\n© 2026 Zentrio AI Corp.`;

  return sendEmail({ to: toEmail, subject, html, text });
}

