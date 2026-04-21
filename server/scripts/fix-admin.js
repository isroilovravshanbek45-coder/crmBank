/**
 * Fix Admin User Script
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../src/models/Admin.js';

dotenv.config();

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all existing admins
    await Admin.deleteMany({});
    console.log('✅ Cleared existing admins');

    // Create new admin
    const admin = await Admin.create({
      username: 'admin',
      password: 'changeme123',
      fullName: 'System Administrator',
      status: 'active'
    });

    console.log('✅ Admin user created successfully');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: changeme123`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdmin();
