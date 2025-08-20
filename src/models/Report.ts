import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  name: string;
  type: 'access' | 'compliance' | 'security' | 'attendance' | 'system' | 'custom';
  description: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  generatedBy: mongoose.Types.ObjectId;
  status: 'generating' | 'ready' | 'failed' | 'expired';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  filePath?: string;
  fileSize?: number;
  downloadCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['access', 'compliance', 'security', 'attendance', 'system', 'custom'],
  },
  description: {
    type: String,
    required: true,
  },
  dateRange: {
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  generatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['generating', 'ready', 'failed', 'expired'],
    default: 'generating',
  },
  format: {
    type: String,
    required: true,
    enum: ['pdf', 'csv', 'excel', 'json'],
    default: 'pdf',
  },
  filePath: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  downloadCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
}, {
  timestamps: true,
});

// Indexes
reportSchema.index({ generatedBy: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Report = mongoose.model<IReport>('Report', reportSchema);