/**
 * UniPathway API - Automated Test Script
 * Run with: node docs/test.js
 * Make sure the server is running on http://localhost:3000 first
 */

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const results = [];

// ─── HTTP helpers ────────────────────────────────────────────────────────────

async function request(method, path, { body, role } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (role) headers['x-user-role'] = role;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();
  return { status: res.status, data };
}

const get    = (path, opts)       => request('GET',    path, opts);
const post   = (path, body, opts) => request('POST',   path, { body, ...opts });
const put    = (path, body, opts) => request('PUT',    path, { body, ...opts });
const del    = (path, opts)       => request('DELETE', path, opts);

// ─── Assertion engine ────────────────────────────────────────────────────────

function assert(testName, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed++;
    results.push(`  ✅ ${testName}`);
  } else {
    failed++;
    results.push(`  ❌ ${testName} — expected ${expected}, got ${actual}`);
  }
}

function section(name) {
  results.push(`\n📁 ${name}`);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

async function testUsers() {
  section('USERS');

  // GET all
  let r = await get('/users');
  assert('GET /users → 200',            r.status, 200);
  assert('GET /users → success true',   r.data.success, true);
  assert('GET /users → returns array',  Array.isArray(r.data.data), true);

  // GET by ID
  r = await get('/users/1');
  assert('GET /users/1 → 200',          r.status, 200);
  assert('GET /users/1 → correct id',   r.data.data.userId, 1);

  // GET not found
  r = await get('/users/999');
  assert('GET /users/999 → 404',        r.status, 404);
  assert('GET /users/999 → NOT_FOUND',  r.data.error.code, 'NOT_FOUND');

  // POST - forbidden
  r = await post('/users', { firstName: 'A', lastName: 'B', userRole: 'user' }, { role: 'user' });
  assert('POST /users (user role) → 403',     r.status, 403);
  assert('POST /users (user role) → FORBIDDEN', r.data.error.code, 'FORBIDDEN');

  // POST - missing fields
  r = await post('/users', { firstName: 'Tal' }, { role: 'admin' });
  assert('POST /users (missing fields) → 400',         r.status, 400);
  assert('POST /users (missing fields) → VALIDATION_ERROR', r.data.error.code, 'VALIDATION_ERROR');

  // POST - invalid psychometric
  r = await post('/users', { firstName: 'Tal', lastName: 'X', userRole: 'user', psychometricScores: { verbal: 999, quantitative: 100, english: 100 } }, { role: 'admin' });
  assert('POST /users (bad psychometric) → 400', r.status, 400);

  // POST - success
  r = await post('/users', {
    firstName: 'Test', lastName: 'User', userRole: 'user',
    psychometricScores: { verbal: 110, quantitative: 120, english: 115 }
  }, { role: 'admin' });
  assert('POST /users → 201',           r.status, 201);
  assert('POST /users → has userId',    typeof r.data.data.userId, 'number');
  const newUserId = r.data.data.userId;

  // PUT - success
  r = await put(`/users/${newUserId}`, { firstName: 'Updated', lastName: 'User', userRole: 'user' }, { role: 'admin' });
  assert('PUT /users/:id → 200',        r.status, 200);
  assert('PUT /users/:id → correct id', r.data.data.userId, newUserId);

  // PUT - verify update persisted
  r = await get(`/users/${newUserId}`);
  assert('GET after PUT → firstName updated', r.data.data.firstName, 'Updated');

  // PUT - not found
  r = await put('/users/999', { firstName: 'X', lastName: 'Y', userRole: 'user' }, { role: 'admin' });
  assert('PUT /users/999 → 404',        r.status, 404);

  // DELETE - forbidden (manager)
  r = await del(`/users/${newUserId}`, { role: 'manager' });
  assert('DELETE /users (manager role) → 403', r.status, 403);

  // DELETE - success
  r = await del(`/users/${newUserId}`, { role: 'admin' });
  assert('DELETE /users/:id → 200',     r.status, 200);

  // DELETE - confirm gone
  r = await get(`/users/${newUserId}`);
  assert('GET after DELETE → 404',      r.status, 404);
}

async function testUniversities() {
  section('UNIVERSITIES');

  let r = await get('/universities');
  assert('GET /universities → 200',           r.status, 200);
  assert('GET /universities → array',         Array.isArray(r.data.data), true);

  r = await get('/universities?location=Haifa');
  assert('GET /universities?location → 200',  r.status, 200);
  assert('GET /universities?location → filtered', r.data.data.every(u => u.location === 'Haifa'), true);

  r = await get('/universities/1');
  assert('GET /universities/1 → 200',         r.status, 200);
  assert('GET /universities/1 → correct id',  r.data.data.universityId, 1);

  r = await get('/universities/999');
  assert('GET /universities/999 → 404',       r.status, 404);

  // POST - missing fields
  r = await post('/universities', { name: 'Only Name' }, { role: 'admin' });
  assert('POST /universities (missing location) → 400', r.status, 400);

  // POST - success
  r = await post('/universities', { name: 'Test Uni', location: 'Test City' }, { role: 'admin' });
  assert('POST /universities → 201',          r.status, 201);
  const newUniId = r.data.data.universityId;

  // PUT - success
  r = await put(`/universities/${newUniId}`, { name: 'Updated Uni', location: 'New City' }, { role: 'admin' });
  assert('PUT /universities/:id → 200',       r.status, 200);

  r = await get(`/universities/${newUniId}`);
  assert('GET after PUT → name updated',      r.data.data.name, 'Updated Uni');

  // DELETE
  r = await del(`/universities/${newUniId}`, { role: 'admin' });
  assert('DELETE /universities/:id → 200',    r.status, 200);

  r = await get(`/universities/${newUniId}`);
  assert('GET after DELETE → 404',            r.status, 404);
}

async function testDepartments() {
  section('DEPARTMENTS');

  let r = await get('/departments');
  assert('GET /departments → 200',                    r.status, 200);
  assert('GET /departments → array',                  Array.isArray(r.data.data), true);

  r = await get('/departments?major=Computer Science');
  assert('GET /departments?major → filtered',         r.data.data.every(d => d.majorName.includes('Computer Science')), true);

  r = await get('/departments?universityId=1');
  assert('GET /departments?universityId → filtered',  r.data.data.every(d => d.universityId === 1), true);

  r = await get('/departments/1');
  assert('GET /departments/1 → 200',                  r.status, 200);
  assert('GET /departments/1 → correct id',           r.data.data.departmentId, 1);

  r = await get('/departments/999');
  assert('GET /departments/999 → 404',                r.status, 404);

  // POST - missing fields
  r = await post('/departments', { majorName: 'Only Major' }, { role: 'admin' });
  assert('POST /departments (missing fields) → 400',  r.status, 400);

  // POST - success
  r = await post('/departments', {
    universityId: 1, majorName: 'Data Science', degreeType: 'B.Sc', faculty: 'Sciences'
  }, { role: 'admin' });
  assert('POST /departments → 201',                   r.status, 201);
  const newDeptId = r.data.data.departmentId;

  // PUT
  r = await put(`/departments/${newDeptId}`, {
    universityId: 1, majorName: 'Data Science Updated', degreeType: 'B.Sc', faculty: 'Sciences'
  }, { role: 'admin' });
  assert('PUT /departments/:id → 200',                r.status, 200);

  r = await get(`/departments/${newDeptId}`);
  assert('GET after PUT → majorName updated',         r.data.data.majorName, 'Data Science Updated');

  // DELETE
  r = await del(`/departments/${newDeptId}`, { role: 'admin' });
  assert('DELETE /departments/:id → 200',             r.status, 200);

  r = await get(`/departments/${newDeptId}`);
  assert('GET after DELETE → 404',                    r.status, 404);
}

async function testAdmissionThresholds() {
  section('ADMISSION THRESHOLDS');

  let r = await get('/admission-thresholds');
  assert('GET /admission-thresholds → 200',               r.status, 200);
  assert('GET /admission-thresholds → array',             Array.isArray(r.data.data), true);

  r = await get('/admission-thresholds?departmentId=1');
  assert('GET ?departmentId=1 → filtered',                r.data.data.every(t => t.departmentId === 1), true);

  r = await get('/admission-thresholds?year=2024');
  assert('GET ?year=2024 → filtered',                     r.data.data.every(t => t.year === 2024), true);

  r = await get('/admission-thresholds/1');
  assert('GET /admission-thresholds/1 → 200',             r.status, 200);

  r = await get('/admission-thresholds/999');
  assert('GET /admission-thresholds/999 → 404',           r.status, 404);

  // POST - invalid sekemType
  r = await post('/admission-thresholds', {
    departmentId: 1, year: 2025, sekemType: 'invalid',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 }, minSekem: 155
  }, { role: 'admin' });
  assert('POST (invalid sekemType) → 400',                r.status, 400);

  // POST - weights don't sum to 1
  r = await post('/admission-thresholds', {
    departmentId: 1, year: 2025, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.5, psychometricWeight: 0.6 }, minSekem: 155
  }, { role: 'admin' });
  assert('POST (weights != 1) → 400',                     r.status, 400);

  // POST - success
  r = await post('/admission-thresholds', {
    departmentId: 3, year: 2025, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 },
    sekemBonuses: [{ condition: '5-unit Math', points: 7 }],
    minSekem: 163
  }, { role: 'admin' });
  assert('POST /admission-thresholds → 201',              r.status, 201);
  const newThresholdId = r.data.data.thresholdId;

  // PUT
  r = await put(`/admission-thresholds/${newThresholdId}`, {
    departmentId: 3, year: 2025, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 }, minSekem: 165
  }, { role: 'admin' });
  assert('PUT /admission-thresholds/:id → 200',           r.status, 200);

  r = await get(`/admission-thresholds/${newThresholdId}`);
  assert('GET after PUT → minSekem updated',              r.data.data.minSekem, 165);

  // DELETE
  r = await del(`/admission-thresholds/${newThresholdId}`, { role: 'admin' });
  assert('DELETE /admission-thresholds/:id → 200',        r.status, 200);

  r = await get(`/admission-thresholds/${newThresholdId}`);
  assert('GET after DELETE → 404',                        r.status, 404);
}

