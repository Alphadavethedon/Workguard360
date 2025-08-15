import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  MapPin,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import { DashboardStats } from '../lib/types';
import { formatRelativeTime } from '../lib/utils';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    },
    refetchInterval: 60000,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<any[]> => {
      const { data } = await api.get('/dashboard/recent-activity');
      return data.data;
    },
    refetchInterval: 5000,
  });

  const statsCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees?.toString() || '0',
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'sky'
    },
    {
      title: 'Active Alerts',
      value: stats?.totalAlerts?.toString() || '0',
      change: '-8%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Compliance Score',
      value: `${stats?.complianceScore || 0}%`,
      change: '+2.1%',
      trend: 'up' as const,
      icon: Shield,
      color: 'green'
    },
    {
      title: 'Today\'s Entries',
      value: stats?.todayEntries?.toString() || '0',
      change: '+5%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'blue'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'alert':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'alert':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening at your workplace.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <GlassCard className="hover:bg-white/15 transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-300 text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`} />
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {stat.change}
                    </span>
                    <span className="text-gray-400 text-sm">vs last period</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-sky-400">
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">
                          {activity.user}
                        </p>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                      <p className={`text-sm ${getStatusColor(activity.status)} mt-1`}>
                        {activity.action}
                      </p>
                      {activity.location && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {activity.location}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-6"
        >
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
                <span className="text-sm text-gray-300">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">API Services</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">System Health</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">{stats?.systemHealth || 98}%</span>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-sky-400/20 to-blue-500/20 border border-sky-400/30 rounded-lg text-left hover:from-sky-400/30 hover:to-blue-500/30 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Generate Report</div>
                    <div className="text-xs text-gray-400">Create compliance report</div>
                  </div>
                </div>
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-400/30 rounded-lg text-left hover:from-green-400/30 hover:to-emerald-500/30 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-green-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Add New User</div>
                    <div className="text-xs text-gray-400">Register new employee</div>
                  </div>
                </div>
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-orange-400/20 to-red-500/20 border border-orange-400/30 rounded-lg text-left hover:from-orange-400/30 hover:to-red-500/30 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Security Alert</div>
                    <div className="text-xs text-gray-400">Create manual alert</div>
                  </div>
                </div>
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;