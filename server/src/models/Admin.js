/**
 * Admin Model — PostgreSQL
 * SQL query funksiyalari + bcrypt
 */

import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

const Admin = {
  /**
   * Username bo'yicha topish (parol bilan)
   */
  async findByUsername(username, includePassword = false) {
    const fields = includePassword
      ? '*'
      : 'id, username, full_name, email, status, last_login, login_attempts, lock_until, created_at, updated_at';
    const result = await query(
      `SELECT ${fields} FROM admins WHERE LOWER(username) = LOWER($1)`,
      [username]
    );
    return result.rows[0] || null;
  },

  /**
   * ID bo'yicha topish
   */
  async findById(id) {
    const result = await query(
      'SELECT id, username, full_name, email, status, last_login, created_at, updated_at FROM admins WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Yangi admin yaratish
   */
  async create({ username, password, fullName, email, status = 'active' }) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await query(
      `INSERT INTO admins (username, password, full_name, email, status)
       VALUES (LOWER($1), $2, $3, $4, $5)
       RETURNING id, username, full_name, email, status, created_at`,
      [username, hashedPassword, fullName, email, status]
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
      `UPDATE admins SET login_attempts = 0, lock_until = NULL, last_login = NOW(), updated_at = NOW()
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
      ? new Date(Date.now() + 30 * 60 * 1000)
      : null;

    const result = await query(
      `UPDATE admins SET login_attempts = $1, lock_until = $2, updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [newAttempts, lockUntil, id]
    );
    return result.rows[0];
  },

  /**
   * Lock tekshirish
   */
  isLocked(admin) {
    return !!(admin.lock_until && new Date(admin.lock_until) > new Date());
  },

  /**
   * Parolni yangilash
   */
  async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await query(
      'UPDATE admins SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
    );
  }
};

export default Admin;
