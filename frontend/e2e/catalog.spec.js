import { test, expect } from '@playwright/test';

test.describe('Catalog - Product Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load shop page', async ({ page }) => {
    expect(page.url()).toContain('/');
    await expect(page).toHaveTitle(/.*[Mm]atheus.*[Ll]eme.*/);
  });

  test('should display products on load', async ({ page }) => {
    // Wait for products to load
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });

    // Verify at least one product is visible
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by category: todos', async ({ page }) => {
    // Click on "todos" category filter
    await page.click('text=Todos');
    await page.waitForLoadState('networkidle');

    // Verify products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by category: pacote', async ({ page }) => {
    // Click on "pacote" category filter
    await page.click('text=Pacote');
    await page.waitForLoadState('networkidle');

    // Verify products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by category: avulso', async ({ page }) => {
    // Click on "avulso" category filter
    await page.click('text=Avulso');
    await page.waitForLoadState('networkidle');

    // Verify products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open product detail modal', async ({ page }) => {
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Wait for modal to appear
    const modal = page.locator('[data-testid="product-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });
  });

  test('should display product images in modal', async ({ page }) => {
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Wait for modal and images to load
    const modal = page.locator('[data-testid="product-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Verify at least one image is visible
    const images = page.locator('[data-testid="product-modal"] img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);

    // Verify main product image is loaded
    const mainImage = page.locator('[data-testid="product-main-image"]');
    await expect(mainImage).toBeVisible();
  });

  test('should close product modal', async ({ page }) => {
    // Click on first product
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // Wait for modal to appear
    const modal = page.locator('[data-testid="product-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Close modal by clicking X or overlay
    const closeButton = page.locator('[data-testid="modal-close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Click overlay if close button not found
      await page.click('[data-testid="modal-overlay"]');
    }

    // Verify modal is hidden
    await expect(modal).not.toBeVisible();
  });
});
