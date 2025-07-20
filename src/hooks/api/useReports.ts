import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';
import { Report } from '../../lib/types';

interface GenerateReportData {
  name: string;
  type: string;
  dateRange: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export const useReports = () => {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: async (): Promise<Report[]> => {
      const { data } = await api.get('/reports');
      return data;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: GenerateReportData): Promise<Report> => {
      const { data } = await api.post('/reports/generate', reportData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Report generation started');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: async ({ reportId, format }: { reportId: string; format: 'pdf' | 'csv' | 'excel' }) => {
      const response = await api.get(`/reports/${reportId}/download`, {
        params: { format },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('Report downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to download report');
    },
  });

  return {
    reports: reportsQuery.data || [],
    isLoading: reportsQuery.isLoading,
    error: reportsQuery.error,
    generateReport: generateReportMutation.mutate,
    downloadReport: downloadReportMutation.mutate,
    isGenerating: generateReportMutation.isPending,
    isDownloading: downloadReportMutation.isPending,
  };
};