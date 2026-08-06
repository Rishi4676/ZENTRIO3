import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Lock, Mail, Phone, ArrowLeft, Key } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

export const ClientLogin: React.FC = () => {
  const { login, setCurrentPage } = useApp();
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  
  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Mobile states
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (!mobile) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }
    setOtpSent(true);
    setErrorMessage('');
    alert('Mock Action: OTP "4491" transmitted to ' + mobile);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (loginMethod === 'email') {
      const result = await login(email, password, 'client');
      setLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'Access denied. Account not found or password incorrect.');
      }
    } else {
      // Mobile OTP authentication simulation
      if (otpCode === '4491' && mobile) {
        // If valid, log in default client for testing
        const result = await login('client@company.com', 'Client@2026#', 'client');
        setLoading(false);
        if (!result.success) {
          setErrorMessage('Could not establish workspace session.');
        }
      } else {
        setLoading(false);
        setErrorMessage('Invalid verification OTP code. Enter "4491".');
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
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
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Client Hub Access</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">Log into your active startup workspace.</p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center">
            {errorMessage}
          </div>
        )}

        {/* Tab switchers */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 mb-6 border border-slate-200/40 dark:border-slate-850">
          <button
            onClick={() => { setLoginMethod('email'); setErrorMessage(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              loginMethod === 'email'
                ? 'bg-white dark:bg-slate-950 shadow text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Email & Pass
          </button>
          <button
            onClick={() => { setLoginMethod('mobile'); setErrorMessage(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              loginMethod === 'mobile'
                ? 'bg-white dark:bg-slate-950 shadow text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Mobile & OTP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {loginMethod === 'email' ? (
            <>
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
            </>
          ) : (
            <>
              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Mobile</label>
                <div className="relative flex space-x-2">
                  <div className="relative flex-grow">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 0199"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3.5 py-3 text-xs font-bold bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 rounded-xl transition"
                  >
                    {otpSent ? 'Resend' : 'Send Code'}
                  </button>
                </div>
              </div>

              {/* OTP Field */}
              {otpSent && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">4-Digit Security OTP (4491)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Enter 4-Digit Code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
              )}
            </>
          )}

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
          <button onClick={() => setCurrentPage('client-register')} className="text-indigo-500 hover:underline">
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

      </div>
    </div>
  );
};
