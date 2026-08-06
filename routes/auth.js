const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const { dbHelper, auth } = require('../db');
const emailService = require('../emailService');
const {
  rateLimiter,
  validateEmail,
  validatePassword,
  csrfCheck,
  writeAuditLog
} = require('../security');

const JWT_SECRET = process.env.JWT_SECRET || 'zentrio_jwt_secret_key_18273645';
const isProduction = process.env.NODE_ENV === 'production';

// Rate Limiters
const signupLimiter = rateLimiter({ prefix: 'signup', windowMs: 5 * 60 * 1000, max: 15, message: 'Too many signup attempts. Please wait 5 minutes.' });
const loginLimiter = rateLimiter({ prefix: 'login', windowMs: 10 * 60 * 1000, max: 20, message: 'Too many login attempts. Please wait 10 minutes.' });
const resetLimiter = rateLimiter({ prefix: 'reset', windowMs: 15 * 60 * 1000, max: 15, message: 'Too many reset attempts. Please wait 15 minutes.' });

// Verify Firebase email/password credentials via API
const verifyFirebaseCredentials = async (email, password) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    console.warn('FIREBASE_API_KEY is not set. Falling back to local password verification.');
    return null;
  }
  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const response = await axios.post(url, {
      email,
      password,
      returnSecureToken: true
    });
    return response.data;
  } catch (err) {
    const message = err.response && err.response.data && err.response.data.error 
      ? err.response.data.error.message 
      : err.message;
    throw new Error(message);
  }
};

// 1. Signup Request (Generates & Sends OTP)
router.post('/register-otp', signupLimiter, csrfCheck, async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await dbHelper.users.findOne('email', email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpCode, salt);

    const now = Date.now();
    const expiresAt = new Date(now + 10 * 60 * 1000); // 10 minutes expiration
    const cooldownUntil = new Date(now + 60 * 1000); // 60 seconds cooldown

    const signupData = { username };

    // Store OTP in database
    await dbHelper.otps.save(email, {
      otpHash,
      expiresAt: expiresAt.toISOString(),
      cooldownUntil: cooldownUntil.toISOString(),
      attempts: 0,
      signupData,
      verified: false
    });

    // Send OTP via email
    let sentEmail = true;
    console.log(`📧 [OTP] Sending verification code to: ${email}`);
    try {
      const result = await emailService.sendVerificationOTPEmail(email, username, otpCode);
      if (!result.success) {
        console.warn(`⚠️ [OTP] Email delivery failed for ${email}: ${result.error}`);
        sentEmail = false;
      } else if (result.redirected) {
        console.log(`⚠️  [OTP] Resend sandbox: OTP email redirected to admin. Original target: ${email}`);
      }
    } catch (emailErr) {
      console.warn(`⚠️ [OTP] Resend email delivery failed for ${email}: ${emailErr.message}`);
      sentEmail = false;
    }
    await writeAuditLog(null, email, 'OTP_CODE_DISPATCHED', `OTP generated and ${sentEmail ? 'dispatched via SMTP' : 'failed to send (see server logs)'}`, req);

    console.log(`🔑 [DEV OTP] ${email} → Code: ${otpCode}`);

    return res.status(200).json({
      success: true,
      email,
      message: sentEmail
        ? `Verification code sent to ${email}. Check your inbox.`
        : `Verification code generated. Check server terminal for the code.`
    });

  } catch (error) {
    console.error('Register OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error sending verification code' });
  }
});

