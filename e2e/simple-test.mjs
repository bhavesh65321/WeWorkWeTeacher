import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('Testing http://localhost:3000...');
try {
  const response = await page.goto('http://localhost:3000', { timeout: 10000 });
  console.log('Status:', response.status());
  console.log('Title:', await page.title());
  console.log('✅ Homepage loaded!');
} catch (e) {
  console.log('❌ Error:', e.message);
}

await browser.close();
