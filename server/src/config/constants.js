/**
 * Application Constants
 * Barcha hardcoded qiymatlar shu yerda
 */

// Operator ID range
export const OPERATOR_IDS = ['401', '402', '403', '404', '405', '406', '407', '408', '409', '410'];

// Status values
export const CLIENT_STATUS = {
  PENDING: 'Jarayonda',
  APPROVED: 'Tasdiqlangan',
  REJECTED: 'Rad etilgan'
};

export const OPERATOR_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// User roles
export const USER_ROLES = {
  OPERATOR: 'operator',
  ADMIN: 'admin'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// JWT settings
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '7d',
  REFRESH_TOKEN_EXPIRY: '30d'
};

// Rate limiting
export const RATE_LIMIT = {
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  LOGIN_MAX_ATTEMPTS: 5,
  API_WINDOW_MS: 15 * 60 * 1000,
  API_MAX_REQUESTS: 100
};

// Validation constraints
export const VALIDATION = {
  PHONE_REGEX: /^\+998[0-9]{9}$/,
  MIN_AMOUNT: 1000000, // 1 million
  MAX_AMOUNT: 1000000000, // 1 billion
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 4,
  MAX_COMMENT_LENGTH: 500
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// Error messages
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Login yoki parol xato',
  TOKEN_MISSING: 'Token topilmadi. Iltimos tizimga kiring',
  TOKEN_INVALID: 'Token noto\'g\'ri yoki muddati o\'tgan',
  UNAUTHORIZED: 'Ruxsat yo\'q',
  ADMIN_ONLY: 'Faqat adminlar uchun',
  OPERATOR_ONLY: 'Faqat operatorlar uchun',

  // Client
  CLIENT_NOT_FOUND: 'Mijoz topilmadi',
  CLIENT_ACCESS_DENIED: 'Bu mijozni ko\'rish huquqi yo\'q',
  CLIENT_CREATE_ERROR: 'Mijoz qo\'shishda xatolik',
  CLIENT_UPDATE_ERROR: 'Mijozni yangilashda xatolik',
  CLIENT_DELETE_ERROR: 'Mijozni o\'chirishda xatolik',

  // Operator
  OPERATOR_NOT_FOUND: 'Operator topilmadi',
  OPERATOR_LOAD_ERROR: 'Operatorlarni yuklashda xatolik',

  // Validation
  INVALID_PHONE: 'Telefon raqami noto\'g\'ri formatda (+998XXXXXXXXX)',
  INVALID_AMOUNT: `Summa ${(VALIDATION.MIN_AMOUNT / 1000000).toFixed(0)}M dan ${(VALIDATION.MAX_AMOUNT / 1000000).toFixed(0)}M gacha bo\'lishi kerak`,
  REQUIRED_FIELD: 'Bu maydon majburiy',

  // General
  SERVER_ERROR: 'Server xatosi',
  DATABASE_ERROR: 'Ma\'lumotlar bazasi xatosi',
  VALIDATION_ERROR: 'Validatsiya xatosi'
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Muvaffaqiyatli kirildi',
  CLIENT_CREATED: 'Mijoz muvaffaqiyatli qo\'shildi',
  CLIENT_UPDATED: 'Mijoz muvaffaqiyatli yangilandi',
  CLIENT_DELETED: 'Mijoz muvaffaqiyatli o\'chirildi',
  OPERATOR_UPDATED: 'Operator muvaffaqiyatli yangilandi'
};
