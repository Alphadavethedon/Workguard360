import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  MapPin,
  Search,
  User,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useAlerts } from '../hooks/api/useAlerts';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../lib/types';

const Alerts = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const {
    alerts,
    isLoading,
    error,
    acknowledgeAlert,
    resolveAlert,
    isAcknowledging,
    isResolving,
  } = useAlerts({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: debouncedSearchTerm,
  });

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: Alert['status']) => {
    switch (status) {
      case 'active':
        return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'acknowledged':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'resolved':
        return 'text-green-400 bg-green-400/20 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
      case 'emergency':
        return <XCircle className="w-4 h-4" />;
      case 'compliance':
        return <CheckCircle className="w-4 h-4" />;
      case 'system':
        return <Eye className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
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
          <h1 className="text-3xl font-bold text-white mb-2">Security Alerts</h1>
          <p className="text-gray-400">Monitor and manage security incidents across your facilities.</p>
        </div>
        <Button variant="primary">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Filters and Search */}
      <GlassCard>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <GlassCard key={index} className="h-40">
              <LoadingSpinner />
            </GlassCard>
          ))
        ) : error ? (
          <GlassCard className="text-center py-12 text-red-400">
            Failed to load alerts.
          </GlassCard>
        ) : alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <GlassCard className="hover:bg-white/15 transition-all duration-200">
                <div className="flex items-start space-x-4">
                  {/* Severity Indicator */}
                  <div className={`w-1 h-24 rounded-full ${getSeverityColor(alert.severity)}`} />

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="text-gray-400">{getTypeIcon(alert.type)}</div>
                          <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              alert.status
                            )}`}
                          >
                            {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-gray-300 mb-3">{alert.description}</p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{alert.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          {alert.assignedTo && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>Assigned to: {alert.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {alert.status === 'active' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                              disabled={isAcknowledging || isResolving}
                            >
                              Acknowledge
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                              disabled={isAcknowledging || isResolving}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                        {alert.status === 'acknowledged' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            disabled={isAcknowledging || isResolving}
                          >
                            Resolve
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <GlassCard className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No alerts found</h3>
            <p className="text-gray-400">No alerts match your current filters.</p>
          </GlassCard>
        )}
      </div>
    </motion.div>
  );
};

export default Alerts;