import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/api/useAuth';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Admin from './pages/Admin';

export default function AppRoutes() {
  const { isAuthenticated, isLoadingUser } = useAuth();

  // quick debug: open the browser console and check these values
  // (remove later)
  // eslint-disable-next-line no-console
  console.log('Auth state:', { isAuthenticated, isLoadingUser });

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Protected group (all routes under /dashboard/* require auth) */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Admin as a protected single route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredPermissions={['user.read']}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
