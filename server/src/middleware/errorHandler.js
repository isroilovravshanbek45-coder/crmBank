/**
 * Error Handler Middleware — PostgreSQL
 */

import logger from '../config/logger.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * PostgreSQL xatolarini formatlash
 */
const handlePostgresError = (err) => {
  // Duplicate key
  if (err.code === '23505') {
    const detail = err.detail || '';
    const field = detail.match(/\((.+?)\)/)?.[1] || 'field';
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: `${field} allaqachon mavjud`
    };
  }

  // Foreign key violation
  if (err.code === '23503') {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Bog\'liq ma\'lumot topilmadi'
    };
  }

  // Check constraint violation
  if (err.code === '23514') {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Noto\'g\'ri qiymat kiritildi'
    };
  }

  // Not null violation
  if (err.code === '23502') {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: `${err.column || 'Field'} majburiy`
    };
  }

  return null;
};

/**
 * JWT xatolarini formatlash
 */
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: 'Token noto\'g\'ri'
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message: 'Token muddati tugagan'
    };
  }

  return null;
};

/**
 * Validation xatolarini formatlash
 */
const handleValidationError = (err) => {
  if (err.type === 'entity.parse.failed') {
    return {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message: 'Noto\'g\'ri JSON format'
    };
  }

  return null;
};

/**
 * Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  let message = err.message || 'Ichki server xatosi';
  let stack = err.stack;

  // PostgreSQL xatosi
  const pgError = handlePostgresError(err);
  if (pgError) {
    statusCode = pgError.statusCode;
    message = pgError.message;
  }

  // JWT xatosi
  const jwtError = handleJWTError(err);
  if (jwtError) {
    statusCode = jwtError.statusCode;
    message = jwtError.message;
  }

  // Validation xatosi
  const validationError = handleValidationError(err);
  if (validationError) {
    statusCode = validationError.statusCode;
    message = validationError.message;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${message}`, {
      path: req.path,
      method: req.method,
      stack: stack
    });
  } else {
    logger.warn(`[${statusCode}] ${message}`, {
      path: req.path,
      method: req.method
    });
  }

  // Response
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: stack
    })
  };

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);

  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route topilmadi: ${req.method} ${req.originalUrl}`
  });
};
