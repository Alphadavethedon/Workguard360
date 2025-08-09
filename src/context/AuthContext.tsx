// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../utils/api'; // we'll add this file next

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Optional: try to restore user from token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    // fetch /auth/me
    (async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/auth/me');
        setUser(res.data.user || null);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data?.token;
      const userData = res.data?.user;
      if (!token || !userData) throw new Error('Invalid server response');
      localStorage.setItem('authToken', token);
      setUser(userData);
    } catch (err: any) {
      console.error('Login error:', err?.response?.data || err?.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Named export required by Navbar and other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
