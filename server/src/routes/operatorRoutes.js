/**
 * Operator Routes — PostgreSQL
 */

import express from 'express';
import {
  getAllOperators,
  getOperatorById,
  updateOperator,
  getTopOperators
} from '../controllers/operatorController.js';
import { authenticateAdmin, authenticateAny } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(apiLimiter);

// ===== SHARED ROUTES =====
router.get('/', authenticateAny, getAllOperators);
router.get('/top', authenticateAny, getTopOperators);
router.get('/:id', authenticateAny, getOperatorById);

// ===== ADMIN ONLY =====
router.put('/:id', authenticateAdmin, updateOperator);

export default router;
