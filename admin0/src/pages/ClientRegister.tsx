import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Mail, Phone, Lock, User as UserIcon, Building, Check, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

export const ClientRegister: React.FC = () => {
  const { registerClient, setCurrentPage, routerParams, setRouterParams } = useApp();
  const isFromGoogle = routerParams?.fromGoogle === true;
  const [formData, setFormData] = useState({
    name: isFromGoogle ? (routerParams?.googleName || '') : '',
    clientId: '',
    email: isFromGoogle ? (routerParams?.googleEmail || '') : '',
    mobile: '',
    state: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailBypassCode, setEmailBypassCode] = useState('');
  const [emailOtpStatus, setEmailOtpStatus] = useState<{ type: 'info' | 'success' | 'error'; msg: string } | null>(null);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Very Weak', color: 'bg-rose-500' });

  useEffect(() => {
    return () => {
      if (isFromGoogle) {
        setRouterParams({});
      }
    };
  }, [isFromGoogle, setRouterParams]);

  useEffect(() => {
    if (isFromGoogle && routerParams?.googleEmail) {
      setEmailVerified(true);
      setEmailOtpSent(false);
    }
  }, [isFromGoogle, routerParams?.googleEmail]);

  useEffect(() => {
    if (isFromGoogle && routerParams) {
      setFormData(prev => ({
        ...prev,
        name: routerParams.googleName || prev.name,
        email: routerParams.googleEmail || prev.email
      }));
    }
  }, [isFromGoogle, routerParams]);

  useEffect(() => {
    const pass = formData.password;
    if (!pass) {
      setPasswordStrength({ score: 0, text: 'Too Short', color: 'bg-slate-300' });
      return;
    }
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    let text = 'Weak';
    let color = 'bg-rose-500';
    if (score >= 4) {
      text = 'Strong ✔';
      color = 'bg-emerald-500';
    } else if (score >= 2) {
      text = 'Medium ⚠';
      color = 'bg-amber-500';
    }

    setPasswordStrength({ score, text, color });
  }, [formData.password]);

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('csrfToken='))?.split('=')[1] || '';
  };

  const handleSendEmailOtp = async () => {
    if (!formData.email || !formData.name) {
      alert('Please fill out your Name and Email address first.');
      return;
    }
    try {
      const response = await fetch('/api/auth/register-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEmailOtpSent(true);
        if (data.otp) {
          // Dev mode: backend returned the OTP code — auto-fill and show it
          setEmailBypassCode(data.otp);
          setEmailOtp(data.otp);
          setEmailOtpStatus({
            type: 'info',
            msg: `🔑 Dev mode: OTP auto-filled → ${data.otp}. Resend free tier sent email to admin inbox instead of ${formData.email}.`
          });
        } else {
          setEmailOtpStatus({
            type: 'info',
            msg: `✉️ Verification code sent to ${formData.email}. Check your inbox (or try code '123456' as bypass).`
          });
        }
      } else {
        setEmailOtpStatus({ type: 'error', msg: data.message || 'Failed to send verification code.' });
      }
    } catch (err) {
      alert('Connection error. Server may be offline.');
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp) {
      alert('Please enter the 6-digit verification code.');
      return;
    }
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken()
        },
        body: JSON.stringify({
          email: formData.email,
          otp: emailOtp
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEmailVerified(true);
        setEmailOtpSent(false);
        setEmailOtpStatus({ type: 'success', msg: '✅ Email verified successfully!' });
      } else {
        setEmailOtpStatus({ type: 'error', msg: data.message || 'Invalid verification code.' });
      }
    } catch (err) {
      alert('Connection error verifying code.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isFromGoogle && formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('You must accept the terms & conditions.');
      return;
    }

    if (!emailVerified) {
      setErrorMessage('Please verify your email address via OTP first.');
      return;
    }

    setLoading(true);

    const result = await registerClient({
      name: formData.name,
      clientId: formData.clientId,
      companyName: formData.clientId, // pass in both companyName and clientId
      email: formData.email,
      mobile: formData.mobile,
      state: formData.state,
      password: isFromGoogle ? '' : formData.password
    });

    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to complete registration.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-y-auto animate-fadeIn">
      
      {/* Animated nodes */}
      <div className="absolute top-[10%] left-[-5%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-reverse"></div>
      
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <a
          href="/"
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold glass rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition text-slate-800 dark:text-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" style={{ display: 'inline-block' }} />
          <span>Back to Zentrio Home</span>
        </a>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 my-8">
        
        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent mx-auto">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Create Client Workspace</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isFromGoogle
              ? 'Complete your profile to finish Google sign-up.'
              : 'Submit your client parameters to register your Zentrio account.'}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Client ID */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Client ID</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Building className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. CLI-8940"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Email Address & Verification */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
              <div className="relative flex space-x-2">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={formData.email}
                    disabled={emailVerified}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
                  />
                </div>
                {!emailVerified ? (
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    className="px-3 py-2 text-[10px] font-bold bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 rounded-xl transition cursor-pointer"
                  >
                    {emailOtpSent ? 'Resend' : 'Verify'}
                  </button>
                ) : (
                  <span className="px-3 py-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 rounded-xl flex items-center space-x-1 border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              {emailOtpSent && (
                <div className="mt-2 flex space-x-2 animate-pulse">
                  <input
                    type="text"
                    placeholder={emailBypassCode ? `Enter Code (Bypass: ${emailBypassCode})` : "Enter Code (or 123456)"}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    className="flex-grow text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    className="px-3 py-1.5 text-[10px] bg-indigo-600 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              )}
              {/* Email OTP status banner */}
              {emailOtpStatus && (
                <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                  emailOtpStatus.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                }`}>
                  {emailOtpStatus.msg}
                </div>
              )}
            </div>

            {/* Mobile Number (Without verification) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 0199"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* State (Country & City removed) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">State</label>
            <input
              type="text"
              required
              placeholder="e.g. California"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {!isFromGoogle && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Strength Indicator */}
                <div className="mt-2.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                    <span>Strength: {passwordStrength.text}</span>
                    <span>{passwordStrength.score} / 5</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden flex">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-grow h-full mr-0.5 last:mr-0 transition-colors ${
                          i < passwordStrength.score ? passwordStrength.color : 'bg-transparent'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
   
              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Checkbox */}
          <div className="flex items-start py-2">
            <input
              id="agree_terms"
              type="checkbox"
              required
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
              className="w-4 h-4 mt-0.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 bg-transparent cursor-pointer"
            />
            <label htmlFor="agree_terms" className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400 leading-normal">
              I agree to the{' '}
              <a href="#" className="text-indigo-500 hover:underline">
                Terms of Service
              </a>{' '}
              and confirm my client parameters are valid.
            </label>
          </div>

          {/* Submit and Login Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-grow py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md active:scale-95 flex items-center justify-center disabled:opacity-65 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>Register Account</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage('client-login')}
              className="w-full sm:w-44 py-3.5 font-bold text-slate-700 dark:text-slate-200 glass border border-slate-300/40 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 rounded-xl transition active:scale-95 cursor-pointer"
            >
              Sign In Instead
            </button>
          </div>
        </form>

        {/* Social Google Login */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-900 text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Or onboarding with</span>
          <div className="flex justify-center">
            <GoogleAuthButton mode="signup" />
          </div>
        </div>

      </div>
    </div>
  );
};
