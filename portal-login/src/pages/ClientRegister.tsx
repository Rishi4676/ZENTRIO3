import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Globe, ArrowLeft, Check } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { GoogleAuthButton } from '../components/GoogleAuthButton';

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 
  'Germany', 'France', 'United Arab Emirates', 'Singapore', 'Japan', 
  'Saudi Arabia', 'Qatar', 'Netherlands', 'Switzerland', 'Brazil', 
  'South Africa', 'New Zealand', 'Malaysia', 'Russia', 'Spain'
];

export const ClientRegister: React.FC = () => {
  const { registerClient, setCurrentPage, routerParams, setRouterParams } = useApp();
  const isFromGoogle = routerParams?.fromGoogle === true;

  const [formData, setFormData] = useState({
    name: isFromGoogle ? (routerParams?.googleName || '') : '',
    email: isFromGoogle ? (routerParams?.googleEmail || '') : '',
    country: 'India',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // OTP Email States
  const [emailVerified, setEmailVerified] = useState(isFromGoogle);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpStatus, setEmailOtpStatus] = useState<{ type: 'info' | 'success' | 'error'; msg: string } | null>(null);

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Very Weak', color: 'bg-rose-500' });

  useEffect(() => {
    return () => {
      if (isFromGoogle) {
        setRouterParams({});
      }
    };
  }, [isFromGoogle, setRouterParams]);



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
    setEmailOtpStatus(null);
    setLoading(true);
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
      setLoading(false);
      if (response.ok && data.success) {
        setEmailOtpSent(true);
        setEmailOtpStatus({
          type: 'info',
          msg: `✉️ Verification code sent to ${formData.email}. Check your inbox.`
        });
      } else {
        setEmailOtpStatus({ type: 'error', msg: data.message || 'Failed to send verification code.' });
      }
    } catch (err) {
      setLoading(false);
      alert('Connection error. Server may be offline.');
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp) {
      alert('Please enter the 6-digit verification code.');
      return;
    }
    setEmailOtpStatus(null);
    setLoading(true);
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
      setLoading(false);
      if (response.ok && data.success) {
        setEmailVerified(true);
        setEmailOtpSent(false);
        setEmailOtpStatus({ type: 'success', msg: '✅ Email verified successfully!' });
      } else {
        setEmailOtpStatus({ type: 'error', msg: data.message || 'Invalid verification code.' });
      }
    } catch (err) {
      setLoading(false);
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
      clientId: formData.email, 
      companyName: formData.name + ' Workspace', 
      email: formData.email,
      mobile: 'N/A',
      state: formData.country,
      country: formData.country,
      password: isFromGoogle ? '' : formData.password
    });

    setLoading(false);
    if (result.success) {
      setVerificationSent(true);
    } else {
      setErrorMessage(result.error || 'Failed to complete registration.');
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-y-auto animate-fadeIn animate-duration-300">
        <div className="absolute top-[10%] left-[-5%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="w-full max-w-lg glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Verify Your Email Address</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            We have dispatched a secure verification link to your email address: <br/>
            <strong className="text-indigo-600 dark:text-indigo-400 text-base">{formData.email}</strong>.
          </p>
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-850">
            Please check your inbox (and spam folder) and click the link in that email to activate your workspace. After verification, you can sign in to your dashboard.
          </div>
          <button
            onClick={() => setCurrentPage('client-login')}
            className="w-full py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition duration-200 shadow-md active:scale-95 cursor-pointer text-center"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-y-auto animate-fadeIn animate-duration-300">
      {/* Animated premium background glows */}
      <div className="absolute top-[10%] left-[-5%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-[10%] right-[-5%] w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float-reverse"></div>
      
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <a
          href="/"
          className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold glass rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition text-slate-800 dark:text-slate-100"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Back to Zentrio Home</span>
        </a>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg glass-card rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative z-10 my-8">
        
        {/* Title */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-transparent mx-auto">
            <img src="/LOGOO.png" alt="Zentrio Logo" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Create Client Workspace</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Establish a developer workspace and connect with the Zentrio AI engineering team.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. John Smith"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Email Address</label>
            <div className="relative flex space-x-2">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={formData.email}
                  disabled={emailVerified}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-60"
                />
              </div>
              {isFromGoogle || emailVerified ? (
                <span className="px-4 py-3 text-xs font-bold text-emerald-500 bg-emerald-500/10 rounded-xl flex items-center space-x-1.5 border border-emerald-500/20">
                  <Check className="w-4 h-4" />
                  <span>Verified</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendEmailOtp}
                  disabled={loading}
                  className="px-4 py-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {emailOtpSent ? 'Resend' : 'Verify Email'}
                </button>
              )}
            </div>

            {emailOtpSent && !emailVerified && (
              <div className="mt-3 flex space-x-2 animate-fadeIn">
                <input
                  type="text"
                  required
                  placeholder="Enter 6-Digit OTP Code"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="flex-grow text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={handleVerifyEmailOtp}
                  className="px-4 py-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer active:scale-95"
                >
                  Verify Code
                </button>
              </div>
            )}

            {emailOtpStatus && (
              <div className={`mt-2 px-3 py-2.5 rounded-xl text-xs font-semibold border ${
                emailOtpStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-450'
                  : emailOtpStatus.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-300'
              }`}>
                {emailOtpStatus.msg}
              </div>
            )}
          </div>

          {/* Country Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Country</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Globe className="w-4 h-4" />
              </span>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer appearance-none"
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country} className="bg-slate-50 dark:bg-slate-900 text-slate-850 dark:text-slate-100">
                    {country}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {!isFromGoogle && (
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650"
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
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
              disabled={loading || (!isFromGoogle && !emailVerified)}
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



      </div>
    </div>
  );
};
