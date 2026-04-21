/**
 * Auth Routes
 * Authentication endpoint'lari
 */

import express from 'express';
import {
  operatorLogin,
  adminLogin,
  verifyToken,
  changeOperatorPassword,
  changeAdminPassword
} from '../controllers/authController.js';
import { loginValidation } from '../validators/authValidator.js';
import { validate } from '../middleware/validate.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { authenticateOperator, authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====

/**
 * @route   POST /api/auth/operator/login
 * @desc    Operator login
 * @access  Public
 */
// Development: Rate limiter o'chirilgan (test uchun)
// Production'da loginLimiter'ni qayta yoqing!
router.post('/operator/login', loginValidation, validate, operatorLogin);

/**
 * @route   POST /api/auth/admin/login
 * @desc    Admin login
 * @access  Public
 */
// Development: Rate limiter o'chirilgan (test uchun)
router.post('/admin/login', loginValidation, validate, adminLogin);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Public
 */
router.get('/verify', verifyToken);

// ===== PROTECTED ROUTES =====

/**
 * @route   PUT /api/auth/operator/change-password
 * @desc    Operator parolini o'zgartirish
 * @access  Private (Operator)
 */
router.put('/operator/change-password', authenticateOperator, changeOperatorPassword);

/**
 * @route   PUT /api/auth/admin/change-password
 * @desc    Admin parolini o'zgartirish
 * @access  Private (Admin)
 */
router.put('/admin/change-password', authenticateAdmin, changeAdminPassword);

export default router;
