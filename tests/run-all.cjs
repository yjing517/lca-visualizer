#!/usr/bin/env node
// 聚合测试运行器：按组顺序执行检查，收集失败后继续，最后统一汇总。
// 用法：
//   node tests/run-all.cjs                 # 默认 unit + algorithms（等同 npm test）
//   node tests/run-all.cjs unit algorithms browser
//   node tests/run-all.cjs --list          # 列出所有步骤
//   node tests/run-all.cjs --bail          # 首个失败即停止
//   node tests/run-all.cjs browser --timeout 1200000
'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_GROUPS = ['unit', 'algorithms'];
const DEFAULT_TIMEOUT = 10 * 60 * 1000;

const GROUPS = {
  unit: [
    ['check.cjs', 'LCA 递归轨迹'],
    ['bottom-left-check.cjs', '二叉树左下角'],
    ['records-check.cjs', '个人记录存储与备份'],
    ['complexity-check.cjs', '复杂度数据一致性'],
    ['languages-check.cjs', '双语言入口与代码'],
    ['phone-check.cjs', '电话号码组合'],
    ['subsets-check.cjs', '子集'],
    ['combinations-check.cjs', '组合'],
    ['permutations-check.cjs', '全排列'],
    ['palindrome-check.cjs', '分割回文串'],
    ['robber-check.cjs', '打家劫舍'],
    ['sliding-window-check.cjs', '滑动窗口'],
    ['lcs-check.cjs', '最长公共子序列'],
    ['lis-check.cjs', '最长递增子序列'],
    ['backtracking-additions-check.cjs', '回溯补充题'],
    ['queens-check.cjs', 'N 皇后'],
    ['hot100-check.cjs', 'Hot 100 题库与轨迹'],
  ].map(([file, label]) => ({
    name: `unit/${file}`,
    label,
    command: process.execPath,
    args: [path.join('tests/unit', file)],
  })),
  algorithms: [
    ['verify-hot100.py', 'Python 轨迹快照重放'],
    ['check-hot100-properties.py', 'Python 性质对照'],
    ['check-hot100-java.py', 'Java 编译运行'],
    ['check-matrix-zeroes.py', '矩阵置零扩展方案'],
  ].map(([file, label]) => ({
    name: `algorithms/${file}`,
    label,
    command: null, // 运行时按平台选择 python
    args: [path.join('tools', file)],
  })),
  browser: [
    ['browser-check.cjs', '主站验收'],
    ['hot100-browser-check.cjs', 'Hot 100 演示验收'],
    ['complexity-browser-check.cjs', '复杂度面板验收'],
    ['matrix-zeroes-browser.cjs', '矩阵方案验收'],
    ['keyboard-browser-check.cjs', '键盘验收'],
    ['problem-switcher-browser.cjs', '切题栏验收'],
  ].map(([file, label]) => ({
    name: `browser/${file}`,
    label,
    command: process.execPath,
    args: [path.join('tests/browser', file)],
  })),
};

function parseArgs(argv) {
  const groups = [];
  let bail = false;
  let list = false;
  let timeout = DEFAULT_TIMEOUT;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--bail') bail = true;
    else if (arg === '--list') list = true;
    else if (arg === '--timeout') timeout = Number(argv[++i]);
    else if (arg.startsWith('--timeout=')) timeout = Number(arg.split('=')[1]);
    else if (GROUPS[arg]) groups.push(arg);
    else {
      console.error(`未知参数：${arg}`);
      console.error(`可用分组：${Object.keys(GROUPS).join(' / ')}`);
      process.exit(2);
    }
  }
  return { groups: groups.length ? groups : DEFAULT_GROUPS, bail, list, timeout };
}

function detectPython() {
  const candidates = process.platform === 'win32' ? ['python'] : ['python3', 'python'];
  for (const command of candidates) {
    const probe = spawnSync(command, ['--version'], { stdio: 'ignore', timeout: 15000 });
    if (probe.status === 0) return command;
  }
  return null;
}

function detectTool(command) {
  const probe = spawnSync(command, ['-version'], { stdio: 'ignore', timeout: 15000 });
  return probe.status === 0;
}

function hasPlaywright() {
  try {
    require.resolve('playwright', { paths: [ROOT] });
    return true;
  } catch {
    return false;
  }
}

function preflight(groups) {
  const errors = [];
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 22) errors.push(`需要 Node.js 22+，当前 ${process.versions.node}`);

  if (groups.includes('unit') || groups.includes('algorithms')) {
    if (!detectPython()) errors.push('未找到 Python，请确认 python（Linux 为 python3）在 PATH 中');
    if (!detectTool('javac')) errors.push('未找到 javac，请安装 JDK 17+');
    if (!detectTool('java')) errors.push('未找到 java，请安装 JDK 17+');
  }
  if (groups.includes('browser') && !hasPlaywright()) {
    errors.push('未安装 Playwright：先运行 npm ci 与 npx playwright install chromium');
  }
  return errors;
}

function formatDuration(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function main() {
  const { groups, bail, list, timeout } = parseArgs(process.argv.slice(2));

  if (list) {
    for (const group of groups) {
      console.log(`\n[${group}]`);
      for (const step of GROUPS[group]) console.log(`  ${step.name}  ${step.label}`);
    }
    return 0;
  }

  const errors = preflight(groups);
  if (errors.length) {
    console.error('环境检查未通过：');
    for (const error of errors) console.error(`  - ${error}`);
    return 2;
  }

  const steps = groups.flatMap((group) => GROUPS[group]);
  const python = detectPython();
  const failures = [];
  let passed = 0;
  const startedAt = Date.now();

  for (const [index, step] of steps.entries()) {
    const command = step.command || python;
    console.log(`\n[${index + 1}/${steps.length}] ${step.label} (${step.name})`);
    const started = Date.now();
    const result = spawnSync(command, step.args, {
      cwd: ROOT,
      stdio: 'inherit',
      timeout,
      env: process.env,
    });
    const duration = Date.now() - started;
    if (result.error?.code === 'ETIMEDOUT') {
      failures.push({ ...step, reason: `超时（>${formatDuration(timeout)}）`, duration });
      console.error(`  超时：${step.name}`);
      if (bail) break;
      continue;
    }
    if (result.status === 0) {
      passed++;
      console.log(`  通过（${formatDuration(duration)}）`);
    } else {
      failures.push({ ...step, reason: `退出码 ${result.status ?? 'null'}`, duration });
      console.error(`  失败：${step.name}（${formatDuration(duration)}）`);
      if (bail) break;
    }
  }

  const total = formatDuration(Date.now() - startedAt);
  console.log(`\n${'='.repeat(56)}`);
  console.log(`检查完成：${passed} 通过，${failures.length} 失败，耗时 ${total}`);
  if (failures.length) {
    console.error('\n失败步骤：');
    for (const failure of failures) console.error(`  - ${failure.name}（${failure.reason}）`);
    console.error('\n提示：单个步骤可单独执行，例如：');
    console.error(`  node ${path.relative(ROOT, failures[0].args?.[0] ?? failures[0].name)}`);
    return 1;
  }
  return 0;
}

process.exitCode = main();
