import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Briefcase,
  PlusCircle,
  Ticket,
  DollarSign,
  User as UserIcon,
  Bell,
  LogOut,
  Download,
  Send,
  CreditCard,
  Check,
  FileText,
  MessageSquare,
  Video,
  X
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { ZipWriter } from '../services/zipWriter';
import { ChatWorkspace } from '../components/ChatWorkspace';

export const ClientDashboard: React.FC = () => {
  const {
    currentUser,
    logout,
    projects,
    tickets,
    payments,
    addProject,
    addTicket,
    replyToTicket,
    addPayment,
    createPaymentOrder,
    notifications,
    clearNotifications,
    editClient,
    addNotification,
    messages,
    sendChatMessage,
    toggleMilestone
  } = useApp();

  const [activeTab, setActiveTab] = useState<'projects' | 'order' | 'support' | 'payments' | 'profile' | 'chat'>('projects');
  
  // Currency & Project Order Form States
  const [currency, setCurrency] = useState<'USD' | 'INR'>(() => {
    return currentUser?.country?.toLowerCase() === 'india' || currentUser?.state?.toLowerCase().includes('india') ? 'INR' : 'USD';
  });
  const [orderTitle, setOrderTitle] = useState('');
  const [orderCategory, setOrderCategory] = useState('Web Development');
  const [orderDesc, setOrderDesc] = useState('');
  const [orderTech, setOrderTech] = useState('');
  const [orderBudget, setOrderBudget] = useState('');
  const [orderDeadline, setOrderDeadline] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [orderFile, setOrderFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Team Meet State
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

  React.useEffect(() => {
    checkActiveMeeting();
    const interval = setInterval(checkActiveMeeting, 4000);
    return () => clearInterval(interval);
  }, []);

  // Support Ticket Form States
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Inquiry');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [chatReply, setChatReply] = useState('');

  // Payment states
  const [selectedPayProjectId, setSelectedPayProjectId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod] = useState<'razorpay'>('razorpay');
  const [paySuccess, setPaySuccess] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  // Profile states
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileCompany, setProfileCompany] = useState(currentUser?.companyName || '');
  const [profileMobile, setProfileMobile] = useState(currentUser?.mobile || '');
  const [profileCountry, setProfileCountry] = useState(currentUser?.country || '');
  const [profileState, setProfileState] = useState(currentUser?.state || '');
  const [profileCity, setProfileCity] = useState(currentUser?.city || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const categories = [
    'Web Development',
    'Full Stack Development',
    'Mobile App Development',
    'AI & Machine Learning',
    'UI/UX Design',
    'E-Commerce Development',
    'Software Development',
    'Cloud Solutions',
    'Digital Marketing',
    'IoT Projects',
    'Academic Projects',
    'Final Year Projects',
    'Power BI Dashboards',
    'Automation Solutions'
  ];

  const clientProjects = projects.filter(p => p.clientId === currentUser?.email || p.clientId === currentUser?.companyName || p.clientId === 'client@company.com');
  const clientTickets = tickets.filter(t => t.clientId === currentUser?.email || t.clientId === 'client@company.com');
  const clientPayments = payments.filter(p => p.clientId === currentUser?.email || p.clientId === 'client@company.com');

  const getCsrfToken = () => {
    if (typeof document === 'undefined') return '';
    return document.cookie.split('; ').find(row => row.startsWith('csrfToken='))?.split('=')[1] || '';
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderTitle || !orderBudget || !orderDeadline) return;

    let deliverables: any[] = [];
    setIsUploading(true);
    setUploadError('');

    if (orderFile) {
      try {
        const formData = new FormData();
        formData.append('file', orderFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'X-CSRF-Token': getCsrfToken()
          },
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          deliverables.push({
            id: `d-${Date.now()}`,
            name: data.fileName || orderFile.name,
            url: data.url,
            uploadedAt: new Date().toISOString().split('T')[0],
            uploadedBy: currentUser?.name || 'Client Owner'
          });
        } else {
          throw new Error(data.message || 'File upload failed');
        }
      } catch (err: any) {
        console.error('File upload error during submit:', err);
        setUploadError(`File upload failed: ${err.message}. Please try again.`);
        setIsUploading(false);
        return;
      }
    }

    const projectId = addProject({
      title: orderTitle,
      category: orderCategory,
      description: orderDesc,
      techRequired: orderTech.split(',').map(t => t.trim()).filter(Boolean),
      budget: parseFloat(orderBudget),
      deadline: orderDeadline,
      additionalNotes: orderNotes,
      deliverables
    });

    setIsUploading(false);

    if (projectId) {
      setOrderSuccess(`Project proposal "${orderTitle}" submitted successfully under ticket ID: ${projectId}.`);
      setOrderTitle('');
      setOrderDesc('');
      setOrderTech('');
      setOrderBudget('');
      setOrderDeadline('');
      setOrderNotes('');
      setOrderFile(null);
      setTimeout(() => setOrderSuccess(''), 5000);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) return;

    addTicket(ticketSubject, ticketCategory, ticketDesc, ticketPriority);
    setTicketSuccess('Support ticket created successfully. Our engineers will reply shortly.');
    setTicketSubject('');
    setTicketDesc('');
    setTimeout(() => setTicketSuccess(''), 5000);
  };

  const handleSendChatReply = (ticketId: string) => {
    if (!chatReply.trim()) return;
    replyToTicket(ticketId, chatReply);
    setChatReply('');
  };

  const downloadDeliverablesZip = (project: any) => {
    if (project.deliverables.length === 0) return;
    try {
      const zip = new ZipWriter();
      project.deliverables.forEach((del: any) => {
        zip.addFile(
          del.name,
          `Zentrio AI Handover Document\n============================\n\nProject Title: ${project.title}\nCategory: ${project.category}\nDeliverable Name: ${del.name}\nUploaded By: ${del.uploadedBy}\nUploaded At: ${del.uploadedAt}\nResource URL: ${del.url}\n\nThis zip hand-off package was generated dynamically on Zentrio AI portal client-side workspace.`
        );
      });
      const blob = zip.generateBlob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${project.title.toLowerCase().replace(/\s+/g, '_')}_deliverables.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      addNotification(`Successfully bundled and downloaded ${project.deliverables.length} files as ZIP handover package.`, 'success');
    } catch (e: any) {
      console.error(e);
      alert('Failed to generate ZIP hand-off bundle: ' + e.message);
    }
  };

  const triggerPaymentFlow = (projectId: string, budget: number) => {
    setSelectedPayProjectId(projectId);
    setPayAmount(budget.toString());
    setPayModalOpen(true);
    setPaySuccess(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCompletePayment = async () => {
    if (!selectedPayProjectId || !payAmount) return;
    setLoadingPayment(true);

    const project = projects.find(p => p.id === selectedPayProjectId);
    
    // Call create-order API to get a real Razorpay Order ID and Key ID from backend
    let keyId = 'rzp_test_ZentrioDummyKey';
    let realOrderId = '';
    try {
      const orderRes = await createPaymentOrder(parseFloat(payAmount));
      if (orderRes.success && orderRes.key_id) {
        keyId = orderRes.key_id;
        realOrderId = orderRes.orderId || '';
      }
    } catch (err) {
      console.warn('Backend order fetch failed, using fallback key:', err);
    }

    // Load script dynamically for performance efficiency
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      console.log('⚡ Running high-speed instant sandbox checkout simulation...');
      setTimeout(async () => {
        try {
          const fakePaymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
          await addPayment(selectedPayProjectId, parseFloat(payAmount), payMethod, fakePaymentId);
          setLoadingPayment(false);
          setPaySuccess(true);
          setTimeout(() => {
            setPayModalOpen(false);
            setPaySuccess(false);
          }, 2000);
        } catch (err) {
          console.error('Sandbox mock checkout failed:', err);
          setLoadingPayment(false);
        }
      }, 700);
      return;
    }

    const options = {
      key: keyId,
      // amount in paise — backend (Razorpay Orders API) already returns paise
      amount: Math.round(parseFloat(payAmount) * 100),
      currency: "INR",
      name: "Zentrio AI Corp.",
      description: `Payment for Project: ${project?.title || selectedPayProjectId}`,
      image: "/LOGOO.png",
      // Pass the real Razorpay order_id so checkout is fully authenticated
      order_id: realOrderId || undefined,
      prefill: {
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        contact: currentUser?.mobile || '9999999999'
      },
      notes: {
        projectId: selectedPayProjectId,
        clientEmail: currentUser?.email || ''
      },
      theme: {
        color: "#4f46e5"
      },
      handler: async function (response: any) {
        // Payment success: verify signature and update records
        try {
          await addPayment(
            selectedPayProjectId,
            parseFloat(payAmount),
            payMethod,
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature
          );
          setLoadingPayment(false);
          setPaySuccess(true);
          setTimeout(() => {
            setPayModalOpen(false);
            setPaySuccess(false);
          }, 2500);
        } catch (err) {
          console.error('Payment verification failed:', err);
          setLoadingPayment(false);
        }
      },
      modal: {
        ondismiss: function () {
          console.log('Razorpay checkout dismissed by user.');
          setLoadingPayment(false);
        },
        escape: true,
        animation: true
      }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      // Attach payment failure handler to catch API-level errors
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ Razorpay payment.failed event:', response.error);
        console.error('  Code:', response.error.code);
        console.error('  Description:', response.error.description);
        console.error('  Reason:', response.error.reason);
        setLoadingPayment(false);
      });
      rzp.open();
    } catch (e) {
      console.error('Razorpay SDK failed to open:', e);
      setLoadingPayment(false);
    }
  };

  const [loadingPayment, setLoadingPayment] = useState(false);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    editClient(currentUser.email, {
      name: profileName,
      companyName: profileCompany,
      mobile: profileMobile,
      country: profileCountry,
      state: profileState,
      city: profileCity
    });
    setProfileSuccess('Profile parameters updated securely in local DB.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const statusProgressColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-400';
      case 'review': return 'bg-amber-400 animate-pulse';
      case 'approved': return 'bg-blue-400';
      case 'assigned': return 'bg-indigo-400';
      case 'development': return 'bg-purple-500 animate-pulse';
      case 'testing': return 'bg-pink-500';
      case 'completed': return 'bg-emerald-500';
      case 'delivered': return 'bg-teal-500';
      default: return 'bg-indigo-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* HEADER BAR */}
      <header className="glass-nav sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center space-x-3 hover:opacity-85 transition">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-transparent">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-7 h-7 object-contain" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Zentrio Workspace</span>
        </a>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {/* Notifications dropdown trigger */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2.5 rounded-xl transition glass hover:bg-slate-100/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-300 relative"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 glass-card rounded-2xl shadow-xl p-4 z-40 border border-slate-200/50 dark:border-slate-850">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications ({notifications.length})</span>
                  <button onClick={clearNotifications} className="text-[10px] text-indigo-500 hover:underline font-semibold">Clear</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">No new updates.</div>
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
              <div className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">{currentUser?.companyName}</div>
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
            onClick={() => setActiveTab('projects')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'projects'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>My project orders</span>
          </button>

          <button
            onClick={() => setActiveTab('order')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'order'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Order New Project</span>
          </button>


          <button
            onClick={() => setActiveTab('payments')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>Payment History</span>
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
            <span>Project Chat Room</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'hover:bg-slate-200/50 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
            }`}
          >
            <UserIcon className="w-4 h-4 shrink-0" />
            <span>Profile Management</span>
          </button>

          <button
            onClick={() => setMeetModalOpen(true)}
            className={`w-auto md:w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center space-x-3.5 whitespace-nowrap shrink-0 transition ${
              activeMeeting
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30 animate-pulse'
                : 'hover:bg-emerald-500/10 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>{activeMeeting ? '🔴 Join Live Meet' : 'Team Meet'}</span>
          </button>
        </aside>

        {/* Tab Content Panel */}
        <main className="flex-grow">
          
          {/* TAB 1: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight">Active Workspaces</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Observe build statuses, deliverables, and engineering progress.</p>
                </div>
                <button
                  onClick={() => setActiveTab('order')}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition active:scale-95"
                >
                  New Order
                </button>
              </div>

              {clientProjects.length === 0 ? (
                <div className="glass-card text-center p-12 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                  <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No projects placed yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Initialize your first product requirements suite in seconds.</p>
                  <button
                    onClick={() => setActiveTab('order')}
                    className="mt-6 px-5 py-2.5 text-xs font-bold bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 rounded-xl transition"
                  >
                    Launch Proposal Form
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {clientProjects.map(project => (
                    <div key={project.id} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm relative overflow-hidden">
                      {/* Top Row */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{project.id}</span>
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded">
                              {project.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">{project.title}</h3>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest text-white px-2.5 py-1 rounded-full ${statusProgressColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">{project.description}</p>

                      {/* Tech stack */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.techRequired.map((tech, i) => (
                          <span key={i} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500">Pipeline Progress</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{project.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                        </div>
                      </div>

                      {/* Interactive Gantt Timeline Widget */}
                      <div className="mb-6 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 p-5 rounded-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Milestone Progress & Blueprint Timeline</h4>
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-2 py-0.5 rounded">Click milestones to toggle completion</span>
                        </div>
                        
                        {/* Horizontal connecting line timeline */}
                        <div className="relative flex items-center justify-between py-6 px-4 overflow-x-auto min-h-[90px] md:overflow-x-visible">
                          {/* The background line */}
                          <div className="absolute left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 top-[36px] z-0"></div>
                          
                          {project.milestones.map((m, idx) => {
                            const isCompleted = m.status === 'completed';
                            return (
                              <button
                                key={m.id}
                                onClick={() => toggleMilestone(project.id, m.id)}
                                className="relative flex flex-col items-center z-10 group cursor-pointer focus:outline-none shrink-0"
                                style={{ width: `${100 / project.milestones.length}%`, minWidth: '80px' }}
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                                  isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400 group-hover:border-indigo-500'
                                }`}>
                                  {isCompleted ? (
                                    <Check className="w-4 h-4" />
                                  ) : (
                                    <span className="text-[10px] font-bold">{idx + 1}</span>
                                  )}
                                </div>
                                <span className={`absolute top-10 text-[9px] font-bold text-center w-24 leading-tight truncate transition ${
                                  isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 group-hover:text-indigo-500'
                                }`}>
                                  {m.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Deliverables section */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-850/50">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Engineer</div>
                          <div className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-300">
                            {project.assignedWorkerName ? project.assignedWorkerName : 'Pending Assignment'}
                          </div>
                        </div>

                        {/* Deliverables Download */}
                        <div>
                          {project.deliverables.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {project.deliverables.map(del => (
                                <button
                                  key={del.id}
                                  onClick={() => {
                                    if (del.url && del.url !== '#') {
                                      window.open(del.url, '_blank');
                                    } else {
                                      alert(`Mock Download: Triggering retrieval for "${del.name}"`);
                                    }
                                  }}
                                  className="px-3.5 py-2 text-[10px] font-bold bg-slate-500/10 hover:bg-slate-500 hover:text-white text-slate-600 dark:text-slate-400 rounded-xl transition flex items-center space-x-1.5 border border-slate-500/20"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download: {del.name}</span>
                                </button>
                              ))}
                              
                              <button
                                onClick={() => downloadDeliverablesZip(project)}
                                className="px-3.5 py-2.5 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 rounded-xl transition flex items-center space-x-1.5 border border-emerald-500/20"
                              >
                                <Briefcase className="w-3.5 h-3.5 animate-pulse" />
                                <span>Download ZIP Handover ({project.deliverables.length} files)</span>
                              </button>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 font-semibold italic">Deliverables will appear here upon completion.</div>
                          )}
                        </div>

                        {/* Payment action */}
                        <div>
                          <button
                            onClick={() => triggerPaymentFlow(project.id, project.budget)}
                            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl shadow-md transition active:scale-95"
                          >
                            Fund Project / Pay Invoice
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORDER NEW PROJECT */}
          {activeTab === 'order' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Initiate Project Proposal</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Outline your technical requirements. We assign vetted engineers immediately.</p>
              </div>

              {orderSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 animate-pulse text-center">
                  {orderSuccess}
                </div>
              )}

              <form onSubmit={handleOrderSubmit} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Project Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LLM Customer Support Bot"
                      value={orderTitle}
                      onChange={(e) => setOrderTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Project Category</label>
                    <select
                      value={orderCategory}
                      onChange={(e) => setOrderCategory(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    >
                      {categories.map((cat, i) => (
                        <option key={i} value={cat} className="text-slate-850 dark:text-slate-100 bg-slate-50 dark:bg-slate-950">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Project Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide a detailed roadmap, user stories, and target architecture guidelines..."
                    value={orderDesc}
                    onChange={(e) => setOrderDesc(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  ></textarea>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Tech stack */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Technology Required (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, Node.js, Python, OpenAI, Docker"
                      value={orderTech}
                      onChange={(e) => setOrderTech(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>

                  {/* Budget & Currency */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                        Budget ({currency === 'INR' ? '₹ INR' : '$ USD'})
                      </label>
                      <input
                        type="number"
                        required
                        placeholder={currency === 'INR' ? "e.g. 100000" : "e.g. 15000"}
                        value={orderBudget}
                        onChange={(e) => setOrderBudget(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'USD' | 'INR')}
                        className="w-full text-xs px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none font-bold text-indigo-500"
                      >
                        <option value="INR">₹ INR (India)</option>
                        <option value="USD">$ USD (Global)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Deadline */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Deadline Target</label>
                    <input
                      type="date"
                      required
                      value={orderDeadline}
                      onChange={(e) => setOrderDeadline(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>

                  {/* File Upload enabled */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Requirement Document (Optional)</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setOrderFile(e.target.files[0]);
                          setUploadError('');
                        } else {
                          setOrderFile(null);
                        }
                      }}
                      className="w-full text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-600/10 file:text-indigo-600 dark:file:text-indigo-400 hover:file:bg-indigo-600/20 bg-transparent text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5"
                    />
                    <div className="mt-1 flex flex-col gap-0.5">
                      {isUploading && <span className="text-[10px] text-indigo-500 font-semibold animate-pulse">Uploading file to storage...</span>}
                      {uploadError && <span className="text-[10px] text-rose-500 font-semibold">{uploadError}</span>}
                      {orderFile && !isUploading && !uploadError && <span className="text-[10px] text-emerald-500 font-semibold">Selected file: {orderFile.name} ({(orderFile.size / 1024).toFixed(1)} KB)</span>}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Additional Notes / Security Constraints</label>
                  <input
                    type="text"
                    placeholder="e.g. Must run on containerized AWS ECS instances"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md active:scale-95 cursor-pointer"
                >
                  Submit Project Specifications
                </button>
              </form>
            </div>
              )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Financial Ledger</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Verify paid invoices and track active pipeline budgets.</p>
              </div>

              {/* Transactions Ledger */}
              <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm overflow-hidden">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Paid Invoices Ledger</h3>
                
                {clientPayments.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 italic">No transactions processed. Initialize order or click Pay Invoice.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-400 uppercase tracking-widest text-[9px]">
                          <th className="pb-3.5 font-bold">Invoice Ref</th>
                          <th className="pb-3.5 font-bold">Project Name</th>
                          <th className="pb-3.5 font-bold">Gateway</th>
                          <th className="pb-3.5 font-bold">Amount Paid</th>
                          <th className="pb-3.5 font-bold">Status</th>
                          <th className="pb-3.5 font-bold">Date issued</th>
                          <th className="pb-3.5 font-bold text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clientPayments.map(p => (
                          <tr key={p.id} className="border-b border-slate-100 dark:border-slate-900/60 last:border-b-0 hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-colors">
                            <td className="py-4 font-bold text-slate-900 dark:text-slate-200">{p.invoiceNumber}</td>
                            <td className="py-4 font-medium text-slate-500">{p.projectTitle}</td>
                            <td className="py-4 font-bold text-slate-400 uppercase">{p.paymentMethod}</td>
                            <td className="py-4 font-extrabold text-slate-950 dark:text-white">${p.amount.toLocaleString()}</td>
                            <td className="py-4">
                              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[9px]">
                                SUCCESS
                              </span>
                            </td>
                            <td className="py-4 text-slate-500 font-medium">{p.date}</td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => alert(`Generating PDF download stream for invoice ${p.invoiceNumber}`)}
                                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition"
                                title="Download PDF"
                              >
                                <FileText className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Configure Corporate Credentials</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Configure profile attributes verified across active workspaces.</p>
              </div>

              {profileSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 text-center animate-pulse">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleProfileSave} className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-850 shadow-sm space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Authorized Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Company Name</label>
                    <input
                      type="text"
                      required
                      value={profileCompany}
                      onChange={(e) => setProfileCompany(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mobile Contact</label>
                    <input
                      type="text"
                      required
                      value={profileMobile}
                      onChange={(e) => setProfileMobile(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Country</label>
                    <input
                      type="text"
                      required
                      value={profileCountry}
                      onChange={(e) => setProfileCountry(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">State</label>
                    <input
                      type="text"
                      required
                      value={profileState}
                      onChange={(e) => setProfileState(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md active:scale-95"
                >
                  Save Workspace Profile
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Project Live Chat</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Communicate directly with your assigned Zentrio developers and managers.</p>
              </div>
              <ChatWorkspace
                currentUser={currentUser}
                messages={messages}
                projects={clientProjects}
                sendChatMessage={sendChatMessage}
              />
            </div>
          )}

        </main>
      </div>

      {/* PAYMENT GATEWAY SIMULATOR MODAL */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-filter backdrop-blur-md">
          <div className="w-full max-w-md glass-card p-6 rounded-3xl border border-slate-200/50 dark:border-slate-850 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">Secure Gateway Integration</span>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            {paySuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-2 border-emerald-500/35 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Transaction Confirmed</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Invoice was emitted and logged under accounts.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/30 dark:border-slate-800 text-left space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Funding Parameters</div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500">Project Reference ID:</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedPayProjectId}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-slate-200/30 dark:border-slate-800/40 pt-2">
                    <span className="text-xs text-slate-500">Invoice Amount:</span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">${parseFloat(payAmount).toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Gateway Methods selector */}
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gateway Protocol</label>
                  <div className="p-4 text-xs font-bold rounded-xl border bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Razorpay Secure Checkout</span>
                  </div>
                </div>

                <button
                  onClick={handleCompletePayment}
                  disabled={loadingPayment}
                  className="w-full py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 active:scale-95 shadow-md flex items-center justify-center disabled:opacity-65"
                >
                  {loadingPayment ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>Authenticate Gateway Checkout</span>
                  )}
                </button>
              </>
            )}

          </div>
        </div>
      )}

      {/* CLIENT TEAM MEET MODAL */}
      {meetModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-7 border border-slate-200 dark:border-slate-800 shadow-2xl relative text-left bg-white dark:bg-slate-950">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Client & Team Meet</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Join live video call hosted by Zentrio engineering leads</p>
                </div>
              </div>
              <button onClick={() => setMeetModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 cursor-pointer transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeMeeting ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                <div className="text-xs font-extrabold text-emerald-500 uppercase tracking-wider">🔴 Live Engineering Call Active</div>
                <p className="text-xs text-slate-600 dark:text-slate-300">Call hosted by <strong>{activeMeeting.startedBy}</strong> ({activeMeeting.platform.toUpperCase()})</p>
                <a
                  href={activeMeeting.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
                >
                  🚀 Join Project Video Call
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 text-center space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No Active Meeting Started</div>
                <p className="text-[10px] text-slate-400">Engineering leads host video consultations for client project reviews. When a meeting starts, the direct join button will automatically activate here.</p>
              </div>
            )}

            <p className="text-[10px] text-slate-400 text-center mt-5">Meetings are scheduled and hosted by Zentrio AI Project Team.</p>
          </div>
        </div>
      )}

    </div>
  );
};
