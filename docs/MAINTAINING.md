# 维护与扩展指南

本文是日常维护的操作手册。先看 [ARCHITECTURE.md](ARCHITECTURE.md) 了解分层，
内容规则与生成链路见 [CONTENT-PIPELINE.md](CONTENT-PIPELINE.md)，待办见 [ROADMAP.md](ROADMAP.md)。

## 文档地图

| 想知道 | 看 |
| --- | --- |
| 项目能做什么、怎么跑起来 | `README.md` |
| 代码分层、数据流、扩展点 | `docs/ARCHITECTURE.md` |
| 题库生成、双语言、行映射、复杂度、发布 | `docs/CONTENT-PIPELINE.md` |
| 维护命令、改哪里、提交与发布 | 本文 |
| 已知问题与功能规划 | `docs/ROADMAP.md` |

## 环境与验证

浏览和本地预览只需 Node.js 22+：`npm start`。完整检查需要 Node.js 22+、Python 3.10+、JDK 17+
（`python`、`javac`、`java` 可直接调用）；浏览器验收需要 Playwright。

```sh
npm ci
npx playwright install chromium   # Linux 首次使用 --with-deps
npm test                          # unit + algorithms，默认不跑浏览器
npm run test:browser              # Playwright 验收
npm run test:all                  # 三组全跑
```

`tests/run-all.cjs` 是聚合运行器：按组顺序执行、单步失败后继续、最后统一汇总并给出失败项；
每步都有超时保护。常用参数：

```sh
node tests/run-all.cjs                 # 默认 unit + algorithms
node tests/run-all.cjs unit            # 只跑 Node 检查
node tests/run-all.cjs algorithms      # 只跑 Python/Java 验证
node tests/run-all.cjs browser         # 只跑浏览器验收
node tests/run-all.cjs --list          # 列出步骤
node tests/run-all.cjs --bail          # 首个失败即停止
node tests/run-all.cjs --timeout=1200000
```

- `unit`：Node 算法轨迹与静态数据检查（LIS 检查也会调用 Python/Java）。
- `algorithms`：Python 轨迹重放、性质对照、Java 编译运行、矩阵方案检查。
- `browser`：依次执行主站、Hot 100、复杂度、矩阵方案、键盘、切题验收；脚本自行启动/关闭预览服务，
  运行前关闭占用 4173 端口的本地预览。
- 单项验收可直接执行 `node tests/browser/keyboard-browser-check.cjs` 等；所有命令从项目根目录运行。
- 新增检查：文件放 `tests/unit/` 或 `tests/browser/`，并把步骤登记到 `tests/run-all.cjs` 的 `GROUPS`。

GitHub Actions（`.github/workflows/checks.yml`）在推送和 PR 时运行 `npm test` 与 `npm run test:browser`；
浏览器失败会上传 `test-results/` 截图等材料。Windows 本地若因 `core.autocrlf` 导致生成物比对失败，
确认仓库根目录的 `.gitattributes` 生效（强制 LF），必要时执行 `git config core.autocrlf false` 后重新检出。

## 改什么，去哪里

| 修改目标 | 维护入口 | 生成或验证 |
| --- | --- | --- |
| 首页、搜索、路由、题目详情、切题栏 | `dist/site.js`、`dist/site.css`、`dist/index.html` | 主站与切题浏览器检查 |
| 个人笔记、备份、复习状态 | `dist/records.js` | `tests/unit/records-check.cjs` 与主站浏览器检查 |
| 手写演示 | `dist/problems/<目录>/` | 对应 unit 检查、语言检查、浏览器检查 |
| Hot 100 教学代码、示例与轨迹 | `tools/build-hot100.py`、`tools/teaching-overrides.py`、`tools/hot100-*.json` | `python tools/build-hot100.py` |
| 双语言行映射 | `tools/hot100-line-maps.json` | 人工核对后更新；构建器校验摘要 |
| 复杂度分析 | `tools/complexity-profiles.cjs` | `node tools/build-complexity.cjs` |
| 矩阵置零扩展方案 | `tools/build-matrix-zeroes.py` | `python tools/build-matrix-zeroes.py` |
| 演示方向键行为 | `dist/demo-keyboard.js` | `python tools/build-demo-keyboard.py` 接入页面 |
| 生成器共享的代码提取 | `tools/read-snippets.cjs` | 被 `build-complexity.cjs` 与部分 unit 检查复用 |

