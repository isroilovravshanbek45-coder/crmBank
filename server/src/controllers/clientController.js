/**
 * Client Controller — PostgreSQL
 * CRUD, statistika, search, export
 */

import Client from '../models/Client.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { HTTP_STATUS, USER_ROLES, CLIENT_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { sendSuccessResponse, getPaginationParams } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * Barcha mijozlarni olish (Admin)
 * GET /api/clients
 */
export const getAllClients = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status } = req.query;

  const result = await Client.findAll({ page, limit, status });

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Mijozlar ro\'yxati', result);
});

/**
 * Operator mijozlarini olish
 * GET /api/clients/operator
 */
export const getOperatorClients = asyncHandler(async (req, res) => {
  const operatorId = req.user.operatorId;
  const { page, limit } = getPaginationParams(req.query);

  const result = await Client.findByOperator(operatorId, { page, limit });

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Operator mijozlari', result);
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

  // Operator faqat o'z mijozlarini ko'rishi mumkin
  if (req.user.role === USER_ROLES.OPERATOR && client.operatorRaqam !== req.user.operatorId) {
    throw new ForbiddenError('Bu mijozni ko\'rish huquqingiz yo\'q');
  }

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Mijoz topildi', client);
});

/**
 * Yangi mijoz qo'shish
 * POST /api/clients
 */
export const createClient = asyncHandler(async (req, res) => {
  const { ism, familya, telefon, hudud, garov, summa, status, comment } = req.body;
  const operatorId = req.user.operatorId;

  const client = await Client.create({
    ism,
    familya,
    telefon,
    hudud,
    garov,
    summa: parseFloat(summa),
    operatorRaqam: operatorId,
    status: status || CLIENT_STATUS.PENDING,
    comment: comment || ''
  });

  logger.info(`New client created by operator ${operatorId}: ${ism} ${familya}`);

  sendSuccessResponse(res, HTTP_STATUS.CREATED, 'Mijoz muvaffaqiyatli qo\'shildi', client);
});

/**
 * Mijozni yangilash
 * PUT /api/clients/:id
 */
export const updateClient = asyncHandler(async (req, res) => {
  const existingClient = await Client.findById(req.params.id);

  if (!existingClient) {
    throw new NotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Operator faqat o'z mijozlarini o'zgartirishi mumkin
  if (req.user.role === USER_ROLES.OPERATOR && existingClient.operatorRaqam !== req.user.operatorId) {
    throw new ForbiddenError('Bu mijozni o\'zgartirish huquqingiz yo\'q');
  }

  const updatedClient = await Client.update(req.params.id, req.body);

  logger.info(`Client updated: ${req.params.id}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Mijoz muvaffaqiyatli yangilandi', updatedClient);
});

/**
 * Mijozni o'chirish (soft delete)
 * DELETE /api/clients/:id
 */
export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id);

  if (!client) {
    throw new NotFoundError(ERROR_MESSAGES.CLIENT_NOT_FOUND);
  }

  // Operator faqat o'z mijozlarini o'chirishi mumkin
  if (req.user.role === USER_ROLES.OPERATOR && client.operatorRaqam !== req.user.operatorId) {
    throw new ForbiddenError('Bu mijozni o\'chirish huquqingiz yo\'q');
  }

  await Client.softDelete(req.params.id);

  logger.info(`Client soft deleted: ${req.params.id}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Mijoz muvaffaqiyatli o\'chirildi');
});

/**
 * Statistika
 * GET /api/clients/statistics
 */
export const getStatistics = asyncHandler(async (req, res) => {
  const { operatorId } = req.query;

  let stats;

  if (operatorId) {
    stats = await Client.getOperatorStats(operatorId);
  } else {
    stats = await Client.getOverallStats();
  }

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Statistika', stats);
});

/**
 * Search
 * GET /api/clients/search
 */
export const searchClients = asyncHandler(async (req, res) => {
  const { q, operatorId, status, limit } = req.query;

  if (!q || q.trim().length < 2) {
    throw new BadRequestError('Qidiruv so\'zi kamida 2 ta belgidan iborat bo\'lishi kerak');
  }

  const results = await Client.search(q.trim(), {
    operatorId,
    status,
    limit: parseInt(limit) || 20
  });

  sendSuccessResponse(res, HTTP_STATUS.OK, `${results.length} ta natija topildi`, results);
});

/**
 * Bulk update
 * PUT /api/clients/bulk-update
 */
export const bulkUpdateClients = asyncHandler(async (req, res) => {
  const { ids, updateData } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestError('Kamida bitta mijoz ID kerak');
  }

  const updatedCount = await Client.bulkUpdate(ids, updateData);

  logger.info(`Bulk update: ${updatedCount} clients updated`);

  sendSuccessResponse(res, HTTP_STATUS.OK, `${updatedCount} ta mijoz yangilandi`);
});

/**
 * CSV Export
 * GET /api/clients/export/csv
 */
export const exportClientsCSV = asyncHandler(async (req, res) => {
  const result = await Client.findAll({ limit: 10000 });
  const clients = result.data;

  if (clients.length === 0) {
    throw new NotFoundError('Export qilish uchun ma\'lumot yo\'q');
  }

  // CSV headers
  const headers = ['ID', 'Ism', 'Familya', 'Telefon', 'Hudud', 'Garov', 'Summa', 'Operator', 'Status', 'Izoh', 'Yaratilgan sana'];

  // CSV rows — proper escaping
  const escapeCSV = (value) => {
    const str = String(value || '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = clients.map(client => [
    client.id,
    escapeCSV(client.ism),
    escapeCSV(client.familya),
    client.telefon,
    escapeCSV(client.hudud),
    escapeCSV(client.garov),
    client.summa,
    client.operatorRaqam,
    client.status,
    escapeCSV(client.comment),
    client.createdAt ? new Date(client.createdAt).toLocaleString('uz-UZ') : ''
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=mijozlar_${new Date().toISOString().split('T')[0]}.csv`);
  res.send('\uFEFF' + csv); // BOM for Excel UTF-8
});
