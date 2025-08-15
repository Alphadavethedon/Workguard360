import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">WG</span>
          </div>
          <h1 className="text-xl font-bold text-white">WorkGuard360</h1>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees, alerts, reports..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>

          <Button variant="ghost" size="sm">
            <Settings className="w-5 h-5" />
          </Button>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">{user?.role.name}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};