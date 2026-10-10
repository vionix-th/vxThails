import assert from 'node:assert/strict';

const networks = ['Bitcoin', 'Ethereum Mainnet', 'Solana', 'Base', 'Arbitrum One', 'Optimism', 'Polygon PoS', 'BNB Smart Chain'];
const addresses = ['bc1qesd92qv7h3mlh4qqs4grz3e32phvxj6spwkcyz', '0x0D4aAc6d3C5DF6D162F121992eBD441728B143a2', '7oLWWpSrEG6aDKVZDAyuAjF3kDKEgAmnG3Q7JAb9uUXy'];

/** Workspace harness supplies a Playwright page and an independent PNG QR decoder. */
export async function verifyCryptoSupport({ page, url, app, locale, width, decodeQR }) {
  const errors = [];
  const providerCalls = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: width === 320 ? 640 : 900 });
  await page.route('https://ko-fi.com/**', (route) => {
    providerCalls.push(route.request().url());
    return route.fulfill({ contentType: 'text/html', body: '<p>Payment fixture</p>' });
  });
  await page.route('https://actions.google.com/**', (route) => route.abort());
  await page.goto(`${url}/?lang=${locale}`);
  if (app === 'vxMemory') await page.locator('#lang').selectOption(locale);
  await page.waitForFunction(() => document.querySelectorAll('#board .card, #board .cell').length > 0);
  const initial = await page.evaluate(() => ({
    board: document.querySelector('#board').innerHTML,
    stats: [...document.querySelectorAll('#moves, #matches, #level')].map((node) => node.textContent),
  }));
  assert.equal(providerCalls.length, 0);
  await page.locator('#supportBtn').click();
  const dialog = page.locator('#supportDialog');
  const tabs = dialog.getByRole('tab');
  assert.deepEqual(await tabs.allTextContents(), locale === 'th' ? ['เงินสด', 'คริปโต'] : ['Cash', 'Crypto']);
  assert.equal(await tabs.evaluateAll((items) => items.every((tab) => tab.querySelector('svg')?.getAttribute('aria-hidden') === 'true')), true);
  assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true');
  await tabs.nth(1).click();
  assert.equal(await tabs.nth(1).textContent(), locale === 'th' ? 'คริปโต' : 'Crypto');
  const combo = dialog.getByRole('combobox');
  await combo.click();
  assert.deepEqual(await dialog.getByRole('option').allTextContents(), networks);
  assert.equal(await dialog.getByRole('option').evaluateAll((rows) => rows.every((row) => row.querySelector('svg') && getComputedStyle(row).borderTopWidth === '0px')), true);
  const menuBounds = await dialog.getByRole('listbox').boundingBox();
  assert.ok(menuBounds.x >= 0 && menuBounds.y >= 0 && menuBounds.x + menuBounds.width <= width && menuBounds.y + menuBounds.height <= (width === 320 ? 640 : 900));
  await dialog.getByRole('heading').click();
  assert.equal(await combo.getAttribute('aria-expanded'), 'false');
  const compact = width <= 420;
  if (compact) {
    assert.equal(await dialog.locator('.donation-qr').isVisible(), false);
    await dialog.screenshot({ path: `/tmp/${app}-crypto-${width}-${locale}.png` });
    await dialog.locator('.donation-qr-toggle').click();
  }
  const baseline = await dialog.boundingBox();
  for (const [index, name] of networks.entries()) {
    await combo.click();
    await dialog.getByRole('option', { name, exact: true }).click();
    const address = addresses[index === 0 ? 0 : index === 2 ? 2 : 1];
    assert.equal(await dialog.locator('.donation-address').textContent(), address);
    assert.equal(await decodeQR(dialog.locator('.donation-qr')), address);
    assert.deepEqual(await dialog.boundingBox(), baseline);
    if (index !== 0) assert.match(await dialog.locator('.donation-assets').textContent(), locale === 'th' ? /USDC, USDT และโทเคนอื่น/ : /USDC, USDT and other tokens/);
  }
  assert.equal(await dialog.locator('.donation-instruction').count(), 0);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  const copy = dialog.locator('.donation-copy');
  await copy.scrollIntoViewIfNeeded();
  const copyBounds = await copy.boundingBox();
  assert.ok(copyBounds.y >= 0 && copyBounds.y + copyBounds.height <= (width === 320 ? 640 : 900));
  await page.clock.install();
  await copy.click();
  await dialog.getByRole('button', { name: locale === 'th' ? 'คัดลอกแล้ว' : 'Copied', exact: true }).waitFor();
  assert.equal(await copy.textContent(), locale === 'th' ? 'คัดลอกแล้ว' : 'Copied');
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), addresses[1]);
  assert.deepEqual(await dialog.boundingBox(), baseline);
  await page.clock.fastForward(2100);
  assert.equal(await copy.textContent(), locale === 'th' ? 'คัดลอกที่อยู่' : 'Copy address');
  await page.evaluate(() => Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new DOMException('Clipboard denied', 'NotAllowedError'); } }));
  await copy.click();
  await dialog.getByRole('button', { name: locale === 'th' ? 'คัดลอกด้วยตนเอง' : 'Copy manually', exact: true }).waitFor();
  assert.equal(await copy.textContent(), locale === 'th' ? 'คัดลอกด้วยตนเอง' : 'Copy manually');
  assert.equal(await page.evaluate(() => getSelection().toString()), addresses[1]);
  assert.deepEqual(await dialog.boundingBox(), baseline);
  await combo.focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  assert.match(await combo.textContent(), /Bitcoin/);
  await page.keyboard.type('sol');
  await page.keyboard.press('Enter');
  assert.match(await combo.textContent(), /Solana/);
  await page.keyboard.press('End');
  await page.keyboard.press('Escape');
  assert.match(await combo.textContent(), /Solana/);
  assert.equal(await dialog.isVisible(), true);
  await tabs.nth(0).click();
  assert.equal(await dialog.locator('iframe').isVisible(), true);
  await tabs.nth(1).click();
  assert.match(await combo.textContent(), /Solana/);
  assert.equal(providerCalls.length, 1);
  if (!compact) await dialog.screenshot({ path: `/tmp/${app}-crypto-${width}-${locale}.png` });
  await page.keyboard.press('Escape');
  await dialog.locator('iframe').waitFor({ state: 'detached' });
  assert.equal(await dialog.isVisible(), false);
  assert.equal(await dialog.locator('iframe').count(), 0);
  assert.equal(await page.locator('#supportBtn').evaluate((node) => node === document.activeElement), true);
  const after = await page.evaluate(() => ({
    board: document.querySelector('#board').innerHTML,
    stats: [...document.querySelectorAll('#moves, #matches, #level')].map((node) => node.textContent),
  }));
  assert.deepEqual(after, initial);
  await page.locator('#supportBtn').click();
  assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true');
  await tabs.nth(1).click();
  assert.match(await combo.textContent(), /Bitcoin/);
  await page.locator('#supportCloseBtn').click();
  await dialog.locator('iframe').waitFor({ state: 'detached' });
  assert.deepEqual(errors, []);
}
