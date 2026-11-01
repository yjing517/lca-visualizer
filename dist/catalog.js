// 新题在这里登记；id 发布后保持不变，用于关联个人笔记。
window.PROBLEMS = [{
  id: 'leetcode-236', number: '236', title: '二叉树的最近公共祖先', difficulty: '中等',
  category: '二叉树', tags: ['递归', 'DFS', '后序遍历'], addedAt: '2026-11-01',
  source: 'https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/',
  summary: '跟着递归向下寻找，再看节点怎样带着线索向上返回。',
  statement: '给定一棵二叉树和其中的两个节点 p、q，找到它们的最近公共祖先。一个节点也可以是它自己的祖先。原题保证节点值互不相同，p、q 不同且都在树中；演示额外允许 p = q。',
  demo: 'problems/lca/index.html',
  principles: [
    { title: '先理解每次调用的返回值', text: '返回 null 表示这棵子树里没有目标；返回节点表示找到了目标，或已经确定了最近公共祖先。返回值是一条向上传递的线索。' },
    { title: '左右都有线索，当前节点就是答案', text: '后序遍历先得到 left 和 right，再处理当前节点。两者都不为空，意味着两个目标分别位于左右子树，当前 root 是它们最深的汇合点。' },
    { title: '只有一边有线索，就原样向上传', text: '当前节点不替换子树返回的结果。若最近公共祖先在更深的一层已经确定，上层会把它一直传回根调用。' }
  ],
  pitfalls: ['遇到 p 或 q 就返回，不代表整个算法停止，只结束当前这次调用。', 'p = 5、q = 4 时，5 本身就是答案，因此无须继续搜索 5 的子树。', '代码比较的是节点身份，而不是节点值；树中值唯一仅用于方便展示。'],
  complexity: '最坏时间 O(n)：每个节点最多访问一次。额外空间 O(h)：递归栈深度为树高，最坏退化为 O(n)。'
}, {
  id: 'leetcode-513', number: '513', title: '找树左下角的值', difficulty: '中等',
  category: '二叉树', tags: ['BFS', '层序遍历', '队列'], addedAt: '2026-11-01',
  source: 'https://leetcode.cn/problems/find-bottom-left-tree-value/',
  summary: '先右后左入队，为什么最后出队的节点恰好是最底层最左边？',
  statement: '给定二叉树根节点 root，返回最底层最左边节点的值。题目保证至少有一个节点。示例 1：root = [2,1,3]，输出 1；示例 2：root = [1,2,3,4,null,5,6,null,null,7]，输出 7。',
  demo: 'problems/bottom-left/index.html',
  principles: [
    { title: 'q.popleft()：从队头取出节点', text: 'q 是 deque 双端队列，popleft() 删除并返回最左端元素，赋给 node。append() 加到右端。node 是本轮取出的树节点，不是队列。' },
    { title: '为什么先放右孩子，再放左孩子？', text: '队列先进先出，逐层访问。每层父节点从右到左处理，每个父节点也先右后左加入孩子，因此下一层仍从右到左访问。' },
    { title: '循环结束后，node 仍然存在', text: 'Python 的 while 不创建局部作用域。最后一次出队的节点保留在 node 中：它来自最深一层，并且是该层最左边，所以返回 node.val。' }
  ],
  pitfalls: ['左右指的是树上位置，不是数值大小；不要寻找最小值。', '若改成先左后右入队，最后访问的是最底层最右节点；普通层序解法要记录每层第一个节点。', '队列为空时退出循环，不会再执行 popleft()。单节点树直接返回根值；原题不接收空树。'],
  complexity: '时间 O(n)：每个节点入队、出队各一次。额外空间 O(w)：w 为最大层宽，最坏 O(n)。deque 的 popleft() 为 O(1)，无需像列表 pop(0) 那样搬移元素。'
}, {
  id: 'leetcode-17', number: '17', title: '电话号码的字母组合', difficulty: '中等',
  category: '回溯', tags: ['递归', 'DFS', '字符串'], addedAt: '2026-11-01',
  source: 'https://leetcode.cn/problems/letter-combinations-of-a-phone-number/',
  summary: '递归每次填一个格子：看清 return 回到哪里，以及固定数组为什么无需撤销。',
  statement: '给定仅包含数字 2—9 的字符串 digits，返回所有可能的字母组合，顺序任意。映射为 2:abc、3:def、4:ghi、5:jkl、6:mno、7:pqrs、8:tuv、9:wxyz。示例：23 → [ad,ae,af,bd,be,bf,cd,ce,cf]；空字符串 → []；2 → [a,b,c]。',
  demo: 'problems/phone/index.html',
  principles: [
    { title: 'dfs(i) 只负责第 i 个位置', text: '前 i 个位置已经确定。循环遍历 digits[i] 对应的字母，写入 path[i]，再调用 dfs(i+1) 处理下一位。i == n 时已经填满，先保存再返回。' },
    { title: '返回上一层，继续尚未结束的循环', text: 'dfs(2) 保存 ad 后返回 dfs(1)，后者继续选 e、f。整个 a 分支完成后，dfs(1) 返回 dfs(0)，第一位才改选 b。' },
    { title: '固定数组通过覆盖实现回溯', text: 'path 长度固定为 n，不用 append/pop；下一次 path[i] = c 覆盖原值。收集答案前，每格都会由相应层重新填写。join(path) 或 new String(path) 保存独立字符串，不会被后续修改影响。' }
  ],
  pitfalls: ['i 是位置下标，不是数字本身；digits[i] 是字符，需要转换后查询映射。', 'return 只结束当前调用；for 循环完成后也会自然返回上一层。', '切换第一位时，后面可能还留着旧字母；填满之前不会收集。空字符串应返回 []，不是包含空字符串的数组。'],
  complexity: '设 n 为输入长度，K 为组合总数。时间 O(nK)，其中拼接每个答案需 O(n)；递归栈与 path 的额外空间 O(n)，结果占 O(nK)。K 最多为 4ⁿ。'
}, {
  id: 'leetcode-78', number: '78', title: '子集', difficulty: '中等',
  category: '回溯', tags: ['递归', 'DFS'], addedAt: '2026-11-01',
  source: 'https://leetcode.cn/problems/subsets/',
  summary: '两次 dfs 分别选与不选；用 pop 撤销，用 copy 保存不会变化的答案。',
  statement: '给定元素互不相同的整数数组 nums，返回所有子集（幂集），不能包含重复子集，顺序任意。示例 nums = [1,2,3]，结果包含 []、[1]、[2]、[3]、[1,2]、[1,3]、[2,3]、[1,2,3]；nums = [0] 返回 [[],[0]]。',
  demo: 'problems/subsets/index.html',
  principles: [
    { title: '两次调用探索两个选择', text: 'dfs(i) 决定 nums[i] 是否加入子集。先不选，执行第一次 dfs(i+1)；等整个不选分支返回后，append 当前数字，执行第二次 dfs(i+1)。参数相同，但 path 不同。' },
    { title: 'pop 恢复调用前的状态', text: '子调用不会自动恢复共享列表。每层撤销自己添加的数字，更深层的数字由更深层撤销。这样返回后 path 与进入本层时一致，后续分支不会混入旧选择。' },
    { title: 'copy 保存独立的结果', text: 'ans.append(path) 保存的是同一列表的引用；之后的 append/pop 会影响所有这些记录，最终都变成空列表。path.copy() 或 Java 的 new ArrayList<>(path) 保存当前内容的独立列表。元素是整数，浅拷贝足够。' }
  ],
  pitfalls: ['第一次 dfs 并非重复调用：它不选当前数字，第二次则已经选了。', 'return 只结束当前调用，回来后仍会执行父层的 append、第二次 dfs 或 pop。', '本题动态增加元素，所以要 pop；电话号码题用固定下标覆盖，无需 pop。', '空集也是子集；只有所有数字都决定完才收集。截图遍历顺序与题面示例不同是正常的。'],
  complexity: '共 2ⁿ 个子集，复制结果总计 O(n·2ⁿ) 时间。递归栈和 path 的额外空间 O(n)，结果空间 O(n·2ⁿ)。'
}, {
  "id": "leetcode-77",
  "number": "77",
  "title": "组合",
  "difficulty": "中等",
  "category": "回溯",
  "tags": [
    "递归",
    "DFS",
    "剪枝"
  ],
  "addedAt": "2026-11-01",
  "source": "https://leetcode.cn/problems/combinations/",
  "summary": "倒序枚举与恢复路径：看懂 j ≥ d 为什么能剪掉凑不满的分支。",
  "statement": "给定整数 n 和 k，返回 [1,n] 中所有 k 个数的组合，顺序任意。1 ≤ k ≤ n ≤ 20。示例：n=4,k=2 → [[2,4],[3,4],[2,3],[1,2],[1,3],[1,4]]；n=1,k=1 → [[1]]。",
  "demo": "problems/combinations/index.html",
  "principles": [
    {
      "title": "递减路径消除重复",
      "text": "选 j 后递归 dfs(j−1)，只使用更小数字；每组数有且只有一种递减排列。"
    },
    {
      "title": "还缺 d 个数，j 至少为 d",
      "text": "d=k−len(path)。选择 j 后，剩余 j−1 个数字必须能凑出 d−1 个，所以 j≥d。Python range(i,d−1,−1) 包含 d；Java 用 j>=d。"
    },
    {
      "title": "复制答案，返回后撤销",
      "text": "达到 k 个数时复制 path，return 回到父调用，再 pop 恢复路径，继续父层循环。"
    }
  ],
  "pitfalls": [
    "组合不计顺序；截图代码生成递减路径，与示例内部升序不矛盾。",
    "不能直接保存共享的 path 引用；后续撤销会改变它。",
    "if i<d:return 可以省略，因为剪枝后的循环此时为空；不能把 range 终点写成 d。"
  ],
  "complexity": "时间 O(k·C(n,k))；辅助空间 O(k)，结果空间 O(k·C(n,k))。"
}];
