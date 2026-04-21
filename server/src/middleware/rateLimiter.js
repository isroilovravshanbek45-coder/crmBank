/**
 * Rate Limiting Middleware
 * Brute-force hujumlardan himoya
 */

import rateLimit from 'express-rate-limit';
import { RATE_LIMIT } from '../config/constants.js';

/**
 * Rate limiting yoqilganligini tekshirish
 * Development'da o'chirilgan bo'lishi mumkin
 */
const isRateLimitEnabled = () => {
  return process.env.ENABLE_RATE_LIMIT === 'true' || process.env.NODE_ENV === 'production';
};

/**
 * Login endpoint uchun rate limiter
 * 15 daqiqada 5 ta urinish
 */
export const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT.LOGIN_WINDOW_MS,
  max: RATE_LIMIT.LOGIN_MAX_ATTEMPTS,
  message: {
    success: false,
    message: 'Juda ko\'p urinish. Iltimos, 15 daqiqadan keyin qayta urinib ko\'ring.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // IP dan track qilish
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Development'da skip qilish
  skip: () => !isRateLimitEnabled()
});

/**
 * Umumiy API rate limiter
 * 15 daqiqada 100 ta request
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.API_WINDOW_MS,
  max: RATE_LIMIT.API_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Juda ko\'p so\'rov yuborildi. Iltimos, biroz kuting.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  // Development'da skip qilish
  skip: () => !isRateLimitEnabled()
});

/**
 * Qat'iy rate limiter (sensitive operations uchun)
 * 15 daqiqada 10 ta request
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Bu amaliyot uchun juda ko\'p so\'rov. Iltimos, keyinroq urinib ko\'ring.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
