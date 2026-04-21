/**
 * Validation Middleware
 * Express-validator xatolarini ushlash
 */

import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Validatsiya xatolarini tekshirish
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));

    throw new ValidationError(formattedErrors);
  }

  next();
};
