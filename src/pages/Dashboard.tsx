import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatCard } from '../components/ui/StatCard';
import { useAuth } from '../hooks/api/useAuth';
import { useDashboardStats, useRecentActivity } from '../hooks/api/useDashboard';
import { AccessLog } from '../lib/types';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: statsData, isLoading: isLoadingStats, error: statsError } = useDashboardStats();
  const { data: recentActivity, isLoading: isLoadingActivity, error: activityError } = useRecentActivity(5);

  const stats = statsData
    ? [
        {
          title: 'Total Employees',
          value: statsData.totalEmployees.toLocaleString(),
          change: '+12%', // Note: change data is not in API
          trend: 'up' as const,
          icon: Users,
          color: 'sky' as const,
        },
        {
          title: 'Active Alerts',
          value: statsData.criticalAlerts.toLocaleString(),
          change: '-8%', // Note: change data is not in API
          trend: 'down' as const,
          icon: AlertTriangle,
          color: 'red' as const,
        },
        {
          title: 'Compliance Score',
          value: `${statsData.complianceScore.toFixed(1)}%`,
          change: '+2.1%', // Note: change data is not in API
          trend: 'up' as const,
          icon: Shield,
          color: 'green' as const,
        },
        {
          title: "Today's Entries",
          value: statsData.todayEntries.toLocaleString(),
          change: '+5%', // Note: change data is not in API
          trend: 'up' as const,
          icon: TrendingUp,
          color: 'blue' as const,
        },
      ]
    : [];

  const getStatusColor = (log: AccessLog) => {
    if (!log.success) return 'text-red-400';
    if (log.action === 'denied') return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = (log: AccessLog) => {
    if (!log.success) return <XCircle className="w-4 h-4 text-red-400" />;
    if (log.action === 'denied') return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  const getActionText = (log: AccessLog) => {
    switch (log.action) {
      case 'entry':
        return `Badge scan - ${log.location}`;
      case 'exit':
        return `Badge scan (exit) - ${log.location}`;
      case 'denied':
        return `Access denied - ${log.location}`;
      default:
        return 'Unknown action';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {user?.firstName}! Here's what's happening at your workplace.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoadingStats
          ? Array.from({ length: 4 }).map((_, index) => (
              <GlassCard key={index} className="flex items-center justify-center h-40">
                <LoadingSpinner />
              </GlassCard>
            ))
          : stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
        {statsError && (
          <div className="col-span-full text-red-400">Failed to load stats.</div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                Real-time Activity Feed
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">Live</span>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {isLoadingActivity ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner />
                </div>
              ) : activityError ? (
                <div className="text-red-400 text-center">Failed to load activity.</div>
              ) : (
                recentActivity?.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 mt-1">{getStatusIcon(activity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {activity.userName}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm ${getStatusColor(activity)} mt-1`}>
                        {getActionText(activity)}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        {activity.location}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions & System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-6"
        >
          {/* System Status */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Access Control</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Biometric Scanners</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">98% Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Security Cameras</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span className="text-xs text-yellow-400">2 Offline</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Fire Safety</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">All Clear</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-sky-400/20 to-blue-500/20 border border-sky-400/30 rounded-lg text-left hover:from-sky-400/30 hover:to-blue-500/30 transition-all duration-200">
                <div className="text-sm font-medium text-white">Generate Report</div>
                <div className="text-xs text-gray-400">Create compliance report</div>
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-400/30 rounded-lg text-left hover:from-green-400/30 hover:to-emerald-500/30 transition-all duration-200">
                <div className="text-sm font-medium text-white">Add New User</div>
                <div className="text-xs text-gray-400">Register new employee</div>
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-orange-400/20 to-red-500/20 border border-orange-400/30 rounded-lg text-left hover:from-orange-400/30 hover:to-red-500/30 transition-all duration-200">
                <div className="text-sm font-medium text-white">Security Alert</div>
                <div className="text-xs text-gray-400">Create manual alert</div>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;