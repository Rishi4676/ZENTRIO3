import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckSquare,
  Clock,
  UploadCloud,
  MessageSquare,
  Bell,
  LogOut,
  Calendar,
  Play,
  Square,
  CheckCircle,
  AlertCircle,
  Send,
  Bot,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  FileText,
  Printer,
  Briefcase,
  Trash2,
  Video,
  Phone,
  Mail,
  X,
  Users
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { ChatWorkspace } from '../components/ChatWorkspace';
import type { WorkerTask, Project, Payslip } from '../types';

export const WorkerDashboard: React.FC = () => {
  const {
    currentUser,
    logout,
    projects,
    tasks,
    updateTaskStatus,
    attendance,
    markAttendance,
    addDeliverable,
    messages,
    sendChatMessage,
    clearChannelMessages,
    notifications,
    clearNotifications,
    leaves,
    payslips,
    addLeaveRequest
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'attendance' | 'deliverables' | 'chat' | 'deadlines' | 'ai' | 'meet'>('tasks');
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [meetModalOpen, setMeetModalOpen] = useState(false);

  // Time Tracker stopwatch states
  const [timerActive, setTimerActive] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Deliverable Upload Form States
  const [delProjectId, setDelProjectId] = useState('');
  const [delName, setDelName] = useState('');
  const [delUrl, setDelUrl] = useState('');
  const [delSuccess, setDelSuccess] = useState('');
  const [delFile, setDelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');



  // Leave Request Form States
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState<'casual' | 'sick' | 'paid'>('casual');
  const [leaveSuccess, setLeaveSuccess] = useState('');

  // Payslip Modal States
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  // AI Assistant States
  const aiChatKey = `ai_copilot_history_${currentUser?.id || 'worker'}`;
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement | null>(null);
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>(() => {
    try {
      const saved = localStorage.getItem(aiChatKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ role: 'ai', text: 'Hello! I am your AI Copilot. Ask me questions about task scripts, HTML layouts, database scaling, or coding templates.' }];
  });



  // Filter lists for this specific worker (matching ID, case-insensitive ID, or Email or Name)
  const workerTasks = tasks.filter(t => 
    t.workerId === currentUser?.id || 
    (t.workerId && currentUser?.id && t.workerId.toLowerCase() === currentUser.id.toLowerCase()) ||
    (t.workerId && currentUser?.email && t.workerId.toLowerCase() === currentUser.email.toLowerCase()) ||
    (t.workerId && currentUser?.name && t.workerId.toLowerCase() === currentUser.name.toLowerCase())
  );
  const workerProjects = projects.filter(p => 
    p.assignedWorkerId === currentUser?.id || 
    (p.assignedWorkerId && currentUser?.id && p.assignedWorkerId.toLowerCase() === currentUser.id.toLowerCase()) ||
    (p.assignedWorkerId && currentUser?.email && p.assignedWorkerId.toLowerCase() === currentUser.email.toLowerCase()) ||
    (p.assignedWorkerName && currentUser?.name && p.assignedWorkerName.toLowerCase() === currentUser.name.toLowerCase())
  );
  // Fix #7: Only show non-completed projects in deliverable dropdown
  const activeWorkerProjects = workerProjects.filter(p => p.status !== 'completed' && p.status !== 'delivered');

  const workerAttendance = attendance.filter(a => 
    a.workerId === currentUser?.id || 
    (a.workerId && currentUser?.id && a.workerId.toLowerCase() === currentUser.id.toLowerCase()) ||
    (a.workerId && currentUser?.email && a.workerId.toLowerCase() === currentUser.email.toLowerCase())
  );
  const workerLeaves = leaves.filter(l => 
    l.workerId === currentUser?.id || 
    (l.workerId && currentUser?.id && l.workerId.toLowerCase() === currentUser.id.toLowerCase())
  );
  const workerPayslips = payslips.filter(p => 
    p.workerId === currentUser?.id || 
    (p.workerId && currentUser?.id && p.workerId.toLowerCase() === currentUser.id.toLowerCase())
  );


  // Time Tracker Stopwatch side-effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Fix #4: Persist AI chat history to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(aiChatKey, JSON.stringify(aiChatHistory));
    } catch {}
  }, [aiChatHistory]);

  // Auto-scroll AI chat to bottom
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory, aiLoading]);


  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handleStartTimer = (taskId: string) => {
    setActiveTaskId(taskId);
    setTimerActive(true);
  };

  const handleStopTimer = () => {
    setTimerActive(false);
    const t = workerTasks.find(x => x.id === activeTaskId);
    alert(`Logged ${formatTimer(timeElapsed)} hours onto Task: "${t ? t.title : 'Active Pipeline'}"`);
    setTimeElapsed(0);
    setActiveTaskId(null);
  };

  const handleMarkPresent = () => {
    if (!currentUser) return;
    markAttendance(currentUser.id, 'present');
  };

  const handleMarkAbsent = () => {
    if (!currentUser) return;
    markAttendance(currentUser.id, 'absent');
  };

  const getCsrfToken = () => {
    if (typeof document === 'undefined') return '';
    return document.cookie.split('; ').find(row => row.startsWith('csrfToken='))?.split('=')[1] || '';
  };

  const handleUploadDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delProjectId || !delName) return;

    let finalUrl = delUrl || '#';
    setIsUploading(true);
    setUploadError('');

    if (delFile) {
      try {
        const formData = new FormData();
        formData.append('file', delFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': getCsrfToken()
          },
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          finalUrl = data.url;
        } else {
          throw new Error(data.message || 'File upload failed');
        }
      } catch (err: any) {
        console.error('Deliverable upload error:', err);
        setUploadError(`File upload failed: ${err.message}. Please try again.`);
        setIsUploading(false);
        return;
      }
    }

    addDeliverable(
      delProjectId,
      delName,
      finalUrl,
      currentUser?.name || 'Assigned Developer'
    );

    setIsUploading(false);
    setDelSuccess(`Deliverable "${delName}" committed to repository workspace successfully.`);
    setDelProjectId('');
    setDelName('');
    setDelUrl('');
    setDelFile(null);
    setTimeout(() => setDelSuccess(''), 5000);
  };

  const handleLeaveRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason || !currentUser) return;

    await addLeaveRequest({
      workerId: currentUser.id,
      workerName: currentUser.name,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason,
      type: leaveType
    });

    setLeaveSuccess('Leave request submitted to administration portal successfully.');
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
    setLeaveType('casual');
    setTimeout(() => setLeaveSuccess(''), 5000);
  };

  const handleAskAiCopilot = async (e?: React.FormEvent) => {
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
          role: 'worker',
          context: {
            workerId: currentUser?.id,
            workerName: currentUser?.name,
            tasksCount: workerTasks.length,
            completedTasks: workerTasks.filter(t => t.status === 'completed').length,
            projects: workerProjects.map(p => ({ id: p.id, title: p.title }))
          }
        })
      });
      const data = await res.json();
      setAiLoading(false);
      if (data.success && data.response) {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
      } else {
        setAiChatHistory(prev => [...prev, { role: 'ai', text: 'Sorry, I failed to process that request. Let me know if you want templates.' }]);
      }
    } catch (err) {
      setAiLoading(false);
      setAiChatHistory(prev => [...prev, { role: 'ai', text: 'Server connection error. Please verify endpoints.' }]);
    }
  };

  const priorityColor = (pri: string) => {
    switch (pri) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const isCheckedInToday = workerAttendance.some(a => a.date === getTodayDateString() && a.status === 'present');

  // Kanban Columns configuration
  const kanbanColumns: { id: WorkerTask['status']; title: string; color: string; bg: string }[] = [
    { id: 'pending', title: 'To Do', color: 'text-rose-500 border-rose-500/25', bg: 'bg-rose-500/5 dark:bg-rose-500/2' },
    { id: 'in_progress', title: 'In Progress', color: 'text-amber-500 border-amber-500/25', bg: 'bg-amber-500/5 dark:bg-amber-500/2' },
    { id: 'under_review', title: 'Under Review', color: 'text-indigo-500 border-indigo-500/25', bg: 'bg-indigo-500/5 dark:bg-indigo-500/2' },
    { id: 'completed', title: 'Completed', color: 'text-emerald-500 border-emerald-500/25', bg: 'bg-emerald-500/5 dark:bg-emerald-500/2' }
  ];

  const moveTask = (taskId: string, currentStatus: WorkerTask['status'], direction: 'left' | 'right') => {
    const statusSequence: WorkerTask['status'][] = ['pending', 'in_progress', 'under_review', 'completed'];
    const currentIndex = statusSequence.indexOf(currentStatus);
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex >= 0 && targetIndex < statusSequence.length) {
      updateTaskStatus(taskId, statusSequence[targetIndex]);
    }
  };

  // Gantt Chart logic: Calculate timeline positions for milestones
  const getMilestoneTimeline = (project: Project, index: number) => {
    const startStr = project.createdAt || '2026-07-01';
    const endStr = project.deadline || '2026-08-25';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const duration = end.getTime() - start.getTime() || 1;
    
    // Distribute milestones evenly if no dates exist
    const mStart = new Date(start.getTime() + index * (duration / project.milestones.length));
    const mEnd = new Date(start.getTime() + (index + 1) * (duration / project.milestones.length));
    
    return {
      startStr: mStart.toISOString().split('T')[0],
      endStr: mEnd.toISOString().split('T')[0],
      percentageStart: Math.round((index / project.milestones.length) * 100),
      percentageWidth: Math.round((1 / project.milestones.length) * 100)
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* HEADER BAR */}
      <header className="glass-nav sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center space-x-3 hover:opacity-85 transition">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-7 h-7 object-contain" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Zentrio Terminal</span>
        </a>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {/* Notifications logs */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2.5 rounded-xl transition glass hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-300 relative animate-none"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl shadow-xl p-4 z-40 border border-slate-200/50 dark:border-slate-850">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">System Logs</span>
                  <button onClick={clearNotifications} className="text-[10px] text-indigo-500 hover:underline font-semibold">Clear</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">No new logs.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/40 text-xs">
                        <div className="font-semibold text-slate-700 dark:text-slate-300">{n.text}</div>
                        <div className="text-[9px] text-slate-555 text-right mt-1">{n.timestamp}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <img
              src={currentUser?.avatar}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">{currentUser?.name}</div>
              <div className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">DEV ID: {currentUser?.id}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition active:scale-95 animate-none"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* DASHBOARD LAYOUT */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-900">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckSquare className="w-4 h-4 shrink-0" />
            <span>Kanban Task Board</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Attendance & Leaves</span>
          </button>

          <button
            onClick={() => setActiveTab('deliverables')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'deliverables'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span>Upload Deliverables</span>
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
            <span>Internal Team Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'deadlines'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Project Timelines</span>
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
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setMeetModalOpen(true)}
            className="w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>Team Meet</span>
          </button>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-grow space-y-6 overflow-hidden">
          
          {/* TOP SUMMARY: PERFORMANCE METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
            <div className="glass-card p-4 rounded-xl border border-slate-200/40 dark:border-slate-850">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-heading">Performance Score</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{currentUser?.performanceScore || 100}%</span>
                <span className="text-[10px] text-emerald-500 font-semibold">Excellent</span>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-200/40 dark:border-slate-850">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-heading">Task Completion Rate</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {workerTasks.length > 0
                    ? Math.round((workerTasks.filter(t => t.status === 'completed').length / workerTasks.length) * 100)
                    : 100}%
                </span>
                <span className="text-[9px] text-slate-500 font-semibold font-mono">
                  ({workerTasks.filter(t => t.status === 'completed').length}/{workerTasks.length})
                </span>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-200/40 dark:border-slate-850 col-span-2 sm:col-span-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-heading">Check In Attendance</span>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-2">
                {isCheckedInToday ? (
                  <span className="text-emerald-500 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Logged present today</span>
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4 animate-bounce" />
                    <span>Check-in required</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* TAB 1: KANBAN TASK BOARD */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Interactive Kanban Board</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Drag-and-drop or status-click to update project milestones.</p>
                </div>

                {/* Simulated live timer bar */}
                {timerActive && (
                  <div className="flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl animate-pulse">
                    <span className="text-xs font-bold text-indigo-500 font-mono">{formatTimer(timeElapsed)}</span>
                    <button
                      onClick={handleStopTimer}
                      className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg cursor-pointer"
                      title="Stop logging time"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                )}
              </div>

              {workerTasks.length === 0 ? (
                <div className="glass-card text-center p-12 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                  <CheckSquare className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No tasks assigned</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Nominal pipeline state. Administrator has not assigned tasks.</p>
                </div>
              ) : (
                /* Kanban Grid columns */
                <div className="grid lg:grid-cols-4 gap-5 items-start">
                  {kanbanColumns.map(col => {
                    const colTasks = workerTasks.filter(t => t.status === col.id);
                    return (
                      <div key={col.id} className={`rounded-2xl p-4 border border-slate-200/40 dark:border-slate-850/60 ${col.bg} min-h-[380px] flex flex-col`}>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/30 dark:border-slate-850/40">
                          <h3 className={`text-xs font-extrabold uppercase tracking-widest ${col.color.split(' ')[0]}`}>{col.title}</h3>
                          <span className="text-[10px] font-extrabold bg-slate-200/60 dark:bg-slate-900 px-2 py-0.5 rounded-full text-slate-500">{colTasks.length}</span>
                        </div>

                        <div className="space-y-3.5 flex-grow overflow-y-auto max-h-[480px]">
                          {colTasks.length === 0 ? (
                            <div className="text-center py-10 text-[11px] text-slate-400 dark:text-slate-500 italic">No tasks in stage</div>
                          ) : (
                            colTasks.map(task => (
                              <div key={task.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shadow-sm relative group hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">{task.id}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${priorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                </div>
                                <h4 className="text-xs font-extrabold text-slate-950 dark:text-white line-clamp-1">{task.title}</h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                                
                                <div className="mt-3 flex justify-between items-center text-[9px] text-slate-400 font-medium">
                                  <span>Proj: {task.projectTitle}</span>
                                </div>

                                {/* Quick Move actions and Track Time */}
                                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-850/50 flex justify-between items-center">
                                  <div className="flex items-center space-x-1">
                                    {col.id !== 'pending' && (
                                      <button 
                                        onClick={() => moveTask(task.id, task.status, 'left')}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                        title="Move Left"
                                      >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {col.id !== 'completed' && (
                                      <button 
                                        onClick={() => moveTask(task.id, task.status, 'right')}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                                        title="Move Right"
                                      >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  {col.id !== 'completed' && (
                                    <div>
                                      {activeTaskId === task.id && timerActive ? (
                                        <button
                                          onClick={handleStopTimer}
                                          className="px-2 py-1 text-[9px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg flex items-center space-x-1 cursor-pointer"
                                        >
                                          <Square className="w-2.5 h-2.5 fill-current" />
                                          <span>Stop</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleStartTimer(task.id)}
                                          disabled={timerActive}
                                          className="px-2 py-1 text-[9px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
                                        >
                                          <Play className="w-2.5 h-2.5 fill-current" />
                                          <span>Track</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ATTENDANCE & LEAVES & PAYROLL */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 text-left">
              <div className="grid lg:grid-cols-2 gap-6 items-start">
                
                {/* Left Side: Attendance checklist and history */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Attendance & Time Logs</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mark daily check-in states and verify logs.</p>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm flex justify-between items-center gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Terminal</h3>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">Today: {getTodayDateString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleMarkPresent}
                        disabled={isCheckedInToday}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/35 rounded-xl transition shadow cursor-pointer disabled:cursor-not-allowed"
                      >
                        Check In (Present)
                      </button>
                      <button
                        onClick={handleMarkAbsent}
                        className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 glass hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-300/40 dark:border-slate-800 cursor-pointer"
                      >
                        Mark Absent
                      </button>
                    </div>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm max-h-[300px] overflow-y-auto">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Past Time Logs</h3>
                    {workerAttendance.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500 italic">No logs tracked. Check In above to insert first record.</div>
                    ) : (
                      <div className="space-y-2">
                        {workerAttendance.map((rec, i) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 text-xs">
                            <span className="font-semibold text-slate-500">{rec.date}</span>
                            <div className="flex items-center space-x-3">
                              {rec.checkIn && (
                                <span className="text-[10px] text-slate-400 font-mono">In: {rec.checkIn} {rec.checkOut && `| Out: ${rec.checkOut}`}</span>
                              )}
                              <span className={`font-bold px-2 py-0.5 rounded text-[9px] ${
                                rec.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                              }`}>
                                {rec.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Apply Leave and Leave History */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight">Leave Request Center</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submit leave requests and check administrator approvals.</p>
                  </div>

                  {leaveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 text-center">
                      {leaveSuccess}
                    </div>
                  )}

                  <form onSubmit={handleLeaveRequestSubmit} className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Request Leave Form</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
                        <input
                          type="date"
                          required
                          value={leaveStartDate}
                          onChange={(e) => setLeaveStartDate(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
                        <input
                          type="date"
                          required
                          value={leaveEndDate}
                          onChange={(e) => setLeaveEndDate(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Leave Category</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="casual">Casual Leave</option>
                        <option value="sick">Sick Leave</option>
                        <option value="paid">Earned / Paid Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reason Description</label>
                      <textarea
                        required
                        placeholder="Provide details about your leave application..."
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow cursor-pointer"
                    >
                      Submit Leave Request
                    </button>
                  </form>

                  <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm max-h-[220px] overflow-y-auto">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Leaves History</h3>
                    {workerLeaves.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500 italic">No leaves applied.</div>
                    ) : (
                      <div className="space-y-2">
                        {workerLeaves.map(lev => (
                          <div key={lev.id} className="p-3 rounded-lg bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 text-xs flex justify-between items-center">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{lev.startDate} to {lev.endDate}</div>
                              <div className="text-[10px] text-slate-555 italic mt-0.5">{lev.reason} ({lev.type})</div>
                            </div>
                            <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                              lev.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                              (lev.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20')
                            }`}>
                              {lev.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Payslip History section */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm">
                <div className="flex items-center space-x-2.5 mb-4">
                  <div className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">My Salary Slip Documents</h3>
                </div>

                {workerPayslips.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 italic">No payslips emitted for your account. Please consult payroll manager.</div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workerPayslips.map(ps => (
                      <div key={ps.id} className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white">{ps.month} {ps.year}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono font-heading">Net Paid: ₹{ps.netSalary.toLocaleString()}</div>
                        </div>
                        <button 
                          onClick={() => { setSelectedPayslip(ps); setPayslipModalOpen(true); }}
                          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] shadow cursor-pointer flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Payslip</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: UPLOAD DELIVERABLES */}
          {activeTab === 'deliverables' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Sync Code & Handover Deliverables</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Publish deliverables, invitation zip packages, and system files for clients.</p>
              </div>

              {delSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 text-center flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{delSuccess}</span>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6 items-start">
                <form onSubmit={handleUploadDeliverable} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Active Project</label>
                    <select
                      required
                      value={delProjectId}
                      onChange={(e) => setDelProjectId(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Project Assignment</option>
                      {activeWorkerProjects.length === 0 ? (
                        <option disabled>No active projects assigned</option>
                      ) : (
                        activeWorkerProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.id} – {p.title} ({p.status})</option>
                        ))
                      )}
                    </select>
                    {activeWorkerProjects.length === 0 && (
                      <p className="text-[10px] text-amber-500 font-semibold mt-1.5">⚠ All assigned projects are completed. No active projects to submit deliverables for.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deliverable Name / Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. invite-RSVP-module-dist.zip, documentation.pdf"
                      value={delName}
                      onChange={(e) => setDelName(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resource File Link (HTTP/Cloud url) (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/file/d/..."
                      value={delUrl}
                      onChange={(e) => setDelUrl(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deliverable File (Optional)</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setDelFile(e.target.files[0]);
                          if (!delName) {
                            setDelName(e.target.files[0].name);
                          }
                          setUploadError('');
                        } else {
                          setDelFile(null);
                        }
                      }}
                      className="w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-600/20 bg-transparent text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5"
                    />
                    <div className="mt-1 flex flex-col gap-0.5">
                      {isUploading && <span className="text-[10px] text-indigo-500 font-semibold animate-pulse">Uploading file to storage...</span>}
                      {uploadError && <span className="text-[10px] text-rose-500 font-semibold">{uploadError}</span>}
                      {delFile && !isUploading && !uploadError && <span className="text-[10px] text-emerald-500 font-semibold">Selected file: {delFile.name} ({(delFile.size / 1024).toFixed(1)} KB)</span>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md flex items-center justify-center space-x-2 cursor-pointer animate-none"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Publish Handover Deliverable</span>
                  </button>
                </form>

                {/* Fix #5 & #8: Project detail and client contact panel */}
                <div className="space-y-4">
                  {workerProjects.length === 0 ? (
                    <div className="glass-card text-center p-8 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                      <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                      <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No Projects Assigned</h3>
                      <p className="text-xs text-slate-500 mt-1">Contact your admin to get a project assigned.</p>
                    </div>
                  ) : (
                    workerProjects.map(proj => (
                      <div key={proj.id} className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">{proj.title}</h3>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">{proj.id} · {proj.status} · {proj.progress}% done</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{proj.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.techRequired?.map(t => (
                            <span key={t} className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">{t}</span>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                            <Users className="w-3 h-3" />
                            <span>Client Contact for Project Queries</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                              <span className="font-bold">{proj.clientName}</span>
                              {proj.clientCompany && <span className="text-slate-400">· {proj.clientCompany}</span>}
                            </div>
                            {proj.clientId && (
                              <a href={`mailto:${proj.clientId}`} className="flex items-center space-x-1.5 text-[10px] text-indigo-500 hover:underline font-semibold">
                                <Mail className="w-3 h-3" />
                                <span>{proj.clientId}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}


          {/* TAB 4: INTERNAL TEAM CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Engineering Team Chatroom</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Coordinate repository updates and share webhook endpoints in real time.</p>
              </div>

              <div className="glass-card rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm overflow-hidden h-[450px] flex flex-col">
                <ChatWorkspace
                  currentUser={currentUser}
                  messages={messages}
                  projects={projects}
                  sendChatMessage={sendChatMessage}
                  clearChannelMessages={clearChannelMessages}
                />
              </div>
            </div>
          )}

          {/* TAB 5: PROJECT TIMELINES / GANTT */}
          {activeTab === 'deadlines' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Interactive Gantt Timeline</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Verify deadline pacing and milestone schedules.</p>
              </div>

              {workerProjects.length === 0 ? (
                <div className="glass-card text-center p-12 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                  <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No active project timelines</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Nominal state. No projects assigned to your engineer card.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {workerProjects.map(proj => (
                    <div key={proj.id} className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-955 dark:text-white">{proj.title}</h3>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">{proj.id} | Deadline: {proj.deadline}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{proj.progress}% Done</span>
                      </div>

                      {/* Visual Gantt timeline chart representing milestones */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-heading">Milestones Gantt Representation</h4>
                        <div className="relative border-l border-slate-200 dark:border-slate-850/80 pl-4 py-2 space-y-5">
                          {proj.milestones.map((ms, index) => {
                            const timeline = getMilestoneTimeline(proj, index);
                            return (
                              <div key={ms.id} className="relative group">
                                <div className="absolute -left-[21px] mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-indigo-500"></div>
                                <div className="flex justify-between text-[11px] mb-1 font-semibold">
                                  <span>{ms.title}</span>
                                  <span className={ms.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}>{ms.status.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                  {/* Milestone timeline progress bar */}
                                  <div className="flex-grow h-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 overflow-hidden relative">
                                    <div 
                                      className={`h-full rounded-full ${ms.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500/70'}`}
                                      style={{ width: `${ms.status === 'completed' ? 100 : 50}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[9px] font-mono text-slate-400 shrink-0 font-heading">{timeline.startStr} to {timeline.endStr}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: AI COPILOT */}
          {activeTab === 'ai' && (
            <div className="space-y-6 text-left flex flex-col h-[520px]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">AI Developer Copilot</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Generate code templates, analyze backlog errors, and consult LLM instructions.</p>
                </div>
                <button
                  onClick={() => {
                    const reset = [{ role: 'ai' as const, text: 'Hello! I am your AI Copilot. Chat cleared. Ask me anything!' }];
                    setAiChatHistory(reset);
                    try { localStorage.setItem(aiChatKey, JSON.stringify(reset)); } catch {}
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition cursor-pointer"
                  title="Clear Copilot Chat History"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Chat</span>
                </button>
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
                            <span className="font-bold text-[9px] uppercase tracking-wider">Me</span>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span className="font-bold text-[9px] uppercase tracking-wider text-indigo-400">AI Copilot</span>
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
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animate-none" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animate-none" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce animate-none" style={{ animationDelay: '300ms' }}></span>
                        <span>Copilot is writing code...</span>
                      </div>
                    </div>
                  )}
                  <div ref={aiChatEndRef} />
                </div>

                {/* Chat Suggestion prompts */}
                <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-850/50 flex flex-wrap gap-2">
                  <button 
                    onClick={() => { setAiPrompt('Draft invite module script'); }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100/50 hover:bg-slate-200/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800 text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 cursor-pointer transition"
                  >
                    💡 Draft invite module script
                  </button>
                  <button 
                    onClick={() => { setAiPrompt('How do I run the Vite app locally?'); }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100/50 hover:bg-slate-200/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/80 border border-slate-200/40 dark:border-slate-800 text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 cursor-pointer transition"
                  >
                    💡 Help with Vite local running
                  </button>
                </div>

                {/* Input prompt form */}
                <form onSubmit={handleAskAiCopilot} className="p-4 border-t border-slate-100 dark:border-slate-850/60 flex gap-2 bg-slate-100/20 dark:bg-slate-950/20">
                  <input
                    type="text"
                    placeholder="Ask Copilot a question..."
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

      {/* PAYSLIP DETAIL MODAL POPUP */}
      {payslipModalOpen && selectedPayslip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-2xl relative text-left bg-white dark:bg-slate-950">
            
            {/* Payslip Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-3">
                <img src="/LOGOO.png" alt="Zentrio Logo" className="w-8 h-8 object-contain" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-955 dark:text-white">Zentrio AI Corp.</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono font-heading">ID: {selectedPayslip.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setPayslipModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer font-bold"
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
                  <span className="text-slate-950 dark:text-white">Net Disbursed Amount:</span>
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

      {/* TEAM MEET MODAL (Fix #6) */}
      {meetModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-2xl relative text-left bg-white dark:bg-slate-950">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Team Meet</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Start or join a video call with your team</p>
                </div>
              </div>
              <button onClick={() => setMeetModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3.5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">Start Google Meet</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Create instant video call link</div>
                </div>
              </a>

              <a
                href="https://zoom.us/start/videomeeting"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3.5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">Start Zoom Meeting</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Open Zoom video conference</div>
                </div>
              </a>

              <a
                href="https://teams.microsoft.com/l/meeting/new"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3.5 p-4 rounded-xl bg-slate-100/60 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-900/60 transition cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">Microsoft Teams Meet</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Launch Teams video call</div>
                </div>
              </a>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-5">These links open in a new tab. Share with your team to collaborate.</p>
          </div>
        </div>
      )}

    </div>
  );
};
