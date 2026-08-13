const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getApps } = require('firebase-admin/app');
require('dotenv').config();

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
if (firebasePrivateKey) {
  if (firebasePrivateKey.startsWith('"') && firebasePrivateKey.endsWith('"')) {
    firebasePrivateKey = firebasePrivateKey.substring(1, firebasePrivateKey.length - 1);
  }
  firebasePrivateKey = firebasePrivateKey.replace(/\\n/g, '\n');
}

let isInitialized = false;

if (firebaseProjectId && firebaseClientEmail && firebasePrivateKey) {
  try {
    if (getApps().length === 0) {
      admin.initializeApp({
        credential: admin.cert({
          projectId: firebaseProjectId,
          clientEmail: firebaseClientEmail,
          privateKey: firebasePrivateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      console.log('🔥 Firebase Admin SDK initialized successfully.');
    } else {
      console.log('🔥 Firebase Admin SDK already initialized (reusing existing instance).');
    }
    isInitialized = true;
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
  }
} else {
  console.warn('⚠️ Firebase Admin SDK configuration is incomplete. Running in mock/offline mode.');
}

const db = isInitialized ? getFirestore() : null;
const auth = isInitialized ? getAuth() : null;
const bucket = isInitialized ? getStorage().bucket() : null;

// Paths
const MOCK_DIR = process.env.VERCEL ? '/tmp' : __dirname;
const USERS_FILE = path.join(MOCK_DIR, 'users_db_backup.json');
const OTPs_FILE = path.join(MOCK_DIR, 'otp_db_backup.json');
const RESETS_FILE = path.join(MOCK_DIR, 'reset_db_backup.json');
const PROJECTS_FILE = path.join(MOCK_DIR, 'projects_db_backup.json');
const PAYMENTS_FILE = path.join(MOCK_DIR, 'payments_db_backup.json');
const MESSAGES_FILE = path.join(MOCK_DIR, 'messages_db_backup.json');
const ENQUIRIES_FILE = path.join(MOCK_DIR, 'enquiries_db_backup.json');
const TASKS_FILE = path.join(MOCK_DIR, 'tasks_db_backup.json');
const LEAVES_FILE = path.join(MOCK_DIR, 'leaves_db_backup.json');
const PAYSLIPS_FILE = path.join(MOCK_DIR, 'payslips_db_backup.json');
const FEEDBACKS_FILE = path.join(MOCK_DIR, 'feedbacks_db_backup.json');

// Write Permission check
let fsWritable = true;
try {
  fs.accessSync(MOCK_DIR, fs.constants.W_OK);
} catch (e) {
  fsWritable = false;
}

const readJsonFile = (filePath, fallbackVal) => {
  if (fs.existsSync(filePath)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      return fallbackVal;
    }
  }
  return fallbackVal;
};

const writeJsonFile = (filePath, data) => {
  if (fsWritable) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (e) {}
  }
};

// Initial local load (from fallbacks or memory)
let localUsers = readJsonFile(USERS_FILE, []);
let localOTPs = readJsonFile(OTPs_FILE, []);
let localResets = readJsonFile(RESETS_FILE, []);
let localProjects = readJsonFile(PROJECTS_FILE, []);
let localPayments = readJsonFile(PAYMENTS_FILE, []);
let localMessages = readJsonFile(MESSAGES_FILE, []);
let localEnquiries = readJsonFile(ENQUIRIES_FILE, []);
let localTasks = readJsonFile(TASKS_FILE, []);
let localLeaves = readJsonFile(LEAVES_FILE, []);
let localPayslips = readJsonFile(PAYSLIPS_FILE, []);
let localFeedbacks = readJsonFile(FEEDBACKS_FILE, []);

// Sync initial seed data if files are empty
if (localUsers.length === 0) {
  const adminPass = bcrypt.hashSync('admin@zentrio', 10);
  const worker1Pass = bcrypt.hashSync('syed@zentrio', 10);
  const worker2Pass = bcrypt.hashSync('rishi@zentrio', 10);
  const worker3Pass = bcrypt.hashSync('pushpa@zentrio', 10);
  const clientPass = bcrypt.hashSync('Client@2026#', 10);

  localUsers = [
    { id: 'admin_owner', username: 'Admin Owner', email: 'admin@zentrio.ai', password: adminPass, role: 'admin' },
    { id: 'syedrashid_W1', username: 'Syed Rashid', email: 'syed.r@zentrio.ai', password: worker1Pass, role: 'worker' },
    { id: 'rishigesh_W2', username: 'Rishigesh', email: 'rishi@zentrio.ai', password: worker2Pass, role: 'worker' },
    { id: 'pushparaj_W3', username: 'Pushparaj', email: 'pushpa.r@zentrio.ai', password: worker3Pass, role: 'worker' }
  ];
  writeJsonFile(USERS_FILE, localUsers);
}

if (false && localProjects.length === 0) {
  localProjects = [
    {
      id: 'PRJ-8012',
      title: 'AI Customer Service Agent',
      category: 'AI & Machine Learning',
      description: 'Build an autonomous agent using custom LLM fine-tuning to resolve 80% of support tickets automatically and integrate into current web dashboards.',
      techRequired: ['React', 'Python', 'OpenAI API', 'FastAPI', 'Tailwind CSS'],
      budget: 15000,
      deadline: '2026-08-25',
      clientId: 'client@company.com',
      clientName: 'John Smith',
      clientCompany: 'NexusCorp',
      assignedWorkerId: 'WORKER003',
      assignedWorkerName: 'David Chen',
      status: 'development',
      progress: 45,
      milestones: [
        { id: 'm1', title: 'Architecture Planning', status: 'completed' },
        { id: 'm2', title: 'Data Cleaning & Structuring', status: 'completed' },
        { id: 'm3', title: 'Model Training & Fine-tuning', status: 'pending' },
        { id: 'm4', title: 'UI Dashboard Integration', status: 'pending' }
      ],
      deliverables: [
        { id: 'd1', name: 'System Architecture Design Doc.pdf', url: '#', uploadedAt: '2026-07-06', uploadedBy: 'David Chen' }
      ],
      additionalNotes: 'Requires integration with Webhook security headers.'
    },
    {
      id: 'PRJ-5401',
      title: 'NextGen E-Commerce Platform',
      category: 'E-Commerce Development',
      description: 'Redesign of high-volume merchant store utilizing React and Headless Shopify APIs with glassmorphism layout and full multi-currency and real-time inventory checks.',
      techRequired: ['React', 'TypeScript', 'Shopify API', 'Tailwind CSS', 'Framer Motion'],
      budget: 22000,
      deadline: '2026-09-10',
      clientId: 'client@company.com',
      clientName: 'John Smith',
      clientCompany: 'NexusCorp',
      assignedWorkerId: 'WORKER001',
      assignedWorkerName: 'Sarah Jenkins',
      status: 'review',
      progress: 80,
      milestones: [
        { id: 'em1', title: 'Design System Sign-off', status: 'completed' },
        { id: 'em2', title: 'Catalog and Shopping Cart Dev', status: 'completed' },
        { id: 'em3', title: 'Headless Checkout System Sync', status: 'completed' },
        { id: 'em4', title: 'Beta Testing with Real Transactions', status: 'pending' }
      ],
      deliverables: [
        { id: 'ed1', name: 'UI Mockups Export v2.fig', url: '#', uploadedAt: '2026-06-20', uploadedBy: 'Sarah Jenkins' },
        { id: 'ed2', name: 'Staging Environment URL link', url: '#', uploadedAt: '2026-07-09', uploadedBy: 'Sarah Jenkins' }
      ]
    },
    {
      id: 'PRJ-3199',
      title: 'Apex Mobile Analytics App',
      category: 'Mobile App Development',
      description: 'React Native dashboard tracking startup KPIs, server latency, financial MRR, active users, and system errors in real time with push notifications.',
      techRequired: ['React Native', 'TypeScript', 'Recharts', 'Expo', 'Node.js'],
      budget: 12000,
      deadline: '2026-07-20',
      clientId: 'client@company.com',
      clientName: 'John Smith',
      clientCompany: 'NexusCorp',
      assignedWorkerId: 'WORKER002',
      assignedWorkerName: 'Alex Rivera',
      status: 'completed',
      progress: 100,
      milestones: [
        { id: 'mm1', title: 'API Endpoints Structure', status: 'completed' },
        { id: 'mm2', title: 'Mobile UI Layout Framework', status: 'completed' },
        { id: 'mm3', title: 'App Store Submission Ready', status: 'completed' }
      ],
      deliverables: [
        { id: 'md1', name: 'iOS build package (.ipa)', url: '#', uploadedAt: '2026-07-05', uploadedBy: 'Alex Rivera' },
        { id: 'md2', name: 'Android build package (.apk)', url: '#', uploadedAt: '2026-07-05', uploadedBy: 'Alex Rivera' }
      ]
    }
  ];
  writeJsonFile(PROJECTS_FILE, localProjects);
}

if (false && localPayments.length === 0) {
  localPayments = [
    {
      id: 'TXN-902148',
      projectId: 'PRJ-3199',
      projectTitle: 'Apex Mobile Analytics App',
      clientId: 'client@company.com',
      clientName: 'John Smith',
      amount: 12000,
      paymentMethod: 'razorpay',
      status: 'success',
      invoiceNumber: 'INV-2026-042',
      date: new Date('2026-07-01')
    },
    {
      id: 'TXN-884102',
      projectId: 'PRJ-8012',
      projectTitle: 'AI Customer Service Agent',
      clientId: 'client@company.com',
      clientName: 'John Smith',
      amount: 7500,
      paymentMethod: 'credit_card',
      status: 'success',
      invoiceNumber: 'INV-2026-045',
      date: new Date('2026-07-05')
    }
  ];
  writeJsonFile(PAYMENTS_FILE, localPayments);
}

if (false && localMessages.length === 0) {
  localMessages = [
    {
      id: 'cht1',
      senderId: 'ADMIN001',
      senderName: 'Emma Sterling',
      senderRole: 'admin',
      recipientId: 'internal-team',
      content: 'Team, please review the current milestones for NextGen E-Commerce and make sure all deliverables are uploaded directly via the portals.',
      timestamp: new Date('2026-07-11T09:00:00Z')
    },
    {
      id: 'cht2',
      senderId: 'WORKER003',
      senderName: 'David Chen',
      senderRole: 'worker',
      recipientId: 'internal-team',
      content: 'Roger that. I uploaded the architecture layout for the AI support agent.',
      timestamp: new Date('2026-07-11T09:15:00Z')
    }
  ];
  writeJsonFile(MESSAGES_FILE, localMessages);
}

// Database sync handler (called from server.js startup)
const initializeFirestoreSync = async () => {
  if (!db) return;
  try {
    console.log('🔄 Initializing Firestore synchronization...');

    // Users
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
      console.log('🌱 Firestore users collection is empty. Seeding default users...');
      for (const u of localUsers) {
        await db.collection('users').doc(u.id).set(u);
      }
    } else {
      const usersSnap = await db.collection('users').get();
      const list = [];
      for (const doc of usersSnap.docs) {
        const uData = doc.data();
        list.push({ id: doc.id, ...uData });
      }
      localUsers = list;
      writeJsonFile(USERS_FILE, localUsers);
      console.log(`✅ Synced ${list.length} internal users from Firestore (erased stale client records).`);
    }

    // Ensure W1, W2, W3, Client, and Admin Owner credentials are correct
    const adminPassSync = bcrypt.hashSync('admin@zentrio', 10);
    const worker1PassSync = bcrypt.hashSync('syed@zentrio', 10);
    const worker2PassSync = bcrypt.hashSync('rishi@zentrio', 10);
    const worker3PassSync = bcrypt.hashSync('pushpa@zentrio', 10);
    const clientPassSync = bcrypt.hashSync('Client@2026#', 10);

    const defaultSyncUsers = [
      { id: 'admin_owner', username: 'Admin Owner', email: 'admin@zentrio.ai', password: adminPassSync, role: 'admin' },
      { id: 'syedrashid_W1', username: 'Syed Rashid', email: 'syed.r@zentrio.ai', password: worker1PassSync, role: 'worker' },
      { id: 'rishigesh_W2', username: 'Rishigesh', email: 'rishi@zentrio.ai', password: worker2PassSync, role: 'worker' },
      { id: 'pushparaj_W3', username: 'Pushparaj', email: 'pushpa.r@zentrio.ai', password: worker3PassSync, role: 'worker' }
    ];

    let needsSave = false;
    for (const defU of defaultSyncUsers) {
      const existingIdx = localUsers.findIndex(u => u.id === defU.id);
      if (existingIdx === -1) {
        localUsers.push(defU);
        await db.collection('users').doc(defU.id).set(defU);
        needsSave = true;
        console.log(`👤 Seeded missing default user ${defU.username} (${defU.id}) to Firestore.`);
      } else {
        const existing = localUsers[existingIdx];
        let changed = false;
        if (existing.role !== defU.role) {
          existing.role = defU.role;
          changed = true;
        }
        if (existing.password !== defU.password) {
          existing.password = defU.password;
          changed = true;
        }
        if (changed) {
          localUsers[existingIdx] = existing;
          await db.collection('users').doc(existing.id).set(existing);
          needsSave = true;
          console.log(`🔄 Updated default credentials for ${defU.username} (${defU.id}) in Firestore.`);
        }
      }
    }
    if (needsSave) {
      writeJsonFile(USERS_FILE, localUsers);
    }

    // OTPs
    const otpsSnapshot = await db.collection('otps').get();
    if (!otpsSnapshot.empty) {
      const list = [];
      otpsSnapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          email: doc.id,
          ...data,
          expiresAt: data.expiresAt ? (data.expiresAt.toDate ? data.expiresAt.toDate().toISOString() : data.expiresAt) : '',
          cooldownUntil: data.cooldownUntil ? (data.cooldownUntil.toDate ? data.cooldownUntil.toDate().toISOString() : data.cooldownUntil) : ''
        });
      });
      localOTPs = list;
      console.log(`✅ Synced ${list.length} active OTPs from Firestore.`);
    }

    // Resets
    const resetsSnapshot = await db.collection('resets').get();
    if (!resetsSnapshot.empty) {
      const list = [];
      resetsSnapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          email: doc.id,
          ...data,
          expiresAt: data.expiresAt ? (data.expiresAt.toDate ? data.expiresAt.toDate().toISOString() : data.expiresAt) : ''
        });
      });
      localResets = list;
      console.log(`✅ Synced ${list.length} active resets from Firestore.`);
    }

    // Projects
    const projectsSnapshot = await db.collection('projects').get();
    if (projectsSnapshot.empty && localProjects.length > 0) {
      console.log('🌱 Firestore projects collection is empty. Seeding default projects...');
      for (const p of localProjects) {
        await db.collection('projects').doc(p.id).set(p);
      }
    } else {
      const list = [];
      projectsSnapshot.forEach(doc => {
        list.push(doc.data());
      });
      localProjects = list;
      console.log(`✅ Synced ${list.length} projects from Firestore.`);
    }

    // Payments
    const paymentsSnapshot = await db.collection('payments').get();
    if (paymentsSnapshot.empty && localPayments.length > 0) {
      console.log('🌱 Firestore payments collection is empty. Seeding default payments...');
      for (const p of localPayments) {
        await db.collection('payments').doc(p.id).set(p);
      }
    } else {
      const list = [];
      paymentsSnapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          ...data,
          date: data.date ? (data.date.toDate ? data.date.toDate() : new Date(data.date)) : new Date()
        });
      });
      localPayments = list;
      console.log(`✅ Synced ${list.length} payments from Firestore.`);
    }

    // Messages
    const messagesSnapshot = await db.collection('messages').get();
    if (messagesSnapshot.empty && localMessages.length > 0) {
      console.log('🌱 Firestore messages collection is empty. Seeding default messages...');
      for (const m of localMessages) {
        await db.collection('messages').doc(m.id).set(m);
      }
    } else {
      const list = [];
      messagesSnapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          ...data,
          timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : new Date()
        });
      });
      localMessages = list;
      console.log(`✅ Synced ${list.length} chat messages from Firestore.`);
    }

    // Enquiries Sync
    const enquiriesSnapshot = await db.collection('enquiries').get().catch(() => null);
    if (enquiriesSnapshot && !enquiriesSnapshot.empty) {
      const list = [];
      enquiriesSnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      localEnquiries = list;
      writeJsonFile(ENQUIRIES_FILE, localEnquiries);
      console.log(`✅ Synced ${list.length} contact enquiries from Firestore.`);
    }

    // Tasks Sync
    const tasksSnapshot = await db.collection('tasks').get().catch(() => null);
    if (tasksSnapshot && !tasksSnapshot.empty) {
      const list = [];
      tasksSnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      localTasks = list;
      writeJsonFile(TASKS_FILE, localTasks);
      console.log(`✅ Synced ${list.length} tasks from Firestore.`);
    }

    // Leaves Sync
    const leavesSnapshot = await db.collection('leaves').get().catch(() => null);
    if (leavesSnapshot && !leavesSnapshot.empty) {
      const list = [];
      leavesSnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      localLeaves = list;
      writeJsonFile(LEAVES_FILE, localLeaves);
      console.log(`✅ Synced ${list.length} leave requests from Firestore.`);
    }

    // Payslips Sync
    const payslipsSnapshot = await db.collection('payslips').get().catch(() => null);
    if (payslipsSnapshot && !payslipsSnapshot.empty) {
      const list = [];
      payslipsSnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      localPayslips = list;
      writeJsonFile(PAYSLIPS_FILE, localPayslips);
      console.log(`✅ Synced ${list.length} payslips from Firestore.`);
    }

    // Feedbacks Sync
    const feedbacksSnapshot = await db.collection('feedbacks').get().catch(() => null);
    if (feedbacksSnapshot && !feedbacksSnapshot.empty) {
      const list = [];
      feedbacksSnapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      localFeedbacks = list;
      writeJsonFile(FEEDBACKS_FILE, localFeedbacks);
      console.log(`✅ Synced ${list.length} feedbacks from Firestore.`);
    }

  } catch (err) {
    console.error('❌ Error during Firestore synchronization:', err.message);
  }
};