`dist/` 是发布目录，但并非全部可再生：手写页面就是源码。不要删除整个目录再构建，
也不要直接批量迁移为 `src/`。Hot 100 的 89 题 `app.js`、`data.js`、`data.json`、页面，
以及矩阵扩展文件和 `dist/complexity-data.js` 由工具生成；优先修改上表的维护入口。
`dist/catalog.js` 的生成标记区段归构建器维护，旧题条目由人工维护。

Hot 100 生成器会继续调用矩阵与键盘生成器；复杂度数据另行构建。更改教学代码后，
人工核对 Python/Java 行映射及代码摘要，再生成并执行完整检查。复杂度代码锁只有在人工复核完成后
才可用 `--accept-reviewed-code` 更新；不可通过刷新锁文件掩盖未核对的代码变化。

## 新增题目

详细规则和生成链路见 [CONTENT-PIPELINE.md](CONTENT-PIPELINE.md)。简要步骤：

1. 按双语言规则准备 Python、Java、示例、代码高亮与轨迹。
2. 手写演示放 `dist/problems/<稳定目录>/`，并在 `dist/catalog.js` 手工区段登记。
   Hot 100 构建器的固定 89 题集合不能直接用于随意新增题号。
3. 在 `tools/complexity-profiles.cjs` 补该题分析并生成；为题目补有意义的输入输出检查。
4. 新增检查登记到 `tests/run-all.cjs`；浏览器独立入口放 `tests/browser/`。
5. 检查双语言切换、前进回退、代码高亮、键盘、嵌入就绪消息及笔记隔离，复用已有题型的页面与播放约定。
6. 开分支、跑完整检查、提 PR；合并后再按发布流程更新站点。

发布后的题目 ID、路由和 `algorithm-notebook.v1` 存储键保持稳定；上游代码署名与许可证保留。

## 分支、提交与发布

- 分支命名：`feat/<主题>`、`fix/<主题>`、`refactor/<主题>`、`docs/<主题>`；一次 PR 只做一类改动。
- 提交信息用 Conventional Commits（`feat:`、`fix:`、`docs:`、`refactor:`、`test:`、`chore:`），
  说明「为什么」而不只是「改了什么」。避免把生成物与手写改动混在同一提交。
- 发布：站点身份在 `.openai/hosting.json`，通过 Sites 工作流同步源码、打包、发布，保留私有访问；
  GitHub 推送不会自动发布。仅发布成功后交付在线地址。
- 发布前人工查看不同题型截图；自动检查不能代替教学内容与代码对应关系的核对。

## 维护范围

当前只维护桌面浏览器上的功能与布局，不再新增手机适配或安排手机专项验收。
已有响应式样式与历史小屏检查保留；后续功能测试、截图和发布验收以桌面为准。

## 后续拆分顺序

先把新增功能放在职责明确的现有模块：题目清单、个人记录、复杂度、键盘控制与独立演示。
若 `site.js` 随功能增长难以维护，再按列表渲染、详情渲染、路由逐步抽取模块；每次保留原有脚本加载顺序
与离线打开能力，并执行浏览器回归。不要同时更换框架、构建链和存储格式。

BMad 是可选的本地开发工作流，当前已完成配置；`_bmad/` 与 `_bmad-output/` 不进入公开仓库，
避免提交含本机路径的渲染文件。其他开发者可按自己的技能环境配置。
