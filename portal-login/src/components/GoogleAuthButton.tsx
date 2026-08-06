import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { GOOGLE_CLIENT_ID } from '../config/google';

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ mode = 'signin' }) => {
  const { loginWithGoogle } = useApp();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<((credential: string) => void) | null>(null);
  const [useRealGoogle, setUseRealGoogle] = useState(false);
  const [mockModalOpen, setMockModalOpen] = useState(false);
  const [mockName, setMockName] = useState('');
  const [mockEmail, setMockEmail] = useState('');
  const [mockLoading, setMockLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const hasValidClientId =
    GOOGLE_CLIENT_ID &&
    GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' &&
    GOOGLE_CLIENT_ID.length > 20;

  callbackRef.current = (credential: string) => {
    try {
      const parts = credential.split('.');
      if (parts.length !== 3) throw new Error('Invalid credential format');
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.email) throw new Error('No email in token');
      loginWithGoogle({
        name: payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(' ') || 'Google User',
        email: payload.email,
        picture: payload.picture || ''
      });
    } catch (err) {
      console.error('Google credential decode failed:', err);
      setAuthError('Failed to verify Google credentials. Please try again.');
      setTimeout(() => setAuthError(''), 4000);
    }
  };

  useEffect(() => {
    if (!hasValidClientId) return;

    const scriptId = 'google-identity-services';
    if (document.getElementById(scriptId)) {
      initGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.id = scriptId;
    script.async = true;
    script.defer = true;
    script.onload = () => initGoogleButton();
    script.onerror = () => {
      console.error('Failed to load Google Identity Services script');
      setUseRealGoogle(false);
    };
    document.head.appendChild(script);

    function initGoogleButton() {
      const google = (window as any).google;
      if (!google?.accounts?.id) {
        setUseRealGoogle(false);
        return;
      }

      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            if (callbackRef.current) callbackRef.current(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'rectangular'
          });
          setUseRealGoogle(true);
        }
      } catch (err) {
        console.error('Google Identity Services init failed:', err);
        setUseRealGoogle(false);
      }
    }
  }, [hasValidClientId, mode]);

    const handleMockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockName.trim() || !mockEmail.trim()) return;
    setMockLoading(true);
    const res = await loginWithGoogle({
      name: mockName,
      email: mockEmail,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mockName)}`
    });
    setMockLoading(false);
    setMockModalOpen(false);
    if (res.success) {
      setTimeout(() => {
        window.location.href = '/admin/';
      }, 500);
    }
  };

  if (hasValidClientId && useRealGoogle) {
    return (
      <>
        {authError && (
          <div className="mb-2 p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-semibold border border-rose-500/20 text-center max-w-xs mx-auto">
            {authError}
          </div>
        )}
        <div ref={googleBtnRef} className="flex justify-center w-full max-w-xs mx-auto" />
      </>
    );
  }

  return (
    <>
      {authError && (
        <div className="mb-2 p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-semibold border border-rose-500/20 text-center max-w-xs mx-auto">
          {authError}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (!hasValidClientId) {
            setMockModalOpen(true);
          }
        }}
        className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
        </span>
      </button>

      {!hasValidClientId && (
        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
          Demo mode - configure <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-500">.env</code> for real Google OAuth
        </p>
      )}

      {mockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl space-y-5">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-md flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">Google Authentication</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your Google account details to continue
              </p>
            </div>

            <form onSubmit={handleMockSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Google Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@gmail.com"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/45 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="flex space-x-3 pt-1">
                <button
                  type="button"
                  onClick={() => setMockModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mockLoading}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md disabled:opacity-65 flex items-center justify-center"
                >
                  {mockLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Continue with Google'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
