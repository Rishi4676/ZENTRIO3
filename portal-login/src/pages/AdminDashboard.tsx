import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import type { ProjectStatus, User } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    projects,
    tickets,
    payments,
    attendance,
    tasks,
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
    replyToTicket,
    resolveTicket,
    companyProfile,
    updateCompanyProfile,
    addNotification
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'workers' | 'projects' | 'finance' | 'support' | 'reports' | 'settings'>('overview');

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
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 transition ${
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
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 transition ${
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
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 transition ${
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
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 transition ${
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
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 transition ${
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
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 transition ${
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
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>Suite Settings</span>
          </button>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-grow">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                          <td className="py-4 font-bold text-slate-500">{client.companyName}</td>
                          <td className="py-4 font-medium text-slate-500">{client.mobile}</td>
                          <td className="py-4 font-medium text-slate-400">{client.city}, {client.country}</td>
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
                    placeholder="WORKER004"
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

    </div>
  );
};
