require('dotenv').config(); // Trigger sync reboot
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { xssSanitizer, csrfInit } = require('./security');
const { initializeFirestoreSync } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firestore Sync (only when not running on Vercel serverless to avoid cold-start timeouts)
if (!process.env.VERCEL) {
  initializeFirestoreSync().catch(err => {
    console.error('❌ Failed to run initial Firestore sync:', err.message);
  });
}

// Production HTTPS enforcement
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Secure HTTP Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// API endpoints Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many operations. Please wait a short while and try again.' }
});
app.use('/api/', apiLimiter);

// Parse JSON request payloads and capture rawBody buffer for signatures verify checks
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.url} | HasTokenCookie: ${!!(req.cookies && req.cookies.token)}`);
  next();
});
app.use(xssSanitizer);
app.use(csrfInit);

// Static Files - serve with production caching headers to boost load speeds and avoid roundtrip jank
const cacheControlOptions = {
  maxAge: '1d',
  etag: true,
  lastModified: true
};
app.use('/css', express.static(path.join(__dirname, 'css'), cacheControlOptions));
app.use('/js', express.static(path.join(__dirname, 'js'), cacheControlOptions));
app.use('/assets', express.static(path.join(__dirname, 'assets'), { ...cacheControlOptions, maxAge: '7d' }));
app.use('/admin', express.static(path.join(__dirname, 'admin0', 'dist'), cacheControlOptions));
app.use('/portal', express.static(path.join(__dirname, 'portal-login', 'dist'), cacheControlOptions));
app.use('/publicity', express.static(path.join(__dirname, 'publicity'), cacheControlOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), cacheControlOptions));
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos'), cacheControlOptions));
app.use('/public/videos', express.static(path.join(__dirname, 'public', 'videos'), cacheControlOptions));


// Mount API Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/email', require('./routes/email'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/payment', require('./routes/payment_api'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/subscribe', require('./routes/subscribe'));
app.use('/', require('./routes/admin_api'));

app.get('/background%20video.mp4', (req, res) => {
  res.sendFile(path.join(__dirname, 'background video.mp4'));
});
app.get('/background-video.mp4', (req, res) => {
  res.sendFile(path.join(__dirname, 'background video.mp4'));
});
app.get('/videos/background-video.mp4', (req, res) => {
  res.sendFile(path.join(__dirname, 'background video.mp4'));
});
app.get('/assets/videos/background-video.mp4', (req, res) => {
  res.sendFile(path.join(__dirname, 'background video.mp4'));
});

// Static Logo/Asset Endpoints
app.get('/logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'LOGOO.png'));
});
app.get('/LOGO.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'LOGOO.png'));
});
app.get('/LOGOO.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'LOGOO.png'));
});
app.get('/syed.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'syed.jpg'));
});
app.get('/rishi.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'assets', 'rishi.png'));
});

// Page Routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'project.html'));
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'feedback.html'));
});

app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, 'pricing.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/login', (req, res) => {
  res.redirect('/portal/');
});

app.get('/signup', (req, res) => {
  res.redirect('/portal/');
});

app.get('/preview-bg', (req, res) => {
  res.sendFile(path.join(__dirname, 'preview-bg.html'));
});

// Admin SPA Fallback
app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin0', 'dist', 'index.html'));
});

// Portal Login SPA Fallback (serves client-login, worker-login, admin-login, register, portal-selector)
app.get('/portal*', (req, res) => {
  res.sendFile(path.join(__dirname, 'portal-login', 'dist', 'index.html'));
});


// Wildcard Redirect fallback
app.get('*', (req, res) => {
  res.redirect('/');
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`❌ [RUNTIME ERROR] ${req.method} ${req.path}
  Stack Trace: ${err.stack || err}
  Query: ${JSON.stringify(req.query)}
  Body: ${JSON.stringify(req.body)}`);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error occurred.' 
      : err.message || 'Unknown error'
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Zentrio AI Startup Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
