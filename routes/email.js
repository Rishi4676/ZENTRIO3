const express = require('express');
const router = express.Router();
const emailService = require('../emailService');
const { csrfCheck } = require('../security');

// Dispatch email notifications
router.post('/notify', csrfCheck, async (req, res) => {
  try {
    const { type, to, name, params } = req.body;
    
    if (!type || !to) {
      return res.status(400).json({ success: false, message: 'Type and Recipient (to) are required.' });
    }
    
    let result = { success: false, error: 'Unrecognized notification type.' };
    
    switch (type) {
      case 'WELCOME_EMAIL':
        result = await emailService.sendWelcomeEmail(to, name || 'Valued Client');
        break;
      case 'PROJECT_ASSIGNED':
        result = await emailService.sendProjectAssignedEmail(to, name || 'Developer', params.projectName, params.clientName, params.deadline);
        break;
      case 'PROJECT_COMPLETED':
        result = await emailService.sendProjectCompletedEmail(to, name || 'Workspace User', params.projectName);
        break;
      case 'ACCOUNT_REJECTED':
        result = await emailService.sendAccountRejectedEmail(to, name || 'Workspace User');
        break;
      case 'ACCOUNT_APPROVED':
        result = await emailService.sendAccountApprovedEmail(to, name || 'Workspace User');
        break;
      case 'PROJECT_REQUEST':
        result = await emailService.sendProjectRequestNotification(to, name || 'Client', params.projectName);
        break;
      case 'QUOTATION_READY':
        result = await emailService.sendQuotationNotification(to, name || 'Client', params.projectName, params.amount);
        break;
      case 'INVOICE_GENERATED':
        result = await emailService.sendInvoiceNotification(to, name || 'Client', params.invoiceId, params.amount, params.dueDate);
        break;
      case 'ADMIN_NOTIFICATION':
        result = await emailService.sendAdminNotification(params.subject, params.text, params.html);
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid notification type.' });
    }
    
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Notification sent successfully.', messageId: result.messageId });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to send notification.', error: result.error });
    }
  } catch (error) {
    console.error('Notification API Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error processing notification.' });
  }
});

module.exports = router;
