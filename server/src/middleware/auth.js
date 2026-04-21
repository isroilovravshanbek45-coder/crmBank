/**
 * Authentication Middleware
 * JWT token verification va role-based access control
 */

import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { ERROR_MESSAGES, USER_ROLES } from '../config/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import logger from '../config/logger.js';

/**
 * Token'ni extract qilish
 * Cookie yoki Authorization header'dan oladi (dual support)
 */
const extractToken = (req) => {
  // 1. Cookie'dan token olishga harakat qilish (HTTP-Only cookie uchun)
  if (req.cookies && req.cookies.token) {
    logger.debug('Token extracted from cookie');
    return req.cookies.token;
  }

  // 2. Authorization header'dan token olish (localStorage uchun)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_MISSING);
  }

  logger.debug('Token extracted from Authorization header');
  return authHeader.split(' ')[1];
};

/**
 * Token'ni verify qilish
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('JWT verification failed:', error);
    throw new UnauthorizedError(ERROR_MESSAGES.TOKEN_INVALID);
  }
};

/**
 * Base authentication middleware
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  const decoded = verifyToken(token);

  req.user = decoded;
  next();
});

/**
 * Operator autentifikatsiyasi
 */
export const authenticateOperator = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  const decoded = verifyToken(token);

  // Debug logging
  logger.info('Operator auth attempt:', {
    hasToken: !!token,
    decodedRole: decoded.role,
    expectedRole: USER_ROLES.OPERATOR,
    operatorId: decoded.operatorId
  });

  if (decoded.role !== USER_ROLES.OPERATOR) {
    throw new ForbiddenError(ERROR_MESSAGES.OPERATOR_ONLY);
  }

  req.user = decoded;
  next();
});

/**
 * Admin autentifikatsiyasi
 */
export const authenticateAdmin = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  const decoded = verifyToken(token);

  if (decoded.role !== USER_ROLES.ADMIN) {
    throw new ForbiddenError(ERROR_MESSAGES.ADMIN_ONLY);
  }

  req.user = decoded;
  next();
});

/**
 * Operator yoki Admin (ikkalasi ham kirishi mumkin)
 */
export const authenticateUser = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  const decoded = verifyToken(token);

  req.user = decoded;
  next();
});
