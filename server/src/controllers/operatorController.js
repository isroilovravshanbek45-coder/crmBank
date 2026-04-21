/**
 * Operator Controller
 * Operatorlarni boshqarish (Optimized - N+1 query problem solved)
 */

import Operator from '../models/Operator.js';
import Client from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError } from '../utils/errors.js';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  OPERATOR_IDS,
  OPERATOR_STATUS
} from '../config/constants.js';
import { sendSuccessResponse, generateOperatorName } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Barcha operatorlarni olish (Optimized with Aggregation - N+1 solved)
 * GET /api/operators
 */
export const getAllOperators = asyncHandler(async (req, res) => {
  // 1. Barcha operatorlarni olish
  let operators = await Operator.find().sort({ operatorId: 1 }).lean();

  // Agar operators bo'sh bo'lsa, default operatorlarni yaratish
  if (operators.length === 0) {
    const defaultOperators = OPERATOR_IDS.map((id) => ({
      operatorId: id,
      name: generateOperatorName(id),
      password: '1234',
      status: OPERATOR_STATUS.ACTIVE
    }));

    operators = await Operator.insertMany(defaultOperators);
    logger.info('Default operators created');
  }

  // 2. Bitta aggregation query bilan barcha operator statistikalarini olish (N+1 solved!)
  const clientStats = await Client.getAllOperatorsStats();

  // 3. Statistics'ni map qilish (O(n) time complexity)
  const statsMap = new Map();
  clientStats.forEach((stat) => {
    statsMap.set(stat._id, {
      total: stat.total,
      approved: stat.approved,
      pending: stat.pending,
      rejected: stat.rejected,
      totalAmount: stat.totalAmount
    });
  });

  // 4. Operatorlarga statistics qo'shish
  const operatorsWithStats = operators.map((operator) => {
    const stats = statsMap.get(operator.operatorId) || {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      totalAmount: 0
    };

    return {
      id: operator.operatorId,
      name: operator.name,
      status: operator.status,
      lastLogin: operator.lastLogin,
      clientCount: stats.total,
      stats
    };
  });

  logger.info(`All operators fetched: ${operatorsWithStats.length} operators`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Operatorlar muvaffaqiyatli yuklandi', {
    count: operatorsWithStats.length,
    data: operatorsWithStats
  });
});

/**
 * Bitta operatorni olish
 * GET /api/operators/:id
 */
export const getOperatorById = asyncHandler(async (req, res) => {
  const operatorId = req.params.id;

  // Operator topish yoki yaratish
  let operator = await Operator.findOne({ operatorId }).lean();

  if (!operator) {
    // Agar operator yo'q bo'lsa va valid ID bo'lsa, yaratish
    if (OPERATOR_IDS.includes(operatorId)) {
      operator = await Operator.create({
        operatorId,
        name: generateOperatorName(operatorId),
        password: '1234',
        status: OPERATOR_STATUS.ACTIVE
      });

      logger.info(`Operator created: ${operatorId}`);
    } else {
      throw new NotFoundError(ERROR_MESSAGES.OPERATOR_NOT_FOUND);
    }
  }

  // Operator mijozlarini olish
  const clients = await Client.find({ operatorRaqam: operatorId }).sort({ createdAt: -1 }).lean();

  // Statistika hisoblash
  const stats = {
    total: clients.length,
    approved: clients.filter((c) => c.status === 'Tasdiqlangan').length,
    pending: clients.filter((c) => c.status === 'Jarayonda').length,
    rejected: clients.filter((c) => c.status === 'Rad etilgan').length,
    totalAmount: clients.reduce((sum, c) => sum + c.summa, 0)
  };

  logger.info(`Operator fetched: ${operatorId}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Operator topildi', {
    operator: {
      id: operator.operatorId,
      name: operator.name,
      status: operator.status,
      lastLogin: operator.lastLogin
    },
    stats,
    clients
  });
});

/**
 * Operatorni yangilash
 * PUT /api/operators/:id
 */
export const updateOperator = asyncHandler(async (req, res) => {
  const operatorId = req.params.id;
  const { name, status } = req.body;

  let operator = await Operator.findOne({ operatorId });

  if (!operator) {
    throw new NotFoundError(ERROR_MESSAGES.OPERATOR_NOT_FOUND);
  }

  // Update
  if (name) operator.name = name;
  if (status) operator.status = status;

  await operator.save();

  logger.info(`Operator updated: ${operatorId}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.OPERATOR_UPDATED, {
    id: operator.operatorId,
    name: operator.name,
    status: operator.status
  });
});

