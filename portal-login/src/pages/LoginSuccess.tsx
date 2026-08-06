import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, LogOut, ArrowLeft, Shield, User, Briefcase } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginSuccess: React.FC = () => {
  const { currentUser, logout, setCurrentPage } = useApp();

  const handleLogout = async () => {
    await logout();
    setCurrentPage('portal-selector');
  };

  const getRoleIcon = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'admin':
        return <Shield className="w-8 h-8 text-purple-500 animate-pulse" />;
      case 'worker':
        return <Briefcase className="w-8 h-8 text-emerald-500 animate-pulse" />;
      default:
        return <User className="w-8 h-8 text-indigo-500 animate-pulse" />;
    }
  };

  const getRoleBadgeColor = () => {
    if (!currentUser) return '';
    switch (currentUser.role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
      case 'worker':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between z-10">
        <button
          onClick={() => setCurrentPage('portal-selector')}
          className="flex items-center space-x-3 hover:opacity-85 transition bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-500">Back to Selector</span>
        </button>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="w-full max-w-xl mx-auto px-6 py-12 flex flex-col items-center justify-center flex-grow z-10">
        <div className="glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl w-full text-center space-y-6">
          
          {/* Success Checkmark */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md animate-ping"></div>
              <CheckCircle className="w-16 h-16 text-emerald-500 relative z-10" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">
              Authentication Successful
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your secure session has been established successfully.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-850 flex items-center justify-center border border-slate-300/30 dark:border-slate-800/30">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt="Avatar" className="w-12 h-12 rounded-lg" />
                ) : (
                  getRoleIcon()
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser?.name || 'Anonymous User'}
                </h3>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 ${getRoleBadgeColor()}`}>
                  {currentUser?.role || 'Guest'} Portal
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser?.email || 'N/A'}</span>
              </div>
              {currentUser?.companyName && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Company Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.companyName}</span>
                </div>
              )}
              {currentUser?.mobile && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Mobile Number:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.mobile}</span>
                </div>
              )}
              {currentUser?.state && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.state}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition duration-200 shadow-md hover:shadow-rose-500/10 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminate Session (Log Out)</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-[10px] text-slate-500 font-semibold z-10 border-t border-slate-200/20 dark:border-slate-900/20">
        <div>© {new Date().getFullYear()} Zentrio AI. All rights reserved.</div>
      </footer>
    </div>
  );
};
