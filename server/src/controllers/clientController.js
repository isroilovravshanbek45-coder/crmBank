/**
 * Client Controller
 * Mijozlarni boshqarish logic'i (Optimized with Pagination & Aggregation)
 */

import Client from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  USER_ROLES
} from '../config/constants.js';
import {
  sendSuccessResponse,
  getPaginationParams,
  createPaginationResponse,
  buildFilterQuery,
  getSortParams,
  calculateClientStats
} from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Barcha mijozlarni olish (Admin uchun) - Pagination bilan
 * GET /api/clients
 */
export const getAllClients = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filterQuery = buildFilterQuery(req.query);
  const sortParams = getSortParams(req.query.sortBy, req.query.order);

  // Total count
  const total = await Client.countDocuments(filterQuery);

  // Clients with pagination
  const clients = await Client.find(filterQuery)
    .sort(sortParams)
    .skip(skip)
    .limit(limit)
    .lean();

  logger.info(`Admin fetched ${clients.length} clients (page ${page})`);

  const response = createPaginationResponse(clients, page, limit, total);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Mijozlar muvaffaqiyatli yuklandi', response);
});

/**
 * Operator mijozlarini olish - Pagination bilan
 * GET /api/clients/operator
 */
export const getOperatorClients = asyncHandler(async (req, res) => {
  const operatorId = req.user.operatorId;
  const { page, limit, skip } = getPaginationParams(req.query);

  const filterQuery = {
    ...buildFilterQuery(req.query),
    operatorRaqam: operatorId
  };

  const sortParams = getSortParams(req.query.sortBy, req.query.order);

  // Total count
  const total = await Client.countDocuments(filterQuery);

  // Clients with pagination
  const clients = await Client.find(filterQuery)
    .sort(sortParams)
    .skip(skip)
    .limit(limit)
    .lean();

  logger.info(`Operator ${operatorId} fetched ${clients.length} clients (page ${page})`);

  const response = createPaginationResponse(clients, page, limit, total);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Mijozlar muvaffaqiyatli yuklandi', response);
});

/**
 * Bitta mijozni olish
 * GET /api/clients/:id
 */
export const getClientById = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new NotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Agar operator bo'lsa, faqat o'z mijozini ko'ra oladi
  if (req.user.role === USER_ROLES.OPERATOR && client.operatorRaqam !== req.user.operatorId) {
    throw new ForbiddenError(ERROR_MESSAGES.CLIENT_ACCESS_DENIED);
  }

  logger.info(`Client fetched: ${client._id} by ${req.user.role}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Mijoz topildi', client);
});

/**
 * Yangi mijoz qo'shish
 * POST /api/clients
 */
export const createClient = asyncHandler(async (req, res) => {
  const { ism, familya, telefon, hudud, garov, summa, status, comment } = req.body;

  // Operator faqat o'ziga mijoz qo'sha oladi
  const operatorRaqam = req.user.operatorId;

  const client = await Client.create({
    ism,
    familya,
    telefon,
    hudud,
    garov,
    summa,
    operatorRaqam,
    status,
    comment
  });

  logger.info(`New client created: ${client._id} by operator ${operatorRaqam}`);

  sendSuccessResponse(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.CLIENT_CREATED, client);
});

/**
 * Mijozni yangilash
 * PUT /api/clients/:id
 */
export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new NotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Operator faqat o'z mijozini tahrirlashi mumkin
  if (req.user.role === USER_ROLES.OPERATOR && client.operatorRaqam !== req.user.operatorId) {
    throw new ForbiddenError(ERROR_MESSAGES.CLIENT_ACCESS_DENIED);
  }

  const { ism, familya, telefon, hudud, garov, summa, status, comment } = req.body;

  // Yangilash
  const updatedClient = await Client.findByIdAndUpdate(
    req.params.id,
    {
      ism,
      familya,
      telefon,
      hudud,
      garov,
      summa,
      status,
      comment
    },
    { new: true, runValidators: true }
  );

  logger.info(`Client updated: ${client._id} by ${req.user.role}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.CLIENT_UPDATED, updatedClient);
});

/**
 * Mijozni o'chirish (Soft Delete)
 * DELETE /api/clients/:id
 */
export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new NotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Soft delete
  await client.softDelete();

  logger.info(`Client soft deleted: ${client._id} by admin`);

  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.CLIENT_DELETED);
});

