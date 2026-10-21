import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, UserPosition } from '../types';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, phone: string, pass: string, position?: UserPosition) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  switchDemoRole: (role: 'visitor' | 'user' | 'admin') => void;
}

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
    // Default to registered user so borrower views and workflows are testable immediately
    return DEFAULT_DEMO_USER;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('shibir_library_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shibir_library_user');
    }
  }, [user]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // sync with firebase user
        setUser((prev) => ({
          uid: fbUser.uid,
          displayName: fbUser.displayName || 'ব্যবহারকারী',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
          role: prev?.role || 'user',
          status: 'active',
          createdAt: prev?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, _pass: string, requestedRole?: UserRole) => {
    // Check if logging in as admin email
    const isAdminEmail = email.includes('admin') || requestedRole === 'admin';
    const loggedUser: UserProfile = isAdminEmail ? DEFAULT_DEMO_ADMIN : {
      ...DEFAULT_DEMO_USER,
      email,
      displayName: email.split('@')[0],
      role: 'user',
    };
    setUser(loggedUser);
    return true;
  };

  const register = async (name: string, email: string, phone: string, _pass: string, position: UserPosition = 'worker') => {
    const newUser: UserProfile = {
      uid: `user-${Date.now()}`,
      displayName: name,
      email,
      phone,
      position,
      role: 'user', // Enforce: Never register as admin
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      try {
        await fbSignOut(auth);
      } catch {
        // ignore
      }
    }
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...data, updatedAt: new Date().toISOString() });
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
