import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear cart from localStorage
    await page.goto('/');
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    // Clear cart from localStorage
    await page.evaluate(() => {
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('cart_items');
      } catch (e) {
        // Ignore localStorage access errors
      }
    });
  });

  test('should add product to cart', async ({ page }) => {
    // Wait for products to load and add first one to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });

    // Get initial cart count
    const initialCartBadge = page.locator('[data-testid="cart-badge"]');
    const initialCount = await initialCartBadge.textContent().catch(() => '0');

    // Click add to cart
    await addToCartButton.click();

    // Verify cart badge updates
    await expect(initialCartBadge).toContainText(/[1-9]/);
  });

  test('should update cart badge', async ({ page }) => {
    const cartBadge = page.locator('[data-testid="cart-badge"]');

    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Verify badge shows updated count
    await expect(cartBadge).toBeVisible();
    const badgeText = await cartBadge.textContent();
    expect(parseInt(badgeText)).toBeGreaterThan(0);
  });

  test('should navigate to cart page', async ({ page }) => {
    // Add product to cart first
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to cart
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    // Verify cart page loaded
    await expect(page).toHaveURL(/.*\/cart/);
  });

  test('should display cart items', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to cart
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    // Wait for cart to load and verify item appears
    const cartItem = page.locator('[data-testid="cart-item"]');
    await expect(cartItem).toBeVisible({ timeout: 5000 });
  });

  test('should update product quantity in cart', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to cart
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    // Update quantity
    const quantityInput = page.locator('[data-testid="item-quantity"]').first();
    await quantityInput.fill('5');

    // Verify quantity changed
    await expect(quantityInput).toHaveValue('5');
  });

  test('should remove item from cart', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to cart
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    // Remove item
    const removeButton = page.locator('[data-testid="remove-item"]').first();
    await removeButton.click();

    // Verify cart is empty
    const emptyMessage = page.locator('[data-testid="empty-cart"]');
    await expect(emptyMessage).toBeVisible();
  });

  test('should persist cart in localStorage', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Get cart from localStorage
    const cartData = await page.evaluate(() => {
      return localStorage.getItem('cart') || localStorage.getItem('cart_items');
    });

    expect(cartData).toBeTruthy();

    // Refresh page
    await page.reload();

    // Verify cart persists
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toContainText(/[1-9]/);
  });
});
