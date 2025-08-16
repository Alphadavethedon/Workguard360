'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'security_manager', 'security_guard', 'employee', 'user'], default: 'user' },
  password: { type: String, required: true, select: false, minlength: 6 },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
