/**
 * Baza yaratish skripti (Database "bank_crm" yaratadi)
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// Asosiy 'postgres' bazasiga ulanamiz (chunki bank_crm hali yo'q)
const connectionString = process.env.DATABASE_URL.replace('/bank_crm', '/postgres');

const client = new Client({
  connectionString,
});

async function createDatabase() {
  try {
    await client.connect();
    console.log('✅ PostgreSQL ga ulandik');

    // Baza borligini tekshiramiz
    const checkDb = await client.query("SELECT 1 FROM pg_database WHERE datname = 'bank_crm'");
    
    if (checkDb.rowCount === 0) {
      console.log('🔄 "bank_crm" bazasi yaratilmoqda...');
      await client.query('CREATE DATABASE bank_crm');
      console.log('✅ "bank_crm" bazasi muvaffaqiyatli yaratildi!');
    } else {
      console.log('⚠️ "bank_crm" bazasi allaqachon mavjud.');
    }

  } catch (error) {
    console.error('❌ Xatolik yuz berdi:', error.message);
  } finally {
    await client.end();
  }
}

createDatabase();
