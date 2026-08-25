import { test, expect } from '@playwright/test';

const cart = [{
  id: 1,
  title: 'Streampack Neon',
  price: 100,
  discount: 10,
  quantity: 1,
}];

async function seedCart(page) {
  await page.addInitScript((items) => {
    localStorage.setItem('matheus_leme_cart', JSON.stringify(items));
  }, cart);
}

async function seedAuthenticatedUser(page) {
  await page.addInitScript(() => {
    localStorage.setItem('matheus_leme_token', 'e2e-token');
    localStorage.setItem('matheus_leme_user', JSON.stringify({
      id: 7,
      name: 'Cliente E2E',
      email: 'cliente@example.com',
      role: 'customer',
    }));
  });

  await page.route('**/api/auth/profile', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      data: { id: 7, name: 'Cliente E2E', email: 'cliente@example.com', role: 'customer' },
    }),
  }));
}

test.describe('Checkout digital', () => {
  test('exige login e preserva o retorno ao checkout', async ({ page }) => {
    await seedCart(page);
    await page.goto('/checkout');

    await expect(page).toHaveURL(/\/login\?redirect=\/checkout$/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('mostra o resumo digital para usuário autenticado', async ({ page }) => {
    await seedCart(page);
    await seedAuthenticatedUser(page);
    await page.goto('/checkout');

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();
    await expect(page.getByText('Streampack Neon')).toBeVisible();
    await expect(page.getByText('R$ 90,00')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Pagar com Mercado Pago' })).toBeEnabled();
    await expect(page.getByText(/download ficará disponível em Meus Pedidos/i)).toBeVisible();
  });

  test('cria pedido com IDs e solicita preferência ao Mercado Pago', async ({ page }) => {
    await seedCart(page);
    await seedAuthenticatedUser(page);

    let orderPayload;
    let preferencePayload;
    await page.route('**/api/orders', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      orderPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 42, total_price: 90, status: 'pending_payment' } }),
      });
    });
    await page.route('**/api/payments/create-preference', async route => {
      preferencePayload = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { preference_id: 'pref-42' } }),
      });
    });

    await page.goto('/checkout');
    await page.getByRole('button', { name: 'Pagar com Mercado Pago' }).click();

    await expect(page.getByText('Falha ao obter o link do Mercado Pago')).toBeVisible();
    expect(orderPayload).toEqual({ items: [{ product_id: 1, quantity: 1 }] });
    expect(preferencePayload).toEqual({ orderId: 42 });
    expect(await page.evaluate(() => localStorage.getItem('lastOrderId'))).toBe('42');
  });
});
