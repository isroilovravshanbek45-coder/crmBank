/**
 * Client Model — PostgreSQL
 * CRUD, aggregation, search, soft-delete
 */

import { query } from '../config/database.js';
import { CLIENT_STATUS } from '../config/constants.js';

const Client = {
  /**
   * Barcha mijozlarni olish (pagination bilan)
   */
  async findAll({ page = 1, limit = 100, status, operatorId, sortBy = 'created_at', sortOrder = 'DESC', archived = false } = {}) {
    const conditions = ['deleted = false'];
    const values = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (operatorId) {
      conditions.push(`operator_raqam = $${paramIndex++}`);
      values.push(operatorId);
    }
    
    // Default holatda faqat arxivlanmaganlarni qaytarish, 'all' bo'lsa aralash
    if (archived !== 'all') {
      conditions.push(`archived = $${paramIndex++}`);
      values.push(archived);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // Count query
    const countResult = await query(
      `SELECT COUNT(*) FROM clients ${whereClause}`,
      values
    );
    const total = parseInt(countResult.rows[0].count);

    // Data query
    values.push(limit);
    values.push(offset);
    const dataResult = await query(
      `SELECT id, ism, familya, telefon, hudud, garov, summa, operator_raqam AS "operatorRaqam",
              status, comment, archived, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM clients
       ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );

    return {
      data: dataResult.rows.map(row => ({ ...row, _id: row.id })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Operator mijozlarini olish
   */
  async findByOperator(operatorId, { page = 1, limit = 100, archived = false } = {}) {
    return this.findAll({ operatorId, page, limit, archived });
  },

  /**
   * ID bo'yicha topish
   */
  async findById(id) {
    const result = await query(
      `SELECT id, ism, familya, telefon, hudud, garov, summa, operator_raqam AS "operatorRaqam",
              status, comment, deleted, archived, created_at AS "createdAt", updated_at AS "updatedAt"
       FROM clients WHERE id = $1 AND deleted = false`,
      [id]
    );
    // Frontend _id kutadi, shuning uchun alias qo'shamiz
    const row = result.rows[0];
    if (row) row._id = row.id;
    return row || null;
  },

  /**
   * Yangi mijoz yaratish
   */
  async create({ ism, familya, telefon, hudud, garov, summa, operatorRaqam, status = CLIENT_STATUS.PENDING, comment = '' }) {
    // Telefon formatlash
    telefon = Client.formatPhone(telefon);

    const result = await query(
      `INSERT INTO clients (ism, familya, telefon, hudud, garov, summa, operator_raqam, status, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, ism, familya, telefon, hudud, garov, summa, operator_raqam AS "operatorRaqam",
                 status, comment, archived, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [ism, familya, telefon, hudud, garov, summa, operatorRaqam, status, comment]
    );
    const row = result.rows[0];
    if (row) row._id = row.id;
    return row;
  },

  /**
   * Mijozni yangilash
   */
  async update(id, data) {
    const allowedFields = ['ism', 'familya', 'telefon', 'hudud', 'garov', 'summa', 'status', 'comment'];
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        const dbField = key === 'operatorRaqam' ? 'operator_raqam' : key;
        if (key === 'telefon') {
          fields.push(`${dbField} = $${paramIndex++}`);
          values.push(Client.formatPhone(data[key]));
        } else {
          fields.push(`${dbField} = $${paramIndex++}`);
          values.push(data[key]);
        }
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE clients SET ${fields.join(', ')}
       WHERE id = $${paramIndex} AND deleted = false
       RETURNING id, ism, familya, telefon, hudud, garov, summa, operator_raqam AS "operatorRaqam",
                 status, comment, archived, created_at AS "createdAt", updated_at AS "updatedAt"`,
      values
    );
    const row = result.rows[0];
    if (row) row._id = row.id;
    return row || null;
  },

  /**
   * Soft delete
   */
  async softDelete(id) {
    const result = await query(
      `UPDATE clients SET deleted = true, deleted_at = NOW()
       WHERE id = $1 AND deleted = false
       RETURNING id`,
      [id]
    );
    return result.rowCount > 0;
  },

  /**
   * Restore
   */
  async restore(id) {
    const result = await query(
      `UPDATE clients SET deleted = false, deleted_at = NULL
       WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rowCount > 0;
  },

  /**
   * Ishi tugagan mijozlarni arxivlash (Tasdiqlangan yoki Rad etilgan)
   */
  async archiveCompleted() {
    const result = await query(
      `UPDATE clients SET archived = true
       WHERE status IN ('Tasdiqlangan', 'Rad etilgan') AND archived = false AND deleted = false
       RETURNING id`
    );
    return result.rowCount;
  },

  /**
   * Operator statistikasi — bitta SQL query bilan
   */
  async getOperatorStats(operatorId) {
    const result = await query(
      `SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Tasdiqlangan') AS approved,
        COUNT(*) FILTER (WHERE status = 'Jarayonda') AS pending,
        COUNT(*) FILTER (WHERE status = 'Rad etilgan') AS rejected,
        COALESCE(SUM(summa), 0) AS "totalAmount"
       FROM clients
       WHERE operator_raqam = $1 AND deleted = false`,
      [operatorId]
    );
    const row = result.rows[0];
    return {
      total: parseInt(row.total),
      approved: parseInt(row.approved),
      pending: parseInt(row.pending),
      rejected: parseInt(row.rejected),
      totalAmount: parseFloat(row.totalAmount)
    };
  },

  /**
   * Barcha operatorlar statistikasi — bitta SQL query (N+1 yo'q!)
   */
  async getAllOperatorsStats() {
    const result = await query(
      `SELECT
        operator_raqam AS "_id",
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Tasdiqlangan') AS approved,
        COUNT(*) FILTER (WHERE status = 'Jarayonda') AS pending,
        COUNT(*) FILTER (WHERE status = 'Rad etilgan') AS rejected,
        COALESCE(SUM(summa), 0) AS "totalAmount"
       FROM clients
       WHERE deleted = false
       GROUP BY operator_raqam
       ORDER BY approved DESC, total DESC`
    );
    return result.rows.map(row => ({
      _id: row._id,
      total: parseInt(row.total),
      approved: parseInt(row.approved),
      pending: parseInt(row.pending),
      rejected: parseInt(row.rejected),
      totalAmount: parseFloat(row.totalAmount)
    }));
  },

  /**
   * Umumiy statistika
   */
  async getOverallStats() {
    const result = await query(
      `SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'Tasdiqlangan') AS approved,
        COUNT(*) FILTER (WHERE status = 'Jarayonda') AS pending,
        COUNT(*) FILTER (WHERE status = 'Rad etilgan') AS rejected,
        COALESCE(SUM(summa), 0) AS "totalAmount"
       FROM clients WHERE deleted = false`
    );
    const row = result.rows[0];
    return {
      total: parseInt(row.total),
      approved: parseInt(row.approved),
      pending: parseInt(row.pending),
      rejected: parseInt(row.rejected),
      totalAmount: parseFloat(row.totalAmount)
    };
  },

  /**
   * Search — PostgreSQL full-text search
   */
  async search(searchTerm, { operatorId, status, limit = 20, archived = false } = {}) {
    const conditions = ['deleted = false'];
    const values = [];
    let paramIndex = 1;

    if (archived !== 'all') {
      conditions.push(`archived = $${paramIndex++}`);
      values.push(archived);
    }

    // Full text search
    conditions.push(`search_vector @@ to_tsquery('simple', $${paramIndex++})`);
    values.push(searchTerm.split(/\s+/).join(' & '));

    if (operatorId) {
      conditions.push(`operator_raqam = $${paramIndex++}`);
      values.push(operatorId);
    }
    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    values.push(limit);
    const result = await query(
      `SELECT id, ism, familya, telefon, hudud, garov, summa, operator_raqam AS "operatorRaqam",
              status, comment, created_at AS "createdAt"
       FROM clients
       WHERE ${conditions.join(' AND ')}
       ORDER BY ts_rank(search_vector, to_tsquery('simple', $1)) DESC
       LIMIT $${paramIndex}`,
      values
    );
    return result.rows.map(row => ({ ...row, _id: row.id }));
  },

  /**
   * Bulk update
   */
  async bulkUpdate(ids, updateData) {
    const allowedFields = ['status', 'comment'];
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        values.push(updateData[key]);
      }
    }

    if (fields.length === 0) return 0;

    values.push(ids);
    const result = await query(
      `UPDATE clients SET ${fields.join(', ')}
       WHERE id = ANY($${paramIndex}) AND deleted = false`,
      values
    );
    return result.rowCount;
  },

  /**
   * Telefon formatlash
   */
  formatPhone(telefon) {
    if (!telefon) return telefon;
    telefon = telefon.replace(/\s/g, '');
    if (!telefon.startsWith('+998')) {
      if (telefon.startsWith('998')) {
        telefon = '+' + telefon;
      } else if (telefon.length === 9) {
        telefon = '+998' + telefon;
      }
    }
    return telefon;
  }
};

export default Client;
