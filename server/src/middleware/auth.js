/**
 * Auth Middleware — PostgreSQL
 * JWT token tekshirish va role-based access control
 */

import jwt from 'jsonwebtoken';
import Operator from '../models/Operator.js';
import Admin from '../models/Admin.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { ERROR_MESSAGES, USER_ROLES } from '../config/constants.js';

/**
 * Token olish (Header yoki Cookie dan)
 */
const extractToken = (req) => {
  // 1. Authorization header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  // 2. Cookie
  if (req.cookies?.bankCrmToken) {
    return req.cookies.bankCrmToken;
  }

  return null;
};

/**
 * JWT token verify va user attach qilish
 */
const verifyAndAttachUser = async (req) => {
  const token = extractToken(req);

  if (!token) {
    throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_MISSING);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_EXPIRED);
    }
    throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_INVALID);
  }
};

/**
 * Operator autentifikatsiyasi
 */
export const authenticateOperator = async (req, res, next) => {
  try {
    const decoded = await verifyAndAttachUser(req);

    if (decoded.role !== USER_ROLES.OPERATOR) {
      throw new ForbiddenError('Faqat operatorlar uchun');
    }

    // Operator mavjudligini tekshirish
    const operator = await Operator.findByOperatorId(decoded.operatorId);
    if (!operator || operator.status !== 'active') {
      throw new UnauthorizedError('Operator topilmadi yoki bloklangan');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin autentifikatsiyasi
 */
export const authenticateAdmin = async (req, res, next) => {
  try {
    const decoded = await verifyAndAttachUser(req);

    if (decoded.role !== USER_ROLES.ADMIN) {
      throw new ForbiddenError('Faqat adminlar uchun');
    }

    // Admin mavjudligini tekshirish
    const admin = await Admin.findByUsername(decoded.username);
    if (!admin || admin.status !== 'active') {
      throw new UnauthorizedError('Admin topilmadi yoki bloklangan');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Operator yoki Admin autentifikatsiyasi
 */
export const authenticateAny = async (req, res, next) => {
  try {
    const decoded = await verifyAndAttachUser(req);

    if (decoded.role === USER_ROLES.OPERATOR) {
      const operator = await Operator.findByOperatorId(decoded.operatorId);
      if (!operator || operator.status !== 'active') {
        throw new UnauthorizedError('Operator topilmadi yoki bloklangan');
      }
    } else if (decoded.role === USER_ROLES.ADMIN) {
      const admin = await Admin.findByUsername(decoded.username);
      if (!admin || admin.status !== 'active') {
        throw new UnauthorizedError('Admin topilmadi yoki bloklangan');
      }
    } else {
      throw new ForbiddenError('Noma\'lum role');
    }

    next();
  } catch (error) {
    next(error);
  }
};
