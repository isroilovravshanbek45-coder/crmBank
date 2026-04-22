/**
 * Database Statistics Checker
 * MongoDB'dagi barcha ma'lumotlarni sanash
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Import models
import Client from './src/models/Client.js';
import Operator from './src/models/Operator.js';
import Admin from './src/models/Admin.js';

async function checkDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('=' .repeat(60));
    console.log('📊 DATABASE STATISTICS');
    console.log('=' .repeat(60));

    // 1. Count total clients
    const totalClients = await Client.countDocuments({});
    const activeClients = await Client.countDocuments({ deleted: false });
    const deletedClients = await Client.countDocuments({ deleted: true });

    console.log('\n📋 CLIENTS:');
    console.log(`   Total: ${totalClients}`);
    console.log(`   Active: ${activeClients}`);
    console.log(`   Deleted: ${deletedClients}`);

    // 2. Clients by status
    const pendingClients = await Client.countDocuments({ status: 'Jarayonda', deleted: false });
    const approvedClients = await Client.countDocuments({ status: 'Tasdiqlangan', deleted: false });
    const rejectedClients = await Client.countDocuments({ status: 'Rad etilgan', deleted: false });

    console.log('\n   By Status:');
    console.log(`   - Jarayonda: ${pendingClients}`);
    console.log(`   - Tasdiqlangan: ${approvedClients}`);
    console.log(`   - Rad etilgan: ${rejectedClients}`);

    // 3. Clients by operator
    console.log('\n   By Operator:');
    const clientsByOperator = await Client.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: '$operatorRaqam', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    clientsByOperator.forEach(op => {
      console.log(`   - Operator ${op._id}: ${op.count} clients`);
    });

    // 4. Count operators
    const totalOperators = await Operator.countDocuments({});
    const activeOperators = await Operator.countDocuments({ status: 'active' });
    const inactiveOperators = await Operator.countDocuments({ status: 'inactive' });

    console.log('\n👥 OPERATORS:');
    console.log(`   Total: ${totalOperators}`);
    console.log(`   Active: ${activeOperators}`);
    console.log(`   Inactive: ${inactiveOperators}`);

    // 5. Count admins
    const totalAdmins = await Admin.countDocuments({});
    const activeAdmins = await Admin.countDocuments({ status: 'active' });

    console.log('\n👑 ADMINS:');
    console.log(`   Total: ${totalAdmins}`);
    console.log(`   Active: ${activeAdmins}`);

    // 6. Get oldest and newest clients
    const oldestClient = await Client.findOne({ deleted: false })
      .sort({ createdAt: 1 })
      .select('ism familya createdAt operatorRaqam');

    const newestClient = await Client.findOne({ deleted: false })
      .sort({ createdAt: -1 })
      .select('ism familya createdAt operatorRaqam');

    console.log('\n📅 DATE RANGE:');
    if (oldestClient) {
      console.log(`   Oldest: ${oldestClient.ism} ${oldestClient.familya}`);
      console.log(`           Created: ${oldestClient.createdAt.toLocaleString('uz-UZ')}`);
      console.log(`           Operator: ${oldestClient.operatorRaqam}`);
    }
    if (newestClient) {
      console.log(`   Newest: ${newestClient.ism} ${newestClient.familya}`);
      console.log(`           Created: ${newestClient.createdAt.toLocaleString('uz-UZ')}`);
      console.log(`           Operator: ${newestClient.operatorRaqam}`);
    }

    // 7. Check pagination (first 10 vs all)
    console.log('\n🔍 PAGINATION TEST:');
    const first10Clients = await Client.find({ deleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('ism familya createdAt');

    console.log(`   First 10 clients (newest first):`);
    first10Clients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.ism} ${client.familya} - ${client.createdAt.toLocaleString('uz-UZ')}`);
    });

    // 8. Check if there are more than 10
    if (activeClients > 10) {
      console.log(`\n   ⚠️  WARNING: Database has ${activeClients} clients but only showing 10!`);
      console.log(`   💡 Solution: Implement pagination or increase limit`);
    } else {
      console.log(`\n   ✅ All ${activeClients} clients are being fetched`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Database check completed!');
    console.log('=' .repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the check
checkDatabase();
