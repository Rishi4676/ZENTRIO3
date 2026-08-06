export type UserRole = 'admin' | 'worker' | 'client';

export interface User {
  id: string; // e.g. ADMIN001, WORKER001, or client email
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  // Client specific
  companyName?: string;
  clientId?: string;
  mobile?: string;
  country?: string;
  state?: string;
  city?: string;
  referralCode?: string;
  // Worker specific
  performanceScore?: number; // 0 - 100
  salary?: number;
  joinedDate?: string;
}

export type ProjectStatus =
  | 'pending'
  | 'review'
  | 'approved'
  | 'assigned'
  | 'development'
  | 'testing'
  | 'completed'
  | 'delivered';

export interface Milestone {
  id: string;
  title: string;
  status: 'pending' | 'completed';
}

export interface Deliverable {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  techRequired: string[];
  budget: number;
  deadline: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  status: ProjectStatus;
  progress: number; // 0 - 100
  milestones: Milestone[];
  deliverables: Deliverable[];
  additionalNotes?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  category: string;
  description: string;
  status: 'open' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    content: string;
    timestamp: string;
  }[];
}

export interface Payment {
  id: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  amount: number;
  paymentMethod: 'razorpay' | 'upi' | 'credit_card' | 'debit_card' | 'net_banking';
  status: 'success' | 'failed' | 'pending';
  invoiceNumber: string;
  date: string;
}

export interface AttendanceRecord {
  workerId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  checkIn?: string; // HH:MM:SS
  checkOut?: string; // HH:MM:SS
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string; // 'internal-team', 'admin', 'client-id', 'worker-id'
  content: string;
  timestamp: string;
}

export interface WorkerTask {
  id: string;
  workerId: string;
  projectId: string;
  projectTitle: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  deadline: string;
}
