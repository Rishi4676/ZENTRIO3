import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Briefcase,
  DollarSign,
  Ticket,
  Edit2,
  Trash2,
  Award,
  Layers,
  Settings as SettingsIcon,
  LogOut,
  Send,
  UserCheck,
  Database,
  Mail,
  MessageSquare,
  Bot,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Printer,
  FileText,
  Clock,
  CheckSquare,
  Video,
  X
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { ChatWorkspace } from '../components/ChatWorkspace';
import type { ProjectStatus, User, Payslip } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    projects,
    tickets,
    payments,
    attendance,
    tasks,
    enquiries,
    logout,
    assignProjectWorker,
    updateProjectStatus,
    addMilestone,
    toggleMilestone,
    addClient,
    editClient,
    deleteClient,
    addWorker,
    updateWorkerPerformance,
    updateWorkerSalary,
    addWorkerTask,
    updateTaskStatus,
    replyToTicket,
    resolveTicket,
    companyProfile,
    updateCompanyProfile,
    addNotification,
    messages,
    sendChatMessage,
    clearChannelMessages,
    leaves,
    payslips,
    addPayslip,
    updateLeaveStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'workers' | 'projects' | 'finance' | 'support' | 'reports' | 'settings' | 'enquiries' | 'chat' | 'audit'>('overview');
  const [kanbanFilterWorkerId, setKanbanFilterWorkerId] = useState('all');

  // Meeting Modal State
  const [meetModalOpen, setMeetModalOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<{ platform: string; url: string; startedAt: string; startedBy: string } | null>(null);

  const checkActiveMeeting = async () => {
    try {
      const res = await fetch('/api/messages/meeting');
      const data = await res.json();
      if (data.success) {
        setActiveMeeting(data.meeting || null);
      }
    } catch (e) {}
  };

  useEffect(() => {
    checkActiveMeeting();
    const interval = setInterval(checkActiveMeeting, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartMeeting = async (platform: 'google' | 'zoom' | 'teams') => {
    let url = 'https://meet.google.com/new';
    if (platform === 'zoom') url = 'https://zoom.us/start/videomeeting';
    if (platform === 'teams') url = 'https://teams.microsoft.com/l/meeting/new';

    try {
      const res = await fetch('/api/messages/meeting/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, url, startedBy: currentUser?.name || 'Admin Owner' })
      });
      const data = await res.json();
      if (data.success) {
        setActiveMeeting(data.meeting);
        sendChatMessage('internal-team', `🚨 TEAM MEET STARTED by ${currentUser?.name || 'Admin'}! Click "Join Team Meet" button or link: ${url}`);
        window.open(url, '_blank');
      }
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  const handleEndMeeting = async () => {
    try {
      await fetch('/api/messages/meeting/end', { method: 'POST' });
      setActiveMeeting(null);
      sendChatMessage('internal-team', `🏁 Team meeting has ended by ${currentUser?.name || 'Admin'}.`);
    } catch (e) {}
  };


  // Payroll / Payslip States
  const [payrollWorkerId, setPayrollWorkerId] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('August');
  const [payrollYear, setPayrollYear] = useState(2026);
  const [payrollBaseSalary, setPayrollBaseSalary] = useState(50000);
  const [payrollBonuses, setPayrollBonuses] = useState(0);
  const [payrollDeductions, setPayrollDeductions] = useState(0);
  const [payrollSuccess, setPayrollSuccess] = useState('');

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello Admin! I am your AI Business Analyst. You can query me about company financials, team performance scores, or coding helper queries.' }
  ]);

  // Selected Payslip for View/Print
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);
  
  // Enquiry Reply Modal State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [replyProjectName, setReplyProjectName] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);

  const handleSendEnquiryReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !replyText) return;
    setReplySending(true);
    try {
      const res = await fetch('/api/contact/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedEnquiry.email,
          recipientName: selectedEnquiry.name,
          projectName: replyProjectName,
          replyMessage: replyText
        })
      });
      const data = await res.json();
      setReplySending(false);
      if (data.success) {
        addNotification(`Reply dispatched to ${selectedEnquiry.email}`, 'success');
        setReplyModalOpen(false);
        setReplyText('');
        setReplyProjectName('');
      } else {
        alert(data.message || 'Failed to send reply');
      }
    } catch (err) {
      setReplySending(false);
      alert('Error sending reply email.');
    }
  };

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    if (activeTab === 'audit') {
      setLoadingAudit(true);
      fetch('/api/users/audit-logs')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.logs) {
            setAuditLogs(data.logs);
          }
          setLoadingAudit(false);
        })
        .catch(err => {
          console.error('Failed to fetch audit logs:', err);
          setLoadingAudit(false);
        });
    }
  }, [activeTab]);

  // Client Management States
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClientEmail, setEditingClientEmail] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState({ name: '', email: '', password: '', companyName: '', mobile: '', country: '', state: '', city: '' });
  const [clientError, setClientError] = useState('');

  // Worker Management States
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({ id: '', name: '', email: '', password: '', performanceScore: 100, salary: 5000 });
  const [workerError, setWorkerError] = useState('');

  // Task Assignment States
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [taskForm, setTaskForm] = useState({ projectId: '', title: '', description: '', priority: 'medium' as 'low'|'medium'|'high', deadline: '' });

  // Support states
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [adminChatReply, setAdminChatReply] = useState('');

  // Project Milestones State
  const [selectedProjId, setSelectedProjId] = useState<string | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState('');

  // Company Profile states
  const [compProfile, setCompProfile] = useState({ ...companyProfile });
  const [profileSuccess, setProfileSuccess] = useState('');

  // DB statistics
  const activeClients = users.filter(u => u.role === 'client');
  const activeWorkers = users.filter(u => u.role === 'worker');
  const totalRevenue = payments.reduce((acc, p) => p.status === 'success' ? acc + p.amount : acc, 0);
  const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'delivered');
  const pendingProjects = projects.filter(p => p.status === 'pending' || p.status === 'review');

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');

    if (editingClientEmail) {
      editClient(editingClientEmail, {
        name: clientForm.name,
        companyName: clientForm.companyName,
        mobile: clientForm.mobile,
        country: clientForm.country,
        state: clientForm.state,
        city: clientForm.city
      });
      setClientModalOpen(false);
      setEditingClientEmail(null);
    } else {
      const res = addClient({
        id: clientForm.email,
        name: clientForm.name,
        email: clientForm.email,
        password: clientForm.password || 'Client@2026#',
        role: 'client',
        companyName: clientForm.companyName,
        mobile: clientForm.mobile,
        country: clientForm.country,
        state: clientForm.state,
        city: clientForm.city
      });

      if (res.success) {
        setClientModalOpen(false);
        setClientForm({ name: '', email: '', password: '', companyName: '', mobile: '', country: '', state: '', city: '' });
      } else {
        setClientError(res.error || 'Failed to add client.');
      }
    }
  };

  const handleEditClientClick = (client: User) => {
    setEditingClientEmail(client.email);
    setClientForm({
      name: client.name,
      email: client.email,
      password: '',
      companyName: client.companyName || '',
      mobile: client.mobile || '',
      country: client.country || '',
      state: client.state || '',
      city: client.city || ''
    });
    setClientModalOpen(true);
  };

  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkerError('');

    const res = addWorker({
      id: workerForm.id.toUpperCase(),
      name: workerForm.name,
      email: workerForm.email,
      password: workerForm.password || 'Worker@2026#',
      role: 'worker',
      performanceScore: Number(workerForm.performanceScore),
      salary: Number(workerForm.salary)
    });

    if (res.success) {
      setWorkerModalOpen(false);
      setWorkerForm({ id: '', name: '', email: '', password: '', performanceScore: 100, salary: 5000 });
    } else {
      setWorkerError(res.error || 'Worker credentials already exist.');
    }
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.projectId || !taskForm.title || !taskForm.deadline) return;

    const proj = projects.find(p => p.id === taskForm.projectId);
    
    addWorkerTask({
      workerId: selectedWorkerId,
      projectId: taskForm.projectId,
      projectTitle: proj ? proj.title : 'General Dev Task',
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      deadline: taskForm.deadline
    });

    setTaskModalOpen(false);
    setTaskForm({ projectId: '', title: '', description: '', priority: 'medium', deadline: '' });
  };

  const handleGeneratePayslipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payrollWorkerId) return;

    const worker = users.find(u => u.id === payrollWorkerId);
    if (!worker) return;

    const netVal = Number(payrollBaseSalary) + Number(payrollBonuses) - Number(payrollDeductions);

    await addPayslip({
      workerId: payrollWorkerId,
      workerName: worker.name,
      month: payrollMonth,
      year: Number(payrollYear),
      baseSalary: Number(payrollBaseSalary),
      bonuses: Number(payrollBonuses),
      deductions: Number(payrollDeductions),
      netSalary: netVal,
      status: 'paid'
    });

    setPayrollSuccess(`Payslip generated successfully for ${worker.name}.`);
    setPayrollWorkerId('');
    setPayrollBonuses(0);
    setPayrollDeductions(0);
    setTimeout(() => setPayrollSuccess(''), 5000);
  };

  const handleAskAiAssistant = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userMsg = aiPrompt;
    setAiPrompt('');
    setAiChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: userMsg,
          role: 'admin',
          context: {
            workersCount: users.filter(u => u.role === 'worker').length,
            projectsCount: projects.length,
            revenueTotal: payments.reduce((acc, curr) => acc + curr.amount, 0),
            ticketsCount: tickets.length,
            enquiriesCount: enquiries.length
          }
        })
      });
      const data = await res.json();
      setAiLoading(false);
      if (data.success && data.response) {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
      } else {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I failed to process that analysis query. Let me know if you need financial report guides.' }]);
      }
    } catch (err) {
      setAiLoading(false);
      setAiChatHistory(prev => [...prev, { role: 'ai', text: 'Server connection error. Please verify endpoints.' }]);
    }
  };

  const handleSendAdminChat = (ticketId: string) => {
    if (!adminChatReply.trim()) return;
    replyToTicket(ticketId, adminChatReply);
    setAdminChatReply('');
  };

  const handleAddMilestoneSubmit = (projectId: string) => {
    if (!newMilestoneText.trim()) return;
    addMilestone(projectId, newMilestoneText);
    setNewMilestoneText('');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(compProfile);
    setProfileSuccess('Corporate profile settings committed successfully.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleBackupRestore = () => {
    addNotification('Local DB state backed up safely to memory snapshot.', 'success');
    alert('System Action: Memory Backup state: APEX_SNAPSHOT_' + Date.now() + '.json generated.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* HEADER BAR */}
      <header className="glass-nav sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center space-x-3 hover:opacity-85 transition">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-7 h-7 object-contain" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Zentrio Central</span>
        </a>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          <div className="flex items-center space-x-2 pl-3 border-l border-slate-200 dark:border-slate-800">
            <span className="inline-flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
              Admin Access
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition active:scale-95"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ADMIN CONTENT */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'clients'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Client Management</span>
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'workers'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Worker Management</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>Project Pipelines</span>
          </button>

          <button
            onClick={() => setActiveTab('finance')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'finance'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Financials Ledger</span>
          </button>


          <button
            onClick={() => setActiveTab('reports')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Reports & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>Suite Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'enquiries'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span>Contact Enquiries</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Collaboration Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>Security Audit Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bot className="w-4 h-4 shrink-0" />
            <span>AI Analyst Helper</span>
          </button>

          <button
            onClick={() => setMeetModalOpen(true)}
            className="w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>Team Meet Control</span>
          </button>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-grow">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Revenue</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">${totalRevenue.toLocaleString()}</div>
                  <div className="text-[9px] text-emerald-500 font-semibold mt-1">✔ Net checkout clearance</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Clients Accounts</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{activeClients.length}</div>
                  <div className="text-[9px] text-slate-500 font-semibold mt-1">Registered workspace domains</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Engineering Staff</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{activeWorkers.length}</div>
                  <div className="text-[9px] text-indigo-500 font-semibold mt-1">Active nodes in workspace</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Projects</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{activeProjects.length}</div>
                  <div className="text-[9px] text-amber-500 font-semibold mt-1">{pendingProjects.length} pending approval</div>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-slate-200/40 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Contact Enquiries</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{enquiries.length}</div>
                  <div className="text-[9px] text-indigo-500 font-semibold mt-1">✔ Messages received</div>
                </div>
              </div>

              {/* Quick logs */}
              <div className="grid grid-cols-1 gap-6">
                {/* Active Projects Quick tracker */}
                <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Pipeline Status</h3>
                  <div className="space-y-3">
                    {projects.slice(0, 3).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/35 border border-slate-200/30 dark:border-slate-850">
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</div>
                          <div className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">{p.category}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
                            {p.status.toUpperCase()}
                          </span>
                          <div className="text-[10px] font-extrabold text-slate-900 dark:text-white mt-1">{p.progress}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT MANAGEMENT */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Client Workspaces</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Edit, onboarding, and delete client workspace keys.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingClientEmail(null);
                    setClientForm({ name: '', email: '', password: '', companyName: '', mobile: '', country: '', state: '', city: '' });
                    setClientModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                >
                  Onboard Client
                </button>
              </div>

              {/* Client List table */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase tracking-widest text-[9px]">
                        <th className="pb-3.5 font-bold">Domain Client</th>
                        <th className="pb-3.5 font-bold">Company Name</th>
                        <th className="pb-3.5 font-bold">Mobile</th>
                        <th className="pb-3.5 font-bold">Region Location</th>
                        <th className="pb-3.5 font-bold">Date Joined</th>
                        <th className="pb-3.5 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeClients.map(client => (
                        <tr key={client.email} className="border-b border-slate-100 dark:border-slate-900/60 last:border-b-0 hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <img src={client.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">{client.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{client.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-bold text-slate-500">{client.companyName || 'N/A'}</td>
                          <td className="py-4 font-medium text-slate-500">{client.mobile || 'N/A'}</td>
                          <td className="py-4 font-medium text-slate-400">{(client.city || client.state) ? `${client.city ? client.city + ', ' : ''}${client.state || ''}` : (client.country || 'N/A')}</td>
                          <td className="py-4 font-medium text-slate-400">{client.joinedDate || '2026-08-15'}</td>
                          <td className="py-4 text-right space-x-1">
                            <button
                              onClick={() => handleEditClientClick(client)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:text-indigo-500 transition"
                              title="Edit Client"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteClient(client.email)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:text-rose-500 transition"
                              title="Delete Client"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WORKER MANAGEMENT */}
          {activeTab === 'workers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Engineering Staff Central</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control employee tasks, hourly ratings, and monthly payouts.</p>
                </div>
                <button
                  onClick={() => setWorkerModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition"
                >
                  Onboard Engineer
                </button>
              </div>

              {/* Workers Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeWorkers.map(worker => {
                  const workerTasks = tasks.filter(t => t.workerId === worker.id);
                  const isPresentToday = attendance.some(a => a.workerId === worker.id && a.date === new Date().toISOString().split('T')[0] && a.status === 'present');
                  
                  return (
                    <div key={worker.id} className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm relative overflow-hidden flex flex-col justify-between">
                      <div>
                        {/* Avatar Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <img src={worker.avatar} alt={worker.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">{worker.name}</h4>
                              <span className="text-[9px] font-semibold text-slate-400 block uppercase">{worker.id}</span>
                            </div>
                          </div>
                          
                          {/* Attendance tag */}
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                            isPresentToday ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {isPresentToday ? 'Checked In' : 'Checked Out'}
                          </span>
                        </div>

                        {/* Worker metrics */}
                        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 mb-4">
                          <div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Performance</span>
                            <span className="text-xs font-extrabold text-indigo-500">{worker.performanceScore}% Score</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Tasks</span>
                            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">{workerTasks.length} Pipeline</span>
                          </div>
                          <div className="col-span-2 border-t border-slate-200/30 dark:border-slate-800/40 pt-2 flex justify-between items-baseline">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Salary MRR</span>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white">${worker.salary?.toLocaleString()}/mo</span>
                          </div>
                        </div>
                      </div>

                      {/* Performance review slider & assign action */}
                      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-850/50">
                        <div>
                          <label className="block text-[8px] font-bold text-slate-500 uppercase mb-1">Adjust Score</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={worker.performanceScore || 100}
                            onChange={(e) => updateWorkerPerformance(worker.id, Number(e.target.value))}
                            className="w-full accent-indigo-600 bg-slate-200 dark:bg-slate-800 h-1 rounded"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const newSalaryStr = prompt('Enter new salary for ' + worker.name + ':', worker.salary?.toString());
                              if (newSalaryStr && !isNaN(Number(newSalaryStr))) {
                                updateWorkerSalary(worker.id, Number(newSalaryStr));
                              }
                            }}
                            className="flex-grow py-2 text-[10px] font-bold bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition"
                          >
                            Salary Adjust
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedWorkerId(worker.id);
                              setTaskModalOpen(true);
                            }}
                            className="flex-grow py-2 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
                          >
                            Assign Task
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* LEAVE REQUESTS SECTION */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left mt-8">
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Employee Leave Request Applications</h3>
                </div>

                {leaves.filter(l => l.status === 'pending').length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 italic">No pending leave requests from engineers. All systems green.</div>
                ) : (
                  <div className="space-y-3">
                    {leaves.filter(l => l.status === 'pending').map(lev => (
                      <div key={lev.id} className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{lev.workerName} ({lev.workerId})</div>
                          <div className="text-[11px] font-medium text-slate-700 dark:text-slate-305 mt-1">
                            Dates: <span className="font-bold">{lev.startDate}</span> to <span className="font-bold">{lev.endDate}</span> | Category: <span className="font-bold uppercase">{lev.type}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 italic mt-1">Reason: "{lev.reason}"</div>
                        </div>
                        <div className="flex space-x-2 shrink-0">
                          <button
                            onClick={() => updateLeaveStatus(lev.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(lev.id, 'rejected')}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] shadow cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SYSTEM TASKS KANBAN BOARD */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm mt-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">System Tasks Kanban Board</h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Filter:</span>
                    <select
                      value={kanbanFilterWorkerId}
                      onChange={(e) => setKanbanFilterWorkerId(e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    >
                      <option value="all">All Workers</option>
                      {users.filter(u => u.role === 'worker').map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {tasks.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 italic">No tasks assigned.</div>
                ) : (
                  <div className="grid lg:grid-cols-4 gap-5 items-start">
                    {[
                      { id: 'pending' as const, title: 'To Do', color: 'text-rose-500 border-rose-500/25', bg: 'bg-rose-500/5 dark:bg-rose-500/2' },
                      { id: 'in_progress' as const, title: 'In Progress', color: 'text-amber-500 border-amber-500/25', bg: 'bg-amber-500/5 dark:bg-amber-500/2' },
                      { id: 'under_review' as const, title: 'Under Review', color: 'text-indigo-500 border-indigo-500/25', bg: 'bg-indigo-500/5 dark:bg-indigo-500/2' },
                      { id: 'completed' as const, title: 'Completed', color: 'text-emerald-500 border-emerald-500/25', bg: 'bg-emerald-500/5 dark:bg-emerald-500/2' }
                    ].map(col => {
                      const filteredTasks = tasks.filter(t => {
                        const matchWorker = kanbanFilterWorkerId === 'all' || t.workerId === kanbanFilterWorkerId;
                        return t.status === col.id && matchWorker;
                      });

                      const localPriorityColor = (pri: string) => {
                        switch (pri) {
                          case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
                          case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
                          default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
                        }
                      };

                      return (
                        <div key={col.id} className={`rounded-xl p-4 border border-slate-200/40 dark:border-slate-850/60 ${col.bg} min-h-[220px] flex flex-col text-left`}>
                          <div className="flex justify-between items-center mb-3 pb-1.5 border-b border-slate-200/30 dark:border-slate-850/40">
                            <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${col.color.split(' ')[0]}`}>{col.title}</h4>
                            <span className="text-[9px] font-extrabold bg-slate-200/60 dark:bg-slate-900 px-2 py-0.5 rounded-full text-slate-500">{filteredTasks.length}</span>
                          </div>

                          <div className="space-y-3 flex-grow overflow-y-auto max-h-[300px]">
                            {filteredTasks.length === 0 ? (
                              <div className="text-center py-6 text-[10px] text-slate-400 dark:text-slate-500 italic">No tasks in stage</div>
                            ) : (
                              filteredTasks.map(task => {
                                const assignee = users.find(u => u.id === task.workerId);
                                const statusSeq = ['pending', 'in_progress', 'under_review', 'completed'];
                                const statusIdx = statusSeq.indexOf(task.status);

                                return (
                                  <div key={task.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shadow-sm hover:shadow transition-shadow">
                                    <div className="flex justify-between items-start mb-1.5">
                                      <span className="text-[9px] font-bold text-slate-400 font-mono">{task.id}</span>
                                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded border uppercase ${localPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{task.title}</h5>
                                    <p className="text-[10px] text-slate-550 dark:text-slate-400 mt-1 line-clamp-1">{task.description}</p>
                                    
                                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-850/50 flex justify-between items-center text-[9px] text-slate-400">
                                      <span className="font-semibold text-indigo-500">Assignee: {assignee ? assignee.name : task.workerId}</span>
                                      <span>Due: {task.deadline}</span>
                                    </div>

                                    {/* Admin status adjustments */}
                                    <div className="mt-2 flex justify-end space-x-1">
                                      {col.id !== 'pending' && (
                                        <button 
                                          onClick={() => updateTaskStatus(task.id, statusSeq[statusIdx - 1] as any)}
                                          className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 cursor-pointer"
                                          title="Move Left"
                                        >
                                          <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      {col.id !== 'completed' && (
                                        <button 
                                          onClick={() => updateTaskStatus(task.id, statusSeq[statusIdx + 1] as any)}
                                          className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 cursor-pointer"
                                          title="Move Right"
                                        >
                                          <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: PROJECT PIPELINES */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Project Pipelines</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control build stages, milestones, and engineer allocations.</p>
              </div>

              {/* Project rows */}
              <div className="grid gap-6">
                {projects.map(proj => {
                  const projectImage = proj.image || 
                    (proj.category?.toLowerCase().includes('mobile') ? '/assets/mobile_app.jpg' :
                     proj.category?.toLowerCase().includes('ai') || proj.category?.toLowerCase().includes('machine') ? 'https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=800&q=80' :
                     proj.category?.toLowerCase().includes('e-commerce') || proj.category?.toLowerCase().includes('web') ? 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' :
                     'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80');

                  return (
                    <div key={proj.id} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                      {/* Project Image */}
                      <div className="w-full h-36 overflow-hidden rounded-xl border border-slate-200/30 dark:border-slate-800">
                        <img src={projectImage} alt={proj.title} className="w-full h-full object-cover transform hover:scale-102 transition duration-300" />
                      </div>
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{proj.id}</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold uppercase">
                            {proj.category}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{proj.title}</h3>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-indigo-500 uppercase">${proj.budget.toLocaleString()} Budget</span>
                      </div>
                    </div>

                    {/* ── CLIENT & PROJECT DETAILS PANEL ── */}
                    <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15 dark:bg-indigo-500/8">
                      {/* Client Name */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0 mt-0.5">
                          {(proj.clientName || proj.clientId || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Client Name</div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white">{proj.clientName || proj.clientId || 'Unknown'}</div>
                          {proj.clientCompany && (
                            <div className="text-[9px] text-slate-500 font-semibold mt-0.5">{proj.clientCompany}</div>
                          )}
                        </div>
                      </div>

                      {/* Deadline */}
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4 text-rose-500" />
                        </div>
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Deadline</div>
                          <div className={`text-xs font-extrabold ${
                            proj.deadline && new Date(proj.deadline) < new Date()
                              ? 'text-rose-500'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {proj.deadline || 'Not set'}
                          </div>
                          {proj.deadline && (
                            <div className={`text-[9px] font-semibold mt-0.5 ${
                              new Date(proj.deadline) < new Date() ? 'text-rose-400' : 'text-slate-500'
                            }`}>
                              {new Date(proj.deadline) < new Date() ? '⚠ Overdue' : `${Math.ceil((new Date(proj.deadline).getTime() - Date.now()) / 86400000)} days left`}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Requirements / Tech Stack */}
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Tech Requirements</div>
                        <div className="flex flex-wrap gap-1">
                          {(proj.techRequired || []).slice(0, 4).map((tech: string, i: number) => (
                            <span key={i} className="text-[8px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">
                              {tech}
                            </span>
                          ))}
                          {(proj.techRequired || []).length > 4 && (
                            <span className="text-[8px] font-bold text-slate-400 px-1 py-0.5">+{(proj.techRequired || []).length - 4} more</span>
                          )}
                          {(!proj.techRequired || proj.techRequired.length === 0) && (
                            <span className="text-[9px] text-slate-400 italic">Not specified</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Project Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{proj.description}</p>

                    {/* Milestone items checklist & add milestone */}
                    <div className="bg-slate-100/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/30 dark:border-slate-800/40">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Milestones Checklist</span>
                        <button
                          onClick={() => setSelectedProjId(selectedProjId === proj.id ? null : proj.id)}
                          className="text-[9px] text-indigo-500 hover:underline font-semibold"
                        >
                          {selectedProjId === proj.id ? 'Close Panel' : 'Add Milestone'}
                        </button>
                      </div>

                      {/* Add Milestone Inline */}
                      {selectedProjId === proj.id && (
                        <div className="flex space-x-2 mb-3">
                          <input
                            type="text"
                            placeholder="Milestone description..."
                            value={newMilestoneText}
                            onChange={(e) => setNewMilestoneText(e.target.value)}
                            className="flex-grow text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddMilestoneSubmit(proj.id)}
                            className="px-3 py-1.5 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
                          >
                            Add
                          </button>
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {proj.milestones.map(m => (
                          <label key={m.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={m.status === 'completed'}
                              onChange={() => toggleMilestone(proj.id, m.id)}
                              className="w-3.5 h-3.5 text-indigo-600 rounded border-slate-350 bg-transparent"
                            />
                            <span className={`text-[10px] font-semibold ${m.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                              {m.title}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Visual Gantt timeline representing milestone durations */}
                      <div className="mt-4 pt-4 border-t border-slate-200/35 dark:border-slate-800/40">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-400 block mb-2 font-heading">Gantt Milestone Schedule</span>
                        <div className="relative border-l border-slate-200 dark:border-slate-850/80 pl-4 py-2 space-y-3.5 text-left">
                          {proj.milestones.map((ms, index) => {
                            const startStr = proj.createdAt || '2026-07-01';
                            const endStr = proj.deadline || '2026-08-25';
                            const start = new Date(startStr);
                            const end = new Date(endStr);
                            const duration = end.getTime() - start.getTime() || 1;
                            
                            const mStart = new Date(start.getTime() + index * (duration / proj.milestones.length));
                            const mEnd = new Date(start.getTime() + (index + 1) * (duration / proj.milestones.length));
                            const startStrFormatted = mStart.toISOString().split('T')[0];
                            const endStrFormatted = mEnd.toISOString().split('T')[0];

                            return (
                              <div key={ms.id} className="relative group text-[11px]">
                                <div className="absolute -left-[21px] mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-indigo-500"></div>
                                <div className="flex justify-between text-[10px] mb-1 font-semibold">
                                  <span>{ms.title}</span>
                                  <span className={ms.status === 'completed' ? 'text-emerald-500 font-bold' : 'text-indigo-400 font-bold'}>
                                    {ms.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <div className="flex-grow h-2 rounded-full bg-slate-100/50 dark:bg-slate-900/60 border border-slate-200/45 dark:border-slate-850 overflow-hidden relative">
                                    <div 
                                      className={`h-full rounded-full ${ms.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-650/70'}`}
                                      style={{ width: `${ms.status === 'completed' ? 100 : 50}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400 shrink-0 font-heading">{startStrFormatted} to {endStrFormatted}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    {/* Actions panel */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-850/50">
                      
                      {/* Worker assignment */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Engineer:</span>
                        <select
                          value={proj.assignedWorkerId || ''}
                          onChange={(e) => assignProjectWorker(proj.id, e.target.value)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                        >
                          <option value="">Pending Assignment</option>
                          {activeWorkers.map(w => (
                            <option key={w.id} value={w.id}>{w.name} ({w.id})</option>
                          ))}
                        </select>
                      </div>

                      {/* Status updates */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Stage:</span>
                        <select
                          value={proj.status}
                          onChange={(e) => updateProjectStatus(proj.id, e.target.value as ProjectStatus)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="review">Review</option>
                          <option value="approved">Approved</option>
                          <option value="assigned">Assigned</option>
                          <option value="development">Development</option>
                          <option value="testing">Testing</option>
                          <option value="completed">Completed</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIALS LEDGER */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Financial Ledger</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Track cleared gateway payouts, monthly expenditures, and digital invoice items.</p>
              </div>

              {/* Transactions Ledger */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Emitted Transaction Sheets</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase tracking-widest text-[9px]">
                        <th className="pb-3.5 font-bold">Invoice ID</th>
                        <th className="pb-3.5 font-bold">Domain Client</th>
                        <th className="pb-3.5 font-bold">Project Name</th>
                        <th className="pb-3.5 font-bold">Method</th>
                        <th className="pb-3.5 font-bold">Payout Amount</th>
                        <th className="pb-3.5 font-bold">Status</th>
                        <th className="pb-3.5 font-bold text-right">Date Issued</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map(p => (
                        <tr key={p.id} className="border-b border-slate-100 dark:border-slate-900/60 last:border-b-0 hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="py-4 font-bold text-slate-900 dark:text-slate-200">{p.invoiceNumber}</td>
                          <td className="py-4 font-bold text-slate-500">{p.clientName}</td>
                          <td className="py-4 font-medium text-slate-500">{p.projectTitle}</td>
                          <td className="py-4 font-bold text-slate-400 uppercase">{p.paymentMethod}</td>
                          <td className="py-4 font-extrabold text-slate-950 dark:text-white">${p.amount.toLocaleString()}</td>
                          <td className="py-4">
                            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[9px]">
                              SUCCESS
                            </span>
                          </td>
                          <td className="py-4 text-slate-500 font-medium text-right">{p.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAYROLL & PAYSLIP SYSTEM */}
              <div className="grid lg:grid-cols-3 gap-6 mt-8 items-start">
                
                {/* Form to Generate Payslip */}
                <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left lg:col-span-1 space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Generate Salary Slip</h3>
                  </div>

                  {payrollSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20 text-center">
                      {payrollSuccess}
                    </div>
                  )}

                  <form onSubmit={handleGeneratePayslipSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Engineer</label>
                      <select
                        required
                        value={payrollWorkerId}
                        onChange={(e) => {
                          const wId = e.target.value;
                          setPayrollWorkerId(wId);
                          const w = users.find(u => u.id === wId);
                          if (w && w.salary) {
                            setPayrollBaseSalary(w.salary);
                          }
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                      >
                        <option value="">Choose worker...</option>
                        {users.filter(u => u.role === 'worker').map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Month</label>
                        <select
                          value={payrollMonth}
                          onChange={(e) => setPayrollMonth(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                        >
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label>
                        <input
                          type="number"
                          required
                          value={payrollYear}
                          onChange={(e) => setPayrollYear(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Base Salary (₹)</label>
                      <input
                        type="number"
                        required
                        value={payrollBaseSalary}
                        onChange={(e) => setPayrollBaseSalary(Number(e.target.value))}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bonuses (₹)</label>
                        <input
                          type="number"
                          value={payrollBonuses}
                          onChange={(e) => setPayrollBonuses(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Deductions (₹)</label>
                        <input
                          type="number"
                          value={payrollDeductions}
                          onChange={(e) => setPayrollDeductions(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
                    >
                      Disburse & Emit Slip
                    </button>
                  </form>
                </div>

                {/* Table of Generated Payslips */}
                <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left lg:col-span-2 space-y-4 max-h-[380px] overflow-y-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Disbursed Payslips Database</h3>
                  </div>

                  {payslips.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500 italic">No payslips emitted yet. Generate one above to view logs.</div>
                  ) : (
                    <div className="space-y-2">
                      {payslips.map(ps => (
                        <div key={ps.id} className="p-3 rounded-lg bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{ps.workerName} ({ps.workerId})</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{ps.month} {ps.year} | Net paid: ₹{ps.netSalary.toLocaleString()}</div>
                          </div>
                          <button
                            onClick={() => { setSelectedPayslip(ps); setPayslipModalOpen(true); }}
                            className="px-2.5 py-1.5 bg-indigo-650/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                          >
                            Print/View
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}



          {/* TAB 7: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Suite Reports & Analytics</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">High-fidelity SVG charts rendering monthly metrics and staff scores.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Revenue SVG Chart */}
                <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Monthly Revenue Flow ($ USD)</h3>
                  
                  {/* SVG drawing */}
                  <div className="w-full h-64 bg-slate-100/40 dark:bg-slate-950/20 rounded-xl relative p-2">
                    <svg viewBox="0 0 400 200" className="w-full h-full">
                      {/* Gridlines */}
                      <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="40" y1="70" x2="380" y2="70" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="40" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="40" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.08)" />

                      {/* Area Chart Gradient */}
                      <defs>
                        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Area block */}
                      <path
                        d="M 50 170 L 100 140 L 170 120 L 240 80 L 310 100 L 370 40 L 370 170 Z"
                        fill="url(#area-grad)"
                      />

                      {/* Stroke line */}
                      <path
                        d="M 50 170 L 100 140 L 170 120 L 240 80 L 310 100 L 370 40"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Nodes */}
                      <circle cx="100" cy="140" r="4" fill="#a5b4fc" />
                      <circle cx="170" cy="120" r="4" fill="#a5b4fc" />
                      <circle cx="240" cy="80" r="4" fill="#a5b4fc" />
                      <circle cx="310" cy="100" r="4" fill="#a5b4fc" />
                      <circle cx="370" cy="40" r="4.5" fill="#a5b4fc" className="animate-ping" />

                      {/* Y-axis Labels */}
                      <text x="10" y="25" fill="#64748b" className="text-[9px] font-bold">25k</text>
                      <text x="10" y="75" fill="#64748b" className="text-[9px] font-bold">15k</text>
                      <text x="10" y="125" fill="#64748b" className="text-[9px] font-bold">10k</text>
                      <text x="10" y="175" fill="#64748b" className="text-[9px] font-bold">0</text>

                      {/* X-axis Labels */}
                      <text x="50" y="190" fill="#64748b" className="text-[9px] font-bold">Feb</text>
                      <text x="100" y="190" fill="#64748b" className="text-[9px] font-bold">Mar</text>
                      <text x="170" y="190" fill="#64748b" className="text-[9px] font-bold">Apr</text>
                      <text x="240" y="190" fill="#64748b" className="text-[9px] font-bold">May</text>
                      <text x="310" y="190" fill="#64748b" className="text-[9px] font-bold">Jun</text>
                      <text x="360" y="190" fill="#64748b" className="text-[9px] font-bold">Jul</text>
                    </svg>
                  </div>
                </div>

                {/* Worker performance bar chart */}
                <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Engineer Performance Score (%)</h3>
                  
                  {/* SVG drawing */}
                  <div className="w-full h-64 bg-slate-100/40 dark:bg-slate-950/20 rounded-xl relative p-2">
                    <svg viewBox="0 0 400 200" className="w-full h-full">
                      {/* Gridlines */}
                      <line x1="60" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="60" y1="70" x2="380" y2="70" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="60" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="60" y1="170" x2="380" y2="170" stroke="rgba(255,255,255,0.08)" />

                      {/* Bar 1 (Sarah) */}
                      <rect x="90" y="42" width="28" height="128" fill="#a78bfa" rx="3" />
                      {/* Bar 2 (Alex) */}
                      <rect x="190" y="58" width="28" height="112" fill="#f472b6" rx="3" />
                      {/* Bar 3 (David) */}
                      <rect x="290" y="25" width="28" height="145" fill="#38bdf8" rx="3" />

                      {/* Y-axis Labels */}
                      <text x="15" y="25" fill="#64748b" className="text-[9px] font-bold">100%</text>
                      <text x="15" y="75" fill="#64748b" className="text-[9px] font-bold">75%</text>
                      <text x="15" y="125" fill="#64748b" className="text-[9px] font-bold">50%</text>
                      <text x="15" y="175" fill="#64748b" className="text-[9px] font-bold">0</text>

                      {/* X-axis labels */}
                      <text x="80" y="190" fill="#64748b" className="text-[9px] font-bold">Sarah (94%)</text>
                      <text x="180" y="190" fill="#64748b" className="text-[9px] font-bold">Alex (88%)</text>
                      <text x="280" y="190" fill="#64748b" className="text-[9px] font-bold">David (97%)</text>
                    </svg>
                  </div>
                </div>

                {/* Worker Monthly Attendance Analytics */}
                <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Worker Monthly Attendance Summary</h3>
                    <div className="flex items-center space-x-4 text-[10px] font-bold">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                        <span className="text-slate-600 dark:text-slate-400">Present Days</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
                        <span className="text-slate-600 dark:text-slate-400">Absent Days</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* SVG stacked bar chart */}
                  <div className="w-full h-64 bg-slate-100/40 dark:bg-slate-950/20 rounded-xl relative p-2 overflow-x-auto">
                    <svg viewBox="0 0 800 200" className="w-full h-full min-w-[600px]">
                      {/* Gridlines */}
                      <line x1="60" y1="20" x2="760" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="60" y1="70" x2="760" y2="70" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="60" y1="120" x2="760" y2="120" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="60" y1="170" x2="760" y2="170" stroke="rgba(255,255,255,0.08)" />

                      {/* Stacked Bars */}
                      {/* Feb (18 present, 2 absent) */}
                      <rect x="100" y="38" width="30" height="116" fill="#10b981" rx="2" />
                      <rect x="100" y="154" width="30" height="16" fill="#ef4444" rx="2" />
                      
                      {/* Mar (20 present, 1 absent) */}
                      <rect x="210" y="30" width="30" height="132" fill="#10b981" rx="2" />
                      <rect x="210" y="162" width="30" height="8" fill="#ef4444" rx="2" />

                      {/* Apr (15 present, 3 absent) */}
                      <rect x="320" y="50" width="30" height="96" fill="#10b981" rx="2" />
                      <rect x="320" y="146" width="30" height="24" fill="#ef4444" rx="2" />

                      {/* May (22 present, 2 absent) */}
                      <rect x="430" y="28" width="30" height="126" fill="#10b981" rx="2" />
                      <rect x="430" y="154" width="30" height="16" fill="#ef4444" rx="2" />

                      {/* Jun (16 present, 4 absent) */}
                      <rect x="540" y="60" width="30" height="88" fill="#10b981" rx="2" />
                      <rect x="540" y="148" width="30" height="22" fill="#ef4444" rx="2" />

                      {/* Jul (Live stats sync: let's read live presence) */}
                      {(() => {
                        const presentCount = attendance.filter(a => a.status === 'present').length;
                        const absentCount = attendance.filter(a => a.status === 'absent').length;
                        
                        const basePresent = presentCount || 23;
                        const baseAbsent = absentCount || 1;
                        const total = basePresent + baseAbsent;
                        const presentHeight = Math.round((basePresent / total) * 150);
                        const absentHeight = Math.round((baseAbsent / total) * 150);
                        
                        const presentY = 170 - presentHeight;
                        const absentY = 170 - presentHeight - absentHeight;
                        
                        return (
                          <>
                            <rect x="650" y={presentY} width="30" height={presentHeight} fill="#10b981" rx="2" />
                            {absentHeight > 0 && (
                              <rect x="650" y={absentY} width="30" height={absentHeight} fill="#ef4444" rx="2" />
                            )}
                          </>
                        );
                      })()}

                      {/* Y-axis Labels */}
                      <text x="15" y="25" fill="#64748b" className="text-[9px] font-bold">100%</text>
                      <text x="15" y="75" fill="#64748b" className="text-[9px] font-bold">75%</text>
                      <text x="15" y="125" fill="#64748b" className="text-[9px] font-bold">50%</text>
                      <text x="15" y="175" fill="#64748b" className="text-[9px] font-bold">0%</text>

                      <text x="536" y="190" fill="#64748b" className="text-[10px] font-bold">Jun (80%)</text>
                      <text x="646" y="190" fill="#64748b" className="text-[10px] font-bold">Jul (Active)</text>
                    </svg>
                  </div>
                </div>
              </div>

            {/* EXPENDITURE ANALYSIS & FINANCIAL REPORT GENERATOR */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-850 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Expenditure & Financial Summary Analysis</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Calculated net margins across client credits and engineer payroll disbursements.</p>
                </div>
                <button
                  onClick={() => {
                    const totalPayroll = payslips.reduce((s, p) => s + (p.netSalary || 0), 0);
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + "Financial Analysis Report - Zentrio AI Technology\n"
                      + `Gross Revenue (Income Tab),₹${totalRevenue}\n`
                      + `Worker Salary Expenses,₹${totalPayroll}\n`
                      + `Net Profit Margin,₹${totalRevenue - totalPayroll}\n`
                      + `Report Timestamp,${new Date().toLocaleString()}\n`;
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `financial_expenditure_report_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center space-x-1.5 shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download CSV Financial Report</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">Gross Project Credits</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString()}</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 block mb-1">Total Payroll Expenditure</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    ₹{payslips.reduce((s, p) => s + (p.netSalary || 0), 0).toLocaleString()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">Net Operating Profit</span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    ₹{(totalRevenue - payslips.reduce((s, p) => s + (p.netSalary || 0), 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Suite Configuration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage global company attributes and backup operations.</p>
              </div>

              {profileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 text-center animate-pulse">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSave} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Registered Firm Name</label>
                    <input
                      type="text"
                      required
                      value={compProfile.name}
                      onChange={(e) => setCompProfile({ ...compProfile, name: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Gateway Billing Email</label>
                    <input
                      type="email"
                      required
                      value={compProfile.email}
                      onChange={(e) => setCompProfile({ ...compProfile, email: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Corporate Phone</label>
                    <input
                      type="text"
                      required
                      value={compProfile.phone}
                      onChange={(e) => setCompProfile({ ...compProfile, phone: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Corporate Tax ID</label>
                    <input
                      type="text"
                      required
                      value={compProfile.taxId}
                      onChange={(e) => setCompProfile({ ...compProfile, taxId: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Headquarters Address</label>
                  <input
                    type="text"
                    required
                    value={compProfile.address}
                    onChange={(e) => setCompProfile({ ...compProfile, address: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md"
                >
                  Save Corporate Parameters
                </button>
              </form>

              {/* Database operations backup */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4 text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Database Backup & Storage Snapshot</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Generate a snapshot file containing all localStorage users, tickets, and payment logs.</p>
                
                <button
                  onClick={handleBackupRestore}
                  className="px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-600/10 hover:bg-indigo-600 rounded-xl transition flex items-center space-x-2"
                >
                  <Database className="w-4 h-4" />
                  <span>Execute DB Snapshot Backup</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Contact Enquiries</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Review customer inquiries and messages submitted via the contact form.</p>
              </div>

              {enquiries.length === 0 ? (
                <div className="glass-card text-center p-12 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                  <Mail className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No inquiries yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">When users submit the contact form on your landing page, details will appear here.</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {enquiries.map((enq) => (
                    <div key={enq.id} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-850 pb-3">
                        <div>
                          <span className="text-[9px] font-extrabold text-indigo-500 tracking-wider uppercase block">{enq.id}</span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{enq.subject}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono font-medium">{enq.submissionTime}</span>
                      </div>

                      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 text-xs mb-4">
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Sender Name</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{enq.name}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Email Address</span>
                          <a href={`mailto:${enq.email}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5 block">{enq.email}</a>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Phone Number</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{enq.phone}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Company</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{enq.company}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Message Details</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50/50 dark:bg-slate-900/10 p-3.5 rounded-xl border border-slate-100/50 dark:border-slate-850/50 whitespace-pre-wrap">{enq.message}</p>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-semibold pt-1 border-t border-slate-100 dark:border-slate-850/50">
                        <span>Submitted from IP: {enq.ip}</span>
                        <button
                          onClick={() => {
                            setSelectedEnquiry(enq);
                            setReplyProjectName(enq.subject && enq.subject !== 'N/A' ? enq.subject : '');
                            setReplyModalOpen(true);
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] cursor-pointer transition flex items-center space-x-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Reply (with Project Name)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: COLLABORATION CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Collaboration Chat Rooms</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Communicate in real-time across channels and dynamic project rooms.</p>
              </div>

              <ChatWorkspace
                currentUser={currentUser}
                messages={messages}
                projects={projects}
                sendChatMessage={sendChatMessage}
                clearChannelMessages={clearChannelMessages}
              />
            </div>
          )}

          {/* TAB 11: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="space-y-6 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Security Audit Logs</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Observe verified user authorization updates and administrative logons.</p>
                </div>
                <button
                  onClick={() => {
                    setLoadingAudit(true);
                    fetch('/api/users/audit-logs')
                      .then(res => res.json())
                      .then(data => {
                        if (data.success && data.logs) {
                          setAuditLogs(data.logs);
                        }
                        setLoadingAudit(false);
                      })
                      .catch(err => {
                        console.error('Failed to fetch audit logs:', err);
                        setLoadingAudit(false);
                      });
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer"
                >
                  Refresh Logs
                </button>
              </div>

              {loadingAudit ? (
                <div className="text-center py-12 text-xs text-slate-500 animate-pulse">Retrieving audit log entries...</div>
              ) : auditLogs.length === 0 ? (
                <div className="glass-card text-center p-12 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                  <Database className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No audit logs found</h3>
                </div>
              ) : (
                <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-855 overflow-hidden bg-white/10 dark:bg-slate-955/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/50 dark:bg-slate-900/40 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200/30 dark:border-slate-800/40">
                        <tr>
                          <th className="px-5 py-3.5">Timestamp</th>
                          <th className="px-5 py-3.5">Action</th>
                          <th className="px-5 py-3.5">Authorized Identity</th>
                          <th className="px-5 py-3.5">Details</th>
                          <th className="px-5 py-3.5">Origin IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900/40">
                        {auditLogs.map((log, index) => (
                          <tr key={index} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition">
                            <td className="px-5 py-4 font-mono text-[10px] text-slate-500">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-5 py-4 font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                                log.action.includes('SUCCESS') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                                log.action.includes('FAIL') ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-slate-400/15 text-slate-600 dark:text-slate-400'
                              }`}>
                                {log.action.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                              {log.userEmail || 'GUEST'}
                            </td>
                            <td className="px-5 py-4 text-slate-500 font-medium">{log.details}</td>
                            <td className="px-5 py-4 font-mono text-[10px] text-slate-400">{log.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 12: AI ANALYST HELPER */}
          {activeTab === 'ai' && (
            <div className="space-y-6 text-left flex flex-col h-[520px]">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">AI Corporate & Analyst Assistant</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Verify financial forecasts, query team performance summaries, or compile database stats.</p>
              </div>

              <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm overflow-hidden flex-grow flex flex-col justify-between">
                
                {/* Chat window */}
                <div className="p-5 flex-grow overflow-y-auto space-y-4 max-h-[340px]">
                  {aiChatHistory.map((chat, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                        chat.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850/60 text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}>
                        <div className="flex items-center space-x-1.5 mb-1.5 opacity-80">
                          {chat.role === 'user' ? (
                            <span className="font-bold text-[9px] uppercase tracking-wider">Admin (Me)</span>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span className="font-bold text-[9px] uppercase tracking-wider text-indigo-400">Zentrio AI Analyst</span>
                            </div>
                          )}
                        </div>
                        <div className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: chat.text }}></div>
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850/60 rounded-tl-none flex items-center space-x-2 text-xs text-slate-500">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        <span>Analyst is compiling metrics...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Suggestion prompts */}
                <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-850/50 flex flex-wrap gap-2">
                  <button 
                    onClick={() => { setAiPrompt('Compile financial summary'); }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100/50 hover:bg-slate-200/65 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800 text-[10px] text-slate-500 hover:text-slate-850 cursor-pointer transition"
                  >
                    📊 Compile financial summary
                  </button>
                  <button 
                    onClick={() => { setAiPrompt('Analyze worker performance score ratings'); }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100/50 hover:bg-slate-200/65 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800 text-[10px] text-slate-500 hover:text-slate-850 cursor-pointer transition"
                  >
                    👷 Analyze worker performance ratings
                  </button>
                </div>

                {/* Input prompt form */}
                <form onSubmit={handleAskAiAssistant} className="p-4 border-t border-slate-100 dark:border-slate-850/60 flex gap-2 bg-slate-100/20 dark:bg-slate-950/20">
                  <input
                    type="text"
                    placeholder="Query the financial ledger or team stats..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="flex-grow text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/55 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* CLIENT MANAGEMENT ADD/EDIT MODAL */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-filter backdrop-blur-md">
          <div className="w-full max-w-lg glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-850 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingClientEmail ? 'Edit Client Parameters' : 'Onboard New Client'}
              </h3>
              <button onClick={() => setClientModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>

            {clientError && (
              <div className="p-2 rounded bg-rose-500/15 text-rose-600 text-[10px] text-center font-bold">
                {clientError}
              </div>
            )}

            <form onSubmit={handleClientSubmit} className="space-y-4 text-left">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={clientForm.companyName}
                    onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingClientEmail}
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={clientForm.mobile}
                    onChange={(e) => setClientForm({ ...clientForm, mobile: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
              </div>

              {!editingClientEmail && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Default Password</label>
                  <input
                    type="text"
                    placeholder="Client@2026#"
                    value={clientForm.password}
                    onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={clientForm.country}
                    onChange={(e) => setClientForm({ ...clientForm, country: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={clientForm.state}
                    onChange={(e) => setClientForm({ ...clientForm, state: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200"
              >
                Confirm Client Configuration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* WORKER MANAGEMENT ADD MODAL */}
      {workerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-filter backdrop-blur-md">
          <div className="w-full max-w-md glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-850 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Onboard New Worker</h3>
              <button onClick={() => setWorkerModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>

            {workerError && (
              <div className="p-2 rounded bg-rose-500/15 text-rose-600 text-[10px] text-center font-bold">
                {workerError}
              </div>
            )}

            <form onSubmit={handleWorkerSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Worker ID</label>
                  <input
                    type="text"
                    required
                    placeholder="worker_ID (e.g. w4)"
                    value={workerForm.id}
                    onChange={(e) => setWorkerForm({ ...workerForm, id: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jason Kyle"
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jason@zentrio.ai"
                  value={workerForm.email}
                  onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Initial Salary</label>
                  <input
                    type="number"
                    required
                    value={workerForm.salary}
                    onChange={(e) => setWorkerForm({ ...workerForm, salary: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Default Password</label>
                  <input
                    type="text"
                    placeholder="Worker@2026#"
                    value={workerForm.password}
                    onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200"
              >
                Onboard Engineer Staff
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TASK ASSIGNMENT MODAL */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-filter backdrop-blur-md">
          <div className="w-full max-w-md glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-850 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Assign Task to Worker</h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Project Pipeline</label>
                <select
                  required
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                >
                  <option value="">Select active project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Train webhook validation hooks"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Task Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide instructions..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                ></textarea>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Deadline</label>
                  <input
                    type="date"
                    required
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200"
              >
                Commit Assigned Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PAYSLIP DETAIL MODAL POPUP */}
      {payslipModalOpen && selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-2xl relative text-left bg-white dark:bg-slate-950">
            
            {/* Payslip Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <img src="/LOGOO.png" alt="Zentrio Logo" className="w-8 h-8 object-contain" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-950 dark:text-white">Zentrio AI Corp.</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">ID: {selectedPayslip.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setPayslipModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
              >
                Close
              </button>
            </div>

            {/* Payslip body */}
            <div className="space-y-4 border-t border-b border-slate-100 dark:border-slate-850 py-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-heading">Employee Name</span>
                  <div className="font-extrabold text-slate-950 dark:text-white mt-0.5">{selectedPayslip.workerName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-heading">Month / Year</span>
                  <div className="font-extrabold text-slate-950 dark:text-white mt-0.5">{selectedPayslip.month} {selectedPayslip.year}</div>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-900/60 font-medium">
                  <span className="text-slate-500">Base Salary:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">₹{selectedPayslip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-900/60 font-medium">
                  <span className="text-slate-500">Bonuses / Incentives:</span>
                  <span className="font-bold text-emerald-500">+₹{selectedPayslip.bonuses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-900/60 font-medium">
                  <span className="text-slate-500">Deductions (Unpaid Leaves):</span>
                  <span className="font-bold text-rose-500">-₹{selectedPayslip.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-850 font-extrabold text-sm">
                  <span className="text-slate-955 dark:text-white">Net Disbursed Amount:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">₹{selectedPayslip.netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Print action footer */}
            <div className="mt-6 flex justify-end space-x-3.5">
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Payslip</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADMIN TEAM MEET CONTROL MODAL */}
      {meetModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-2xl relative text-left bg-white dark:bg-slate-950">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Admin Meeting Host Control</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Start meeting for all workers to automatically join</p>
                </div>
              </div>
              <button onClick={() => setMeetModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeMeeting ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <div className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">🔴 Live Meeting Active</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">Started by <strong>{activeMeeting.startedBy}</strong></p>
                <div className="flex justify-center space-x-2">
                  <a
                    href={activeMeeting.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
                  >
                    Open Live Call
                  </a>
                  <button
                    onClick={handleEndMeeting}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
                  >
                    End Meeting
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-2">Select a platform below to start meeting. Workers will be automatically notified with a direct join link:</p>
                
                <button
                  onClick={() => handleStartMeeting('google')}
                  className="w-full flex items-center space-x-3.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Start Google Meet</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Creates instant Google Meet & notifies workers</div>
                  </div>
                </button>

                <button
                  onClick={() => handleStartMeeting('zoom')}
                  className="w-full flex items-center space-x-3.5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Start Zoom Meeting</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Launches Zoom room & notifies workers</div>
                  </div>
                </button>

                <button
                  onClick={() => handleStartMeeting('teams')}
                  className="w-full flex items-center space-x-3.5 p-4 rounded-xl bg-slate-100/60 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-900/60 transition cursor-pointer group text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">Microsoft Teams Meet</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Launches MS Teams call & notifies workers</div>
                  </div>
                </button>
              </div>
            )}

            <p className="text-[10px] text-slate-400 text-center mt-5">Only administrators can start or end live team meetings.</p>
          </div>
        </div>
      )}

      {/* ENQUIRY REPLY WITH PROJECT NAME MODAL */}
      {replyModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative text-left bg-white dark:bg-slate-950">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Reply to Contact Enquiry</h3>
                <p className="text-[10px] text-slate-400">Recipient: <strong>{selectedEnquiry.name}</strong> ({selectedEnquiry.email})</p>
              </div>
              <button onClick={() => setReplyModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEnquiryReply} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Name / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Zentrio E-Commerce Suite"
                  value={replyProjectName}
                  onChange={(e) => setReplyProjectName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none font-semibold text-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Response Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type your official reply details here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySending}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{replySending ? 'Sending...' : 'Dispatch Reply Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

