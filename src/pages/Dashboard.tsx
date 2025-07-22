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
  CheckCircle
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Employees',
      value: '1,247',
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'sky'
    },
    {
      title: 'Active Alerts',
      value: '23',
      change: '-8%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Compliance Score',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: Shield,
      color: 'green'
    },
    {
      title: 'Today\'s Entries',
      value: '892',
      change: '+5%',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'blue'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      user: 'Sarah Chen',
      action: 'Badge scan - Main Entrance',
      time: '2 minutes ago',
      status: 'success',
      location: 'Building A - Floor 1'
    },
    {
      id: 2,
      user: 'Mike Johnson',
      action: 'Access denied - Server Room',
      time: '5 minutes ago',
      status: 'warning',
      location: 'Building B - Floor 3'
    },
    {
      id: 3,
      user: 'Emily Davis',
      action: 'Badge scan - Parking Garage',
      time: '8 minutes ago',
      status: 'success',
      location: 'Parking Level B1'
    },
    {
      id: 4,
      user: 'Alex Rodriguez',
      action: 'Emergency exit used',
      time: '12 minutes ago',
      status: 'alert',
      location: 'Building C - Floor 2'
    },
    {
      id: 5,
      user: 'Lisa Wang',
      action: 'Badge scan - Conference Room',
      time: '15 minutes ago',
      status: 'success',
      location: 'Building A - Floor 4'
    }
  ];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
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
          <p className="text-gray-400">Welcome back! Here's what's happening at your workplace.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
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
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
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
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {activity.location}
                    </div>
                  </div>
                </motion.div>
              ))}
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