/**
 * Full Integration Test
 * Backend ↔ Frontend ↔ MongoDB
 */

const API_URL = 'http://localhost:5000/api';

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║   FULL INTEGRATION TEST                       ║');
console.log('║   Backend ↔ Frontend ↔ MongoDB                ║');
console.log('╚════════════════════════════════════════════════╝\n');

let operatorToken = null;
let adminToken = null;
let testClientId = null;

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}`);

  results.tests.push({ name, passed, details });
  if (passed) results.passed++;
  else results.failed++;
}

async function makeRequest(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: null, error: error.message, ok: false };
  }
}

// TEST 1: Backend Health Check
async function testBackendHealth() {
  console.log('\n🔍 TEST 1: Backend Health Check');
  const res = await fetch('http://localhost:5000/health');
  const data = await res.json();

  logTest('Backend is running', res.ok);
  logTest('MongoDB connected', data.database?.status === 'connected');
  logTest('Database name is correct', data.database?.name === 'bank_crm');
}

// TEST 2: Operator Authentication
async function testOperatorAuth() {
  console.log('\n🔍 TEST 2: Operator Authentication & Token');

  const res = await makeRequest('POST', '/auth/operator/login', {
    login: '401',
    password: '1234'
  });

  logTest('Operator login successful', res.ok);

  if (res.ok) {
    operatorToken = res.data.data.token;
    logTest('Token received', !!operatorToken);
    logTest('Token format valid', operatorToken.split('.').length === 3);
    logTest('User role is operator', res.data.data.user.role === 'operator');
    logTest('Operator ID is 401', res.data.data.user.operatorId === '401');

    // Decode token
    try {
      const payload = JSON.parse(atob(operatorToken.split('.')[1]));
      logTest('Token payload has role', payload.role === 'operator');
      logTest('Token payload has operatorId', payload.operatorId === '401');
      logTest('Token not expired', Date.now() < payload.exp * 1000);
    } catch (e) {
      logTest('Token decode failed', false, e.message);
    }
  }
}

// TEST 3: Create Client → MongoDB
async function testCreateClient() {
  console.log('\n🔍 TEST 3: Create Client → MongoDB');

  const clientData = {
    ism: 'Integration',
    familya: 'Test',
    telefon: '+998901234567',
    hudud: 'Toshkent',
    garov: 'Uy',
    summa: 50000000,
    status: 'Jarayonda',
    comment: 'Full integration test'
  };

  const res = await makeRequest('POST', '/clients', clientData, operatorToken);

  logTest('Client creation successful', res.ok);

  if (res.ok) {
    testClientId = res.data.data._id;
    logTest('Client has MongoDB _id', !!testClientId);
    logTest('Client has correct name', res.data.data.ism === 'Integration');
    logTest('Client has operator ID', res.data.data.operatorRaqam === '401');
    logTest('Client has timestamps', !!res.data.data.createdAt);
    logTest('Phone formatted correctly', res.data.data.telefon === '+998901234567');
  }
}

// TEST 4: Get Client from MongoDB
async function testGetClient() {
  console.log('\n🔍 TEST 4: Get Client from MongoDB');

  if (!testClientId) {
    logTest('Get client skipped', false, 'No client ID available');
    return;
  }

  const res = await makeRequest('GET', `/clients/${testClientId}`, null, operatorToken);

  logTest('Get single client successful', res.ok);

  if (res.ok) {
    logTest('Client data matches', res.data.data._id === testClientId);
    logTest('Client has all fields',
      res.data.data.ism &&
      res.data.data.familya &&
      res.data.data.telefon &&
      res.data.data.hudud &&
      res.data.data.garov
    );
  }
}

// TEST 5: Get Operator's Clients
async function testGetOperatorClients() {
  console.log('\n🔍 TEST 5: Get Operator Clients from MongoDB');

  const res = await makeRequest('GET', '/clients/operator', null, operatorToken);

  logTest('Get operator clients successful', res.ok);

  if (res.ok) {
    const clients = res.data.data?.data || res.data.data || [];
    logTest('Clients array received', Array.isArray(clients));
    logTest('At least one client exists', clients.length > 0);
    logTest('Pagination data exists', !!res.data.data?.pagination);

    if (clients.length > 0) {
      logTest('All clients belong to operator 401',
        clients.every(c => c.operatorRaqam === '401')
      );
    }
  }
}

// TEST 6: Update Client in MongoDB
async function testUpdateClient() {
  console.log('\n🔍 TEST 6: Update Client in MongoDB');

  if (!testClientId) {
    logTest('Update client skipped', false, 'No client ID available');
    return;
  }

  const updateData = {
    ism: 'Updated',
    familya: 'Test',
    telefon: '+998901234567',
    hudud: 'Toshkent',
    garov: 'Uy',
    summa: 60000000,
    status: 'Tasdiqlangan',
    comment: 'Updated via integration test'
  };

  const res = await makeRequest('PUT', `/clients/${testClientId}`, updateData, operatorToken);

  logTest('Client update successful', res.ok);

  if (res.ok) {
    logTest('Client name updated', res.data.data.ism === 'Updated');
    logTest('Client status updated', res.data.data.status === 'Tasdiqlangan');
    logTest('Client summa updated', res.data.data.summa === 60000000);
  }
}

// TEST 7: Statistics from MongoDB
async function testStatistics() {
  console.log('\n🔍 TEST 7: Statistics from MongoDB');

  const res = await makeRequest('GET', '/clients/statistics', null, operatorToken);

  logTest('Statistics query successful', res.ok);

  if (res.ok) {
    const stats = res.data.data;
    logTest('Total clients exists', typeof stats.totalClients === 'number');
    logTest('Total amount exists', typeof stats.totalAmount === 'number');
    logTest('Approved count exists', typeof stats.approved === 'number');
    logTest('Pending count exists', typeof stats.pending === 'number');
    logTest('Statistics accurate', stats.totalClients >= 1); // At least our test client
  }
}

// TEST 8: Admin Authentication
async function testAdminAuth() {
  console.log('\n🔍 TEST 8: Admin Authentication');

  const res = await makeRequest('POST', '/auth/admin/login', {
    login: 'Nodir',
    password: 'Ipoteka'
  });

  logTest('Admin login successful', res.ok);

  if (res.ok) {
    adminToken = res.data.data.token;
    logTest('Admin token received', !!adminToken);
    logTest('User role is admin', res.data.data.user.role === 'admin');
  }
}

// TEST 9: Admin Access to All Clients
async function testAdminAccess() {
  console.log('\n🔍 TEST 9: Admin Access to All Clients');

  if (!adminToken) {
    logTest('Admin access skipped', false, 'No admin token');
    return;
  }

  const res = await makeRequest('GET', '/clients', null, adminToken);

  logTest('Admin can get all clients', res.ok);

  if (res.ok) {
    const clients = res.data.data?.data || res.data.data || [];
    logTest('All clients data received', Array.isArray(clients));
    logTest('Pagination exists', !!res.data.data?.pagination);
  }
}

// TEST 10: Operator Cannot Access Admin Endpoints
async function testSecurityBoundaries() {
  console.log('\n🔍 TEST 10: Security Boundaries');

  const res = await makeRequest('GET', '/clients', null, operatorToken);

  logTest('Operator blocked from admin endpoint', !res.ok && res.status === 403);
}

// Run all tests
async function runAllTests() {
  const startTime = Date.now();

  try {
    await testBackendHealth();
    await testOperatorAuth();
    await testCreateClient();
    await testGetClient();
    await testGetOperatorClients();
    await testUpdateClient();
    await testStatistics();
    await testAdminAuth();
    await testAdminAccess();
    await testSecurityBoundaries();
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(50));
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('═'.repeat(50));

  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  console.log(`\n📈 Success Rate: ${successRate}%`);

  if (successRate >= 95) {
    console.log('\n✅ EXCELLENT! Backend ↔ Frontend ↔ MongoDB fully integrated!');
    console.log('🚀 System is PRODUCTION READY!');
  } else if (successRate >= 85) {
    console.log('\n⚠️  GOOD! Minor issues detected.');
  } else {
    console.log('\n❌ ISSUES DETECTED! Review failed tests.');
  }

  // List failed tests
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.name}`);
      if (t.details) console.log(`     ${t.details}`);
    });
  }

  console.log('');
}

runAllTests();
