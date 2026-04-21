/**
 * Admin Model
 * Admin foydalanuvchilar uchun MongoDB schema
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username majburiy'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username kamida 3 ta belgidan iborat bo\'lishi kerak'],
      maxlength: [50, 'Username 50 ta belgidan oshmasligi kerak']
    },
    password: {
      type: String,
      required: [true, 'Parol majburiy'],
      minlength: [6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'],
      select: false
    },
    fullName: {
      type: String,
      required: [true, 'To\'liq ism majburiy'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email noto\'g\'ri formatda']
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    lastLogin: {
      type: Date,
      default: null
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ===== INDEXES =====
adminSchema.index({ username: 1, status: 1 });

// ===== VIRTUALS =====
adminSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ===== INSTANCE METHODS =====

/**
 * Parolni tekshirish
 */
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Login muvaffaqiyatli
 */
adminSchema.methods.onLoginSuccess = function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  this.lastLogin = new Date();
  return this.save();
};

/**
 * Login muvaffaqiyatsiz
 */
adminSchema.methods.onLoginFailure = function () {
  this.loginAttempts += 1;

  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }

  return this.save();
};

// ===== MIDDLEWARE =====

/**
 * Pre-save: Parolni hash qilish
 */
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
