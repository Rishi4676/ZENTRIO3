/**
 * Zentrio Telegram Notification AI Agent
 * 100% Free Unlimited Notification Dispatcher for Admins
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send Telegram Alert to Admin
 * @param {string} message - HTML/Markdown formatted message
 */
async function sendTelegramAlert(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('ℹ️ Telegram Notification Agent: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured in .env (Skipping Telegram push)');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    const data = await res.json();
    if (data.ok) {
      console.log('🚀 [Telegram Agent] Notification sent to Admin Telegram chat successfully.');
      return true;
    } else {
      console.warn('⚠️ [Telegram Agent] Alert warning:', data.description);
      return false;
    }
  } catch (err) {
    console.error('❌ [Telegram Agent] Error dispatching Telegram alert:', err.message);
    return false;
  }
}

/**
 * Pre-formatted Event Trigger Dispatchers
 */
async function notifyNewClientSignup({ name, email, companyName, provider = 'Email' }) {
  const msg = `🚨 <b>NEW CLIENT SIGNUP</b> 🚨\n\n` +
              `👤 <b>Name:</b> ${name}\n` +
              `📧 <b>Email:</b> ${email}\n` +
              `🏢 <b>Company:</b> ${companyName || 'N/A'}\n` +
              `🔐 <b>Method:</b> ${provider}\n` +
              `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
  return await sendTelegramAlert(msg);
}

async function notifyNewLeadInquiry({ name, email, phone, service, message }) {
  const msg = `📥 <b>NEW CLIENT LEAD CAPTURED</b> 📥\n\n` +
              `👤 <b>Name:</b> ${name}\n` +
              `📧 <b>Email:</b> ${email}\n` +
              `📞 <b>Phone:</b> ${phone || 'N/A'}\n` +
              `💼 <b>Service Requested:</b> ${service || 'General Inquiry'}\n` +
              `💬 <b>Message:</b> ${message || 'N/A'}\n\n` +
              `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
  return await sendTelegramAlert(msg);
}

async function notifyPaymentReceived({ clientName, amount, projectId, paymentId }) {
  const msg = `💰 <b>PAYMENT RECEIVED</b> 💰\n\n` +
              `👤 <b>Client:</b> ${clientName}\n` +
              `💵 <b>Amount:</b> ₹${amount.toLocaleString()}\n` +
              `📁 <b>Project ID:</b> ${projectId}\n` +
              `💳 <b>Payment ID:</b> ${paymentId}\n` +
              `⏰ <b>Time:</b> ${new Date().toLocaleString()}`;
  return await sendTelegramAlert(msg);
}

module.exports = {
  sendTelegramAlert,
  notifyNewClientSignup,
  notifyNewLeadInquiry,
  notifyPaymentReceived
};
