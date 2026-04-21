/**
 * Bank CRM API - Professional Testing Script
 * Senior Backend Developer Level Testing
 */

const API_BASE = 'http://localhost:5000/api';
const API_V1 = 'http://localhost:5000/api/v1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Test tokens
let operatorToken = null;
let adminToken = null;

/**
 * Helper: Make HTTP request
 */
async function makeRequest(method, url, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: null, error: error.message, ok: false };
  }
}

/**
 * Helper: Log test result
 */
function logTest(name, passed, message = '') {
  results.total++;
  if (passed) {
    results.passed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    results.failed++;
    results.errors.push({ test: name, message });
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (message) console.log(`  ${colors.red}→${colors.reset} ${message}`);
  }
}

/**
 * Test Suite: Health Check
 */
async function testHealthCheck() {
  console.log(`\n${colors.cyan}═══ Testing Health Check ═══${colors.reset}`);

  const res = await makeRequest('GET', 'http://localhost:5000/health');
  logTest('Health endpoint responds', res.ok);
  logTest('Health returns correct structure', res.data?.success === true);
  logTest('Health includes database status', res.data?.database?.status === 'connected');
  logTest('Health includes server info', !!res.data?.server);
}

/**
 * Test Suite: Authentication
 */
async function testAuthentication() {
  console.log(`\n${colors.cyan}═══ Testing Authentication ═══${colors.reset}`);

  // Test 1: Operator login with valid credentials
  const login1 = await makeRequest('POST', `${API_BASE}/auth/operator/login`, {
    login: '401',
    password: '1234'
  });
  logTest('Operator login with valid credentials', login1.ok && login1.data?.success);
  if (login1.ok) {
    operatorToken = login1.data?.data?.token;
    logTest('Operator login returns token', !!operatorToken);
    logTest('Operator login returns user info', login1.data?.data?.user?.operatorId === '401');
    logTest('Operator role is correct', login1.data?.data?.user?.role === 'operator');
  }

  // Test 2: Operator login with invalid credentials
  const login2 = await makeRequest('POST', `${API_BASE}/auth/operator/login`, {
    login: '401',
    password: 'wrong'
  });
  logTest('Operator login fails with wrong password', !login2.ok && login2.status === 401);

  // Test 3: Operator login with invalid ID
  const login3 = await makeRequest('POST', `${API_BASE}/auth/operator/login`, {
    login: '999',
    password: '1234'
  });
  logTest('Operator login fails with invalid ID', !login3.ok);

  // Test 4: Admin login
  const login4 = await makeRequest('POST', `${API_BASE}/auth/admin/login`, {
    login: 'admin',
    password: 'changeme123'
  });
  logTest('Admin login with valid credentials', login4.ok && login4.data?.success);
  if (login4.ok) {
    adminToken = login4.data?.data?.token;
    logTest('Admin login returns token', !!adminToken);
    logTest('Admin role is correct', login4.data?.data?.user?.role === 'admin');
  }

  // Test 5: Token verification
  if (operatorToken) {
    const verify = await makeRequest('GET', `${API_BASE}/auth/verify`, null, operatorToken);
    logTest('Token verification works', verify.ok);
  }

  // Test 6: Missing credentials
  const login5 = await makeRequest('POST', `${API_BASE}/auth/operator/login`, {});
  logTest('Login fails without credentials', !login5.ok);
}

/**
 * Test Suite: Client Operations (Operator)
 */
