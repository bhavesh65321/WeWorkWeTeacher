import { chromium } from 'playwright';

const WEB = 'http://localhost:3000';
let passed = 0, failed = 0;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(15000);

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message.split('\n')[0].slice(0, 60)}`);
    failed++;
  }
}

console.log('🧪 UI FLOW TESTING\n');

// Student Flow
console.log('👨‍🎓 STUDENT FLOW');
await test('Homepage', async () => {
  await page.goto(WEB, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Login Page', async () => {
  await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
});

await test('Login as Student', async () => {
  await page.fill('input[name="email"]', 'dev@wtws.dev');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|verify)/, { timeout: 10000 });
});

await test('Dashboard', async () => {
  await page.goto(`${WEB}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Tutors Page', async () => {
  await page.goto(`${WEB}/tutors`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Tutor Profile', async () => {
  await page.goto(`${WEB}/tutors/amina-rahman`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Jobs Page', async () => {
  await page.goto(`${WEB}/jobs`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Post Job Page', async () => {
  await page.goto(`${WEB}/jobs/new`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Wallet', async () => {
  await page.goto(`${WEB}/wallet`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Messages', async () => {
  await page.goto(`${WEB}/messages`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Settings', async () => {
  await page.goto(`${WEB}/settings`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

// Tutor Flow
console.log('\n👩‍🏫 TUTOR FLOW');
await page.evaluate(() => localStorage.clear());

await test('Login as Tutor', async () => {
  await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.fill('input[name="email"]', 'amina@wtws.dev');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|verify)/, { timeout: 10000 });
});

await test('Tutor Dashboard', async () => {
  await page.goto(`${WEB}/dashboard`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

await test('Edit Profile', async () => {
  await page.goto(`${WEB}/tutors/edit`, { waitUntil: 'domcontentloaded', timeout: 10000 });
});

// Registration
console.log('\n📝 REGISTRATION');
await page.evaluate(() => localStorage.clear());

await test('Register Page', async () => {
  await page.goto(`${WEB}/register`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForSelector('input[name="name"]', { timeout: 5000 });
});

await browser.close();

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
