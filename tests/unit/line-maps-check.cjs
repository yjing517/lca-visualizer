const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// 行映射是「Python 行 -> Java 行」的人工核对结果。这里锁住已修正的语义对应，
// 并检查生成轨迹确实使用了映射表，避免再次出现高亮跳到其他分支的问题。
const maps = JSON.parse(fs.readFileSync('tools/hot100-line-maps.json', 'utf8'));
const strip = (value) => String(value).replace(/\s+/g, ' ').trim();

function snippetsOf(dataPath) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), ctx);
  return ctx.window.HOT100_SNIPPETS;
}

function mapOf(num) {
  return Object.fromEntries(Object.entries(maps[num].lines).map(([line, target]) => [Number(line), Number(target)]));
}

function mappedTargets(num, pyPattern) {
  const { Python: py } = snippetsOf(`dist/problems/hot100-${num}/app.js`);
  const map = mapOf(num);
  const items = py.map((line, index) => [line, index]).filter(([line]) => pyPattern.test(line))
    .map(([, index]) => {
      assert.ok(Number.isInteger(map[index]), `#${num}: Python 第 ${index + 1} 行没有行映射`);
      return { pyLine: index + 1, target: map[index], pyText: strip(py[index]) };
    });
  // py 来自 vm 上下文，map 结果是另一个 realm 的数组，展开成本 realm 数组再做深比较。
  return [...items];
}

// 33：两个分支的 right / left 赋值必须各自落在同内容的 Java 行，而不是另一个分支。
const leftTargets = mappedTargets('33', /left = mid \+ 1/);
assert.deepEqual(leftTargets.map((item) => item.target), [11, 15], '#33: left = mid + 1 应分别映射到 Java 第 12、16 行（0 基下标 11、15）');
for (const item of leftTargets) {
  const { Java: java } = snippetsOf('dist/problems/hot100-33/app.js');
  assert.match(strip(java[item.target]), /left = mid \+ 1;/, `#33: Python 第 ${item.pyLine} 行映射到了不相符的 Java 行`);
}
const rightTargets = mappedTargets('33', /^\s*right = mid$/);
assert.deepEqual(rightTargets.map((item) => item.target), [9, 17], '#33: right = mid 应分别映射到 Java 第 10、18 行');
for (const item of rightTargets) {
  const { Java: java } = snippetsOf('dist/problems/hot100-33/app.js');
  assert.match(strip(java[item.target]), /right = mid;/, `#33: Python 第 ${item.pyLine} 行映射到了不相符的 Java 行`);
}

// 76：主循环必须指向 Java 的滑动窗口 for，而不是遍历 t 的初始化循环。
const loop = mappedTargets('76', /for \(r, c\) in enumerate\(s\)/);
assert.deepEqual(loop.map((item) => item.target), [10], '#76: 主循环应映射到 Java 第 11 行（0 基下标 10）');
assert.match(strip(snippetsOf('dist/problems/hot100-76/app.js').Java[10]), /for \(int l = 0, r = 0;/);

// 148：合并收尾必须指向 Java 的三元合并行，而不是 else 分支。
const merge = mappedTargets('148', /tail\.next = l1 or l2/);
assert.deepEqual(merge.map((item) => item.target), [27], '#148: tail.next 合并应映射到 Java 第 28 行（0 基下标 27）');
assert.match(strip(snippetsOf('dist/problems/hot100-148/app.js').Java[27]), /tail\.next = l1 != null \? l1 : l2;/);

// 通用约束：真实语句不应映射到只有括号/else 的行；行号必须在 Java 代码范围内。
const structural = /^(?:[}\])]+;?|}\s*else\s*\{)$/;
const skipPython = /^(?:#|else:|try:|finally:|elif\b|except\b|\)$|:$|}$|]$)/;
for (const num of Object.keys(maps)) {
  const appPath = `dist/problems/hot100-${num}/app.js`;
  if (!fs.existsSync(appPath)) continue;
  const { Python: py, Java: java } = snippetsOf(appPath);
  const map = mapOf(num);
  for (const [index, target] of Object.entries(map)) {
    const i = Number(index);
    const pyLine = strip(py[i] || '');
    assert.ok(Number.isInteger(target) && target >= 0 && target < java.length, `#${num}: Python 第 ${i + 1} 行映射越界`);
    assert.ok(strip(java[target]).length > 0, `#${num}: Python 第 ${i + 1} 行映射到空行`);
    if (skipPython.test(pyLine)) continue;
    assert.ok(!structural.test(strip(java[target])), `#${num}: Python 第 ${i + 1} 行「${pyLine}」映射到纯括号行「${strip(java[target])}」`);
  }
}

// 生成物一致性：data.js 事件里的 javaLine 必须来自当前映射表（防止改了表却忘记重建）。
for (const num of Object.keys(maps)) {
  const dataPath = `dist/problems/hot100-${num}/data.js`;
  if (!fs.existsSync(dataPath)) continue;
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), ctx);
  const map = mapOf(num);
  for (const testCase of ctx.window.HOT100_DATA.cases) {
    for (const event of testCase.events) {
      // data.js 的 line 是 0 基 Python 行下标；构建器按 mapping[line] 写 javaLine。
      const expected = map[event.line] ?? 0;
      assert.equal(event.javaLine, expected, `#${num}: data.js 的 javaLine 与行映射不一致（line ${event.line}）`);
    }
  }
}

console.log(`Passed: ${Object.keys(maps).length} line maps cover in-range Java lines, no statement maps to braces, corrected 33/76/148 correspondences and generated data match the table.`);
