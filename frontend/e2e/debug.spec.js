import { test, expect } from '@playwright/test';

test('debug page load', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check what's on the page
  const bodyText = await page.textContent('body');
  console.log('Page loaded, body length:', bodyText.length);
  
  // Check for loading state
  const loadingEls = await page.locator('text=/carregando/i').count();
  console.log('Loading indicators:', loadingEls);
  
  // Check for error messages
  const errorText = await page.locator('text=/erro|error/i').textContent().catch(() => 'none');
  console.log('Error text:', errorText);
  
  // Check network requests
  const requests = [];
  page.on('response', resp => {
    if (resp.url().includes('/api')) {
      requests.push({ url: resp.url(), status: resp.status() });
    }
  });
  
  // Wait a bit for any pending requests
  await page.waitForTimeout(1000);
  console.log('API Requests:', requests);
  
  // Look for products
  const productCards = await page.locator('[class*="product"], [data-testid="product"]').count();
  console.log('Product cards:', productCards);
});
