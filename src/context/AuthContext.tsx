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
  login: (email: string, pass: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, phone: string, pass: string, position?: UserPosition) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  switchDemoRole: (role: 'visitor' | 'user' | 'admin') => void;
}

export const isUserAdmin = (email?: string | null, role?: string): boolean => {
  if (role === 'admin') return true;
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  return (
    lower.includes('admin') ||
    lower.includes('suyabamin') ||
    lower === 'suyabamins@gmail.com'
  );
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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('shibir_library_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('shibir_library_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shibir_library_user');
    }
  }, [user]);

  // Synchronize with Firebase Auth and Firestore Database
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let isAdmin = isUserAdmin(fbUser.email);
          try {
            const adminDocRef = doc(db, 'admins', fbUser.uid);
            const adminDocSnap = await getDoc(adminDocRef);
            if (adminDocSnap.exists()) {
              isAdmin = true;
            } else if (isAdmin) {
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
            const finalIsAdmin = isAdmin || data.role === 'admin' || isUserAdmin(data.email);
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
            setUser((prev) => {
              const finalRole: UserRole = isAdmin ? 'admin' : (prev?.role || 'user');
              return {
                uid: fbUser.uid,
                displayName: fbUser.displayName || prev?.displayName || 'ব্যবহারকারী',
                email: fbUser.email || prev?.email || '',
                photoURL: fbUser.photoURL || undefined,
                role: finalRole,
                status: 'active',
                createdAt: prev?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
            });
          }
        } catch (e) {
          console.warn('Error fetching Firestore user profile:', e);
        }
      } else {
        setUser(null);
        localStorage.removeItem('shibir_library_user');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string, requestedRole?: UserRole) => {
    // If testing using the quick demo switcher/button
    if (requestedRole === 'admin' && pass === 'admin123') {
      setUser(DEFAULT_DEMO_ADMIN);
      return true;
    }

    if (isFirebaseConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const fbUser = userCredential.user;

        // Fetch User record from Firestore
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        let isAdmin = isUserAdmin(fbUser.email);
        try {
          const adminDocRef = doc(db, 'admins', fbUser.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          if (adminDocSnap.exists()) {
            isAdmin = true;
          } else if (isAdmin) {
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
          const finalIsAdmin = isAdmin || data.role === 'admin' || isUserAdmin(data.email);
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
            role: isAdmin ? 'admin' : 'user',
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
          msg = 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
        } else if (err.code === 'auth/too-many-requests') {
          msg = 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে অ্যাকাউন্ট সাময়িকভাবে বন্ধ আছে। কিছুক্ষণ পর চেষ্টা করুন।';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'সঠিক ইমেইল ঠিকানা প্রদান করুন।';
        } else if (err.message) {
          msg = err.message;
        }
        throw new Error(msg);
      }
    } else {
      const isAdminEmail = isUserAdmin(email) || requestedRole === 'admin';
      const loggedUser: UserProfile = isAdminEmail
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
        const newUser: UserProfile = {
          uid: fbUser.uid,
          displayName: name,
          email,
          phone,
          position,
          role: 'user', // Enforce: Never register as admin from client
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
    localStorage.removeItem('shibir_library_user');
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
