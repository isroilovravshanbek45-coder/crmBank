/**
 * Global Error Handler Middleware
 * Barcha xatolarni ushlab, to'g'ri format bilan qaytarish
 */

import { AppError, ValidationError } from '../utils/errors.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import logger from '../config/logger.js';

/**
 * Mongoose validation error
 */
const handleMongooseValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message
  }));

  return new ValidationError(errors);
};

/**
 * Mongoose cast error (noto'g'ri ID format)
 */
const handleCastError = (err) => {
  const message = `Noto'g'ri ${err.path}: ${err.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Mongoose duplicate key error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} "${value}" allaqachon mavjud`;

  return new AppError(message, HTTP_STATUS.CONFLICT);
};

/**
 * JWT error
 */
const handleJWTError = () => {
  return new AppError(ERROR_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
};

/**
 * JWT expired error
 */
const handleJWTExpiredError = () => {
  return new AppError('Token muddati tugagan. Iltimos, qayta kiring', HTTP_STATUS.UNAUTHORIZED);
};

/**
 * Development environment error response
 */
const sendErrorDev = (err, res) => {
  logger.error('Error 💥:', {
    status: err.statusCode,
    message: err.message,
    stack: err.stack,
    error: err
  });

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
    ...(err.errors && { errors: err.errors })
  });
};

/**
 * Production environment error response
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    logger.warn('Operational Error:', {
      status: err.statusCode,
      message: err.message
    });

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  } else {
    // Programming or unknown error: don't leak error details
    logger.error('Programming Error 💥:', err);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  // Development environment
  if (process.env.NODE_ENV === 'development') {
    // Handle specific errors
    if (err.name === 'ValidationError') err = handleMongooseValidationError(err);
    if (err.name === 'CastError') err = handleCastError(err);
    if (err.code === 11000) err = handleDuplicateKeyError(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();

    sendErrorDev(err, res);
  } else {
    // Production environment
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.isOperational = err.isOperational;
    error.errors = err.errors;

    // Handle specific errors
    if (error.name === 'ValidationError') error = handleMongooseValidationError(error);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateKeyError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route topilmadi: ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND);
  next(error);
};
