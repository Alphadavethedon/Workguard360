import PDFDocument from 'pdfkit';

export const generatePDF = async (data: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(20).text('WorkGuard360 Security Report', 50, 50);
      doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
      doc.text(`Date Range: ${data.dateRange.start.toLocaleDateString()} - ${data.dateRange.end.toLocaleDateString()}`, 50, 100);

      // Summary
      doc.fontSize(16).text('Summary', 50, 140);
      doc.fontSize(12)
        .text(`Total Alerts: ${data.summary.totalAlerts}`, 50, 170)
        .text(`Critical Alerts: ${data.summary.criticalAlerts}`, 50, 190)
        .text(`Resolved Alerts: ${data.summary.resolvedAlerts}`, 50, 210)
        .text(`Active Users: ${data.summary.activeUsers}`, 50, 230);

      // Alerts section
      if (data.alerts.length > 0) {
        doc.fontSize(16).text('Recent Alerts', 50, 270);
        let yPosition = 300;

        data.alerts.slice(0, 10).forEach((alert: any, index: number) => {
          doc.fontSize(10)
            .text(`${index + 1}. ${alert.title}`, 50, yPosition)
            .text(`   Severity: ${alert.severity} | Status: ${alert.status}`, 50, yPosition + 15)
            .text(`   Location: ${alert.location}`, 50, yPosition + 30);
          yPosition += 50;

          if (yPosition > 700) {
            doc.addPage();
            yPosition = 50;
          }
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};