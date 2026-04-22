/**
 * Client Routes — PostgreSQL
 */

import express from 'express';
import {
  getAllClients,
  getOperatorClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getStatistics,
  bulkUpdateClients,
  exportClientsCSV
} from '../controllers/clientController.js';
import {
  createClientValidation,
  updateClientValidation,
  queryValidation
} from '../validators/clientValidator.js';
import { validate } from '../middleware/validate.js';
import { authenticateOperator, authenticateAdmin, authenticateAny } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(apiLimiter);

// ===== SPECIFIC ROUTES =====
router.get('/operator', authenticateOperator, getOperatorClients);
router.get('/search', authenticateAny, searchClients);
router.get('/statistics', authenticateAny, getStatistics);
router.get('/export', authenticateAdmin, exportClientsCSV);
router.patch('/bulk-update', authenticateAdmin, bulkUpdateClients);

// ===== OPERATOR ROUTES =====
router.post('/', authenticateOperator, createClientValidation, validate, createClient);

// ===== ADMIN ROUTES =====
router.get('/', authenticateAdmin, getAllClients);

// ===== DYNAMIC ROUTES =====
router.get('/:id', authenticateAny, getClientById);
router.put('/:id', authenticateAny, updateClient);
router.delete('/:id', authenticateAdmin, deleteClient);

export default router;
