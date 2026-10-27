import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, UserPosition } from '../types';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  updateProfile as updateFbProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  authLoading: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, phone: string, pass: string, position?: UserPosition) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchDemoRole: (role: 'visitor' | 'user' | 'admin') => void;
}

/**
 * Checks if a user is an administrator.
 * Security notice: Email-substring matching (e.g. includes('admin')) is strictly forbidden
 * to prevent privilege escalation. Only exact verified admin credentials or role === 'admin'
 * are recognized.
 */
export const isUserAdmin = (emailOrRole?: string | null, role?: string): boolean => {
  if (role === 'admin') return true;
  if (emailOrRole === 'admin') return true;
  if (emailOrRole && emailOrRole.trim().toLowerCase() === 'suyabamins@gmail.com') return true;
  return false;
};

const DEFAULT_DEMO_USER: UserProfile = {
  uid: 'demo-user-1',
  displayName: 'রাফি হাসান',
  email: 'rafi@gmail.com',
  phone: '01712xxxxxx',
  position: 'member',
  academicYear: '৩য় বর্ষ',
  address: 'ভাটারা, ঢাকা (UIU সংলগ্ন)',
  role: 'user',
  status: 'active',
  createdAt: '2026-01-10T12:00:00Z',
  updatedAt: '2026-01-10T12:00:00Z',
};

