/**
 * Authentication Validation Rules
 */

import { body } from 'express-validator';
import { VALIDATION } from '../config/constants.js';

/**
 * Login validatsiyasi
 */
export const loginValidation = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Login majburiy')
    .isLength({ min: 2, max: 50 })
    .withMessage('Login uzunligi 2 dan 50 gacha bo\'lishi kerak'),

  body('password')
    .notEmpty()
    .withMessage('Parol majburiy')
    .isLength({ min: VALIDATION.MIN_PASSWORD_LENGTH })
    .withMessage(`Parol kamida ${VALIDATION.MIN_PASSWORD_LENGTH} ta belgidan iborat bo'lishi kerak`)
];
