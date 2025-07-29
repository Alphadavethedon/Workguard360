const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and office documents are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Document categories and types
const documentCategories = {
  safety: ['Safety Manual', 'SOP', 'Risk Assessment', 'Safety Training Material'],
  compliance: ['Audit Report', 'Certification', 'Regulatory Document', 'Policy'],
  incident: ['Incident Report', 'Investigation Report', 'Corrective Action Plan'],
  training: ['Training Material', 'Presentation', 'Reference Document', 'Quiz'],
  emergency: ['Emergency Plan', 'Evacuation Map', 'Contact List', 'Procedure']
};

// Mock documents storage
let documents = [
  {
    id: '1',
    filename: 'safety-manual-2024.pdf',
    originalName: 'Safety Manual 2024.pdf',
    category: 'safety',
    type: 'Safety Manual',
    description: 'Complete safety manual for 2024',
    uploadedBy: 'admin',
    uploadedAt: new Date('2024-01-15'),
    size: 2048000,
    isPublic: true,
    tags: ['safety', 'manual', '2024']
  },
  {
    id: '2',
    filename: 'emergency-evacuation-plan.pdf',
    originalName: 'Emergency Evacuation Plan.pdf',
    category: 'emergency',
    type: 'Emergency Plan',
    description: 'Building evacuation procedures and maps',
    uploadedBy: 'admin',
    uploadedAt: new Date('2024-01-10'),
    size: 1536000,
    isPublic: true,
    tags: ['emergency', 'evacuation', 'procedure']
  }
];

// @desc    Get document categories
// @route   GET /api/documents/categories
// @access  Private
router.get('/categories', protect, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: documentCategories
    });
  } catch (error) {
    logger.error('Get document categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document categories'
    });
  }
});

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
router.post('/upload', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const document = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      category: req.body.category || 'general',
      type: req.body.type || 'document',
      description: req.body.description || '',
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
      isPublic: req.body.isPublic === 'true' || false,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : []
    };

    documents.push(document);

    logger.info(`Document uploaded: ${document.originalName} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });

  } catch (error) {
    logger.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document'
    });
  }
});

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let filteredDocs = documents;

    // Apply filters
    if (req.query.category) {
      filteredDocs = filteredDocs.filter(doc => doc.category === req.query.category);
    }

    if (req.query.type) {
      filteredDocs = filteredDocs.filter(doc => doc.type === req.query.type);
    }

    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredDocs = filteredDocs.filter(doc => 
        doc.originalName.toLowerCase().includes(searchTerm) ||
        doc.description.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = filteredDocs.length;

    const paginatedDocs = filteredDocs.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      count: paginatedDocs.length,
      total,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        limit
      },
      data: paginatedDocs
    });

  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const document = documents.find(doc => doc.id === req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      data: document
    });

  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching document'
    });
  }
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private (Admin, Manager, or document owner)
router.delete('/:id', protect, async (req, res) => {
  try {
    const documentIndex = documents.findIndex(doc => doc.id === req.params.id);

    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = documents[documentIndex];

    // Check permissions - allow admin, manager, or document owner
    const canDelete = ['admin', 'manager'].includes(req.user.role) || 
                     document.uploadedBy === req.user.id;
    
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }

    documents.splice(documentIndex, 1);

    logger.info(`Document deleted: ${document.originalName} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document'
    });
  }
});

module.exports = router;