async function testWatchlist() {
  section('USER WATCHLIST');

  let r = await get('/watchlist');
  assert('GET /watchlist → 200',                          r.status, 200);
  assert('GET /watchlist → array',                        Array.isArray(r.data.data), true);

  r = await get('/watchlist?userId=1');
  assert('GET ?userId=1 → filtered',                      r.data.data.every(w => w.userId === 1), true);

  r = await get('/watchlist?sekemStatus=passed-required-acceptance-score');
  assert('GET ?sekemStatus=passed-required-acceptance-score → filtered',          r.data.data.every(w => w.sekemStatus === 'passed-required-acceptance-score'), true);

  r = await get('/watchlist/1');
  assert('GET /watchlist/1 → 200',                        r.status, 200);

  r = await get('/watchlist/999');
  assert('GET /watchlist/999 → 404',                      r.status, 404);

  // POST - random invalid status
  r = await post('/watchlist', { userId: 1, departmentId: 3, status: 'Maybe' }, { role: 'user' });
  assert('POST (random invalid status) → 400',                          r.status, 400);
  assert('POST (random invalid status) → VALIDATION_ERROR',             r.data.error.code, 'VALIDATION_ERROR');

  // POST - sekem status values must not be accepted as status
  r = await post('/watchlist', { userId: 1, departmentId: 3, status: 'passed-required-acceptance-score' }, { role: 'user' });
  assert('POST (passed-required-acceptance-score as status) → 400',     r.status, 400);
  assert('POST (passed-required-acceptance-score as status) → VALIDATION_ERROR', r.data.error.code, 'VALIDATION_ERROR');

  r = await post('/watchlist', { userId: 1, departmentId: 3, status: 'below-required-acceptance-score' }, { role: 'user' });
  assert('POST (below-required-acceptance-score as status) → 400',      r.status, 400);
  assert('POST (below-required-acceptance-score as status) → VALIDATION_ERROR', r.data.error.code, 'VALIDATION_ERROR');

  r = await post('/watchlist', { userId: 1, departmentId: 3, status: 'no-data' }, { role: 'user' });
  assert('POST (no-data as status) → 400',                              r.status, 400);
  assert('POST (no-data as status) → VALIDATION_ERROR',                 r.data.error.code, 'VALIDATION_ERROR');

  // POST - user not found
  r = await post('/watchlist', { userId: 999, departmentId: 1, status: 'Interested' }, { role: 'user' });
  assert('POST (user not found) → 404',                   r.status, 404);

  // POST - department not found
  r = await post('/watchlist', { userId: 1, departmentId: 999, status: 'Interested' }, { role: 'user' });
  assert('POST (dept not found) → 404',                   r.status, 404);

  // POST - duplicate
  r = await post('/watchlist', { userId: 1, departmentId: 1, status: 'Interested' }, { role: 'user' });
  assert('POST (duplicate) → 400',                        r.status, 400);

  // POST - success (Interested)
  r = await post('/watchlist', { userId: 2, departmentId: 3, status: 'Interested' }, { role: 'user' });
  assert('POST /watchlist → 201',                         r.status, 201);
  const newWatchlistId = r.data.data.watchlistId;

  // PUT - random invalid status
  r = await put(`/watchlist/${newWatchlistId}`, { status: 'Maybe' }, { role: 'user' });
  assert('PUT (random invalid status) → 400',                           r.status, 400);
  assert('PUT (random invalid status) → VALIDATION_ERROR',              r.data.error.code, 'VALIDATION_ERROR');

  // PUT - sekem status values must not be accepted as status
  r = await put(`/watchlist/${newWatchlistId}`, { status: 'passed-required-acceptance-score' }, { role: 'user' });
  assert('PUT (passed-required-acceptance-score as status) → 400',      r.status, 400);
  assert('PUT (passed-required-acceptance-score as status) → VALIDATION_ERROR', r.data.error.code, 'VALIDATION_ERROR');

  r = await put(`/watchlist/${newWatchlistId}`, { status: 'below-required-acceptance-score' }, { role: 'user' });
  assert('PUT (below-required-acceptance-score as status) → 400',       r.status, 400);
  assert('PUT (below-required-acceptance-score as status) → VALIDATION_ERROR', r.data.error.code, 'VALIDATION_ERROR');

  r = await put(`/watchlist/${newWatchlistId}`, { status: 'no-data' }, { role: 'user' });
  assert('PUT (no-data as status) → 400',                               r.status, 400);
  assert('PUT (no-data as status) → VALIDATION_ERROR',                  r.data.error.code, 'VALIDATION_ERROR');

  // PUT - valid intent status update
  r = await put(`/watchlist/${newWatchlistId}`, { status: 'Applied' }, { role: 'user' });
  assert('PUT /watchlist/:id → 200',                      r.status, 200);

  r = await get(`/watchlist/${newWatchlistId}`);
  assert('GET after PUT → status updated',                r.data.data.status, 'Applied');

  // DELETE
  r = await del(`/watchlist/${newWatchlistId}`, { role: 'user' });
  assert('DELETE /watchlist/:id → 200',                   r.status, 200);

  r = await get(`/watchlist/${newWatchlistId}`);
  assert('GET after DELETE → 404',                        r.status, 404);
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function run() {
  console.log('🚀 UniPathway API - Automated Tests');
  console.log(`   Target: ${BASE_URL}\n`);

  try {
    await testUsers();
    await testUniversities();
    await testDepartments();
    await testAdmissionThresholds();
    await testWatchlist();
  } catch (err) {
    console.error('\n💥 Unexpected error during tests:', err.message);
    console.error('   Is the server running on port 3000?\n');
    process.exit(1);
  }

  // ─── Summary ─────────────────────────────────────────────────────────────
  console.log(results.join('\n'));
  console.log('\n' + '─'.repeat(40));
  console.log(`Total:  ${passed + failed} tests`);
  console.log(`✅ Passed: ${passed}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  } else {
    console.log('🎉 All tests passed!');
  }
  console.log('─'.repeat(40));

  process.exit(failed > 0 ? 1 : 0);
}

run();