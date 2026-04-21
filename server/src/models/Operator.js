/**
 * Operator Model
 * Operatorlar uchun MongoDB schema
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { OPERATOR_STATUS } from '../config/constants.js';

const operatorSchema = new mongoose.Schema(
  {
    operatorId: {
      type: String,
      required: [true, 'Operator ID majburiy'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Ism majburiy'],
      trim: true,
      minlength: [2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'],
      maxlength: [50, 'Ism 50 ta belgidan oshmasligi kerak']
    },
    password: {
      type: String,
      required: [true, 'Parol majburiy'],
      minlength: [4, 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak'],
      select: false // Parolni default query'larda qaytarmaslik
    },
    status: {
      type: String,
      enum: {
        values: Object.values(OPERATOR_STATUS),
        message: '{VALUE} to\'g\'ri status emas'
      },
      default: OPERATOR_STATUS.ACTIVE,
      index: true
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
operatorSchema.index({ status: 1, operatorId: 1 });

// ===== VIRTUALS =====

// Operator locked bo'lsa
operatorSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ===== INSTANCE METHODS =====

/**
 * Parolni tekshirish
 */
operatorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Login muvaffaqiyatli bo'lganda
 */
operatorSchema.methods.onLoginSuccess = function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  this.lastLogin = new Date();
  return this.save();
};

/**
 * Login muvaffaqiyatsiz bo'lganda
 */
operatorSchema.methods.onLoginFailure = function () {
  this.loginAttempts += 1;

  // 5 ta noto'g'ri urinishdan keyin 15 daqiqa bloklash
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }

  return this.save();
};

// ===== MIDDLEWARE (HOOKS) =====

/**
 * Pre-save: Parolni hash qilish
 */
operatorSchema.pre('save', async function (next) {
  // Agar parol o'zgartirilmagan bo'lsa, skip qilish
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Parolni hash qilish
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const Operator = mongoose.model('Operator', operatorSchema);

export default Operator;
