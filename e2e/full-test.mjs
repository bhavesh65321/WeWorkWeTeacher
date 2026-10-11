import { chromium } from 'playwright';

const API = 'http://localhost:4000/api';
const WEB = 'http://localhost:3000';

const results = { passed: 0, failed: 0, issues: [] };

function pass(test) { console.log(`✅ ${test}`); results.passed++; }
function fail(test, reason) { 
  console.log(`❌ ${test}: ${reason}`); 
  results.failed++; 
  results.issues.push({ test, reason });
}

async function apiTest(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (e) {
    fail(name, e.message);
  }
}

async function uiTest(page, name, fn) {
  try {
    await fn(page);
    pass(name);
  } catch (e) {
    fail(name, e.message);
  }
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

console.log('🧪 COMPREHENSIVE E2E TESTING');
console.log('============================\n');

// ============ PHASE 1: API TESTING ============
console.log('📡 PHASE 1: API TESTING\n');

let studentToken, tutorToken;

await apiTest('API Health Check', async () => {
  const { data } = await api('/health');
  if (!data.ok) throw new Error('API not healthy');
});

await apiTest('Register New Student', async () => {
  const { status, data } = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Student', email: `test.student.${Date.now()}@test.com`, password: 'Test@123' })
  });
  if (status !== 201 && status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
});

await apiTest('Login as Student (dev@wtws.dev)', async () => {
  const { status, data } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'dev@wtws.dev', password: 'password123' })
  });
  if (status !== 200 && status !== 201) throw new Error(`Status ${status}`);
  studentToken = data.token;
});

await apiTest('Login as Tutor (amina@wtws.dev)', async () => {
  const { status, data } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'amina@wtws.dev', password: 'password123' })
  });
  if (status !== 200 && status !== 201) throw new Error(`Status ${status}`);
  tutorToken = data.token;
});

await apiTest('Get User Profile (/auth/me)', async () => {
  const { status, data } = await api('/auth/me', { headers: { Authorization: `Bearer ${studentToken}` } });
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!data.name) throw new Error('No user name');
});

await apiTest('Invalid Login Rejected', async () => {
  const { status } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'wrong@email.com', password: 'wrong' })
  });
  if (status !== 401) throw new Error(`Expected 401, got ${status}`);
});

await apiTest('Unauthorized Access Rejected', async () => {
  const { status } = await api('/auth/me');
  if (status !== 401) throw new Error(`Expected 401, got ${status}`);
});

await apiTest('Get Tutors List', async () => {
  const { status, data } = await api('/tutors');
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!Array.isArray(data)) throw new Error('Expected array');
});

await apiTest('Get Tutor Profile by Slug', async () => {
  const { status, data } = await api('/tutors/dev-patel');
  if (status !== 200) throw new Error(`Status ${status}`);
  if (data.name !== 'Dev Patel') throw new Error('Wrong tutor');
});

await apiTest('Get Tutor Meta', async () => {
  const { status, data } = await api('/tutors/meta');
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!data.subjects) throw new Error('No subjects');
});

await apiTest('Get Jobs List', async () => {
  const { status, data } = await api('/jobs');
  if (status !== 200) throw new Error(`Status ${status}`);
});

await apiTest('Get My Jobs', async () => {
  const { status } = await api('/jobs/mine', { headers: { Authorization: `Bearer ${studentToken}` } });
  if (status !== 200) throw new Error(`Status ${status}`);
});

let jobId;
await apiTest('Post a New Job', async () => {
  const { status, data } = await api('/jobs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({
      subject: 'Mathematics',
      level: 'High school',
      mode: 'ONLINE',
      budget: 'Under ₹500/hr',
      description: 'Need help with calculus',
      city: 'Mumbai'
    })
  });
  if (status !== 201 && status !== 200) throw new Error(`Status ${status}: ${JSON.stringify(data)}`);
  jobId = data.id;
});

await apiTest('Get Wallet Balance', async () => {
  const { status, data } = await api('/wallet', { headers: { Authorization: `Bearer ${studentToken}` } });
  if (status !== 200) throw new Error(`Status ${status}`);
  if (typeof data.coinBalance !== 'number') throw new Error('No balance');
});

await apiTest('Get Notifications', async () => {
  const { status } = await api('/notifications', { headers: { Authorization: `Bearer ${studentToken}` } });
  if (status !== 200) throw new Error(`Status ${status}`);
});

await apiTest('Get Conversations', async () => {
  const { status } = await api('/conversations', { headers: { Authorization: `Bearer ${studentToken}` } });
  if (status !== 200) throw new Error(`Status ${status}`);
});

await apiTest('Get Bookings', async () => {
  const { status } = await api('/bookings', { headers: { Authorization: `Bearer ${studentToken}` } });
  if (status !== 200) throw new Error(`Status ${status}`);
});

await apiTest('Get Payment Packs', async () => {
  const { status, data } = await api('/payments/packs');
  if (status !== 200) throw new Error(`Status ${status}`);
  if (!data.packs) throw new Error('No packs');
});

