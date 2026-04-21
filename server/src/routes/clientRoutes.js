/**
 * Client Routes
 * Mijozlar uchun endpoint'lar
 */

import express from 'express';
import {
  getAllClients,
  getOperatorClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  restoreClient,
  searchClients,
  getStatistics,
  bulkUpdateClients,
  exportClients
} from '../controllers/clientController.js';
import {
  createClientValidation,
  updateClientValidation,
  queryValidation
} from '../validators/clientValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticateOperator, authenticateAdmin, authenticateUser } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// API limiter barcha route'larga qo'llash
router.use(apiLimiter);

// ===== SPECIFIC ROUTES (yuqorida bo'lishi kerak) =====

/**
 * @route   GET /api/clients/operator
 * @desc    Operator mijozlari (pagination bilan)
 * @access  Private (Operator)
 */
router.get('/operator', authenticateOperator, queryValidation, validate, getOperatorClients);

/**
 * @route   GET /api/clients/search
 * @desc    Mijozlarni qidirish
 * @access  Private (Operator & Admin)
 */
router.get('/search', authenticateUser, searchClients);

/**
 * @route   GET /api/clients/statistics
 * @desc    Statistika olish
 * @access  Private (Operator & Admin)
 */
router.get('/statistics', authenticateUser, getStatistics);

/**
 * @route   GET /api/clients/export
 * @desc    Mijozlarni export qilish (CSV/JSON)
 * @access  Private (Admin)
 */
router.get('/export', authenticateAdmin, exportClients);

/**
 * @route   PATCH /api/clients/bulk-update
 * @desc    Ko'p mijozlarni bir vaqtda yangilash
 * @access  Private (Admin)
 */
router.patch('/bulk-update', authenticateAdmin, bulkUpdateClients);

/**
 * @route   POST /api/clients/:id/restore
 * @desc    O'chirilgan mijozni tiklash
 * @access  Private (Admin)
 */
router.post('/:id/restore', authenticateAdmin, restoreClient);

// ===== OPERATOR ROUTES =====

/**
 * @route   POST /api/clients
 * @desc    Yangi mijoz qo'shish
 * @access  Private (Operator)
 */
router.post('/', authenticateOperator, createClientValidation, validate, createClient);

// ===== ADMIN ROUTES =====

/**
 * @route   GET /api/clients
 * @desc    Barcha mijozlarni olish (pagination bilan)
 * @access  Private (Admin)
 */
router.get('/', authenticateAdmin, queryValidation, validate, getAllClients);

// ===== DYNAMIC ROUTES (oxirida bo'lishi kerak) =====

/**
 * @route   GET /api/clients/:id
 * @desc    Bitta mijozni olish
 * @access  Private (Operator & Admin)
 */
router.get('/:id', authenticateUser, getClientById);

/**
 * @route   PUT /api/clients/:id
 * @desc    Mijozni yangilash
 * @access  Private (Operator & Admin)
 */
router.put('/:id', authenticateUser, updateClientValidation, validate, updateClient);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Mijozni o'chirish (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateAdmin, deleteClient);

export default router;
