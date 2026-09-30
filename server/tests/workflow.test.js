const assert = require('assert');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}`;

async function runTests() {
  console.log('========================================================');
  console.log('STARTING TRACKOPS BD AUTOMATED WORKFLOW VERIFICATION TEST');
  console.log(`Target API: ${BASE_URL}`);
  console.log('========================================================\n');

  try {
    // 0. Verify Health
    console.log('[Test 0] Checking Health Endpoint...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(healthRes.status, 200, 'Health check failed');
    const healthData = await healthRes.json();
    console.log('  -> Health status:', healthData.status, healthData.platform);

    // WORKFLOW 1: Register → Pending → Super Admin Approves → Login → Create Link
    console.log('\n[Workflow 1] Register -> Pending -> Super Admin Approves -> Login -> Create Link');
    const testEmail = `detective.test.${Date.now()}@trackops.local`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Detective Test Agent',
        email: testEmail,
        phone: `+880199${Math.floor(100000 + Math.random() * 900000)}`,
        password: 'TestPassword@2026',
        confirmPassword: 'TestPassword@2026',
      }),
    });
    const regData = await regRes.json();
    assert.strictEqual(regRes.status, 201, 'Registration should return 201');
    assert.strictEqual(regData.status, 'PENDING', 'New user status must be PENDING');
    const newUserId = regData.user.id;
    console.log('  1.1 Registered user successfully with status PENDING:', newUserId);

    // Try to login as pending user
    const pendingLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: 'TestPassword@2026',
      }),
    });
    const pendingLoginData = await pendingLoginRes.json();
    assert.strictEqual(pendingLoginData.user.status, 'PENDING');
    const pendingToken = pendingLoginData.token;
    console.log('  1.2 Pending user logged in, status verified as PENDING');

    // Attempt to create link as pending user (MUST BE FORBIDDEN)
    const pendingCreateRes = await fetch(`${BASE_URL}/api/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pendingToken}`,
      },
      body: JSON.stringify({
        destinationUrl: 'https://bangladesh.gov.bd',
        title: 'Unauthorized Link',
      }),
    });
    assert.strictEqual(pendingCreateRes.status, 403, 'Pending user must NOT be allowed to create links');
    console.log('  1.3 Correctly BLOCKED pending user from creating links (Status 403 Forbidden)');

    // Login as Super Admin
    const saLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'superadmin@trackops.local',
        password: 'DemoSuperAdmin@2026',
      }),
    });
    const saData = await saLoginRes.json();
    assert.strictEqual(saLoginRes.status, 200);
    const saToken = saData.token;
    console.log('  1.4 Super Admin logged in successfully');

    // Super Admin Approves the user
    const approveRes = await fetch(`${BASE_URL}/api/users/${newUserId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${saToken}` },
    });
    const approveData = await approveRes.json();
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveData.user.status, 'APPROVED');
    console.log('  1.5 Super Admin approved new user. Status is now APPROVED');

    // Now newly approved user creates a link
    const newOfficerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: 'TestPassword@2026',
      }),
    });
    const newOfficerData = await newOfficerLoginRes.json();
    const approvedToken = newOfficerData.token;

    const createLinkRes = await fetch(`${BASE_URL}/api/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${approvedToken}`,
      },
      body: JSON.stringify({
        destinationUrl: 'https://bangladesh.gov.bd/portal',
        customShortCode: `test-case-${Date.now().toString().slice(-4)}`,
        title: 'Cyber Case Verification Portal',
        description: 'Authorized test inquiry link',
        caseReference: 'CASE-TEST-2026',
      }),
    });
    const linkData = await createLinkRes.json();
    assert.strictEqual(createLinkRes.status, 201, 'Approved user should create link');
    assert.ok(linkData.link.shortCode, 'Short code generated');
    const createdShortCode = linkData.link.shortCode;
    const createdLinkId = linkData.link._id;
    console.log(`  1.6 Approved user created link [${createdShortCode}] for ${linkData.link.caseReference}`);

    // WORKFLOW 2: Resolve short code / Open Visitor Page
    console.log('\n[Workflow 2] Resolve Short Link -> Open Visitor Page');
    const resolveRes = await fetch(`${BASE_URL}/api/visitor/resolve/${createdShortCode}`);
    const resolveData = await resolveRes.json();
    assert.strictEqual(resolveRes.status, 200, 'Resolve link should be 200');
    assert.strictEqual(resolveData.link.shortCode, createdShortCode);
    console.log('  2.1 Visitor successfully resolved short link destination and case information:', resolveData.link.title);

    // WORKFLOW 3: Visitor Reviews Permission Request -> Grants Voluntary Consent
    console.log('\n[Workflow 3] Visitor Grants Voluntary Location Permission and Proceeds');
    const consentRes = await fetch(`${BASE_URL}/api/visitor/consent/${createdShortCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorSessionId: 'test-session-visitor-101',
        consentStatus: 'GRANTED',
        locationGranted: true,
        cameraGranted: false,
        browserInfoGranted: true,
        latitude: 23.8103, // Dhaka coordinates
        longitude: 90.4125,
        accuracy: 14.5,
        browserInfo: {
          browser: 'Firefox 129.0',
          os: 'Windows 11',
          device: 'Desktop',
          screenResolution: '1920x1080',
          language: 'en-US',
        },
      }),
    });
    const consentData = await consentRes.json();
    assert.strictEqual(consentRes.status, 200);
    assert.strictEqual(consentData.destinationUrl, 'https://bangladesh.gov.bd/portal');
    console.log('  3.1 Voluntary consent and coordinates successfully logged. Visitor redirected to:', consentData.destinationUrl);

    // WORKFLOW 4: Authorized User Views Link Activity and Consent Records
    console.log('\n[Workflow 4] Authorized User Views Link Activity & Geolocation Records');
    const activityRes = await fetch(`${BASE_URL}/api/links/${createdLinkId}/activity`, {
      headers: { Authorization: `Bearer ${approvedToken}` },
    });
    const activityData = await activityRes.json();
    assert.strictEqual(activityRes.status, 200);
    assert.strictEqual(activityData.geoPoints.length, 1, 'Should have 1 recorded geopoint');
    assert.strictEqual(activityData.geoPoints[0].latitude, 23.8103);
    assert.strictEqual(activityData.geoPoints[0].longitude, 90.4125);
    console.log(`  4.1 Authorized user successfully viewed coordinates: (${activityData.geoPoints[0].latitude}, ${activityData.geoPoints[0].longitude}) with accuracy ${activityData.geoPoints[0].accuracy}m`);

    // WORKFLOW 5: Super Admin Approves, Suspends, Restores, and Deletes Accounts
    console.log('\n[Workflow 5] Super Admin Lifecycle: Suspend -> Restore -> Role Change -> Delete');
    // Suspend
    const suspendRes = await fetch(`${BASE_URL}/api/users/${newUserId}/suspend`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${saToken}`,
      },
      body: JSON.stringify({ reason: 'Audit hold' }),
    });
    const suspendData = await suspendRes.json();
    assert.strictEqual(suspendData.user.status, 'SUSPENDED');
    console.log('  5.1 User suspended successfully');

    // Restore
    const restoreRes = await fetch(`${BASE_URL}/api/users/${newUserId}/restore`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${saToken}` },
    });
    const restoreData = await restoreRes.json();
    assert.strictEqual(restoreData.user.status, 'APPROVED');
    console.log('  5.2 User restored to APPROVED status');

    // Role change to ADMIN
    const roleRes = await fetch(`${BASE_URL}/api/users/${newUserId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${saToken}`,
      },
      body: JSON.stringify({ role: 'ADMIN' }),
    });
    const roleData = await roleRes.json();
    assert.strictEqual(roleData.user.role, 'ADMIN');
    console.log('  5.3 User role promoted to ADMIN');

    // Delete
    const deleteRes = await fetch(`${BASE_URL}/api/users/${newUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${saToken}` },
    });
    assert.strictEqual(deleteRes.status, 200);
    console.log('  5.4 User deleted successfully by Super Admin');

    // WORKFLOW 6: Unauthorized User Attempts Admin Access -> Blocked (403 Forbidden)
    console.log('\n[Workflow 6] Unauthorized User Attempts Admin Access -> Blocked');
    // Login as normal demo officer
    const officerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'officer@trackops.local',
        password: 'DemoOfficer@2026',
      }),
    });
    const officerData = await officerLoginRes.json();
    const officerToken = officerData.token;

    // Normal officer attempts to call Super Admin user management
    const unauthorizedRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    assert.strictEqual(unauthorizedRes.status, 403, 'Normal officer should get 403 on admin user list');
    console.log('  6.1 Normal officer unauthorized attempt to access admin routes correctly rejected with status 403 Forbidden');

    console.log('\n========================================================');
    console.log('ALL 6 END-TO-END WORKFLOW TESTS PASSED SUCCESSFULLY! 100%');
    console.log('========================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
