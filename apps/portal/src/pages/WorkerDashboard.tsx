import React, { useState, useEffect } from 'react';
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
  Send
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';


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
    notifications,
    clearNotifications
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'attendance' | 'deliverables' | 'chat' | 'deadlines'>('tasks');
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

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

  // Internal Chat State
  const [teamMessage, setTeamMessage] = useState('');

  // Filter lists for this specific worker (matching ID, case-insensitive ID, or Email)
  const workerTasks = tasks.filter(t => 
    t.workerId === currentUser?.id || 
    (t.workerId && currentUser?.id && t.workerId.toLowerCase() === currentUser.id.toLowerCase()) ||
    (t.workerId && currentUser?.email && t.workerId.toLowerCase() === currentUser.email.toLowerCase())
  );
  const workerProjects = projects.filter(p => 
    p.assignedWorkerId === currentUser?.id || 
    (p.assignedWorkerId && currentUser?.id && p.assignedWorkerId.toLowerCase() === currentUser.id.toLowerCase()) ||
    (p.assignedWorkerName && currentUser?.name && p.assignedWorkerName.toLowerCase() === currentUser.name.toLowerCase())
  );
  const workerAttendance = attendance.filter(a => 
    a.workerId === currentUser?.id || 
    (a.workerId && currentUser?.id && a.workerId.toLowerCase() === currentUser.id.toLowerCase()) ||
    (a.workerId && currentUser?.email && a.workerId.toLowerCase() === currentUser.email.toLowerCase())
  );
  const teamChats = messages.filter(m => m.recipientId === 'internal-team');

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

  const handleSendTeamChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamMessage.trim()) return;
    sendChatMessage('internal-team', teamMessage);
    setTeamMessage('');
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
                        <div className="text-[9px] text-slate-500 text-right mt-1">{n.timestamp}</div>
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
            className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 transition active:scale-95"
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
            <span>My Assigned Tasks</span>
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
            <span>Attendance & Time</span>
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
            <span>Project Calendars</span>
          </button>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-grow space-y-6">
          
          {/* TOP SUMMARY: PERFORMANCE METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-xl border border-slate-200/40 dark:border-slate-850">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Performance Score</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{currentUser?.performanceScore}%</span>
                <span className="text-[10px] text-emerald-500 font-semibold">Excellent</span>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-200/40 dark:border-slate-850">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Task Completion Rate</span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {workerTasks.length > 0
                    ? Math.round((workerTasks.filter(t => t.status === 'completed').length / workerTasks.length) * 100)
                    : 100}%
                </span>
                <span className="text-[9px] text-slate-500 font-semibold">
                  ({workerTasks.filter(t => t.status === 'completed').length}/{workerTasks.length})
                </span>
              </div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-200/40 dark:border-slate-850 col-span-2 sm:col-span-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Check In Attendance</span>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-350 mt-2">
                {isCheckedInToday ? (
                  <span className="text-emerald-500 flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Logged present today</span>
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Check-in required</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* TAB 1: ASSIGNED TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Assigned Tasks Queue</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Update stages and track hours logged on specific backlog items.</p>
                </div>

                {/* Simulated live timer bar */}
                {timerActive && (
                  <div className="flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl animate-pulse">
                    <span className="text-xs font-bold text-indigo-500 font-mono">{formatTimer(timeElapsed)}</span>
                    <button
                      onClick={handleStopTimer}
                      className="p-1 bg-rose-500 text-white rounded-lg"
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
                <div className="grid gap-4">
                  {workerTasks.map(task => (
                    <div key={task.id} className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{task.id}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${priorityColor(task.priority)}`}>
                            {task.priority} Priority
                          </span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold px-2 py-0.5 rounded">
                            {task.projectTitle}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-950 dark:text-white">{task.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">{task.description}</p>
                        <div className="text-[10px] text-slate-400 font-medium">Deadline Target: {task.deadline}</div>
                      </div>

                      {/* Status and Timer Adjusts */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-3.5 shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-850/50">
                        {/* Status Select */}
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Stage:</span>
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        {/* Clock-in Stopwatch simulation */}
                        {task.status !== 'completed' && (
                          <div className="flex items-center">
                            {activeTaskId === task.id && timerActive ? (
                              <button
                                onClick={handleStopTimer}
                                className="px-3.5 py-2 text-[10px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition flex items-center space-x-1.5 shadow"
                              >
                                <Square className="w-3 h-3 fill-current" />
                                <span>Stop Timer</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartTimer(task.id)}
                                disabled={timerActive}
                                className="px-3.5 py-2 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center space-x-1.5 shadow disabled:opacity-50"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Track Time</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Attendance & Time Logs</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Verify employee logins and mark daily status checkins.</p>
              </div>

              {/* Action checklist */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm text-left flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Attendance Terminal</h3>
                  <p className="text-xs text-slate-500 mt-1">Mark yourself present or absent for today ({getTodayDateString()}).</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleMarkPresent}
                    disabled={isCheckedInToday}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/35 rounded-xl transition shadow"
                  >
                    Check In (Present)
                  </button>
                  <button
                    onClick={handleMarkAbsent}
                    className="px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 glass hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition border border-slate-300/40 dark:border-slate-800"
                  >
                    Mark Absent
                  </button>
                </div>
              </div>

              {/* Logs */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm overflow-hidden text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Past Attendance Records</h3>
                {workerAttendance.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 italic">No logs tracked. Check In present above to insert first record.</div>
                ) : (
                  <div className="space-y-2">
                    {workerAttendance.map((rec, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 text-xs">
                        <span className="font-semibold text-slate-500">{rec.date}</span>
                        <div className="flex items-center space-x-3">
                          {rec.checkIn && (
                            <span className="text-[10px] text-slate-400 font-mono">In: {rec.checkIn} | Out: {rec.checkOut}</span>
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
          )}

          {/* TAB 3: UPLOAD DELIVERABLES */}
          {activeTab === 'deliverables' && (
            <div className="space-y-6 max-w-xl text-left">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Upload Project Deliverables</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Link source files or staging URL endpoints to assigned client projects.</p>
              </div>

              {delSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 animate-pulse text-center">
                  {delSuccess}
                </div>
              )}

              <form onSubmit={handleUploadDeliverable} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Assigned Project</label>
                  <select
                    required
                    value={delProjectId}
                    onChange={(e) => setDelProjectId(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  >
                    <option value="">Select active project pipeline</option>
                    {workerProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Deliverable File Name / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Staging Dashboard URL / iOS IPA file build"
                    value={delName}
                    onChange={(e) => setDelName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">File Link / Resource URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://staging.zentrio.ai/nexuscorp"
                    value={delUrl}
                    onChange={(e) => setDelUrl(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Deliverable File (Optional)</label>
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
                  className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow active:scale-95 cursor-pointer"
                >
                  Commit Deliverable Artifact
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: INTERNAL CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Internal Dev Chat</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Communicate in real-time with other designers and managers.</p>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 space-y-4">
                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-850 pb-2">
                  # internal-team channel
                </div>

                {/* Message display container */}
                <div className="h-72 overflow-y-auto space-y-3.5 p-3 bg-slate-100/40 dark:bg-slate-950/25 rounded-xl">
                  {teamChats.map(msg => {
                    const isSelf = msg.senderId === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl text-xs ${
                          isSelf
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none'
                        }`}>
                          <div className="text-[9px] font-bold uppercase tracking-wider mb-1 opacity-75">
                            {msg.senderName} ({msg.senderRole.toUpperCase()})
                          </div>
                          <div>{msg.content}</div>
                          <div className="text-[8px] text-right mt-1 opacity-60">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat input form */}
                <form onSubmit={handleSendTeamChat} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Write message to team..."
                    value={teamMessage}
                    onChange={(e) => setTeamMessage(e.target.value)}
                    className="flex-grow text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: CALENDARS */}
          {activeTab === 'deadlines' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Project Deadlines Calendar</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Coordinate deadlines for your active project assignments.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                {workerProjects.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 italic">No assigned projects under your account.</div>
                ) : (
                  <div className="space-y-3">
                    {workerProjects.map(p => (
                      <div key={p.id} className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/30 dark:border-slate-800/40 flex justify-between items-center">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-950 dark:text-white">{p.title}</h4>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase mt-0.5">{p.id} | {p.category}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-rose-500 block">Due: {p.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
