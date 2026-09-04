import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { auth, googleProvider } from '../config/firebase';

interface GoogleAuthButtonProps {
  mode?: 'signin' | 'signup';
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ mode = 'signin' }) => {
  const { loginWithGoogle } = useApp();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setLoading(true);

    try {
      if (!auth || !googleProvider) {
        throw new Error('Firebase Authentication is not initialized. Please verify VITE_FIREBASE_* environment variables in .env');
      }

      const { signInWithPopup } = await import('firebase/auth');
      const userCredential = await signInWithPopup(auth, googleProvider);
      const gUser = userCredential.user;

      if (!gUser || !gUser.email) {
        throw new Error('No email address returned from Google account.');
      }

      const res = await loginWithGoogle({
        uid: gUser.uid,
        name: gUser.displayName || gUser.email.split('@')[0],
        email: gUser.email,
        picture: gUser.photoURL || ''
      });

      setLoading(false);
      if (res.success) {
        window.location.href = '/admin/';
      } else {
        setAuthError(res.error || 'Failed to complete Google authentication session.');
      }
    } catch (err: any) {
      setLoading(false);
      console.error('Google Auth Error:', err);

      let userFriendlyMsg = 'Google Sign-In failed. Please try again.';
      const errorCode = err.code || '';

      if (errorCode === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        userFriendlyMsg = 'Sign in was cancelled by user.';
      } else if (errorCode === 'auth/popup-blocked' || err.message?.includes('popup-blocked')) {
        userFriendlyMsg = 'Sign-in popup was blocked by your browser. Please allow popups for this website.';
      } else if (errorCode === 'auth/network-request-failed') {
        userFriendlyMsg = 'Network error. Please check your internet connection and try again.';
      } else if (errorCode === 'auth/unauthorized-domain') {
        userFriendlyMsg = 'This domain is not authorized in your Firebase Console settings (Authentication > Settings > Authorized Domains).';
      } else if (errorCode === 'auth/invalid-api-key') {
        userFriendlyMsg = 'Invalid Firebase API key configured.';
      } else if (errorCode === 'auth/account-exists-with-different-credential') {
        userFriendlyMsg = 'An account already exists with the same email address using a different login method.';
      } else if (err.message) {
        userFriendlyMsg = err.message;
      }

      setAuthError(userFriendlyMsg);
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto space-y-2">
      {authError && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-500/20 text-center leading-relaxed">
          {authError}
        </div>
      )}

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="inline-block w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {loading
            ? 'Connecting to Google...'
            : mode === 'signup'
            ? 'Sign up with Google'
            : 'Continue with Google'}
        </span>
      </button>
    </div>
  );
};
