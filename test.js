/**
 * UniPathway API - Automated Test Script
 * Run with: node docs/test.js
 * Make sure the server is running on http://localhost:3000 first
 */

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const results = [];

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

const get  = (path, opts)       => request('GET',    path, opts);
const post = (path, body, opts) => request('POST',   path, { body, ...opts });
const put  = (path, body, opts) => request('PUT',    path, { body, ...opts });
const del  = (path, opts)       => request('DELETE', path, opts);

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

// Sample full bagrut object for tests
const sampleBagrut = {
  bibleStudies:     { grade: 80, units: 2 },
  literature:       { grade: 78, units: 2 },
  hebrewExpression: { grade: 82, units: 2 },
  history:          { grade: 75, units: 2 },
  civics:           { grade: 79, units: 2 },
  mathematics:      { grade: 88, units: 4 },
  english:          { grade: 91, units: 5 }
};
const samplePsychometric = { verbal: 110, quantitative: 120, english: 115 };

// ──────────────────────────────────────────────────────────────────────
async function testUsers() {
  section('USERS');

  let r = await get('/users');
  assert('GET /users → 200',           r.status, 200);
  assert('GET /users → returns array', Array.isArray(r.data.data), true);

  r = await get('/users/1');
  assert('GET /users/1 → 200',         r.status, 200);
  assert('GET /users/1 → correct id',  r.data.data.userId, 1);

  r = await get('/users/999');
  assert('GET /users/999 → 404',       r.status, 404);

  // POST - editor no longer allowed
  r = await post('/users', { firstName: 'X', lastName: 'Y', userRole: 'user' }, { role: 'editor' });
  assert('POST /users (editor role) → 403',  r.status, 403);

  // POST - user not allowed
  r = await post('/users', { firstName: 'X', lastName: 'Y', userRole: 'user' }, { role: 'user' });
  assert('POST /users (user role) → 403',    r.status, 403);

  // POST - missing fields
  r = await post('/users', { firstName: 'Tal' }, { role: 'admin' });
  assert('POST /users (missing fields) → 400', r.status, 400);

  // POST - invalid role value
  r = await post('/users', { firstName: 'X', lastName: 'Y', userRole: 'superadmin' }, { role: 'admin' });
  assert('POST /users (invalid userRole) → 400', r.status, 400);

  // POST - success
  r = await post('/users', { firstName: 'Test', lastName: 'User', userRole: 'user' }, { role: 'admin' });
  assert('POST /users → 201',          r.status, 201);
  const newUserId = r.data.data.userId;

  // PUT - editor forbidden
  r = await put(`/users/${newUserId}`, { firstName: 'X', lastName: 'Y', userRole: 'user' }, { role: 'editor' });
  assert('PUT /users (editor role) → 403',   r.status, 403);

  // PUT - admin allowed
  r = await put(`/users/${newUserId}`, { firstName: 'Updated', lastName: 'User', userRole: 'user' }, { role: 'admin' });
  assert('PUT /users/:id → 200',       r.status, 200);

  r = await get(`/users/${newUserId}`);
  assert('GET after PUT → firstName updated', r.data.data.firstName, 'Updated');

  // DELETE - editor forbidden
  r = await del(`/users/${newUserId}`, { role: 'editor' });
  assert('DELETE /users (editor) → 403', r.status, 403);

  // DELETE - admin
  r = await del(`/users/${newUserId}`, { role: 'admin' });
  assert('DELETE /users/:id → 200',    r.status, 200);

  r = await get(`/users/${newUserId}`);
  assert('GET after DELETE → 404',     r.status, 404);
}

