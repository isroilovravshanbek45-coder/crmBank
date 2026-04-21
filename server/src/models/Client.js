/**
 * Client Model
 * Mijozlar uchun MongoDB schema va optimized indexes
 */

import mongoose from 'mongoose';
import { CLIENT_STATUS } from '../config/constants.js';

const clientSchema = new mongoose.Schema(
  {
    ism: {
      type: String,
      required: [true, 'Ism majburiy'],
      trim: true,
      minlength: [2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak'],
      maxlength: [50, 'Ism 50 ta belgidan oshmasligi kerak']
    },
    familya: {
      type: String,
      required: [true, 'Familya majburiy'],
      trim: true,
      minlength: [2, 'Familya kamida 2 ta belgidan iborat bo\'lishi kerak'],
      maxlength: [50, 'Familya 50 ta belgidan oshmasligi kerak']
    },
    telefon: {
      type: String,
      required: [true, 'Telefon majburiy'],
      trim: true,
      match: [/^\+998[0-9]{9}$/, 'Telefon raqami noto\'g\'ri formatda']
    },
    hudud: {
      type: String,
      required: [true, 'Hudud majburiy'],
      trim: true,
      minlength: [2, 'Hudud kamida 2 ta belgidan iborat bo\'lishi kerak'],
      maxlength: [100, 'Hudud 100 ta belgidan oshmasligi kerak']
    },
    garov: {
      type: String,
      required: [true, 'Garov majburiy'],
      trim: true,
      minlength: [2, 'Garov kamida 2 ta belgidan iborat bo\'lishi kerak'],
      maxlength: [200, 'Garov 200 ta belgidan oshmasligi kerak']
    },
    summa: {
      type: Number,
      required: [true, 'Summa majburiy']
    },
    operatorRaqam: {
      type: String,
      required: [true, 'Operator raqami majburiy'],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: Object.values(CLIENT_STATUS),
        message: '{VALUE} to\'g\'ri status emas'
      },
      default: CLIENT_STATUS.PENDING,
      index: true
    },
    comment: {
      type: String,
      default: '',
      maxlength: [500, 'Izoh 500 ta belgidan oshmasligi kerak']
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true, // createdAt va updatedAt avtomatik qo'shiladi
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ===== INDEXES =====

// Compound indexes for better query performance
clientSchema.index({ operatorRaqam: 1, status: 1 });
clientSchema.index({ operatorRaqam: 1, createdAt: -1 });
clientSchema.index({ status: 1, createdAt: -1 });
clientSchema.index({ createdAt: -1 });
clientSchema.index({ deleted: 1, createdAt: -1 });

// Text index for search functionality
clientSchema.index({
  ism: 'text',
  familya: 'text',
  telefon: 'text',
  hudud: 'text'
});

// ===== VIRTUALS =====

// To'liq ism
clientSchema.virtual('fullName').get(function () {
  return `${this.ism} ${this.familya}`;
});

// ===== QUERY HELPERS =====

// Soft deleted bo'lmaganlarni olish
clientSchema.query.notDeleted = function () {
  return this.where({ deleted: false });
};

// Status bo'yicha filter
clientSchema.query.byStatus = function (status) {
  return this.where({ status });
};

// Operator bo'yicha filter
clientSchema.query.byOperator = function (operatorId) {
  return this.where({ operatorRaqam: operatorId });
};

// ===== INSTANCE METHODS =====

/**
 * Soft delete
 */
clientSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

/**
 * Restore soft deleted client
 */
clientSchema.methods.restore = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

// ===== STATIC METHODS =====

/**
 * Operator bo'yicha statistika
 */
clientSchema.statics.getOperatorStats = async function (operatorId) {
  const stats = await this.aggregate([
    {
      $match: {
        operatorRaqam: operatorId,
        deleted: false
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$summa' }
      }
    }
  ]);

  return stats;
};

/**
 * Barcha operatorlar statistikasi (Optimized - N+1 query muammosini hal qiladi)
 */
clientSchema.statics.getAllOperatorsStats = async function () {
  const stats = await this.aggregate([
    {
      $match: { deleted: false }
    },
    {
      $group: {
        _id: '$operatorRaqam',
        total: { $sum: 1 },
        approved: {
          $sum: {
            $cond: [{ $eq: ['$status', CLIENT_STATUS.APPROVED] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', CLIENT_STATUS.PENDING] }, 1, 0]
          }
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ['$status', CLIENT_STATUS.REJECTED] }, 1, 0]
          }
        },
        totalAmount: { $sum: '$summa' }
      }
    },
    {
      $sort: { approved: -1, total: -1 }
    }
  ]);

  return stats;
};

/**
 * Search clients
 */
clientSchema.statics.searchClients = async function (searchTerm, options = {}) {
  const query = {
    deleted: false,
    $text: { $search: searchTerm }
  };

  if (options.operatorId) {
    query.operatorRaqam = options.operatorId;
  }

  if (options.status) {
    query.status = options.status;
  }

  return this.find(query)
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20);
};

// ===== MIDDLEWARE (HOOKS) =====

// Pre-save: telefon raqamini formatlash
clientSchema.pre('save', function (next) {
  if (this.isModified('telefon')) {
    // Bo'sh joylarni olib tashlash
    this.telefon = this.telefon.replace(/\s/g, '');

    // +998 qo'shish agar yo'q bo'lsa
    if (!this.telefon.startsWith('+998')) {
      if (this.telefon.startsWith('998')) {
        this.telefon = '+' + this.telefon;
      } else if (this.telefon.length === 9) {
        this.telefon = '+998' + this.telefon;
      }
    }
  }

  next();
});

// Pre-find: faqat o'chirilmaganlarni olish (default)
clientSchema.pre(/^find/, function (next) {
  // Agar explicitly deleted: true query qilinmasa, faqat o'chirilmaganlarni ko'rsatish
  if (this.getQuery().deleted === undefined) {
    this.where({ deleted: false });
  }
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
