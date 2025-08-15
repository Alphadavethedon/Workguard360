import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Shield,
  Clock,
  Plus
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import api from '../lib/api';
import { Report, PaginatedResponse } from '../lib/types';
import { formatDate } from '../lib/utils';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('last-30-days');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const queryClient = useQueryClient();

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async (): Promise<PaginatedResponse<Report>> => {
      const { data } = await api.get('/reports');
      return data;
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
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
    mutationFn: async (reportId: string) => {
      const { data } = await api.get(`/reports/${reportId}/download`);
      return data;
    },
    onSuccess: (data) => {
      toast.success('Report downloaded successfully');
      console.log('Report data:', data);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to download report');
    },
  });

  const reportTemplates = [
    {
      id: 'access-control',
      name: 'Access Control Summary',
      description: 'Comprehensive overview of all access events and patterns',
      type: 'access',
      icon: Shield,
      color: 'sky',
    },
    {
      id: 'compliance-audit',
      name: 'Compliance Audit Report',
      description: 'Detailed compliance status and regulatory requirements',
      type: 'compliance',
      icon: FileText,
      color: 'green',
    },
    {
      id: 'security-incidents',
      name: 'Security Incidents Analysis',
      description: 'Analysis of security alerts and incident patterns',
      type: 'security',
      icon: BarChart3,
      color: 'red',
    },
    {
      id: 'employee-attendance',
      name: 'Employee Attendance Report',
      description: 'Attendance patterns and time tracking analytics',
      type: 'attendance',
      icon: Users,
      color: 'blue',
    },
    {
      id: 'system-performance',
      name: 'System Performance Report',
      description: 'Hardware status and system uptime analytics',
      type: 'system',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      id: 'access-patterns',
      name: 'Time-based Access Patterns',
      description: 'Analysis of access patterns by time of day and week',
      type: 'analytics',
      icon: Clock,
      color: 'orange',
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      sky: 'from-sky-400/20 to-sky-600/20 border-sky-400/30',
      green: 'from-green-400/20 to-green-600/20 border-green-400/30',
      red: 'from-red-400/20 to-red-600/20 border-red-400/30',
      blue: 'from-blue-400/20 to-blue-600/20 border-blue-400/30',
      purple: 'from-purple-400/20 to-purple-600/20 border-purple-400/30',
      orange: 'from-orange-400/20 to-orange-600/20 border-orange-400/30'
    };
    return colors[color as keyof typeof colors] || colors.sky;
  };

  const getIconColor = (color: string) => {
    const colors = {
      sky: 'text-sky-400',
      green: 'text-green-400',
      red: 'text-red-400',
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      orange: 'text-orange-400'
    };
    return colors[color as keyof typeof colors] || colors.sky;
  };

  const handleGenerateReport = (template: any) => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (selectedDateRange) {
      case 'last-7-days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'last-30-days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'last-90-days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'last-year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    const reportData = {
      name: `${template.name} - ${formatDate(new Date())}`,
      type: template.type,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      description: template.description,
    };

    generateReportMutation.mutate(reportData);
  };

  const filteredTemplates = reportTemplates.filter(template => 
    selectedReportType === 'all' || template.type === selectedReportType
  );

  const reports = reportsData?.data?.reports || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Generate comprehensive reports and analyze workplace data.</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Custom Report
        </Button>
      </div>

      <GlassCard>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              >
                <option value="last-7-days">Last 7 days</option>
                <option value="last-30-days">Last 30 days</option>
                <option value="last-90-days">Last 90 days</option>
                <option value="last-year">Last year</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
              >
                <option value="all">All Types</option>
                <option value="access">Access Control</option>
                <option value="compliance">Compliance</option>
                <option value="security">Security</option>
                <option value="attendance">Attendance</option>
                <option value="system">System</option>
                <option value="analytics">Analytics</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <GlassCard className={`bg-gradient-to-br ${getColorClasses(template.color)} border hover:bg-opacity-80 transition-all duration-200`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${getIconColor(template.color)}`}>
                    <template.icon className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport(template)}
                    disabled={generateReportMutation.isPending}
                  >
                    {generateReportMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <BarChart3 className="w-4 h-4 mr-2" />
                    )}
                    {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
        <GlassCard>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <motion.div
                  key={report._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-sky-400/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{report.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</span>
                        <span>•</span>
                        <span>Generated by {report.generatedBy.firstName} {report.generatedBy.lastName}</span>
                        <span>•</span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <div className="text-gray-300">{report.fileSize ? `${(report.fileSize / 1024).toFixed(1)} KB` : 'N/A'}</div>
                      <div className="text-gray-400">{report.format.toUpperCase()}</div>
                    </div>
                    
                    {report.status === 'ready' ? (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => downloadReportMutation.mutate(report._id)}
                        disabled={downloadReportMutation.isPending}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {downloadReportMutation.isPending ? 'Downloading...' : 'Download'}
                      </Button>
                    ) : report.status === 'generating' ? (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm">Generating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-400">
                        <span className="text-sm">Failed</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No reports generated yet</p>
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default Reports;