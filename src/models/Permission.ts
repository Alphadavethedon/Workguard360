import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  resource: string;
  action: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const permissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  resource: {
    type: String,
    required: true,
    enum: ['users', 'alerts', 'reports', 'shifts', 'floors', 'dashboard'],
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage'],
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
permissionSchema.index({ resource: 1, action: 1 });
permissionSchema.index({ name: 1 });

export const Permission = mongoose.model<IPermission>('Permission', permissionSchema);