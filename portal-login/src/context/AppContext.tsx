import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebase } from './AuthContext';
import { auth } from '../config/firebase';
import type {
  User,
  Project,
  SupportTicket,
  Payment,
  AttendanceRecord,
  ChatMessage,
  WorkerTask,
  ProjectStatus,
  UserRole,
  Deliverable,
  Milestone
} from '../types';

const getCsrfToken = () => {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').find(row => row.startsWith('csrfToken='))?.split('=')[1] || '';
};

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: User | null;
  login: (id: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (googleUser?: { name: string; email: string; picture?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerClient: (userData: Omit<User, 'role' | 'id'>) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  routerParams: any;
  setRouterParams: (params: any) => void;
  loading: boolean;
  error: string | null;
  
  // Data lists
  users: User[];
  projects: Project[];
  tickets: SupportTicket[];
  payments: Payment[];
  attendance: AttendanceRecord[];
  messages: ChatMessage[];
  tasks: WorkerTask[];
  notifications: { id: string; text: string; type: 'info' | 'success' | 'warning'; timestamp: string }[];

  // Actions
  addProject: (projectData: {
    title: string;
    category: string;
    description: string;
    techRequired: string[];
    budget: number;
    deadline: string;
    additionalNotes?: string;
    deliverables?: any[];
  }) => string;
  updateProjectStatus: (projectId: string, status: ProjectStatus, progress?: number) => void;
  assignProjectWorker: (projectId: string, workerId: string) => void;
  addDeliverable: (projectId: string, deliverableName: string, url: string, uploadedBy: string) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;
  addMilestone: (projectId: string, title: string) => void;
  
  // Ticket Actions
  addTicket: (subject: string, category: string, description: string, priority: 'low' | 'medium' | 'high') => void;
  replyToTicket: (ticketId: string, content: string) => void;
  resolveTicket: (ticketId: string) => void;

  // Payments
  addPayment: (projectId: string, amount: number, method: Payment['paymentMethod']) => void;

  // Chat
  sendChatMessage: (recipientId: string, content: string) => void;

  // Workers
  markAttendance: (workerId: string, status: 'present' | 'absent') => void;
  addWorkerTask: (taskData: Omit<WorkerTask, 'id' | 'status'>) => void;
  updateTaskStatus: (taskId: string, status: WorkerTask['status']) => void;
  updateWorkerPerformance: (workerId: string, score: number) => void;
  updateWorkerSalary: (workerId: string, salary: number) => void;
  addWorker: (workerData: User) => { success: boolean; error?: string };

  // Clients
  addClient: (clientData: User) => { success: boolean; error?: string };
  editClient: (clientId: string, clientData: Partial<User>) => void;
  deleteClient: (clientId: string) => void;
  
  // System Profile
  companyProfile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
  };
  updateCompanyProfile: (profile: any) => void;
  addNotification: (text: string, type: 'info' | 'success' | 'warning') => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Seeds — IDs must match admin0 AppContext exactly so localStorage session transfers correctly
const DEFAULT_USERS: User[] = [
  {
    id: 'admin_owner',
    name: 'Admin Owner',
    email: 'admin@zentrio.ai',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'syedrashid_W1',
    name: 'Syed Rashid',
    email: 'syed.r@zentrio.ai',
    role: 'worker',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    performanceScore: 94,
    salary: 8500,
    joinedDate: '2025-01-15'
  },
  {
    id: 'rishigesh_W2',
    name: 'Rishigesh',
    email: 'rishi@zentrio.ai',
    role: 'worker',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    performanceScore: 88,
    salary: 9200,
    joinedDate: '2025-03-10'
  },
  {
    id: 'pushparaj_W3',
    name: 'Pushparaj',
    email: 'pushpa.r@zentrio.ai',
    role: 'worker',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    performanceScore: 97,
    salary: 10500,
    joinedDate: '2024-11-01'
  },
  {
    id: 'client@company.com',
    name: 'John Smith',
    email: 'client@company.com',
    role: 'client',
    companyName: 'NexusCorp',
    mobile: '+1 555-0199',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'
  }
];

export const DEFAULT_PROJECTS: Project[] = [
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
    createdAt: '2026-07-01',
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
    createdAt: '2026-06-15',
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
    createdAt: '2026-06-01',
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

const DEFAULT_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-201',
    clientId: 'client@company.com',
    clientName: 'John Smith',
    subject: 'Production API Credentials Required',
    category: 'API & Integration',
    description: 'We need the final credentials to plug the AI Support agent webhook endpoints into our Zendesk client to begin beta testing.',
    status: 'open',
    priority: 'high',
    createdAt: '2026-07-10T14:30:00Z',
    messages: [
      {
        id: 'msg1',
        senderId: 'client@company.com',
        senderName: 'John Smith',
        senderRole: 'client',
        content: 'Hi Support, we are planning our beta launch for the AI Agent next week and need the Zendesk integration credentials. Could you please share them?',
        timestamp: '2026-07-10T14:30:00Z'
      },
      {
        id: 'msg2',
        senderId: 'ADMIN001',
        senderName: 'Emma Sterling',
        senderRole: 'admin',
        content: 'Hi John, David Chen is currently configuring the production security headers for the webhooks. We will generate the secure API keys and post them here by tomorrow morning.',
        timestamp: '2026-07-10T16:45:00Z'
      }
    ]
  }
];

export const DEFAULT_PAYMENTS: Payment[] = [
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
    date: '2026-07-01'
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
    date: '2026-07-05'
  }
];

