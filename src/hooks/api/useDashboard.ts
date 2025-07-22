import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { DashboardStats, AccessLog } from '../../lib/types';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: async (): Promise<AccessLog[]> => {
      const { data } = await api.get('/dashboard/recent-activity', {
        params: { limit },
      });
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });
};