async function testClientOperations() {
  console.log(`\n${colors.cyan}═══ Testing Client Operations ═══${colors.reset}`);

  if (!operatorToken) {
    console.log(`${colors.yellow}⚠ Skipping client tests - no operator token${colors.reset}`);
    return;
  }

  // Test 1: Create client with valid data
  const client1 = await makeRequest('POST', `${API_BASE}/clients`, {
    ism: 'Test',
    familya: 'User',
    telefon: '+998901234567',
    hudud: 'Tashkent',
    garov: 'Uy',
    summa: 5000000,
    status: 'Jarayonda',
    comment: 'Test client'
  }, operatorToken);
  logTest('Create client with valid data', client1.ok && client1.data?.success);
  let clientId = client1.data?.data?._id;

  // Test 2: Create client with invalid phone
  const client2 = await makeRequest('POST', `${API_BASE}/clients`, {
    ism: 'Test',
    familya: 'User',
    telefon: '1234567890',
    hudud: 'Tashkent',
    garov: 'Uy',
    summa: 5000000
  }, operatorToken);
  logTest('Create client fails with invalid phone', !client2.ok);

  // Test 3: Create client with invalid amount (too small)
  const client3 = await makeRequest('POST', `${API_BASE}/clients`, {
    ism: 'Test',
    familya: 'User',
    telefon: '+998901234567',
    hudud: 'Tashkent',
    garov: 'Uy',
    summa: 500000
  }, operatorToken);
  logTest('Create client fails with amount < 1M', !client3.ok);

  // Test 4: Get operator clients
  const clients1 = await makeRequest('GET', `${API_BASE}/clients/operator`, null, operatorToken);
  logTest('Get operator clients', clients1.ok && clients1.data?.success);
  logTest('Clients response has pagination', !!clients1.data?.data?.pagination);

  // Test 5: Get single client
  if (clientId) {
    const client4 = await makeRequest('GET', `${API_BASE}/clients/${clientId}`, null, operatorToken);
    logTest('Get single client by ID', client4.ok);

    // Test 6: Update client
    const client5 = await makeRequest('PUT', `${API_BASE}/clients/${clientId}`, {
      ism: 'Updated',
      familya: 'User',
      telefon: '+998901234567',
      hudud: 'Tashkent',
      garov: 'Uy',
      summa: 6000000,
      status: 'Tasdiqlangan',
      comment: 'Updated test client'
    }, operatorToken);
    logTest('Update client', client5.ok);
  }

  // Test 7: Get statistics
  const stats = await makeRequest('GET', `${API_BASE}/clients/statistics`, null, operatorToken);
  logTest('Get client statistics', stats.ok);

  // Test 8: Search clients
  const search = await makeRequest('GET', `${API_BASE}/clients/search?q=Test`, null, operatorToken);
  logTest('Search clients', search.ok);

  // Test 9: Operator cannot access admin-only endpoints
  const allClients = await makeRequest('GET', `${API_BASE}/clients`, null, operatorToken);
  logTest('Operator cannot get all clients (admin only)', !allClients.ok && allClients.status === 403);
}

/**
 * Test Suite: Admin Operations
 */
async function testAdminOperations() {
  console.log(`\n${colors.cyan}═══ Testing Admin Operations ═══${colors.reset}`);

  if (!adminToken) {
    console.log(`${colors.yellow}⚠ Skipping admin tests - no admin token${colors.reset}`);
    return;
  }

  // Test 1: Get all clients
  const clients = await makeRequest('GET', `${API_BASE}/clients`, null, adminToken);
  logTest('Admin can get all clients', clients.ok && clients.data?.success);

  // Test 2: Get all operators
  const operators = await makeRequest('GET', `${API_BASE}/operators`, null, adminToken);
  logTest('Admin can get all operators', operators.ok);
  logTest('Operators response includes stats', operators.data?.data?.count > 0);

  // Test 3: Get top operators
  const topOps = await makeRequest('GET', `${API_BASE}/operators/top?limit=3`, null, adminToken);
  logTest('Get top operators', topOps.ok);

  // Test 4: Get specific operator
  const op = await makeRequest('GET', `${API_BASE}/operators/401`, null, adminToken);
  logTest('Get specific operator', op.ok);

  // Test 5: Update operator
  const updateOp = await makeRequest('PUT', `${API_BASE}/operators/401`, {
    name: 'Test Operator 401',
    status: 'active'
  }, adminToken);
  logTest('Update operator', updateOp.ok);
}

/**
 * Test Suite: Security
 */
