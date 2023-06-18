const {chromium}=require('playwright-chromium');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://example.com');
  
  // Wait for the title to be 'Example Domain'
  await page.waitForFunction(() => document.title === 'Example Domain');

  await page.screenshot({ path: 'example.png' });
  
  await browser.close();
})();
