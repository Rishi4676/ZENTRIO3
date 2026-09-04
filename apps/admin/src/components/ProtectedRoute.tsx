import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/AuthContext';
import { ShieldAlert, Mail, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'worker' | 'client'>;
  fallbackRedirect: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackRedirect
}) => {
  const { user, userProfile, loading, logout, resendVerification, reloadUser } = useFirebase();
  const { currentUser, loading: appLoading } = useApp();
  const [resending, setResending] = useState(false);
  const [sentMessage, setSentMessage] = useState('');
  const [checking, setChecking] = useState(false);

  // Auto check verify status on mount
  useEffect(() => {
    let interval: any;
    if (user && !user.emailVerified) {
      interval = setInterval(() => {
        reloadUser().catch(() => {});
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  // Loading state spinner matching premium style
  if (loading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-955 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wider text-slate-400">Loading secure session...</p>
        </div>
      </div>
    );
  }

  const hasFirebaseUser = user && userProfile;
  const hasAppUser = currentUser;

  // Not logged in -> redirect
  if (!hasFirebaseUser && !hasAppUser) {
    // Run the redirection callback
    setTimeout(() => fallbackRedirect(), 0);
    return null;
  }

  const activeRole = userProfile?.role || currentUser?.role;

  // Role verification (if applicable)
  if (allowedRoles && activeRole && !allowedRoles.includes(activeRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-955 p-6">
        <div className="max-w-md w-full glass p-8 rounded-3xl border border-rose-500/20 text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
          <p className="text-xs text-slate-400 mt-2">You do not have the required administration credentials to view this area.</p>
          <button
            onClick={logout}
            className="mt-6 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-xs font-semibold rounded-xl text-white transition cursor-pointer"
          >
            Switch Accounts
          </button>
        </div>
      </div>
    );
  }

  // Email verification required for clients
  if (activeRole === 'client' && hasFirebaseUser && !user.emailVerified) {
    const handleResend = async () => {
      setResending(true);
      setSentMessage('');
      try {
        await resendVerification();
        setSentMessage('A new verification email has been sent to your inbox.');
      } catch (err: any) {
        setSentMessage(err.message || 'Failed to resend. Please try again later.');
      } finally {
        setResending(false);
      }
    };

    const handleManualCheck = async () => {
      setChecking(true);
      try {
        await reloadUser();
      } finally {
        setChecking(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6 relative overflow-hidden">
        {/* Glowing background highlights */}
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-reverse"></div>

        <div className="max-w-md w-full glass-card border border-slate-800 p-8 rounded-3xl text-center shadow-2xl relative z-10">
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-500/20">
            <Mail className="w-6 h-6 animate-pulse" />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">Verify Your Email</h2>
          <p className="text-slate-400 text-xs mt-3 leading-relaxed">
            We have sent a verification link to <strong className="text-indigo-400">{user.email}</strong>. 
            Please check your inbox and verify your email to unlock your workspace dashboard.
          </p>

          {sentMessage && (
            <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              {sentMessage}
            </div>
          )}

          <div className="mt-6 flex flex-col space-y-3">
            <button
              onClick={handleManualCheck}
              disabled={checking}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {checking ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>I Have Verified (Check Status)</span>
            </button>

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3.5 glass hover:bg-slate-900/60 text-xs font-bold text-slate-200 rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {resending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Resend Verification Email</span>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Logged in as {userProfile.username}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-rose-500 hover:underline cursor-pointer font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // All checks pass -> render children
  return <>{children}</>;
};
