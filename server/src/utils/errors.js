/**
 * Custom Error Classes
 * Barcha xatolar uchun custom class'lar
 */

import { HTTP_STATUS } from '../config/constants.js';

/**
 * Base Error Class
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

/**
 * Too Many Requests Error (429)
 */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too Many Requests') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends BadRequestError {
  constructor(errors) {
    super('Validatsiya xatosi');
    this.errors = errors;
  }
}

/**
 * Database Error
 */
export class DatabaseError extends InternalServerError {
  constructor(message = 'Ma\'lumotlar bazasi xatosi') {
    super(message);
  }
}
