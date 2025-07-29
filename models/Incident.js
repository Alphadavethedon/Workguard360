const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentNumber: {
    type: String,
    unique: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Incident title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Incident description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'workplace_injury',
      'near_miss',
      'property_damage',
      'security_breach',
      'fire_safety',
      'chemical_spill',
      'equipment_failure',
      'workplace_violence',
      'environmental',
      'other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  location: {
    building: String,
    floor: String,
    room: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  dateTimeOccurred: {
    type: Date,
    required: [true, 'Incident date and time is required']
  },
  witnesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  affectedPersons: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    injuryType: String,
    medicalAttentionRequired: {
      type: Boolean,
      default: false
    }
  }],
  immediateActions: {
    type: String,
    maxlength: [1000, 'Immediate actions cannot exceed 1000 characters']
  },
  rootCause: {
    type: String,
    maxlength: [1000, 'Root cause cannot exceed 1000 characters']
  },
  preventiveMeasures: {
    type: String,
    maxlength: [1000, 'Preventive measures cannot exceed 1000 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dueDate: Date,
  attachments: [{
    filename: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  updates: [{
    updateBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updateDate: {
      type: Date,
      default: Date.now
    },
    comment: String,
    statusChange: {
      from: String,
      to: String
    }
  }],
  costImpact: {
    estimatedCost: Number,
    actualCost: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  regulatory: {
    reportableToAuthorities: {
      type: Boolean,
      default: false
    },
    authoritiesNotified: {
      type: Boolean,
      default: false
    },
    regulatoryReference: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
incidentSchema.index({ reportedBy: 1, createdAt: -1 });
incidentSchema.index({ category: 1, severity: 1 });
incidentSchema.index({ status: 1, priority: 1 });
incidentSchema.index({ dateTimeOccurred: -1 });
incidentSchema.index({ assignedTo: 1 });
incidentSchema.index({ incidentNumber: 1 });

// Auto-generate incident number
incidentSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  const count = await this.constructor.countDocuments();
  this.incidentNumber = `INC-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  next();
});

// Static method for analytics
incidentSchema.statics.getAnalytics = async function(dateFrom, dateTo) {
  const matchStage = {};
  if (dateFrom || dateTo) {
    matchStage.dateTimeOccurred = {};
    if (dateFrom) matchStage.dateTimeOccurred.$gte = new Date(dateFrom);
    if (dateTo) matchStage.dateTimeOccurred.$lte = new Date(dateTo);
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        bySeverity: [{ $group: { _id: '$severity', count: { $sum: 1 } } }],
        byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }],
        monthlyTrend: [
          {
            $group: {
              _id: {
                year: { $year: '$dateTimeOccurred' },
                month: { $month: '$dateTimeOccurred' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]
      }
    }
  ]);
};

module.exports = mongoose.model('Incident', incidentSchema);