/**
 * Mijozni tiklash (Restore)
 * POST /api/clients/:id/restore
 */
export const restoreClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, deleted: true });

  if (!client) {
    throw new NotFoundError('O\'chirilgan mijoz topilmadi');
  }

  await client.restore();

  logger.info(`Client restored: ${client._id} by admin`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Mijoz muvaffaqiyatli tiklandi', client);
});

/**
 * Mijozlarni qidirish
 * GET /api/clients/search
 */
export const searchClients = asyncHandler(async (req, res) => {
  const { q: searchTerm, status, operatorRaqam } = req.query;

  if (!searchTerm || searchTerm.length < 2) {
    throw new Error('Qidiruv uchun kamida 2 ta belgi kiriting');
  }

  const options = {
    status,
    limit: 20
  };

  // Operator faqat o'z mijozlarini qidirishi mumkin
  if (req.user.role === USER_ROLES.OPERATOR) {
    options.operatorId = req.user.operatorId;
  } else if (operatorRaqam) {
    options.operatorId = operatorRaqam;
  }

  const clients = await Client.searchClients(searchTerm, options);

  logger.info(`Search performed: "${searchTerm}" - ${clients.length} results`);

  sendSuccessResponse(res, HTTP_STATUS.OK, `${clients.length} ta natija topildi`, clients);
});

/**
 * Statistika olish (Optimized with Aggregation)
 * GET /api/clients/statistics
 */
export const getStatistics = asyncHandler(async (req, res) => {
  const { operatorId, period } = req.query;

  let matchStage = { deleted: false };

  // Agar operator bo'lsa, faqat o'z statistikasini ko'radi
  if (req.user.role === USER_ROLES.OPERATOR) {
    matchStage.operatorRaqam = req.user.operatorId;
  } else if (operatorId && operatorId !== 'all') {
    matchStage.operatorRaqam = operatorId;
  }

  // Vaqt filtri
  if (period) {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    if (startDate) {
      matchStage.createdAt = { $gte: startDate };
    }
  }

  // Aggregation pipeline
  const stats = await Client.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalClients: { $sum: 1 },
        totalAmount: { $sum: '$summa' },
        approved: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Tasdiqlangan'] }, 1, 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Jarayonda'] }, 1, 0]
          }
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Rad etilgan'] }, 1, 0]
          }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalClients: 0,
    totalAmount: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  };

  logger.info(`Statistics fetched by ${req.user.role}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Statistika yuklandi', result);
});

/**
 * Bulk update (Admin uchun)
 * PATCH /api/clients/bulk-update
 */
export const bulkUpdateClients = asyncHandler(async (req, res) => {
  const { ids, updateData } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error('Mijozlar ID ro\'yxati majburiy');
  }

  const result = await Client.updateMany(
    { _id: { $in: ids } },
    { $set: updateData },
    { runValidators: true }
  );

  logger.info(`Bulk update performed: ${result.modifiedCount} clients updated`);

  sendSuccessResponse(res, HTTP_STATUS.OK, `${result.modifiedCount} ta mijoz yangilandi`, {
    modifiedCount: result.modifiedCount
  });
});

/**
 * Export data (CSV/JSON)
 * GET /api/clients/export
 */
export const exportClients = asyncHandler(async (req, res) => {
  const { format = 'json', operatorId } = req.query;

  let query = { deleted: false };

  if (operatorId) {
    query.operatorRaqam = operatorId;
  }

  const clients = await Client.find(query).lean();

  if (format === 'csv') {
    // CSV format
    const csv = convertToCSV(clients);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
    res.send(csv);
  } else {
    // JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=clients.json');
    sendSuccessResponse(res, HTTP_STATUS.OK, 'Ma\'lumotlar export qilindi', clients);
  }

  logger.info(`Data exported in ${format} format: ${clients.length} clients`);
});

/**
 * Helper: Convert to CSV
 */
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = ['ID', 'Ism', 'Familya', 'Telefon', 'Hudud', 'Garov', 'Summa', 'Status', 'Operator', 'Sana'];
  const rows = data.map((client) => [
    client._id,
    client.ism,
    client.familya,
    client.telefon,
    client.hudud,
    client.garov,
    client.summa,
    client.status,
    client.operatorRaqam,
    new Date(client.createdAt).toLocaleString('uz-UZ')
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}
