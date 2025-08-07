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
  Users
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';

const Reports = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('last-30-days');
  const [selectedReportType, setSelectedReportType] = useState('all');

  const reportTemplates = [
    {
      id: 1,
      name: 'Access Control Summary',
      description: 'Comprehensive overview of all access events and patterns',
      type: 'access',
      icon: Shield,
      color: 'sky',
      lastGenerated: '2024-01-15T08:00:00Z',
      downloadCount: 45
    },
    {
      id: 2,
      name: 'Compliance Audit Report',
      description: 'Detailed compliance status and regulatory requirements',
      type: 'compliance',
      icon: FileText,
      color: 'green',
      lastGenerated: '2024-01-14T16:30:00Z',
      downloadCount: 23
    },
    {
      id: 3,
      name: 'Security Incidents Analysis',
      description: 'Analysis of security alerts and incident patterns',
      type: 'security',
      icon: BarChart3,
      color: 'red',
      lastGenerated: '2024-01-15T09:15:00Z',
      downloadCount: 18
    },
    {
      id: 4,
      name: 'Employee Attendance Report',
      description: 'Attendance patterns and time tracking analytics',
      type: 'attendance',
      icon: Users,
      color: 'blue',
      lastGenerated: '2024-01-15T07:45:00Z',
      downloadCount: 67
    },
    {
      id: 5,
      name: 'System Performance Report',
      description: 'Hardware status and system uptime analytics',
      type: 'system',
      icon: TrendingUp,
      color: 'purple',
      lastGenerated: '2024-01-15T06:00:00Z',
      downloadCount: 12
    },
    {
      id: 6,
      name: 'Time-based Access Patterns',
      description: 'Analysis of access patterns by time of day and week',
      type: 'analytics',
      icon: Clock,
      color: 'orange',
      lastGenerated: '2024-01-14T20:00:00Z',
      downloadCount: 31
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Weekly Access Summary - Week 2',
      type: 'Access Control',
      generatedBy: 'Davis Wabwile',
      generatedAt: '2024-01-15T10:30:00Z',
      size: '2.4 MB',
      format: 'PDF',
      status: 'ready'
    },
    {
      id: 2,
      name: 'Compliance Audit - Q1 2024',
      type: 'Compliance',
      generatedBy: 'Mike Johnson',
      generatedAt: '2024-01-15T09:15:00Z',
      size: '5.7 MB',
      format: 'Excel',
      status: 'ready'
    },
    {
      id: 3,
      name: 'Security Incidents - January',
      type: 'Security',
      generatedBy: 'jay Jones',
      generatedAt: '2024-01-15T08:45:00Z',
      size: '1.8 MB',
      format: 'PDF',
      status: 'generating'
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTemplates = reportTemplates.filter(template => 
    selectedReportType === 'all' || template.type === selectedReportType
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
        <Button variant="primary">
          <FileText className="w-4 h-4 mr-2" />
          Custom Report
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
              <GlassCard className={`bg-gradient-to-br ${getColorClasses(template.color)} border hover:bg-opacity-80 transition-all duration-200 cursor-pointer`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center ${getIconColor(template.color)}`}>
                    <template.icon className="w-6 h-6" />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{template.description}</p>
                
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Last generated:</span>
                    <span>{formatDate(template.lastGenerated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Downloads:</span>
                    <span>{template.downloadCount}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Button variant="primary" size="sm" className="w-full">
                    Generate Report
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
            {recentReports.map((report, index) => (
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
                      <span>{formatDate(report.generatedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-300">{report.size}</div>
                    <div className="text-gray-400">{report.format}</div>
                  </div>
                  
                  {report.status === 'ready' ? (
                    <Button variant="secondary" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2 text-yellow-400">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};

export default Reports;