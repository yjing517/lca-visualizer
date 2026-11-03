const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const server = require('../../serve.cjs');
  await new Promise(r => server.listening ? r() : server.once('listening', r));
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const base = `http://127.0.0.1:${server.address().port}/problems/hot100-73/`;
    let total = 0;
    for (const variant of ['copy', 'constant']) {
      await page.goto(base + variant + '/index.html');
      await page.locator('#code .on').waitFor();
      const checked = await page.evaluate(() => {
        const $ = id => document.getElementById(id);
        let steps = 0;
        HOT100_DATA.cases.forEach((c, ci) => {
          $('example').value = String(ci); $('example').dispatchEvent(new Event('change'));
          for (const language of ['Python', 'Java']) {
            $('lang').value = language; $('lang').dispatchEvent(new Event('change'));
            c.events.forEach((e, index) => {
              $('seek').value = String(index); $('seek').dispatchEvent(new Event('input'));
              const expected = language === 'Python' ? e.line : e.javaLine;
              if ($('code').querySelector('.on')?.dataset.line !== String(expected)) throw Error('highlight mismatch');
              steps++;
            });
            if ($('result').textContent !== '实际输出：' + JSON.stringify(c.expected)) throw Error('wrong result');
          }
        });
        return steps;
      });
      total += checked;
      await page.locator('#reset').click();
      const start = await page.locator('#state').textContent();
      await page.locator('#next').click();
      const progress = await page.locator('#seek').inputValue();
      await page.locator('#lang').selectOption('Python');
      assert.equal(await page.locator('#seek').inputValue(), progress);
      await page.locator('#prev').click();
      assert.equal(await page.locator('#state').textContent(), start);
      await page.locator('#play').click();
      await page.waitForTimeout(1000);
      await page.locator('#play').click();
      assert.ok(Number(await page.locator('#seek').inputValue()) > 0);
      const paused = await page.locator('#seek').inputValue();
      await page.waitForTimeout(1000);
      assert.equal(await page.locator('#seek').inputValue(), paused);
      await page.screenshot({ path: `test-results/matrix-${variant}-desktop.png`, fullPage: true });
      await page.setViewportSize({ width: 390, height: 844 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `test-results/matrix-${variant}-mobile.png`, fullPage: true });
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.goto(base + 'optimizations.html');
    for (const variant of ['copy', 'marks', 'constant']) {
      await page.locator(`[data-method="${variant}"]`).click();
      await page.frameLocator('#method-demo').locator('#code .on').waitFor();
      assert.equal(await page.locator(`[data-method="${variant}"]`).getAttribute('aria-pressed'), 'true');
    }
    await page.screenshot({ path: 'test-results/matrix-comparison-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: 'test-results/matrix-comparison-mobile.png', fullPage: true });
    // Follow the actual notebook entry without disturbing the saved problem ID.
    await page.goto(base.replace('problems/hot100-73/', '') + '#/problem/leetcode-73');
    await page.locator('#notes').fill('矩阵扩展测试笔记');
    await page.frameLocator('#demo').locator('.matrix-extension a').click();
    await page.frameLocator('#demo').locator('#method-demo').waitFor();
    await page.frameLocator('#demo').locator('[data-method="copy"]').click();
    await page.frameLocator('#demo').frameLocator('#method-demo').locator('#code .on').waitFor();
    await page.reload();
    assert.equal(await page.locator('#notes').inputValue(), '矩阵扩展测试笔记');
    await page.goto(pathToFileURL(path.resolve('dist/problems/hot100-73/optimizations.html')).href);
    await page.frameLocator('#method-demo').locator('#code .on').waitFor();
    assert.deepEqual(errors, []);
    console.log(`Matrix browser passed: ${total} highlights, all example outputs, controls, language progress, comparison switching, file URL, desktop/mobile.`);
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
