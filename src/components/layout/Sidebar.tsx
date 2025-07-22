import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  FileText, 
  Users, 
  Shield,
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: 'Security Alerts',
    href: '/alerts',
    icon: AlertTriangle,
    permission: 'alerts.manage',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    permission: 'reports.generate',
  },
  {
    name: 'Administration',
    href: '/admin',
    icon: Users,
    permission: 'user.read',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'reports.generate',
  },
];

const secondaryNavigation = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
  {
    name: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
  },
];

export const Sidebar = () => {
  const { user, hasPermission } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-16 bottom-0 w-64 bg-white/5 backdrop-blur-md border-r border-white/20 overflow-y-auto"
    >
      <div className="p-6">
        {/* User Info */}
        <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">{user?.department}</p>
              <p className="text-xs text-sky-400">{user?.role.name}</p>
            </div>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-2">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-sky-400 border border-sky-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="my-8 border-t border-white/10"></div>

        {/* Secondary Navigation */}
        <nav className="space-y-2">
          {secondaryNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-sky-400/20 to-blue-500/20 text-sky-400 border border-sky-400/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Upgrade Banner */}
        <div className="mt-8 p-4 bg-gradient-to-r from-sky-400/10 to-blue-500/10 rounded-lg border border-sky-400/20">
          <div className="text-center">
            <Shield className="w-8 h-8 text-sky-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white mb-1">Upgrade to Pro</h3>
            <p className="text-xs text-gray-400 mb-3">
              Unlock advanced features and unlimited users
            </p>
            <button className="w-full px-3 py-2 bg-gradient-to-r from-sky-400 to-blue-500 text-white text-xs font-medium rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all duration-200">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};