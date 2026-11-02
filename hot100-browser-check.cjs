const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const vm = require("node:vm");
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
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
      }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const base = "http://127.0.0.1:" + server.address().port + "/";
    const context = { window: {} };
    vm.runInNewContext(await fs.readFile("dist/catalog.js", "utf8"), context);
    const problems = context.window.PROBLEMS.filter((p) =>
      p.demo.includes("hot100-"),
    );
    let cases = 0,
      steps = 0;
    for (const p of problems) {
      await page.goto(base + p.demo);
      await page.locator(".line.on").waitFor();
      const n = await page.locator("#example option").count();
      for (let c = 0; c < n; c++) {
        await page.locator("#example").selectOption(String(c));
        const start = await page
          .locator("#seek")
          .getAttribute("max")
          .then((x) => (Number(x) > 1 ? 1 : 0));
        if (start) await page.locator("#next").click();
        const saved = await page.locator("#state").innerHTML(),
          counter = await page.locator("#counter").textContent();
        await page.locator("#next").click();
        await page.locator("#prev").click();
        assert.equal(
          await page.locator("#state").innerHTML(),
          saved,
          p.id + " rewind",
        );
        for (const lang of ["Java", "Python"]) {
          await page.locator("#lang").selectOption(lang);
          assert.equal(
            await page.locator("#state").innerHTML(),
            saved,
            p.id + " switch state",
          );
          assert.equal(await page.locator("#counter").textContent(), counter);
          const checked = await page.evaluate(() => {
            const d = window.HOT100_DATA,
              c = Number(document.getElementById("example").value),
              events = d.cases[c].events,
              lang = document.getElementById("lang").value,
              seek = document.getElementById("seek");
            for (let i = 0; i < events.length; i++) {
              seek.value = i;
              seek.dispatchEvent(new Event("input"));
              const lines = document.querySelectorAll(".line.on");
              if (
                lines.length !== 1 ||
                Number(lines[0].dataset.line) !==
                  (lang === "Python" ? events[i].line : events[i].javaLine)
              )
                return { ok: false, i };
              const variables = Object.assign(
                {},
                ...events[i].stack.map((f) => f.vars),
              );
              const marked = (name) => {
                const heading = [
                  ...document.querySelectorAll("#state .var h3"),
                ].find((h) => h.textContent === name);
                return heading
                  ? [
                      ...heading.parentElement.querySelectorAll(".slot.mark"),
                    ].map((c) => Number(c.dataset.index))
                  : [];
              };
              if (d.number === 72) {
                for (const [name, key] of [
                  ["word1", "i"],
                  ["word2", "j"],
                ]) {
                  const length = d.cases[c].input[name].length,
                    pos = variables[key] - 1,
                    expected =
                      Number.isInteger(pos) && pos >= 0 && pos < length
                        ? [pos]
                        : [];
                  if (JSON.stringify(marked(name)) !== JSON.stringify(expected))
                    return {
                      ok: false,
                      i,
                      reason: "DP prefix length used as a character index",
                    };
                }
              }
              if (d.number === 287 && marked("nums").length)
                return {
                  ok: false,
                  i,
                  reason: "value-domain bound used as an array index",
                };
              if (
                [
                  0,
                  1,
                  Math.floor(events.length / 2),
                  events.length - 1,
                ].includes(i)
              ) {
                const box = document
                    .getElementById("code")
                    .getBoundingClientRect(),
                  line = lines[0].getBoundingClientRect();
                if (line.top < box.top - 1 || line.bottom > box.bottom + 1)
                  return {
                    ok: false,
                    i,
                    reason: "highlight scrolled outside code panel",
                  };
              }
            }
            return {
              ok:
                document.getElementById("result").textContent ===
                "实际输出：" + JSON.stringify(d.cases[c].result),
              steps: events.length,
            };
          });
          assert.ok(
            checked.ok,
            p.id + " " + lang + " highlights/result " + JSON.stringify(checked),
          );
          steps += checked.steps;
          // Restore the previous canonical state to test switching independently of seeking.
          await page.locator("#seek").evaluate((e, start) => {
            e.value = start;
            e.dispatchEvent(new Event("input"));
          }, start);
        }
        cases++;
      }
      await page.locator("#example").selectOption("0");
      await page.locator("#reset").click();
      await page.locator("#speed").selectOption("350");
      await page.locator("#play").click();
      await page.waitForFunction(
        () => !document.getElementById("counter").textContent.startsWith("0 /"),
      );
      await page.locator("#play").click();
      const paused = await page.locator("#counter").textContent();
      await page.waitForTimeout(380);
      assert.equal(
        await page.locator("#counter").textContent(),
        paused,
        p.id + " pause",
      );
      await page.locator("#reset").click();
      assert.ok(
        (await page.locator("#counter").textContent()).startsWith("0 /"),
      );
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator("#seek").evaluate((e) => {
          e.value = Math.floor(Number(e.max) / 2);
          e.dispatchEvent(new Event("input"));
        });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          p.id + " overflow " + width,
        );
        if (
          ["1", "146", "208", "207", "72", "295", "437", "75"].includes(
            p.number,
          )
        )
          await page.screenshot({
            path: `test-results/hot100-${p.number}-${width}.png`,
            fullPage: true,
          });
      }
      console.log(p.id, "browser OK");
    }
    await page.goto(base + "#/library?q=Hot%20100");
    await page.locator("#search").waitFor();
    assert.equal(await page.locator("#results .problem").count(), 100);
    await page.goto(base + "#/problem/leetcode-1");
    await page.waitForFunction(() =>
      document.querySelector("#demoStatus")?.textContent.includes("已就绪"),
    );
    await page.locator("#notes").fill("Hot 100 新题笔记");
    await page.goto(base + "#/problem/leetcode-236");
    await page.locator("#notes").fill("原题记录保留");
    await page.goto(base + "#/problem/leetcode-1");
    assert.equal(await page.locator("#notes").inputValue(), "Hot 100 新题笔记");
    await page.goto(base + "#/problem/leetcode-236");
    assert.equal(await page.locator("#notes").inputValue(), "原题记录保留");
    const frame = page.frameLocator("#demo");
    await frame.locator("#next").waitFor();
    assert.deepEqual(errors, []);
    await fs.writeFile(
      "test-results/hot100-browser.json",
      JSON.stringify(
        { problems: problems.length, cases, steps, errors },
        null,
        2,
      ),
    );
    console.log(
      `Passed: ${problems.length} new demos, ${cases} examples, ${steps} language/step checks, playback, mobile/desktop, Hot 100 search and record isolation.`,
    );
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
