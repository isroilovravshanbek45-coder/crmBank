import express from 'express';
import { operatorLogin, adminLogin, verifyToken } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/operator/login
router.post('/operator/login', operatorLogin);

// POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

// GET /api/auth/verify
router.get('/verify', verifyToken);

export default router;