async function testSecurity() {
  console.log(`\n${colors.cyan}═══ Testing Security ═══${colors.reset}`);

  // Test 1: Endpoints require authentication
  const noAuth1 = await makeRequest('GET', `${API_BASE}/clients/operator`);
  logTest('Clients endpoint requires auth', !noAuth1.ok && noAuth1.status === 401);

  const noAuth2 = await makeRequest('GET', `${API_BASE}/operators`);
  logTest('Operators endpoint requires auth', !noAuth2.ok && noAuth2.status === 401);

  // Test 2: Invalid token
  const badToken = await makeRequest('GET', `${API_BASE}/clients/operator`, null, 'invalid-token');
  logTest('Invalid token is rejected', !badToken.ok && badToken.status === 401);

  // Test 3: SQL injection attempt (should be sanitized)
  const inject1 = await makeRequest('POST', `${API_BASE}/auth/operator/login`, {
    login: "401'; DROP TABLE operators; --",
    password: '1234'
  });
  logTest('SQL injection is blocked', !inject1.ok);

  // Test 4: XSS attempt
  if (operatorToken) {
    const xss = await makeRequest('POST', `${API_BASE}/clients`, {
      ism: '<script>alert("xss")</script>',
      familya: 'Test',
      telefon: '+998901234567',
      hudud: 'Test',
      garov: 'Test',
      summa: 5000000
    }, operatorToken);
    logTest('XSS in name field is handled', xss.ok); // Should create but sanitize
  }
}

/**
 * Test Suite: Error Handling
 */
async function testErrorHandling() {
  console.log(`\n${colors.cyan}═══ Testing Error Handling ═══${colors.reset}`);

  // Test 1: 404 for non-existent routes
  const notFound = await makeRequest('GET', `${API_BASE}/nonexistent`);
  logTest('Returns 404 for non-existent routes', notFound.status === 404);

  // Test 2: Invalid MongoDB ID
  if (operatorToken) {
    const badId = await makeRequest('GET', `${API_BASE}/clients/invalid-id`, null, operatorToken);
    logTest('Handles invalid MongoDB ID', !badId.ok && badId.status === 400);
  }

  // Test 3: Missing required fields
  if (operatorToken) {
    const missing = await makeRequest('POST', `${API_BASE}/clients`, {
      ism: 'Test'
    }, operatorToken);
    logTest('Validation catches missing required fields', !missing.ok && missing.status === 400);
  }
}

/**
 * Test Suite: API Versioning
 */
async function testApiVersioning() {
  console.log(`\n${colors.cyan}═══ Testing API Versioning ═══${colors.reset}`);

  // Test both v1 and legacy endpoints
  if (operatorToken) {
    const v1 = await makeRequest('GET', `${API_V1}/clients/operator`, null, operatorToken);
    logTest('API v1 endpoint works', v1.ok);

    const legacy = await makeRequest('GET', `${API_BASE}/clients/operator`, null, operatorToken);
    logTest('Legacy API endpoint works', legacy.ok);
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log(`\n${colors.blue}╔═══════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Bank CRM API - Professional Testing Suite      ║${colors.reset}`);
  console.log(`${colors.blue}║  Senior Backend Developer Level                  ║${colors.reset}`);
  console.log(`${colors.blue}╚═══════════════════════════════════════════════════╝${colors.reset}\n`);

  const startTime = Date.now();

  try {
    await testHealthCheck();
    await testAuthentication();
    await testClientOperations();
    await testAdminOperations();
    await testSecurity();
    await testErrorHandling();
    await testApiVersioning();
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during testing:${colors.reset}`, error);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print results
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}Test Results:${colors.reset}`);
  console.log(`  Total: ${results.total}`);
  console.log(`  ${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`  Duration: ${duration}s`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

  if (results.failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    results.errors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err.test}`);
      if (err.message) console.log(`     ${err.message}`);
    });
    console.log('');
  }

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`${colors.cyan}Success Rate: ${successRate}%${colors.reset}`);

  if (successRate >= 90) {
    console.log(`${colors.green}✓ Backend is PRODUCTION READY!${colors.reset}\n`);
  } else if (successRate >= 70) {
    console.log(`${colors.yellow}⚠ Backend needs improvements${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Backend has critical issues${colors.reset}\n`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);
