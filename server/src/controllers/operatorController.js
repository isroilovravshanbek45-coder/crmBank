/**
 * Operator Controller — PostgreSQL
 * CRUD va statistika
 */

import Operator from '../models/Operator.js';
import Client from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { HTTP_STATUS, OPERATOR_IDS, ERROR_MESSAGES } from '../config/constants.js';
import { sendSuccessResponse } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Barcha operatorlarni olish (statistika bilan)
 * GET /api/operators
 */
export const getAllOperators = asyncHandler(async (req, res) => {
  // Barcha operatorlar va ularning statistikasi — bitta query
  const allStats = await Client.getAllOperatorsStats();

  // Operatorlar ma'lumotlari
  const operators = await Operator.findAll();

  // Merge: operator + stats
  const result = operators.map(op => {
    const stats = allStats.find(s => s._id === op.operator_id) || {
      total: 0, approved: 0, pending: 0, rejected: 0, totalAmount: 0
    };

    return {
      id: op.operator_id,
      name: op.name,
      status: op.status,
      lastLogin: op.last_login,
      stats
    };
  });

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Operatorlar ro\'yxati', {
    count: result.length,
    data: result
  });
});

/**
 * Top operatorlar
 * GET /api/operators/top
 */
export const getTopOperators = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  const allStats = await Client.getAllOperatorsStats();
  const operators = await Operator.findAll();

  const result = operators.map(op => {
    const stats = allStats.find(s => s._id === op.operator_id) || {
      total: 0, approved: 0, pending: 0, rejected: 0, totalAmount: 0
    };
    return {
      id: op.operator_id,
      name: op.name,
      stats
    };
  })
  .sort((a, b) => b.stats.approved - a.stats.approved || b.stats.total - a.stats.total)
  .slice(0, limit);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Top operatorlar', result);
});

/**
 * Bitta operatorni olish (mijozlari bilan)
 * GET /api/operators/:id
 */
export const getOperatorById = asyncHandler(async (req, res) => {
  const operatorId = req.params.id;

  // Validatsiya
  if (!OPERATOR_IDS.includes(operatorId)) {
    throw new NotFoundError('Operator topilmadi');
  }

  // Operator topish yoki yaratish
  let operator = await Operator.findByOperatorId(operatorId);
  if (!operator) {
    await Operator.create({
      operatorId,
      name: `Operator ${operatorId}`,
      password: '1234'
    });
    operator = await Operator.findByOperatorId(operatorId);
  }

  // Statistika va mijozlar — parallel query
  const [stats, clientsResult] = await Promise.all([
    Client.getOperatorStats(operatorId),
    Client.findByOperator(operatorId, { limit: 500 })
  ]);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Operator ma\'lumotlari', {
    operator: {
      id: operator.operator_id,
      name: operator.name,
      status: operator.status,
      lastLogin: operator.last_login
    },
    stats,
    clients: clientsResult.data
  });
});

/**
 * Operatorni yangilash
 * PUT /api/operators/:id
 */
export const updateOperator = asyncHandler(async (req, res) => {
  const operatorId = req.params.id;

  const updated = await Operator.update(operatorId, req.body);

  if (!updated) {
    throw new NotFoundError('Operator topilmadi');
  }

  logger.info(`Operator updated: ${operatorId}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Operator muvaffaqiyatli yangilandi', updated);
});
