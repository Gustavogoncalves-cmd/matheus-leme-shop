import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart from localStorage
    await page.evaluate(() => {
      localStorage.removeItem('cart');
      localStorage.removeItem('cart_items');
    });
    await page.goto('/');
  });

  test('should navigate to checkout', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to cart
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    // Click checkout button
    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await checkoutButton.click();

    // Verify checkout page loaded
    await expect(page).toHaveURL(/.*\/checkout/);
  });

  test('should display checkout form', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to checkout
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await checkoutButton.click();

    // Verify form fields
    await expect(page.locator('input[name="nome"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="telefone"]')).toBeVisible();
    await expect(page.locator('input[name="endereco"]')).toBeVisible();
    await expect(page.locator('input[name="cidade"]')).toBeVisible();
    await expect(page.locator('input[name="estado"]')).toBeVisible();
    await expect(page.locator('input[name="cep"]')).toBeVisible();
  });

  test('should fill checkout form', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to checkout
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await checkoutButton.click();

    // Fill form
    await page.fill('input[name="nome"]', 'João Silva');
    await page.fill('input[name="email"]', 'joao@example.com');
    await page.fill('input[name="telefone"]', '11987654321');
    await page.fill('input[name="endereco"]', 'Rua das Flores, 123');
    await page.fill('input[name="cidade"]', 'São Paulo');
    await page.fill('input[name="estado"]', 'SP');
    await page.fill('input[name="cep"]', '01234-567');

    // Verify values
    await expect(page.locator('input[name="nome"]')).toHaveValue('João Silva');
    await expect(page.locator('input[name="email"]')).toHaveValue('joao@example.com');
  });

  test('should redirect to MercadoPago on payment click', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to checkout
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await checkoutButton.click();

    // Fill form
    await page.fill('input[name="nome"]', 'João Silva');
    await page.fill('input[name="email"]', 'joao@example.com');
    await page.fill('input[name="telefone"]', '11987654321');
    await page.fill('input[name="endereco"]', 'Rua das Flores, 123');
    await page.fill('input[name="cidade"]', 'São Paulo');
    await page.fill('input[name="estado"]', 'SP');
    await page.fill('input[name="cep"]', '01234-567');

    // Listen for navigation
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('[data-testid="pay-button"]'),
    ]);

    // Verify popup/redirect to MercadoPago
    await popup.waitForLoadState();
    expect(popup.url()).toContain('mercadopago');
  });

  test('should show success page after payment', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to checkout
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await checkoutButton.click();

    // Fill form
    await page.fill('input[name="nome"]', 'João Silva');
    await page.fill('input[name="email"]', 'joao@example.com');
    await page.fill('input[name="telefone"]', '11987654321');
    await page.fill('input[name="endereco"]', 'Rua das Flores, 123');
    await page.fill('input[name="cidade"]', 'São Paulo');
    await page.fill('input[name="estado"]', 'SP');
    await page.fill('input[name="cep"]', '01234-567');

    // Simulate successful payment by navigating to success page
    // (In real scenario, MercadoPago would redirect back)
    await page.goto('/success');

    // Verify success page elements
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Add product to cart
    const addToCartButton = page.locator('[data-testid="add-to-cart"]').first();
    await expect(addToCartButton).toBeVisible({ timeout: 10000 });
    await addToCartButton.click();

    // Navigate to checkout
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();

    const checkoutButton = page.locator('[data-testid="checkout-button"]');
    await checkoutButton.click();

    // Try to submit without filling form
    const payButton = page.locator('[data-testid="pay-button"]');
    await payButton.click();

    // Verify validation errors appear
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
  });
});