await apiTest('Tutor Apply to Job', async () => {
  if (!jobId) throw new Error('No job to apply');
  const { status } = await api(`/jobs/${jobId}/apply`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tutorToken}` },
    body: JSON.stringify({ message: 'I can help!' })
  });
  if (status !== 201 && status !== 200 && status !== 400) throw new Error(`Status ${status}`);
});

await apiTest('Submit Support Ticket', async () => {
  const { status } = await api('/support', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ subject: 'Test', message: 'Test ticket' })
  });
  if (status !== 201 && status !== 200) throw new Error(`Status ${status}`);
});

console.log('\n');

// ============ PHASE 2: UI TESTING ============
console.log('🖥️  PHASE 2: UI TESTING\n');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultTimeout(15000);

await uiTest(page, 'Homepage Loads', async (p) => {
  await p.goto(WEB);
  const title = await p.title();
  if (!title.includes('WeTeacherWeStudent')) throw new Error(`Wrong title: ${title}`);
});

await uiTest(page, 'Homepage Navigation Links', async (p) => {
  await p.goto(WEB);
  const loginLink = await p.locator('a[href="/login"]').first().isVisible();
  if (!loginLink) throw new Error('No login link');
});

await uiTest(page, 'Login Page Form Fields', async (p) => {
  await p.goto(`${WEB}/login`);
  const emailField = await p.locator('input[name="email"]').isVisible();
  const passField = await p.locator('input[name="password"]').isVisible();
  if (!emailField || !passField) throw new Error('Missing form fields');
});

await uiTest(page, 'Login Success Flow', async (p) => {
  await p.goto(`${WEB}/login`);
  await p.fill('input[name="email"]', 'dev@wtws.dev');
  await p.fill('input[name="password"]', 'password123');
  await p.click('button[type="submit"]');
  await p.waitForURL(/\/(dashboard|verify|tutors)/, { timeout: 15000 });
});

await uiTest(page, 'Dashboard Accessible', async (p) => {
  await p.goto(`${WEB}/dashboard`);
  await p.waitForTimeout(1000);
  if (p.url().includes('/login')) throw new Error('Session lost');
});

await uiTest(page, 'Register Page Form', async (p) => {
  await p.goto(`${WEB}/register`);
  const nameField = await p.locator('input[name="name"]').isVisible();
  if (!nameField) throw new Error('Missing name field');
});

await uiTest(page, 'Tutors Page Loads', async (p) => {
  await p.goto(`${WEB}/tutors`);
  await p.waitForTimeout(2000);
});

await uiTest(page, 'Jobs Page Loads', async (p) => {
  await p.goto(`${WEB}/jobs`);
  await p.waitForTimeout(2000);
});

await uiTest(page, 'Settings Page Loads', async (p) => {
  await p.goto(`${WEB}/settings`);
  await p.waitForTimeout(1000);
});

await uiTest(page, 'Post Job Page', async (p) => {
  await p.goto(`${WEB}/jobs/new`);
  await p.waitForTimeout(1000);
});

await uiTest(page, 'Tutor Profile Page', async (p) => {
  await p.goto(`${WEB}/tutors/dev-patel`);
  await p.waitForTimeout(2000);
});

await uiTest(page, 'Wallet Page', async (p) => {
  await p.goto(`${WEB}/wallet`);
  await p.waitForTimeout(1000);
});

await uiTest(page, 'Messages Page', async (p) => {
  await p.goto(`${WEB}/messages`);
  await p.waitForTimeout(1000);
});

await uiTest(page, 'Invalid Login Shows Error', async (p) => {
  await p.goto(`${WEB}/login`);
  await p.fill('input[name="email"]', 'wrong@email.com');
  await p.fill('input[name="password"]', 'wrongpassword');
  await p.click('button[type="submit"]');
  await p.waitForTimeout(2000);
  if (!p.url().includes('/login')) throw new Error('Should stay on login');
});

await uiTest(page, 'Mobile Responsive (375px)', async (p) => {
  await p.setViewportSize({ width: 375, height: 667 });
  await p.goto(WEB);
  await p.waitForTimeout(1000);
  const bodyWidth = await p.evaluate(() => document.body.scrollWidth);
  if (bodyWidth > 400) throw new Error(`Page too wide: ${bodyWidth}px`);
  await p.setViewportSize({ width: 1280, height: 720 });
});

await uiTest(page, 'Tutor Edit Page', async (p) => {
  await p.goto(`${WEB}/tutors/edit`);
  await p.waitForTimeout(1000);
});

await browser.close();

console.log('\n');
console.log('📊 TEST RESULTS');
console.log('================');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`📈 Pass Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

if (results.issues.length > 0) {
  console.log('\n🐛 ISSUES FOUND:');
  results.issues.forEach((issue, i) => {
    console.log(`   ${i + 1}. ${issue.test}`);
    console.log(`      → ${issue.reason}`);
  });
}

console.log('\n🏁 Testing Complete!');
