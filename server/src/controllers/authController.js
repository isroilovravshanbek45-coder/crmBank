/**
 * Auth Controller — PostgreSQL
 * Authentication va authorization logic
 */

import jwt from 'jsonwebtoken';
import Operator from '../models/Operator.js';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES,
  JWT_CONFIG,
  HTTP_STATUS,
  OPERATOR_IDS
} from '../config/constants.js';
import { sendSuccessResponse } from '../utils/helpers.js';
import logger from '../config/logger.js';

/**
 * JWT token yaratish
 */
const generateToken = (payload, expiresIn = JWT_CONFIG.ACCESS_TOKEN_EXPIRY) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Operator login
 * POST /api/auth/operator/login
 */
export const operatorLogin = asyncHandler(async (req, res) => {
  const { login, password } = req.body;

  // Operator ID validate
  if (!OPERATOR_IDS.includes(login)) {
    logger.warn(`Invalid operator login attempt: ${login}`);
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Operator'ni topish (parol bilan)
  let operator = await Operator.findByOperatorId(login, true);

  // Agar operator mavjud bo'lmasa, default parol bilan yaratish
  if (!operator) {
    await Operator.create({
      operatorId: login,
      name: `Operator ${login}`,
      password: '1234'
    });

    logger.info(`New operator created: ${login}`);
    operator = await Operator.findByOperatorId(login, true);
  }

  // Operator locked bo'lsa
  if (Operator.isLocked(operator)) {
    const remainingTime = Math.ceil((new Date(operator.lock_until) - Date.now()) / 60000);
    throw new ForbiddenError(
      `Hisob bloklangan. ${remainingTime} daqiqadan keyin qayta urinib ko'ring.`
    );
  }

  // Parolni tekshirish
  const isPasswordCorrect = await Operator.comparePassword(password, operator.password);

  if (!isPasswordCorrect) {
    await Operator.onLoginFailure(operator.id, operator.login_attempts);
    logger.warn(`Failed login attempt for operator: ${login}`);
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Login muvaffaqiyatli
  await Operator.onLoginSuccess(operator.id);

  // Token yaratish
  const token = generateToken({
    operatorId: operator.operator_id,
    role: USER_ROLES.OPERATOR
  });

  logger.info(`Operator logged in successfully: ${login}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
    token,
    user: {
      operatorId: operator.operator_id,
      name: operator.name,
      role: USER_ROLES.OPERATOR
    }
  });
});

/**
 * Admin login
 * POST /api/auth/admin/login
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { login, password } = req.body;

  // Admin'ni topish
  let admin = await Admin.findByUsername(login, true);

  // Agar admin yo'q bo'lsa, environment variable'dan tekshirish
  if (!admin) {
    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;

    if (login.toLowerCase() === envUsername?.toLowerCase() && password === envPassword) {
      admin = await Admin.create({
        username: envUsername,
        password: envPassword,
        fullName: envUsername,
        status: 'active'
      });

      logger.info(`Admin migrated from .env to database: ${envUsername}`);
      admin = await Admin.findByUsername(envUsername, true);
    } else {
      logger.warn(`Invalid admin login attempt: ${login}`);
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
  }

  // Admin locked bo'lsa
  if (Admin.isLocked(admin)) {
    const remainingTime = Math.ceil((new Date(admin.lock_until) - Date.now()) / 60000);
    throw new ForbiddenError(
      `Hisob bloklangan. ${remainingTime} daqiqadan keyin qayta urinib ko'ring.`
    );
  }

  // Parolni tekshirish
  const isPasswordCorrect = await Admin.comparePassword(password, admin.password);

  if (!isPasswordCorrect) {
    await Admin.onLoginFailure(admin.id, admin.login_attempts);
    logger.warn(`Failed login attempt for admin: ${login}`);
    throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Login muvaffaqiyatli
  await Admin.onLoginSuccess(admin.id);

  // Token yaratish
  const token = generateToken({
    username: admin.username,
    role: USER_ROLES.ADMIN
  });

  logger.info(`Admin logged in successfully: ${login}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
    token,
    user: {
      username: admin.username,
      fullName: admin.full_name,
      role: USER_ROLES.ADMIN
    }
  });
});

/**
 * Token tekshirish
 * GET /api/auth/verify
 */
export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_MISSING);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    sendSuccessResponse(res, HTTP_STATUS.OK, 'Token valid', {
      user: decoded
    });
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_INVALID);
  }
});

/**
 * Parolni o'zgartirish (Operator)
 * PUT /api/auth/operator/change-password
 */
export const changeOperatorPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const operatorId = req.user.operatorId;

  const operator = await Operator.findByOperatorId(operatorId, true);

  if (!operator) {
    throw new UnauthorizedError('Operator topilmadi');
  }

  const isPasswordCorrect = await Operator.comparePassword(currentPassword, operator.password);

  if (!isPasswordCorrect) {
    throw new UnauthorizedError('Joriy parol noto\'g\'ri');
  }

  await Operator.updatePassword(operatorId, newPassword);

  logger.info(`Operator changed password: ${operatorId}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Parol muvaffaqiyatli o\'zgartirildi');
});

/**
 * Parolni o'zgartirish (Admin)
 * PUT /api/auth/admin/change-password
 */
export const changeAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const username = req.user.username;

  const admin = await Admin.findByUsername(username, true);

  if (!admin) {
    throw new UnauthorizedError('Admin topilmadi');
  }

  const isPasswordCorrect = await Admin.comparePassword(currentPassword, admin.password);

  if (!isPasswordCorrect) {
    throw new UnauthorizedError('Joriy parol noto\'g\'ri');
  }

  await Admin.updatePassword(admin.id, newPassword);

  logger.info(`Admin changed password: ${username}`);

  sendSuccessResponse(res, HTTP_STATUS.OK, 'Parol muvaffaqiyatli o\'zgartirildi');
});
