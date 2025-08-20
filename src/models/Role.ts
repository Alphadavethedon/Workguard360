import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: mongoose.Types.ObjectId[];
  accessLevel: number;
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  accessLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
roleSchema.index({ name: 1 });
roleSchema.index({ accessLevel: 1 });

export const Role = mongoose.model<IRole>('Role', roleSchema);