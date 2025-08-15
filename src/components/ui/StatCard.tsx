import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DivideIcon as LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: LucideIcon;
  color: 'sky' | 'red' | 'green' | 'blue' | 'purple' | 'orange';
}

export const StatCard = ({ title, value, change, trend, icon: Icon, color }: StatCardProps) => {
  const getColorClasses = () => {
    const colors = {
      sky: 'from-sky-400/20 to-sky-600/20 border-sky-400/30 text-sky-400',
      red: 'from-red-400/20 to-red-600/20 border-red-400/30 text-red-400',
      green: 'from-green-400/20 to-green-600/20 border-green-400/30 text-green-400',
      blue: 'from-blue-400/20 to-blue-600/20 border-blue-400/30 text-blue-400',
      purple: 'from-purple-400/20 to-purple-600/20 border-purple-400/30 text-purple-400',
      orange: 'from-orange-400/20 to-orange-600/20 border-orange-400/30 text-orange-400'
    };
    return colors[color];
  };

  const getTrendColor = () => {
    return trend === 'up' ? 'text-green-400' : 'text-red-400';
  };

  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <GlassCard className={`bg-gradient-to-br ${getColorClasses()} border hover:bg-opacity-80 transition-all duration-200`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-300 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-white mb-2">{value}</p>
            <div className="flex items-center space-x-1">
              <TrendIcon className={`w-4 h-4 ${getTrendColor()}`} />
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {change}
              </span>
              <span className="text-gray-400 text-sm">vs last period</span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${getColorClasses().split(' ')[3]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};