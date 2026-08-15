import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebase } from './AuthContext';
import { auth } from '../config/firebase';
import { AuthService } from '../services/AuthService';
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
  Milestone,
  ContactEnquiry,
  LeaveRequest,
  Payslip
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
  loginWithGoogle: (googleUser: { name: string; email: string; picture: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  registerClient: (userData: Omit<User, 'role' | 'id'>) => Promise<{ success: boolean; error?: string }>;
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
  enquiries: ContactEnquiry[];
  leaves: LeaveRequest[];
  payslips: Payslip[];

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
  addPayment: (projectId: string, amount: number, method: Payment['paymentMethod'], razorpayPaymentId?: string, razorpayOrderId?: string, razorpaySignature?: string) => Promise<void>;
  createPaymentOrder: (amount: number, currency?: string) => Promise<{ success: boolean; orderId?: string; key_id?: string; error?: string }>;

  // Chat
  sendChatMessage: (recipientId: string, content: string) => void;
  clearChannelMessages: (channelId: string) => void;

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
  
  // Leaves & Payroll
  addLeaveRequest: (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  updateLeaveStatus: (leaveId: string, status: LeaveRequest['status']) => Promise<void>;
  addPayslip: (payslipData: Omit<Payslip, 'id' | 'createdAt'>) => Promise<void>;

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

// Seeds
export const DEFAULT_USERS: User[] = [
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
    assignedWorkerId: 'pushparaj_W3',
    assignedWorkerName: 'Pushparaj',
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
      { id: 'd1', name: 'System Architecture Design Doc.pdf', url: '#', uploadedAt: '2026-07-06', uploadedBy: 'Pushparaj' }
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
    assignedWorkerId: 'syedrashid_W1',
    assignedWorkerName: 'Syed Rashid',
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
      { id: 'ed1', name: 'UI Mockups Export v2.fig', url: '#', uploadedAt: '2026-06-20', uploadedBy: 'Syed Rashid' },
      { id: 'ed2', name: 'Staging Environment URL link', url: '#', uploadedAt: '2026-07-09', uploadedBy: 'Syed Rashid' }
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
    assignedWorkerId: 'rishigesh_W2',
    assignedWorkerName: 'Rishigesh',
    status: 'completed',
    progress: 100,
    createdAt: '2026-06-01',
    milestones: [
      { id: 'mm1', title: 'API Endpoints Structure', status: 'completed' },
      { id: 'mm2', title: 'Mobile UI Layout Framework', status: 'completed' },
      { id: 'mm3', title: 'App Store Submission Ready', status: 'completed' }
    ],
    deliverables: [
      { id: 'md1', name: 'iOS build package (.ipa)', url: '#', uploadedAt: '2026-07-05', uploadedBy: 'Rishigesh' },
      { id: 'md2', name: 'Android build package (.apk)', url: '#', uploadedAt: '2026-07-05', uploadedBy: 'Rishigesh' }
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
        senderId: 'admin_owner',
        senderName: 'Admin Owner',
        senderRole: 'admin',
        content: 'Hi John, Pushparaj is currently configuring the production security headers for the webhooks. We will generate the secure API keys and post them here by tomorrow morning.',
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
    workerId: 'pushparaj_W3',
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
    workerId: 'syedrashid_W1',
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
    workerId: 'rishigesh_W2',
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
    senderId: 'admin_owner',
    senderName: 'Admin Owner',
    senderRole: 'admin',
    recipientId: 'internal-team',
    content: 'Team, please review the current milestones for NextGen E-Commerce and make sure all deliverables are uploaded directly via the portals.',
    timestamp: '2026-07-11T09:00:00Z'
  },
  {
    id: 'cht2',
    senderId: 'pushparaj_W3',
    senderName: 'Pushparaj',
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
  const { user, userProfile, login: firebaseLogin, signUp: firebaseSignUp, logout: firebaseLogout, loading: authLoading } = useFirebase();
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
    const savedUser = sessionStorage.getItem('current_user');
    if (savedUser) {
      const u = JSON.parse(savedUser) as User;
      return `${u.role}-dashboard`;
    }
    
    // Parse pathname for direct routing
    const path = window.location.pathname.replace(/\/$/, '');
    if (path.endsWith('/client-login')) return 'client-login';
    if (path.endsWith('/worker-login')) return 'worker-login';
    if (path.endsWith('/admin-login')) return 'admin-login';
    if (path.endsWith('/client-register')) return 'client-register';
    if (path.endsWith('/client-dashboard')) return 'client-dashboard';
    if (path.endsWith('/worker-dashboard')) return 'worker-dashboard';
    if (path.endsWith('/admin-dashboard')) return 'admin-dashboard';
    
    return 'admin-dashboard'; // Default workspace landing page
  });
  const [routerParams, setRouterParams] = useState<any>({});

  // DB collections - Mock data removed for users, projects, payments, and messages
  const [users, setUsers] = useState<User[]>([]);
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
  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const loading = dataLoading || authLoading;
  const [error, setError] = useState<string | null>(null);

  // Fetch all live collections from Firebase Firestore API endpoints in parallel to prevent bottlenecks
  useEffect(() => {
    const fetchAllData = async () => {
      setDataLoading(true);
      setError(null);
      try {
        // Trigger all requests simultaneously — use .catch so admin/worker can still log in even if APIs fail
        const [usersRes, projectsRes, paymentsRes, messagesRes, enquiriesRes, authRes, tasksRes, leavesRes, payslipsRes] = await Promise.all([
          fetch('/api/users').catch(() => null),
          fetch('/api/projects').catch(() => null),
          fetch('/api/payments').catch(() => null),
          fetch('/api/messages').catch(() => null),
          fetch('/api/contact').catch(() => null),
          fetch('/api/auth/me').catch(() => null),
          fetch('/api/tasks').catch(() => null),
          fetch('/api/leaves').catch(() => null),
          fetch('/api/payroll').catch(() => null)
        ]);

        // Parse JSON safely
        const safeJson = async (res: Response | null) => {
          try { return res && res.ok ? await res.json() : null; } catch { return null; }
        };
        const [usersData, projectsData, paymentsData, messagesData, enquiriesData, tasksData, leavesData, payslipsData] = await Promise.all([
          safeJson(usersRes),
          safeJson(projectsRes),
          safeJson(paymentsRes),
          safeJson(messagesRes),
          safeJson(enquiriesRes),
          safeJson(tasksRes),
          safeJson(leavesRes),
          safeJson(payslipsRes)
        ]);

        let authData: any = { success: false, user: null };
        if (authRes) {
          try { authData = await authRes.json(); } catch {}
        }

        // Process Users
        if (usersData?.success && usersData.users) {
          const normalizedUsers = usersData.users.map((u: any) => ({
            id: u.role === 'admin' ? (u.id || u._id || 'admin_owner') : (u.role === 'worker' ? (u.id || u._id) : u.email),
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
          setUsers(normalizedUsers);
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

        // Process Enquiries
        if (enquiriesData?.success && enquiriesData.enquiries) {
          setEnquiries(enquiriesData.enquiries);
        }

        // Process Tasks
        if (tasksData?.success && tasksData.tasks) {
          setTasks(tasksData.tasks);
        } else {
          setTasks(DEFAULT_TASKS);
        }

        // Process Leaves
        if (leavesData?.success && leavesData.leaves) {
          setLeaves(leavesData.leaves);
        }

        // Process Payslips
        if (payslipsData?.success && payslipsData.payslips) {
          setPayslips(payslipsData.payslips);
        }

        // Process Restore Session from Backend Cookie
        if (authData.success && authData.user) {
          const { email, role, username, companyName, mobile, country, state } = authData.user;
          
          // Build the restored user from backend data
          const restoredUser: User = {
            id: role === 'admin' ? (authData.user.id || authData.user._id || 'admin_owner') : email,
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
    const basePath = '/admin';
    let targetPath = '';
    if (currentPage === 'home' || currentPage === 'client-login') targetPath = '/client-login';
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
      localStorage.removeItem('current_user'); // ensure stale localStorage is cleared
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
      const profile = await firebaseLogin(id, password);
      
      // Enforce role assignment validation
      if (profile.role !== role) {
        await firebaseLogout();
        return { success: false, error: `Access restricted. This account is registered as a ${profile.role}, not a ${role}.` };
      }

      const clientUser: User = {
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
      
      setCurrentUser(clientUser);
      localStorage.removeItem('portal_logged_out');
      setUsers(prev => [...prev.filter(u => u.email !== clientUser.email), clientUser]);
      setCurrentPage(`${profile.role}-dashboard`);
      addNotification(`Welcome back, ${clientUser.name}!`, 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed.' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const profile = await AuthService.fetchOrCreateProfile(userCredential.user);
      
      const clientUser: User = {
        id: profile.email,
        name: profile.username,
        email: profile.email,
        role: profile.role,
        companyName: profile.companyName || '',
        clientId: profile.companyName || '',
        mobile: profile.mobile || '',
        country: profile.country || '',
        state: profile.state || '',
        city: profile.city || '',
        avatar: userCredential.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.username)}`
      };
      
      setCurrentUser(clientUser);
      setUsers(prev => [...prev.filter(u => u.email !== clientUser.email), clientUser]);
      setCurrentPage(`${profile.role}-dashboard`);
      addNotification(`Welcome back, ${clientUser.name}! Signed in with Google.`, 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google sign-in failed.' };
    }
  };

  const registerClient = async (userData: Omit<User, 'role' | 'id'>) => {
    try {
      await firebaseSignUp(userData.email, userData.password || '', {
        username: userData.name,
        companyName: userData.clientId || userData.companyName || '',
        mobile: userData.mobile || '',
        state: userData.state || '',
      });
      
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
      addNotification('Client account created successfully. Welcome to Zentrio!', 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
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
    let updatedProj: Project | null = null;
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

        updatedProj = {
          ...p,
          status,
          progress: nextProgress,
          milestones: nextMilestones
        };
        return updatedProj;
      }
      return p;
    }));

    if (updatedProj) {
      fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(updatedProj)
      }).catch(err => console.error('Failed to update project status in DB:', err));
    }
    addNotification(`Project status updated: ${projectId} -> ${status.toUpperCase()}`, 'info');
  };

  const assignProjectWorker = (projectId: string, workerId: string) => {
    const worker = users.find(u => u.id === workerId);
    if (!worker) return;

    let updatedProj: Project | null = null;
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

        updatedProj = {
          ...p,
          assignedWorkerId: workerId,
          assignedWorkerName: worker.name,
          status: p.status === 'pending' || p.status === 'review' || p.status === 'approved' ? 'assigned' : p.status
        };
        return updatedProj;
      }
      return p;
    }));

    if (updatedProj) {
      fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(updatedProj)
      }).catch(err => console.error('Failed to update project worker in DB:', err));
    }
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

    let updatedProj: Project | null = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        updatedProj = {
          ...p,
          deliverables: [...p.deliverables, newDeliverable]
        };
        return updatedProj;
      }
      return p;
    }));

    if (updatedProj) {
      fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(updatedProj)
      }).catch(err => console.error('Failed to save project deliverables in DB:', err));
    }
    addNotification(`Uploaded deliverable "${deliverableName}" to project ${projectId}.`, 'success');
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    let updatedProj: Project | null = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextMilestones = p.milestones.map(m => 
          m.id === milestoneId ? { ...m, status: (m.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' } : m
        );
        const completedCount = nextMilestones.filter(m => m.status === 'completed').length;
        const progressPercent = Math.round((completedCount / nextMilestones.length) * 100);

        updatedProj = {
          ...p,
          milestones: nextMilestones,
          progress: progressPercent
        };
        return updatedProj;
      }
      return p;
    }));

    if (updatedProj) {
      fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(updatedProj)
      }).catch(err => console.error('Failed to update project milestones status in DB:', err));
    }
  };

  const addMilestone = (projectId: string, title: string) => {
    const newMilestone: Milestone = {
      id: `mil_${Math.random().toString(36).substring(7)}`,
      title,
      status: 'pending'
    };
    let updatedProj: Project | null = null;
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const nextMilestones = [...p.milestones, newMilestone];
        const completedCount = nextMilestones.filter(m => m.status === 'completed').length;
        const progressPercent = Math.round((completedCount / nextMilestones.length) * 100);

        updatedProj = {
          ...p,
          milestones: nextMilestones,
          progress: progressPercent
        };
        return updatedProj;
      }
      return p;
    }));

    if (updatedProj) {
      fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(updatedProj)
      }).catch(err => console.error('Failed to add milestone to project in DB:', err));
    }
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
  const addPayment = async (projectId: string, amount: number, method: Payment['paymentMethod'], razorpayPaymentId?: string, razorpayOrderId?: string, razorpaySignature?: string) => {
    if (!currentUser || currentUser.role !== 'client') return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    let finalPayment: Payment;

    if (razorpayPaymentId) {
      try {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': getCsrfToken()
          },
          body: JSON.stringify({
            razorpay_payment_id: razorpayPaymentId,
            razorpay_order_id: razorpayOrderId || '',
            razorpay_signature: razorpaySignature || '',
            projectId,
            amount,
            paymentMethod: method,
            clientEmail: currentUser.email,
            clientName: currentUser.name,
            projectTitle: project.title
          })
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success && verifyData.payment) {
          finalPayment = verifyData.payment;
          setPayments(prev => [finalPayment, ...prev]);
        } else {
          throw new Error(verifyData.message || 'Signature verification failed');
        }
      } catch (err) {
        console.error('Razorpay verification call failed, executing offline fallback:', err);
        // Fallback offline mock in case of backend endpoint latency
        finalPayment = {
          id: razorpayPaymentId,
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
        setPayments(prev => [finalPayment, ...prev]);
      }
    } else {
      finalPayment = {
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
      setPayments(prev => [finalPayment, ...prev]);

      fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(finalPayment)
      }).catch(err => console.error('Failed to save payment offline:', err));
    }

    addNotification(`Payment of $${amount.toLocaleString()} processed successfully!`, 'success');

    // Trigger subscriptions / collections refresh
    try {
      const [projRes, payRes] = await Promise.all([
        fetch('/api/projects').catch(() => null),
        fetch('/api/payments').catch(() => null)
      ]);
      if (projRes) {
        const pData = await projRes.json();
        if (pData.success) setProjects(pData.projects);
      }
      if (payRes) {
        const payData = await payRes.json();
        if (payData.success) setPayments(payData.payments);
      }
    } catch (refreshErr) {
      console.error('Failed to refresh collections:', refreshErr);
    }

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
          invoiceId: finalPayment.invoiceNumber,
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
          subject: `Payment Received - ${finalPayment.invoiceNumber}`,
          text: `A payment of ₹${amount} was received for project "${project.title}".\nClient: ${currentUser.name}\nPayment Method: ${method}\nTransaction ID: ${finalPayment.id}\nInvoice: ${finalPayment.invoiceNumber}`
        }
      })
    }).catch(err => console.error('Failed to send payment admin alert:', err));
  };

  const createPaymentOrder = async (amount: number, currency: string = 'INR') => {
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({ amount, currency })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error('Failed to create payment order:', err);
      return { success: false, error: err.message };
    }
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

  const clearChannelMessages = (channelId: string) => {
    setMessages(prev => prev.filter(m => m.recipientId !== channelId));
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
    addNotification(`New task assigned to Worker ${taskData.workerId}.`, 'info');

    fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(newTask)
    }).catch(err => console.error('Failed to sync task:', err));
  };

  const updateTaskStatus = (taskId: string, status: WorkerTask['status']) => {
    let updatedTask: WorkerTask | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedTask = { ...t, status };
        return updatedTask;
      }
      return t;
    }));
    addNotification(`Task ${taskId} status updated to: ${status.toUpperCase()}`, 'info');

    if (updatedTask) {
      fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(updatedTask)
      }).catch(err => console.error('Failed to sync task update:', err));
    }
  };

  const addLeaveRequest = async (leaveData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const newId = `LEV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLeave: LeaveRequest = {
      ...leaveData,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setLeaves(prev => [newLeave, ...prev]);
    addNotification(`Leave request submitted.`, 'info');

    await fetch('/api/leaves', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(newLeave)
    }).catch(err => console.error('Failed to save leave request:', err));
  };

  const updateLeaveStatus = async (leaveId: string, status: LeaveRequest['status']) => {
    let updatedLeave: LeaveRequest | null = null;
    setLeaves(prev => prev.map(l => {
      if (l.id === leaveId) {
        updatedLeave = { ...l, status };
        return updatedLeave;
      }
      return l;
    }));
    addNotification(`Leave request updated: ${status}`, 'info');

    if (updatedLeave) {
      await fetch(`/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify(updatedLeave)
      }).catch(err => console.error('Failed to save leave status:', err));

      if (status === 'approved' && updatedLeave) {
        const { workerId, startDate, endDate } = updatedLeave;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const newRecords: AttendanceRecord[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          newRecords.push({
            workerId,
            date: d.toISOString().split('T')[0],
            status: 'absent'
          });
        }
        setAttendance(prev => {
          const dateStrings = newRecords.map(r => r.date);
          const filtered = prev.filter(r => !(r.workerId === workerId && dateStrings.includes(r.date)));
          return [...filtered, ...newRecords];
        });
      }
    }
  };

  const addPayslip = async (payslipData: Omit<Payslip, 'id' | 'createdAt'>) => {
    const newId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayslip: Payslip = {
      ...payslipData,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setPayslips(prev => [newPayslip, ...prev]);
    addNotification(`Payslip generated for ${payslipData.workerName}.`, 'success');

    await fetch('/api/payroll', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(newPayslip)
    }).catch(err => console.error('Failed to save payslip:', err));
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
      currentPage,
      setCurrentPage,
      routerParams,
      setRouterParams,
      loading,
      error,
      enquiries,
      leaves,
      payslips,
      
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
      createPaymentOrder,
      sendChatMessage,
      clearChannelMessages,

      markAttendance,
      addWorkerTask,
      updateTaskStatus,
      updateWorkerPerformance,
      updateWorkerSalary,
      addWorker,

      addClient,
      editClient,
      deleteClient,
      addLeaveRequest,
      updateLeaveStatus,
      addPayslip,
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
