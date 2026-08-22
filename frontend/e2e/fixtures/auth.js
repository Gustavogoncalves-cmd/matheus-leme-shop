import { test as base } from '@playwright/test';

/**
 * Mock authentication for testing
 */
export const authenticatedTest = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Mock login by setting auth data in localStorage
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

    await use(page);
  },

  adminPage: async ({ page }, use) => {
    // Mock admin login by setting auth data in localStorage
    await page.evaluate(() => {
      const mockAdmin = {
        id: '999',
        email: 'admin@example.com',
        name: 'Admin User',
        isAdmin: true,
      };
      localStorage.setItem('auth_user', JSON.stringify(mockAdmin));
      localStorage.setItem('auth_token', 'mock-jwt-admin-token-999');
    });

    await use(page);
  },
});

/**
 * Helper to simulate user login
 */
export async function loginUser(page, email = 'test@example.com', password = 'password123') {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

/**
 * Helper to simulate user logout
 */
export async function logoutUser(page) {
  // Look for logout button or user menu
  const userMenu = page.locator('[data-testid="user-menu"]');
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.click('[data-testid="logout-button"]');
  }
}

/**
 * Helper to check if user is logged in
 */
export async function isUserLoggedIn(page) {
  const user = await page.evaluate(() => {
    return localStorage.getItem('auth_user');
  });
  return !!user;
}

/**
 * Helper to get current logged-in user
 */
export async function getCurrentUser(page) {
  const user = await page.evaluate(() => {
    const userData = localStorage.getItem('auth_user');
    return userData ? JSON.parse(userData) : null;
  });
  return user;
}
