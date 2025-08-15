import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Filter, 
  Search, 
  Clock, 
  MapPin, 
  User,
  CheckCircle,
  XCircle,
  Eye,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import { Alert, PaginatedResponse } from '../lib/types';
import { formatRelativeTime } from '../lib/utils';
import { toast } from 'react-hot-toast';

const Alerts = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ['alerts', { page, status: selectedFilter, search: searchTerm }],
    queryFn: async (): Promise<PaginatedResponse<Alert>> => {
      const params: any = { page, limit: 10 };
      if (selectedFilter !== 'all') params.status = selectedFilter;
      if (searchTerm) params.search = searchTerm;
      
      const { data } = await api.get('/alerts', { params });
      return data;
    },
    refetchInterval: 30000,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await api.patch(`/alerts/${alertId}/acknowledge`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert acknowledged successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to acknowledge alert');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await api.patch(`/alerts/${alertId}/resolve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert resolved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resolve alert');
    },
  });

  const getSeverityColor = (severity: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getTypeIcon = (type: string) => {
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

  const alerts = alertsData?.data?.alerts || [];
  const pagination = alertsData?.data?.pagination;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Alerts</h1>
          <p className="text-gray-400">Monitor and manage security incidents across your facilities.</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      <GlassCard>
        <div className="flex flex-col lg:flex-row gap-4">
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

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.length > 0 ? (
            alerts.map((alert, index) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <GlassCard className="hover:bg-white/15 transition-all duration-200">
                  <div className="flex items-start space-x-4">
                    <div className={`w-1 h-16 rounded-full ${getSeverityColor(alert.severity)}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-gray-400">
                              {getTypeIcon(alert.type)}
                            </div>
                            <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(alert.status)}`}>
                              {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)} text-white`}>
                              {alert.severity.toUpperCase()}
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
                              <span>{formatRelativeTime(alert.createdAt)}</span>
                            </div>
                            {alert.assignedTo && (
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>Assigned to: {alert.assignedTo.firstName} {alert.assignedTo.lastName}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <span>Triggered by: {alert.triggeredBy}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {alert.status === 'active' && (
                            <>
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => acknowledgeMutation.mutate(alert._id)}
                                disabled={acknowledgeMutation.isPending}
                              >
                                {acknowledgeMutation.isPending ? 'Acknowledging...' : 'Acknowledge'}
                              </Button>
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => resolveMutation.mutate(alert._id)}
                                disabled={resolveMutation.isPending}
                              >
                                {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
                              </Button>
                            </>
                          )}
                          {alert.status === 'acknowledged' && (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => resolveMutation.mutate(alert._id)}
                              disabled={resolveMutation.isPending}
                            >
                              {resolveMutation.isPending ? 'Resolving...' : 'Resolve'}
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

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-gray-400 text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Alerts;