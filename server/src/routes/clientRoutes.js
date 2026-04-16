import express from 'express';
import { body } from 'express-validator';
import {
  getAllClients,
  getOperatorClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getStatistics
} from '../controllers/clientController.js';
import { authenticateOperator, authenticateAdmin, authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Validatsiya qoidalari
const clientValidation = [
  body('ism').trim().notEmpty().withMessage('Ism majburiy'),
  body('familya').trim().notEmpty().withMessage('Familya majburiy'),
  body('telefon').trim().notEmpty().withMessage('Telefon majburiy'),
  body('hudud').trim().notEmpty().withMessage('Hudud majburiy'),
  body('garov').trim().notEmpty().withMessage('Garov majburiy'),
  body('summa').isNumeric().withMessage('Summa raqam bo\'lishi kerak')
];

// GET /api/clients - Barcha mijozlar (Admin uchun)
router.get('/', authenticateAdmin, getAllClients);

// GET /api/clients/operator - Operator mijozlari
router.get('/operator', authenticateOperator, getOperatorClients);

// GET /api/clients/statistics - Statistika
router.get('/statistics', authenticateUser, getStatistics);

// GET /api/clients/:id - Bitta mijoz
router.get('/:id', authenticateUser, getClientById);

// POST /api/clients - Yangi mijoz qo'shish
router.post('/', authenticateOperator, clientValidation, createClient);

// PUT /api/clients/:id - Mijozni yangilash
router.put('/:id', authenticateUser, updateClient);

// DELETE /api/clients/:id - Mijozni o'chirish (Admin uchun)
router.delete('/:id', authenticateAdmin, deleteClient);

export default router;
