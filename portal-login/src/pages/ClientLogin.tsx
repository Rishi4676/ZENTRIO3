import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Check } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

export const ClientLogin: React.FC = () => {
  const { login, setCurrentPage, sendPasswordReset } = useApp();
  const [forgotView, setForgotView] = useState(false);
  
  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const result = await login(email, password, 'client');
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setLoading(true);

    try {
      await sendPasswordReset(forgotEmail);
      setLoading(false);
      setForgotSuccess('A secure password reset link has been dispatched to your email address.');
    } catch (err: any) {
      setLoading(false);
      setForgotError(err.message || 'Failed to dispatch reset link.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden animate-fadeIn animate-duration-300">
      
      {/* Animated Background nodes */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float-reverse"></div>
      
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
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-transparent mx-auto">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            {forgotView ? 'Reset Session Password' : 'Client Hub Access'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            {forgotView ? 'Specify your workspace email to receive a secure link.' : 'Log into your active startup workspace.'}
          </p>
        </div>

        {forgotView ? (
          /* Forgot Password View */
          <div className="space-y-5">
            {forgotError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 text-center flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Workspace Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. client@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !!forgotSuccess}
                  className="w-full sm:flex-grow py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md active:scale-95 flex items-center justify-center disabled:opacity-65 cursor-pointer"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setForgotView(false); setForgotError(''); setForgotSuccess(''); }}
                  className="w-full sm:w-28 py-3.5 font-bold text-slate-700 dark:text-slate-250 glass border border-slate-300/40 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 rounded-xl transition active:scale-95 cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Normal Login View */
          <>
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 text-center flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Workspace Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. client@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Session Password</label>
                  <button
                    type="button"
                    onClick={() => { setForgotView(true); setForgotEmail(''); setForgotSuccess(''); setForgotError(''); }}
                    className="text-xs text-indigo-500 hover:underline cursor-pointer bg-transparent border-none p-0 outline-none font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>
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

              {/* Session settings */}
              <div className="flex items-center">
                <input
                  id="remember_client"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 bg-transparent"
                />
                <label htmlFor="remember_client" className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Remember my workspace credentials
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md active:scale-95 flex items-center justify-center disabled:opacity-65 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Access Workspace</span>
                )}
              </button>
            </form>

            {/* Create Account link */}
            <div className="mt-6 text-center text-xs font-semibold text-slate-500">
              First time working with us?{' '}
              <button onClick={() => setCurrentPage('client-register')} className="text-indigo-500 hover:underline cursor-pointer bg-transparent border-none p-0 outline-none">
                Register Workspace
              </button>
            </div>

            {/* Social Onboard */}
            <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-900 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Or Authenticate via</span>
              <div className="flex justify-center">
                <GoogleAuthButton mode="signin" />
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
