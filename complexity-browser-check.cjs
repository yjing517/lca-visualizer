const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const { pathToFileURL } = require("node:url");
(async () => {
  const server = require("./serve.cjs");
  await new Promise((r) =>
    server.listening ? r() : server.once("listening", r),
  );
  const browser = await chromium.launch({
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const base = "http://127.0.0.1:" + server.address().port + "/";
    const sandbox = { window: {} };
    for (const f of ["catalog.js", "complexity-data.js"])
      vm.runInNewContext(await fs.readFile("dist/" + f, "utf8"), sandbox);
    await fs.mkdir("test-results", { recursive: true });
    await page.goto(base + "#/problem/leetcode-236");
    await page.locator("#notes").fill("复杂度改版前的个人笔记");
    await page.locator("#mastery").selectOption("需复习");
    await page.locator("#review").check();
    let checked = 0;
    for (const p of sandbox.window.PROBLEMS) {
      await page.goto(base + "#/problem/" + p.id);
      await page.locator("#complexityPanel").waitFor();
      assert.equal(
        await page.locator("#complexityDetails").getAttribute("open"),
        null,
      );
      await page.locator("#jumpComplexity").focus();
      await page.keyboard.press("Enter");
      assert.ok(
        await page.locator("#complexityDetails").evaluate((e) => e.open),
      );
      assert.equal(
        await page.evaluate(() => document.activeElement.id),
        "complexityPanel",
      );
      const profile = sandbox.window.COMPLEXITY_ANALYSIS[p.id],
        rows = page.locator(
          "#complexityDetails > .complexity-table:not(.complexity-operations) tbody tr",
        );
      assert.equal(await rows.count(), 2, p.id);
      for (const [i, dimension] of ["time", "space"].entries())
        for (const [j, kind] of ["best", "worst"].entries()) {
          const text = await rows.nth(i).locator("td").nth(j).textContent();
          for (const key of ["bound", "when", "why"])
            assert.ok(
              text.includes(profile[dimension][kind][key]),
              p.id + " " + dimension + " " + kind + " " + key,
            );
        }
      assert.equal(
        await page.locator(".complexity-operations tbody tr").count(),
        profile.operations?.length || 0,
      );
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          p.id + " overflow " + width,
        );
        for (const caption of await page
          .locator("#complexityDetails table caption")
          .all()) {
          const size = await caption.boundingBox();
          assert.ok(
            size.width > 150 && size.height < 45,
            p.id + " readable caption " + width,
          );
        }
        if (
          [198, 53, 215, 146, 208, 155, 295, 394, 72].includes(Number(p.number))
        )
          await page.locator("#complexityPanel").screenshot({
            path: `test-results/complexity-${p.number}-${width}.png`,
          });
      }
      checked++;
    }
    await page.goto(base + "#/problem/leetcode-236");
    assert.equal(
      await page.locator("#notes").inputValue(),
      "复杂度改版前的个人笔记",
    );
    assert.equal(await page.locator("#mastery").inputValue(), "需复习");
    assert.equal(await page.locator("#review").isChecked(), true);
    await page.waitForFunction(() =>
      document.getElementById("demoStatus").textContent.includes("已就绪"),
    );
    const demo = page.frameLocator("#demo");
    await demo.locator("#next").click();
    const progress = await demo.locator("#counter").textContent();
    await page.locator("#jumpComplexity").click();
    assert.equal(await demo.locator("#counter").textContent(), progress);
    await page.reload();
    assert.equal(
      await page.locator("#notes").inputValue(),
      "复杂度改版前的个人笔记",
    );
    await page.route("**/problems/lca/index.html", (route) => route.abort());
    await page.reload();
    await page.locator("#jumpComplexity").click();
    assert.ok(await page.locator("#complexityDetails").evaluate((e) => e.open));
    assert.equal(
      await page.locator("#notes").inputValue(),
      "复杂度改版前的个人笔记",
    );
    await page.unroute("**/problems/lca/index.html");
    await page.route("**/complexity.js", (route) => route.abort());
    await page.reload();
    assert.equal(await page.locator("#jumpComplexity").isDisabled(), true);
    assert.ok(
      (await page.locator("#content").textContent()).includes(
        "复杂度分析暂未能加载",
      ),
    );
    assert.equal(
      await page.locator("#notes").inputValue(),
      "复杂度改版前的个人笔记",
    );
    await page.unroute("**/complexity.js");
    const filePage = await context.newPage();
    filePage.on("pageerror", (e) => errors.push(e.message));
    await filePage.goto(
      pathToFileURL(path.resolve("dist/index.html")).href +
        "#/problem/leetcode-198",
    );
    await filePage.locator("#jumpComplexity").click();
    assert.ok(
      (await filePage.locator("#complexityPanel").textContent()).includes("φⁿ"),
    );
    await filePage.close();
    assert.deepEqual(errors, []);
    await fs.writeFile(
      "test-results/complexity-browser.json",
      JSON.stringify(
        {
          problems: checked,
          viewports: [1440, 390],
          errors,
          recordPreservation: true,
          playbackPreservation: true,
          fileOpening: true,
        },
        null,
        2,
      ),
    );
    console.log(
      `Passed: ${checked} complexity panels, desktop/mobile, keyboard expansion, visible explanations, operation tables, unchanged records/playback and offline file opening.`,
    );
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
