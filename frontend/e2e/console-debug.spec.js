import { test } from '@playwright/test';

test('check console logs', async ({ page }) => {
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    errors.push(err.message);
  });
  
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  console.log('=== CONSOLE LOGS ===');
  consoleLogs.forEach(log => console.log(`${log.type}: ${log.text}`));
  
  console.log('=== ERRORS ===');
  errors.forEach(err => console.log(err));
  
  // Check if app div has content
  const appDiv = await page.locator('#app').innerHTML();
  console.log('App div content length:', appDiv.length);
  console.log('App div first 200 chars:', appDiv.substring(0, 200));
});
