import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app start
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication - replace with actual API call
      const mockUser: User = {
        id: '1',
        email,
        firstName: 'Sarah',
        lastName: 'Chen',
        role: {
          id: 'super-admin',
          name: 'Super Admin',
          description: 'Full system access',
          permissions: [
            { id: '1', name: 'user.create', resource: 'user', action: 'create', description: 'Create users' },
            { id: '2', name: 'user.read', resource: 'user', action: 'read', description: 'View users' },
            { id: '3', name: 'user.update', resource: 'user', action: 'update', description: 'Update users' },
            { id: '4', name: 'user.delete', resource: 'user', action: 'delete', description: 'Delete users' },
            { id: '5', name: 'alerts.manage', resource: 'alerts', action: 'manage', description: 'Manage alerts' },
            { id: '6', name: 'reports.generate', resource: 'reports', action: 'generate', description: 'Generate reports' },
          ],
          isCustom: false,
          createdAt: new Date().toISOString(),
        },
        department: 'Engineering',
        jobTitle: 'Chief Technology Officer',
        phone: '+1 (555) 123-4567',
        emergencyContact: 'John Chen - +1 (555) 987-6543',
        badgeNumber: 'WG-2024-0001',
        accessLevel: 10,
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: [
          { id: '1', name: 'user.create', resource: 'user', action: 'create', description: 'Create users' },
          { id: '2', name: 'user.read', resource: 'user', action: 'read', description: 'View users' },
          { id: '3', name: 'user.update', resource: 'user', action: 'update', description: 'Update users' },
          { id: '4', name: 'user.delete', resource: 'user', action: 'delete', description: 'Delete users' },
          { id: '5', name: 'alerts.manage', resource: 'alerts', action: 'manage', description: 'Manage alerts' },
          { id: '6', name: 'reports.generate', resource: 'reports', action: 'generate', description: 'Generate reports' },
        ],
      };

      const mockToken = 'mock-jwt-token';
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('authToken', mockToken);
      setUser(mockUser);
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.some(p => p.name === permission);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role.name.toLowerCase() === role.toLowerCase();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};