import { Request, Response } from 'express';
import { Report } from '../models/Report';
import { Alert } from '../models/Alert';
import { User } from '../models/User';
import { logger } from '../config/logger';
import { generatePagination } from '../utils/pagination';
import { AuthRequest } from '../middleware/auth';
import { generatePDF } from '../utils/pdf';
import { generateCSV } from '../utils/csv';

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const type = req.query.type as string;
    const status = req.query.status as string;

    const query: any = {};

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('generatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = generatePagination(total, page, limit);

    res.json({
      success: true,
      data: {
        reports,
        pagination,
      },
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
    });
  }
};

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'firstName lastName email');

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found',
      });
      return;
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('Get report by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
    });
  }
};

export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, type, description, dateRange, format = 'pdf' } = req.body;

    const report = new Report({
      name,
      type,
      description,
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      },
      generatedBy: req.user._id,
      format,
      status: 'generating',
    });

    await report.save();

    // Simulate report generation (in real app, this would be a background job)
    setTimeout(async () => {
      try {
        report.status = 'ready';
        report.fileSize = Math.floor(Math.random() * 1000000) + 100000; // Random file size
        await report.save();
        
        logger.info(`Report generated: ${report._id}`);
      } catch (error) {
        logger.error('Report generation failed:', error);
        report.status = 'failed';
        await report.save();
      }
    }, 2000);

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report generation started',
    });
  } catch (error) {
    logger.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
    });
  }
};

export const downloadReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end, format = 'pdf' } = req.query;

    if (!start || !end) {
      res.status(400).json({
        success: false,
        message: 'Start and end dates are required',
      });
      return;
    }

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    // Fetch data for the report
    const alerts = await Alert.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate('assignedTo acknowledgedBy resolvedBy');

    const users = await User.find({ isActive: true }).populate('role');

    const reportData = {
      title: 'WorkGuard360 Security Report',
      dateRange: { start: startDate, end: endDate },
      alerts,
      users,
      summary: {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
        resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
        activeUsers: users.length,
      },
    };

    if (format === 'pdf') {
      const pdfBuffer = await generatePDF(reportData);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="workguard360-report-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } else if (format === 'csv') {
      const csvData = await generateCSV(reportData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="workguard360-report-${Date.now()}.csv"`);
      res.send(csvData);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported format',
      });
    }
  } catch (error) {
    logger.error('Download report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download report',
    });
  }
};