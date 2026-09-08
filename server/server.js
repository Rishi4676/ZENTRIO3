require('dotenv').config(); // Trigger sync reboot
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { xssSanitizer, csrfInit } = require('./middleware/security');
const { initializeFirestoreSync } = require('./database/db');

// Interop Helper to extract Express Router whether bundled as CJS or ESM
const getRouter = (mod) => {
  if (typeof mod === 'function') return mod;

  if (mod && typeof mod.default === 'function') {
    return mod.default;
  }

  if (
    mod &&
    mod.default &&
    typeof mod.default.default === 'function'
  ) {
    return mod.default.default;
  }

  return mod;
};

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firestore Sync (only when not running on Vercel serverless to avoid cold-start timeouts)
if (!process.env.VERCEL) {
  initializeFirestoreSync().catch(err => {
    console.error('❌ Failed to run initial Firestore sync:', err.message);
  });
} else {
  // Non-blocking async background sync on Vercel serverless
  setTimeout(() => {
    initializeFirestoreSync().catch(() => {});
  }, 10);
}

// Production HTTPS enforcement
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Global SEO & Search Indexing Response Headers
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'index, follow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
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
app.use('/css', express.static(path.join(__dirname, '..', 'apps', 'website', 'css'), cacheControlOptions));
app.use('/js', express.static(path.join(__dirname, '..', 'apps', 'website', 'js'), cacheControlOptions));
app.use('/assets', express.static(path.join(__dirname, '..', 'apps', 'website', 'assets'), { ...cacheControlOptions, maxAge: '7d' }));
app.use('/admin', express.static(path.join(__dirname, '..', 'apps', 'admin', 'dist'), cacheControlOptions));
app.use('/portal', express.static(path.join(__dirname, '..', 'apps', 'portal', 'dist'), cacheControlOptions));
app.use('/publicity', express.static(path.join(__dirname, '..', 'apps', 'website', 'publicity'), cacheControlOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), cacheControlOptions));
app.use('/videos', express.static(path.join(__dirname, '..', 'apps', 'website', 'public', 'videos'), cacheControlOptions));
app.use('/public/videos', express.static(path.join(__dirname, '..', 'apps', 'website', 'public', 'videos'), cacheControlOptions));
app.use(express.static(path.join(__dirname, '..', 'apps', 'website'), cacheControlOptions));


// Explicit Top-Level Route Imports using getRouter for CJS/ESM interop
const authRoutes = getRouter(require('./routes/auth'));
const projectsRoutes = getRouter(require('./routes/projects'));
const paymentsRoutes = getRouter(require('./routes/payments'));
const messagesRoutes = getRouter(require('./routes/messages'));
const emailRoutes = getRouter(require('./routes/email'));
const chatRoutes = getRouter(require('./routes/chat'));
const contactRoutes = getRouter(require('./routes/contact'));
const feedbackRoutes = getRouter(require('./routes/feedback'));
const usersRoutes = getRouter(require('./routes/users'));
const tasksRoutes = getRouter(require('./routes/tasks'));
const leavesRoutes = getRouter(require('./routes/leaves'));
const payrollRoutes = getRouter(require('./routes/payroll'));
const aiRoutes = getRouter(require('./routes/ai'));
const paymentApiRoutes = getRouter(require('./routes/payment_api'));
const uploadRoutes = getRouter(require('./routes/upload'));
const subscribeRoutes = getRouter(require('./routes/subscribe'));
const adminApiRoutes = getRouter(require('./routes/admin_api'));

// Mount API Routers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/payroll', payrollRoutes);

// SEO Dynamic Endpoints
const seoService = require('./services/seoService');

app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.send(seoService.generateSitemap());
});

app.get('/robots.txt', (req, res) => {
  res.header('Content-Type', 'text/plain');
  res.send(seoService.generateRobotsTxt());
});

// Static Logo/Asset Endpoints
app.get(['/logo.png', '/LOGO.png', '/LOGOO.png', '/portal/logo.png', '/portal/LOGOO.png', '/admin/logo.png', '/admin/LOGOO.png'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'assets', 'images', 'LOGOO.png'));
});
app.get(['/syed.jpg', '/portal/syed.jpg', '/admin/syed.jpg'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'assets', 'syed.jpg'));
});
app.get(['/rishi.png', '/portal/rishi.png', '/admin/rishi.png'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'assets', 'rishi.png'));
});
app.get(['/mobile_app.jpg', '/portal/mobile_app.jpg', '/admin/mobile_app.jpg'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'assets', 'mobile_app.jpg'));
});
app.get(['/background-video.mp4', '/portal/background-video.mp4', '/admin/background-video.mp4', '/videos/background-video.mp4', '/assets/videos/background-video.mp4'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'public', 'videos', 'background-video.mp4'));
});


app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentApiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/', adminApiRoutes);

// Page Routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'index.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'pages', 'project.html'));
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'pages', 'feedback.html'));
});

app.get('/pricing', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'pages', 'pricing.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'pages', 'contact.html'));
});

app.get(['/privacy-policy', '/privacy-policy.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'pages', 'privacy-policy.html'));
});

app.get(['/terms-of-service', '/terms-of-service.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'pages', 'terms-of-service.html'));
});

app.get(['/refund-policy', '/refund-policy.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'pages', 'refund-policy.html'));
});

app.get(['/login', '/signup', '/client-login', '/worker-login', '/admin-login', '/client-register', '/portal-selector', '/reset-password', '/verify-email'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'portal', 'dist', 'index.html'));
});

app.get('/preview-bg', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'website', 'pages', 'preview-bg.html'));
});

// Admin & Role Workspace SPA Fallback
app.get(['/admin*', '/client*', '/worker*'], (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'admin', 'dist', 'index.html'));
});

// Portal Login SPA Fallback (serves client-login, worker-login, admin-login, register, portal-selector)
app.get('/portal*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'apps', 'portal', 'dist', 'index.html'));
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
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zentrio AI Startup Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