// ──────────────────────────────────────────────────────────────────────
async function testUniversities() {
  section('UNIVERSITIES');

  let r = await get('/universities');
  assert('GET /universities → 200',          r.status, 200);

  r = await get('/universities?location=Haifa');
  assert('GET ?location=Haifa → filtered',   r.data.data.every(u => u.location === 'Haifa'), true);

  r = await get('/universities/999');
  assert('GET /universities/999 → 404',      r.status, 404);

  // editor allowed
  r = await post('/universities', { name: 'Test U', location: 'Test City' }, { role: 'editor' });
  assert('POST /universities (editor) → 201', r.status, 201);
  const uniId = r.data.data.universityId;

  // user forbidden
  r = await post('/universities', { name: 'Y', location: 'Z' }, { role: 'user' });
  assert('POST /universities (user) → 403',  r.status, 403);

  r = await put(`/universities/${uniId}`, { name: 'Updated', location: 'Y' }, { role: 'editor' });
  assert('PUT /universities (editor) → 200', r.status, 200);

  // editor cannot delete
  r = await del(`/universities/${uniId}`, { role: 'editor' });
  assert('DELETE /universities (editor) → 403', r.status, 403);

  r = await del(`/universities/${uniId}`, { role: 'admin' });
  assert('DELETE /universities (admin) → 200', r.status, 200);
}

// ──────────────────────────────────────────────────────────────────────
async function testDepartments() {
  section('DEPARTMENTS');

  let r = await get('/departments');
  assert('GET /departments → 200',                   r.status, 200);

  r = await get('/departments?major=Computer Science');
  assert('GET ?major → filtered',                    r.data.data.every(d => d.majorName.toLowerCase().includes('computer science')), true);

  r = await get('/departments?universityId=1');
  assert('GET ?universityId → filtered',             r.data.data.every(d => d.universityId === 1), true);

  r = await get('/departments/999');
  assert('GET /departments/999 → 404',               r.status, 404);

  r = await post('/departments', { universityId: 1, majorName: 'Data Sci', degreeType: 'B.Sc', faculty: 'Sciences' }, { role: 'editor' });
  assert('POST /departments (editor) → 201',         r.status, 201);
  const deptId = r.data.data.departmentId;

  r = await post('/departments', { universityId: 1, majorName: 'X', degreeType: 'B.Sc', faculty: 'Y' }, { role: 'user' });
  assert('POST /departments (user) → 403',           r.status, 403);

  r = await put(`/departments/${deptId}`, { universityId: 1, majorName: 'Updated', degreeType: 'B.Sc', faculty: 'Sciences' }, { role: 'editor' });
  assert('PUT /departments (editor) → 200',          r.status, 200);

  r = await del(`/departments/${deptId}`, { role: 'editor' });
  assert('DELETE /departments (editor) → 403',       r.status, 403);

  r = await del(`/departments/${deptId}`, { role: 'admin' });
  assert('DELETE /departments (admin) → 200',        r.status, 200);
}

// ──────────────────────────────────────────────────────────────────────
async function testAdmissionThresholds() {
  section('ADMISSION THRESHOLDS');

  let r = await get('/admission-thresholds');
  assert('GET /admission-thresholds → 200',              r.status, 200);

  r = await get('/admission-thresholds?departmentId=1');
  assert('GET ?departmentId=1 → filtered',               r.data.data.every(t => t.departmentId === 1), true);

  // invalid sekemType
  r = await post('/admission-thresholds', {
    departmentId: 1, year: 2025, sekemType: 'bad',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 }, minSekem: 155
  }, { role: 'admin' });
  assert('POST (invalid sekemType) → 400',               r.status, 400);

  // weights don't sum to 1
  r = await post('/admission-thresholds', {
    departmentId: 1, year: 2025, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.5, psychometricWeight: 0.6 }, minSekem: 155
  }, { role: 'admin' });
  assert('POST (weights != 1) → 400',                    r.status, 400);

  // success
  r = await post('/admission-thresholds', {
    departmentId: 3, year: 2025, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 },
    sekemBonuses: [{ condition: '5-unit Math', points: 7 }],
    minSekem: 163
  }, { role: 'editor' });
  assert('POST /admission-thresholds (editor) → 201',    r.status, 201);
  const thresholdId = r.data.data.thresholdId;

  // user forbidden
  r = await post('/admission-thresholds', {
    departmentId: 1, year: 2026, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 }, minSekem: 100
  }, { role: 'user' });
  assert('POST /admission-thresholds (user) → 403',      r.status, 403);

  // editor cannot delete
  r = await del(`/admission-thresholds/${thresholdId}`, { role: 'editor' });
  assert('DELETE (editor) → 403',                        r.status, 403);

  r = await del(`/admission-thresholds/${thresholdId}`, { role: 'admin' });
  assert('DELETE (admin) → 200',                         r.status, 200);
}

