import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Eye, EyeOff, User as UserIcon, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { RightSideVideoPanel } from '../components/RightSideVideoPanel';

export const AdminLogin: React.FC = () => {
  const { login } = useApp();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !password) {
      setErrorMessage('Please fill in all security fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const result = await login(adminId, password, 'admin');
    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Login failed. Invalid email or password.');
    } else {
      setSuccessMessage('Login successful');
      setTimeout(() => {
        window.location.href = '/admin/';
      }, 500);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
      {/* Animated nodes for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-reverse"></div>
      
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <a
          href="/"
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold glass rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition text-slate-800 dark:text-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Zentrio Home</span>
        </a>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        <div className="w-full glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
        
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-transparent mx-auto">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Welcome Back Admin</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Enter secure administrator access keys below.</p>
        </div>

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 text-center">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Admin ID Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Administrator ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="admin_ID or admin@zentrio.ai"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Security Key</label>
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

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember_admin"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 bg-transparent"
            />
            <label htmlFor="remember_admin" className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Remember my session keys
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-65"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Establish Secure Session</span>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/40">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">SSL 256-Bit Encrypted Session</span>
        </div>

        </div>

        {/* Right Side Video Panel */}
        <RightSideVideoPanel />
      </div>
    </div>
  );
};
