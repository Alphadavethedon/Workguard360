export const generateCSV = async (data: any): Promise<string> => {
  const csvRows: string[] = [];

  // Header
  csvRows.push('WorkGuard360 Security Report');
  csvRows.push(`Generated: ${new Date().toLocaleDateString()}`);
  csvRows.push(`Date Range: ${data.dateRange.start.toLocaleDateString()} - ${data.dateRange.end.toLocaleDateString()}`);
  csvRows.push('');

  // Summary
  csvRows.push('Summary');
  csvRows.push(`Total Alerts,${data.summary.totalAlerts}`);
  csvRows.push(`Critical Alerts,${data.summary.criticalAlerts}`);
  csvRows.push(`Resolved Alerts,${data.summary.resolvedAlerts}`);
  csvRows.push(`Active Users,${data.summary.activeUsers}`);
  csvRows.push('');

  // Alerts
  if (data.alerts.length > 0) {
    csvRows.push('Alerts');
    csvRows.push('Title,Type,Severity,Status,Location,Created At');
    
    data.alerts.forEach((alert: any) => {
      const row = [
        `"${alert.title}"`,
        alert.type,
        alert.severity,
        alert.status,
        `"${alert.location}"`,
        alert.createdAt.toLocaleDateString(),
      ].join(',');
      csvRows.push(row);
    });
  }

  return csvRows.join('\n');
};