import { test, expect } from '@playwright/test';

test.describe('ApnaTeacher UI Tests', () => {
  
  test.describe('Homepage', () => {
    test('should load homepage', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/WeTeacherWeStudent|WTWS|ApnaTeacher/i);
    });

    test('should have navigation links', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('a[href="/login"]').first()).toBeVisible();
      await expect(page.locator('a[href="/register"]').first()).toBeVisible();
    });
  });

  test.describe('Login Flow', () => {
    test('should show login form', async ({ page }) => {
      await page.goto('/login');
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[name="email"]', 'dev@wtws.dev');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      await page.waitForURL(/\/(dashboard|verify)/, { timeout: 15000 });
      expect(page.url()).toMatch(/\/(dashboard|verify)/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[name="email"]', 'wrong@email.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('.text-red-600').or(page.locator('text=Invalid'))).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Registration Flow', () => {
    test('should show registration form', async ({ page }) => {
      await page.goto('/register');
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });
  });

  test.describe('Public Pages', () => {
    test('should load tutors page', async ({ page }) => {
      await page.goto('/tutors');
      await expect(page).toHaveURL(/\/tutors/);
    });

    test('should load jobs page', async ({ page }) => {
      await page.goto('/jobs');
      await expect(page).toHaveURL(/\/jobs/);
    });
  });

  test.describe('Authenticated User Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[name="email"]', 'dev@wtws.dev');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|verify)/, { timeout: 15000 });
    });

    test('should access dashboard after login', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should access settings page', async ({ page }) => {
      await page.goto('/settings');
      await expect(page).toHaveURL(/\/settings/);
    });
  });
});
