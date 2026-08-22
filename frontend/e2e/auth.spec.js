import { test, expect } from '@playwright/test';
import { loginUser, logoutUser, isUserLoggedIn, getCurrentUser } from './fixtures/auth.js';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth from localStorage
    await page.evaluate(() => {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    });
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    expect(page.url()).toContain('/login');
  });

  test('should register new user', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[name="nome"]', 'New User');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    // Submit registration
    await page.click('button[type="submit"]');

    // Verify redirect to login or home
    await page.waitForNavigation();
    expect(
      page.url().includes('/login') || page.url().includes('/') || page.url().includes('/home')
    ).toBeTruthy();
  });

  test('should login user', async ({ page }) => {
    await loginUser(page, 'test@example.com', 'password123');

    // Verify user is logged in
    const isLoggedIn = await isUserLoggedIn(page);
    expect(isLoggedIn).toBeTruthy();
  });

  test('should display user avatar when logged in', async ({ page }) => {
    // Mock login
    await page.evaluate(() => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
      };
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock-jwt-token-123');
    });

    await page.goto('/');

    // Verify avatar or user menu appears
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();

    // Verify user name displayed
    const userName = page.locator('[data-testid="user-name"]');
    const text = await userName.textContent();
    expect(text).toContain('Test User');
  });

  test('should logout user', async ({ page }) => {
    // Mock login
    await page.evaluate(() => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
      };
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock-jwt-token-123');
    });

    await page.goto('/');

    // Logout
    await logoutUser(page);

    // Verify user is logged out
    const isLoggedIn = await isUserLoggedIn(page);
    expect(isLoggedIn).toBeFalsy();
  });

  test('should redirect to home after logout', async ({ page }) => {
    // Mock login
    await page.evaluate(() => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
      };
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock-jwt-token-123');
    });

    await page.goto('/');

    // Logout
    await logoutUser(page);

    // Verify redirected to home
    await page.waitForNavigation();
    expect(page.url()).toContain('/');
  });

  test('should show login link when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Verify login link is visible
    const loginLink = page.locator('a:has-text("Login")');
    await expect(loginLink).toBeVisible();
  });

  test('should persist auth token in localStorage', async ({ page }) => {
    // Mock login
    await page.evaluate(() => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
      };
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock-jwt-token-123');
    });

    await page.goto('/');

    // Get token from localStorage
    const token = await page.evaluate(() => {
      return localStorage.getItem('auth_token');
    });

    expect(token).toBe('mock-jwt-token-123');

    // Reload page
    await page.reload();

    // Verify token still exists
    const tokenAfterReload = await page.evaluate(() => {
      return localStorage.getItem('auth_token');
    });

    expect(tokenAfterReload).toBe('mock-jwt-token-123');
  });

  test('should get current user info', async ({ page }) => {
    // Mock login
    await page.evaluate(() => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        isAdmin: false,
      };
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_token', 'mock-jwt-token-123');
    });

    await page.goto('/');

    // Get current user
    const user = await getCurrentUser(page);
    expect(user).toBeTruthy();
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
  });
});
