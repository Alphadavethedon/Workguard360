import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  Filter,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useReports } from '../hooks/api/useReports';

const reportTemplates = [
  {
    id: 1,
    name: 'Access Control Summary',
    description: 'Comprehensive overview of all access events and patterns',
    type: 'access' as const,
    icon: Shield,
    color: 'sky' as const,
  },
  {
    id: 2,
    name: 'Compliance Audit Report',
    description: 'Detailed compliance status and regulatory requirements',
    type: 'compliance' as const,
    icon: FileText,
    color: 'green' as const,
  },
  {
    id: 3,
    name: 'Security Incidents Analysis',
    description: 'Analysis of security alerts and incident patterns',
    type: 'security' as const,
    icon: BarChart3,
    color: 'red' as const,
  },
  {
    id: 4,
    name: 'Employee Attendance Report',
    description: 'Attendance patterns and time tracking analytics',
    type: 'attendance' as const,
    icon: Users,
    color: 'blue' as const,
  },
  // 'system' and 'analytics' types from the original file are not in the API `Report` type,
  // so they are omitted for now.
];

const Reports = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('last-30-days');
  const [selectedReportType, setSelectedReportType] = useState('all');

  const {
    reports,
    isLoading: isLoadingReports,
    error: reportsError,
    generateReport,
    isGenerating,
    downloadReport,
    isDownloading,
  } = useReports();

  const handleGenerateReport = (type: string, name: string) => {
    const now = new Date();
    let startDate: Date;

    switch (selectedDateRange) {
      case 'last-7-days':
        startDate = subDays(now, 7);
        break;
      case 'last-90-days':
        startDate = subDays(now, 90);
        break;
      case 'last-year':
        startDate = subDays(now, 365);
        break;
      case 'last-30-days':
      default:
        startDate = subDays(now, 30);
        break;
    }

    generateReport({
      name: `${name} (${selectedDateRange})`,
      type,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
    });
  };

  const getColorClasses = (color: string) => {
    const colors = {
      sky: 'from-sky-400/20 to-sky-600/20 border-sky-400/30',
      green: 'from-green-400/20 to-green-600/20 border-green-400/30',
      red: 'from-red-400/20 to-red-600/20 border-red-400/30',
      blue: 'from-blue-400/20 to-blue-600/20 border-blue-400/30',
    };
    return colors[color as keyof typeof colors] || colors.sky;
  };

  const getIconColor = (color: string) => {
    const colors = {
      sky: 'text-sky-400',
      green: 'text-green-400',
      red: 'text-red-400',
      blue: 'text-blue-400',
    };
    return colors[color as keyof typeof colors] || colors.sky;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy, h:mm a');
  };

  const filteredTemplates = useMemo(
    () =>
      reportTemplates.filter(
        (template) => selectedReportType === 'all' || template.type === selectedReportType
      ),
    [selectedReportType]
  );

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
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-gray-400">Generate comprehensive reports and analyze workplace data.</p>
        </div>
        <Button variant="primary" disabled>
          <FileText className="w-4 h-4 mr-2" />
          Custom Report (soon)
        </Button>
      </div>

      {/* Filters */}
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
                <option value="custom" disabled>
                  Custom range (soon)
                </option>
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
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Report Templates */}
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
              <GlassCard
                className={`bg-gradient-to-br ${getColorClasses(
                  template.color
                )} border hover:bg-opacity-80 transition-all duration-200 flex flex-col`}
              >
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${getIconColor(
                        template.color
                      )}`}
                    >
                      <template.icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                  <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                </div>

                <div className="mt-auto pt-4 border-t border-white/10">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleGenerateReport(template.type, template.name)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <LoadingSpinner size="sm" /> : 'Generate Report'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
        <GlassCard>
          <div className="space-y-4">
            {isLoadingReports ? (
              <div className="flex justify-center items-center h-40">
                <LoadingSpinner />
              </div>
            ) : reportsError ? (
              <div className="text-center text-red-400">Failed to load reports.</div>
            ) : reports.length > 0 ? (
              reports.map((report, index) => (
                <motion.div
                  key={report.id}
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
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>Generated by {report.generatedBy}</span>
                        <span>•</span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {report.status === 'ready' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => downloadReport({ reportId: report.id, format: 'pdf' })}
                        disabled={isDownloading}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    ) : report.status === 'generating' ? (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Generating...</span>
                      </div>
                    ) : (
                      <div className="text-red-400 text-sm">Failed</div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">No recent reports.</div>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default Reports;