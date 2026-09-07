const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const fs = require('fs');
const http = require('http');

async function verifyAllConnections() {
  console.log('====================================================');
  console.log('      ZENTRIO BACKEND SYSTEM & CONNECTION CHECK     ');
  console.log('====================================================\n');

  const statusReport = {};

  // --- 1. ENV VARIABLES CHECK ---
  console.log('1️⃣  Checking Environment Variables...');
  const requiredEnvVars = [
    'PORT', 'JWT_SECRET', 'FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY', 'FIREBASE_STORAGE_BUCKET', 'EMAIL_USER', 'EMAIL_PASS',
    'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'
  ];
  const missingEnv = requiredEnvVars.filter(key => !process.env[key]);
  if (missingEnv.length === 0) {
    console.log('   ✅ All required environment variables are set.');
    statusReport.envVars = { status: 'OK', details: 'All 10 critical environment variables present.' };
  } else {
    console.log(`   ❌ Missing environment variables: ${missingEnv.join(', ')}`);
    statusReport.envVars = { status: 'WARNING', details: `Missing: ${missingEnv.join(', ')}` };
  }

  // --- 2. FIREBASE ADMIN SDK & FIRESTORE ---
  console.log('\n2️⃣  Testing Firebase Admin SDK & Firestore DB Connection...');
  try {
    const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
    const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (firebasePrivateKey) {
      if (firebasePrivateKey.startsWith('"') && firebasePrivateKey.endsWith('"')) {
        firebasePrivateKey = firebasePrivateKey.substring(1, firebasePrivateKey.length - 1);
      }
      firebasePrivateKey = firebasePrivateKey.replace(/\\n/g, '\n');
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseProjectId,
          clientEmail: firebaseClientEmail,
          privateKey: firebasePrivateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    const db = getFirestore();
    const collections = await db.listCollections();
    const collectionNames = collections.map(c => c.id);
    console.log(`   ✅ Firebase Admin SDK connected! Collections found in Firestore: [${collectionNames.join(', ')}]`);
    
    const auth = getAuth();
    const userList = await auth.listUsers(1);
    console.log(`   ✅ Firebase Auth connected! User list check succeeded (${userList.users.length} user record sampled).`);

    statusReport.firebase = {
      status: 'OK',
      details: {
        projectId: firebaseProjectId,
        collectionsFound: collectionNames.length,
        collections: collectionNames
      }
    };
  } catch (err) {
    console.log(`   ❌ Firebase Connection Error: ${err.message}`);
    statusReport.firebase = { status: 'ERROR', error: err.message };
  }

  // --- 3. EMAIL SMTP CONNECTION (NODEMAILER) ---
  console.log('\n3️⃣  Testing Nodemailer SMTP Connection...');
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    await transporter.verify();
    console.log(`   ✅ Email SMTP Server verified successfully for account: ${process.env.EMAIL_USER}`);
    statusReport.email = { status: 'OK', user: process.env.EMAIL_USER };
  } catch (err) {
    console.log(`   ❌ Email SMTP Verification Error: ${err.message}`);
    statusReport.email = { status: 'ERROR', error: err.message };
  }

  // --- 4. RAZORPAY API CONNECTION ---
  console.log('\n4️⃣  Testing Razorpay Gateway Connection...');
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    const orders = await razorpay.orders.all({ count: 1 });
    console.log(`   ✅ Razorpay API credentials valid! Connected successfully (Fetched ${orders.items.length} sample orders).`);
    statusReport.razorpay = { status: 'OK', keyId: process.env.RAZORPAY_KEY_ID };
  } catch (err) {
    console.log(`   ❌ Razorpay API Error: ${err.message}`);
    statusReport.razorpay = { status: 'ERROR', error: err.message };
  }

  // --- 5. LOCAL BACKUP DATABASE FILES ---
  console.log('\n5️⃣  Checking Local JSON Storage / Backups...');
  try {
    const backupDir = path.resolve(__dirname, '..', 'database', 'backups');
    if (fs.existsSync(backupDir)) {
      const files = fs.readdirSync(backupDir);
      console.log(`   ✅ Local JSON Backup directory found with ${files.length} backup file(s):`);
      files.forEach(f => {
        const filePath = path.join(backupDir, f);
        const stats = fs.statSync(filePath);
        console.log(`      - ${f} (${stats.size} bytes)`);
      });
      statusReport.localBackups = { status: 'OK', count: files.length, directory: backupDir };
    } else {
      console.log(`   ⚠️ Backup directory not found at ${backupDir}`);
      statusReport.localBackups = { status: 'WARNING', details: 'Directory missing' };
    }
  } catch (err) {
    console.log(`   ❌ Local Backup Check Error: ${err.message}`);
    statusReport.localBackups = { status: 'ERROR', error: err.message };
  }

  // --- 6. SERVER MODULE & ROUTES INTEGRITY ---
  console.log('\n6️⃣  Testing Express Server Router & Middleware Load...');
  try {
    const app = require('../server/server.js');
    console.log('   ✅ Express App & Router modules loaded cleanly without any syntax or initialization crashes.');
    statusReport.expressServer = { status: 'OK' };
  } catch (err) {
    console.log(`   ❌ Express Server Load Error: ${err.message}`);
    statusReport.expressServer = { status: 'ERROR', error: err.message };
  }

  // --- 7. SERVER PORT BINDING & ENDPOINT HTTP TEST ---
  console.log('\n7️⃣  Performing HTTP Ping on Local Server (Port 3000)...');
  const serverRunning = await new Promise((resolve) => {
    http.get('http://localhost:3000/', (res) => {
      console.log(`   ✅ HTTP GET / returned HTTP ${res.statusCode} (${res.headers['content-type']})`);
      resolve(true);
    }).on('error', (err) => {
      console.log(`   ℹ️ Local server is not currently running on port 3000 (${err.message}).`);
      resolve(false);
    });
  });

  statusReport.liveServerPing = serverRunning ? { status: 'ONLINE' } : { status: 'OFFLINE' };

  console.log('\n====================================================');
  console.log('               FINAL SUMMARY REPORT                 ');
  console.log('====================================================');
  console.log(JSON.stringify(statusReport, null, 2));

  process.exit(0);
}

verifyAllConnections();