// Database helper API exported to routes
const dbHelper = {
  users: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return localUsers;
    },
    getAll: async () => {
      if (db) {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return localUsers;
    },
    findOne: async (field, value) => {
      if (db) {
        const snapshot = await db.collection('users').where(field, '==', value).get();
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
      }
      return localUsers.find(u => u[field] === value) || null;
    },
    findById: async (id) => {
      if (db) {
        const doc = await db.collection('users').doc(id).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
      }
      return localUsers.find(u => u.id === id) || null;
    },
    save: async (id, userData) => {
      if (db) {
        await db.collection('users').doc(id).set(userData);
      }
      const existingIdx = localUsers.findIndex(u => u.id === id);
      if (existingIdx !== -1) {
        localUsers[existingIdx] = { id, ...userData };
      } else {
        localUsers.push({ id, ...userData });
      }
      writeJsonFile(USERS_FILE, localUsers);
    }
  },
  projects: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('projects').get();
        return snapshot.docs.map(doc => doc.data());
      }
      return localProjects;
    },
    save: async (id, projectData) => {
      if (db) {
        await db.collection('projects').doc(id).set(projectData);
      }
      const existingIdx = localProjects.findIndex(p => p.id === id);
      if (existingIdx !== -1) {
        localProjects[existingIdx] = projectData;
      } else {
        localProjects.push(projectData);
      }
      writeJsonFile(PROJECTS_FILE, localProjects);
    }
  },
  payments: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('payments').get();
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            date: data.date ? (data.date.toDate ? data.date.toDate() : new Date(data.date)) : new Date()
          };
        });
      }
      return localPayments;
    },
    save: async (id, paymentData) => {
      if (db) {
        await db.collection('payments').doc(id).set(paymentData);
      }
      const existingIdx = localPayments.findIndex(p => p.id === id);
      if (existingIdx !== -1) {
        localPayments[existingIdx] = paymentData;
      } else {
        localPayments.push(paymentData);
      }
      writeJsonFile(PAYMENTS_FILE, localPayments);
    }
  },
  messages: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('messages').get();
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            timestamp: data.timestamp ? (data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp)) : new Date()
          };
        });
      }
      return localMessages;
    },
    save: async (id, messageData) => {
      if (db) {
        await db.collection('messages').doc(id).set(messageData);
      }
      const existingIdx = localMessages.findIndex(m => m.id === id);
      if (existingIdx !== -1) {
        localMessages[existingIdx] = messageData;
      } else {
        localMessages.push(messageData);
      }
      writeJsonFile(MESSAGES_FILE, localMessages);
    }
  },
  otps: {
    findOne: async (email) => {
      if (db) {
        const doc = await db.collection('otps').doc(email).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return {
          email: doc.id,
          ...data,
          expiresAt: data.expiresAt ? (data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt)) : null,
          cooldownUntil: data.cooldownUntil ? (data.cooldownUntil.toDate ? data.cooldownUntil.toDate() : new Date(data.cooldownUntil)) : null
        };
      }
      const local = localOTPs.find(o => o.email === email);
      if (local) {
        return {
          ...local,
          expiresAt: local.expiresAt ? new Date(local.expiresAt) : null,
          cooldownUntil: local.cooldownUntil ? new Date(local.cooldownUntil) : null
        };
      }
      return null;
    },
    save: async (email, otpData) => {
      if (db) {
        await db.collection('otps').doc(email).set(otpData);
      }
      const existingIdx = localOTPs.findIndex(o => o.email === email);
      if (existingIdx !== -1) {
        localOTPs[existingIdx] = { email, ...otpData };
      } else {
        localOTPs.push({ email, ...otpData });
      }
      writeJsonFile(OTPs_FILE, localOTPs);
    },
    delete: async (email) => {
      if (db) {
        await db.collection('otps').doc(email).delete();
      }
      localOTPs = localOTPs.filter(o => o.email !== email);
      writeJsonFile(OTPs_FILE, localOTPs);
    }
  },
  resets: {
    findOne: async (email) => {
      if (db) {
        const doc = await db.collection('resets').doc(email).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return {
          email: doc.id,
          ...data,
          expiresAt: data.expiresAt ? (data.expiresAt.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt)) : null
        };
      }
      const local = localResets.find(r => r.email === email);
      if (local) {
        return {
          ...local,
          expiresAt: local.expiresAt ? new Date(local.expiresAt) : null
        };
      }
      return null;
    },
    save: async (email, resetData) => {
      if (db) {
        await db.collection('resets').doc(email).set(resetData);
      }
      const existingIdx = localResets.findIndex(r => r.email === email);
      if (existingIdx !== -1) {
        localResets[existingIdx] = { email, ...resetData };
      } else {
        localResets.push({ email, ...resetData });
      }
      writeJsonFile(RESETS_FILE, localResets);
    },
    delete: async (email) => {
      if (db) {
        await db.collection('resets').doc(email).delete();
      }
      localResets = localResets.filter(r => r.email !== email);
      writeJsonFile(RESETS_FILE, localResets);
    }
  },
  enquiries: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('enquiries').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return localEnquiries;
    },
    save: async (id, enquiryData) => {
      if (db) {
        await db.collection('enquiries').doc(id).set(enquiryData);
      }
      const existingIdx = localEnquiries.findIndex(e => e.id === id);
      if (existingIdx !== -1) {
        localEnquiries[existingIdx] = enquiryData;
      } else {
        localEnquiries.push(enquiryData);
      }
      writeJsonFile(ENQUIRIES_FILE, localEnquiries);
    }
  },
  tasks: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('tasks').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return localTasks;
    },
    save: async (id, taskData) => {
      if (db) {
        await db.collection('tasks').doc(id).set(taskData);
      }
      const existingIdx = localTasks.findIndex(t => t.id === id);
      if (existingIdx !== -1) {
        localTasks[existingIdx] = taskData;
      } else {
        localTasks.push(taskData);
      }
      writeJsonFile(TASKS_FILE, localTasks);
    }
  },
  leaves: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('leaves').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return localLeaves;
    },
    save: async (id, leaveData) => {
      if (db) {
        await db.collection('leaves').doc(id).set(leaveData);
      }
      const existingIdx = localLeaves.findIndex(l => l.id === id);
      if (existingIdx !== -1) {
        localLeaves[existingIdx] = leaveData;
      } else {
        localLeaves.push(leaveData);
      }
      writeJsonFile(LEAVES_FILE, localLeaves);
    }
  },
  payslips: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('payslips').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return localPayslips;
    },
    save: async (id, payslipData) => {
      if (db) {
        await db.collection('payslips').doc(id).set(payslipData);
      }
      const existingIdx = localPayslips.findIndex(p => p.id === id);
      if (existingIdx !== -1) {
        localPayslips[existingIdx] = payslipData;
      } else {
        localPayslips.push(payslipData);
      }
      writeJsonFile(PAYSLIPS_FILE, localPayslips);
    }
  },
  feedbacks: {
    find: async () => {
      if (db) {
        const snapshot = await db.collection('feedbacks').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return localFeedbacks;
    },
    save: async (id, feedbackData) => {
      if (db) {
        await db.collection('feedbacks').doc(id).set(feedbackData);
      }
      const existingIdx = localFeedbacks.findIndex(f => f.id === id);
      if (existingIdx !== -1) {
        localFeedbacks[existingIdx] = feedbackData;
      } else {
        localFeedbacks.push(feedbackData);
      }
      writeJsonFile(FEEDBACKS_FILE, localFeedbacks);
    }
  }
};

module.exports = {
  db,
  auth,
  bucket,
  dbHelper,
  initializeFirestoreSync
};
