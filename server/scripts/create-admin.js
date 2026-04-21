/**
 * Create Admin User Script
 * Run: node scripts/create-admin.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../src/models/Admin.js';

dotenv.config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');

      // Update password if needed
      existingAdmin.password = process.env.ADMIN_PASSWORD || 'changeme123';
      await existingAdmin.save();
      console.log('✅ Admin password updated');
    } else {
      // Create new admin
      const admin = await Admin.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'changeme123',
        fullName: 'System Administrator',
        status: 'active'
      });

      console.log('✅ Admin user created successfully');
      console.log(`   Username: ${admin.username}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'changeme123'}`);
    }

    await mongoose.connection.close();
    console.log('✅ Done');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
