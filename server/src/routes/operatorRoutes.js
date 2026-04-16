import express from 'express';
import {
  getAllOperators,
  getOperatorById,
  updateOperator,
  getTopOperators
} from '../controllers/operatorController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// GET /api/operators - Barcha operatorlar
router.get('/', authenticateUser, getAllOperators);

// GET /api/operators/top - Top operatorlar
router.get('/top', authenticateUser, getTopOperators);

// GET /api/operators/:id - Bitta operator
router.get('/:id', authenticateUser, getOperatorById);

// PUT /api/operators/:id - Operatorni yangilash (Admin uchun)
router.put('/:id', authenticateAdmin, updateOperator);

export default router;
