import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRole 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, hasPermission, hasRole } = useAuth();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user has required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required permissions/role
  return <>{children}</>;
};