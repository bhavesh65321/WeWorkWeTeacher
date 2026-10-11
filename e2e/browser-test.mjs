import { chromium } from 'playwright';

console.log('🚀 Starting browser test...');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  // Test 1: Homepage
  console.log('\n📄 Test 1: Loading homepage...');
  await page.goto('http://localhost:3000', { timeout: 30000 });
  const title = await page.title();
  console.log('✅ Page title:', title);
  
  // Test 2: Login page
  console.log('\n📄 Test 2: Loading login page...');
  await page.goto('http://localhost:3000/login', { timeout: 30000 });
  console.log('✅ On login page:', page.url());
  
  // Check form fields
  const emailField = await page.locator('input[name="email"]').isVisible();
  const passwordField = await page.locator('input[name="password"]').isVisible();
  const submitBtn = await page.locator('button[type="submit"]').isVisible();
  console.log('✅ Email field visible:', emailField);
  console.log('✅ Password field visible:', passwordField);
  console.log('✅ Submit button visible:', submitBtn);
  
  // Test 3: Login with valid credentials
  console.log('\n📝 Test 3: Filling login form...');
  await page.fill('input[name="email"]', 'dev@wtws.dev');
  await page.fill('input[name="password"]', 'password123');
  
  console.log('🔐 Submitting login...');
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  try {
    await page.waitForURL(/\/(dashboard|verify)/, { timeout: 15000 });
    console.log('✅ Login successful! Redirected to:', page.url());
    
    // Test 4: Dashboard access
    console.log('\n📄 Test 4: Checking dashboard...');
    await page.goto('http://localhost:3000/dashboard', { timeout: 30000 });
    console.log('✅ Dashboard loaded:', page.url());
    
    // Test 5: Tutors page
    console.log('\n📄 Test 5: Checking tutors page...');
    await page.goto('http://localhost:3000/tutors', { timeout: 30000 });
    console.log('✅ Tutors page loaded:', page.url());
    
    // Test 6: Jobs page
    console.log('\n📄 Test 6: Checking jobs page...');
    await page.goto('http://localhost:3000/jobs', { timeout: 30000 });
    console.log('✅ Jobs page loaded:', page.url());
    
  } catch (e) {
    console.log('❌ Login failed or timeout. Current URL:', page.url());
    const errorText = await page.locator('.text-red-600').textContent().catch(() => 'No error message');
    console.log('   Error message:', errorText);
  }
  
  console.log('\n🏁 All tests completed!');
} catch (err) {
  console.error('❌ Test error:', err.message);
} finally {
  await browser.close();
}
