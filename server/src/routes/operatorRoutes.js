/**
 * Operator Routes
 * Operatorlar uchun endpoint'lar
 */

import express from 'express';
import {
  getAllOperators,
  getOperatorById,
  updateOperator,
  getTopOperators,
  getOperatorPerformance,
  resetOperatorPassword
} from '../controllers/operatorController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// API limiter
router.use(apiLimiter);

// ===== SHARED ROUTES (Operator & Admin) =====

/**
 * @route   GET /api/operators
 * @desc    Barcha operatorlarni olish
 * @access  Private (Operator & Admin)
 */
router.get('/', authenticateUser, getAllOperators);

/**
 * @route   GET /api/operators/top
 * @desc    Top operatorlarni olish
 * @access  Private (Operator & Admin)
 */
router.get('/top', authenticateUser, getTopOperators);

/**
 * @route   GET /api/operators/:id
 * @desc    Bitta operatorni olish
 * @access  Private (Operator & Admin)
 */
router.get('/:id', authenticateUser, getOperatorById);

/**
 * @route   GET /api/operators/:id/performance
 * @desc    Operator performance hisoboti
 * @access  Private (Operator & Admin)
 */
router.get('/:id/performance', authenticateUser, getOperatorPerformance);

// ===== ADMIN ONLY ROUTES =====

/**
 * @route   PUT /api/operators/:id
 * @desc    Operatorni yangilash
 * @access  Private (Admin)
 */
router.put('/:id', authenticateAdmin, updateOperator);

/**
 * @route   POST /api/operators/:id/reset-password
 * @desc    Operator parolini reset qilish
 * @access  Private (Admin)
 */
router.post('/:id/reset-password', authenticateAdmin, resetOperatorPassword);

export default router;
