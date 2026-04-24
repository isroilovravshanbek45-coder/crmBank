/**
 * PostgreSQL Database Initialization
 * Jadvallar va indexlarni yaratish
 * Run: npm run db:init
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Database jadvallarni yaratish boshlandi...\n');

    // ===== ADMINS TABLE =====
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        last_login TIMESTAMPTZ,
        login_attempts INT DEFAULT 0,
        lock_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ admins jadvali yaratildi');

    // ===== OPERATORS TABLE =====
    await client.query(`
      CREATE TABLE IF NOT EXISTS operators (
        id SERIAL PRIMARY KEY,
        operator_id VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        last_login TIMESTAMPTZ,
        login_attempts INT DEFAULT 0,
        lock_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ operators jadvali yaratildi');

    // ===== CLIENTS TABLE =====
    await client.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        ism VARCHAR(50) NOT NULL,
        familya VARCHAR(50) NOT NULL,
        telefon VARCHAR(20) NOT NULL,
        hudud VARCHAR(100) NOT NULL,
        garov VARCHAR(200) NOT NULL,
        summa NUMERIC(20,2) NOT NULL,
        operator_raqam VARCHAR(10) NOT NULL REFERENCES operators(operator_id),
        status VARCHAR(20) DEFAULT 'Jarayonda' CHECK (status IN ('Jarayonda', 'Tasdiqlangan', 'Rad etilgan')),
        comment TEXT DEFAULT '',
        archived BOOLEAN DEFAULT false,
        deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ clients jadvali yaratildi');

    // Mavjud baza uchun summa ustunini kattalashtirish va archived ustunini qo'shish
    await client.query(`
      ALTER TABLE clients ALTER COLUMN summa TYPE NUMERIC(20,2);
    `);
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
    `);
    console.log("✅ summa ustuni NUMERIC(20,2) ga yangilandi, archived ustuni qo'shildi");

    // ===== INDEXES =====
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)',
      'CREATE INDEX IF NOT EXISTS idx_operators_operator_id ON operators(operator_id)',
      'CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status)',
      'CREATE INDEX IF NOT EXISTS idx_clients_operator ON clients(operator_raqam)',
      'CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status)',
      'CREATE INDEX IF NOT EXISTS idx_clients_operator_status ON clients(operator_raqam, status)',
      'CREATE INDEX IF NOT EXISTS idx_clients_created ON clients(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_clients_deleted ON clients(deleted)',
      'CREATE INDEX IF NOT EXISTS idx_clients_archived ON clients(archived)',
      'CREATE INDEX IF NOT EXISTS idx_clients_not_deleted ON clients(created_at DESC) WHERE deleted = false',
      'CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(created_at DESC) WHERE deleted = false AND archived = false',
    ];

    for (const idx of indexes) {
      await client.query(idx);
    }
    console.log('✅ Indexlar yaratildi');

    // ===== FULL TEXT SEARCH =====
    await client.query(`
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS search_vector tsvector;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_clients_search ON clients USING gin(search_vector);
    `);

    // Trigger: search_vector ni avtomatik yangilash
    await client.query(`
      CREATE OR REPLACE FUNCTION clients_search_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('simple', 
          COALESCE(NEW.ism, '') || ' ' || 
          COALESCE(NEW.familya, '') || ' ' || 
          COALESCE(NEW.telefon, '') || ' ' || 
          COALESCE(NEW.hudud, '')
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS clients_search_trigger ON clients;
      CREATE TRIGGER clients_search_trigger
        BEFORE INSERT OR UPDATE ON clients
        FOR EACH ROW EXECUTE FUNCTION clients_search_update();
    `);
    console.log('✅ Full-text search yaratildi');

    // ===== updated_at TRIGGER =====
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    const tables = ['admins', 'operators', 'clients'];
    for (const table of tables) {
      await client.query(`
        DROP TRIGGER IF EXISTS ${table}_updated_at ON ${table};
        CREATE TRIGGER ${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
      `);
    }
    console.log('✅ Auto-update triggers yaratildi');

    console.log('\n🎉 Database initialization muvaffaqiyatli yakunlandi!');

  } catch (error) {
    console.error('❌ Database initialization xatosi:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
};

initDB();