const DEFAULT_TASKS: WorkerTask[] = [
  {
    id: 'TSK-101',
    workerId: 'WORKER003',
    projectId: 'PRJ-8012',
    projectTitle: 'AI Customer Service Agent',
    title: 'Train LLM on Support Dataset',
    description: 'Run fine-tuning sequence with clean dataset. Resolve overfitting issues on token limit inputs.',
    priority: 'high',
    status: 'in_progress',
    deadline: '2026-07-15'
  },
  {
    id: 'TSK-102',
    workerId: 'WORKER001',
    projectId: 'PRJ-5401',
    projectTitle: 'NextGen E-Commerce Platform',
    title: 'Optimize Checkout Form Styles',
    description: 'Ensure full validation on billing inputs and implement smooth glassmorphic modal loaders.',
    priority: 'medium',
    status: 'completed',
    deadline: '2026-07-08'
  },
  {
    id: 'TSK-103',
    workerId: 'WORKER002',
    projectId: 'PRJ-3199',
    projectTitle: 'Apex Mobile Analytics App',
    title: 'Submit Expo builds to Store',
    description: 'Compile production packages for both iOS and Android App Stores and pass review checks.',
    priority: 'high',
    status: 'completed',
    deadline: '2026-07-05'
  }
];

export const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'cht1',
    senderId: 'ADMIN001',
    senderName: 'Emma Sterling',
    senderRole: 'admin',
    recipientId: 'internal-team',
    content: 'Team, please review the current milestones for NextGen E-Commerce and make sure all deliverables are uploaded directly via the portals.',
    timestamp: '2026-07-11T09:00:00Z'
  },
  {
    id: 'cht2',
    senderId: 'WORKER003',
    senderName: 'David Chen',
    senderRole: 'worker',
    recipientId: 'internal-team',
    content: 'Roger that. I uploaded the architecture layout for the AI support agent.',
    timestamp: '2026-07-11T09:15:00Z'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Current logged in user
  const { user, userProfile, login: firebaseLogin, signUp: firebaseSignUp, logout: firebaseLogout, loading: authLoading, resendVerification: firebaseResendVerification, sendPasswordReset: firebaseSendPasswordReset } = useFirebase();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user && userProfile) {
        const clientUser: User = {
          id: userProfile.role === 'admin' ? 'ADMIN001' : userProfile.email,
          name: userProfile.username,
          email: userProfile.email,
          role: userProfile.role as UserRole,
          companyName: userProfile.companyName || '',
          clientId: userProfile.companyName || '',
          mobile: userProfile.mobile || '',
          country: userProfile.country || '',
          state: userProfile.state || '',
          city: userProfile.city || '',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.username)}`
        };
        setCurrentUser(clientUser);
        localStorage.setItem('current_user', JSON.stringify(clientUser));
      } else {
        const saved = sessionStorage.getItem('current_user');
        if (saved) {
          const u = JSON.parse(saved);
          if (u.role === 'worker' || u.role === 'admin') {
            setCurrentUser(u);
            return;
          }
          if (userProfile) {
            setCurrentUser(u);
            return;
          }
        }
        if (currentUser) {
          return;
        }
        setCurrentUser(null);
      }
    }
  }, [user, userProfile, authLoading]);


  // Custom single page router
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const path = window.location.pathname.replace(/\/$/, '');
    if (path.includes('/reset-password')) return 'reset-password';

    // 1. If path explicitly matches one of the portal forms, load it directly
    if (path.endsWith('/client-login')) return 'client-login';
    if (path.endsWith('/worker-login')) return 'worker-login';
    if (path.endsWith('/admin-login')) return 'admin-login';
    if (path.endsWith('/client-register')) return 'client-register';
    if (path.endsWith('/portal-selector')) return 'portal-selector';

    // 2. Otherwise, check if user session is saved in sessionStorage and restore it
    const savedUser = sessionStorage.getItem('current_user');
    if (savedUser) {
      const u = JSON.parse(savedUser) as User;
      return `${u.role}-dashboard`;
    }
    
    return 'portal-selector'; // Default landing page for portal-login project
  });
  const [routerParams, setRouterParams] = useState<any>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('/reset-password')) {
      const params = new URLSearchParams(window.location.search);
      return {
        token: params.get('token') || '',
        email: params.get('email') || ''
      };
    }
    return {};
  });

  // DB collections — seed workers/admin from DEFAULT_USERS so they're always available
  const [users, setUsers] = useState<User[]>(
    DEFAULT_USERS.filter(u => u.role === 'worker' || u.role === 'admin')
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('db_tickets');
    return saved ? JSON.parse(saved) : DEFAULT_TICKETS;
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('db_attendance');
    return saved ? JSON.parse(saved) : [];
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tasks, setTasks] = useState<WorkerTask[]>(() => {
    const saved = localStorage.getItem('db_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const loading = dataLoading || authLoading;
  const [error, setError] = useState<string | null>(null);

  // Fetch all live collections from Firebase Firestore API endpoints in parallel
  useEffect(() => {
    const fetchAllData = async () => {
      setDataLoading(true);
      setError(null);
      try {
        // Trigger all requests simultaneously; /me returning 401 is NOT an error — it just means no session
        const [usersRes, projectsRes, paymentsRes, messagesRes, authRes, tasksRes] = await Promise.all([
          fetch('/api/users').catch(() => null),
          fetch('/api/projects').catch(() => null),
          fetch('/api/payments').catch(() => null),
          fetch('/api/messages').catch(() => null),
          fetch('/api/auth/me').catch(() => null),
          fetch('/api/tasks').catch(() => null)
        ]);

        // Validate critical APIs — if any non-auth endpoint is completely unreachable throw
        if (!usersRes) throw new Error('Unable to reach Zentrio backend. Ensure the server is running on port 3000.');

        // Parse JSON payloads safely
        const safeJson = async (res: Response | null) => {
          try { return res && res.ok ? await res.json() : null; } catch { return null; }
        };
        const [usersData, projectsData, paymentsData, messagesData, authData, tasksData] = await Promise.all([
          safeJson(usersRes),
          safeJson(projectsRes),
          safeJson(paymentsRes),
          safeJson(messagesRes),
          // For /me, parse JSON regardless of status so we can read the body
          authRes ? authRes.json().catch(() => null) : Promise.resolve(null),
          safeJson(tasksRes)
        ]);

        // Process Users — merge with existing seeded workers/admin
        if (usersData?.success && usersData.users) {
          const normalizedUsers: User[] = usersData.users.map((u: any) => ({
            id: u.role === 'admin' ? 'ADMIN001' : (u.role === 'worker' ? (u.id || u._id) : u.email),
            name: u.username,
            email: u.email,
            role: u.role,
            companyName: u.companyName,
            clientId: u.clientId || u.companyName,
            mobile: u.mobile,
            country: u.country,
            state: u.state,
            city: u.city,
            avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.username)}`
          }));
          // Always keep seeded workers/admin intact; merge in API users (clients)
          setUsers(prev => {
            const seedWorkers = DEFAULT_USERS.filter(u => u.role === 'worker' || u.role === 'admin');
            const apiClients = normalizedUsers.filter(u => u.role === 'client');
            const existingWorkers = prev.filter(u => u.role === 'worker' || u.role === 'admin');
            // Prefer existing seed workers; add any API workers not already present
            const mergedWorkers = existingWorkers.length > 0 ? existingWorkers : seedWorkers;
            return [...mergedWorkers, ...apiClients];
          });
        }

        // Process Projects
        if (projectsData?.success && projectsData.projects) {
          setProjects(projectsData.projects);
        }

        // Process Payments
        if (paymentsData?.success && paymentsData.payments) {
          setPayments(paymentsData.payments);
        }

        // Process Messages
        if (messagesData?.success && messagesData.messages) {
          setMessages(messagesData.messages);
        }

        // Process Tasks
        if (tasksData?.success && tasksData.tasks) {
          setTasks(tasksData.tasks);
        }

        // Process Restore Session from Backend Cookie — 401 just means no active session, not an error
        if (authData?.success && authData.user) {
          const { email, role, username, companyName, mobile, country, state } = authData.user;
          
          const restoredId = authData.user.id || (role === 'admin' ? 'ADMIN001' : email);
          const restoredUser: User = {
            id: restoredId,
            name: username,
            email,
            role: role as UserRole,
            companyName: companyName || '',
            clientId: companyName || '',
            mobile: mobile || '',
            country: country || '',
            state: state || '',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`
          };

          setCurrentUser(restoredUser);
          setUsers(prev => [
            ...prev.filter(u => u.email !== restoredUser.email),
            restoredUser
          ]);

          // Always route authenticated user to their role dashboard
          setCurrentPage(`${role}-dashboard`);
        } else {
          // No valid backend session — clear stale session completely
          setCurrentUser(null);
          localStorage.removeItem('current_user');
        }
      } catch (err: any) {
        console.error('Failed to fetch data from API:', err);
        setError(err.message || 'Failed to connect to Zentrio backend APIs.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchAllData();

    // Background live polling interval for real-time internal updates every 3 seconds
    const interval = setInterval(async () => {
      try {
        const [msgsRes, tsksRes, prjsRes] = await Promise.all([
          fetch('/api/messages').catch(() => null),
          fetch('/api/tasks').catch(() => null),
          fetch('/api/projects').catch(() => null)
        ]);
        if (msgsRes && msgsRes.ok) {
          const mData = await msgsRes.json().catch(() => null);
          if (mData?.success && mData.messages) setMessages(mData.messages);
        }
        if (tsksRes && tsksRes.ok) {
          const tData = await tsksRes.json().catch(() => null);
          if (tData?.success && tData.tasks) setTasks(tData.tasks);
        }
        if (prjsRes && prjsRes.ok) {
          const pData = await prjsRes.json().catch(() => null);
          if (pData?.success && pData.projects) setProjects(pData.projects);
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  const [notifications, setNotifications] = useState<{ id: string; text: string; type: 'info' | 'success' | 'warning'; timestamp: string }[]>([
    { id: 'not1', text: 'Welcome to Zentrio Admin Workspace. All secure session ports are open.', type: 'success', timestamp: new Date().toLocaleTimeString() }
  ]);

  const [companyProfile, setCompanyProfile] = useState({
    name: 'Zentrio AI',
    email: 'contact@zentrio.ai',
    phone: '+1 (555) 234-5678',
    address: '100 Pine Street, Suite 2400, San Francisco, CA 94111',
    taxId: 'TXN-77-849102'
  });

  // Synchronize history/URL path when page changes
  useEffect(() => {
    const basePath = window.location.pathname.startsWith('/portal') ? '/portal' : (window.location.pathname.startsWith('/admin') ? '/admin' : '');
    let targetPath = '';
    if (currentPage === 'portal-selector') targetPath = '/portal-selector';
    else if (currentPage === 'home' || currentPage === 'client-login') targetPath = '/client-login';
    else if (currentPage === 'worker-login') targetPath = '/worker-login';
    else if (currentPage === 'admin-login') targetPath = '/admin-login';
    else if (currentPage === 'client-register') targetPath = '/client-register';
    
    if (targetPath !== '') {
      const newUrl = `${basePath}${targetPath}`;
      if (window.location.pathname !== newUrl && !window.location.pathname.includes('-dashboard')) {
        window.history.pushState(null, '', newUrl);
      }
    }
  }, [currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/$/, '');
      if (path.endsWith('/client-login')) setCurrentPage('client-login');
      else if (path.endsWith('/worker-login')) setCurrentPage('worker-login');
      else if (path.endsWith('/admin-login')) setCurrentPage('admin-login');
      else if (path.endsWith('/client-register')) setCurrentPage('client-register');
      else setCurrentPage('client-login');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const rootElement = window.document.documentElement;
    if (theme === 'dark') {
      rootElement.classList.add('dark');
      rootElement.setAttribute('data-theme', 'dark');
    } else {
      rootElement.classList.remove('dark');
      rootElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('db_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('db_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('db_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('db_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('db_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('db_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('db_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('current_user', JSON.stringify(currentUser));
      localStorage.removeItem('current_user');
    } else {
      sessionStorage.removeItem('current_user');
      localStorage.removeItem('current_user');
    }
  }, [currentUser]);

  // Security Policy: Auto logout on inactivity or tab hidden for more than 5 minutes
  useEffect(() => {
    if (!currentUser) return;

    // 1. Detect switching away / Tab shifts
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.setItem('tab_hidden_timestamp', Date.now().toString());
      } else if (document.visibilityState === 'visible') {
        const hiddenTimeStr = sessionStorage.getItem('tab_hidden_timestamp');
        if (hiddenTimeStr) {
          const hiddenTime = parseInt(hiddenTimeStr, 10);
          const elapsed = Date.now() - hiddenTime;
          const limit = 5 * 60 * 1000; // 5 minutes threshold
          if (elapsed > limit) {
            sessionStorage.removeItem('tab_hidden_timestamp');
            logout();
          }
        }
      }
    };

    // 2. Client-side inactivity idle logout (5 minutes idle)
    let idleTimeout: any;
    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        logout();
      }, 5 * 60 * 1000); // 5 minutes idle
    };

    // 3. Listen to local storage to sync logout across other open tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'portal_logged_out') {
        logout();
      }
    };

    // Event Listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(evt => {
      document.addEventListener(evt, resetIdleTimer);
    });

    // Run active idle timer
    resetIdleTimer();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      events.forEach(evt => {
        document.removeEventListener(evt, resetIdleTimer);
      });
      clearTimeout(idleTimeout);
    };
  }, [currentUser]);

  // Auth Operations
  const login = async (id: string, password: string, role: UserRole) => {
    try {
      let clientUser: User | null = null;
      let userRole: UserRole = role;

      // 1. Attempt backend database authentication first
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({ email: id, password, role })
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          userRole = (data.user.role as UserRole) || role;
          if (userRole !== role) {
            await fetch('/api/auth/clear-session').catch(() => {});
            return { success: false, error: `Access restricted. Account role is ${userRole}, not ${role}.` };
          }
          clientUser = {
            id: data.user.id || (userRole === 'admin' ? 'ADMIN001' : data.user.email),
            name: data.user.username,
            email: data.user.email,
            role: userRole,
            companyName: data.user.companyName || '',
            clientId: data.user.companyName || '',
            mobile: data.user.mobile || '',
            country: data.user.country || '',
            state: data.user.state || '',
            city: data.user.city || '',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.username)}`
          };

          // Establish client-side Firebase Auth session to prevent ProtectedRoute redirect loops
          try {
            await firebaseLogin(data.user.email || id, password);
          } catch (fbErr) {
            console.warn('Firebase session synchronization failed:', fbErr);
          }
        } else if (data && !data.success && data.message) {
          return { success: false, error: data.message };
        }
      } catch (backendErr) {
        console.warn('Backend login API check failed:', backendErr);
      }

      // 2. Firebase Fallback if backend didn't authenticate
      if (!clientUser) {
        const profile = await firebaseLogin(id, password);
        if (profile.role !== role && role !== 'admin') {
          await firebaseLogout();
          return { success: false, error: `Access restricted. This account is registered as a ${profile.role}, not a ${role}.` };
        }
        clientUser = {
          id: profile.role === 'admin' ? 'ADMIN001' : profile.email,
          name: profile.username,
          email: profile.email,
          role: profile.role,
          companyName: profile.companyName || '',
          clientId: profile.companyName || '',
          mobile: profile.mobile || '',
          country: profile.country || '',
          state: profile.state || '',
          city: profile.city || '',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.username)}`
        };
      }
      
      setCurrentUser(clientUser);
      localStorage.removeItem('portal_logged_out');
      setUsers(prev => [...prev.filter(u => u.email !== clientUser!.email), clientUser!]);
      setCurrentPage(`${clientUser.role}-dashboard`);
      addNotification('Login successful', 'success');
      return { success: true, message: 'Login successful' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Invalid email or password.' };
    }
  };

  const loginWithGoogle = async (googleUser?: { name: string; email: string; picture?: string }) => {
    try {
      let gName = googleUser?.name;
      let gEmail = googleUser?.email;
      let gPicture = googleUser?.picture;

      if (!gEmail) {
        try {
          const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          gEmail = userCredential.user.email || '';
          gName = userCredential.user.displayName || gEmail.split('@')[0];
          gPicture = userCredential.user.photoURL || '';
        } catch (popupErr) {
          console.warn('Google popup error:', popupErr);
        }
      }

      if (!gEmail) {
        return { success: false, error: 'Google authentication failed. No email provided.' };
      }

      // Call backend API /api/auth/google-onboard to log in or register the user and issue session token
      let clientUser: User;
      try {
        const res = await fetch('/api/auth/google-onboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({
            name: gName || gEmail.split('@')[0],
            email: gEmail
          })
        });
        const data = await res.json();

        if (res.ok && data.success && data.user) {
          clientUser = {
            id: data.user.email,
            name: data.user.username,
            email: data.user.email,
            role: (data.user.role as UserRole) || 'client',
            companyName: data.user.companyName || '',
            clientId: data.user.companyName || '',
            mobile: data.user.mobile || '',
            country: data.user.country || '',
            state: data.user.state || '',
            avatar: gPicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.user.username)}`
          };
        } else {
          clientUser = {
            id: gEmail,
            name: gName || gEmail.split('@')[0],
            email: gEmail,
            role: 'client',
            companyName: '',
            clientId: '',
            mobile: '',
            country: '',
            state: '',
            avatar: gPicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(gName || gEmail)}`
          };
        }
      } catch (backendErr) {
        clientUser = {
          id: gEmail,
          name: gName || gEmail.split('@')[0],
          email: gEmail,
          role: 'client',
          companyName: '',
          clientId: '',
          mobile: '',
          country: '',
          state: '',
          avatar: gPicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(gName || gEmail)}`
        };
      }

      setCurrentUser(clientUser);
      setUsers(prev => [...prev.filter(u => u.email !== clientUser.email), clientUser]);
      setCurrentPage('client-dashboard');
      addNotification('Successfully registered', 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in failed.' };
    }
  };

  const registerClient = async (userData: Omit<User, 'role' | 'id'>) => {
    try {
      // 1. Post to backend /api/auth/signup to persist in database & send welcome email
      let backendSuccess = false;
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            clientId: userData.clientId || userData.companyName,
            state: userData.state,
            country: userData.country,
            mobile: userData.mobile
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          backendSuccess = true;
        }
      } catch (bErr) {
        console.warn('Backend signup API call failed:', bErr);
      }

      // 2. Also register in Firebase Auth
      try {
        await firebaseSignUp(userData.email, userData.password || '', {
          username: userData.name,
          companyName: userData.clientId || userData.companyName || '',
          mobile: userData.mobile || '',
          state: userData.state || '',
        });
      } catch (fbErr: any) {
        if (!backendSuccess) {
          return { success: false, error: fbErr.message || 'Registration failed.' };
        }
      }
      
      const newUser: User = {
        id: userData.email,
        name: userData.name,
        email: userData.email,
        role: 'client',
        companyName: userData.clientId || userData.companyName || '',
        clientId: userData.clientId || userData.companyName || '',
        mobile: userData.mobile || '',
        state: userData.state || '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`
      };
      
      setUsers(prev => [...prev.filter(u => u.email !== newUser.email), newUser]);
      setCurrentUser(newUser);
      setCurrentPage('client-dashboard');
      addNotification('Successfully registered', 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const resendVerification = async () => {
    await firebaseResendVerification();
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch reset link.');
      }
    } catch (err: any) {
      console.warn('Backend forgot-password API failed, attempting Firebase fallback:', err.message);
      await firebaseSendPasswordReset(email);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        }
      }).catch(() => {});
    } catch (e) {
      console.warn('Backend logout API failed:', e);
    }

    try {
      await fetch('/api/auth/clear-session').catch(() => {});
    } catch (e) {}

    try {
      await firebaseLogout();
    } catch (e) {
      console.warn('Firebase logout failed', e);
    }

    const loggedOutRole = currentUser?.role;
    setCurrentUser(null);
    sessionStorage.removeItem('current_user');
    localStorage.removeItem('current_user');
    localStorage.setItem('portal_logged_out', Date.now().toString());
    addNotification('Session closed successfully.', 'info');
    if (loggedOutRole === 'worker') {
      setCurrentPage('worker-login');
      window.location.href = '/portal/worker-login';
    } else if (loggedOutRole === 'admin') {
      setCurrentPage('admin-login');
      window.location.href = '/portal/admin-login';
    } else {
      setCurrentPage('client-login');
      window.location.href = '/portal/client-login';
    }
  };

  const addNotification = (text: string, type: 'info' | 'success' | 'warning') => {
    setNotifications(prev => [
      { id: Math.random().toString(36).substring(7), text, type, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19) // Limit to last 20
    ]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Projects Operations
  const addProject = (projectData: {
    title: string;
    category: string;
    description: string;
    techRequired: string[];
    budget: number;
    deadline: string;
    additionalNotes?: string;
    deliverables?: any[];
  }) => {
    if (!currentUser || currentUser.role !== 'client') return '';

    const newId = `PRJ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newProject: Project = {
      ...projectData,
      id: newId,
      clientId: currentUser.email,
      clientName: currentUser.name,
      clientCompany: currentUser.companyName || 'Private client',
      status: 'pending',
      progress: 0,
      milestones: [
        { id: 'm_init', title: 'Project Proposal Review', status: 'pending' },
        { id: 'm_spec', title: 'Detailed Requirement Specification', status: 'pending' }
      ],
      deliverables: projectData.deliverables || [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProjects(prev => [newProject, ...prev]);
    addNotification(`Project request "${projectData.title}" submitted successfully!`, 'success');

    fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(newProject)
    }).catch(err => console.error('Failed to save project to Firebase Firestore:', err));

    fetch('/api/email/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify({
        type: 'PROJECT_REQUEST',
        to: currentUser.email,
        name: currentUser.name,
        params: { projectName: projectData.title }
      })
    }).catch(err => console.error('Failed to send project request notification:', err));

    fetch('/api/email/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify({
        type: 'ADMIN_NOTIFICATION',
        to: 'zentriotechnology3@gmail.com',
        params: {
          subject: `New Project Request - ${projectData.title}`,
          text: `A new project request was created by client: ${currentUser.name}.\nProject: ${projectData.title}\nCategory: ${projectData.category}\nBudget: ₹${projectData.budget}\nDeadline: ${projectData.deadline}\nDescription: ${projectData.description}`
        }
      })
    }).catch(err => console.error('Failed to send project request admin alert:', err));

    return newId;
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus, progress?: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextProgress = progress !== undefined ? progress : p.progress;
        
        // Auto mark milestones based on completed transitions
        let nextMilestones = [...p.milestones];
        if (status === 'completed' || status === 'delivered') {
          nextMilestones = nextMilestones.map(m => ({ ...m, status: 'completed' }));

          // Trigger email notification to client
          fetch('/api/email/notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({
              type: 'PROJECT_COMPLETED',
              to: p.clientId,
              name: p.clientName,
              params: { projectName: p.title }
            })
          }).catch(err => console.error('Failed to send project completed email to client:', err));

          // Trigger email notification to admin
          fetch('/api/email/notify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': getCsrfToken()
            },
            body: JSON.stringify({
              type: 'ADMIN_NOTIFICATION',
              to: 'zentriotechnology3@gmail.com',
              params: {
                subject: `Project Completed - ${p.title}`,
                text: `Project "${p.title}" (ID: ${p.id}) has been marked as COMPLETED/DELIVERED.\nClient: ${p.clientName}\nAssigned Worker: ${p.assignedWorkerName || 'Unassigned'}`
              }
            })
          }).catch(err => console.error('Failed to send project completed admin alert:', err));
        }

        return {
          ...p,
          status,
          progress: nextProgress,
          milestones: nextMilestones
        };
      }
      return p;
    }));
    addNotification(`Project status updated: ${projectId} -> ${status.toUpperCase()}`, 'info');
  };

  const assignProjectWorker = (projectId: string, workerId: string) => {
    const worker = users.find(u => u.id === workerId);
    if (!worker) return;

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        // Trigger email notification to worker
        fetch('/api/email/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({
            type: 'PROJECT_ASSIGNED',
            to: worker.email,
            name: worker.name,
            params: {
              projectName: p.title,
              clientName: p.clientName,
              deadline: p.deadline
            }
          })
        }).catch(err => console.error('Failed to send project assignment email:', err));

        return {
          ...p,
          assignedWorkerId: workerId,
          assignedWorkerName: worker.name,
          status: p.status === 'pending' || p.status === 'review' || p.status === 'approved' ? 'assigned' : p.status
        };
      }
      return p;
    }));
    addNotification(`Assigned worker ${worker.name} to project ${projectId}.`, 'success');
  };

  const addDeliverable = (projectId: string, deliverableName: string, url: string, uploadedBy: string) => {
    const newDeliverable: Deliverable = {
      id: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      name: deliverableName,
      url,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          deliverables: [...p.deliverables, newDeliverable]
        };
      }
      return p;
    }));
    addNotification(`Uploaded deliverable "${deliverableName}" to project ${projectId}.`, 'success');
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextMilestones = p.milestones.map(m => 
          m.id === milestoneId ? { ...m, status: (m.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' } : m
        );
        const completedCount = nextMilestones.filter(m => m.status === 'completed').length;
        const progressPercent = Math.round((completedCount / nextMilestones.length) * 100);

        return {
          ...p,
          milestones: nextMilestones,
          progress: progressPercent
        };
      }
      return p;
    }));
  };

  const addMilestone = (projectId: string, title: string) => {
    const newMilestone: Milestone = {
      id: `mil_${Math.random().toString(36).substring(7)}`,
      title,
      status: 'pending'
    };
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextMilestones = [...p.milestones, newMilestone];
        const completedCount = nextMilestones.filter(m => m.status === 'completed').length;
        const progressPercent = Math.round((completedCount / nextMilestones.length) * 100);

        return {
          ...p,
          milestones: nextMilestones,
          progress: progressPercent
        };
      }
      return p;
    }));
    addNotification(`New milestone added: "${title}"`, 'success');
  };

  // Support Tickets Operations
  const addTicket = (subject: string, category: string, description: string, priority: 'low' | 'medium' | 'high') => {
    if (!currentUser || currentUser.role !== 'client') return;

    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      clientId: currentUser.email,
      clientName: currentUser.name,
      subject,
      category,
      description,
      status: 'open',
      priority,
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_init_${Math.random().toString(36).substring(7)}`,
          senderId: currentUser.email,
          senderName: currentUser.name,
          senderRole: 'client',
          content: description,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    addNotification(`Support Ticket "${subject}" raised.`, 'info');
  };

  const replyToTicket = (ticketId: string, content: string) => {
    if (!currentUser) return;

    const newReply = {
      id: `msg_${Math.random().toString(36).substring(7)}`,
      senderId: currentUser.id || currentUser.email,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content,
      timestamp: new Date().toISOString()
    };

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: currentUser.role === 'client' ? 'open' : t.status, // client reply reopens/keeps open
          messages: [...t.messages, newReply]
        };
      }
      return t;
    }));
  };

  const resolveTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'resolved' };
      }
      return t;
    }));
    addNotification(`Ticket ${ticketId} resolved.`, 'success');
  };

  // Payments Operations
  const addPayment = (projectId: string, amount: number, method: Payment['paymentMethod']) => {
    if (!currentUser || currentUser.role !== 'client') return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newPayment: Payment = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      projectId,
      projectTitle: project.title,
      clientId: currentUser.email,
      clientName: currentUser.name,
      amount,
      paymentMethod: method,
      status: 'success',
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0]
    };

    setPayments(prev => [newPayment, ...prev]);
    addNotification(`Payment of $${amount.toLocaleString()} successful! Invoice issued.`, 'success');

    fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(newPayment)
    }).catch(err => console.error('Failed to save payment to Firebase Firestore:', err));

    // Trigger email notification to client
    fetch('/api/email/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify({
        type: 'INVOICE_GENERATED',
        to: currentUser.email,
        name: currentUser.name,
        params: {
          invoiceId: newPayment.invoiceNumber,
          amount: amount,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      })
    }).catch(err => console.error('Failed to send invoice notification email to client:', err));

    // Trigger email notification to admin
    fetch('/api/email/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify({
        type: 'ADMIN_NOTIFICATION',
        to: 'zentriotechnology3@gmail.com',
        params: {
          subject: `Payment Received - ${newPayment.invoiceNumber}`,
          text: `A payment of ₹${amount} was received for project "${project.title}".\nClient: ${currentUser.name}\nPayment Method: ${method}\nTransaction ID: ${newPayment.id}\nInvoice: ${newPayment.invoiceNumber}`
        }
      })
    }).catch(err => console.error('Failed to send payment admin alert:', err));
  };

  // Chat Operations
  const sendChatMessage = (recipientId: string, content: string) => {
    if (!currentUser) return;

    const newMsg: ChatMessage = {
      id: `cht_${Math.random().toString(36).substring(7)}`,
      senderId: currentUser.id || currentUser.email,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId,
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(newMsg)
    }).catch(err => console.error('Failed to save message to Firebase Firestore:', err));
  };

  // Workers Operations
  const markAttendance = (workerId: string, status: 'present' | 'absent') => {
    const today = new Date().toISOString().split('T')[0];
    const checkInTime = status === 'present' ? new Date().toLocaleTimeString() : undefined;

    setAttendance(prev => {
      // Remove today's record if it exists, to overwrite it
      const filtered = prev.filter(r => !(r.workerId === workerId && r.date === today));
      return [
        ...filtered,
        {
          workerId,
          date: today,
          status,
          checkIn: checkInTime,
          checkOut: status === 'present' ? '18:00:00' : undefined
        }
      ];
    });

    addNotification(`Attendance marked: ${status.toUpperCase()} for worker ${workerId}`, 'info');
  };

  const addWorkerTask = (taskData: Omit<WorkerTask, 'id' | 'status'>) => {
    const newTaskId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    const newTask: WorkerTask = {
      ...taskData,
      id: newTaskId,
      status: 'pending'
    };

    setTasks(prev => [newTask, ...prev]);
    fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(newTask)
    }).catch(err => console.error('Failed to save task to backend:', err));

    addNotification(`New task assigned to Worker ${taskData.workerId}.`, 'info');
  };

  const updateTaskStatus = (taskId: string, status: WorkerTask['status']) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, status };
        fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify(updated)
        }).catch(err => console.error('Failed to update task in backend:', err));
        return updated;
      }
      return t;
    }));
    addNotification(`Task ${taskId} status updated to: ${status.toUpperCase()}`, 'info');
  };

  const updateWorkerPerformance = (workerId: string, score: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === workerId && u.role === 'worker') {
        return { ...u, performanceScore: score };
      }
      return u;
    }));
    addNotification(`Worker performance score adjusted: ${score}%`, 'info');
  };

  const updateWorkerSalary = (workerId: string, salary: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === workerId && u.role === 'worker') {
        return { ...u, salary };
      }
      return u;
    }));
    addNotification(`Worker salary updated to $${salary.toLocaleString()}/mo`, 'success');
  };

  const addWorker = (workerData: User) => {
    const exists = users.some(u => u.id === workerData.id || u.email.toLowerCase() === workerData.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Worker ID or Email already exists.' };
    }

    const newWorker: User = {
      ...workerData,
      role: 'worker',
      joinedDate: new Date().toISOString().split('T')[0],
      performanceScore: workerData.performanceScore || 100,
      avatar: workerData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(workerData.name)}`
    };

    setUsers(prev => [...prev, newWorker]);
    addNotification(`Worker ${workerData.name} added successfully.`, 'success');

    // Trigger email notification
    fetch('/api/email/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify({
        type: 'ACCOUNT_APPROVED',
        to: workerData.email,
        name: workerData.name
      })
    }).catch(err => console.error('Failed to send worker approval email:', err));

    return { success: true };
  };

  // Client Management (Admin Dashboard)
  const addClient = (clientData: User) => {
    const exists = users.some(u => u.email.toLowerCase() === clientData.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Client Email already registered.' };
    }

    const newClient: User = {
      ...clientData,
      role: 'client',
      avatar: clientData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(clientData.name)}`
    };

    setUsers(prev => [...prev, newClient]);
    if (clientData.password) {
      localStorage.setItem(`pass_${clientData.email.toLowerCase()}`, clientData.password);
    }
    addNotification(`Client ${clientData.name} added successfully.`, 'success');
    return { success: true };
  };

  const editClient = (clientId: string, clientData: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.email === clientId && u.role === 'client') {
        return { ...u, ...clientData };
      }
      return u;
    }));
    addNotification(`Client details updated.`, 'success');
  };

  const deleteClient = (clientId: string) => {
    setUsers(prev => prev.filter(u => !(u.email === clientId && u.role === 'client')));
    addNotification(`Client deleted successfully.`, 'warning');
  };

  const updateCompanyProfile = (profile: any) => {
    setCompanyProfile(prev => ({ ...prev, ...profile }));
    addNotification(`Company profile updated.`, 'success');
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      currentUser,
      login,
      loginWithGoogle,
      logout,
      registerClient,
      resendVerification,
      sendPasswordReset,
      currentPage,
      setCurrentPage,
      routerParams,
      setRouterParams,
      loading,
      error,
      
      users,
      projects,
      tickets,
      payments,
      attendance,
      messages,
      tasks,
      notifications,

      addProject,
      updateProjectStatus,
      assignProjectWorker,
      addDeliverable,
      toggleMilestone,
      addMilestone,
      
      addTicket,
      replyToTicket,
      resolveTicket,

      addPayment,
      sendChatMessage,

      markAttendance,
      addWorkerTask,
      updateTaskStatus,
      updateWorkerPerformance,
      updateWorkerSalary,
      addWorker,

      addClient,
      editClient,
      deleteClient,
      companyProfile,
      updateCompanyProfile,
      addNotification,
      clearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
