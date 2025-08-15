import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Shifts = React.lazy(() => import('./pages/Shifts'));
const Floors = React.lazy(() => import('./pages/Floors'));

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-300">Loading WorkGuard360...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute requiredPermissions={['user.read']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="shifts"
              element={
                <ProtectedRoute requiredPermissions={['shifts.read']}>
                  <Shifts />
                </ProtectedRoute>
              }
            />
            <Route
              path="floors"
              element={
                <ProtectedRoute requiredPermissions={['floors.read']}>
                  <Floors />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export default AppRoutes;