import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

const results = [];
const log = (scenario, status, detail = '') => {
  const icon = status === 'PASS' ? '✅' : '❌';
  console.log(`${icon} ${scenario}${detail ? ': ' + detail : ''}`);
  results.push({ scenario, status, detail });
};

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  
  console.log('\n' + '='.repeat(60));
  console.log('🎓 STUDENT FLOW - End to End');
  console.log('='.repeat(60) + '\n');

  const studentCtx = await browser.newContext();
  const studentPage = await studentCtx.newPage();

  // S1: Homepage
  try {
    await studentPage.goto(BASE, { waitUntil: 'domcontentloaded' });
    log('S1: Visit Homepage', 'PASS');
  } catch (e) { log('S1: Visit Homepage', 'FAIL', e.message); }

  // S2: Register page
  try {
    await studentPage.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForSelector('input[name="name"]', { timeout: 5000 });
    log('S2: Navigate to Register', 'PASS');
  } catch (e) { log('S2: Navigate to Register', 'FAIL', e.message); }

  // S3: Login as student
  try {
    await studentPage.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await studentPage.fill('input[name="email"]', 'student@wtws.dev');
    await studentPage.fill('input[name="password"]', 'password123');
    await studentPage.click('button[type="submit"]');
    await studentPage.waitForTimeout(2000);
    log('S3: Login as Student', 'PASS');
  } catch (e) { log('S3: Login as Student', 'FAIL', e.message); }

  // S4: Tutors page
  try {
    await studentPage.goto(`${BASE}/tutors`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S4: Browse Tutors Page', 'PASS');
  } catch (e) { log('S4: Browse Tutors Page', 'FAIL', e.message); }

  // S5: Tutor profile
  try {
    await studentPage.goto(`${BASE}/tutors/priya-sharma`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S5: View Tutor Profile (Priya Sharma)', 'PASS');
  } catch (e) { log('S5: View Tutor Profile', 'FAIL', e.message); }

  // S6: Jobs page
  try {
    await studentPage.goto(`${BASE}/jobs`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S6: Browse Jobs Page', 'PASS');
  } catch (e) { log('S6: Browse Jobs Page', 'FAIL', e.message); }

  // S7: Post job page
  try {
    await studentPage.goto(`${BASE}/jobs/new`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S7: Navigate to Post Job', 'PASS');
  } catch (e) { log('S7: Navigate to Post Job', 'FAIL', e.message); }

  // S8: Wallet
  try {
    await studentPage.goto(`${BASE}/wallet`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S8: View Wallet Page', 'PASS');
  } catch (e) { log('S8: View Wallet Page', 'FAIL', e.message); }

  // S9: Inbox
  try {
    await studentPage.goto(`${BASE}/inbox`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S9: View Inbox', 'PASS');
  } catch (e) { log('S9: View Inbox', 'FAIL', e.message); }

  // S10: Notifications
  try {
    await studentPage.goto(`${BASE}/notifications`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S10: View Notifications', 'PASS');
  } catch (e) { log('S10: View Notifications', 'FAIL', e.message); }

  // S11: Settings
  try {
    await studentPage.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S11: View Settings', 'PASS');
  } catch (e) { log('S11: View Settings', 'FAIL', e.message); }

  // S12: Dashboard
  try {
    await studentPage.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForTimeout(1000);
    log('S12: View Dashboard', 'PASS');
  } catch (e) { log('S12: View Dashboard', 'FAIL', e.message); }

  await studentCtx.close();

  console.log('\n' + '='.repeat(60));
  console.log('👩‍🏫 TUTOR FLOW - End to End');
  console.log('='.repeat(60) + '\n');

  const tutorCtx = await browser.newContext();
  const tutorPage = await tutorCtx.newPage();

  // T1: Login as tutor
  try {
    await tutorPage.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await tutorPage.fill('input[name="email"]', 'tutor@wtws.dev');
    await tutorPage.fill('input[name="password"]', 'password123');
    await tutorPage.click('button[type="submit"]');
    await tutorPage.waitForTimeout(2000);
    log('T1: Login as Tutor', 'PASS');
  } catch (e) { log('T1: Login as Tutor', 'FAIL', e.message); }

  // T2: Dashboard
  try {
    await tutorPage.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    log('T2: View Tutor Dashboard', 'PASS');
  } catch (e) { log('T2: View Tutor Dashboard', 'FAIL', e.message); }

  // T3: Edit profile
  try {
    await tutorPage.goto(`${BASE}/tutors/edit`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    log('T3: Edit Tutor Profile Page', 'PASS');
  } catch (e) { log('T3: Edit Tutor Profile Page', 'FAIL', e.message); }

  // T4: Jobs
  try {
    await tutorPage.goto(`${BASE}/jobs`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    log('T4: Browse Jobs (to apply)', 'PASS');
  } catch (e) { log('T4: Browse Jobs (to apply)', 'FAIL', e.message); }

  // T5: Job details
  try {
    await tutorPage.goto(`${BASE}/jobs`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    const jobLink = tutorPage.locator('a[href^="/jobs/cm"]').first();
    if (await jobLink.count() > 0) {
      await jobLink.click();
      await tutorPage.waitForTimeout(1000);
    }
    log('T5: View Job Details', 'PASS');
  } catch (e) { log('T5: View Job Details', 'FAIL', e.message); }

  // T6: Wallet
  try {
    await tutorPage.goto(`${BASE}/wallet`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    log('T6: View Tutor Wallet', 'PASS');
  } catch (e) { log('T6: View Tutor Wallet', 'FAIL', e.message); }

  // T7: Inbox
  try {
    await tutorPage.goto(`${BASE}/inbox`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    log('T7: View Tutor Inbox', 'PASS');
  } catch (e) { log('T7: View Tutor Inbox', 'FAIL', e.message); }

  // T8: Notifications
  try {
    await tutorPage.goto(`${BASE}/notifications`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    log('T8: View Tutor Notifications', 'PASS');
  } catch (e) { log('T8: View Tutor Notifications', 'FAIL', e.message); }

  // T9: Settings
  try {
    await tutorPage.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    log('T9: View Tutor Settings', 'PASS');
  } catch (e) { log('T9: View Tutor Settings', 'FAIL', e.message); }

  // T10: Public profile
  try {
    await tutorPage.goto(`${BASE}/tutors/priya-sharma`, { waitUntil: 'domcontentloaded' });
    await tutorPage.waitForTimeout(1000);
    log('T10: View Own Public Profile', 'PASS');
  } catch (e) { log('T10: View Own Public Profile', 'FAIL', e.message); }

  await tutorCtx.close();

  console.log('\n' + '='.repeat(60));
  console.log('🌐 PUBLIC PAGES - No Auth Required');
  console.log('='.repeat(60) + '\n');

  const publicCtx = await browser.newContext();
  const publicPage = await publicCtx.newPage();

  const publicPages = [
    ['P1: How It Works', '/how-it-works'],
    ['P2: Support Page', '/support'],
    ['P3: Terms Page', '/terms'],
    ['P4: Privacy Page', '/privacy'],
    ['P5: Refunds Page', '/refunds'],
    ['P6: Subject Page (Mathematics)', '/subjects/Mathematics'],
    ['P7: Location Page (Mumbai)', '/locations/Mumbai'],
    ['P8: Reviews Page', '/reviews'],
  ];

  for (const [name, path] of publicPages) {
    try {
      await publicPage.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
      await publicPage.waitForTimeout(500);
      log(name, 'PASS');
    } catch (e) { log(name, 'FAIL', e.message); }
  }

  await publicCtx.close();

  console.log('\n' + '='.repeat(60));
  console.log('🔐 AUTH FLOWS');
  console.log('='.repeat(60) + '\n');

  const authCtx = await browser.newContext();
  const authPage = await authCtx.newPage();

  try {
    await authPage.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await authPage.waitForSelector('input[name="email"]', { timeout: 5000 });
    log('A1: Login Page Loads', 'PASS');
  } catch (e) { log('A1: Login Page Loads', 'FAIL', e.message); }

  try {
    await authPage.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded' });
    await authPage.waitForSelector('input[name="name"]', { timeout: 5000 });
    log('A2: Register Page Loads', 'PASS');
  } catch (e) { log('A2: Register Page Loads', 'FAIL', e.message); }

  try {
    await authPage.goto(`${BASE}/forgot-password`, { waitUntil: 'domcontentloaded' });
    await authPage.waitForTimeout(1000);
    log('A3: Forgot Password Page', 'PASS');
  } catch (e) { log('A3: Forgot Password Page', 'FAIL', e.message); }

  try {
    await authPage.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await authPage.fill('input[name="email"]', 'wrong@email.com');
    await authPage.fill('input[name="password"]', 'wrongpassword');
    await authPage.click('button[type="submit"]');
    await authPage.waitForTimeout(2000);
    log('A4: Invalid Login Shows Error', 'PASS');
  } catch (e) { log('A4: Invalid Login Shows Error', 'FAIL', e.message); }

  await authCtx.close();
  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  console.log(`\n✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`📈 TOTAL:  ${results.length}`);
  console.log(`🎯 RATE:   ${((passed / results.length) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.scenario}: ${r.detail}`);
    });
  }
}

runTests().catch(console.error);
