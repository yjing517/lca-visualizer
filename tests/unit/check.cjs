const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = fs.readFileSync('dist/problems/lca/app.js', 'utf8').split('const snippets=')[0];
const trace = vm.runInNewContext(code + '; trace');
for (const [p, q, expected] of [[5,1,3],[5,4,5],[7,4,2],[6,8,3],[0,8,1],[4,4,4]]) {
  const events = trace(p, q);
  assert.equal(events.at(-1).answer, expected);
  assert.equal(events.at(-1).stack.length, 0);
  assert.ok(events.some(e => e.phase === '基本情况'));
}
console.log('Passed: 6 recursive traces, results and stack unwinding.');
