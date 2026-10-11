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
  adminLogin: (id: string, pass: string) => boolean;
  adminPinLogin: (pin: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dedicated Admin Credentials as requested: ID: 7079988808, Password: Shahbaz
export const ADMIN_ID = '7079988808';
export const ADMIN_PASSWORD = 'Shahbaz';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('pdf_master_admin_session') === 'true';
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google Sign-In error:', err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('pdf_master_admin_session');
  };

  const toggleAdminMode = (enable?: boolean) => {
    setIsAdmin((prev) => {
      const next = enable !== undefined ? enable : !prev;
      if (next) {
        localStorage.setItem('pdf_master_admin_session', 'true');
      } else {
        localStorage.removeItem('pdf_master_admin_session');
      }
      return next;
    });
  };

  const adminLogin = (id: string, pass: string): boolean => {
    // Strict validation: ID: 7079988808 & Password: Shahbaz
    const cleanId = (id || '').trim().replace(/[\s+-]/g, '');
    const cleanPass = (pass || '').trim();
    
    // Accept standard 7079988808 or with country code 917079988808
    const idMatches = cleanId === ADMIN_ID || cleanId === `91${ADMIN_ID}`;
    const passMatches = cleanPass === ADMIN_PASSWORD;

    if (idMatches && passMatches) {
      setIsAdmin(true);
      localStorage.setItem('pdf_master_admin_session', 'true');
      return true;
    }
    return false;
  };

  // Backward compatibility: pin bypass disabled as requested ("iske alava Kisi chij Se kholna nahin chahie")
  const adminPinLogin = (_pin: string): boolean => {
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isAdminMode: isAdmin,
        loginWithGoogle,
        logout,
        toggleAdminMode,
        adminLogin,
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
