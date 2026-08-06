import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthService } from '../services/AuthService';
import type { UserProfile } from '../services/AuthService';

interface AuthContextProps {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (id: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, userData: any) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Safety timeout to prevent permanent loading if Firebase is blocked or offline
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    let unsubscribe = () => {};
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        clearTimeout(timer);
        setUser(currentUser);
        if (currentUser) {
          try {
            const profile = await AuthService.fetchOrCreateProfile(currentUser);
            setUserProfile(profile);
          } catch (err) {
            console.error('Failed to load user profile:', err);
          }
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      });
    } else {
      clearTimeout(timer);
      setLoading(false);
    }

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const login = async (id: string, password: string) => {
    setLoading(true);
    try {
      const profile = await AuthService.login(id, password);
      setUserProfile(profile);
      return profile;
    } catch (err: any) {
      throw new Error(AuthService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const profile = await AuthService.signUp(email, password, userData);
      setUserProfile(profile);
      return profile;
    } catch (err: any) {
      throw new Error(AuthService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AuthService.logout();
      setUserProfile(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      await AuthService.sendVerification();
    } catch (err: any) {
      throw new Error(AuthService.getErrorMessage(err));
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await AuthService.sendPasswordReset(email);
    } catch (err: any) {
      throw new Error(AuthService.getErrorMessage(err));
    }
  };

  const changeEmail = async (newEmail: string) => {
    try {
      await AuthService.changeEmail(newEmail);
    } catch (err: any) {
      throw new Error(AuthService.getErrorMessage(err));
    }
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      const reloadedUser = await AuthService.reloadUser();
      setUser(reloadedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        login,
        signUp,
        logout,
        resendVerification,
        sendPasswordReset,
        changeEmail,
        reloadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useFirebase must be used within an AuthProvider');
  }
  return context;
};
