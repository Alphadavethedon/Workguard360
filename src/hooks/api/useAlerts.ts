import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { Alert } from '../../lib/types';

interface AlertsParams {
  page?: number;
  limit?: number;
  type?: string;
  severity?: string;
  status?: string;
  search?: string;
}

interface AlertsResponse {
  alerts: Alert[];
  total: number;
  page: number;
  limit: number;
}

export const useAlerts = (params: AlertsParams = {}) => {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ['alerts', params],
    queryFn: async (): Promise<AlertsResponse> => {
      const { data } = await api.get('/alerts', { params });
      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string): Promise<Alert> => {
      const { data } = await api.patch(`/alerts/${alertId}/acknowledge`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert acknowledged');
    },
  });

  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: string): Promise<Alert> => {
      const { data } = await api.patch(`/alerts/${alertId}/resolve`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert resolved');
    },
  });

  return {
    alerts: alertsQuery.data?.alerts || [],
    total: alertsQuery.data?.total || 0,
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    acknowledgeAlert: acknowledgeAlertMutation.mutate,
    resolveAlert: resolveAlertMutation.mutate,
    isAcknowledging: acknowledgeAlertMutation.isPending,
    isResolving: resolveAlertMutation.isPending,
  };
};