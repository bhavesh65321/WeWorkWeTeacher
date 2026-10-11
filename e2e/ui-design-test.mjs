import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const issues = [];

function addIssue(page, category, description, severity = 'medium') {
  issues.push({ page, category, description, severity });
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('\n🎨 UI DESIGN TESTING\n' + '='.repeat(50) + '\n');

  // ========== HOMEPAGE ==========
  console.log('📄 Testing Homepage...');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check for broken images
  const images = await page.$$eval('img', imgs => 
    imgs.map(img => ({ src: img.src, alt: img.alt, broken: !img.complete || img.naturalWidth === 0 }))
  );
  const brokenImages = images.filter(i => i.broken);
  if (brokenImages.length > 0) {
    addIssue('Homepage', 'Broken Images', `${brokenImages.length} broken images found`, 'high');
  }

  // Check for missing alt text
  const missingAlt = images.filter(i => !i.alt);
  if (missingAlt.length > 0) {
    addIssue('Homepage', 'Accessibility', `${missingAlt.length} images missing alt text`, 'medium');
  }

  // Check for empty links
  const emptyLinks = await page.$$eval('a', links => 
    links.filter(a => !a.textContent?.trim() && !a.querySelector('img, svg')).length
  );
  if (emptyLinks > 0) {
    addIssue('Homepage', 'Empty Links', `${emptyLinks} empty links found`, 'medium');
  }

  // Check for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // ========== LOGIN PAGE ==========
  console.log('📄 Testing Login Page...');
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Check form labels
  const emailInput = await page.$('input[name="email"]');
  const passwordInput = await page.$('input[name="password"]');
  
  if (!emailInput) addIssue('Login', 'Form', 'Email input not found', 'high');
  if (!passwordInput) addIssue('Login', 'Form', 'Password input not found', 'high');

  // Check button states
  const submitBtn = await page.$('button[type="submit"]');
  if (!submitBtn) addIssue('Login', 'Form', 'Submit button not found', 'high');

  // ========== REGISTER PAGE ==========
  console.log('📄 Testing Register Page...');
  await page.goto(`${BASE}/register`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const nameInput = await page.$('input[name="name"]');
  if (!nameInput) addIssue('Register', 'Form', 'Name input not found', 'high');

  // ========== TUTORS PAGE ==========
  console.log('📄 Testing Tutors Page...');
  await page.goto(`${BASE}/tutors`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check if tutors are displayed
  const tutorCards = await page.$$('[class*="card"], [class*="tutor"]');
  console.log(`   Found ${tutorCards.length} tutor elements`);

  // ========== JOBS PAGE ==========
  console.log('📄 Testing Jobs Page...');
  await page.goto(`${BASE}/jobs`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // ========== MOBILE RESPONSIVE TEST ==========
  console.log('📱 Testing Mobile Responsiveness...');
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Check if mobile nav is visible
  const mobileNav = await page.$('nav.lg\\:hidden, nav[class*="mobile"]');
  
  // Check for horizontal overflow
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (hasHorizontalScroll) {
    addIssue('Homepage (Mobile)', 'Responsive', 'Horizontal scroll detected on mobile', 'high');
  }

  // Test other pages on mobile
  const mobilePages = ['/login', '/register', '/tutors', '/jobs'];
  for (const p of mobilePages) {
    await page.goto(`${BASE}${p}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => 
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    if (overflow) {
      addIssue(`${p} (Mobile)`, 'Responsive', 'Horizontal scroll detected', 'high');
    }
  }

  // ========== LOGGED IN STATE ==========
  console.log('🔐 Testing Logged In State...');
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', 'dev@wtws.dev');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Check dashboard
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check if user info is shown in header
  const headerHasLogin = await page.$('header a[href="/login"]');
  const headerHasSignup = await page.$('header a[href="/register"]');
  
  if (headerHasLogin) {
    addIssue('Dashboard', 'Auth State', 'Login button visible when logged in', 'high');
  }
  if (headerHasSignup) {
    addIssue('Dashboard', 'Auth State', 'Sign up button visible when logged in', 'high');
  }

  // Check wallet page
  console.log('💰 Testing Wallet Page...');
  await page.goto(`${BASE}/wallet`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check settings page
  console.log('⚙️ Testing Settings Page...');
  await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check tutor edit page
  console.log('✏️ Testing Tutor Edit Page...');
  await page.goto(`${BASE}/tutors/edit`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check for form validation
  const requiredFields = await page.$$('input[required], select[required], textarea[required]');
  console.log(`   Found ${requiredFields.length} required fields`);

  // ========== POST JOB PAGE ==========
  console.log('📝 Testing Post Job Page...');
  await page.goto(`${BASE}/jobs/new`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // ========== INBOX PAGE ==========
  console.log('📬 Testing Inbox Page...');
  await page.goto(`${BASE}/inbox`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // ========== NOTIFICATIONS PAGE ==========
  console.log('🔔 Testing Notifications Page...');
  await page.goto(`${BASE}/notifications`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  await browser.close();

  // ========== REPORT ==========
  console.log('\n' + '='.repeat(50));
  console.log('📊 UI DESIGN TEST REPORT');
  console.log('='.repeat(50) + '\n');

  if (issues.length === 0) {
    console.log('✅ No UI issues found!\n');
  } else {
    const high = issues.filter(i => i.severity === 'high');
    const medium = issues.filter(i => i.severity === 'medium');
    const low = issues.filter(i => i.severity === 'low');

    console.log(`Found ${issues.length} issues:\n`);
    
    if (high.length > 0) {
      console.log('🔴 HIGH SEVERITY:');
      high.forEach(i => console.log(`   [${i.page}] ${i.category}: ${i.description}`));
      console.log('');
    }
    
    if (medium.length > 0) {
      console.log('🟡 MEDIUM SEVERITY:');
      medium.forEach(i => console.log(`   [${i.page}] ${i.category}: ${i.description}`));
      console.log('');
    }
    
    if (low.length > 0) {
      console.log('🟢 LOW SEVERITY:');
      low.forEach(i => console.log(`   [${i.page}] ${i.category}: ${i.description}`));
      console.log('');
    }
  }

  if (consoleErrors.length > 0) {
    console.log('⚠️ CONSOLE ERRORS:');
    consoleErrors.slice(0, 5).forEach(e => console.log(`   ${e}`));
    if (consoleErrors.length > 5) console.log(`   ... and ${consoleErrors.length - 5} more`);
    console.log('');
  }
}

runTests().catch(console.error);
