# 内容生产与维护

题库的「内容规则 + 生成链路」都在这里。环境与命令见 [MAINTAINING.md](MAINTAINING.md)，
运行时结构见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 1. 双语言强制规则

每道题、每个新增解法必须同时提供 **Python 与 Java** 实现，不能因为截图或题解只有一种语言就省略另一种。

- 两版采用相同算法、示例与边界约定，包含所需标准库导入；题目平台提供的节点类型可省略。
- 演示提供 `id="lang"` 的语言选择器，选项值为 `Python` 与 `Java`。
- 切换语言保留当前示例、进度、树或队列状态；当前步骤映射到所选语言的对应代码行。
- 演示脚本用 `const snippets={...};` 保存两种语言的代码行，便于检查实际展示内容。
- 新增演示必须纳入双语言检查；任一语言缺失或验证失败不得发布。

## 2. 新增手写题目

1. **确认题意**：分清截图中的题目内容与实际请求；缺关键信息先补确认。
2. **制作演示**：在 `dist/problems/<稳定目录>/` 放独立 HTML 与演示脚本，提供单步、回退、播放、
   代码高亮与中文解释；按题型选择图形，不强制套二叉树。
3. **登记分类**：在 `dist/catalog.js` 手工区段添加条目（字段与已有条目一致）。`id` 发布后不变；
   题型与标签复用已有词汇；首页、搜索、分类会自动更新。同题新解法放在原演示中。
4. **补复杂度与记录兼容**：在 `tools/complexity-profiles.cjs` 增加该题分析并重新生成；
   确认旧笔记仍按 id 读取。
5. **验证**：`npm test` + `npm run test:browser`；给新算法补充有意义的输入输出检查，
   覆盖双语言切换与高亮、播放操作、桌面布局。
6. **提交**：新分支 + PR（模板见 `.github/pull_request_template.md`），CI 通过后合并。

> 新增 Node 检查放 `tests/unit/` 并登记到 `tests/run-all.cjs` 的 `GROUPS`；独立浏览器入口放
> `tests/browser/` 并登记；Python 检查暂与工具放在 `tools/` 以保留导入和数据路径。

## 3. Hot 100 生成链路

当前采用力扣中文站 `top-100-liked` 学习计划，清单快照为 `tools/hot100.json`。
100 题全部覆盖；题库另保留 513、77、216，共 103 题。Hot 100 标签只用于搜索，不改变已有分类与记录。

89 道新增题使用独立入口 `dist/problems/hot100-<题号>/`，共享播放界面：

- `app.js`：Python/Java 双语言代码行 + 页面逻辑；
- `data.js`：可离线打开的轨迹（`window.HOT100_DATA`），由真实 Python 执行生成；
- `data.json`：同一轨迹的校验数据（构建与测试使用，不被浏览器加载）。

数据与生成器：

| 文件 | 作用 |
| --- | --- |
| `tools/upstream/` | doocs/leetcode 参考实现、题意与许可证；保留原始文件 |
| `tools/teaching-overrides.py` | 为教学展开的实现；修改时注明原因 |
| `tools/hot100-views.json` | 每题重点变量与状态含义 |
| `tools/hot100-cursors.json` | 数组下标与业务坐标的映射（如编辑距离 `i−1`） |
| `tools/hot100-hints.json`、`tools/hot100-complexities.json` | 关键原理与需特别说明的复杂度 |
| `tools/hot100-line-maps.json` | Python→Java 行映射与两版代码摘要 |
| `tools/build-hot100.py` | 生成 89 题页面、代码、轨迹及 `catalog.js` 标记区段 |

生成命令：

```sh
python tools/build-hot100.py
```

要点：

- 轨迹由实际执行 Python 代码生成，并与独立示例答案核对；Java 实现另行编译运行相同输入。
- 现有构建器只维护固定 89 题集合，**不会自动接纳**未来新增题号；更新官方清单前先核对差异。
- 生成器会调用矩阵与键盘生成器；复杂度数据需要另行构建。
- 旧题的原始条目、演示和个人记录不由生成器重写。

## 4. 行映射与代码摘要锁

`tools/hot100-line-maps.json` 为每题保存 `pythonSha256`、`javaSha256` 与逐行映射 `lines`。

