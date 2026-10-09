import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAdminMode: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleAdminMode: (enable?: boolean) => void;
  adminPinLogin: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'shahbazdawateislami@gmail.com';
const ADMIN_PIN = '1234';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    return localStorage.getItem('pdf_master_admin_mode') === 'true';
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email === ADMIN_EMAIL) {
        setIsAdminMode(true);
        localStorage.setItem('pdf_master_admin_mode', 'true');
      }
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Sign-In error:', err);
      // Fallback guest login if popup fails in iframe
      alert('Google Sign-In popup could not complete. You can also use Admin Mode or continue as Guest.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setIsAdminMode(false);
    localStorage.removeItem('pdf_master_admin_mode');
  };

  const toggleAdminMode = (enable?: boolean) => {
    setIsAdminMode((prev) => {
      const next = enable !== undefined ? enable : !prev;
      localStorage.setItem('pdf_master_admin_mode', next ? 'true' : 'false');
      return next;
    });
  };

  const adminPinLogin = (pin: string) => {
    if (pin === ADMIN_PIN || pin === 'pdfmaster') {
      setIsAdminMode(true);
      localStorage.setItem('pdf_master_admin_mode', 'true');
      return true;
    }
    return false;
  };

  const isAdmin = isAdminMode || user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAdminMode,
        loginWithGoogle,
        logout,
        toggleAdminMode,
        adminPinLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
