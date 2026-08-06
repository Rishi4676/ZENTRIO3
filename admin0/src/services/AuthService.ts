import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  reload
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'worker' | 'client';
  companyName?: string;
  mobile?: string;
  country?: string;
  state?: string;
  city?: string;
  createdAt?: string;
}

const LOCAL_CREDENTIALS: Record<string, { email: string; name: string; role: 'admin' | 'worker'; passwords: string[] }> = {
  'admin_owner': { email: 'admin@zentrio.ai', name: 'Admin Owner', role: 'admin', passwords: ['admin@zentrio', 'Admin@2026#'] },
  'admin001': { email: 'admin@zentrio.ai', name: 'Admin Owner', role: 'admin', passwords: ['admin@zentrio', 'Admin@2026#'] },
  'admin@zentrio.ai': { email: 'admin@zentrio.ai', name: 'Admin Owner', role: 'admin', passwords: ['admin@zentrio', 'Admin@2026#'] },
  'syedrashid_w1': { email: 'syed.r@zentrio.ai', name: 'Syed Rashid', role: 'worker', passwords: ['syed@zentrio', 'Worker@2026#'] },
  'w1': { email: 'syed.r@zentrio.ai', name: 'Syed Rashid', role: 'worker', passwords: ['syed@zentrio', 'Worker@2026#'] },
  'syed.r@zentrio.ai': { email: 'syed.r@zentrio.ai', name: 'Syed Rashid', role: 'worker', passwords: ['syed@zentrio', 'Worker@2026#'] },
  'rishigesh_w2': { email: 'rishi@zentrio.ai', name: 'Rishigesh', role: 'worker', passwords: ['rishi@zentrio', 'Worker@2026#'] },
  'w2': { email: 'rishi@zentrio.ai', name: 'Rishigesh', role: 'worker', passwords: ['rishi@zentrio', 'Worker@2026#'] },
  'rishi@zentrio.ai': { email: 'rishi@zentrio.ai', name: 'Rishigesh', role: 'worker', passwords: ['rishi@zentrio', 'Worker@2026#'] },
  'pushparaj_w3': { email: 'pushpa.r@zentrio.ai', name: 'Pushparaj', role: 'worker', passwords: ['pushpa@zentrio', 'Worker@2026#'] },
  'w3': { email: 'pushpa.r@zentrio.ai', name: 'Pushparaj', role: 'worker', passwords: ['pushpa@zentrio', 'Worker@2026#'] },
  'pushpa.r@zentrio.ai': { email: 'pushpa.r@zentrio.ai', name: 'Pushparaj', role: 'worker', passwords: ['pushpa@zentrio', 'Worker@2026#'] }
};

export const AuthService = {
  // Translate Firebase error codes to user-friendly messages
  getErrorMessage(error: any): string {
    const code = error?.code || error?.message || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'The email address format is invalid.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email, user ID, or password.';
      case 'auth/email-already-in-use':
        return 'This email address is already registered.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please wait and try again later.';
      case 'auth/requires-recent-login':
        return 'This operation requires you to re-authenticate.';
      default:
        return error.message || 'An unexpected authentication error occurred.';
    }
  },

  // 1. Log In
  async login(id: string, password: string): Promise<UserProfile> {
    const idLower = id.trim().toLowerCase();
    let email = idLower;
    let localMapped = LOCAL_CREDENTIALS[idLower];

    if (localMapped) {
      email = localMapped.email;
    }

    try {
      // Direct Firebase Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return await this.fetchOrCreateProfile(userCredential.user, localMapped);
    } catch (error: any) {
      // Fallback for Admin/Worker migration on first login
      if (
        (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') &&
        localMapped &&
        localMapped.passwords.includes(password)
      ) {
        try {
          // Register them in Firebase Auth on the fly
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          return await this.fetchOrCreateProfile(userCredential.user, localMapped);
        } catch (migrationErr) {
          throw migrationErr;
        }
      }
      throw error;
    }
  },

  // Helper to fetch profile from Firestore or seed it
  async fetchOrCreateProfile(user: FirebaseUser, localMapped?: typeof LOCAL_CREDENTIALS[string]): Promise<UserProfile> {
    const docRef = doc(db, 'users', user.email!.toLowerCase());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: user.email!, ...docSnap.data() } as UserProfile;
    }

    try {
      const q = query(collection(db, 'users'), where('email', '==', user.email!.toLowerCase()));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const matchedDoc = qSnap.docs[0];
        return { id: user.email!, ...matchedDoc.data() } as UserProfile;
      }
    } catch (err) {
      console.warn('Failed to query user profile by email field:', err);
    }

    // Write on the fly
    const profile: UserProfile = {
      id: user.email!,
      username: localMapped ? localMapped.name : (user.displayName || user.email!.split('@')[0]),
      email: user.email!,
      role: localMapped ? localMapped.role : 'client',
      createdAt: new Date().toISOString()
    };

    await setDoc(docRef, profile);
    return profile;
  },

  // 2. Sign Up
  async signUp(email: string, password: string, userData: Omit<UserProfile, 'id' | 'role' | 'email'>): Promise<UserProfile> {
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        throw err;
      }
    }
    
    // Write profile to Firestore using email as doc ID for backend compatibility
    const profile: UserProfile = {
      id: email,
      username: userData.username,
      email: email,
      role: 'client',
      companyName: userData.companyName || '',
      mobile: userData.mobile || '',
      country: userData.country || '',
      state: userData.state || '',
      city: userData.city || '',
      createdAt: new Date().toISOString()
    };

    const docRef = doc(db, 'users', email.toLowerCase());
    await setDoc(docRef, profile);

    // Send verification email
    await sendEmailVerification(userCredential.user);

    return profile;
  },

  // 3. Log Out
  async logout(): Promise<void> {
    await signOut(auth);
  },

  // 4. Send Email Verification
  async sendVerification(): Promise<void> {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },

  // 5. Send Password Reset Email
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // 6. Change Email (secure modular method)
  async changeEmail(newEmail: string): Promise<void> {
    if (auth.currentUser) {
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    }
  },

  // 7. Reload User state to check if email is verified
  async reloadUser(): Promise<FirebaseUser | null> {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      return auth.currentUser;
    }
    return null;
  },

  // 8. Passwordless Sign-In
  async sendSignInLink(email: string): Promise<void> {
    const actionCodeSettings = {
      url: `${window.location.origin}/portal/client-login`,
      handleCodeInApp: true,
    };
    const { sendSignInLinkToEmail } = await import('firebase/auth');
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  },

  isSignInLink(link: string): boolean {
    return isSignInWithEmailLink(auth, link);
  },

  async signInWithLink(email: string, link: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailLink(auth, email, link);
    window.localStorage.removeItem('emailForSignIn');
    return await this.fetchOrCreateProfile(userCredential.user);
  }
};