// ──────────────────────────────────────────────────────────────────────
async function testAcademicScores() {
  section('ACADEMIC SCORES');

  // editor blocked from reading entirely
  let r = await get('/academic-scores', { role: 'editor' });
  assert('GET /academic-scores (editor) → 403',           r.status, 403);

  // admin allowed
  r = await get('/academic-scores', { role: 'admin' });
  assert('GET /academic-scores (admin) → 200',            r.status, 200);

  r = await get('/academic-scores?userId=1', { role: 'admin' });
  assert('GET ?userId=1 → filtered',                      r.data.data.every(s => s.userId === 1), true);

  r = await get('/academic-scores/999', { role: 'admin' });
  assert('GET /academic-scores/999 → 404',                r.status, 404);

  // Create a fresh user for testing scores
  let createRes = await post('/users', { firstName: 'Score', lastName: 'Test', userRole: 'user' }, { role: 'admin' });
  const tempUserId = createRes.data.data.userId;

  // POST - editor forbidden
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'editor' });
  assert('POST /academic-scores (editor) → 403',          r.status, 403);

  // POST - missing userId
  r = await post('/academic-scores', { psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'admin' });
  assert('POST (missing userId) → 400',                   r.status, 400);

  // POST - cannot add scores for an admin user
  r = await post('/academic-scores', { userId: 1, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'admin' });
  assert('POST (scores for admin user) → 400',            r.status, 400);

  // POST - invalid psychometric range
  r = await post('/academic-scores', {
    userId: tempUserId,
    psychometricScores: { verbal: 999, quantitative: 120, english: 110 },
    bagrutScores: sampleBagrut
  }, { role: 'admin' });
  assert('POST (bad psychometric) → 400',                 r.status, 400);

  // POST - missing mandatory bagrut subject
  const partialBagrut = { ...sampleBagrut };
  delete partialBagrut.civics;
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: partialBagrut }, { role: 'admin' });
  assert('POST (missing mandatory subject) → 400',        r.status, 400);

  // POST - success
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'admin' });
  assert('POST /academic-scores → 201',                   r.status, 201);
  assert('POST → watchlistEntriesRecalculated is number', typeof r.data.data.watchlistEntriesRecalculated, 'number');
  const newScoresId = r.data.data.academicScoresId;

  // POST - cannot add a second scores entry for same user
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'admin' });
  assert('POST (duplicate scores for user) → 400',        r.status, 400);

  // PUT - update scores
  r = await put(`/academic-scores/${newScoresId}`, {
    psychometricScores: { verbal: 130, quantitative: 140, english: 130 },
    bagrutScores: sampleBagrut
  }, { role: 'admin' });
  assert('PUT /academic-scores → 200',                    r.status, 200);
  assert('PUT → watchlistEntriesRecalculated is number',  typeof r.data.data.watchlistEntriesRecalculated, 'number');

  // DELETE - editor forbidden
  r = await del(`/academic-scores/${newScoresId}`, { role: 'editor' });
  assert('DELETE /academic-scores (editor) → 403',        r.status, 403);

  // DELETE - admin
  r = await del(`/academic-scores/${newScoresId}`, { role: 'admin' });
  assert('DELETE /academic-scores → 200',                 r.status, 200);

  // Cleanup the test user
  await del(`/users/${tempUserId}`, { role: 'admin' });
}