const DEFAULT_DEMO_ADMIN: UserProfile = {
  uid: 'demo-admin-1',
  displayName: 'আব্দুর রহমান',
  email: 'admin@shibir.library',
  phone: '01811xxxxxx',
  position: 'member',
  address: 'থানার বাসা, UIU সংলগ্ন, ঢাকা',
  role: 'admin',
  status: 'active',
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with null — do not pre-load untrusted role from localStorage.
  // Firebase onAuthStateChanged will populate user state authoritatively.
  const [user, setUser] = useState<UserProfile | null>(null);
  // authLoading is true until Firebase resolves the initial auth state.
  // Route guards wait for this before making redirection decisions.
  const [authLoading, setAuthLoading] = useState(true);

  // Synchronize with Firebase Auth and Firestore Database
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          // Admin status check:
          // 1. Is in /admins/{uid} collection
          // 2. OR user document role === 'admin'
          // 3. OR exact owner email suyabamins@gmail.com
          let resolvedIsAdmin = false;
          const userEmail = fbUser.email?.trim().toLowerCase();

          if (userEmail === 'suyabamins@gmail.com') {
            resolvedIsAdmin = true;
          }

          try {
            const adminDocRef = doc(db, 'admins', fbUser.uid);
            const adminDocSnap = await getDoc(adminDocRef);
            if (adminDocSnap.exists()) {
              resolvedIsAdmin = true;
            } else if (resolvedIsAdmin) {
              setDoc(adminDocRef, {
                uid: fbUser.uid,
                email: fbUser.email,
                name: fbUser.displayName || 'অ্যাডমিন',
                grantedAt: new Date().toISOString(),
              }).catch(() => {});
            }
          } catch {
            // If admin collection query fails or not permitted
          }

          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as UserProfile;
            const finalIsAdmin = resolvedIsAdmin || data.role === 'admin';
            const finalRole: UserRole = finalIsAdmin ? 'admin' : (data.role || 'user');
            setUser({
              ...data,
              uid: fbUser.uid,
              displayName: fbUser.displayName || data.displayName || 'ব্যবহারকারী',
              email: fbUser.email || data.email,
              role: finalRole,
            });
            if (finalIsAdmin && data.role !== 'admin') {
              updateDoc(userDocRef, { role: 'admin' }).catch(() => {});
            }
          } else {
            // Document might not be created yet if just registered
            setUser({
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'ব্যবহারকারী',
              email: fbUser.email || '',
              photoURL: fbUser.photoURL || undefined,
              role: resolvedIsAdmin ? 'admin' : 'user',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.warn('Error fetching Firestore user profile:', e);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string, requestedRole?: UserRole) => {
    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;

        // Fetch User record from Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let resolvedIsAdmin = false;
        const lowerEmail = (fbUser.email || email).trim().toLowerCase();
        if (lowerEmail === 'suyabamins@gmail.com') {
          resolvedIsAdmin = true;
        }

        try {
          const adminDocRef = doc(db, 'admins', fbUser.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          if (adminDocSnap.exists()) {
            resolvedIsAdmin = true;
          } else if (resolvedIsAdmin) {
            setDoc(adminDocRef, {
              uid: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || 'অ্যাডমিন',
              grantedAt: new Date().toISOString(),
            }).catch(() => {});
          }
        } catch {
          // ignore
        }

        let profileData: UserProfile;

        if (userDocSnap.exists()) {
          const data = userDocSnap.data() as UserProfile;
          const finalIsAdmin = resolvedIsAdmin || data.role === 'admin';
          profileData = {
            ...data,
            uid: fbUser.uid,
            role: finalIsAdmin ? 'admin' : (data.role || 'user'),
          };
          if (finalIsAdmin && data.role !== 'admin') {
            updateDoc(userDocRef, { role: 'admin' }).catch(() => {});
          }
        } else {
          // If first login and firestore document was missing
          profileData = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || email.split('@')[0],
            email: fbUser.email || email,
            role: resolvedIsAdmin ? 'admin' : 'user',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(userDocRef, profileData);
          } catch (e) {
            console.warn('Firestore doc creation fallback:', e);
          }
        }

        setUser(profileData);
        return true;
      } catch (err: any) {
        console.error('Firebase login error:', err);
        let msg = 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।';
        if (
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-credential'
        ) {
          msg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে অ্যাকাউন্ট সাময়িকভাবে বন্ধ আছে। কিছুক্ষণ পর চেষ্টা করুন।';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'সঠিক ইমেইল ঠিকানা প্রদান করুন।';
        } else if (err.message) {
          msg = err.message;
        }
        throw new Error(msg);
      }
    } else {
      // Offline fallback: ONLY grant admin if requestedRole is explicitly 'admin'
      const loggedUser: UserProfile = requestedRole === 'admin'
        ? {
            ...DEFAULT_DEMO_ADMIN,
            email,
            displayName: email.split('@')[0],
          }
        : {
            ...DEFAULT_DEMO_USER,
            email,
            displayName: email.split('@')[0],
            role: 'user',
          };
      setUser(loggedUser);
      return true;
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    pass: string,
    position: UserPosition = 'worker'
  ) => {
    if (isFirebaseConfigured) {
      try {
        // 1. Create User in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;

        // 2. Set Firebase Auth Display Name
        await updateFbProfile(fbUser, { displayName: name });

        // 3. Create Document in Cloud Firestore (collection: users)
        // Enforce: Never register as admin from client
        const newUser: UserProfile = {
          uid: fbUser.uid,
          displayName: name,
          email,
          phone,
          position,
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const userDocRef = doc(db, 'users', fbUser.uid);
        await setDoc(userDocRef, newUser);

        setUser(newUser);
        return true;
      } catch (err: any) {
        console.error('Firebase registration error:', err);
        let msg = 'নিবন্ধন ব্যর্থ হয়েছে।';
        if (err.code === 'auth/email-already-in-use') {
          msg = 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত রয়েছে। অন্য ইমেইল ব্যবহার করুন বা লগইন করুন।';
        } else if (err.code === 'auth/weak-password') {
          msg = 'পাসওয়ার্ড দুর্বল। ন্যূনতম ৬ অক্ষরের পাসওয়ার্ড দিন।';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'সঠিক ফরম্যাটের ইমেইল ঠিকানা দিন।';
        } else if (err.code === 'auth/operation-not-allowed') {
          msg = 'Firebase Authentication-এ Email/Password প্রদানকারী সক্রিয় করা নেই। অনুগ্রহ করে Firebase কনসোলে Email/Password সক্রিয় করুন।';
        } else if (err.message) {
          msg = err.message;
        }
        throw new Error(msg);
      }
    } else {
      // Local fallback
      const newUser: UserProfile = {
        uid: `user-${Date.now()}`,
        displayName: name,
        email,
        phone,
        position,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newUser);
      return true;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn('Logout error:', e);
      }
    }
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    setUser(updated);

    if (isFirebaseConfigured && auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to update Firestore profile document:', err);
      }
    }
  };

  const switchDemoRole = (roleType: 'visitor' | 'user' | 'admin') => {
    if (roleType === 'visitor') {
      setUser(null);
    } else if (roleType === 'user') {
      setUser(DEFAULT_DEMO_USER);
    } else if (roleType === 'admin') {
      setUser(DEFAULT_DEMO_ADMIN);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'user',
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        authLoading,
        login,
        register,
        logout,
        updateProfile,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
