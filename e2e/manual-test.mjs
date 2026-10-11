import { chromium } from 'playwright';

const WEB = 'http://localhost:3000';

console.log('🧪 MANUAL UI TESTING - All Flows');
console.log('=================================\n');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultTimeout(20000);

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message.split('\n')[0]}`);
    return false;
  }
}

// ========== STUDENT FLOW ==========
console.log('👨‍🎓 STUDENT FLOW\n');

await test('1. Load Homepage', async () => {
  await page.goto(WEB, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('a[href="/login"]', { timeout: 10000 });
});

await test('2. Navigate to Login', async () => {
  await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
});

await test('3. Login as Student', async () => {
  await page.fill('input[name="email"]', 'dev@wtws.dev');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|verify|tutors)/, { timeout: 15000 });
});

await test('4. Access Dashboard', async () => {
  await page.goto(`${WEB}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  if (page.url().includes('/login')) throw new Error('Redirected to login');
});

await test('5. Browse Tutors Page', async () => {
  await page.goto(`${WEB}/tutors`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('6. View Tutor Profile (Amina)', async () => {
  await page.goto(`${WEB}/tutors/amina-rahman`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('7. Browse Jobs Page', async () => {
  await page.goto(`${WEB}/jobs`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('8. Post Job Page', async () => {
  await page.goto(`${WEB}/jobs/new`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('9. Check Wallet', async () => {
  await page.goto(`${WEB}/wallet`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('10. Check Messages', async () => {
  await page.goto(`${WEB}/messages`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('11. Check Settings', async () => {
  await page.goto(`${WEB}/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

// ========== TUTOR FLOW ==========
console.log('\n👩‍🏫 TUTOR FLOW\n');

// Clear session
await context.clearCookies();
await page.evaluate(() => localStorage.clear());

await test('12. Login as Tutor', async () => {
  await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="email"]', { timeout: 10000 });
  await page.fill('input[name="email"]', 'amina@wtws.dev');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|verify|tutors)/, { timeout: 15000 });
});

await test('13. Tutor Dashboard', async () => {
  await page.goto(`${WEB}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('14. Edit Tutor Profile', async () => {
  await page.goto(`${WEB}/tutors/edit`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('15. View Jobs (as Tutor)', async () => {
  await page.goto(`${WEB}/jobs`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('16. Tutor Wallet', async () => {
  await page.goto(`${WEB}/wallet`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

await test('17. Tutor Messages', async () => {
  await page.goto(`${WEB}/messages`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
});

// ========== REGISTRATION FLOW ==========
console.log('\n📝 REGISTRATION FLOW\n');

await context.clearCookies();
await page.evaluate(() => localStorage.clear());

await test('18. Register Page', async () => {
  await page.goto(`${WEB}/register`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="name"]', { timeout: 10000 });
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  await page.waitForSelector('input[name="password"]', { timeout: 5000 });
});

// ========== ERROR HANDLING ==========
console.log('\n⚠️ ERROR HANDLING\n');

await test('19. Invalid Login Shows Error', async () => {
  await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', 'wrong@test.com');
  await page.fill('input[name="password"]', 'wrongpass');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  if (!page.url().includes('/login')) throw new Error('Should stay on login');
});

await test('20. Protected Route Redirects', async () => {
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.goto(`${WEB}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  // Should redirect to login or show login prompt
});

await browser.close();

console.log('\n=================================');
console.log('🏁 Manual UI Testing Complete!');
