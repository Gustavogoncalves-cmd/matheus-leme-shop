import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin login
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
    await page.goto('/admin');
  });

  test('should load admin page', async ({ page }) => {
    expect(page.url()).toContain('/admin');

    // Verify admin header
    const adminTitle = page.locator('[data-testid="admin-title"]');
    await expect(adminTitle).toBeVisible();
  });

  test('should display products list', async ({ page }) => {
    // Wait for products list to load
    const productsList = page.locator('[data-testid="products-list"]');
    await expect(productsList).toBeVisible({ timeout: 10000 });

    // Verify at least one product row
    const productRows = page.locator('[data-testid="product-row"]');
    const count = await productRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should create new product', async ({ page }) => {
    // Click "New Product" button
    const newProductBtn = page.locator('[data-testid="new-product-btn"]');
    await newProductBtn.click();

    // Wait for form
    const form = page.locator('[data-testid="product-form"]');
    await expect(form).toBeVisible();

    // Fill product form
    await page.fill('input[name="nome"]', 'Novo Produto');
    await page.fill('input[name="descricao"]', 'Descrição do novo produto');
    await page.fill('input[name="preco"]', '99.99');
    await page.fill('input[name="categoria"]', 'avulso');
    await page.fill('input[name="estoque"]', '50');

    // Submit form
    const submitBtn = page.locator('[data-testid="submit-product-btn"]');
    await submitBtn.click();

    // Verify success message or redirect
    const successMsg = page.locator('[data-testid="success-message"]');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
  });

  test('should edit product', async ({ page }) => {
    // Click edit button on first product
    const editBtn = page.locator('[data-testid="edit-product"]').first();
    await editBtn.click();

    // Wait for form
    const form = page.locator('[data-testid="product-form"]');
    await expect(form).toBeVisible();

    // Update product name
    const nameInput = page.locator('input[name="nome"]');
    await nameInput.clear();
    await nameInput.fill('Produto Atualizado');

    // Submit form
    const submitBtn = page.locator('[data-testid="submit-product-btn"]');
    await submitBtn.click();

    // Verify success message
    const successMsg = page.locator('[data-testid="success-message"]');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
  });

  test('should delete product', async ({ page }) => {
    // Click delete button on first product
    const deleteBtn = page.locator('[data-testid="delete-product"]').first();
    await deleteBtn.click();

    // Confirm deletion
    const confirmBtn = page.locator('[data-testid="confirm-delete"]');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Verify success message
    const successMsg = page.locator('[data-testid="success-message"]');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
  });

  test('should update order status', async ({ page }) => {
    // Navigate to orders section
    const ordersLink = page.locator('a[href="/admin/orders"]');
    await ordersLink.click();

    // Wait for orders to load
    const ordersList = page.locator('[data-testid="orders-list"]');
    await expect(ordersList).toBeVisible({ timeout: 10000 });

    // Click status update on first order
    const statusBtn = page.locator('[data-testid="update-status"]').first();
    await statusBtn.click();

    // Select new status
    const statusSelect = page.locator('select[name="status"]');
    await statusSelect.selectOption('processando');

    // Submit
    const submitBtn = page.locator('[data-testid="submit-status"]');
    await submitBtn.click();

    // Verify success
    const successMsg = page.locator('[data-testid="success-message"]');
    await expect(successMsg).toBeVisible({ timeout: 5000 });
  });

  test('should view order details', async ({ page }) => {
    // Navigate to orders section
    const ordersLink = page.locator('a[href="/admin/orders"]');
    await ordersLink.click();

    // Wait for orders to load
    const ordersList = page.locator('[data-testid="orders-list"]');
    await expect(ordersList).toBeVisible({ timeout: 10000 });

    // Click on order row to view details
    const orderRow = page.locator('[data-testid="order-row"]').first();
    await orderRow.click();

    // Verify order details modal/page
    const detailsPanel = page.locator('[data-testid="order-details"]');
    await expect(detailsPanel).toBeVisible();
  });

  test('should display admin statistics', async ({ page }) => {
    // Verify dashboard stats are visible
    const statsContainer = page.locator('[data-testid="stats-container"]');
    await expect(statsContainer).toBeVisible();

    // Verify key stats
    const totalOrders = page.locator('[data-testid="total-orders"]');
    const totalRevenue = page.locator('[data-testid="total-revenue"]');
    const totalProducts = page.locator('[data-testid="total-products"]');

    await expect(totalOrders).toBeVisible();
    await expect(totalRevenue).toBeVisible();
    await expect(totalProducts).toBeVisible();
  });
});
