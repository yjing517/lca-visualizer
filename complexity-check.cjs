const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");
execFileSync(process.execPath, ["tools/build-complexity.cjs", "--check"], {
  stdio: "inherit",
});
const context = { window: {} };
for (const name of ["catalog.js", "complexity-data.js", "complexity.js"])
  vm.runInNewContext(fs.readFileSync("dist/" + name, "utf8"), context);
const profiles = context.window.COMPLEXITY_ANALYSIS;
for (const problem of context.window.PROBLEMS) {
  const p = profiles[problem.id];
  for (const dimension of ["time", "space"])
    for (const kind of ["best", "worst"]) {
      const value = p[dimension][kind];
      assert.match(
        value.bound,
        /[OΘ]\(/,
        `${problem.id}.${dimension}.${kind}: mathematical bound`,
      );
      assert.ok(
        value.when.length >= 3 && value.why.length >= 8,
        `${problem.id}: explain the scenario and reason`,
      );
      assert.doesNotMatch(value.when + value.why, /TODO|待补充|待分析/);
    }
  const rendered = context.window.Complexity.render(problem.id);
  for (const text of [
    "复杂度分析",
    "最好情况",
    "最坏情况",
    "返回结果占多少空间",
    "同一实现",
  ])
    assert.ok(rendered.includes(text), problem.id + text);
}
for (const n of [146, 155, 208, 295])
  assert.ok(
    profiles["leetcode-" + n].operations.length >= 2,
    n + ": separate operations",
  );
assert.match(profiles["leetcode-198"].time.worst.bound, /φ/);
assert.match(profiles["leetcode-35"].time.best.bound, /log/);
assert.match(profiles["leetcode-300"].time.best.bound, /Θ\(n\)/);
assert.match(profiles["leetcode-300"].time.worst.bound, /n log n/);
for (const n of [45, 53, 152]) {
  assert.match(
    profiles["leetcode-" + n].space.worst.bound,
    /Python Θ\(n\).*Java Θ\(1\)/,
  );
  const snippets = require("./read-snippets.cjs")(
    fs.readFileSync("dist/problems/hot100-" + n + "/app.js", "utf8"),
  );
  assert.match(snippets.Python.join("\n"), /nums\[(?:1:|:-1)\]/);
}
assert.match(profiles["leetcode-416"].space.best.bound, /Θ\(1\)/);
assert.match(profiles["leetcode-437"].space.worst.why, /归零键/);
assert.match(profiles["leetcode-215"].time.worst.bound, /n²/);
assert.match(profiles["leetcode-394"].spaceLabel, /含结果/);
for (const scenario of ["best", "worst"])
  assert.equal(
    profiles["leetcode-1143"].time[scenario].bound,
    "Θ((n+1)(m+1))",
    "empty strings retain initialization and outer-loop work",
  );
// Check key explanations against actual execution structure, not only schema presence.
const robber = require("./dist/problems/robber/app.js");
const calls = (values) =>
  robber.trace(values).events.filter((e) => e.line === "check").length;
for (let n = 2; n <= 7; n++)
  assert.equal(
    calls(Array(n).fill(0)),
    calls(Array(n).fill(10)),
    "amounts do not prune the uncached recursion",
  );
for (let n = 3; n <= 7; n++)
  assert.equal(
    calls(Array(n).fill(0)),
    calls(Array(n - 1).fill(0)) + calls(Array(n - 2).fill(0)) + 1,
  );
const palindrome = require("./dist/problems/palindrome/app.js");
for (let n = 1; n <= 6; n++) {
  const text = "abcabc".slice(0, n),
    events = palindrome.trace(text).events;
  const copied = events
    .filter((e) => e.line === "slice")
    .reduce((sum, e) => sum + e.candidate.t.length, 0);
  assert.equal(
    copied,
    (n * (n + 1) * (n + 2)) / 6,
    "on-the-fly slices carry cubic best-family work",
  );
  assert.equal(
    palindrome.trace("a".repeat(n)).events.at(-1).ans.length,
    2 ** (n - 1),
  );
}
const original = profiles["leetcode-1"].algorithm;
profiles["leetcode-1"].algorithm = '<img src=x onerror="window.bad=true">';
const safe = context.window.Complexity.render("leetcode-1");
assert.ok(safe.includes("&lt;img"));
assert.ok(!safe.includes("<img"));
profiles["leetcode-1"].algorithm = original;
assert.ok(
  context.window.Complexity.render("not-collected").includes("暂未补充"),
);
console.log(
  "Passed: 103 complete analyses, operation breakdowns, language-specific allocation notes, uncached recurrence, palindrome copy work and escaped rendering.",
);
