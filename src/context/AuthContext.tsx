import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name?: string;
  // Add other user fields you expect from the backend
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const token = res.data?.token;
      const userData = res.data?.user;

      if (!token || !userData) {
        throw new Error('Invalid server response: missing token or user data');
      }

      localStorage.setItem('authToken', token);
      setUser(userData);
    } catch (error: any) {
      console.error('Login error:', error?.response?.data || error.message);
      throw new Error('Login failed: Invalid credentials or server error.');
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

// Custom hook for easy context consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
