import mongoose, { Document, Schema } from 'mongoose';

export interface IShift extends Document {
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<IShift>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  days: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  }],
  roles: [{
    type: String,
    enum: ['admin', 'hr', 'security', 'employee'],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
shiftSchema.index({ name: 1 });
shiftSchema.index({ isActive: 1 });

export const Shift = mongoose.model<IShift>('Shift', shiftSchema);