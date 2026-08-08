const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { db, admin } = require('./db');

const MOCK_DIR = process.env.VERCEL ? '/tmp' : __dirname;
const MOCK_AUDIT_PATH = path.join(MOCK_DIR, 'audit_logs.json');

// On Vercel, copy committed audit logs to /tmp on startup if they don't exist yet
if (process.env.VERCEL) {
  const sourceAudit = path.join(__dirname, 'audit_logs.json');
  if (fs.existsSync(sourceAudit) && !fs.existsSync(MOCK_AUDIT_PATH)) {
    try { fs.copyFileSync(sourceAudit, MOCK_AUDIT_PATH); } catch(e) {}
  }
}

// Memory-based Rate Limiter Store
const rateLimitStore = {};

const rateLimiter = (options) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const key = `${options.prefix || 'req'}:${ip}`;
    const now = Date.now();
    
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = { count: 1, resetTime: now + (options.windowMs || 60000) };
      return next();
    }
    
    const record = rateLimitStore[key];
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + (options.windowMs || 60000);
      return next();
    }
    
    record.count++;
    if (record.count > (options.max || 60)) {
      return res.status(429).json({
        success: false,
        message: options.message || 'Too many requests. Please try again later.'
      });
    }
    next();
  };
};

// Input validation helpers
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePassword = (password) => {
  return password && typeof password === 'string' && password.length >= 6;
};

// Custom XSS Sanitizer Middleware
const sanitizeValue = (val) => {
  if (typeof val !== 'string') return val;
  return val
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '') // Strip script tags
    .replace(/on\w+="[^"]*"/g, '')                     // Strip double quoted inline handlers
    .replace(/on\w+='[^']*'/g, '')                     // Strip single quoted inline handlers
    .replace(/javascript:[^\s]*/gi, '')                 // Strip javascript links
    .replace(/[<>]/g, (tag) => ({ '<': '&lt;', '>': '&gt;' }[tag] || tag)); // Escape HTML brackets
};

const xssSanitizer = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        req.body[key] = sanitizeValue(req.body[key]);
      }
    }
  }
  if (req.query) {
    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        req.query[key] = sanitizeValue(req.query[key]);
      }
    }
  }
  next();
};

// CSRF Double Submit Cookie Protection
const csrfInit = (req, res, next) => {
  let csrfToken = req.cookies.csrfToken;
  if (!csrfToken) {
    csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false, // Must be readable by frontend JavaScript to attach to headers
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }
  next();
};

const csrfCheck = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'] || (req.body && req.body._csrf);
  
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'Security validation failed: CSRF token mismatch or missing.'
    });
  }
  next();
};

// Write Audit Logs to Firestore with JSON File fallback
const writeAuditLog = async (userId, userEmail, action, details, req) => {
  const timestamp = new Date();
  const ip = req ? (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress) : 'SYSTEM';
  const entry = { timestamp, userId, userEmail, action, details, ip };
  
  console.log(`[AUDIT LOG] ${timestamp.toISOString()} | Action: ${action} | Email: ${userEmail || 'GUEST'} | IP: ${ip}`);

  if (db) {
    try {
      await db.collection('audit_logs').add({
        timestamp: timestamp,
        userId: userId || null,
        userEmail: userEmail || null,
        action: action || null,
        details: details || null,
        ip: ip || null
      });
    } catch (dbErr) {
      console.error('[AuditLog] Failed to write entry to Firestore:', dbErr.message);
    }
  }

  // Write to local file fallback (skipped gracefully on read-only filesystems like Vercel)
  try {
    const logs = fs.existsSync(MOCK_AUDIT_PATH) ? JSON.parse(fs.readFileSync(MOCK_AUDIT_PATH, 'utf8')) : [];
    logs.push(entry);
    // Keep last 1000 logs in file
    if (logs.length > 1000) logs.shift();
    fs.writeFileSync(MOCK_AUDIT_PATH, JSON.stringify(logs, null, 2));
  } catch (e) {
    // Silently skip on read-only filesystems (Vercel serverless)
  }
};

module.exports = {
  rateLimiter,
  validateEmail,
  validatePassword,
  xssSanitizer,
  csrfInit,
  csrfCheck,
  writeAuditLog
};
