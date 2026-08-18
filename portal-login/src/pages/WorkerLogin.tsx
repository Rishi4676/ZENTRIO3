import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Eye, EyeOff, User as UserIcon, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const WorkerLogin: React.FC = () => {
  const { login, users } = useApp();
  const [workerIdentifier, setWorkerIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Match worker dynamically
  const matchedWorker = users.find(
    u => u.role === 'worker' && (
      u.id.toLowerCase() === workerIdentifier.trim().toLowerCase() ||
      u.email.toLowerCase() === workerIdentifier.trim().toLowerCase()
    )
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const result = await login(workerIdentifier, password, 'worker');
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
      
      {/* Background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float-reverse"></div>
      
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

      <div className="w-full max-w-md glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10">
        
        {/* Dynamic avatar based on typed ID */}
        <div className="text-center mb-8">
          {matchedWorker ? (
            <div className="relative inline-block">
              <img
                src={matchedWorker.avatar}
                alt={matchedWorker.name}
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-indigo-500 shadow-md animate-pulse"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-500 border border-indigo-500/20">
              <UserIcon className="w-8 h-8" />
            </div>
          )}
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            {matchedWorker ? matchedWorker.name : 'Worker Terminal'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {matchedWorker ? `Role: ${matchedWorker.role.toUpperCase()}` : 'Enter your registered Worker ID or email address.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 text-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Worker ID / Email */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Worker ID / Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. WORKER001 or syed.r@zentrio.ai"
                value={workerIdentifier}
                onChange={(e) => setWorkerIdentifier(e.target.value)}
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Access Password</label>
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
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-xl transition duration-200 shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-65"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Enter Portal Terminal</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 font-medium">
          Not a registered employee?{' '}
          <a href="/contact" className="text-indigo-500 hover:underline">
            Contact HR Department
          </a>
        </div>
      </div>
    </div>
  );
};
