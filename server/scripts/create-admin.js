/**
 * Create Admin User Script — PostgreSQL
 * Run: npm run db:admin
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
  const client = await pool.connect();

  try {
    console.log('✅ Connected to PostgreSQL');

    const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'changeme123';
    const fullName = process.env.ADMIN_USERNAME || 'System Administrator';

    // Check if admin exists
    const existing = await client.query(
      'SELECT id, username FROM admins WHERE username = $1',
      [username]
    );

    if (existing.rows.length > 0) {
      console.log('⚠️  Admin user already exists');

      // Update password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      await client.query(
        'UPDATE admins SET password = $1, updated_at = NOW() WHERE username = $2',
        [hashedPassword, username]
      );
      console.log('✅ Admin password updated');
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      await client.query(
        `INSERT INTO admins (username, password, full_name, status)
         VALUES ($1, $2, $3, 'active')`,
        [username, hashedPassword, fullName]
      );

      console.log('✅ Admin user created successfully');
      console.log(`   Username: ${username}`);
    }

    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

createAdmin();