// ──────────────────────────────────────────────────────────────────────
async function testWatchlist() {
  section('USER WATCHLIST');

  // editor blocked from reading
  let r = await get('/watchlist', { role: 'editor' });
  assert('GET /watchlist (editor) → 403',                 r.status, 403);

  r = await get('/watchlist', { role: 'admin' });
  assert('GET /watchlist (admin) → 200',                  r.status, 200);

  r = await get('/watchlist?userId=1', { role: 'user' });
  assert('GET ?userId=1 (user) → filtered',               r.data.data.every(w => w.userId === 1), true);

  r = await get('/watchlist?sekemStatus=passed-required-acceptance-score', { role: 'admin' });
  assert('GET ?sekemStatus=passed → filtered',            r.data.data.every(w => w.sekemStatus === 'passed-required-acceptance-score'), true);

  // POST - invalid status values
  r = await post('/watchlist', { userId: 2, departmentId: 3, status: 'Maybe' }, { role: 'user' });
  assert('POST (invalid status) → 400',                   r.status, 400);

  r = await post('/watchlist', { userId: 2, departmentId: 3, status: 'passed-required-acceptance-score' }, { role: 'user' });
  assert('POST (sekem status as status) → 400',           r.status, 400);

  // POST - cannot watchlist for an admin/editor user
  r = await post('/watchlist', { userId: 1, departmentId: 3 }, { role: 'admin' });
  assert('POST (watchlist for admin user) → 400',         r.status, 400);

  r = await post('/watchlist', { userId: 4, departmentId: 3 }, { role: 'admin' });
  assert('POST (watchlist for editor user) → 400',        r.status, 400);

  // POST - user/dept not found
  r = await post('/watchlist', { userId: 999, departmentId: 1 }, { role: 'user' });
  assert('POST (user not found) → 404',                   r.status, 404);

  r = await post('/watchlist', { userId: 2, departmentId: 999 }, { role: 'user' });
  assert('POST (dept not found) → 404',                   r.status, 404);

  // POST - duplicate
  r = await post('/watchlist', { userId: 1, departmentId: 1 }, { role: 'user' });
  assert('POST (duplicate) → 400',                        r.status, 400);

  // POST - success with default status
  r = await post('/watchlist', { userId: 2, departmentId: 3 }, { role: 'user' });
  assert('POST /watchlist (default status) → 201',        r.status, 201);
  assert('POST → status defaults to Interested',          r.data.data.status, 'Interested');
  assert('POST → sekemStatus is server-calculated',
    ['passed-required-acceptance-score','below-required-acceptance-score','no-data'].includes(r.data.data.sekemStatus), true);
  const newEntryId = r.data.data.watchlistId;

  // PUT - update status
  r = await put(`/watchlist/${newEntryId}`, { status: 'Applied' }, { role: 'user' });
  assert('PUT /watchlist/:id → 200',                      r.status, 200);

  r = await get(`/watchlist/${newEntryId}`, { role: 'admin' });
  assert('GET after PUT → status updated to Applied',     r.data.data.status, 'Applied');

  // PUT - sekem status as status rejected
  r = await put(`/watchlist/${newEntryId}`, { status: 'passed-required-acceptance-score' }, { role: 'user' });
  assert('PUT (sekem status as status) → 400',            r.status, 400);

  // DELETE - editor forbidden
  r = await del(`/watchlist/${newEntryId}`, { role: 'editor' });
  assert('DELETE /watchlist (editor) → 403',              r.status, 403);

  r = await del(`/watchlist/${newEntryId}`, { role: 'user' });
  assert('DELETE /watchlist/:id → 200',                   r.status, 200);
}

// ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('🚀 UniPathway API - Automated Tests');
  console.log(`   Target: ${BASE_URL}\n`);

  try {
    await testUsers();
    await testUniversities();
    await testDepartments();
    await testAdmissionThresholds();
    await testAcademicScores();
    await testWatchlist();
  } catch (err) {
    console.error('\n💥 Unexpected error during tests:', err.message);
    console.error('   Is the server running on port 3000?\n');
    process.exit(1);
  }

  console.log(results.join('\n'));
  console.log('\n' + '─'.repeat(40));
  console.log(`Total:  ${passed + failed} tests`);
  console.log(`✅ Passed: ${passed}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  else            console.log('🎉 All tests passed!');
  console.log('─'.repeat(40));
  process.exit(failed > 0 ? 1 : 0);
}

run();
