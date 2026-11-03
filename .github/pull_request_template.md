## 改动说明

<!-- 说明为什么改、影响哪些页面/题目；关联 issue 请写 Closes #n -->

## 自检

- [ ] 涉及题目时：Python / Java 双语言齐全，切换语言保留示例与进度，行映射已人工核对
- [ ] 涉及生成物时：通过维护入口修改并重新生成，没有手改 `dist/` 中由工具生成的文件
- [ ] 涉及复杂度时：`tools/complexity-profiles.cjs` 已复核，代码锁按流程更新
- [ ] 涉及 records 时：旧记录可读取，导入/导出与损坏场景有检查
- [ ] `npm test` 通过
- [ ] 受影响页面已跑 `npm run test:browser`（或说明未跑原因）
- [ ] 新增/修改的检查已登记到 `tests/run-all.cjs`
- [ ] 保留了 doocs/leetcode 署名与 CC BY-SA 4.0 许可

## 截图 / 验证记录

<!-- 桌面截图、检查输出摘要或失败排查说明 -->
