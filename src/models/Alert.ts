import mongoose, { Document, Schema } from 'mongoose';

export interface IAlert extends Document {
  type: 'security' | 'compliance' | 'system' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  location: string;
  triggeredBy: string;
  assignedTo?: mongoose.Types.ObjectId;
  acknowledgedBy?: mongoose.Types.ObjectId;
  resolvedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>({
  type: {
    type: String,
    required: true,
    enum: ['security', 'compliance', 'system', 'emergency'],
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active',
  },
  location: {
    type: String,
    required: true,
  },
  triggeredBy: {
    type: String,
    required: true,
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  acknowledgedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  acknowledgedAt: {
    type: Date,
  },
  resolvedAt: {
    type: Date,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
alertSchema.index({ status: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ assignedTo: 1 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);