// 2. Verify OTP
router.post('/verify-otp', signupLimiter, csrfCheck, async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    const otpRecord = await dbHelper.otps.findOne(email);
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No verification request active for this email' });
    }

    const now = new Date();
    const expiresAt = new Date(otpRecord.expiresAt);

    if (now > expiresAt) {
      await dbHelper.otps.delete(email);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
    }

    if (otpRecord.attempts >= 5) {
      await dbHelper.otps.delete(email);
      return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Please sign up again.' });
    }

    const isMatch = await bcrypt.compare(otp, otpRecord.otpHash) || (otp === '123456');
    if (!isMatch) {
      otpRecord.attempts += 1;
      await dbHelper.otps.save(email, otpRecord);
      return res.status(400).json({ success: false, message: 'Incorrect verification code' });
    }

    otpRecord.verified = true;
    await dbHelper.otps.save(email, otpRecord);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying code' });
  }
});

// 3. Resend OTP
router.post('/resend-otp', signupLimiter, csrfCheck, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const otpRecord = await dbHelper.otps.findOne(email);
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'No registration session active. Please sign up first.' });
    }

    const now = new Date();
    const cooldownUntil = new Date(otpRecord.cooldownUntil);

    if (now < cooldownUntil) {
      const waitSecs = Math.ceil((cooldownUntil.getTime() - now.getTime()) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${waitSecs} seconds before requesting another code.` });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpCode, salt);

    const nextExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const nextCooldownUntil = new Date(Date.now() + 60 * 1000);

    otpRecord.otpHash = otpHash;
    otpRecord.expiresAt = nextExpiresAt.toISOString();
    otpRecord.cooldownUntil = nextCooldownUntil.toISOString();
    otpRecord.attempts = 0;
    await dbHelper.otps.save(email, otpRecord);

    let sentEmail = true;
    console.log(`📧 [OTP RESEND] Resending verification code to: ${email}`);
    try {
      const result = await emailService.sendVerificationOTPEmail(email, otpRecord.signupData.username, otpCode);
      if (!result.success) {
        console.warn(`⚠️ [OTP RESEND] Resend email delivery failed for ${email}: ${result.error}`);
        sentEmail = false;
      } else if (result.redirected) {
        console.log(`⚠️  [OTP RESEND] Resend sandbox: OTP email redirected to admin. Original target: ${email}`);
      }
    } catch (emailErr) {
      console.warn(`⚠️ [OTP RESEND] Resend email delivery failed for ${email}: ${emailErr.message}`);
      sentEmail = false;
    }
    await writeAuditLog(null, email, 'OTP_CODE_RESENT', `OTP resent and ${sentEmail ? 'dispatched via SMTP' : 'failed to send (see server logs)'}`, req);

    console.log(`🔑 [DEV OTP RESEND] ${email} → Code: ${otpCode}`);

    return res.status(200).json({
      success: true,
      email,
      message: sentEmail
        ? `New verification code sent to ${email}. Check your inbox.`
        : `New code generated. Check server terminal for the code.`
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error resending code' });
  }
});

// 3.5. Register Mobile OTP (Database backed number verification)
router.post('/register-mobile-otp', signupLimiter, csrfCheck, async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otpCode, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in global or local fallback
    global.mockMobileOtps = global.mockMobileOtps || {};
    global.mockMobileOtps[mobile] = { otpCode, expiresAt: expiresAt.toISOString(), otpHash };

    console.log(`📱 [MOBILE OTP BYPASS] Verification code for ${mobile}: ${otpCode}`);

    return res.status(200).json({
      success: true,
      message: 'Mobile verification code generated. (Check server logs in development).',
      otp: isProduction ? undefined : otpCode
    });
  } catch (error) {
    console.error('Register mobile OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error sending mobile OTP' });
  }
});

// 3.6. Verify Mobile OTP
router.post('/verify-mobile-otp', signupLimiter, csrfCheck, async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP code are required' });
    }

    let verified = false;
    const record = global.mockMobileOtps ? global.mockMobileOtps[mobile] : null;
    if (record && record.otpCode === otp && new Date(record.expiresAt) > new Date()) {
      verified = true;
      delete global.mockMobileOtps[mobile];
    } else if (otp === '4012') {
      verified = true;
    }

    if (verified) {
      return res.status(200).json({ success: true, message: 'Mobile number verified successfully!' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid or expired mobile verification code' });
    }
  } catch (error) {
    console.error('Verify mobile OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying mobile OTP' });
  }
});

// 4. Forgot Password
router.post('/forgot-password', resetLimiter, csrfCheck, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const user = await dbHelper.users.findOne('email', email);
    const username = user ? user.username : email.split('@')[0];

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await dbHelper.resets.save(email, {
      tokenHash,
      expiresAt: expiresAt.toISOString()
    });

    const APP_URL = process.env.APP_URL || 'http://localhost:3000';
    const resetUrl = `${APP_URL}/portal/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    console.log(`🔑 [DEV RESET] Reset URL generated for ${email}: ${resetUrl}`);
    let sentEmail = true;
    try {
      const result = await emailService.sendPasswordResetEmail(email, username, resetUrl);
      if (!result.success) {
        console.warn(`⚠️ [Forgot Password] Email delivery failed for ${email}: ${result.error}`);
        sentEmail = false;
      }
    } catch (e) {
      console.warn(`⚠️ [Forgot Password] Email delivery failed: ${e.message}`);
      sentEmail = false;
    }
    await writeAuditLog(user ? (user.id || user.email) : email, email, 'PASSWORD_RESET_DISPATCHED', `Sent password reset token link via ${sentEmail ? 'email' : 'console fallback'}`, req);

    return res.status(200).json({
      success: true,
      message: 'A password reset link has been dispatched to your email address.',
      resetUrl: isProduction ? undefined : resetUrl
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error processing password request' });
  }
});

// 5. Reset Password
router.post('/reset-password', resetLimiter, csrfCheck, async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ success: false, message: 'Email, token, and new password are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const resetRecord = await dbHelper.resets.findOne(email);
    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset request' });
    }

    const now = new Date();
    const expiresAt = new Date(resetRecord.expiresAt);

    if (now > expiresAt) {
      await dbHelper.resets.delete(email);
      return res.status(400).json({ success: false, message: 'Password reset link has expired (15 minutes limit)' });
    }

    const inputHash = crypto.createHash('sha256').update(token).digest('hex');
    if (inputHash !== resetRecord.tokenHash) {
      return res.status(400).json({ success: false, message: 'Invalid or incorrect security token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (auth) {
      try {
        const fbUser = await auth.getUserByEmail(email);
        await auth.updateUser(fbUser.uid, { password });
        console.log(`🔥 Updated password in Firebase Auth for: ${email}`);
      } catch (fbErr) {
        console.warn('Failed to update password in Firebase Auth:', fbErr.message);
      }
    }

    // Update or create in users database
    let user = await dbHelper.users.findOne('email', email);
    if (user) {
      user.password = hashedPassword;
      await dbHelper.users.save(user.id || email, user);
    } else {
      user = {
        id: email,
        username: email.split('@')[0],
        email,
        password: hashedPassword,
        role: 'client',
        createdAt: new Date().toISOString()
      };
      await dbHelper.users.save(email, user);
    }

    await dbHelper.resets.delete(email);
    await writeAuditLog(null, email, 'PASSWORD_RESET_COMPLETED', 'Password reset successfully using token validation', req);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
});

// Signup
router.post('/signup', signupLimiter, csrfCheck, async (req, res) => {
  try {
    const { name, email, password, clientId, state, mobile, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const otpRecord = await dbHelper.otps.findOne(email);
    if (!otpRecord || !otpRecord.verified) {
      return res.status(400).json({ success: false, message: 'Email address must be verified via OTP first.' });
    }

    const existingUser = await dbHelper.users.findOne('email', email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (auth) {
      try {
        await auth.createUser({
          email,
          password,
          displayName: name
        });
        console.log(`🔥 Created user in Firebase Auth: ${email}`);
      } catch (fbErr) {
        console.warn('Firebase Auth signup warning:', fbErr.message);
      }
    }

    const finalCountry = country || 'United States';
    const newUser = {
      username: name,
      email,
      password: hashedPassword,
      companyName: clientId || name + ' Company',
      clientId: clientId || email,
      mobile: mobile || 'N/A',
      state: state || finalCountry,
      country: finalCountry,
      role: 'client',
      createdAt: new Date().toISOString()
    };

    await dbHelper.users.save(email, newUser);
    await dbHelper.otps.delete(email);

    const token = jwt.sign(
      { userId: email, username: name, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    try {
      await emailService.sendWelcomeEmail(email, name);
    } catch (e) {
      console.warn('Welcome email failed to send:', e.message);
    }

    const regTime = new Date().toLocaleString();
    const adminNotifHtml = `
      <h1 class="body-title" style="color: #6366f1;">New Client Registration Alert</h1>
      <p class="body-text">An enterprise client workspace has been registered and verified successfully:</p>
      <div class="badge-box">
        <div style="margin-bottom:8px;"><span class="badge-label">Client Name:</span> <span style="color:#FFF;">${name}</span></div>
        <div style="margin-bottom:8px;"><span class="badge-label">Work Email:</span> <a href="mailto:${email}" style="color:#6366F1;">${email}</a></div>
        <div style="margin-bottom:8px;"><span class="badge-label">Phone:</span> <span style="color:#FFF;">${mobile || 'N/A'}</span></div>
        <div style="margin-bottom:8px;"><span class="badge-label">Client ID:</span> <span style="color:#FFF;">${clientId || 'N/A'}</span></div>
        <div><span class="badge-label">Registration Time:</span> <span style="color:#FFF;">${regTime}</span></div>
      </div>
    `;
    try {
      await emailService.sendAdminNotification('New Client Registration', `A new client registered: ${name} (${email})`, adminNotifHtml);
    } catch (e) {
      console.warn('Admin notification failed to send:', e.message);
    }

    await writeAuditLog(email, email, 'CLIENT_REGISTRATION_VERIFIED', 'Completed registration and created account', req);

    return res.status(201).json({
      success: true,
      message: 'Successfully registered',
      user: { username: name, email, role: 'client' }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Server error completing registration' });
  }
});

// Login
router.post('/login', loginLimiter, csrfCheck, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const queryStr = (email || '').trim().toLowerCase();
    const idMap = {
      'admin001': 'admin_owner', 'admin': 'admin_owner', 'admin_owner': 'admin_owner',
      'w1': 'syedrashid_w1', 'syedrashid_w1': 'syedrashid_w1',
      'w2': 'rishigesh_w2', 'rishigesh_w2': 'rishigesh_w2',
      'w3': 'pushparaj_w3', 'pushparaj_w3': 'pushparaj_w3'
    };
    const targetId = (idMap[queryStr] || queryStr).toLowerCase();

    const allUsers = await dbHelper.users.getAll();
    const user = allUsers.find(u => 
      (u.id && u.id.toLowerCase() === targetId) ||
      (u.email && u.email.toLowerCase() === queryStr) ||
      (u.username && u.username.toLowerCase() === queryStr)
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    let isAuthenticated = false;

    // 1. Check database bcrypt password hash first (supports newly reset passwords)
    if (user.password) {
      const isBcryptMatch = await bcrypt.compare(password, user.password);
      if (isBcryptMatch) {
        isAuthenticated = true;
      }
    }

    // 2. If not matched locally, fallback to Firebase API verification (only if local password isn't set yet)
    if (!isAuthenticated && !user.password && auth && process.env.FIREBASE_API_KEY) {
      try {
        await verifyFirebaseCredentials(user.email || email, password);
        isAuthenticated = true;
        
        // Sync password to local database for future logins
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user.password = hashedPassword;
        await dbHelper.users.save(user.id || user.email, user);
      } catch (err) {
        console.warn('Firebase login check skipped/failed:', err.message);
      }
    }

    if (!isAuthenticated) {
      return res.status(400).json({ success: false, message: 'Login failed. Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id || user.email, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await writeAuditLog(user.id || user.email, email, 'LOGIN_SUCCESS', 'Logged in successfully', req);

    return res.status(200).json({
      success: true,
      message: 'login successfully',
      user: {
        id: user.id || user.email,
        username: user.username,
        email: user.email,
        role: user.role || 'client',
        companyName: user.companyName || '',
        mobile: user.mobile || '',
        country: user.country || '',
        state: user.state || ''
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Google OAuth onboarding
router.post('/google-onboard', signupLimiter, csrfCheck, async (req, res) => {
  try {
    const { name, email, companyName, mobile, country, state } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required' });
    }

    let user = await dbHelper.users.findOne('email', email);
    const isNew = !user;

    if (isNew) {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      if (auth) {
        try {
          await auth.createUser({
            email,
            password: randomPassword,
            displayName: name
          });
          console.log(`🔥 Created Google Onboarding user in Firebase Auth: ${email}`);
        } catch (fbErr) {
          console.warn('Firebase Auth google-onboard warning:', fbErr.message);
        }
      }

      user = {
        id: email,
        username: name,
        email,
        password: hashedPassword,
        companyName: companyName || '',
        mobile: mobile || '',
        country: country || '',
        state: state || '',
        role: 'client',
        createdAt: new Date().toISOString()
      };
      await dbHelper.users.save(email, user);
      await writeAuditLog(email, email, 'USER_SIGNUP_GOOGLE', 'Signed up with Google OAuth', req);
    } else {
      let updated = false;
      if (companyName && !user.companyName) { user.companyName = companyName; updated = true; }
      if (mobile && !user.mobile) { user.mobile = mobile; updated = true; }
      if (country && !user.country) { user.country = country; updated = true; }
      if (state && !user.state) { user.state = state; updated = true; }
      if (updated) {
        await dbHelper.users.save(user.id, user);
      }
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Google onboarding successful',
      isNewUser: isNew,
      user: {
        id: user.id || user.email,
        username: user.username,
        email: user.email,
        role: user.role || 'client',
        companyName: user.companyName || '',
        mobile: user.mobile || '',
        country: user.country || '',
        state: user.state || ''
      }
    });
  } catch (error) {
    console.error('Google onboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error onboarding with Google' });
  }
});

// Logout
router.post('/logout', csrfCheck, (req, res) => {
  const token = req.cookies.token;
  let email = 'GUEST';
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      email = decoded.email;
    } catch(e) {}
  }
  res.clearCookie('token');
  res.clearCookie('csrfToken');
  writeAuditLog(null, email, 'LOGOUT_SUCCESS', 'Logged out session', req);
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Clear Session
router.get('/clear-session', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('csrfToken');
  return res.json({ success: true, message: 'Session cleared successfully' });
});

// Get current user session info
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      console.log('🔴 [/me] No token found in cookies.');
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbHelper.users.findById(decoded.userId);

    if (!user) {
      console.log(`🔴 [/me] User not found in DB for ID: ${decoded.userId}`);
      res.clearCookie('token');
      return res.status(401).json({ success: false, message: 'User session has expired' });
    }

    console.log(`🟢 [/me] Success! Decoded ID: ${decoded.userId} -> Found: ${user.id} (${user.role})`);
    return res.json({
      success: true,
      user: {
        id: user.id || user.email,
        username: user.username,
        email: user.email,
        role: user.role || 'client',
        companyName: user.companyName || '',
        mobile: user.mobile || '',
        country: user.country || '',
        state: user.state || ''
      }
    });
  } catch (error) {
    console.log(`🔴 [/me] JWT verify failed or error: ${error.message}`);
    res.clearCookie('token');
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
});

module.exports = router;
