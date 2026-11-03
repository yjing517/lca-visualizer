# 算法拾遗 · Python/Java 双语言算法可视化错题集

[![checks](https://github.com/yjing517/lca-visualizer/actions/workflows/checks.yml/badge.svg)](https://github.com/yjing517/lca-visualizer/actions/workflows/checks.yml)

把「刷过的题」变成「真正理解的题」。这是一个纯静态的个人算法学习站：104 道 LeetCode 题目
（覆盖 Hot 100 全部 100 题，另保留 513、77、216），每题都配有可单步回放的执行过程、
Python 与 Java 两份等价实现、最好/最坏复杂度分析，以及保存在浏览器里的个人笔记。

## 功能

- **逐步回放**：按调用栈、变量快照和数据结构状态显示每一步；支持上一步/下一步、自动播放、进度拖动。
- **双语言对照**：同一算法同时提供 Python 与 Java，切换语言保留当前示例和进度，高亮映射到对应代码行。
- **打家劫舍四阶段**：198 保留原题 ID，同一演示支持暴力递归 → 记忆化搜索 → 递推 DP → 滚动变量，
  状态定义、边界与滚动顺序逐阶段对照。
- **复杂度分析**：每题给出最好/最坏时间与空间、触发条件和原因；LRU、Trie、最小栈、数据流中位数按操作拆分。
- **个人记录**：掌握程度、待复习标记和笔记保存在浏览器（`algorithm-notebook.v1`），可导出/导入 JSON 备份。
- **题库检索**：按题号、名称、标签搜索，按题型和掌握程度筛选；详情页可连续切换上一题/下一题。
- **纯静态**：无后端、无账号、无外部请求；`npm start` 或直接打开 `dist/index.html` 即可使用。

## 快速开始

```sh
# 仅需 Node.js 22+
npm start          # 打开终端输出的本地地址（默认 http://127.0.0.1:4173）
```

也可以直接双击 `dist/index.html`。本地文件与线上网址的浏览器存储相互独立，长期使用建议固定一个地址。

## 目录结构

```text
dist/                发布目录：站点页面、运行时脚本、题目演示（手写页面即源码）
  problems/          每题一个目录：独立页面 + 演示脚本 + 轨迹数据
tools/               题库数据、生成器、Python/Java 算法验证、上游参考材料与共享工具
  traces/            轨迹校验数据（构建与测试使用，不随站点发布）
tests/unit/          Node 检查：轨迹、题库、双语言、记录、复杂度、生成数据一致性
tests/browser/       Playwright 验收：主站、Hot 100、复杂度、矩阵、键盘、切题
tests/run-all.cjs    聚合测试运行器（分组执行、失败后继续、统一汇总）
docs/                架构、维护、内容生产与路线图文档
serve.cjs            仅用于本地预览的静态服务器
```

## 文档

| 文档 | 内容 |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 运行时分层、数据流、目录职责、关键不变量与扩展点 |
| [docs/MAINTAINING.md](docs/MAINTAINING.md) | 环境、测试命令、改什么去哪里、新增题目与发布流程 |
| [docs/CONTENT-PIPELINE.md](docs/CONTENT-PIPELINE.md) | 双语言规则、Hot 100 生成链路、行映射/复杂度锁、演示约定 |
| [docs/ROADMAP.md](docs/ROADMAP.md) | 待修问题与功能模块规划（按优先级） |

## 测试

```sh
npm ci                              # 安装 Playwright（仅浏览器验收需要）
npx playwright install chromium
npm test                            # unit + algorithms，约 1-2 分钟
npm run test:browser                # 浏览器验收，需要 Playwright
```

`npm test` 会执行 Node 检查与 Python/Java 验证，覆盖 261 个双语言示例、轨迹快照重放、
固定种子性质对照和 Java 编译运行。GitHub Actions 在每次推送和 PR 时运行同样的检查。

## 维护范围

当前只维护桌面浏览器上的功能与布局；已有响应式样式与历史小屏检查保留，但不再新增手机专项适配。
具体约束见 [docs/MAINTAINING.md](docs/MAINTAINING.md)。

## 许可与署名

- 89 道 Hot 100 题的教学实现与讲解参考 [doocs/leetcode](https://github.com/doocs/leetcode)，
  按 **CC BY-SA 4.0** 使用，署名与许可全文见 `dist/problems/hot100-LICENSE.txt`，每题演示页底部保留来源链接。
- 站点自身代码尚未单独声明开源许可。对外复用前请先补充 `LICENSE`（建议代码 MIT、
  派生题目内容继续 CC BY-SA 4.0），并保留上述署名。
