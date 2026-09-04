import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Eye, EyeOff, ArrowLeft, Check, Shield } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const ResetPassword: React.FC = () => {
  const { routerParams } = useApp();
  const token = routerParams?.token || '';
  const email = routerParams?.email || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('csrfToken='))?.split('=')[1] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({
          email,
          token,
          password
        })
      });
      const data = await response.json();
      setLoading(false);
      if (data.success) {
        setSuccessMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          window.location.replace('/portal/client-login');
        }, 3000);
      } else {
        setErrorMessage(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage('Server connection error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Animated nodes for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-reverse"></div>
      
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <button
          onClick={() => window.location.replace('/portal/client-login')}
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold glass rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition text-slate-800 dark:text-slate-100 cursor-pointer bg-transparent"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Login</span>
        </button>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10">
        
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-transparent mx-auto">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Specify a secure new password for: {email}</p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 text-center flex items-center justify-center space-x-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !!successMessage}
            className="w-full py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-65"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/40">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">SSL 256-Bit Encrypted Session</span>
        </div>

      </div>
    </div>
  );
};
