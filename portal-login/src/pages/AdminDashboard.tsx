import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Briefcase,
  DollarSign,
  Ticket,
  Bot,
  Settings,
  Edit2,
  Trash2,
  Send,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  LogOut,
  Video,
  X,
  FileText,
  MessageSquare,
  Mail
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
    addWorkerTask,
    replyToTicket,
    companyProfile,
    updateCompanyProfile,
    addNotification,
    messages,
    sendChatMessage,
    clearChannelMessages,
    payslips,
    addPayslip
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'workers' | 'projects' | 'finance' | 'support' | 'reports' | 'settings' | 'enquiries' | 'chat' | 'audit' | 'ai'>('overview');
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
        sendChatMessage('internal-team', `🚨 TEAM MEET STARTED by ${currentUser?.name || 'Admin'}! Link: ${url}`);
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
      sendChatMessage('internal-team', `🏁 Team meeting has ended.`);
    } catch (e) {}
  };

  const [payrollWorkerId, setPayrollWorkerId] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('August');
  const [payrollYear, setPayrollYear] = useState(2026);
  const [payrollBaseSalary, setPayrollBaseSalary] = useState(50000);
  const [payrollBonuses, setPayrollBonuses] = useState(0);
  const [payrollDeductions, setPayrollDeductions] = useState(0);
  const [payrollSuccess, setPayrollSuccess] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello Admin! I am your AI Business Analyst. You can query me about company financials, team performance, or operational stats.' }
  ]);
  
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
        body: JSON.stringify({ email: selectedEnquiry.email, recipientName: selectedEnquiry.name, projectName: replyProjectName, replyMessage: replyText })
      });
      const data = await res.json();
      setReplySending(false);
      if (data.success) {
        addNotification(`Reply dispatched to ${selectedEnquiry.email}`, 'success');
        setReplyModalOpen(false);
        setReplyText('');
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
        .then(data => { if (data.success) setAuditLogs(data.logs); setLoadingAudit(false); })
        .catch(() => setLoadingAudit(false));
    }
  }, [activeTab]);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClientEmail, setEditingClientEmail] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState({ name: '', email: '', password: '', companyName: '', mobile: '', country: '', state: '', city: '' });
  const [clientError, setClientError] = useState('');

  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState({ id: '', name: '', email: '', password: '', performanceScore: 100, salary: 50000 });
  const [workerError, setWorkerError] = useState('');

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [taskForm, setTaskForm] = useState({ projectId: '', title: '', description: '', priority: 'medium' as 'low'|'medium'|'high', deadline: '' });

  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [selectedProjId, setSelectedProjId] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState('');

  const activeClients = users.filter(u => u.role === 'client');
  const activeWorkers = users.filter(u => u.role === 'worker');
  const activeProjects = projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
  const pendingProjects = projects.filter(p => p.status === 'planning');
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

  const handleEditClientClick = (client: User) => {
    setEditingClientEmail(client.email);
    setClientForm({ name: client.name || '', email: client.email || '', password: '', companyName: client.companyName || '', mobile: client.mobile || '', country: client.country || '', state: client.state || '', city: client.city || '' });
    setClientModalOpen(true);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientError('');
    if (editingClientEmail) {
      const res = await editClient(editingClientEmail, { ...clientForm });
      if (res.success) { setClientModalOpen(false); setEditingClientEmail(null); } else setClientError(res.message);
    } else {
      const res = await addClient({ ...clientForm, role: 'client' });
      if (res.success) { setClientModalOpen(false); setClientForm({ name: '', email: '', password: '', companyName: '', mobile: '', country: '', state: '', city: '' }); } else setClientError(res.message);
    }
  };

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWorkerError('');
    const res = await addWorker({ ...workerForm, role: 'worker' });
    if (res.success) { setWorkerModalOpen(false); setWorkerForm({ id: '', name: '', email: '', password: '', performanceScore: 100, salary: 50000 }); } else setWorkerError(res.message);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) return;
    const proj = projects.find(p => p.id === taskForm.projectId);
    addWorkerTask(selectedWorkerId, { ...taskForm, projectTitle: proj?.title || 'General' });
    setTaskModalOpen(false);
    setTaskForm({ projectId: '', title: '', description: '', priority: 'medium', deadline: '' });
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(companyProfile);
    setProfileSuccess('Settings updated successfully!');
    setTimeout(() => setProfileSuccess(''), 4000);
  };

  const handleGeneratePayslipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const worker = users.find(u => u.id === payrollWorkerId);
    if (!worker) return;
    const res = await addPayslip({ workerId: worker.id, workerName: worker.name, workerEmail: worker.email, month: payrollMonth, year: Number(payrollYear), baseSalary: Number(payrollBaseSalary), bonuses: Number(payrollBonuses), deductions: Number(payrollDeductions) });
    if (res.success) setPayrollSuccess(`Payslip issued for ${worker.name}`);
  };

  const handleAiQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const userText = aiPrompt;
    setAiPrompt('');
    setAiChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/query', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: userText }) });
      const data = await res.json();
      setAiLoading(false);
      if (data.success) setAiChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err) { setAiLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-900 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg"><ShieldCheck className="w-6 h-6 text-white" /></div>
          <div>
            <h1 className="text-base font-extrabold">{companyProfile.name || 'ZENTRIO'}</h1>
            <p className="text-[11px] text-slate-500">Admin Console</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button onClick={logout} className="p-2.5 rounded-xl text-slate-500 hover:text-rose-600 transition"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          {[
            { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
            { id: 'clients', label: 'Client Workspaces', icon: Users },
            { id: 'workers', label: 'Engineering Staff', icon: UserPlus },
            { id: 'projects', label: 'Project Pipelines', icon: Briefcase },
            { id: 'finance', label: 'Financials Ledger', icon: DollarSign },
            { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
            { id: 'support', label: 'Support Tickets', icon: Ticket },
            { id: 'enquiries', label: 'Contact Enquiries', icon: Mail },
            { id: 'chat', label: 'Collaboration Chat', icon: MessageSquare },
            { id: 'audit', label: 'Security Audit Logs', icon: ShieldCheck },
            { id: 'settings', label: 'Suite Settings', icon: Settings },
            { id: 'ai', label: 'AI Analyst Helper', icon: Bot }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 transition ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-900'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
          <button onClick={() => setMeetModalOpen(true)} className="w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 text-emerald-600 border border-emerald-500/20">
            <Video className="w-4 h-4" />
            <span>Team Meet Control</span>
          </button>
        </aside>

        <main className="flex-grow">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</span>
                  <div className="text-xl font-extrabold mt-1">${totalRevenue.toLocaleString()}</div>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Projects</span>
                  <div className="text-xl font-extrabold mt-1">{activeProjects.length}</div>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enquiries</span>
                  <div className="text-xl font-extrabold mt-1">{enquiries.length}</div>
                </div>
                <div className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Engineering</span>
                  <div className="text-xl font-extrabold mt-1">{activeWorkers.length}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'workers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold">Engineering Staff</h2>
                <button onClick={() => setWorkerModalOpen(true)} className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl">Onboard Engineer</button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {activeWorkers.map(w => (
                  <div key={w.id} className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-850">
                    <h3 className="font-bold">{w.name}</h3>
                    <p className="text-xs text-slate-500">{w.email}</p>
                    <button onClick={() => { setSelectedWorkerId(w.id); setTaskModalOpen(true); }} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg">Dispatch Task</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'chat' && (
            <ChatWorkspace
              currentUser={currentUser}
              messages={messages}
              projects={projects}
              sendChatMessage={sendChatMessage}
              clearChannelMessages={clearChannelMessages}
            />
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleProfileSave} className="max-w-xl glass-card p-6 rounded-2xl space-y-4">
              <input type="text" value={companyProfile.name} onChange={e => updateCompanyProfile({ ...companyProfile, name: e.target.value })} className="w-full p-2 border rounded-lg" placeholder="Company Name" />
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Save Settings</button>
            </form>
          )}

        </main>
      </div>

      {workerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="font-bold mb-4">Onboard Engineer</h3>
            <form onSubmit={handleWorkerSubmit} className="space-y-3">
              <input type="text" required placeholder="Worker Name" value={workerForm.name} onChange={e => setWorkerForm({...workerForm, name: e.target.value})} className="w-full p-2 border rounded-lg" />
              <input type="email" required placeholder="Work Email" value={workerForm.email} onChange={e => setWorkerForm({...workerForm, email: e.target.value})} className="w-full p-2 border rounded-lg" />
              <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-lg font-bold">Add Engineer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
