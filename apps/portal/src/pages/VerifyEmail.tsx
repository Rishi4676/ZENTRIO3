import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, LogOut, RefreshCw, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const VerifyEmail: React.FC = () => {
  const { currentUser, resendVerification, logout } = useApp();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await resendVerification();
      setStatus({
        type: 'success',
        msg: '✉️ A new verification link has been sent to your email. Please check your inbox.'
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        msg: err.message || 'Failed to resend verification link. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden animate-fadeIn animate-duration-300">
      {/* Glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float-reverse"></div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 text-center space-y-6">
        {/* Header Icon */}
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Mail className="w-8 h-8 animate-pulse" />
        </div>

        {/* Heading */}
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Verify Your Email</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access restricted until email verification is complete.
          </p>
        </div>

        {/* Body Text */}
        <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed max-w-sm mx-auto">
          We sent a verification link to:<br/>
          <strong className="text-slate-800 dark:text-white text-base">{currentUser?.email || 'your email'}</strong>.<br/>
          Please click that link in your inbox to enable your workspace.
        </p>

        {/* Status Message */}
        {status && (
          <div className={`p-3 rounded-xl text-xs font-semibold border ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400'
          } animate-fadeIn`}>
            {status.msg}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Resend Verification Email</span>
          </button>

          <button
            onClick={async () => {
              setLoading(true);
              try {
                // Reloader checking status on demand
                window.location.reload();
              } catch (e) {}
            }}
            className="w-full py-3.5 font-bold text-slate-700 dark:text-slate-200 glass border border-slate-300/40 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 rounded-xl transition active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>I Have Verified My Email</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-3 font-bold text-rose-600 dark:text-rose-450 hover:bg-rose-500/10 border border-transparent rounded-xl transition active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