/**
 * Top operatorlarni olish (Optimized)
 * GET /api/operators/top
 */
export const getTopOperators = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  // 1. Barcha operatorlarni olish
  const operators = await Operator.find().sort({ operatorId: 1 }).lean();

  // 2. Aggregation bilan statistika (bir marta query)
  const clientStats = await Client.getAllOperatorsStats();

  // 3. Map yaratish
  const statsMap = new Map();
  clientStats.forEach((stat) => {
    statsMap.set(stat._id, stat);
  });

  // 4. Operatorlarga stats qo'shish
  const operatorsWithStats = operators.map((operator) => {
    const stats = statsMap.get(operator.operatorId) || {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      totalAmount: 0
    };

    return {
      id: operator.operatorId,
      name: operator.name,
      status: operator.status,
      stats
    };
  });

  // 5. Saralash va limit
  operatorsWithStats.sort((a, b) => {
    // Birinchi approved bo'yicha
    if (b.stats.approved !== a.stats.approved) {
      return b.stats.approved - a.stats.approved;
    }
    // Keyin total bo'yicha
    if (b.stats.total !== a.stats.total) {
      return b.stats.total - a.stats.total;
    }
    // Keyin totalAmount bo'yicha
    if (b.stats.totalAmount !== a.stats.totalAmount) {
      return b.stats.totalAmount - a.stats.totalAmount;
    }
    // Oxirida ID bo'yicha
    return parseInt(a.id) - parseInt(b.id);
  });

  const topOperators = operatorsWithStats.slice(0, limit);

  logger.info(`Top ${limit} operators fetched`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Top operatorlar yuklandi', topOperators);
});

/**
 * Operator performance report
 * GET /api/operators/:id/performance
 */
export const getOperatorPerformance = asyncHandler(async (req, res) => {
  const operatorId = req.params.id;
  const { startDate, endDate } = req.query;

  const operator = await Operator.findOne({ operatorId });

  if (!operator) {
    throw new NotFoundError(ERROR_MESSAGES.OPERATOR_NOT_FOUND);
  }

  // Date range filter
  const matchStage = {
    operatorRaqam: operatorId,
    deleted: false
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // Aggregation for detailed performance
  const performance = await Client.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'Tasdiqlangan'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'Jarayonda'] }, 1, 0] }
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'Rad etilgan'] }, 1, 0] }
        },
        totalAmount: { $sum: '$summa' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  // Overall stats
  const overallStats = performance.reduce(
    (acc, day) => ({
      totalClients: acc.totalClients + day.count,
      totalApproved: acc.totalApproved + day.approved,
      totalPending: acc.totalPending + day.pending,
      totalRejected: acc.totalRejected + day.rejected,
      totalAmount: acc.totalAmount + day.totalAmount
    }),
    { totalClients: 0, totalApproved: 0, totalPending: 0, totalRejected: 0, totalAmount: 0 }
  );

  // Success rate
  const successRate =
    overallStats.totalClients > 0
      ? ((overallStats.totalApproved / overallStats.totalClients) * 100).toFixed(2)
      : 0;

  logger.info(`Performance report generated for operator: ${operatorId}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Performance ma\'lumotlari yuklandi', {
    operator: {
      id: operator.operatorId,
      name: operator.name
    },
    overallStats: {
      ...overallStats,
      successRate: `${successRate}%`
    },
    dailyPerformance: performance
  });
});

/**
 * Operator parolini reset qilish (Admin uchun)
 * POST /api/operators/:id/reset-password
 */
export const resetOperatorPassword = asyncHandler(async (req, res) => {
  const operatorId = req.params.id;
  const { newPassword } = req.body;

  const operator = await Operator.findOne({ operatorId });

  if (!operator) {
    throw new NotFoundError(ERROR_MESSAGES.OPERATOR_NOT_FOUND);
  }

  // Yangi parolni o'rnatish
  operator.password = newPassword || '1234'; // Default yoki yangi parol
  operator.loginAttempts = 0;
  operator.lockUntil = null;

  await operator.save();

  logger.info(`Operator password reset by admin: ${operatorId}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Parol muvaffaqiyatli qayta o\'rnatildi');
});
