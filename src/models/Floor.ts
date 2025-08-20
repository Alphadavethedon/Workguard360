import mongoose, { Document, Schema } from 'mongoose';

export interface IFloor extends Document {
  name: string;
  level: number;
  description: string;
  accessRoles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const floorSchema = new Schema<IFloor>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: true,
  },
  accessRoles: [{
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
floorSchema.index({ level: 1 });
floorSchema.index({ name: 1 });
floorSchema.index({ isActive: 1 });

export const Floor = mongoose.model<IFloor>('Floor', floorSchema);