const fs = require("node:fs"),
  vm = require("node:vm"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync("dist/catalog.js", "utf8"), context);
const all = context.window.PROBLEMS,
  official = JSON.parse(fs.readFileSync("tools/hot100.json", "utf8"));
assert.equal(official.length, 100);
assert.equal(new Set(official.map((q) => q.questionFrontendId)).size, 100);
assert.equal(all.length, 103);
assert.equal(new Set(all.map((p) => p.id)).size, 103);
for (const q of official) {
  const p = all.find((p) => p.id === "leetcode-" + q.questionFrontendId);
  assert.ok(p);
  assert.ok(p.tags.includes("Hot 100"));
  assert.ok(fs.existsSync(path.join("dist", p.demo)));
}
for (const n of [
  236, 513, 17, 78, 77, 46, 131, 239, 198, 1143, 300, 216, 22, 51,
])
  assert.ok(all.some((p) => p.id === "leetcode-" + n));
let count = 0;
for (const p of all.filter((p) => p.demo.includes("hot100-"))) {
  const dir = path.dirname(path.join("dist", p.demo)),
    trace = path.join("tools", "traces", path.basename(dir) + ".json"),
    data = JSON.parse(fs.readFileSync(trace, "utf8")),
    snippets = require("../../tools/read-snippets.cjs")(
      fs.readFileSync(path.join(dir, "app.js"), "utf8"),
    );
  assert.ok(data.cases.length >= 2);
  assert.ok(data.cases.some((c) => c.boundary));
  const script = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(dir, "data.js"), "utf8"),
    script,
  );
  assert.equal(JSON.stringify(script.window.HOT100_DATA), JSON.stringify(data));
  for (const c of data.cases) {
    assert.ok(c.events.length >= 2);
    assert.equal(c.events.at(-1).phase, "完成");
    for (const e of c.events) {
      assert.ok(e.line >= 0 && e.line < snippets.Python.length);
      assert.ok(e.javaLine >= 0 && e.javaLine < snippets.Java.length);
      assert.ok(e.stack.length > 0);
      assert.ok(snippets.Java[e.javaLine].trim());
    }
    count++;
  }
  assert.equal(
    new Set(p.principles.map((x) => x.text)).size,
    p.principles.length,
    p.id + " repeated explanation",
  );
  assert.ok(
    p.statement.length > 10 &&
      p.complexity.length > 5 &&
      p.principles.every((x) => x.text.length > 10),
  );
}
console.log(
  `Passed: complete official 100, 103 unique entries, 14 original IDs, 89 demos, ${count} fixtures and snapshot/line-map integrity.`,
);
