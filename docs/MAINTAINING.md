# 维护与扩展指南

## 环境与验证

浏览和本地预览只需 Node.js：`npm start`。开发检查需要 Node.js 22+、Python 3.10+、JDK 17+（`python`、`javac`、`java` 可直接调用）。

```sh
npm ci
npx playwright install chromium
npm test
npm run test:browser
```

Linux 首次安装浏览器时使用 `npx playwright install --with-deps chromium`。已有 Chrome 可通过环境变量 `CHROME_PATH` 指定可执行文件的绝对路径；默认使用 Playwright 安装的 Chromium，不再依赖某台电脑的安装位置。

- `npm run test:unit`：Node 算法轨迹与静态数据检查（其中 LIS 检查也会调用 Python 和 Java）。
- `npm run test:algorithms`：Python 轨迹重放、性质对照和 Java 编译运行。
- `npm run test:browser`：依次执行主站、Hot 100、复杂度、矩阵方案、键盘、切题验收；脚本自己启动并关闭预览服务，运行前关闭占用 4173 端口的本地预览。
- 单项验收可执行 `node tests/browser/keyboard-browser-check.cjs` 等；所有命令均从项目根目录执行。

GitHub Actions 在推送和 PR 时运行上述两组完整检查。浏览器失败时上传 `test-results/` 中的截图等材料。当前维护范围是桌面，历史脚本已有的小屏回归保留，不新增手机专项要求。

## 改什么，去哪里

| 修改目标 | 维护入口 | 生成或验证 |
| --- | --- | --- |
| 首页、搜索、路由、题目详情 | `dist/site.js`、`dist/site.css`、`dist/index.html` | 主站和切题浏览器检查 |
| 个人笔记与备份 | `dist/records.js` | `tests/unit/records-check.cjs` 与主站浏览器检查 |
| 手写演示 | `dist/problems/<目录>/` | 相应 unit 检查、语言检查、浏览器检查 |
| Hot 100 教学代码、示例与轨迹 | `tools/build-hot100.py`、`tools/teaching-overrides.py`、`tools/hot100-*.json` | `python tools/build-hot100.py` |
| 复杂度分析 | `tools/complexity-profiles.cjs` | `node tools/build-complexity.cjs` |
| 矩阵置零扩展方案 | `tools/build-matrix-zeroes.py` | `python tools/build-matrix-zeroes.py` |
| 演示方向键行为 | `dist/demo-keyboard.js` | 接入页面后运行 `python tools/build-demo-keyboard.py` |

`dist/` 是发布目录，但当前并非全部可再生：手写页面就是源码。不要删除整个目录再构建，也不要直接批量迁移为 `src/`。Hot 100 的 89 题 `app.js`、`data.js`、`data.json`、页面，以及矩阵扩展文件和 `dist/complexity-data.js` 由工具生成，优先修改上述维护入口；`dist/catalog.js` 的生成标记区段归构建器维护，旧题条目仍由人工维护。

Hot 100 生成器会继续调用矩阵与键盘生成器；复杂度数据另行构建。更改教学代码后，人工核对 Python/Java 行映射及代码摘要，再生成并执行完整检查。复杂度代码锁只有在人工复核完成后才可用 `--accept-reviewed-code` 更新。不可通过刷新锁文件掩盖未核对的代码变化。

## 新增题目

1. 按 README 的双语言规则准备 Python、Java、示例、代码高亮与轨迹。
2. 手写演示放在 `dist/problems/<稳定目录>/`，并登记 `dist/catalog.js` 的手工区域。Hot 100 构建器的固定 89 题集合不能直接用于随意新增题号。
3. 为题目添加复杂度说明及有意义的输入输出检查。新增 Node 检查放 `tests/unit/`，加入 `package.json` 的 `test:unit`；浏览器独立入口放 `tests/browser/`，加入 `test:browser`。Python 检查暂与工具放在一起，以保留导入和数据路径。
4. 检查双语言切换、前进回退、代码高亮、键盘、嵌入就绪消息及笔记隔离。复用已有题型的页面与播放约定。
5. 跑完整检查，在新分支提交后通过 PR 合并。上线按 README 的 Sites 发布流程单独执行，保留现有站点身份与访问设置。

发布后的题目 ID、路由和 `algorithm-notebook.v1` 存储键保持稳定；上游代码署名与许可证保留。GitHub 上传不会自动替你发布 Sites 站点。

## 后续拆分顺序

先把新增功能放在职责明确的现有模块：题目清单、个人记录、复杂度、键盘控制与独立演示。若 `site.js` 随功能增长难以维护，再按列表渲染、详情渲染、路由逐步抽取模块；每次保留原有脚本加载顺序与离线打开能力，并执行浏览器回归。不要同时更换框架、构建链和存储格式。

BMad 是可选的本地开发工作流，当前已完成配置；`_bmad/` 与 `_bmad-output/` 不进入公开仓库，避免提交含本机路径的渲染文件。其他开发者可按自己的技能环境配置。
