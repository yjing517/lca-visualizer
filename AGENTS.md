# 算法拾遗维护规则

修改题库、演示或发布前，先读 `docs/MAINTAINING.md`（命令与发布）、`docs/CONTENT-PIPELINE.md`
（双语言与生成链路）与 `docs/ARCHITECTURE.md`（分层与扩展点）。

每道题及每个新增解法必须实现 Python、Java 两版，提供语言切换及对应代码行高亮。切换时保留当前示例与执行状态。不能因为截图只有一种语言而省略另一种。

改教学代码或复杂度分析后，人工核对 `tools/hot100-line-maps.json` 与 `tools/complexity-code-lock.json`，
不要通过刷新锁文件掩盖未复核的变化。不要手改 `dist/` 中由工具生成的文件，不要删除 `dist/` 重建，
不要引入运行时构建链或需要服务器的能力。

完成 `node tests/run-all.cjs` 和浏览器验收后，复用现有站点身份和私有访问发布；保留题目 id、个人记录和页面风格。
