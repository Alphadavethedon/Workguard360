'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // critical: do not return by default
    },
  },
  { timestamps: true }
);

// Hash on create & when modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const saltRounds = Number(process.env.BCRYPT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

module.exports = mongoose.model('User', UserSchema);
