/**
 * Helper Utility Functions
 * Takrorlanadigan kodlarni shu yerda jamlash
 */

import { CLIENT_STATUS } from '../config/constants.js';

/**
 * Mijozlar statistikasini hisoblash
 * @param {Array} clients - Mijozlar ro'yxati
 * @returns {Object} Statistika
 */
export const calculateClientStats = (clients) => {
  return {
    total: clients.length,
    approved: clients.filter((c) => c.status === CLIENT_STATUS.APPROVED).length,
    pending: clients.filter((c) => c.status === CLIENT_STATUS.PENDING).length,
    rejected: clients.filter((c) => c.status === CLIENT_STATUS.REJECTED).length,
    totalAmount: clients.reduce((sum, c) => sum + (c.summa || 0), 0)
  };
};

/**
 * Pagination parametrlarini olish
 * @param {Object} query - Request query
 * @returns {Object} page, limit, skip
 */
export const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 10, 100); // Max 100
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Pagination response yaratish
 * @param {Array} data - Ma'lumotlar
 * @param {Number} page - Joriy sahifa
 * @param {Number} limit - Sahifadagi elementlar soni
 * @param {Number} total - Jami elementlar soni
 * @returns {Object} Pagination info
 */
export const createPaginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      pageSize: limit,
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

/**
 * Filter query yaratish
 * @param {Object} filters - Filter parametrlari
 * @returns {Object} MongoDB query
 */
export const buildFilterQuery = (filters) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.operatorRaqam) {
    query.operatorRaqam = filters.operatorRaqam;
  }

  if (filters.search) {
    query.$or = [
      { ism: { $regex: filters.search, $options: 'i' } },
      { familya: { $regex: filters.search, $options: 'i' } },
      { telefon: { $regex: filters.search, $options: 'i' } }
    ];
  }

  // Vaqt filtri
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};

    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }

    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  return query;
};

/**
 * Sort parametrini olish
 * @param {String} sortBy - Sort field
 * @param {String} order - asc/desc
 * @returns {Object} MongoDB sort object
 */
export const getSortParams = (sortBy = 'createdAt', order = 'desc') => {
  const sortOrder = order === 'asc' ? 1 : -1;
  return { [sortBy]: sortOrder };
};

/**
 * Success response yaratish
 * @param {Object} res - Response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {*} data - Response data
 */
export const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response yaratish
 * @param {Object} res - Response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {*} errors - Validation errors
 */
export const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Telefon raqamini formatlash
 * @param {String} phone - Telefon raqami
 * @returns {String} Formatlangan telefon
 */
export const formatPhone = (phone) => {
  // Bo'sh joylarni va maxsus belgilarni olib tashlash
  let formatted = phone.replace(/[\s\-\(\)]/g, '');

  // Agar +998 dan boshlanmasa, qo'shish
  if (!formatted.startsWith('+998')) {
    if (formatted.startsWith('998')) {
      formatted = '+' + formatted;
    } else if (formatted.length === 9) {
      formatted = '+998' + formatted;
    }
  }

  return formatted;
};

/**
 * Operator nomi generatsiya qilish
 * @param {String} operatorId - Operator ID
 * @returns {String} Operator nomi
 */
export const generateOperatorName = (operatorId) => {
  return `Operator ${operatorId}`;
};

/**
 * Secure random string generatsiya
 * @param {Number} length - String uzunligi
 * @returns {String} Random string
 */
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};
