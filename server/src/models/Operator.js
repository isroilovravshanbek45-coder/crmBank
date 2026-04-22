/**
 * Operator Model — PostgreSQL
 * SQL query funksiyalari + bcrypt
 */

import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

const Operator = {
  /**
   * OperatorId bo'yicha topish
   */
  async findByOperatorId(operatorId, includePassword = false) {
    const fields = includePassword
      ? '*'
      : 'id, operator_id, name, status, last_login, login_attempts, lock_until, created_at, updated_at';
    const result = await query(
      `SELECT ${fields} FROM operators WHERE operator_id = $1`,
      [operatorId]
    );
    return result.rows[0] || null;
  },

  /**
   * ID bo'yicha topish
   */
  async findById(id) {
    const result = await query(
      'SELECT id, operator_id, name, status, last_login, created_at, updated_at FROM operators WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Barcha operatorlarni olish
   */
  async findAll() {
    const result = await query(
      'SELECT id, operator_id, name, status, last_login, created_at, updated_at FROM operators ORDER BY operator_id'
    );
    return result.rows;
  },

  /**
   * Yangi operator yaratish
   */
  async create({ operatorId, name, password, status = 'active' }) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO operators (operator_id, name, password, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, operator_id, name, status, created_at`,
      [operatorId, name, hashedPassword, status]
    );
    return result.rows[0];
  },

  /**
   * Parolni tekshirish
   */
  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Login muvaffaqiyatli
   */
  async onLoginSuccess(id) {
    const result = await query(
      `UPDATE operators SET login_attempts = 0, lock_until = NULL, last_login = NOW(), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Login muvaffaqiyatsiz
   */
  async onLoginFailure(id, currentAttempts) {
    const newAttempts = currentAttempts + 1;
    const lockUntil = newAttempts >= 5
      ? new Date(Date.now() + 15 * 60 * 1000)
      : null;

    const result = await query(
      `UPDATE operators SET login_attempts = $1, lock_until = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [newAttempts, lockUntil, id]
    );
    return result.rows[0];
  },

  /**
   * Lock tekshirish
   */
  isLocked(operator) {
    return !!(operator.lock_until && new Date(operator.lock_until) > new Date());
  },

  /**
   * Operatorni yangilash
   */
  async update(operatorId, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.status) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    if (fields.length === 0) return null;

    values.push(operatorId);
    const result = await query(
      `UPDATE operators SET ${fields.join(', ')}, updated_at = NOW()
       WHERE operator_id = $${paramIndex}
       RETURNING id, operator_id, name, status, last_login, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  },

  /**
   * Parolni yangilash
   */
  async updatePassword(operatorId, newPassword) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query(
      'UPDATE operators SET password = $1, updated_at = NOW() WHERE operator_id = $2',
      [hashedPassword, operatorId]
    );
  }
};

export default Operator;
