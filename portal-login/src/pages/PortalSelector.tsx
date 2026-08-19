import React from 'react';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { User, Briefcase, Shield, UserPlus, ArrowLeft } from 'lucide-react';

export const PortalSelector: React.FC = () => {
  const { setCurrentPage } = useApp();

  const portals = [
    {
      id: 'client-login',
      title: 'Client Portal',
      desc: 'Access your active startup projects, track milestones, download deliverables, and manage invoices.',
      icon: <User className="w-6 h-6 text-indigo-500" />,
      buttonText: 'Access Client Hub',
    },
    {
      id: 'worker-login',
      title: 'Worker Portal',
      desc: 'Check your assigned engineering tasks, submit project updates, and log daily workspace attendance.',
      icon: <Briefcase className="w-6 h-6 text-emerald-500" />,
      buttonText: 'Open Worker Terminal',
    },
    {
      id: 'admin-login',
      title: 'Administrator Access',
      desc: 'Manage global projects, assign engineering tasks, approve client budgets, and track payments.',
      icon: <Shield className="w-6 h-6 text-purple-500" />,
      buttonText: 'Enter Admin Central',
    },
    {
      id: 'client-register',
      title: 'Register New Client',
      desc: 'Submit your startup parameters and establish a new developer workspace account with Zentrio AI.',
      icon: <UserPlus className="w-6 h-6 text-cyan-500" />,
      buttonText: 'Establish Workspace',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-20 pointer-events-none"
      >
        <source src="/background-video.mp4" type="video/mp4" />
        <source src="/videos/background-video.mp4" type="video/mp4" />
        <source src="/assets/videos/background-video.mp4" type="video/mp4" />
      </video>

      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none animate-float-reverse"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <a href="/" className="flex items-center space-x-3 hover:opacity-85 transition">
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-500">Back to main site</span>
        </a>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 flex flex-col items-center justify-center flex-grow z-10">
        {/* Brand Logo and Title */}
        <div className="text-center mb-12 max-w-xl">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-transparent mx-auto mb-4 shadow-lg border border-slate-200/20 dark:border-slate-800/40">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-indigo-200 bg-clip-text text-transparent">
            Zentrio Portal Hub
          </h1>
          <p className="mt-3 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Select the appropriate workspace portal node to establish your secure session and access the Zentrio AI management suite.
          </p>
        </div>

        {/* Portal Grid */}
        <div className="grid md:grid-cols-2 gap-6 w-full">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center mb-4 border border-slate-200/30 dark:border-slate-800/30">
                  {portal.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {portal.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {portal.desc}
                </p>
              </div>
              <button
                onClick={() => setCurrentPage(portal.id)}
                className="w-full py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md hover:shadow-indigo-500/10 active:scale-95 cursor-pointer text-center"
              >
                {portal.buttonText}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-[10px] text-slate-500 font-semibold z-10 border-t border-slate-200/20 dark:border-slate-900/20">
        <div>© {new Date().getFullYear()} Zentrio AI. All rights reserved.</div>
      </footer>
    </div>
  );
};
