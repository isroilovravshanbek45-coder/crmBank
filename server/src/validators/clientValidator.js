/**
 * Client Validation Rules
 * Express-validator bilan to'liq validatsiya
 */

import { body, query } from 'express-validator';
import { VALIDATION, CLIENT_STATUS } from '../config/constants.js';

/**
 * Mijoz yaratish validatsiyasi
 */
export const createClientValidation = [
  body('ism')
    .trim()
    .notEmpty()
    .withMessage('Ism majburiy')
    .isLength({ min: VALIDATION.MIN_NAME_LENGTH, max: VALIDATION.MAX_NAME_LENGTH })
    .withMessage(`Ism uzunligi ${VALIDATION.MIN_NAME_LENGTH} dan ${VALIDATION.MAX_NAME_LENGTH} gacha bo'lishi kerak`)
    // XSS protection via xss-clean middleware
    .customSanitizer(value => value.replace(/<[^>]*>/g, '')), // Remove HTML tags

  body('familya')
    .trim()
    .notEmpty()
    .withMessage('Familya majburiy')
    .isLength({ min: VALIDATION.MIN_NAME_LENGTH, max: VALIDATION.MAX_NAME_LENGTH })
    .withMessage(`Familya uzunligi ${VALIDATION.MIN_NAME_LENGTH} dan ${VALIDATION.MAX_NAME_LENGTH} gacha bo'lishi kerak`)
    // XSS protection via xss-clean middleware
    .customSanitizer(value => value.replace(/<[^>]*>/g, '')), // Remove HTML tags

  body('telefon')
    .trim()
    .notEmpty()
    .withMessage('Telefon majburiy')
    .matches(VALIDATION.PHONE_REGEX)
    .withMessage('Telefon raqami noto\'g\'ri formatda (+998XXXXXXXXX)'),

  body('hudud')
    .trim()
    .notEmpty()
    .withMessage('Hudud majburiy')
    .isLength({ min: 2, max: 100 })
    .withMessage('Hudud uzunligi 2 dan 100 gacha bo\'lishi kerak')
    .customSanitizer(value => value.replace(/<[^>]*>/g, '')), // XSS protection

  body('garov')
    .trim()
    .notEmpty()
    .withMessage('Garov majburiy')
    .isLength({ min: 2, max: 200 })
    .withMessage('Garov uzunligi 2 dan 200 gacha bo\'lishi kerak')
    .customSanitizer(value => value.replace(/<[^>]*>/g, '')), // XSS protection

  body('summa')
    .notEmpty()
    .withMessage('Summa majburiy')
    .isNumeric()
    .withMessage('Summa raqam bo\'lishi kerak')
    .isFloat({ min: VALIDATION.MIN_AMOUNT, max: VALIDATION.MAX_AMOUNT })
    .withMessage(
      `Summa ${(VALIDATION.MIN_AMOUNT / 1000000).toFixed(0)}M dan ${(VALIDATION.MAX_AMOUNT / 1000000).toFixed(0)}M gacha bo\'lishi kerak`
    ),

  body('status')
    .optional()
    .isIn(Object.values(CLIENT_STATUS))
    .withMessage(`Status qiymati: ${Object.values(CLIENT_STATUS).join(', ')}`),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.MAX_COMMENT_LENGTH })
    .withMessage(`Izoh uzunligi ${VALIDATION.MAX_COMMENT_LENGTH} belgidan oshmasligi kerak`)
    .customSanitizer(value => value ? value.replace(/<[^>]*>/g, '') : '') // XSS protection
];

/**
 * Mijoz yangilash validatsiyasi
 */
export const updateClientValidation = [
  body('ism')
    .optional()
    .trim()
    .isLength({ min: VALIDATION.MIN_NAME_LENGTH, max: VALIDATION.MAX_NAME_LENGTH })
    .withMessage(`Ism uzunligi ${VALIDATION.MIN_NAME_LENGTH} dan ${VALIDATION.MAX_NAME_LENGTH} gacha bo'lishi kerak`)
    .matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/)
    .withMessage('Ism faqat harflardan iborat bo\'lishi kerak'),

  body('familya')
    .optional()
    .trim()
    .isLength({ min: VALIDATION.MIN_NAME_LENGTH, max: VALIDATION.MAX_NAME_LENGTH })
    .withMessage(`Familya uzunligi ${VALIDATION.MIN_NAME_LENGTH} dan ${VALIDATION.MAX_NAME_LENGTH} gacha bo'lishi kerak`)
    .matches(/^[a-zA-Z\u0400-\u04FF\s'-]+$/)
    .withMessage('Familya faqat harflardan iborat bo\'lishi kerak'),

  body('telefon')
    .optional()
    .trim()
    .matches(VALIDATION.PHONE_REGEX)
    .withMessage('Telefon raqami noto\'g\'ri formatda (+998XXXXXXXXX)'),

  body('hudud')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hudud uzunligi 2 dan 100 gacha bo\'lishi kerak'),

  body('garov')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Garov uzunligi 2 dan 200 gacha bo\'lishi kerak'),

  body('summa')
    .optional()
    .isNumeric()
    .withMessage('Summa raqam bo\'lishi kerak')
    .isFloat({ min: VALIDATION.MIN_AMOUNT, max: VALIDATION.MAX_AMOUNT })
    .withMessage(
      `Summa ${(VALIDATION.MIN_AMOUNT / 1000000).toFixed(0)}M dan ${(VALIDATION.MAX_AMOUNT / 1000000).toFixed(0)}M gacha bo\'lishi kerak`
    ),

  body('status')
    .optional()
    .isIn(Object.values(CLIENT_STATUS))
    .withMessage(`Status qiymati: ${Object.values(CLIENT_STATUS).join(', ')}`),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: VALIDATION.MAX_COMMENT_LENGTH })
    .withMessage(`Izoh uzunligi ${VALIDATION.MAX_COMMENT_LENGTH} belgidan oshmasligi kerak`)
    .customSanitizer(value => value ? value.replace(/<[^>]*>/g, '') : '') // XSS protection
];

/**
 * Query parametrlari validatsiyasi
 */
export const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Sahifa raqami musbat son bo\'lishi kerak'),

  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit 1 dan 100 gacha bo\'lishi kerak'),

  query('status').optional().isIn(Object.values(CLIENT_STATUS)).withMessage('Status qiymati noto\'g\'ri'),

  query('sortBy').optional().isString().withMessage('sortBy string bo\'lishi kerak'),

  query('order').optional().isIn(['asc', 'desc']).withMessage('order asc yoki desc bo\'lishi kerak')
];