- 修改教学代码后必须**人工核对**行映射，再更新映射文件；构建器遇到摘要不符会失败，不会猜测新的高亮位置。
- Python 的复合语句可以对应 Java 的多条操作，界面显示对应逻辑行；切换语言时使用同一个状态快照。
- 只校验行号范围不够：映射还要对齐「同一语义位置」，例如 `left = mid + 1` 在有序左支与 else 支
  对应不同 Java 行。修改后至少人工检查分支分支归属（见 ROADMAP 的已知缺陷）。

## 5. 复杂度分析

每题详情在题意下方展示「复杂度分析」：默认是最坏时间与空间摘要，展开后查看最好/最坏情形、
触发条件与原因；页首按钮（键盘可聚焦）可定位。

- 编辑 `tools/complexity-profiles.cjs`：每题填写时间、空间的 `best`/`worst`（`bound`、`when`、`why`），
  并解释返回结果的空间；默认辅助空间，使用总峰值的题目用 `spaceLabel` 明示。
- 运行 `node tools/build-complexity.cjs` 生成 `dist/complexity-data.js`。
- `tools/complexity-code-lock.json` 绑定两种语言的代码摘要；解法改动后先复核分析，再用
  `node tools/build-complexity.cjs --accept-reviewed-code` 记录已核对摘要。
  该参数只记录摘要，不会自动分析或保证正确。
- 分析以当前展示代码为准，不按题型套模板。注意：198 是无缓存递归；53/45/152 的 Python 切片占线性空间；
  二分边界查找即使命中中点也不提前返回；437 中归零的前缀和键没有被删除。平均、均摊、严格单次最坏不可混写。
- 库细节核对参考 [CPython 3.10 排序](https://docs.python.org/3.10/howto/sorting.html)、
  [CPython 3.10.11 堆源码](https://github.com/python/cpython/blob/v3.10.11/Modules/_heapqmodule.c)、
  [OpenJDK 17 排序源码](https://github.com/openjdk/jdk17u/blob/master/src/java.base/share/classes/java/util/DualPivotQuicksort.java)、
  [Java 17 Arrays](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Arrays.html)、
  [Java 17 PriorityQueue](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/PriorityQueue.html)。
  库版本变化时须重新核对实现相关说明。

## 6. 矩阵置零扩展方案

73 保留原有 O(m+n) 行列标记演示，并在顶部链接 `problems/hot100-73/optimizations.html`。
对照页另提供复制原矩阵（Θ(mn) 辅助空间）与首行首列标记（Θ(1) 辅助空间），三种方法均为 Θ(mn) 时间。

- `tools/build-matrix-zeroes.py` 保存新增 Python/Java 实现、人工核对的行映射与分阶段解释，
  生成独立代码与真实 Python 轨迹；`tools/build-hot100.py` 结束时调用它。
- `python tools/check-matrix-zeroes.py` 对三种方案分别执行 692 个矩阵检查，并验证轨迹未过期。
- 题目 id、原分类标签、个人记录及默认演示的复杂度分析继续对应原有行列标记法。

## 7. 演示与交互约定

- **键盘**：全部演示支持 ← 上一步、→ 下一步；操作说明固定在播放控制旁。自动播放时按键暂停；
  首尾不越界；在输入框/下拉框/可编辑区域或按住修饰键时不接管；题目页可把按键传给嵌入演示。
  共享实现是 `dist/demo-keyboard.js`，由 `python tools/build-demo-keyboard.py` 接入页面。
- **嵌入协议**：演示可交互后向父页面发送 `{ type: 'algorithm-demo-ready', height: 文档内容高度 }`，
  并用 `ResizeObserver` 在尺寸变化时重发。父页面只接收来自当前演示窗口的消息，同源时校验 origin；
  高度取内容高度并 clamp，超时未就绪时提示独立打开。
- **轨迹格式**：每个事件包含语言行号、阶段、动作、解释、调用栈与数据结构快照；示例为固定教学输入，
  不在浏览器中执行算法。
- **切题栏**：详情页提供上一题/下一题/下拉选择与位置，顺序与题库列表一致；首尾禁用；切题复用 hash 路由，
  左右方向键仍只用于演示步骤。

## 8. 发布

- 站点身份在 `.openai/hosting.json`，通过 Sites 工作流同步源码、打包、发布；保留私有访问。
- 仅发布成功后交付在线地址；GitHub 推送不会自动发布站点。
- 每次发布前人工查看数组/窗口、矩阵/DP、树/递归、链表/缓存、图、堆、回溯等题型的截图；
  自动检查不能代替教学内容与代码对应关系的核对。
- 题解与代码引用保留 doocs/leetcode 署名及 CC BY-SA 4.0 许可，见演示页底部。
