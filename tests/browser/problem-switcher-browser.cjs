const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const server = require('../../serve.cjs');
  await new Promise(r => server.listening ? r() : server.once('listening', r));
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const base = `http://127.0.0.1:${server.address().port}/`;
    await page.goto(base + '#/problem/leetcode-236');
    const problems = await page.evaluate(() => PROBLEMS.map(p => ({ id: p.id, title: p.title, demo: p.demo })));
    const wait = p => page.waitForFunction(p => document.querySelector('h1')?.textContent === p.title && document.getElementById('demo')?.getAttribute('src') === p.demo, p);
    const jump = async p => { await page.locator('#problemSelect').selectOption(p.id); await wait(p); };
    assert.equal(await page.locator('#problemSelect option').count(), problems.length);
    assert.equal(await page.locator('#problemPrev').isDisabled(), true);
    await page.locator('#notes').fill('第一题独立笔记');
    await page.locator('#mastery').selectOption('已掌握');
    await page.locator('#review').check();
    await page.locator('#problemNext').click(); await wait(problems[1]);
    assert.equal(await page.locator('#notes').inputValue(), '');
    await page.locator('#notes').fill('第二题独立笔记');
    await page.locator('#problemPrev').click(); await wait(problems[0]);
    assert.equal(await page.locator('#notes').inputValue(), '第一题独立笔记');
    assert.equal(await page.locator('#mastery').inputValue(), '已掌握');
    assert.equal(await page.locator('#review').isChecked(), true);
    await page.goBack(); await wait(problems[1]);
    assert.equal(await page.locator('#notes').inputValue(), '第二题独立笔记');
    await page.goForward(); await wait(problems[0]);
    // Visit each real catalog entry through the new picker, not direct URLs.
    for (let i = 0; i < problems.length; i++) {
      await jump(problems[i]);
      assert.equal(await page.locator('.problem-position').textContent(), `${i + 1} / ${problems.length}`);
      assert.equal(await page.locator('#problemPrev').isDisabled(), i === 0);
      assert.equal(await page.locator('#problemNext').isDisabled(), i === problems.length - 1);
    }
    // Verify the existing bespoke players under the desktop-only maintenance scope.
    for (const number of [236, 513, 17, 78, 77, 46, 131, 198, 239, 1143, 300, 216, 22, 51]) {
      await jump(problems.find(p => p.id === `leetcode-${number}`));
      const frame = page.frameLocator('#demo');
      await frame.locator('#counter').filter({ hasText: /\// }).waitFor();
      await frame.locator('#reset').click();
      await frame.locator('#speed').selectOption('350');
      await frame.locator('#play').click();
      await page.waitForFunction(() => Number(document.getElementById('demo')?.contentDocument?.getElementById('counter')?.textContent.split('/')[0]) > 0, undefined, { timeout: 5000 });
      await frame.locator('#play').click();
      const paused = await frame.locator('#counter').textContent();
      assert.ok(Number(paused.split('/')[0]) > 0, `${number}: playback advances before pausing`);
      await page.waitForTimeout(450);
      assert.equal(await frame.locator('#counter').textContent(), paused, `${number}: pause remains stable`);
    }
    const matrix = problems.find(p => p.id === 'leetcode-73');
    await jump(matrix);
    await page.frameLocator('#demo').locator('.keyboard-rule').waitFor();
    await page.locator('h1').click();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.frameLocator('#demo').locator('#seek').inputValue(), '1');
    assert.ok(page.url().endsWith('/leetcode-73'));
    await page.locator('#notes').fill('键盘只编辑笔记');
    await page.keyboard.press('ArrowLeft');
    assert.equal(await page.frameLocator('#demo').locator('#seek').inputValue(), '1');
    await page.locator('#problemSelect').focus();
    // Check our handler without invoking the select's native option navigation.
    await page.locator('#problemSelect').dispatchEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
    assert.equal(await page.frameLocator('#demo').locator('#seek').inputValue(), '1');
    for (const width of [1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('#jumpComplexity').click();
      await page.waitForFunction(() => {
        const panel = document.getElementById('complexityPanel').getBoundingClientRect();
        const bar = document.querySelector('.problem-switcher').getBoundingClientRect();
        return panel.top >= 0 && panel.top < 80;
      });
      await page.locator('.demoheading').evaluate(el => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY));
      const box = await page.locator('.problem-switcher').boundingBox();
      assert.ok(box.y + box.height < 0, 'picker scrolls out of view while reading the demo');
      await page.evaluate(() => window.scrollTo(0, 0));
      assert.ok((await page.locator('.problem-switcher').boundingBox()).y >= 0, 'picker returns at the top');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `test-results/problem-switcher-${width}.png` });
    }
    await page.reload(); await wait(matrix);
    assert.equal(await page.locator('#notes').inputValue(), '键盘只编辑笔记');
    await page.goto(pathToFileURL(path.resolve('dist/index.html')).href + '#/problem/' + problems[0].id);
    await page.locator('#problemNext').click(); await wait(problems[1]);
    assert.deepEqual(errors, []);
    console.log(`Passed: all ${problems.length} question choices, 14 original players on desktop, previous/next boundaries, isolated records, history, reload, step keys, scrolling desktop and offline routing.`);
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exit(1); });
