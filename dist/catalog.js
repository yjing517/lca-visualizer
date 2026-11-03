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
}, {
  "id": "leetcode-46",
  "number": "46",
  "title": "全排列",
  "difficulty": "中等",
  "category": "回溯",
  "tags": [
    "递归",
    "DFS"
  ],
  "addedAt": "2026-11-01",
  "source": "https://leetcode.cn/problems/permutations/",
  "summary": "每层选一个未使用数字：新集合隔离候选，固定数组覆盖路径，复制保存答案。",
  "statement": "给定不含重复数字的数组 nums，返回所有全排列，顺序任意。1 ≤ nums.length ≤ 6，−10 ≤ nums[i] ≤ 10。示例 [1,2,3] → [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]；[0,1] → [[0,1],[1,0]]；[1] → [[1]]。",
  "demo": "problems/permutations/index.html",
  "principles": [
    {
      "title": "dfs(i,s)：填位置 i，候选来自 s",
      "text": "前 i 个格子已确定。枚举剩余数字 x，写入 path[i]，传入 s−{x} 递归处理下一格。同一路径不会重复用数字，每个排列恰好出现一次。"
    },
    {
      "title": "集合创建副本，数组按位置覆盖",
      "text": "s−{x} 返回新集合，不修改父层 s；path 共享但长度固定，下一分支覆盖对应下标，无需 pop。未填格子的旧值不是当前有效路径。"
    },
    {
      "title": "保存时复制，return 只结束当前调用",
      "text": "i==n 时复制 path；返回父调用后继续 for 的下一候选。直接保存 path 引用会让所有结果随覆盖而变化。Python set 遍历顺序不保证，演示按输入顺序展开。"
    }
  ],
  "pitfalls": [
    "排列计顺序：[1,2] 和 [2,1] 是两个答案；不能用组合的递减限制。",
    "s−{x} 不是原地删除；若原地修改遍历中的集合会出错。",
    "固定数组无需 pop，但必须复制保存答案；数字互不相同是使用 set 的前提。"
  ],
  "complexity": "时间 O(n·n!)；递归栈与固定路径 O(n)，各层新建集合合计辅助空间 O(n²)，结果空间 O(n·n!)。"
}, {
  id: 'leetcode-131', number: '131', title: '分割回文串', difficulty: '中等',
  category: '回溯', tags: ['递归', 'DFS', '字符串', '剪枝'], addedAt: '2026-11-01',
  source: 'https://leetcode.cn/problems/palindrome-partitioning/',
  summary: '从选子集到选切割点：枚举下一段终点，回文才递归，下一段从 j+1 开始。',
  statement: '给定字符串 s，将它分割成若干连续子串，使每段都是回文串，返回所有分割方案。回文串正读反读相同。示例 aab → [["a","a","b"],["aa","b"]]；a → [["a"]]。原题 1 ≤ s.length ≤ 16，且仅含小写英文字母。',
  demo: 'problems/palindrome/index.html',
  principles: [
    { title: '子集的选择对象变成字符间隙', text: '每个间隙可切或不切，但最后每段都必须回文。循环 j 从 i 到 n-1，直接枚举下一段 s[i:j+1]；循环的每一轮都是一个不同分支，无需再写两个显式 dfs。' },
    { title: 'dfs(i) 处理尚未分割的后缀', text: '进入调用时，path 是 s[0:i] 的合法回文分割。选中覆盖 i 到 j 的一段后，下一段从 j+1 开始，所以递归 dfs(j+1)，不能固定写 i+1。i==n 时整个字符串恰好覆盖，保存方案。' },
    { title: '回文过滤与选择撤销', text: 't[::-1] 是反转串，相等才 append(t)、递归、pop。非回文只跳过当前候选，不能 break，因为更长的段可能回文。叶子处 copy 独立保存列表，之后 pop 不会改变答案。' }
  ],
  pitfalls: ['切片 s[i:j+1] 包含 j，因为右端不包含；Java substring 也一样。', '选 aa 后从下标 2 继续，不能从 1 开始重复字符。每段必须连续且所有段拼回原字符串。', '单字符始终回文；ab 不回文不代表 aba 不回文。', '和子集题一样，return 只返回上一层，父层仍要 pop 并继续循环；只有 i==n 才收集完整方案。'],
  complexity: '截图逐段切片、反转判断版本：最坏时间 O(n·2ⁿ)，不含结果的辅助空间 O(n)。当前递归链上的已选字符串覆盖互不重叠的前缀，总长度不超过 n。结果空间 O(n·2ⁿ)。'
}, {
  "id": "leetcode-239",
  "number": "239",
  "title": "滑动窗口最大值",
  "difficulty": "困难",
  "category": "单调队列",
  "tags": [
    "队列",
    "滑动窗口"
  ],
  "addedAt": "2026-11-01",
  "source": "https://leetcode.cn/problems/sliding-window-maximum/",
  "summary": "下标入队、队尾淘汰、队头过期：看懂为什么最大值总在队头。",
  "statement": "给定整数数组 nums 和大小为 k 的滑动窗口，每次向右移动一位，返回每个窗口的最大值。1 ≤ k ≤ nums.length ≤ 100000，元素范围 −10000 至 10000。示例 nums=[1,3,−1,−3,5,3,6,7]，k=3，输出 [3,3,5,5,6,7]；nums=[1]，k=1，输出 [1]。",
  "demo": "problems/sliding-window/index.html",
  "principles": [
    {
      "title": "队列存下标，对应值严格递减",
      "text": "入队前从队尾删除所有值 ≤ x 的下标，再加入 i。新值不小、出现更晚，旧候选不可能再成为必需的最大值。"
    },
    {
      "title": "从队头移除过期下标",
      "text": "窗口是 [i−k+1,i]，过期条件 q[0]<i−k+1，等价于 i−q[0]≥k。下标递增，过期元素只可能在队头。每轮右移一格，至多一个旧下标刚过期。"
    },
    {
      "title": "窗口完整后读队头",
      "text": "i≥k−1 时才记录 nums[q[0]]。队列保留了最大值候选，且值严格递减，因此队头就是当前窗口最大值。"
    }
  ],
  "pitfalls": [
    "q.append(i) 存下标，不是值；读取答案需要 nums[q[0]]。",
    "pop 从队尾淘汰被替代候选；popleft 从队头移除过期候选，含义不同。",
    "<= 会淘汰旧的相等值，保留更新的下标；负数同样适用。",
    "while 看似嵌套，但每个下标最多入队、出队各一次，所以总时间 O(n)。"
  ],
  "complexity": "时间 O(n)，候选队列空间 O(k)，输出空间 O(n−k+1)。截图先入后出，队列可短暂有 k+1 个下标。"
}, {
  "id": "leetcode-198",
  "number": "198",
  "title": "打家劫舍",
  "difficulty": "中等",
  "category": "动态规划",
  "tags": [
    "递归",
    "DFS"
  ],
  "addedAt": "2026-11-01",
  "source": "https://leetcode.cn/problems/house-robber/",
  "summary": "从选或不选出发，逐步推导暴力递归、记忆化、递推 DP 与滚动变量。",
  "statement": "给定非负整数数组 nums，每项表示一间房屋的金额。不能选择相邻房屋，求最大总金额。[1,2,3,1] → 4；[2,7,9,3,1] → 12。1 ≤ nums.length ≤ 100，0 ≤ nums[i] ≤ 400。",
  "demo": "problems/robber/index.html",
  "principles": [
    {
      "title": "状态：前缀的最优金额",
      "text": "dfs(i) 表示考虑下标 0 到 i 的最大金额，不要求选择 i。i<0 时没有房屋，返回 0。"
    },
    {
      "title": "转移：选或不选",
      "text": "不选 i：dfs(i−1)；选 i：必须跳过 i−1，得到 dfs(i−2)+nums[i]。两类覆盖所有合法选择，取 max 而不是相加。"
    },
    {
      "title": "从递归到动态规划",
      "text": "四阶段可切换：暴力递归重复求值，记忆化缓存返回值；递推用 f[i] 表示前 i 间，最后滚动保留前两个状态。"
    }
  ],
  "pitfalls": [
    "不是找最大的单间，也不是比较奇偶下标之和；[2,1,1,2] 应选两端。",
    "return 只返回父调用；两个子调用都返回后才计算 max。",
    "默认暴力递归在 n=100 时可能超时；优化版代码支持原题规模，交互示例统一限小规模方便对照。"
  ],
  "complexity": "默认暴力递归时间 O(φⁿ)（O(2ⁿ) 上界），栈空间 O(n)；记忆化时间和空间均 O(n)，滚动递推时间 O(n)、额外空间 O(1)。"
}, {
  "id": "leetcode-1143",
  "number": "1143",
  "title": "最长公共子序列",
  "difficulty": "中等",
  "category": "动态规划",
  "tags": [
    "字符串",
    "滚动数组"
  ],
  "addedAt": "2026-11-01",
  "source": "https://leetcode.cn/problems/longest-common-subsequence/",
  "summary": "二维表压缩成一行后，pre 和 tmp 怎样保护被覆盖的左上角？",
  "statement": "给定两个字符串，返回最长公共子序列的长度。子序列可删除任意字符，但保留原有相对顺序，不要求连续。示例 abcde 与 ace → 3；abc 与 abc → 3；abc 与 def → 0。原题输入均为非空小写英文字母串，演示额外支持空串。",
  "demo": "problems/lcs/index.html",
  "principles": [
    {
      "title": "先看两个前缀的二维答案",
      "text": "D[r][c] 表示 s 前 r 个字符和 t 前 c 个字符的 LCS 长度。末尾相同：D[r-1][c-1]+1；不同：max(D[r-1][c],D[r][c-1])。空前缀对应第 0 行或第 0 列，答案为 0。"
    },
    {
      "title": "一维数组同时装着新旧两行",
      "text": "从左到右计算 D[i+1][j+1] 时，f[j] 已经是当前行左方；f[j+1] 还是上一行上方。上一行左上角原本也在数组里，但已被覆盖，必须另外用 pre 保存。"
    },
    {
      "title": "tmp 是下一列所需的旧值",
      "text": "先 tmp=f[j+1] 保存旧上方，再写新 f[j+1]，最后 pre=tmp。旧上方在下一列变成左上角。每行开始 pre=f[0]=0；不能用更新后的值，否则 a / aa 会把同一个字符重复使用。"
    }
  ],
  "pitfalls": [
    "子序列不要求连续，但不能打乱顺序；ab 与 ba 的答案为 1，不是 2。",
    "i、j 是从 0 开始的字符下标；D 的下标是前缀长度，所以更新 f[j+1]。",
    "字符不同时取 max，不能把上方和左方相加；这两个状态可能重复使用字符。",
    "当前递推必须从左向右，不能套用背包题的倒序更新。截图只返回长度，不直接返回子序列。"
  ],
  "complexity": "时间 O(nm)，额外空间 O(m)。二维表和事件快照仅供可视化解释，原算法实际只保存一维数组 f 和 pre、tmp。"
}, {
  "id": "leetcode-300",
  "number": "300",
  "title": "最长递增子序列",
  "difficulty": "中等",
  "category": "动态规划",
  "tags": [
    "贪心",
    "二分查找"
  ],
  "addedAt": "2026-11-02",
  "source": "https://leetcode.cn/problems/longest-increasing-subsequence/",
  "summary": "维护各长度的最小结尾，二分替换；对照 bisect_left 与截图 bisect_right 的差异。",
  "statement": "求整数数组 nums 中最长严格递增子序列的长度。子序列可不连续，但必须保留原顺序。[10,9,2,5,3,7,101,18] → 4；[0,1,0,3,2,3] → 4；[7,7,7,7,7,7,7] → 1。1≤n≤2500，−10000≤nums[i]≤10000。",
  "demo": "problems/lis/index.html",
  "principles": [
    {
      "title": "各长度的最小结尾",
      "text": "nums[0:ng] 保存各长度子序列的最小结尾；它不一定是一条真实子序列。结尾越小，未来越容易接上。"
    },
    {
      "title": "首个 ≥x 的位置",
      "text": "bisect_left 找到 j；j==ng 时增加长度，否则只替换结尾。严格递增不能接相等值；截图 bisect_right 求非递减，在全相等例中返回 7 而非 1。"
    },
    {
      "title": "原地覆盖是安全的",
      "text": "读取下标 i 时 ng≤i，写入 j≤ng≤i，不影响未来读取，但会修改输入。Python/Java 两版都保持这一约定。"
    }
  ],
  "pitfalls": [
    "子序列不要求连续，但不可改变相对顺序。",
    "有效前缀不是实际解，ng 才是返回的长度。",
    "截图的 bisect_right 应修正为 bisect_left；重复元素是识别错误的关键反例。"
  ],
  "complexity": "贪心与二分：时间 O(n log n)，原地版本额外空间 O(1)，会修改输入；单独 tails 数组版本需 O(n) 空间。"
}, {
  "id": "leetcode-216",
  "number": "216",
  "title": "组合总和 III",
  "difficulty": "中等",
  "category": "回溯",
  "tags": [
    "递归",
    "DFS",
    "剪枝"
  ],
  "addedAt": "2026-11-02",
  "source": "https://leetcode.cn/problems/combination-sum-iii/",
  "summary": "剩余目标够不够？先算上界，再选择",
  "statement": "从 1 到 9 选择 k 个不同数字，使总和为 n，返回所有不重复组合。2≤k≤9，1≤n≤60。k=3,n=7 → [[1,2,4]]；k=3,n=9 → [[1,2,6],[1,3,5],[2,3,4]]；k=4,n=1 → []。",
  "demo": "problems/combination-sum3/index.html",
  "principles": [
    {
      "title": "上界公式来自等差数列",
      "text": "还缺 d 个，只能从 1…i 里选。最大的 d 个是 i、i−1、…、i−d+1，总和为 (2i−d+1)d/2。t 超过它一定无解。若 i<d，候选数量不够，循环 j≥d 自然为空。"
    },
    {
      "title": "选满为什么不用再判断 t==0？",
      "text": "选满时 d=0，上界变为 0。前面的 t<0 或 t>0 已经排除非零剩余目标，所以能走到保存处必定 t=0。不能随意交换这两个判断的顺序。"
    },
    {
      "title": "递减枚举与撤销",
      "text": "选 j 后调用 dfs(j−1,t−j)，不能再用 j，也不会生成同一组的不同排列。返回后 pop 撤销本层选择；复制保存的答案不受撤销影响。截图输出递减排列，题目允许任意顺序。"
    }
  ],
  "pitfalls": [
    "return 只返回上一层，父层仍会继续分支。",
    "保存答案时必须生成独立副本或字符串。"
  ],
  "complexity": "最坏按候选 1…9 的子集计，时间 O(k·2⁹)，辅助空间 O(k)，结果另计；剪枝会减少实际搜索。"
}, {
  "id": "leetcode-22",
  "number": "22",
  "title": "括号生成",
  "difficulty": "中等",
  "category": "回溯",
  "tags": [
    "递归",
    "DFS",
    "剪枝"
  ],
  "addedAt": "2026-11-02",
  "source": "https://leetcode.cn/problems/generate-parentheses/",
  "summary": "有未匹配的左括号，才能放右括号",
  "statement": "给定 n 对括号，生成所有有效括号字符串。1≤n≤8。n=1 → [\"()\"]；n=3 → [\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]。",
  "demo": "problems/parentheses/index.html",
  "principles": [
    {
      "title": "open 不是未匹配余额",
      "text": "open 是已经使用的左括号总数；i 是已填总数，因此右括号数为 i−open，未匹配余额为 2open−i。放右括号时 open 不变。"
    },
    {
      "title": "两个 if 不是 if / else",
      "text": "当 open<n 且右括号数<左括号数时，两种选择都合法。先探索整个左分支，返回后仍要判断右分支。合法前缀从不出现右括号比左括号多。"
    },
    {
      "title": "固定数组为什么无需 pop？",
      "text": "每层只负责 path[i]，返回后用下一个选择覆盖同一格。后面浅色格子可能残留旧值，但不是当前有效前缀；只有填满 2n 格才 join 保存字符串。Java new String(path) 同样生成独立答案。"
    }
  ],
  "pitfalls": [
    "return 只返回上一层，父层仍会继续分支。",
    "保存答案时必须生成独立副本或字符串。"
  ],
  "complexity": "时间 O(n·Cₙ)，辅助空间 O(n)，输出空间 O(n·Cₙ)，Cₙ 为卡特兰数。"
}, {
  "id": "leetcode-51",
  "number": "51",
  "title": "N 皇后",
  "difficulty": "困难",
  "category": "回溯",
  "tags": [
    "递归",
    "DFS",
    "剪枝"
  ],
  "addedAt": "2026-11-02",
  "source": "https://leetcode.cn/problems/n-queens/",
  "summary": "逐行放置与占用撤销；把 col 里的列号转成由 Q 和点组成的棋盘。",
  "statement": "在 n×n 棋盘放 n 个皇后，使任意两者不同行、不同列、不同斜线，返回全部方案。Q 表示皇后，. 表示空格。n=4 有两解，n=1 返回 [[\"Q\"]]，n=2、3 无解。1≤n≤9。",
  "demo": "problems/queens/index.html",
  "principles": [
    {
      "title": "c 是列下标，不是字符",
      "text": "col[r]=c 记录第 r 行皇后的位置。列表推导式 for c in col 按行取列号，与前面试放用的 c 作用不同：此处不搜索，只把已经找到的方案转成字符串。Python 3 推导式的循环变量在自己的作用域内。"
    },
    {
      "title": "为什么点数是 n−1−c？",
      "text": "左边 c 格空位 + 皇后 1 格 + 右边 n−1−c 格，合计 n 格。n=4、c=1 得到 .Q..。col=[1,3,0,2] 依次生成 .Q..、...Q、Q...、..Q.，外层 append 保存整个棋盘。"
    },
    {
      "title": "对角线与撤销",
      "text": "同一条 / 对角线 r+c 相同，同一条反方向对角线 r−c 相同。截图 Python 允许 diag2[r−c] 的负索引，长度 2n−1 足够区分全部差值；Java 不支持负索引，改用 r−c+n−1。返回后必须取消列与两条对角线标记，col 无需清空。"
    }
  ],
  "pitfalls": [
    "c 是从 0 开始的列号；for c in col 是逐行读取列号，不是再搜索一轮。",
    "每行字符串长度必须为 n，右边点数是 n−1−c。",
    "col 的旧值可以覆盖，但三个占用标记必须在返回后撤销。"
  ],
  "complexity": "搜索保守上界 O(n·n!)，每个解的棋盘转换 O(n²)；辅助空间 O(n)，结果空间 O(S·n²)。"
}];

// BEGIN GENERATED HOT100 — regenerate with python tools/build-hot100.py
window.PROBLEMS.push(...[
  {
    "id": "leetcode-1",
    "number": "1",
    "title": "两数之和",
    "difficulty": "简单",
    "category": "哈希",
    "tags": [
      "Hot 100",
      "数组",
      "哈希"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/two-sum/",
    "summary": "先查补数再存当前下标，避免把同一个元素使用两次。",
    "statement": "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target 的那 两个 整数，并返回它们的数组下标。 你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。 你可以按任意顺序返回答案。",
    "demo": "problems/hot100-1/index.html",
    "principles": [
      {
        "title": "哈希表",
        "text": "若枚举所有数对，时间复杂度为 O(n^2)。在 n ≤ 10^4 的数据范围下可以接受，但题目进阶要求更优的算法。"
      },
      {
        "title": "状态表示什么",
        "text": "d：已扫描数值到下标的映射。查找 target−x 时，表里只有当前元素之前的位置。"
      },
      {
        "title": "为什么可以这样做",
        "text": "对当前元素 x，我们需要判断此前是否出现过 target - x。这是一个查找问题，使用哈希表可以将查找从线性扫描降至期望常数时间。遍历数组的同时，将「值 to 下标」写入哈希表：遇到 x 时先查询 target - x 是否已经出现，若已出现则返回两个下标，否则再将 x 插入。 插入的时机需要注意：必须先查询、再插入。若先插入再查询，当 nums = [3,3] 且 target = 6 时，会把同一个下标使用两次。先查后插，配到的一定是更早出现的下标。"
      }
    ],
    "pitfalls": [
      "先查补数再存当前下标，避免把同一个元素使用两次。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为数组 nums 的长度。"
  },
  {
    "id": "leetcode-49",
    "number": "49",
    "title": "字母异位词分组",
    "difficulty": "中等",
    "category": "哈希",
    "tags": [
      "Hot 100",
      "数组",
      "哈希",
      "字符串",
      "排序"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/group-anagrams/",
    "summary": "排序后的字符串是分组键；分组结果的先后顺序不影响正确性。",
    "statement": "给你一个字符串数组，请你将 字母异位词 组合在一起。可以按任意顺序返回结果列表。",
    "demo": "problems/hot100-49/index.html",
    "principles": [
      {
        "title": "哈希表",
        "text": "若两两判断是否字母异位，即使对每个串先排序再比较，时间仍为 O(n^2k log k)。 n ≤ 10^4、 k ≤ 100，平方比较容易超时。"
      },
      {
        "title": "状态表示什么",
        "text": "d：排序键到分组的映射。当前字符串 s 会加入键 k 对应的一组。"
      },
      {
        "title": "为什么可以这样做",
        "text": "一组异位词排序后得到同一个串，该串可以作为分组的键，不必再成对比较。 因此以排序后的字符串为键、原串列表为值，扫一遍放入哈希表。同一键自然聚到一起。"
      }
    ],
    "pitfalls": [
      "排序后的字符串是分组键；分组结果的先后顺序不影响正确性。"
    ],
    "complexity": "设 n 为字符串个数，k 为最大串长。时间 O(n·k log k)；排序键和分组占 O(nk) 空间，单次排序另需 O(k) 临时空间。"
  },
  {
    "id": "leetcode-128",
    "number": "128",
    "title": "最长连续序列",
    "difficulty": "中等",
    "category": "哈希",
    "tags": [
      "Hot 100",
      "并查集",
      "数组",
      "哈希"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/longest-consecutive-sequence/",
    "summary": "集合中每个值最多被删除一次；d 保存已计算的连续段长度，重复值不能重复计数。",
    "statement": "给定一个未排序的整数数组 nums ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。 请你设计并实现时间复杂度为 O(n) 的算法解决此问题。",
    "demo": "problems/hot100-128/index.html",
    "principles": [
      {
        "title": "哈希表",
        "text": "排序后扫连续段是 O(n log n)，题目要求 O(n)。 n ≤ 10^5。放入哈希集合后，从每个尚未删除的 x 向右延伸，直到断掉，并把这段长度记在起点上，供更早的起点拼接。每个数进出集合一次。"
      },
      {
        "title": "状态表示什么",
        "text": "s：尚未处理的数；d[x]：从 x 开始的连续段长度。被移出集合的数不会再次扫描。"
      },
      {
        "title": "为什么可以这样做",
        "text": "集合中每个值最多被删除一次；d 保存已计算的连续段长度，重复值不能重复计数。"
      }
    ],
    "pitfalls": [
      "集合中每个值最多被删除一次；d 保存已计算的连续段长度，重复值不能重复计数。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是数组 nums 的长度。"
  },
  {
    "id": "leetcode-283",
    "number": "283",
    "title": "移动零",
    "difficulty": "简单",
    "category": "双指针",
    "tags": [
      "Hot 100",
      "数组",
      "双指针"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/move-zeroes/",
    "summary": "写指针指向下一个非零元素应放的位置，交换时保留非零元素的相对顺序。",
    "statement": "给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。 请注意 ，必须在不复制数组的情况下原地对数组进行操作。",
    "demo": "problems/hot100-283/index.html",
    "principles": [
      {
        "title": "双指针",
        "text": "要把 0 移到末尾且保持非零相对次序，可用双指针： k 指向下一个非零应放的位置。"
      },
      {
        "title": "状态表示什么",
        "text": "[0,k) 是已整理的非零前缀，i 是正在读取的位置。"
      },
      {
        "title": "为什么可以这样做",
        "text": "遇到非零就与 nums[k] 交换并右移 k，则前 k 位为原相对顺序的非零。"
      }
    ],
    "pitfalls": [
      "写指针指向下一个非零元素应放的位置，交换时保留非零元素的相对顺序。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是数组 nums 的长度。"
  },
  {
    "id": "leetcode-11",
    "number": "11",
    "title": "盛最多水的容器",
    "difficulty": "中等",
    "category": "双指针",
    "tags": [
      "Hot 100",
      "贪心",
      "数组",
      "双指针"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/container-with-most-water/",
    "summary": "面积受较短边限制；移动较长边无法提高当前短边限定的面积。",
    "statement": "给定一个长度为 n 的整数数组 height 。有 n 条垂线，第 i 条线的两个端点是 (i, 0) 和 (i, height[i]) 。 找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。 返回容器可以储存的最大水量。 说明：你不能倾斜容器。",
    "demo": "problems/hot100-11/index.html",
    "principles": [
      {
        "title": "双指针",
        "text": "若枚举所有下标对 (i, j)，面积为 min(height[i], height[j]) × (j - i)，时间复杂度为 O(n^2)。 n ≤ 10^5，无法通过。"
      },
      {
        "title": "状态表示什么",
        "text": "l、r 限定容器两侧；t 是当前面积，ans 保存目前最大面积。"
      },
      {
        "title": "为什么可以这样做",
        "text": "容器的高度由较短的那根线决定。从最宽的区间 [0, n-1] 出发：若向内移动较高的一端，宽度减小，高度仍受较短边限制，面积不会变大。因此每次应当舍弃较短的那根，尝试碰到更高的边。用左右指针向中间收缩，每次移动较矮的一侧，每个下标至多访问一次。"
      }
    ],
    "pitfalls": [
      "面积受较短边限制；移动较长边无法提高当前短边限定的面积。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是数组 height 的长度。"
  },
  {
    "id": "leetcode-15",
    "number": "15",
    "title": "三数之和",
    "difficulty": "中等",
    "category": "双指针",
    "tags": [
      "Hot 100",
      "数组",
      "双指针",
      "排序"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/3sum/",
    "summary": "排序后固定第一个数，再移动双指针；固定数和左右指针都需要去重。",
    "statement": "给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。请你返回所有和为 0 且不重复的三元组。 注意：答案中不可以包含重复的三元组。",
    "demo": "problems/hot100-15/index.html",
    "principles": [
      {
        "title": "排序 + 双指针",
        "text": "三重循环枚举后再用集合去重，时间复杂度为 O(n^3)。 n ≤ 3000，无法通过。固定一个数后，问题退化为两数之和，哈希表可以将时间降至 O(n^2)，但去重较繁琐，也需要额外空间。"
      },
      {
        "title": "状态表示什么",
        "text": "i 固定第一个数，j、k 在右侧区间靠拢；排序让移动方向可以由三数之和决定。"
      },
      {
        "title": "为什么可以这样做",
        "text": "题目并不要求三元组按原顺序返回。先将数组排序，重复元素会相邻，便于跳过；有序之后，两数之和可以用左右指针在线性时间内完成。若 nums[i] > 0，其后均为正数，三数之和不可能为 0，可以直接结束。因此排序后枚举第一个数，在右侧用双指针夹逼即可。"
      }
    ],
    "pitfalls": [
      "排序后固定第一个数，再移动双指针；固定数和左右指针都需要去重。"
    ],
    "complexity": "排序后双指针扫描，时间 O(n²)。不计答案，Python 排序最坏需 O(n) 辅助空间，Java 基本类型数组排序使用调用栈；结果另占 O(K)，K 为输出三元组数量。"
  },
  {
    "id": "leetcode-42",
    "number": "42",
    "title": "接雨水",
    "difficulty": "困难",
    "category": "双指针",
    "tags": [
      "Hot 100",
      "栈",
      "数组",
      "双指针",
      "动态规划",
      "单调栈"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/trapping-rain-water/",
    "summary": "每格水位由左右最高柱中的较低者决定，不能只看相邻柱子。",
    "statement": "给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。",
    "demo": "problems/hot100-42/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "位置 i 能接的雨水量等于 min(leftMax, rightMax) - height[i]。若对每个 i 都向左右重新扫描最高柱，时间复杂度为 O(n^2)。 n ≤ 2 × 10^4，容易超时。"
      },
      {
        "title": "状态表示什么",
        "text": "left[i] 与 right[i] 分别是该位置两侧的最高柱；较低的一侧决定水位。"
      },
      {
        "title": "为什么可以这样做",
        "text": "左侧最高只取决于 i 及其左边，右侧最高只取决于 i 及其右边，都可以线性预处理。用两个数组分别记录每个位置「含自身」的左侧最高柱与右侧最高柱，再对每个位置取两侧最小值减去自身高度并求和。"
      }
    ],
    "pitfalls": [
      "每格水位由左右最高柱中的较低者决定，不能只看相邻柱子。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为数组的长度。"
  },
  {
    "id": "leetcode-3",
    "number": "3",
    "title": "无重复字符的最长子串",
    "difficulty": "中等",
    "category": "滑动窗口",
    "tags": [
      "Hot 100",
      "哈希",
      "字符串",
      "滑动窗口"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/longest-substring-without-repeating-characters/",
    "summary": "出现重复字符时持续收缩左边界，直到当前字符在窗口中只出现一次。",
    "statement": "给定一个字符串 s ，请你找出其中不含有重复字符的 最长 子串 的长度。",
    "demo": "problems/hot100-3/index.html",
    "principles": [
      {
        "title": "滑动窗口",
        "text": "若枚举所有子串再判断是否含有重复字符，时间复杂度至少为 O(n^2)。 n ≤ 10^5，无法通过。"
      },
      {
        "title": "状态表示什么",
        "text": "窗口是 s[l:r+1]；计数表保证窗口内没有重复字符。"
      },
      {
        "title": "为什么可以这样做",
        "text": "子串之间大量重叠：一旦区间 [l, r] 已经不含重复字符，右端再纳入字符 c 时，只需处理 c 是否在窗口内再次出现，而不必重新扫描整段。若出现重复，合法解不可能再包含左侧多出来的那个 c，应当右移 l。用计数表维护 cnt[c]，大于 1 时收缩左端，直到 c 只出现一次；此时当前窗口就是以 r 结尾的最长无重复子串。"
      }
    ],
    "pitfalls": [
      "出现重复字符时持续收缩左边界，直到当前字符在窗口中只出现一次。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(|Sigma|)。其中 n 为字符串的长度，而 Sigma 表示字符集，这里 Sigma 的大小为 128。"
  },
  {
    "id": "leetcode-438",
    "number": "438",
    "title": "找到字符串中所有字母异位词",
    "difficulty": "中等",
    "category": "滑动窗口",
    "tags": [
      "Hot 100",
      "哈希",
      "字符串",
      "滑动窗口"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/find-all-anagrams-in-a-string/",
    "summary": "窗口长度固定为 p 的长度；计数相同才是异位词，字符的顺序无关。",
    "statement": "给定两个字符串 s 和 p，找到 s 中所有 p 的 异位词 的子串，返回这些子串的起始索引。不考虑答案输出的顺序。",
    "demo": "problems/hot100-438/index.html",
    "principles": [
      {
        "title": "滑动窗口",
        "text": "固定长度 n=|p| 的窗口，维护窗口计数与 p 的计数，相等则记录左端。先放入前 n-1 个字符，右端每进一步比较并弹出左端。"
      },
      {
        "title": "状态表示什么",
        "text": "cnt1 是目标频次，cnt2 是当前固定长度窗口频次。两表相同才记录起点。"
      },
      {
        "title": "为什么可以这样做",
        "text": "窗口长度固定为 p 的长度；计数相同才是异位词，字符的顺序无关。"
      }
    ],
    "pitfalls": [
      "窗口长度固定为 p 的长度；计数相同才是异位词，字符的顺序无关。"
    ],
    "complexity": "时间复杂度 O(m × C)，空间复杂度 O(C)。其中 m 是字符串 s 的长度；而 C 是字符集大小，在本题中字符集为所有小写字母，所以 C = 26。"
  },
  {
    "id": "leetcode-560",
    "number": "560",
    "title": "和为 K 的子数组",
    "difficulty": "中等",
    "category": "滑动窗口",
    "tags": [
      "Hot 100",
      "数组",
      "哈希",
      "前缀和"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/subarray-sum-equals-k/",
    "summary": "先查询前缀和之差，再登记当前前缀和；初始空前缀的次数是 1。",
    "statement": "给你一个整数数组 nums 和一个整数 k ，请你统计并返回 该数组中和为 k 的子数组的个数 。 子数组是数组中元素的连续非空序列。",
    "demo": "problems/hot100-560/index.html",
    "principles": [
      {
        "title": "哈希表 + 前缀和",
        "text": "统计和为 k 的子数组个数。枚举两端是 O(n^2)，在 n ≤ 2 × 10^4 时偏紧。"
      },
      {
        "title": "状态表示什么",
        "text": "s 是当前前缀和；cnt[s−k] 是能与当前位置组成目标子数组的起点数量。"
      },
      {
        "title": "为什么可以这样做",
        "text": "若前缀和为 s，则需要此前有多少个前缀等于 s-k。哈希表统计已出现的前缀和次数，初值 cnt[0]=1 表示空前缀。边走边查再更新，避免用到当前下标自己。"
      }
    ],
    "pitfalls": [
      "先查询前缀和之差，再登记当前前缀和；初始空前缀的次数是 1。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为数组 nums 的长度。"
  },
  {
    "id": "leetcode-76",
    "number": "76",
    "title": "最小覆盖子串",
    "difficulty": "困难",
    "category": "滑动窗口",
    "tags": [
      "Hot 100",
      "哈希",
      "字符串",
      "滑动窗口"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/minimum-window-substring/",
    "summary": "窗口先扩张到满足需求，再收缩到刚好失效；t 中重复字符也必须满足次数。",
    "statement": "给定两个字符串 s 和 t，长度分别是 m 和 n，返回 s 中的 最短窗口 子串，使得该子串包含 t 中的每一个字符（包括重复字符）。如果没有这样的子串，返回空字符串 \"\"。 测试用例保证答案唯一。",
    "demo": "problems/hot100-76/index.html",
    "principles": [
      {
        "title": "计数 + 双指针",
        "text": "若枚举 s 的所有子串再检查是否覆盖 t，窗口有 O(m^2) 个， m ≤ 10^5 无法通过。进阶要求 O(m+n)。"
      },
      {
        "title": "状态表示什么",
        "text": "need 是所需次数，window 是窗口计数；cnt 统计已满足的字符数量，mi 是最佳长度。"
      },
      {
        "title": "为什么可以这样做",
        "text": "覆盖一旦成立，左端多余字符可以移出窗口；尚未覆盖则只能继续右扩。因此维护 t 的字符配额 need、窗口计数 window，并用 cnt 记录已经凑齐的必要出现次数，判断覆盖只需常数时间。右指针扫描 s，窗口合法时尽量收缩左端并记录最短区间。"
      }
    ],
    "pitfalls": [
      "窗口先扩张到满足需求，再收缩到刚好失效；t 中重复字符也必须满足次数。"
    ],
    "complexity": "时间复杂度 O(m + n)，空间复杂度 O(|Sigma|)。其中 m 和 n 分别是字符串 s 和 t 的长度；而 |Sigma| 是字符集的大小，本题中 |Sigma| = 128。"
  },
  {
    "id": "leetcode-53",
    "number": "53",
    "title": "最大子数组和",
    "difficulty": "中等",
    "category": "数组",
    "tags": [
      "Hot 100",
      "数组",
      "分治",
      "动态规划"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/maximum-subarray/",
    "summary": "状态是必须以当前元素结尾的最大和；全负数组不能把空子数组当作答案。",
    "statement": "给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。 子数组 是数组中的一个连续部分。",
    "demo": "problems/hot100-53/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "连续子数组的个数为 O(n^2)。若枚举左右端点再求和，时间复杂度为 O(n^2) 乃至 O(n^3)。 n ≤ 10^5，无法通过。"
      },
      {
        "title": "状态表示什么",
        "text": "f：必须以当前元素结尾的最大和；ans：所有结尾位置中的最大值。"
      },
      {
        "title": "为什么可以这样做",
        "text": "子数组彼此重叠，每次重新求和会重复计算。固定右端点 i 时，以 i 结尾的最优段只有两种选择：若「以 i-1 结尾的最大和」为正，则接在其后；否则从 i 单独开始。 因此以右端点为状态即可线性递推，且每一项只依赖前一项，用一个变量滚动维护，再取全程最大值即可。"
      }
    ],
    "pitfalls": [
      "状态是必须以当前元素结尾的最大和；全负数组不能把空子数组当作答案。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 为数组 nums 的长度。"
  },
  {
    "id": "leetcode-56",
    "number": "56",
    "title": "合并区间",
    "difficulty": "中等",
    "category": "数组",
    "tags": [
      "Hot 100",
      "数组",
      "排序",
      "快速排序"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/merge-intervals/",
    "summary": "按左端点排序；只有新区间左端点大于当前右端点时才结束合并。",
    "statement": "以数组 intervals 表示若干个区间的集合，其中单个区间为 intervals[i] = [starti, endi] 。请你合并所有重叠的区间，并返回 一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间 。",
    "demo": "problems/hot100-56/index.html",
    "principles": [
      {
        "title": "排序 + 一次遍历",
        "text": "重叠关系在无序时难以定位。若反复任取区间与其余区间两两合并，最坏时间 O(n^2)，且合并顺序杂乱。 n ≤ 10^4 偏紧。"
      },
      {
        "title": "状态表示什么",
        "text": "[st,ed] 是正在扩展的合并区间；ans 中只存已经确定的区间。"
      },
      {
        "title": "为什么可以这样做",
        "text": "按左端点排序后，一个区间只会与「当前尚未闭合的那段」重叠：后续区间的起点更大，不可能跳过中间再叠回来。 因此排序后扫一遍，用一对端点维护正在合并的区间，一旦与下一个断开就写入答案。"
      }
    ],
    "pitfalls": [
      "按左端点排序；只有新区间左端点大于当前右端点时才结束合并。"
    ],
    "complexity": "时间 O(n log n)。本实现会排序输入；Python 列表排序及 Java 对象数组比较排序最坏使用 O(n) 辅助空间，合并结果另占 O(n)。"
  },
  {
    "id": "leetcode-189",
    "number": "189",
    "title": "轮转数组",
    "difficulty": "中等",
    "category": "数组",
    "tags": [
      "Hot 100",
      "数组",
      "数学",
      "双指针"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/rotate-array/",
    "summary": "先整体反转，再分别反转两段；k 必须先对数组长度取余。",
    "statement": "给定一个整数数组 nums，将数组中的元素向右轮转 k 个位置，其中 k 是非负数。",
    "demo": "problems/hot100-189/index.html",
    "principles": [
      {
        "title": "三次翻转",
        "text": "右旋 k 步。开新数组再拷回是 O(n) 空间； n≤ 10^5，进阶要原地。右旋 k 位等于「后 k 个移到前面」。整体反转后，前 k 与后 n-k 再各自反转，三段翻转完成轮换，只交换元素。"
      },
      {
        "title": "状态表示什么",
        "text": "每次反转只交换两端，然后向中间移动；观察整体、前 k 项、剩余项三次反转。"
      },
      {
        "title": "为什么可以这样做",
        "text": "先整体反转，再分别反转两段；k 必须先对数组长度取余。"
      }
    ],
    "pitfalls": [
      "先整体反转，再分别反转两段；k 必须先对数组长度取余。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 为数组长度。"
  },
  {
    "id": "leetcode-238",
    "number": "238",
    "title": "除了自身以外数组的乘积",
    "difficulty": "中等",
    "category": "数组",
    "tags": [
      "Hot 100",
      "数组",
      "前缀和"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/product-of-array-except-self/",
    "summary": "答案由左侧乘积和右侧乘积组成；不使用除法，因此零元素也适用。",
    "statement": "给你一个整数数组 nums，返回 数组 answer ，其中 answer[i] 等于 nums 中除了 nums[i] 之外其余各元素的乘积 。 题目数据 保证 数组 nums之中任意元素的全部前缀元素和后缀的乘积都在 32 位 整数范围内。 请 不要使用除法，且在 O(n) 时间复杂度内完成此题。",
    "demo": "problems/hot100-238/index.html",
    "principles": [
      {
        "title": "两次遍历",
        "text": "除自身外的乘积等于左侧积乘右侧积。若先开两个数组存前缀、后缀积，空间不是常数。"
      },
      {
        "title": "状态表示什么",
        "text": "先把左侧乘积写入 ans，再乘右侧乘积；当前元素自身不参与。"
      },
      {
        "title": "为什么可以这样做",
        "text": "先从左往右把前缀积写入答案，再从右往左用一个变量累乘后缀并乘入答案，从而只用输出数组。"
      }
    ],
    "pitfalls": [
      "答案由左侧乘积和右侧乘积组成；不使用除法，因此零元素也适用。"
    ],
    "complexity": "时间 O(n)。返回数组占 O(n)；除返回数组外，只使用左右乘积等 O(1) 辅助空间。"
  },
  {
    "id": "leetcode-41",
    "number": "41",
    "title": "缺失的第一个正数",
    "difficulty": "困难",
    "category": "数组",
    "tags": [
      "Hot 100",
      "数组",
      "哈希"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/first-missing-positive/",
    "summary": "值 x 应放在下标 x−1；交换前必须排除相等值，避免重复元素造成死循环。",
    "statement": "给你一个未排序的整数数组 nums ，请你找出其中没有出现的最小的正整数。 请你实现时间复杂度为 O(n) 并且只使用常数级别额外空间的解决方案。",
    "demo": "problems/hot100-41/index.html",
    "principles": [
      {
        "title": "原地交换",
        "text": "题目要求 O(n) 时间且只用常数额外空间。若用哈希集合记下出现过的数，再从 1 起逐个查询缺失值，时间满足，但额外空间为 O(n)， n ≤ 10^5，无法满足空间约束。"
      },
      {
        "title": "状态表示什么",
        "text": "合法值 x 的目标位置是 x−1。归位完成后，第一个不匹配位置给出答案。"
      },
      {
        "title": "为什么可以这样做",
        "text": "真正需要记录的是 [1, n] 中哪些值出现过：缺失的最小正整数一定落在 [1, n+1]，超出该范围的数可以忽略。数组下标本身即可充当这张出现表。 因此，当 x in [1, n] 时，将 x 交换到下标 x-1。原地交换把原数组当作哈希，再线性扫描即可找到第一个空洞。"
      }
    ],
    "pitfalls": [
      "值 x 应放在下标 x−1；交换前必须排除相等值，避免重复元素造成死循环。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是数组的长度。"
  },
  {
    "id": "leetcode-73",
    "number": "73",
    "title": "矩阵置零",
    "difficulty": "中等",
    "category": "矩阵",
    "tags": [
      "Hot 100",
      "数组",
      "哈希",
      "矩阵"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/set-matrix-zeroes/",
    "summary": "先保存哪些行列需要清零，再统一修改；边扫描边清零会污染判断。",
    "statement": "给定一个 m x n 的矩阵，如果一个元素为 0 ，则将其所在行和列的所有元素都设为 0 。请使用 原地 算法。",
    "demo": "problems/hot100-73/index.html",
    "principles": [
      {
        "title": "数组标记",
        "text": "若遇到 0 立刻把该行该列清零，尚未扫描到的原有 0 会被覆盖，后续无法区分哪些零是原始的。另开一份 O(mn) 矩阵再写回可以避免混淆，但进阶已经否定这笔空间。 m, n ≤ 200，两遍扫描在时间上可行。"
      },
      {
        "title": "状态表示什么",
        "text": "row、col 保存原矩阵中零的位置；第二轮才据此修改矩阵。"
      },
      {
        "title": "为什么可以这样做",
        "text": "因此先记录「哪些行、哪些列应当置零」，再统一修改。长度为 m 的行标记与长度为 n 的列标记已经足够：第一遍遇零只打标，第二遍按标记置零。额外空间从 O(mn) 降到 O(m+n)，尚未达到进阶要求的常数空间。"
      }
    ],
    "pitfalls": [
      "先保存哪些行列需要清零，再统一修改；边扫描边清零会污染判断。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(m + n)。其中 m 和 n 分别为矩阵的行数和列数。"
  },
  {
    "id": "leetcode-54",
    "number": "54",
    "title": "螺旋矩阵",
    "difficulty": "中等",
    "category": "矩阵",
    "tags": [
      "Hot 100",
      "数组",
      "矩阵",
      "模拟"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/spiral-matrix/",
    "summary": "遇到边界或访问过的位置才转向；细长矩阵要防止重复访问。",
    "statement": "给你一个 m 行 n 列的矩阵 matrix ，请按照 顺时针螺旋顺序 ，返回矩阵中的所有元素。",
    "demo": "problems/hot100-54/index.html",
    "principles": [
      {
        "title": "模拟",
        "text": "矩阵规模至多 10 × 10，按层剥皮、每层四向走一圈再收缩边界可以通过，但剩下一行或一列时边界很容易写错。"
      },
      {
        "title": "状态表示什么",
        "text": "vis 防止重复，方向编号 k 控制右、下、左、上；ans 保存已经访问的顺序。"
      },
      {
        "title": "为什么可以这样做",
        "text": "螺旋的本质是沿当前方向前进，下一步越界或已访问则右转。四种方向可用数组循环切换，访问过的格子用 vis 标记。"
      }
    ],
    "pitfalls": [
      "遇到边界或访问过的位置才转向；细长矩阵要防止重复访问。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 和 n 分别是矩阵的行数和列数。"
  },
  {
    "id": "leetcode-48",
    "number": "48",
    "title": "旋转图像",
    "difficulty": "中等",
    "category": "矩阵",
    "tags": [
      "Hot 100",
      "数组",
      "数学",
      "矩阵"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/rotate-image/",
    "summary": "先上下翻转，再沿主对角线转置；每一对对称元素只交换一次。",
    "statement": "给定一个 n × n 的二维矩阵 matrix 表示一个图像。请你将图像顺时针旋转 90 度。 你必须在 原地 旋转图像，这意味着你需要直接修改输入的二维矩阵。请不要 使用另一个矩阵来旋转图像。",
    "demo": "problems/hot100-48/index.html",
    "principles": [
      {
        "title": "原地翻转",
        "text": "顺时针旋转 90^circ 的映射是 matrix[i][j] to matrix[j][n-1-i]。若新开矩阵按此赋值，时间和空间都是 O(n^2)。 n ≤ 20 时额外空间足够，但题目要求原地修改。"
      },
      {
        "title": "状态表示什么",
        "text": "第一阶段上下翻转，第二阶段交换主对角线两侧的元素。"
      },
      {
        "title": "为什么可以这样做",
        "text": "该映射可拆成两个可原地完成的操作：先上下翻转，再沿主对角线翻转（转置）。 (i, j) 先到 (n-1-i, j)，再转到 (j, n-1-i)，恰好是目标位置。两次交换即可，额外空间 O(1)。"
      }
    ],
    "pitfalls": [
      "先上下翻转，再沿主对角线转置；每一对对称元素只交换一次。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(n^2)，空间复杂度 O(1)。其中 n 是矩阵的边长。"
  },
  {
    "id": "leetcode-240",
    "number": "240",
    "title": "搜索二维矩阵 II",
    "difficulty": "中等",
    "category": "矩阵",
    "tags": [
      "Hot 100",
      "数组",
      "二分查找",
      "分治",
      "矩阵"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/search-a-2d-matrix-ii/",
    "summary": "每一行都是有序数组，可以逐行二分；Python 检查左边界是否等于目标，Java 检查查找是否成功。",
    "statement": "编写一个高效的算法来搜索 m x n 矩阵 matrix 中的一个目标值 target 。该矩阵具有以下特性： 每行的元素从左到右升序排列。 每列的元素从上到下升序排列。",
    "demo": "problems/hot100-240/index.html",
    "principles": [
      {
        "title": "二分查找",
        "text": "每行、每列均递增，可对每一行二分查找 target。行数为 m、列为 n 时时间为 O(m log n)，无需额外空间。"
      },
      {
        "title": "状态表示什么",
        "text": "一次处理一行有序数组。找到的位置还要检查确实等于 target。"
      },
      {
        "title": "为什么可以这样做",
        "text": "每一行都是有序数组，可以逐行二分；Python 检查左边界是否等于目标，Java 检查查找是否成功。"
      }
    ],
    "pitfalls": [
      "每一行都是有序数组，可以逐行二分；Python 检查左边界是否等于目标，Java 检查查找是否成功。"
    ],
    "complexity": "时间复杂度 O(m log n)，空间复杂度 O(1)。其中 m 和 n 分别为矩阵的行数和列数。"
  },
  {
    "id": "leetcode-160",
    "number": "160",
    "title": "相交链表",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "Hot 100",
      "哈希",
      "链表",
      "双指针"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/intersection-of-two-linked-lists/",
    "summary": "两个指针分别走 A+B 与 B+A，路径总长相同；比较节点身份而非节点值。",
    "statement": "给你两个单链表的头节点 headA 和 headB ，请你找出并返回两个单链表相交的起始节点。如果两个链表不存在相交节点，返回 null 。 图示两个链表在节点 c1 开始相交： 题目数据 保证 整个链式结构中不存在环。 注意，函数返回结果后，链表必须 保持其原始结构 。 自定义评测： 评测系统 的输入如下（你设计的程序 不适用 此输入）： intersectVal - 相交的起始节点的值。如果不存在相交节点，这一值为 0 listA - 第一个链表 listB - 第二个链表 skipA - 在 listA 中（从头节点开始）跳到交叉节点的节点数 skipB - 在 listB 中（从头节点开始）跳到交叉节点的节点数 评测系统将根据这些输入创建链式数据结构，并将两个头节点 headA 和 headB 传递给你的程序。如果程序能够正确返回相交节点，那么你的解决方案将被 视作正确答案 。",
    "demo": "problems/hot100-160/index.html",
    "principles": [
      {
        "title": "双指针",
        "text": "找两链表第一个公共节点。哈希记下一条链再扫另一条是 O(m+n) 时间、 O(m) 空间；进阶要 O(1) 内存。 m,n≤ 3× 10^4。"
      },
      {
        "title": "状态表示什么",
        "text": "a、b 到达链尾后换到另一条链；相等的节点引用才是交点。"
      },
      {
        "title": "为什么可以这样做",
        "text": "两条指针走完各自的链后改走另一条，路程都是 a+b，若有交点则在交点相遇，否则同时走到空。不必先算长度。"
      }
    ],
    "pitfalls": [
      "两个指针分别走 A+B 与 B+A，路径总长相同；比较节点身份而非节点值。"
    ],
    "complexity": "时间复杂度 O(m + n)，空间复杂度 O(1)。其中 m 和 n 分别是链表 headA 和 headB 的长度。"
  },
  {
    "id": "leetcode-206",
    "number": "206",
    "title": "反转链表",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "Hot 100",
      "递归",
      "链表"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/reverse-linked-list/",
    "summary": "先保存后继再反转 next，否则会丢失尚未处理的链表。",
    "statement": "给你单链表的头节点 head ，请你反转链表，并返回反转后的链表。",
    "demo": "problems/hot100-206/index.html",
    "principles": [
      {
        "title": "头插法",
        "text": "把结点依次放入数组再反向重建可行，但只需改指针。头插可在一次遍历中完成反转：当前结点不断插到哑结点之后。"
      },
      {
        "title": "状态表示什么",
        "text": "curr 是待处理节点，next 暂存后继；dummy.next 是已反转部分的头。"
      },
      {
        "title": "为什么可以这样做",
        "text": "先保存后继再反转 next，否则会丢失尚未处理的链表。"
      }
    ],
    "pitfalls": [
      "先保存后继再反转 next，否则会丢失尚未处理的链表。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 为链表的长度。"
  },
  {
    "id": "leetcode-234",
    "number": "234",
    "title": "回文链表",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "Hot 100",
      "栈",
      "递归",
      "链表",
      "双指针"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/palindrome-linked-list/",
    "summary": "找到中点后反转后半段并逐个比较；本解法会改变后半段连接。",
    "statement": "给你一个单链表的头节点 head ，请你判断该链表是否为回文链表。如果是，返回 true ；否则，返回 false 。",
    "demo": "problems/hot100-234/index.html",
    "principles": [
      {
        "title": "快慢指针",
        "text": "放入数组再比较首尾可行，但要求常数空间。回文关于中点对称，可先找中点、反转后半，再与前半逐一比较。"
      },
      {
        "title": "状态表示什么",
        "text": "快慢指针定位后半段，再反转并与前半段逐项比较。"
      },
      {
        "title": "为什么可以这样做",
        "text": "找到中点后反转后半段并逐个比较；本解法会改变后半段连接。"
      }
    ],
    "pitfalls": [
      "找到中点后反转后半段并逐个比较；本解法会改变后半段连接。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 为链表的长度。"
  },
  {
    "id": "leetcode-141",
    "number": "141",
    "title": "环形链表",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "Hot 100",
      "哈希",
      "链表",
      "双指针",
      "Floyd 判圈算法"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/linked-list-cycle/",
    "summary": "访问过的节点放入集合；再次访问同一节点才说明有环。值相同不代表同一节点。",
    "statement": "给你一个链表的头节点 head ，判断链表中是否有环。 如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。注意：pos 不作为参数进行传递 。仅仅是为了标识链表的实际情况。 如果链表中存在环 ，则返回 true 。 否则，返回 false 。",
    "demo": "problems/hot100-141/index.html",
    "principles": [
      {
        "title": "哈希表",
        "text": "判断链表是否有环。 n≤ 10^4。走过的节点放进哈希表，再次出现即有环；走到空则无环。实现直接，空间 O(n)。进阶要求常数空间。"
      },
      {
        "title": "状态表示什么",
        "text": "s 记录访问过的节点身份。再次到达其中一个节点即检测到环。"
      },
      {
        "title": "为什么可以这样做",
        "text": "访问过的节点放入集合；再次访问同一节点才说明有环。值相同不代表同一节点。"
      }
    ],
    "pitfalls": [
      "访问过的节点放入集合；再次访问同一节点才说明有环。值相同不代表同一节点。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是链表中的节点数。"
  },
  {
    "id": "leetcode-142",
    "number": "142",
    "title": "环形链表 II",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "Hot 100",
      "哈希",
      "链表",
      "双指针",
      "Floyd 判圈算法"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/linked-list-cycle-ii/",
    "summary": "快慢指针相遇后，一个指针从头出发，两者每次一步，相遇点才是环入口。",
    "statement": "给定一个链表的头节点 head ，返回链表开始入环的第一个节点。 如果链表无环，则返回 null。 如果链表中有某个节点，可以通过连续跟踪 next 指针再次到达，则链表中存在环。 为了表示给定链表中的环，评测系统内部使用整数 pos 来表示链表尾连接到链表中的位置（索引从 0 开始）。如果 pos 是 -1，则在该链表中没有环。注意：pos 不作为参数进行传递，仅仅是为了标识链表的实际情况。 不允许修改 链表。",
    "demo": "problems/hot100-142/index.html",
    "principles": [
      {
        "title": "快慢指针",
        "text": "不但要判断有环，还要返回入环节点。哈希表记下首次出现的节点即可，但进阶要 O(1) 空间。 n≤ 10^4。"
      },
      {
        "title": "状态表示什么",
        "text": "先找快慢指针的相遇点，再用 ans 从头与 slow 同速前进寻找入口。"
      },
      {
        "title": "为什么可以这样做",
        "text": "快慢指针相遇后，一个指针回到头、另一个留在相遇点，两者同速前进，相遇处即入口：头到入口的距离等于相遇点再走回入口的距离。"
      }
    ],
    "pitfalls": [
      "快慢指针相遇后，一个指针从头出发，两者每次一步，相遇点才是环入口。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是链表中节点的数目。"
  },
  {
    "id": "leetcode-21",
    "number": "21",
    "title": "合并两个有序链表",
    "difficulty": "简单",
    "category": "链表",
    "tags": [
      "Hot 100",
      "递归",
      "链表"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/merge-two-sorted-lists/",
    "summary": "每次连接当前较小节点；一条链为空时，剩余链可以直接连接。",
    "statement": "将两个升序链表合并为一个新的 升序 链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。",
    "demo": "problems/hot100-21/index.html",
    "principles": [
      {
        "title": "递归",
        "text": "两条链表均已按非递减排列。若取出全部节点值再排序并重建，时间复杂度为 O((m+n) log(m+n))，且没有利用有序这一条件。"
      },
      {
        "title": "状态表示什么",
        "text": "每次递归返回一条有序链；较小的头节点连接递归合并后的剩余部分。"
      },
      {
        "title": "为什么可以这样做",
        "text": "合并时，答案的下一个节点必为当前两个头结点中的较小者。选定之后，剩余部分仍是两条有序链表，与原问题同构；若其中一侧已空，则另一侧整段即为剩余结果。 因此问题具有最优子结构，可以用递归求解：每次留下较小的头，再合并两条剩余链表。递归深度与节点总数同阶，本题长度不超过 50，额外空间 O(m+n) 可以接受。"
      }
    ],
    "pitfalls": [
      "每次连接当前较小节点；一条链为空时，剩余链可以直接连接。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(m + n)，空间复杂度 O(m + n)。其中 m 和 n 分别为两个链表的长度。"
  },
  {
    "id": "leetcode-2",
    "number": "2",
    "title": "两数相加",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "Hot 100",
      "递归",
      "链表",
      "数学"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/add-two-numbers/",
    "summary": "链表从低位开始，当前位是总和对 10 取余；最后的进位不能丢。",
    "statement": "给你两个 非空 的链表，表示两个非负的整数。它们每位数字都是按照 逆序 的方式存储的，并且每个节点只能存储 一位 数字。 请你将两个数相加，并以相同形式返回一个表示和的链表。 你可以假设除了数字 0 之外，这两个数都不会以 0 开头。",
    "demo": "problems/hot100-2/index.html",
    "principles": [
      {
        "title": "模拟",
        "text": "题目已经将个位放在链表头部，按位逆序存放，本质上就是竖式加法。若先把链表转成整数再相加，反而绕开了这一结构，也需要处理大整数。"
      },
      {
        "title": "状态表示什么",
        "text": "carry 保存进位，当前节点保存个位；输入从低位到高位推进。"
      },
      {
        "title": "为什么可以这样做",
        "text": "两条链的长度可能不同，最高位还可能产生额外进位。每一位都是「当前两位数字（缺省为 0）与进位 carry 之和」，再拆出个位和新的进位。从哑节点依次接上答案节点，两个指针同步前进；循环条件应为 l_1、 l_2 或 carry 仍未结束，否则像 [9] + [1] 这样的情况会丢失最后的进位。"
      }
    ],
    "pitfalls": [
      "链表从低位开始，当前位是总和对 10 取余；最后的进位不能丢。"
    ],
    "complexity": "时间 O(max(m,n))。新建的结果链表占 O(max(m,n))；除结果外，进位和指针使用 O(1) 辅助空间。"
  },
  {
    "id": "leetcode-19",
    "number": "19",
    "title": "删除链表的倒数第 N 个结点",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "Hot 100",
      "链表",
      "双指针"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/remove-nth-node-from-end-of-list/",
    "summary": "虚拟头节点使删除头节点与删除中间节点使用相同逻辑；注意快慢指针距离。",
    "statement": "给你一个链表，删除链表的倒数第 n 个结点，并且返回链表的头结点。",
    "demo": "problems/hot100-19/index.html",
    "principles": [
      {
        "title": "快慢指针",
        "text": "先遍历一遍得到长度 L，再走 L - n 步删除结点，时间复杂度为 O(n)。在 sz ≤ 30 的范围内可以接受，但题目进阶要求一趟扫描。"
      },
      {
        "title": "状态表示什么",
        "text": "fast 先走 n 步；当 fast 到尾部时，slow 位于待删除节点的前驱。"
      },
      {
        "title": "为什么可以这样做",
        "text": "不到末尾就无法确定倒数第 n 个结点的位置，而删除还需要它的前驱。我们可以让快指针先走出 n 步的间距，再与慢指针一起前进：快指针到达表尾时，慢指针恰好停在待删结点的前驱。设置虚拟头结点，可使删除头结点与删除中间结点共用同一套逻辑。"
      }
    ],
    "pitfalls": [
      "虚拟头节点使删除头节点与删除中间节点使用相同逻辑；注意快慢指针距离。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 为链表的长度。"
  },
  {
    "id": "leetcode-24",
    "number": "24",
    "title": "两两交换链表中的节点",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "Hot 100",
      "递归",
      "链表"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/swap-nodes-in-pairs/",
    "summary": "交换前保存后续节点，更新前驱；交换的是连接而不是节点数值。",
    "statement": "给你一个链表，两两交换其中相邻的节点，并返回交换后链表的头节点。你必须在不修改节点内部的值的情况下完成本题（即，只能进行节点交换）。",
    "demo": "problems/hot100-24/index.html",
    "principles": [
      {
        "title": "递归",
        "text": "题目要求不能修改节点内部的值，必须实际交换指针。节点数不超过 100，任何正确的指针接法在时间上都可以接受。"
      },
      {
        "title": "状态表示什么",
        "text": "递归先交换后面的两两分组，再把当前两个节点交换并接回。"
      },
      {
        "title": "为什么可以这样做",
        "text": "一对节点交换完成后，从原来的第三个节点起与原问题同构，且新头一定是原来的第二个节点。若先处理后面再回头改当前这对，便不必在一次操作里同时维护整条链的全部断点。 因此可以递归：先处理 head.next.next，再把当前这对反过来接到那段结果上。空表或仅有一个节点无法成对，作为递归出口直接返回。"
      }
    ],
    "pitfalls": [
      "交换前保存后续节点，更新前驱；交换的是连接而不是节点数值。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是链表的长度。"
  },
  {
    "id": "leetcode-25",
    "number": "25",
    "title": "K 个一组翻转链表",
    "difficulty": "困难",
    "category": "链表",
    "tags": [
      "Hot 100",
      "递归",
      "链表"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/reverse-nodes-in-k-group/",
    "summary": "先确认剩余节点够 k 个；不足一组的末尾必须保留原顺序。",
    "statement": "给你链表的头节点 head ，每 k 个节点一组进行翻转，请你返回修改后的链表。 k 是一个正整数，它的值小于或等于链表的长度。如果节点总数不是 k 的整数倍，那么请将最后剩余的节点保持原有顺序。 你不能只是单纯的改变节点内部的值，而是需要实际进行节点交换。",
    "demo": "problems/hot100-25/index.html",
    "principles": [
      {
        "title": "模拟",
        "text": "题目进阶要求额外空间 O(1)。若按组递归翻转， n ≤ 5000 时时间可以接受，但递归栈会随组数增长，不满足进阶条件。"
      },
      {
        "title": "状态表示什么",
        "text": "pre 是当前组前驱；确认够 k 个后断开、反转，再接回后续链。"
      },
      {
        "title": "为什么可以这样做",
        "text": "一组内部就是普通的链表翻转；组与组之间只需记住上一组的尾。真正需要先确认的是当前组是否凑满 k 个——不足则保持原序，够则摘下翻转后再接回。 因此从虚拟头出发，每次先走 k 步探测：若够 k 个则翻转该段并重接；若不够则结束。探测、翻转与重接都是指针操作，额外空间 O(1)。"
      }
    ],
    "pitfalls": [
      "先确认剩余节点够 k 个；不足一组的末尾必须保留原顺序。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 为链表的长度。"
  },
  {
    "id": "leetcode-138",
    "number": "138",
    "title": "随机链表的复制",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "Hot 100",
      "哈希",
      "链表"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/copy-list-with-random-pointer/",
    "summary": "先建立旧节点到新节点的映射，再设置 random；复制不能指回原链表。",
    "statement": "给你一个长度为 n 的链表，每个节点包含一个额外增加的随机指针 random ，该指针可以指向链表中的任何节点或空节点。 构造这个链表的 深拷贝。 深拷贝应该正好由 n 个 全新 节点组成，其中每个新节点的值都设为其对应的原节点的值。新节点的 next 指针和 random 指针也都应指向复制链表中的新节点，并使原链表和复制链表中的这些指针能够表示相同的链表状态。复制链表中的指针都不应指向原链表中的节点 。 例如，如果原链表中有 X 和 Y 两个节点，其中 X.random --> Y 。那么在复制链表中对应的两个节点 x 和 y ，同样有 x.random --> y 。 返回复制链表的头节点。 用一个由 n 个节点组成的链表来表示输入/输出中的链表。每个节点用一个 [val, random_index] 表示： val：一个表示 Node.val 的整数。 random_index：随机指针指向的节点索引（范围从 0 到 n-1）；如果不指向任何节点，则为 null 。 你的代码 只 接受原链表的头节点 head 作为传入参数。",
    "demo": "problems/hot100-138/index.html",
    "principles": [
      {
        "title": "哈希表 + 模拟",
        "text": "复制带随机指针的链表。随机指针可能指向任意节点或空，先复制 next 再复制 random 时，目标节点可能尚未建出。 n≤ 1000。"
      },
      {
        "title": "状态表示什么",
        "text": "第一轮复制 next 链并登记映射；第二轮通过映射复制 random，禁止指向原节点。"
      },
      {
        "title": "为什么可以这样做",
        "text": "第一遍沿 next 建新链，并用哈希表记下原节点到副本的映射；第二遍按映射接好 random。"
      }
    ],
    "pitfalls": [
      "先建立旧节点到新节点的映射，再设置 random；复制不能指回原链表。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为链表的长度。"
  },
  {
    "id": "leetcode-148",
    "number": "148",
    "title": "排序链表",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "Hot 100",
      "链表",
      "双指针",
      "分治",
      "排序",
      "归并排序"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/sort-list/",
    "summary": "中点断链后递归排序两段，再合并；必须断开前半段防止无限递归。",
    "statement": "给你链表的头结点 head ，请将其按 升序 排列并返回 排序后的链表 。",
    "demo": "problems/hot100-148/index.html",
    "principles": [
      {
        "title": "归并排序",
        "text": "链表排序，进阶要求 O(n log n) 时间、常数空间。随机访问缺失，快排交换不方便； n≤ 5× 10^4。归并只需要顺序访问：快慢指针断开中点，递归排序两半再线性合并。递归栈是 O(log n)，满足时间要求。"
      },
      {
        "title": "状态表示什么",
        "text": "拆成两条更短的链分别排序，再按较小头节点合并。调用栈显示正在处理哪一段。"
      },
      {
        "title": "为什么可以这样做",
        "text": "中点断链后递归排序两段，再合并；必须断开前半段防止无限递归。"
      }
    ],
    "pitfalls": [
      "中点断链后递归排序两段，再合并；必须断开前半段防止无限递归。"
    ],
    "complexity": "时间复杂度 O(n log n)，空间复杂度 O(log n)。其中 n 是链表的长度。"
  },
  {
    "id": "leetcode-23",
    "number": "23",
    "title": "合并 K 个升序链表",
    "difficulty": "困难",
    "category": "链表",
    "tags": [
      "Hot 100",
      "链表",
      "分治",
      "堆（优先队列）",
      "归并排序",
      "锦标赛排序"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/merge-k-sorted-lists/",
    "summary": "小根堆只维护每条链当前的候选头；弹出后补入它的后继。",
    "statement": "给你一个链表数组，每个链表都已经按升序排列。 请你将所有链表合并到一个升序链表中，返回合并后的链表。",
    "demo": "problems/hot100-23/index.html",
    "principles": [
      {
        "title": "优先队列（小根堆）",
        "text": "若将 k 条链表依次两两合并，总节点 n ≤ 10^4 时最坏时间 O(nk)。在 k ≤ 10^4 的范围下无法通过。全部取出排序再建表虽为 O(n log n)，却没有利用每条链表已经有序这一条件。"
      },
      {
        "title": "状态表示什么",
        "text": "堆顶是所有候选头中最小的节点；取出一个节点后补入它的后继。"
      },
      {
        "title": "为什么可以这样做",
        "text": "任意时刻，下一步该接到答案上的节点只可能是各链表当前的头。若每次线性扫描这 k 个候选，乘上 n 个节点便回到 O(nk)。 因此用小根堆维护至多 k 个候选头：每次取出最小者接到结果尾部，再把它的后继（若存在）入堆。每个节点进出堆各一次，时间 O(n log k)。"
      }
    ],
    "pitfalls": [
      "小根堆只维护每条链当前的候选头；弹出后补入它的后继。"
    ],
    "complexity": "时间复杂度 O(n log k)，空间复杂度 O(k)。其中 n 是所有链表节点数目的总和，而 k 是题目给定的链表数目。"
  },
  {
    "id": "leetcode-146",
    "number": "146",
    "title": "LRU 缓存",
    "difficulty": "中等",
    "category": "链表",
    "tags": [
      "Hot 100",
      "设计",
      "哈希",
      "链表",
      "双向链表"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/lru-cache/",
    "summary": "哈希表负责定位，双向链表维护新旧顺序；get 命中也要移动到表头。",
    "statement": "请你设计并实现一个满足 LRU (最近最少使用) 缓存 约束的数据结构。 实现 LRUCache 类： LRUCache(int capacity) 以 正整数 作为容量 capacity 初始化 LRU 缓存 int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。 void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value ；如果不存在，则向缓存中插入该组 key-value 。如果插入操作导致关键字数量超过 capacity ，则应该 逐出 最久未使用的关键字。 函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。",
    "demo": "problems/hot100-146/index.html",
    "principles": [
      {
        "title": "哈希表 + 双向链表",
        "text": "get / put 都要 O(1)，淘汰最久未使用的键。哈希表能 O(1) 查找，但不能单独维护使用顺序；数组或单向链表移动节点是 O(n)。调用次数达 2× 10^5。"
      },
      {
        "title": "状态表示什么",
        "text": "哈希表定位节点，双向链表维护最近使用顺序。靠近 head 的更新；尾部节点优先淘汰。"
      },
      {
        "title": "为什么可以这样做",
        "text": "哈希表存键到节点，双向链表按「最近使用在头、最久在尾」排列。访问或更新时把节点摘下再插到头部；容量满时删掉尾部前驱。查找与调整指针都是 O(1)。"
      }
    ],
    "pitfalls": [
      "哈希表负责定位，双向链表维护新旧顺序；get 命中也要移动到表头。"
    ],
    "complexity": "时间复杂度 O(1)，空间复杂度 O(capacity)。"
  },
  {
    "id": "leetcode-94",
    "number": "94",
    "title": "二叉树的中序遍历",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "栈",
      "树",
      "DFS",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/binary-tree-inorder-traversal/",
    "summary": "左子树、根、右子树；递归返回后继续执行当前调用尚未完成的操作。",
    "statement": "给定一个二叉树的根节点 root ，返回 它的 中序 遍历 。",
    "demo": "problems/hot100-94/index.html",
    "principles": [
      {
        "title": "递归遍历",
        "text": "中序遍历的顺序是「左、根、右」。树本身按递归定义，因此可以直接递归：先走完左子树，再记录根，再走右子树。 n ≤ 100，最坏 O(n) 的递归栈可以接受。进阶才要求改成迭代。"
      },
      {
        "title": "状态表示什么",
        "text": "调用栈记录递归进度；只有左子树完成后才把当前根值加入答案。"
      },
      {
        "title": "为什么可以这样做",
        "text": "左子树、根、右子树；递归返回后继续执行当前调用尚未完成的操作。"
      }
    ],
    "pitfalls": [
      "左子树、根、右子树；递归返回后继续执行当前调用尚未完成的操作。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是二叉树的节点数，空间复杂度主要取决于递归调用的栈空间。"
  },
  {
    "id": "leetcode-104",
    "number": "104",
    "title": "二叉树的最大深度",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "BFS",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/maximum-depth-of-binary-tree/",
    "summary": "当前高度等于左右高度最大值加 1；空节点高度是 0。",
    "statement": "给定一个二叉树 root ，返回其最大深度。 二叉树的 最大深度 是指从根节点到最远叶子节点的最长路径上的节点数。",
    "demo": "problems/hot100-104/index.html",
    "principles": [
      {
        "title": "递归",
        "text": "树的深度是根到最远叶子的边数加一。层序统计层数可行， n ≤ 10^4 时间足够。树本身按递归定义，当前树的深度等于左右子树深度的较大值再加一，空树深度为 0。为此对左右子树递归求深度后取最大即可。"
      },
      {
        "title": "状态表示什么",
        "text": "l、r 是左右子树的高度。向上返回 max(l,r)+1，而不是节点数量之和。"
      },
      {
        "title": "为什么可以这样做",
        "text": "当前高度等于左右高度最大值加 1；空节点高度是 0。"
      }
    ],
    "pitfalls": [
      "当前高度等于左右高度最大值加 1；空节点高度是 0。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间 O(n)，辅助空间 O(h)，h 为树高；退化为单链时 h=n。"
  },
  {
    "id": "leetcode-226",
    "number": "226",
    "title": "翻转二叉树",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "BFS",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/invert-binary-tree/",
    "summary": "交换左右子树并递归处理；空节点直接返回。",
    "statement": "给你一棵二叉树的根节点 root ，翻转这棵二叉树，并返回其根节点。",
    "demo": "problems/hot100-226/index.html",
    "principles": [
      {
        "title": "递归",
        "text": "翻转整棵树即交换每个结点的左右孩子，并对其子树做同样操作。树规模允许一次递归遍历。"
      },
      {
        "title": "状态表示什么",
        "text": "先得到已经翻转的左右子树，再交换它们在当前根上的连接。"
      },
      {
        "title": "为什么可以这样做",
        "text": "交换左右子树并递归处理；空节点直接返回。"
      }
    ],
    "pitfalls": [
      "交换左右子树并递归处理；空节点直接返回。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是二叉树的节点个数。"
  },
  {
    "id": "leetcode-101",
    "number": "101",
    "title": "对称二叉树",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "BFS",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/symmetric-tree/",
    "summary": "镜像比较左的左与右的右、左的右与右的左；只比较同层数值不够。",
    "statement": "给你一个二叉树的根节点 root ， 检查它是否轴对称。",
    "demo": "problems/hot100-101/index.html",
    "principles": [
      {
        "title": "递归",
        "text": "镜像对称要求左子树与右子树互为镜像，而不是各自与自身相同。进阶同时要求递归与迭代都能做； n ≤ 1000，一次遍历即可。"
      },
      {
        "title": "状态表示什么",
        "text": "同时比较两个镜像位置；结构和数值都必须一致。"
      },
      {
        "title": "为什么可以这样做",
        "text": "一对节点对称，当且仅当取值相同，且一方的左孩子与另一方的右孩子对称、一方的右孩子与另一方的左孩子对称。因此从根的左右孩子出发做交叉递归即可。"
      }
    ],
    "pitfalls": [
      "镜像比较左的左与右的右、左的右与右的左；只比较同层数值不够。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是二叉树的节点数。"
  },
  {
    "id": "leetcode-543",
    "number": "543",
    "title": "二叉树的直径",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "二叉树",
      "树形 DP"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/diameter-of-binary-tree/",
    "summary": "左右高度之和是经过当前节点的路径长度；直径按边计数，可能不经过根。",
    "statement": "给你一棵二叉树的根节点，返回该树的 直径 。 二叉树的 直径 是指树中任意两个节点之间最长路径的 长度 。这条路径可能经过也可能不经过根节点 root 。 两节点之间路径的 长度 由它们之间边数表示。",
    "demo": "problems/hot100-543/index.html",
    "principles": [
      {
        "title": "枚举 + DFS",
        "text": "直径是任意两点路径的最长边数。枚举所有点对再求路径不现实。任一直径必经过某节点，等于该节点左右子树高度之和。"
      },
      {
        "title": "状态表示什么",
        "text": "l+r 用于更新直径；递归返回 1+max(l,r)，只带一条向上的分支。"
      },
      {
        "title": "为什么可以这样做",
        "text": "DFS 返回子树高度，并在回溯时用 l+r 更新全局答案，同时向父节点返回 1+max(l,r)。每个节点只访问一次，高度与直径一起算出。"
      }
    ],
    "pitfalls": [
      "左右高度之和是经过当前节点的路径长度；直径按边计数，可能不经过根。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为二叉树的节点个数。"
  },
  {
    "id": "leetcode-102",
    "number": "102",
    "title": "二叉树的层序遍历",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "BFS",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/binary-tree-level-order-traversal/",
    "summary": "每层先保存队列长度，保证新加入的孩子留给下一层。",
    "statement": "给你二叉树的根节点 root ，返回其节点值的 层序遍历 。 （即逐层地，从左到右访问所有节点）。",
    "demo": "problems/hot100-102/index.html",
    "principles": [
      {
        "title": "BFS",
        "text": "题目要按层输出节点值。深度优先也能记下深度再分组，但同一层的左右顺序还要额外整理。 n ≤ 2000，一层最多 O(n) 个节点。"
      },
      {
        "title": "状态表示什么",
        "text": "q 是待访问队列，t 是当前层结果；固定本层循环次数防止混入下一层。"
      },
      {
        "title": "为什么可以这样做",
        "text": "广度优先天然按层扩张：队列中当前一批节点恰为一层，出队时收集取值并压入孩子，即可得到从左到右的一层结果。"
      }
    ],
    "pitfalls": [
      "每层先保存队列长度，保证新加入的孩子留给下一层。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是二叉树的节点个数。"
  },
  {
    "id": "leetcode-108",
    "number": "108",
    "title": "将有序数组转换为二叉搜索树",
    "difficulty": "简单",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "二叉搜索树",
      "数组",
      "分治",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/",
    "summary": "取有序区间中点作为根，再递归构造左右区间；平衡树答案可能不唯一。",
    "statement": "给你一个整数数组 nums ，其中元素已经按 升序 排列，请你将其转换为一棵 平衡 二叉搜索树。",
    "demo": "problems/hot100-108/index.html",
    "principles": [
      {
        "title": "二分 + 递归",
        "text": "有序数组本身就是一棵 BST 的中序序列。若总取左端或右端为根，树会退化成链，高度为 n，不满足高度平衡。 n ≤ 10^4。"
      },
      {
        "title": "状态表示什么",
        "text": "[l,r] 是当前递归负责的有序区间；中点作为根，左右区间形成两棵子树。"
      },
      {
        "title": "为什么可以这样做",
        "text": "区间中点作为根时，左右两侧元素个数至多相差 1，子树高度自然平衡。为此在 [l,r] 上取中点建根，再递归左右半段。"
      }
    ],
    "pitfalls": [
      "取有序区间中点作为根，再递归构造左右区间；平衡树答案可能不唯一。"
    ],
    "complexity": "时间 O(n)。递归辅助栈 O(log n)，构造出的结果树占 O(n)。"
  },
  {
    "id": "leetcode-98",
    "number": "98",
    "title": "验证二叉搜索树",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "二叉搜索树",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/validate-binary-search-tree/",
    "summary": "中序遍历必须严格递增；相等值也不合法，不能仅比较父子节点。",
    "statement": "给你一个二叉树的根节点 root ，判断其是否是一个有效的二叉搜索树。 有效 二叉搜索树定义如下： 节点的左子树只包含 严格小于 当前节点的数。 节点的右子树只包含 严格大于 当前节点的数。 所有左子树和右子树自身必须也是二叉搜索树。",
    "demo": "problems/hot100-98/index.html",
    "principles": [
      {
        "title": "递归",
        "text": "仅检查「左孩子小于根、右孩子大于根」并不充分：左子树里的最大值也必须小于根。可以给每棵子树传入允许取值的区间，也可以利用 BST 的定义——中序序列必须严格递增。"
      },
      {
        "title": "状态表示什么",
        "text": "prev 是中序访问的前一个值；当前值必须严格大于 prev。"
      },
      {
        "title": "为什么可以这样做",
        "text": "中序时记下上一个值，当前值必须更大。递归左、比较、再递归右，一遍即可发现违规。空树合法。"
      }
    ],
    "pitfalls": [
      "中序遍历必须严格递增；相等值也不合法，不能仅比较父子节点。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是二叉树的节点个数。"
  },
  {
    "id": "leetcode-230",
    "number": "230",
    "title": "二叉搜索树中第 K 小的元素",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "二叉搜索树",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/kth-smallest-element-in-a-bst/",
    "summary": "二叉搜索树的中序遍历递增；k 是从 1 开始的排名。",
    "statement": "给定一个二叉搜索树的根节点 root ，和一个整数 k ，请你设计一个算法查找其中第 k 小的元素（k 从 1 开始计数）。",
    "demo": "problems/hot100-230/index.html",
    "principles": [
      {
        "title": "中序遍历",
        "text": "BST 的中序遍历即为升序。只需走到第 k 个被访问的结点，不必列出整棵树。"
      },
      {
        "title": "状态表示什么",
        "text": "栈保存待访问祖先；每次弹栈完成一次中序访问，将 k 减一。"
      },
      {
        "title": "为什么可以这样做",
        "text": "二叉搜索树的中序遍历递增；k 是从 1 开始的排名。"
      }
    ],
    "pitfalls": [
      "二叉搜索树的中序遍历递增；k 是从 1 开始的排名。"
    ],
    "complexity": "时间 O(h+k)，最坏 O(n)；辅助栈空间 O(h)，h 为树高。"
  },
  {
    "id": "leetcode-199",
    "number": "199",
    "title": "二叉树的右视图",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "BFS",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/binary-tree-right-side-view/",
    "summary": "层序遍历每层只记录最右节点；入队顺序必须与选取位置对应。",
    "statement": "给定一个二叉树的 根节点 root，想象自己站在它的右侧，按照从顶部到底部的顺序，返回从右侧所能看到的节点值。",
    "demo": "problems/hot100-199/index.html",
    "principles": [
      {
        "title": "BFS",
        "text": "从右侧看，每层只看到最右边的节点。 n≤ 100。层序时先把右孩子入队，则队头就是该层最右节点，记下后即可扫完本层。不必事后再取每层末尾。"
      },
      {
        "title": "状态表示什么",
        "text": "本解法先右后左入队，因此每层队头就是右视图节点。"
      },
      {
        "title": "为什么可以这样做",
        "text": "层序遍历每层只记录最右节点；入队顺序必须与选取位置对应。"
      }
    ],
    "pitfalls": [
      "层序遍历每层只记录最右节点；入队顺序必须与选取位置对应。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为二叉树节点个数。"
  },
  {
    "id": "leetcode-114",
    "number": "114",
    "title": "二叉树展开为链表",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "栈",
      "树",
      "DFS",
      "链表",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/",
    "summary": "把左子树插到右侧之前，先把原右子树接到左子树最右节点。",
    "statement": "给你二叉树的根结点 root ，请你将它展开为一个单链表： 展开后的单链表应该同样使用 TreeNode ，其中 right 子指针指向链表中下一个结点，而左子指针始终为 null 。 展开后的单链表应该与二叉树 先序遍历 顺序相同。",
    "demo": "problems/hot100-114/index.html",
    "principles": [
      {
        "title": "寻找前驱节点",
        "text": "先序展开可以用递归或栈先建出新链，但进阶要求 O(1) 额外空间且原地修改。 n ≤ 2000。"
      },
      {
        "title": "状态表示什么",
        "text": "pre 找到左子树最右节点，把原右子树接到那里，再把左子树搬到右侧。"
      },
      {
        "title": "为什么可以这样做",
        "text": "先序中，左子树走完后的下一个节点就是原右子树的根。左子树最右节点恰是这段的前驱：把它的右指针接到原右子树，再把左子树整体接到当前右指针上并清空左指针。沿右链继续，无需递归栈。"
      }
    ],
    "pitfalls": [
      "把左子树插到右侧之前，先把原右子树接到左子树最右节点。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是树中节点的个数。"
  },
  {
    "id": "leetcode-105",
    "number": "105",
    "title": "从前序与中序遍历序列构造二叉树",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "数组",
      "哈希",
      "分治",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "summary": "前序首元素是根，在中序中的位置决定左右子树大小；两段的起点不能混淆。",
    "statement": "给定两个整数数组 preorder 和 inorder ，其中 preorder 是二叉树的先序遍历， inorder 是同一棵树的中序遍历，请构造二叉树并返回其根节点。",
    "demo": "problems/hot100-105/index.html",
    "principles": [
      {
        "title": "哈希表 + 递归",
        "text": "前序给出根的出现顺序，中序给出每个根左右子树的分界。每次在中序里线性扫描根的位置，总时间可达 O(n^2)； n ≤ 3000 偏紧。"
      },
      {
        "title": "状态表示什么",
        "text": "i 是前序起点，j 是中序起点，n 是当前子树大小；k 决定左右子树规模。"
      },
      {
        "title": "为什么可以这样做",
        "text": "题目保证节点值互不相同，因此中序位置可以预处理进哈希表，查找变为 O(1)。前序区间的首元素是根，中序中该值左侧是左子树、右侧是右子树，长度确定后再递归构造两段。"
      }
    ],
    "pitfalls": [
      "前序首元素是根，在中序中的位置决定左右子树大小；两段的起点不能混淆。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为二叉树节点个数。"
  },
  {
    "id": "leetcode-437",
    "number": "437",
    "title": "路径总和 III",
    "difficulty": "中等",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "二叉树"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/path-sum-iii/",
    "summary": "前缀和计数仅表示当前递归路径；退出子树必须撤销当前前缀，防止跨分支计数。",
    "statement": "给定一个二叉树的根节点 root ，和一个整数 targetSum ，求该二叉树里节点值之和等于 targetSum 的 路径 的数目。 路径 不需要从根节点开始，也不需要在叶子节点结束，但是路径方向必须是向下的（只能从父节点到子节点）。",
    "demo": "problems/hot100-437/index.html",
    "principles": [
      {
        "title": "哈希表 + 前缀和 + 递归",
        "text": "路径必须向下，枚举每个祖先再向下扫描是 O(n^2)。路径和等于 targetSum 可改写成「当前前缀和减去某个祖先前缀和」。"
      },
      {
        "title": "状态表示什么",
        "text": "cnt 仅保存当前根到节点路径上的前缀和次数；返回父调用前必须撤销一次。"
      },
      {
        "title": "为什么可以这样做",
        "text": "先序累加前缀和 s，用哈希表统计根到当前结点的前缀出现次数， cnt[s-targetSum] 即以此为终点的合法路径数。回溯时撤销 s，避免把另一条分支算进来。 初始 cnt[0]=1，对应从根出发整段刚好等于目标。先查询再插入，路径不含「当前结点用两次」。"
      }
    ],
    "pitfalls": [
      "前缀和计数仅表示当前递归路径；退出子树必须撤销当前前缀，防止跨分支计数。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是二叉树的节点个数。"
  },
  {
    "id": "leetcode-124",
    "number": "124",
    "title": "二叉树中的最大路径和",
    "difficulty": "困难",
    "category": "二叉树",
    "tags": [
      "Hot 100",
      "树",
      "DFS",
      "动态规划",
      "二叉树",
      "树形 DP"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/binary-tree-maximum-path-sum/",
    "summary": "向父节点只返回一条分支；更新全局答案时可以同时使用左右两条正贡献。",
    "statement": "二叉树中的 路径 被定义为一条节点序列，序列中每对相邻节点之间都存在一条边。同一个节点在一条路径序列中 至多出现一次 。该路径 至少包含一个 节点，且不一定经过根节点。 路径和 是路径中各节点值的总和。 给你一个二叉树的根节点 root ，返回其 最大路径和 。",
    "demo": "problems/hot100-124/index.html",
    "principles": [
      {
        "title": "递归",
        "text": "路径可以经过任意节点，不必过根，也可以在某节点「拐弯」同时走左右子树。枚举所有路径在 n ≤ 3× 10^4 下不可行。"
      },
      {
        "title": "状态表示什么",
        "text": "left/right 只取正贡献。向上只传一侧，全局答案则允许两侧在当前根汇合。"
      },
      {
        "title": "为什么可以这样做",
        "text": "对每个节点，能向上贡献的只是「节点值加上左右中较大的一条非负链」；左右都接上的和只用于更新全局答案，不能再往上传。负贡献应丢弃，因此递归返回前对子树结果与 0 取最大。"
      }
    ],
    "pitfalls": [
      "向父节点只返回一条分支；更新全局答案时可以同时使用左右两条正贡献。",
      "递归辅助空间取决于实际调用深度。退化为很长的单链时，Python 或 Java 的系统调用栈可能先达到限制；这类输入应改用显式栈。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 是二叉树的节点数。"
  },
  {
    "id": "leetcode-200",
    "number": "200",
    "title": "岛屿数量",
    "difficulty": "中等",
    "category": "图论",
    "tags": [
      "Hot 100",
      "DFS",
      "BFS",
      "并查集",
      "数组",
      "矩阵"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/number-of-islands/",
    "summary": "每发现一块新陆地就增加岛数，并淹没所有与之四向相连的陆地。",
    "statement": "给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。 岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。 此外，你可以假设该网格的四条边均被水包围。",
    "demo": "problems/hot100-200/index.html",
    "principles": [
      {
        "title": "DFS",
        "text": "若将网格中每个值为 1 的格子单独计为一座岛，则四连通的陆地会被重复计数。 m,n ≤ 300，整图遍历可行，但须在同一次搜索中把同一连通块全部消掉。"
      },
      {
        "title": "状态表示什么",
        "text": "字符 1 是尚未访问的陆地，改成 0 表示访问完成；四向 DFS 消除同一座岛。"
      },
      {
        "title": "为什么可以这样做",
        "text": "注意到上下左右相邻的陆地构成一个连通分量，从任一尚未访问的陆地出发即可覆盖整座岛。为此扫描每个格子，遇到 1 便启动 DFS，沿途把陆地改写为 0，每启动一次搜索将答案加一。"
      }
    ],
    "pitfalls": [
      "每发现一块新陆地就增加岛数，并淹没所有与之四向相连的陆地。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 和 n 分别为网格的行数和列数。"
  },
  {
    "id": "leetcode-994",
    "number": "994",
    "title": "腐烂的橘子",
    "difficulty": "中等",
    "category": "图论",
    "tags": [
      "Hot 100",
      "BFS",
      "数组",
      "矩阵"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/rotting-oranges/",
    "summary": "所有腐烂橘子同时入队，多源 BFS 每一层代表一分钟；无法到达的鲜橘子使答案为 −1。",
    "statement": "在给定的 m x n 网格 grid 中，每个单元格可以有以下三个值之一： 值 0 代表空单元格； 值 1 代表新鲜橘子； 值 2 代表腐烂的橘子。 每分钟，腐烂的橘子 周围 4 个方向上相邻 的新鲜橘子都会腐烂。 返回 直到单元格中没有新鲜橘子为止所必须经过的最小分钟数。如果不可能，返回 -1 。",
    "demo": "problems/hot100-994/index.html",
    "principles": [
      {
        "title": "BFS",
        "text": "腐烂每分钟向四邻扩散，求全部变烂的最短时间。多源同时扩散，属于无权最短路。先把所有烂橘入队并统计鲜橘，按层 BFS；鲜橘计数归零时的层数即为答案，队列空仍有鲜橘则返回 -1。"
      },
      {
        "title": "状态表示什么",
        "text": "q 是当前腐烂传播前沿，cnt 是鲜橘子数量；每轮队列长度对应同一分钟。"
      },
      {
        "title": "为什么可以这样做",
        "text": "所有腐烂橘子同时入队，多源 BFS 每一层代表一分钟；无法到达的鲜橘子使答案为 −1。"
      }
    ],
    "pitfalls": [
      "所有腐烂橘子同时入队，多源 BFS 每一层代表一分钟；无法到达的鲜橘子使答案为 −1。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 和 n 分别是网格的行数和列数。"
  },
  {
    "id": "leetcode-207",
    "number": "207",
    "title": "课程表",
    "difficulty": "中等",
    "category": "图论",
    "tags": [
      "Hot 100",
      "DFS",
      "BFS",
      "图",
      "拓扑排序",
      "有向无环图"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/course-schedule/",
    "summary": "入度为零的课程才能学习；学完后减少后继入度，最终处理数量不足说明有环。",
    "statement": "你这个学期必须选修 numCourses 门课程，记为 0 到 numCourses - 1 。 在选修某些课程之前需要一些先修课程。 先修课程按数组 prerequisites 给出，其中 prerequisites[i] = [ai, bi] ，表示如果要学习课程 ai 则 必须 先学习课程 bi 。 例如，先修课程对 [0, 1] 表示：想要学习课程 0 ，你需要先完成课程 1 。 请你判断是否可能完成所有课程的学习？如果可以，返回 true ；否则，返回 false 。",
    "demo": "problems/hot100-207/index.html",
    "principles": [
      {
        "title": "拓扑排序",
        "text": "先修关系构成有向图，能修完所有课当且仅当图中无环。枚举排列检查约束在课程数较大时不可行。"
      },
      {
        "title": "状态表示什么",
        "text": "g 是先修课到后续课的边；indeg 为剩余先修数量，只有零入度节点能处理。"
      },
      {
        "title": "为什么可以这样做",
        "text": "拓扑排序不断取出入度为 0 的课并减少其后继入度；若全部结点都能入队则无环，否则存在环。"
      }
    ],
    "pitfalls": [
      "入度为零的课程才能学习；学完后减少后继入度，最终处理数量不足说明有环。"
    ],
    "complexity": "时间复杂度 O(n + m)，空间复杂度 O(n + m)。其中 n 和 m 分别为课程数和先修课程数。"
  },
  {
    "id": "leetcode-208",
    "number": "208",
    "title": "实现 Trie (前缀树)",
    "difficulty": "中等",
    "category": "图论",
    "tags": [
      "Hot 100",
      "设计",
      "字典树",
      "哈希",
      "字符串"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/implement-trie-prefix-tree/",
    "summary": "前缀存在不代表完整单词存在；search 还要检查词尾标记。",
    "statement": "Trie（发音类似 \"try\"）或者说 前缀树 是一种树形数据结构，用于高效地存储和检索字符串数据集中的键。这一数据结构有相当多的应用情景，例如自动补全和拼写检查。 请你实现 Trie 类： Trie() 初始化前缀树对象。 void insert(String word) 向前缀树中插入字符串 word 。 boolean search(String word) 如果字符串 word 在前缀树中，返回 true（即，在检索之前已经插入）；否则，返回 false 。 boolean startsWith(String prefix) 如果之前已经插入的字符串 word 的前缀之一为 prefix ，返回 true ；否则，返回 false 。",
    "demo": "problems/hot100-208/index.html",
    "principles": [
      {
        "title": "前缀树",
        "text": "多次查询公共前缀时，若对每个单词扫描全部已插入词，则会重复比较相同前缀。字符均为小写，可用 26 叉树按字符分层。"
      },
      {
        "title": "状态表示什么",
        "text": "每条边是一位字母，✓ 标记完整单词终点；路径存在与完整单词存在是两件事。"
      },
      {
        "title": "为什么可以这样做",
        "text": "插入时沿路径创建结点并在末尾置 isEnd；查询前缀走同一路径，search 再检查终点是否为词尾。"
      }
    ],
    "pitfalls": [
      "前缀存在不代表完整单词存在；search 还要检查词尾标记。"
    ],
    "complexity": "时间复杂度方面，插入字符串的时间复杂度为 O(m|Sigma|)，查找前缀的时间复杂度为 O(m)，其中 m 为字符串的长度，而 |Sigma| 为字符集的大小（本题中为 26）。空间复杂度为 O(qm|Sigma|)，其中 q 为插入的字符串数量。"
  },
  {
    "id": "leetcode-39",
    "number": "39",
    "title": "组合总和",
    "difficulty": "中等",
    "category": "回溯",
    "tags": [
      "Hot 100",
      "数组",
      "回溯"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/combination-sum/",
    "summary": "选择当前候选后仍可继续使用它；递归起点不能退回更小下标以免重复组合。",
    "statement": "给你一个 无重复元素 的整数数组 candidates 和一个目标整数 target ，找出 candidates 中可以使数字和为目标数 target 的 所有 不同组合 ，并以列表形式返回。你可以按 任意顺序 返回这些组合。 candidates 中的 同一个 数字可以 无限制重复被选取 。如果至少一个数字的被选数量不同，则两种组合是不同的。 对于给定的输入，保证和为 target 的不同组合数少于 150 个。",
    "demo": "problems/hot100-39/index.html",
    "principles": [
      {
        "title": "排序 + 剪枝 + 回溯",
        "text": "对每个数无限次选用或不选，搜完所有和为 target 的序列，在 n ≤ 30、 target ≤ 40 时，若不剪枝会搜出大量超过目标和的路径，且不同顺序会被当成不同组合。"
      },
      {
        "title": "状态表示什么",
        "text": "t 是当前选择，s 是还需凑出的和；递归继续使用当前下标，允许重复取同一个数。"
      },
      {
        "title": "为什么可以这样做",
        "text": "组合与顺序无关，同一组数只应出现一次。因此先排序，搜索时只从当前下标向右选取，避免排列重复。排序后若剩余 s 已小于 candidates[i]，其后元素更大，整支可以停止。 dfs(i, s) 从 i 起枚举 j，递归仍从 j 开始，表示该数还能再用。"
      }
    ],
    "pitfalls": [
      "选择当前候选后仍可继续使用它；递归起点不能退回更小下标以免重复组合。"
    ],
    "complexity": "设最小候选为 c，目标为 T，最大递归深度 D=⌊T/c⌋，候选数量为 n。时间由实际搜索树和复制结果决定，保守上界 O(n^(D+1))；辅助栈和路径 O(D)，返回结果另计。允许重复取数，不能写成仅关于 n 的 2^n。"
  },
  {
    "id": "leetcode-79",
    "number": "79",
    "title": "单词搜索",
    "difficulty": "中等",
    "category": "回溯",
    "tags": [
      "Hot 100",
      "DFS",
      "数组",
      "字符串",
      "回溯",
      "矩阵"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/word-search/",
    "summary": "同一搜索路径不能重复用格子；探索失败后恢复字符，供其他路径使用。",
    "statement": "给定一个 m x n 二维字符网格 board 和一个字符串单词 word 。如果 word 存在于网格中，返回 true ；否则，返回 false 。 单词必须按照字母顺序，通过相邻的单元格内的字母构成，其中“相邻”单元格是那些水平相邻或垂直相邻的单元格。同一个单元格内的字母不允许被重复使用。",
    "demo": "problems/hot100-79/index.html",
    "principles": [
      {
        "title": "DFS(回溯)",
        "text": "若从每个格子出发走出长度为 |word| 的路径再比对，网格至多 6 × 6、 |word| ≤ 15，不及时剪枝则搜索量过大。必须边走边比较，失配立刻返回，且同一格子不能使用两次。"
      },
      {
        "title": "状态表示什么",
        "text": "k 是正在匹配的字符下标；标记过的格子不能在同一路径重复使用，失败后恢复。"
      },
      {
        "title": "为什么可以这样做",
        "text": "路径必须与 word 逐字符对齐，因此搜索状态可以写成 dfs(i, j, k)：当前位置 (i, j) 对齐 word[k]。匹配后将格子改为 '0' 防止重入，再向四邻搜索 k+1，返回时还原。字母本身不是 '0'，因此不必另开访问数组。枚举每一个起点，任一成功即可。"
      }
    ],
    "pitfalls": [
      "同一搜索路径不能重复用格子；探索失败后恢复字符，供其他路径使用。"
    ],
    "complexity": "时间复杂度 O(mn 3^k)，空间复杂度 O(min(mn, k))。其中 m 和 n 分别是网格的行数和列数；而 k 是字符串 word 的长度。"
  },
  {
    "id": "leetcode-35",
    "number": "35",
    "title": "搜索插入位置",
    "difficulty": "简单",
    "category": "二分查找",
    "tags": [
      "Hot 100",
      "数组",
      "二分查找"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/search-insert-position/",
    "summary": "在左闭右开区间中寻找第一个大于等于 target 的位置；答案可能等于数组长度。",
    "statement": "给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。 请必须使用时间复杂度为 O(log n) 的算法。",
    "demo": "problems/hot100-35/index.html",
    "principles": [
      {
        "title": "二分查找",
        "text": "从左扫描到第一个不小于 target 的位置，时间复杂度为 O(n)。在 n ≤ 10^4 的数据范围下可以接受，但数组已升序且无重复，线性遍历没有利用有序性。"
      },
      {
        "title": "状态表示什么",
        "text": "候选区间为 [l,r)；最终 l 是第一个不小于 target 的位置。"
      },
      {
        "title": "为什么可以这样做",
        "text": "插入位置恰好是第一个不小于 target 的下标，即有序数组上的下界。为此维护半开区间 [l, r)：若 nums[mid] ≥ target，则答案位于左半（含 mid）；否则位于 mid 右侧。收缩至 l = r 时， l 即为插入点。"
      }
    ],
    "pitfalls": [
      "在左闭右开区间中寻找第一个大于等于 target 的位置；答案可能等于数组长度。"
    ],
    "complexity": "时间复杂度 O(log n)，空间复杂度 O(1)。其中 n 为数组 nums 的长度。"
  },
  {
    "id": "leetcode-74",
    "number": "74",
    "title": "搜索二维矩阵",
    "difficulty": "中等",
    "category": "二分查找",
    "tags": [
      "Hot 100",
      "数组",
      "二分查找",
      "矩阵"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/search-a-2d-matrix/",
    "summary": "把矩阵视作一维有序数组，用下标除以列数和对列数取余映射回行列。",
    "statement": "给你一个满足下述两条属性的 m x n 整数矩阵： 每行中的整数从左到右按非严格递增顺序排列。 每行的第一个整数大于前一行的最后一个整数。 给你一个整数 target ，如果 target 在矩阵中，返回 true ；否则，返回 false 。 你必须编写一个时间复杂度为 O(log(m * n)) 的解决方案。",
    "demo": "problems/hot100-74/index.html",
    "principles": [
      {
        "title": "二分查找",
        "text": "逐格扫描需要 O(mn) 时间。 m, n ≤ 100 可以接受，但题目要求 O(log(mn))。"
      },
      {
        "title": "状态表示什么",
        "text": "二分使用展开后的一维下标；x=mid/n，y=mid%n。"
      },
      {
        "title": "为什么可以这样做",
        "text": "二维矩阵本身不便直接二分，但每一行递增，且上一行末尾小于下一行开头，因此按行拼接后是长度为 mn 的有序序列。将逻辑下标 mid 映射为 matrix[lfloor mid/nrfloor][mid bmod n]，即可在 [0, mn-1] 上做一次二分，不必真正展开数组。"
      }
    ],
    "pitfalls": [
      "把矩阵视作一维有序数组，用下标除以列数和对列数取余映射回行列。"
    ],
    "complexity": "时间复杂度 O(log (mn))，空间复杂度 O(1)。其中 m 和 n 分别是矩阵的行数和列数。"
  },
  {
    "id": "leetcode-34",
    "number": "34",
    "title": "在排序数组中查找元素的第一个和最后一个位置",
    "difficulty": "中等",
    "category": "二分查找",
    "tags": [
      "Hot 100",
      "数组",
      "二分查找"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/",
    "summary": "分别查找 target 和 target+1 的左边界；两者相同时目标不存在。",
    "statement": "给你一个按照非递减顺序排列的整数数组 nums，和一个目标值 target。请你找出给定目标值在数组中的开始位置和结束位置。 如果数组中不存在目标值 target，返回 [-1, -1]。 你必须设计并实现时间复杂度为 O(log n) 的算法解决此问题。",
    "demo": "problems/hot100-34/index.html",
    "principles": [
      {
        "title": "二分查找",
        "text": "扫描一遍记下 target 的首次与末次出现，时间复杂度为 O(n)。 n ≤ 10^5 且题目要求 O(log n)；即便先找到一个命中再向两侧扩展，最坏仍是线性。"
      },
      {
        "title": "状态表示什么",
        "text": "两次左边界查找分别定位 target 与 target+1；相减得到目标元素的连续区间。"
      },
      {
        "title": "为什么可以这样做",
        "text": "数组非递减，左右边界各自是一个二分问题，不必在同一轮里同时寻找两端。左边界即第一个不小于 target 的位置，右边界即第一个不小于 target+1 的位置减一。两次下界查找即可；若两次结果相同，说明 target 不存在。"
      }
    ],
    "pitfalls": [
      "分别查找 target 和 target+1 的左边界；两者相同时目标不存在。"
    ],
    "complexity": "时间复杂度 O(log n)，空间复杂度 O(1)。其中 n 是数组 nums 的长度。"
  },
  {
    "id": "leetcode-33",
    "number": "33",
    "title": "搜索旋转排序数组",
    "difficulty": "中等",
    "category": "二分查找",
    "tags": [
      "Hot 100",
      "数组",
      "二分查找"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/search-in-rotated-sorted-array/",
    "summary": "每次二分至少有一半有序；先判断目标是否在有序半边，再决定保留哪侧。",
    "statement": "整数数组 nums 按升序排列，数组中的值 互不相同 。 在传递给函数之前，nums 在预先未知的某个下标 k（0 <= k < nums.length）上进行了 向左旋转，使数组变为 [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]（下标 从 0 开始 计数）。例如， [0,1,2,4,5,6,7] 下标 3 上向左旋转后可能变为 [4,5,6,7,0,1,2] 。 给你 旋转后 的数组 nums 和一个整数 target ，如果 nums 中存在这个目标值 target ，则返回它的下标，否则返回 -1 。 你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。",
    "demo": "problems/hot100-33/index.html",
    "principles": [
      {
        "title": "二分查找",
        "text": "线性扫描的时间复杂度为 O(n)。题目要求 O(log n)，因此不能逐个比较。"
      },
      {
        "title": "状态表示什么",
        "text": "先判断哪半边有序，再判断 target 是否位于那一段值域中。"
      },
      {
        "title": "为什么可以这样做",
        "text": "数组被旋转后整体不再有序，普通二分无法直接判断 target 落在哪一半。 注意到，任取中点将区间一分为二，其中至少有一半保持单调。比较 nums[0] 与 nums[mid] 即可判断左半是否有序；若 target 落在该有序区间内，则丢弃另一半，否则在无序半段中继续查找。因此仍可二分：有序半段用来判定去留，无序半段留给下一轮继续分割。"
      }
    ],
    "pitfalls": [
      "每次二分至少有一半有序；先判断目标是否在有序半边，再决定保留哪侧。"
    ],
    "complexity": "时间复杂度 O(log n)，空间复杂度 O(1)。其中 n 是数组 nums 的长度。"
  },
  {
    "id": "leetcode-153",
    "number": "153",
    "title": "寻找旋转排序数组中的最小值",
    "difficulty": "中等",
    "category": "二分查找",
    "tags": [
      "Hot 100",
      "数组",
      "二分查找"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/",
    "summary": "将中点与右边界比较，判断最小值所在半边；保留可能成为答案的中点。",
    "statement": "已知一个长度为 n 的数组，预先按照升序排列，经由 1 到 n 次 旋转 后，得到输入数组。例如，原数组 nums = [0,1,2,4,5,6,7] 在变化后可能得到： 若旋转 4 次，则可以得到 [4,5,6,7,0,1,2] 若旋转 7 次，则可以得到 [0,1,2,4,5,6,7] 注意，数组 [a[0], a[1], a[2], ..., a[n-1]] 旋转一次 的结果为数组 [a[n-1], a[0], a[1], a[2], ..., a[n-2]] 。 给你一个元素值 互不相同 的数组 nums ，它原来是一个升序排列的数组，并按上述情形进行了多次旋转。请你找出并返回数组中的 最小元素 。 你必须设计一个时间复杂度为 O(log n) 的算法解决此问题。",
    "demo": "problems/hot100-153/index.html",
    "principles": [
      {
        "title": "二分查找",
        "text": "旋转后的有序数组没有重复，线性扫最小值是 O(n)， n≤ 5000 可以，但有序性允许对数。最小值把数组分成两段递增。与末元素比较：中点更大说明最小值在右半，否则在左半（含中点）。收缩到一点即答案。"
      },
      {
        "title": "状态表示什么",
        "text": "nums[mid] 与原数组末值比较，判断中点在旋转断点的哪一侧。"
      },
      {
        "title": "为什么可以这样做",
        "text": "将中点与右边界比较，判断最小值所在半边；保留可能成为答案的中点。"
      }
    ],
    "pitfalls": [
      "将中点与右边界比较，判断最小值所在半边；保留可能成为答案的中点。"
    ],
    "complexity": "时间复杂度 O(log n)，空间复杂度 O(1)。其中 n 是数组 nums 的长度。"
  },
  {
    "id": "leetcode-4",
    "number": "4",
    "title": "寻找两个正序数组的中位数",
    "difficulty": "困难",
    "category": "二分查找",
    "tags": [
      "Hot 100",
      "数组",
      "二分查找",
      "分治"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/median-of-two-sorted-arrays/",
    "summary": "递归查找第 k 小元素，每次排除约 k/2 个；偶数长度需要两个中间值的平均数。",
    "statement": "给定两个大小分别为 m 和 n 的正序（从小到大）数组 nums1 和 nums2。请你找出并返回这两个正序数组的 中位数 。 算法的时间复杂度应该为 O(log (m+n)) 。",
    "demo": "problems/hot100-4/index.html",
    "principles": [
      {
        "title": "分治",
        "text": "若将两个有序数组合并后再取中位数，时间复杂度为 O(m+n)。在 m,n ≤ 10^3 的范围内可以接受，但题目要求 O(log(m+n))，因此不能线性扫描。"
      },
      {
        "title": "状态表示什么",
        "text": "当前要找剩余两段中的第 k 小；比较两段第 p 个候选，排除较小的一段前缀。"
      },
      {
        "title": "为什么可以这样做",
        "text": "注意到中位数只取决于合并后正中间的一两个位置，比它更小的元素只需知道个数，而不必真正列出。两数组均有序，比较各自第 ≤ftlfloor k/2 rightrfloor 个数，即可判断其中一侧的前一半不可能是第 k 小，从而一次排除一半候选。 因此我们在剩余区间上求第 k 小，而不构造合并数组。将中位数统一为第 ≤ftlfloor (m+n+1)/2 rightrfloor 与第 ≤ftlfloor (m+n+2)/2 rightrfloor 个数的平均，奇数与偶数长度可以共用同一套逻辑。若某一侧不足 ≤ftlfloor k/2 rightrfloor 个元素，则将该侧视为 +∞，只会排除另一侧。"
      }
    ],
    "pitfalls": [
      "递归查找第 k 小元素，每次排除约 k/2 个；偶数长度需要两个中间值的平均数。"
    ],
    "complexity": "题目要求算法的时间复杂度为 O(log (m + n))，因此不能直接遍历两个数组，而是需要使用二分查找的方法。 时间复杂度 O(log(m + n))，空间复杂度 O(log(m + n))。其中 m 和 n 分别是数组 nums1 和 nums2 的长度。"
  },
  {
    "id": "leetcode-20",
    "number": "20",
    "title": "有效的括号",
    "difficulty": "简单",
    "category": "栈",
    "tags": [
      "Hot 100",
      "栈",
      "字符串",
      "括号序列"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/valid-parentheses/",
    "summary": "右括号只能匹配栈顶左括号；先检查空栈，结束时栈也必须为空。",
    "statement": "给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。 有效字符串需满足： 左括号必须用相同类型的右括号闭合。 左括号必须以正确的顺序闭合。 每个右括号都有一个对应的相同类型的左括号。",
    "demo": "problems/hot100-20/index.html",
    "principles": [
      {
        "title": "栈",
        "text": "把已经相邻的 ()、 [] 和 {} 反复从字符串中删去，直到不能再删，结果是正确的。每一轮都要重新扫描， n ≤ 10^4 时最坏会退化成 O(n^2)，括号层层嵌套时也容易超时。"
      },
      {
        "title": "状态表示什么",
        "text": "栈保存后续应该遇到的右括号；遇到右括号时必须与栈顶一致。"
      },
      {
        "title": "为什么可以这样做",
        "text": "瓶颈在于配对并不只看相邻的两个字符。后出现的左括号必须先被闭合，更早的左括号还要留在原处；像 ([)] 这种交错，局部删除已经无法把字符串消成空串。 于是匹配是后进先出的：当前右括号唯一合法的对象，就是最近一个尚未闭合的左括号。栈用来记录这些尚未完成的匹配。读到左括号时，把与之对应的右括号压入栈顶，也就是把下一次允许出现的右括号放在最上面；读到右括号时只和栈顶比较。不相等说明类型或顺序已经错了。扫完之后栈里还有元素，则说明仍有左括号没有闭合。"
      }
    ],
    "pitfalls": [
      "右括号只能匹配栈顶左括号；先检查空栈，结束时栈也必须为空。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为字符串 s 的长度。"
  },
  {
    "id": "leetcode-155",
    "number": "155",
    "title": "最小栈",
    "difficulty": "中等",
    "category": "栈",
    "tags": [
      "Hot 100",
      "栈",
      "设计"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/min-stack/",
    "summary": "每次入栈同时保存截至当前位置的最小值；出栈时两个栈同步弹出。",
    "statement": "设计一个支持 push ，pop ，top 操作，并能在常数时间内检索到最小元素的栈。 实现 MinStack 类: MinStack() 初始化堆栈对象。 void push(int value) 将元素 value 推入堆栈。 void pop() 删除堆栈顶部的元素。 int top() 获取堆栈顶部的元素。 int getMin() 获取堆栈中的最小元素。",
    "demo": "problems/hot100-155/index.html",
    "principles": [
      {
        "title": "双栈",
        "text": "栈的 getMin 要与 push/pop 一样 O(1)。每次扫描栈底是线性的，调用可达 3× 10^4。最小值只在入栈更小元素或弹出当前最小时变化，因此再维护一个同步的最小栈：每次压入 min(x, 当前最小 )，弹出时两栈一起弹。"
      },
      {
        "title": "状态表示什么",
        "text": "stk1 保存值，stk2 同步保存每一层的最小值；最底层 ∞ 仅用于初始化。"
      },
      {
        "title": "为什么可以这样做",
        "text": "每次入栈同时保存截至当前位置的最小值；出栈时两个栈同步弹出。"
      }
    ],
    "pitfalls": [
      "每次入栈同时保存截至当前位置的最小值；出栈时两个栈同步弹出。"
    ],
    "complexity": "每个操作的时间复杂度为 O(1)。整体的空间复杂度为 O(n)，其中 n 为栈中元素的个数。"
  },
  {
    "id": "leetcode-394",
    "number": "394",
    "title": "字符串解码",
    "difficulty": "中等",
    "category": "栈",
    "tags": [
      "Hot 100",
      "栈",
      "递归",
      "字符串"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/decode-string/",
    "summary": "遇到左括号保存外层字符串和次数，遇到右括号完成一次展开，支持多层嵌套。",
    "statement": "给定一个经过编码的字符串，返回它解码后的字符串。 编码规则为: k[encoded_string]，表示其中方括号内部的 encoded_string 正好重复 k 次。注意 k 保证为正整数。 你可以认为输入字符串总是有效的；输入字符串中没有额外的空格，且输入的方括号总是符合格式要求的。 此外，你可以认为原始数据不包含数字，所有的数字只表示重复的次数 k ，例如不会出现像 3a 或 2[4] 的输入。 测试用例保证输出的长度不会超过 105。",
    "demo": "problems/hot100-394/index.html",
    "principles": [
      {
        "title": "双栈解码",
        "text": "解码 k[encoded] 嵌套重复串。括号匹配可用递归，也可用栈同时记下倍数与外层已拼串。"
      },
      {
        "title": "状态表示什么",
        "text": "s1 保存外层重复次数，s2 保存外层已解码部分；右括号触发一次合并。"
      },
      {
        "title": "为什么可以这样做",
        "text": "数字累入 num，遇 [ 把倍数与当前结果压栈并清空；遇 ] 弹出外层，把当前段重复后接回；字母直接追加。栈保证由内向外展开。"
      }
    ],
    "pitfalls": [
      "遇到左括号保存外层字符串和次数，遇到右括号完成一次展开，支持多层嵌套。"
    ],
    "complexity": "设输入长度为 n，展开结果长度为 L。字符串拼接与重复会复制字符，保守时间上界 O(n·L)，空间 O(n+L)，包含栈与构造中的字符串。"
  },
  {
    "id": "leetcode-739",
    "number": "739",
    "title": "每日温度",
    "difficulty": "中等",
    "category": "栈",
    "tags": [
      "Hot 100",
      "栈",
      "数组",
      "单调栈"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/daily-temperatures/",
    "summary": "栈保存尚未找到更高温度的下标；弹栈时用当前下标减去旧下标得到等待天数。",
    "statement": "给定一个整数数组 temperatures ，表示每天的温度，返回一个数组 answer ，其中 answer[i] 是指对于第 i 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 0 来代替。",
    "demo": "problems/hot100-739/index.html",
    "principles": [
      {
        "title": "单调栈",
        "text": "对每个位置求右侧下一个更高温度的距离。 n≤ 10^5，对每个下标向右扫描是 O(n^2)。"
      },
      {
        "title": "状态表示什么",
        "text": "从右向左扫描，栈顶保留最近的更高温度候选；不够热的候选先弹出。"
      },
      {
        "title": "为什么可以这样做",
        "text": "这是「右侧下一个更大元」：用单调栈保存尚未找到答案、温度递减的下标。从右往左扫时，弹出所有不大于当前温度的栈顶，新的栈顶即是下一个更暖的一天。 栈中下标对应温度从顶到底递增。每个下标进出一次，时间 O(n)。"
      }
    ],
    "pitfalls": [
      "栈保存尚未找到更高温度的下标；弹栈时用当前下标减去旧下标得到等待天数。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为数组 temperatures 的长度。"
  },
  {
    "id": "leetcode-84",
    "number": "84",
    "title": "柱状图中最大的矩形",
    "difficulty": "困难",
    "category": "栈",
    "tags": [
      "Hot 100",
      "栈",
      "数组",
      "单调栈",
      "区间最值查询"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/largest-rectangle-in-histogram/",
    "summary": "单调栈寻找每根柱子左右第一个更矮的位置；矩形宽度要排除左右边界本身。",
    "statement": "给定 n 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1 。 求在该柱状图中，能够勾勒出来的矩形的最大面积。",
    "demo": "problems/hot100-84/index.html",
    "principles": [
      {
        "title": "单调栈",
        "text": "若枚举左右边界 [l, r]，高度取区间最小值，面积为 (r - l + 1) × min，时间复杂度为 O(n^2)。 n ≤ 10^5，无法通过。"
      },
      {
        "title": "状态表示什么",
        "text": "left/right 是左右第一个更矮位置；宽度为 right−left−1，乘当前高度得到面积。"
      },
      {
        "title": "为什么可以这样做",
        "text": "可以改换枚举对象：以第 i 根柱作为矩形的最矮柱，宽度就是它向左右延伸到第一根更矮柱之间的距离。求每个位置「左右两侧最近的更小值」，适合用单调栈：栈中下标对应的高度单调递增，遇到更矮的柱便弹出，同时得到被弹柱的右边界，栈顶即为左边界。每根柱入栈、出栈各一次，线性即可扫完。"
      }
    ],
    "pitfalls": [
      "单调栈寻找每根柱子左右第一个更矮的位置；矩形宽度要排除左右边界本身。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 表示 heights 的长度。"
  },
  {
    "id": "leetcode-215",
    "number": "215",
    "title": "数组中的第K个最大元素",
    "difficulty": "中等",
    "category": "堆",
    "tags": [
      "Hot 100",
      "数组",
      "分治",
      "快速选择",
      "排序",
      "堆（优先队列）"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/kth-largest-element-in-an-array/",
    "summary": "快速选择只递归包含目标排名的半边；第 k 大要转换为升序下标 n−k。",
    "statement": "给定整数数组 nums 和整数 k，请返回数组中第 k 个最大的元素。 请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。 你必须设计并实现时间复杂度为 O(n) 的算法解决此问题。",
    "demo": "problems/hot100-215/index.html",
    "principles": [
      {
        "title": "快速选择",
        "text": "全排序后取第 k 大可行，但多做了对其余位置的排序。快速选择只关心第 k 大所在的那一侧。"
      },
      {
        "title": "状态表示什么",
        "text": "x 是分区基准；目标下标只在一个分区中，另一个分区无需递归。"
      },
      {
        "title": "为什么可以这样做",
        "text": "每次按基准划分后，仅递归包含目标名次的区间。实现上将第 k 大转为第 n-k 小。"
      }
    ],
    "pitfalls": [
      "快速选择只递归包含目标排名的半边；第 k 大要转换为升序下标 n−k。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "快速选择平均时间 O(n)，但当前使用确定的中点基准，最坏时间 O(n²)。递归栈平均 O(log n)，最坏 O(n)；不额外复制分区数组。"
  },
  {
    "id": "leetcode-347",
    "number": "347",
    "title": "前 K 个高频元素",
    "difficulty": "中等",
    "category": "堆",
    "tags": [
      "Hot 100",
      "数组",
      "哈希",
      "分治",
      "桶排序",
      "计数",
      "快速选择",
      "排序",
      "堆（优先队列）"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/top-k-frequent-elements/",
    "summary": "先统计频次，再用大小不超过 k 的小根堆保留最高频元素；返回顺序不限。",
    "statement": "给你一个整数数组 nums 和一个整数 k ，请你返回其中出现频率前 k 高的元素。你可以按 任意顺序 返回答案。",
    "demo": "problems/hot100-347/index.html",
    "principles": [
      {
        "title": "哈希表 + 优先队列（小根堆）",
        "text": "前 k 个高频元素。全排序为 O(n log n)。只需前 k，用频次堆或选择即可。"
      },
      {
        "title": "状态表示什么",
        "text": "cnt 统计频次；pq 里的元组为 [频次,数值]，超过 k 个就移除最小频次。"
      },
      {
        "title": "为什么可以这样做",
        "text": "先计数，再取频次最高的 k 个。Python 中 Counter.most_common(k) 即小根堆/堆选择，时间 O(n log k)。"
      }
    ],
    "pitfalls": [
      "先统计频次，再用大小不超过 k 的小根堆保留最高频元素；返回顺序不限。"
    ],
    "complexity": "时间 O(n + u log k)，额外空间 O(u + k)。u 是不同元素数量；使用频次表和大小至多 k 的小根堆。"
  },
  {
    "id": "leetcode-295",
    "number": "295",
    "title": "数据流的中位数",
    "difficulty": "困难",
    "category": "堆",
    "tags": [
      "Hot 100",
      "设计",
      "双指针",
      "数据流",
      "排序",
      "堆（优先队列）"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/find-median-from-data-stream/",
    "summary": "小根堆保存较大的一半，大根堆保存较小的一半；两堆大小相同或右半边多一个。",
    "statement": "中位数是有序整数列表中的中间值。如果列表的大小是偶数，则没有中间值，中位数是两个中间值的平均值。 例如 arr = [2,3,4] 的中位数是 3 。 例如 arr = [2,3] 的中位数是 (2 + 3) / 2 = 2.5 。 实现 MedianFinder 类: MedianFinder() 初始化 MedianFinder 对象。 void addNum(int num) 将数据流中的整数 num 添加到数据结构中。 double findMedian() 返回到目前为止所有元素的中位数。与实际答案相差 10-5 以内的答案将被接受。",
    "demo": "problems/hot100-295/index.html",
    "principles": [
      {
        "title": "大小根堆（优先队列）",
        "text": "动态求中位数若每次排序则过慢。用大根堆存较小一半、小根堆存较大一半，堆顶即可拼出中位数。"
      },
      {
        "title": "状态表示什么",
        "text": "minq 为较大的一半；Python 用相反数模拟 maxq 大根堆，图上保留代码中的真实负值。"
      },
      {
        "title": "为什么可以这样做",
        "text": "新元素先入大根堆再倒到小根堆，并保持小根堆大小至多大 1；偶数个取两顶平均，奇数个取小根堆顶。"
      }
    ],
    "pitfalls": [
      "小根堆保存较大的一半，大根堆保存较小的一半；两堆大小相同或右半边多一个。"
    ],
    "complexity": "addNum：O(log n)；findMedian：O(1)。两堆共保存 n 个元素，空间 O(n)。Python 使用相反数模拟大根堆，Java 使用倒序比较器。"
  },
  {
    "id": "leetcode-121",
    "number": "121",
    "title": "买卖股票的最佳时机",
    "difficulty": "简单",
    "category": "贪心算法",
    "tags": [
      "Hot 100",
      "数组",
      "动态规划"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/",
    "summary": "只使用此前的最低买入价更新利润；不能先卖出再买入，最低利润为 0。",
    "statement": "给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。 你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。 返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。",
    "demo": "problems/hot100-121/index.html",
    "principles": [
      {
        "title": "枚举 + 维护前缀最小值",
        "text": "只能买卖一次，枚举所有买入卖出下标对是 O(n^2)； n 可达 10^5。对固定卖出日，最优买入价是它之前的最低价。扫描时维护前缀最小值，用当天价格减它更新答案，再把当天纳入前缀最小。"
      },
      {
        "title": "状态表示什么",
        "text": "mi 是截至当前的最低价格，ans 是最大利润；先更新利润，再记录最低价。"
      },
      {
        "title": "为什么可以这样做",
        "text": "只使用此前的最低买入价更新利润；不能先卖出再买入，最低利润为 0。"
      }
    ],
    "pitfalls": [
      "只使用此前的最低买入价更新利润；不能先卖出再买入，最低利润为 0。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是数组 nums 的长度。"
  },
  {
    "id": "leetcode-55",
    "number": "55",
    "title": "跳跃游戏",
    "difficulty": "中等",
    "category": "贪心算法",
    "tags": [
      "Hot 100",
      "贪心",
      "数组",
      "动态规划"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/jump-game/",
    "summary": "维护已能到达的最远位置；当前位置已超过最远位置时就无法继续。",
    "statement": "给你一个非负整数数组 nums ，你最初位于数组的 第一个下标 。数组中的每个元素代表你在该位置可以跳跃的最大长度。 判断你是否能够到达最后一个下标，如果可以，返回 true ；否则，返回 false 。",
    "demo": "problems/hot100-55/index.html",
    "principles": [
      {
        "title": "贪心",
        "text": "题目只关心最后一个下标是否可达。从每个位置展开全部跳跃，或用动态规划判断每个下标能否到达，最坏时间均为 O(n^2)。 n ≤ 10^4 偏紧，且不必记下中间每一步如何跳。"
      },
      {
        "title": "状态表示什么",
        "text": "[0,mx] 是当前能到达的范围；只有已到达的位置能扩展 mx。"
      },
      {
        "title": "为什么可以这样做",
        "text": "能到达的下标构成一段前缀：维护当前最远可达位置 mx，若出现 i > mx，则之后均不可达。 因此从左扫描，用 i + nums[i] 更新 mx；若能扫完全部下标，终点即可达。"
      }
    ],
    "pitfalls": [
      "维护已能到达的最远位置；当前位置已超过最远位置时就无法继续。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 为数组的长度。"
  },
  {
    "id": "leetcode-45",
    "number": "45",
    "title": "跳跃游戏 II",
    "difficulty": "中等",
    "category": "贪心算法",
    "tags": [
      "Hot 100",
      "贪心",
      "数组",
      "动态规划"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/jump-game-ii/",
    "summary": "当前可达区间结束时才增加一次跳跃，同时用区间中所有位置更新下一跳边界。",
    "statement": "给定一个长度为 n 的 0 索引整数数组 nums。初始位置在下标 0。 每个元素 nums[i] 表示从索引 i 向后跳转的最大长度。换句话说，如果你在索引 i 处，你可以跳转到任意 (i + j) 处： 0 <= j <= nums[i] 且 i + j < n 返回到达 n - 1 的最小跳跃次数。测试用例保证可以到达 n - 1。",
    "demo": "problems/hot100-45/index.html",
    "principles": [
      {
        "title": "贪心",
        "text": "若令 f[i] 为到达下标 i 的最少跳跃次数，再从每个 i 去更新其一步可达的区间，最坏时间 O(n^2)。 n ≤ 10^4，且题目保证可达终点，我们只需终点的最少次数，不必为每个下标都算出精确步数。"
      },
      {
        "title": "状态表示什么",
        "text": "last 是本次跳跃边界，mx 是下一次最远边界；走到 last 才计一次跳跃。"
      },
      {
        "title": "为什么可以这样做",
        "text": "第 k 步能覆盖的位置构成一段连续区间，该段内能探到的最远位置，就是第 k+1 步的覆盖右端。维护「当前这一跳的边界」即可按层扩展。 因此线性扫描时记录下一跳能到的最远位置；走到当前边界就不得不跳一次，并把边界更新为该最远位置。按层贪心等价于 BFS，却不必使用队列。"
      }
    ],
    "pitfalls": [
      "当前可达区间结束时才增加一次跳跃，同时用区间中所有位置更新下一跳边界。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是数组的长度。"
  },
  {
    "id": "leetcode-763",
    "number": "763",
    "title": "划分字母区间",
    "difficulty": "中等",
    "category": "贪心算法",
    "tags": [
      "Hot 100",
      "贪心",
      "哈希",
      "双指针",
      "字符串"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/partition-labels/",
    "summary": "片段右边界取其中每个字母最后出现位置的最大值；到达边界才能切割。",
    "statement": "给你一个字符串 s 。我们要把这个字符串划分为尽可能多的片段，同一字母最多出现在一个片段中。例如，字符串 \"ababcc\" 能够被分为 [\"abab\", \"cc\"]，但类似 [\"aba\", \"bcc\"] 或 [\"ab\", \"ab\", \"cc\"] 的划分是非法的。 注意，划分结果需要满足：将所有划分结果按顺序连接，得到的字符串仍然是 s 。 返回一个表示每个字符串片段的长度的列表。",
    "demo": "problems/hot100-763/index.html",
    "principles": [
      {
        "title": "贪心",
        "text": "要把串切成尽量多的段，使每段字母不在其他段出现。长度 500，关键是每个字母的最后出现位置决定它必须被圈进哪一段。"
      },
      {
        "title": "状态表示什么",
        "text": "last 给出每个字母的末次位置；当前片段必须覆盖这些末次位置的最大值。"
      },
      {
        "title": "为什么可以这样做",
        "text": "从左扫描并维护当前段必须覆盖到的最右下标：每见到一个字母就用它的末次位置扩大右端。走到该右端才能安全切开。"
      }
    ],
    "pitfalls": [
      "片段右边界取其中每个字母最后出现位置的最大值；到达边界才能切割。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(|Sigma|)。其中 n 为字符串 s 的长度，而 |Sigma| 为字符集的大小。本题中 |Sigma| = 26。"
  },
  {
    "id": "leetcode-70",
    "number": "70",
    "title": "爬楼梯",
    "difficulty": "简单",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "记忆化",
      "数学",
      "动态规划"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/climbing-stairs/",
    "summary": "最后一步只可能来自前一阶或前两阶；滚动变量更新时要保存旧值。",
    "statement": "假设你正在爬楼梯。需要 n 阶你才能到达楼顶。 每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？",
    "demo": "problems/hot100-70/index.html",
    "principles": [
      {
        "title": "递推",
        "text": "到达第 n 阶的最后一步只能是爬 1 阶或 2 阶，因此方案数满足 f(n) = f(n-1) + f(n-2)。若直接按此递归， n ≤ 45 时同一子问题会被反复展开，时间无法接受。"
      },
      {
        "title": "状态表示什么",
        "text": "a、b 保存相邻两个台阶的方案数；用旧 a+b 更新下一项。"
      },
      {
        "title": "为什么可以这样做",
        "text": "这与斐波那契数列相同，自底向上递推即可避免重复计算。 f[i] 只依赖于前两项，用两个变量滚动维护，即可在 O(n) 时间、 O(1) 额外空间内得到答案。"
      }
    ],
    "pitfalls": [
      "最后一步只可能来自前一阶或前两阶；滚动变量更新时要保存旧值。"
    ],
    "complexity": "由于 f[i] 只与 f[i - 1] 和 f[i - 2] 有关，因此我们可以只用两个变量 a 和 b 来维护当前的方法数，空间复杂度降低为 O(1)。 时间复杂度 O(n)，空间复杂度 O(1)。"
  },
  {
    "id": "leetcode-118",
    "number": "118",
    "title": "杨辉三角",
    "difficulty": "简单",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "数组",
      "动态规划"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/pascals-triangle/",
    "summary": "每行两端为 1，中间每个数来自上一行相邻两项之和。",
    "statement": "给定一个非负整数 numRows，生成「杨辉三角」的前 numRows 行。 在「杨辉三角」中，每个数是它左上方和右上方的数的和。",
    "demo": "problems/hot100-118/index.html",
    "principles": [
      {
        "title": "模拟",
        "text": "第 i 行由上一行相邻两项相加得到，两端为 1。 numRows≤ 30，按行模拟即可。每一行只依赖上一行，依次生成并保存。"
      },
      {
        "title": "状态表示什么",
        "text": "f 保存已生成的行；g 的两端为 1，中间来自上一行的相邻项。"
      },
      {
        "title": "为什么可以这样做",
        "text": "每行两端为 1，中间每个数来自上一行相邻两项之和。"
      }
    ],
    "pitfalls": [
      "每行两端为 1，中间每个数来自上一行相邻两项之和。"
    ],
    "complexity": "时间 O(n²)，返回的前 n 行共占 O(n²) 空间；正在构造的行会直接加入结果，除返回结构外只需 O(1) 辅助变量。"
  },
  {
    "id": "leetcode-279",
    "number": "279",
    "title": "完全平方数",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "BFS",
      "数学",
      "动态规划",
      "背包问题",
      "完全背包"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/perfect-squares/",
    "summary": "状态表示使用前 i 种平方数凑成 j 的最少数量；可重复取，因此转移使用当前行。",
    "statement": "给你一个整数 n ，返回 和为 n 的完全平方数的最少数量 。 完全平方数 是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数自乘的积。例如，1、4、9 和 16 都是完全平方数，而 3 和 11 不是。",
    "demo": "problems/hot100-279/index.html",
    "principles": [
      {
        "title": "动态规划(完全背包)",
        "text": "完全平方数可重复使用，求组成 n 的最少个数，即完全背包。物品为 1^2,ldots,m^2（ m=lfloor√{n}rfloor）。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i][j]：使用前 i 种平方数凑出 j 的最少个数。∞ 表示暂时无法凑出。"
      },
      {
        "title": "为什么可以这样做",
        "text": "f[i][j] 表示用前 i 种平方数凑 j 的最少个数，转移为不选或再加一个 i^2。"
      }
    ],
    "pitfalls": [
      "状态表示使用前 i 种平方数凑成 j 的最少数量；可重复取，因此转移使用当前行。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 为 sqrt(n) 的整数部分。"
  },
  {
    "id": "leetcode-322",
    "number": "322",
    "title": "零钱兑换",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "BFS",
      "数组",
      "动态规划",
      "背包问题",
      "完全背包"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/coin-change/",
    "summary": "硬币可以重复使用；不可达状态不能当作零，金额为 0 的最少硬币数是 0。",
    "statement": "给你一个整数数组 coins ，表示不同面额的硬币；以及一个整数 amount，表示总金额。 计算并返回可以凑成总金额所需的 最少 的硬币个数。如果没有任何一种硬币组合能组成总金额，返回 -1 。 你可以认为每种硬币的数量是无限的。",
    "demo": "problems/hot100-322/index.html",
    "principles": [
      {
        "title": "动态规划(完全背包)",
        "text": "每种硬币可用任意多次，求凑出 amount 的最少枚数。完全背包：物品为硬币、容量为金额。若 DFS 搜索组合，金额较大时重复子问题多。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i][j]：用前 i 种硬币凑出金额 j 的最少枚数；可重复取，因此从当前行转移。"
      },
      {
        "title": "为什么可以这样做",
        "text": "定义 f[i][j] 为用前 i 种硬币凑 j 的最少枚数。不选第 i 种则继承 f[i-1][j]；若 j≥ x 则可从 f[i][j-x] 再加一枚。 f[0][0]=0，其余为无穷，无法凑出返回 -1。"
      }
    ],
    "pitfalls": [
      "硬币可以重复使用；不可达状态不能当作零，金额为 0 的最少硬币数是 0。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 和 n 分别为硬币的种类数和总金额。"
  },
  {
    "id": "leetcode-139",
    "number": "139",
    "title": "单词拆分",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "字典树",
      "记忆化",
      "数组",
      "哈希",
      "字符串",
      "动态规划",
      "Brute-Force Search"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/word-break/",
    "summary": "f[i] 表示前 i 个字符能否拆分；只有前缀可拆且后段在词典中时才转移。",
    "statement": "给你一个字符串 s 和一个字符串列表 wordDict 作为字典。如果可以利用字典中出现的一个或多个单词拼接出 s 则返回 true。 注意：不要求字典中出现的单词全部都使用，并且字典中的单词可以重复使用。",
    "demo": "problems/hot100-139/index.html",
    "principles": [
      {
        "title": "哈希表 + 动态规划",
        "text": "判断 s 能否拆成词典中的词。 |s|≤ 300，回溯所有切分会重复计算同一后缀。 f[i] 表示前缀 s[0..i) 能否拆分：枚举切点 j，若 f[j] 为真且 s[j..i) 在词典中则成功。词典放进哈希集合，判断子串是否成词为期望 O(1)。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i] 表示 s 的前 i 个字符可拆分；检查更短可达前缀与后面的词典单词。"
      },
      {
        "title": "为什么可以这样做",
        "text": "f[i] 表示前 i 个字符能否拆分；只有前缀可拆且后段在词典中时才转移。"
      }
    ],
    "pitfalls": [
      "f[i] 表示前 i 个字符能否拆分；只有前缀可拆且后段在词典中时才转移。"
    ],
    "complexity": "时间最坏 O(n³)，包括截取子串与计算哈希的代价。DP 表 O(n)，词典集合额外保存 O(词典总大小) 的数据或引用。"
  },
  {
    "id": "leetcode-152",
    "number": "152",
    "title": "乘积最大子数组",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "数组",
      "动态规划"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/maximum-product-subarray/",
    "summary": "负数会交换最大和最小乘积的作用；更新两个状态前先保存旧值。",
    "statement": "给你一个整数数组 nums ，请你找出数组中乘积最大的非空连续 子数组（该子数组中至少包含一个数字），并返回该子数组所对应的乘积。 测试用例的答案是一个 32-位 整数。 请注意，一个只包含一个元素的数组的乘积是这个元素的值。",
    "demo": "problems/hot100-152/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "最大子数组和可以用 Kadane，乘积则不同：负数会让最大变最小、最小变最大，零会切断。 n≤ 2× 10^4。同时维护以当前位置结尾的最大与最小乘积，新数乘上两者或单独成段，三者取最大/最小。答案是扫描过程中最大乘积的最大值。"
      },
      {
        "title": "状态表示什么",
        "text": "f、g 分别是以当前位置结尾的最大、最小乘积；ff、gg 保存更新前状态。"
      },
      {
        "title": "为什么可以这样做",
        "text": "负数会交换最大和最小乘积的作用；更新两个状态前先保存旧值。"
      }
    ],
    "pitfalls": [
      "负数会交换最大和最小乘积的作用；更新两个状态前先保存旧值。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是数组 nums 的长度。我们只需要遍历数组一次即可求得答案。"
  },
  {
    "id": "leetcode-416",
    "number": "416",
    "title": "分割等和子集",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "数组",
      "动态规划",
      "背包问题",
      "0-1 背包"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/partition-equal-subset-sum/",
    "summary": "总和为奇数直接失败；每个数只能选一次，转移从上一行读取。",
    "statement": "给你一个 只包含正整数 的 非空 数组 nums 。请你判断是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。",
    "demo": "problems/hot100-416/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "等和划分即能否选出一个子集，其和为总和的一半。总和为奇数则不可能。子集枚举在 n≤ 200 时不可行。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i][j]：前 i 个数能否组成和 j；转移只读取上一行，每个数最多使用一次。"
      },
      {
        "title": "为什么可以这样做",
        "text": "这是容量为 m=s/2 的 0-1 背包：令 f[i][j] 表示前 i 个数能否凑出 j，转移为选或不选 x。 n 与 m 的乘积可接受。 先判奇偶再填表，空集对应 f[0][0]=true，保证转移有起点。"
      }
    ],
    "pitfalls": [
      "总和为奇数直接失败；每个数只能选一次，转移从上一行读取。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 和 n 分别为数组的总和的一半和数组的长度。"
  },
  {
    "id": "leetcode-32",
    "number": "32",
    "title": "最长有效括号",
    "difficulty": "困难",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "栈",
      "字符串",
      "动态规划",
      "括号序列"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/longest-valid-parentheses/",
    "summary": "以当前位置结尾的合法长度依赖匹配到的左括号及它之前的合法段。",
    "statement": "给你一个只包含 '(' 和 ')' 的字符串，找出最长有效（格式正确且连续）括号 子串 的长度。 左右括号匹配，即每个左括号都有对应的右括号将其闭合的字符串是格式正确的，比如 \"(()())\"。",
    "demo": "problems/hot100-32/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "枚举每个子串再用栈判定是否有效，时间复杂度为 O(n^2) 乃至 O(n^3)。 n ≤ 3 × 10^4，无法通过。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i] 是以前 i 个字符中的第 i 个字符结尾的最长合法长度；j 定位待匹配左括号。"
      },
      {
        "title": "为什么可以这样做",
        "text": "大量子串互相重叠：以某一位置结尾的最长有效括号，可以由更短的有效段拼接得到。因此可以按结尾位置递推。 有效括号串只能以右括号结尾。若 s[i-1] 与前一位配成一对，长度即为再往前那段加上 2；若前一位也是右括号，则先跨过已经配好的一段，再判断这段之前是否还能配上一个左括号。我们可以定义 f[i] 为以 s[i-1] 结尾的最长有效长度，按上述两种配对方式转移，答案取 max f[i]。"
      }
    ],
    "pitfalls": [
      "以当前位置结尾的合法长度依赖匹配到的左括号及它之前的合法段。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(n)。其中 n 为字符串的长度。"
  },
  {
    "id": "leetcode-62",
    "number": "62",
    "title": "不同路径",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "数学",
      "动态规划",
      "组合数学"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/unique-paths/",
    "summary": "只能向右或向下，每格路径数等于上方与左方之和；首行首列是边界。",
    "statement": "一个机器人位于一个 m x n 网格的左上角 （起始点在下图中标记为 “Start” ）。 机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish” ）。 问总共有多少条不同的路径？",
    "demo": "problems/hot100-62/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "机器人每步只能向右或向下。若从起点直接搜索全部路径，格点规模 m, n ≤ 100，路径条数可达组合数级别，同一格子会被反复走到，时间无法接受。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i][j]：到格子 (i,j) 的不同路径数；来自上方与左方两个方向。"
      },
      {
        "title": "为什么可以这样做",
        "text": "注意到到达 (i, j) 的路径只可能来自上方或左方，且两类来源互不重叠。因此可以用 f[i][j] 记录走到该格的方案数，按行列顺序填表，保证转移所依赖的状态已经计算完毕。"
      }
    ],
    "pitfalls": [
      "只能向右或向下，每格路径数等于上方与左方之和；首行首列是边界。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 和 n 分别是网格的行数和列数。"
  },
  {
    "id": "leetcode-64",
    "number": "64",
    "title": "最小路径和",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "数组",
      "动态规划",
      "矩阵"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/minimum-path-sum/",
    "summary": "每格最小和等于当前值加上方、左方的较小值；不能把不存在的路径当作零。",
    "statement": "给定一个包含非负整数的 m x n 网格 grid ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。 说明：每次只能向下或者向右移动一步。",
    "demo": "problems/hot100-64/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "从左上走到右下、每步只能向右或向下时，若枚举全部路径再取数字和最小者， m, n ≤ 200，路径条数随格子增长而迅速增加，无法在时限内完成。同一格子会被多条路径反复走到，子问题大量重叠。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i][j]：从左上角走到 (i,j) 的最小累计和；边界只允许一个方向进入。"
      },
      {
        "title": "为什么可以这样做",
        "text": "因此走到 (i, j) 的最小路径和，必来自其上方或左方的最优值再加上当前格。用 f[i][j] 记录该值，边界沿唯一方向累加，内部取两侧最小值，按行填表即可。"
      }
    ],
    "pitfalls": [
      "每格最小和等于当前值加上方、左方的较小值；不能把不存在的路径当作零。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 和 n 分别是网格的行数和列数。"
  },
  {
    "id": "leetcode-5",
    "number": "5",
    "title": "最长回文子串",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "双指针",
      "字符串",
      "动态规划",
      "Manacher 算法"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/longest-palindromic-substring/",
    "summary": "区间两端相等且内部回文时才是回文；长度 1、2 的区间需要单独处理。",
    "statement": "给你一个字符串 s，找到 s 中最长的 回文 子串。",
    "demo": "problems/hot100-5/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "若枚举所有子串 s[i..j] 再逐一判断是否回文，时间复杂度为 O(n^3)。 n ≤ 10^3，无法通过。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i][j] 表示闭区间 s[i:j+1] 是否回文；从短区间的已知结果向外扩展。"
      },
      {
        "title": "为什么可以这样做",
        "text": "每个子串若都从两端重新比较，内层更短的区间会被反复判断。回文具有最优子结构： s[i..j] 为回文，当且仅当两端字符相同且 s[i+1..j-1] 已是回文；长度为 1 的区间显然成立。 因此可以按区间依赖填表，而不必反复扫描。 f[i][j] 依赖于更短的内层，枚举顺序须保证内层先算完；填表过程中记录当前最长回文的起点与长度即可。"
      }
    ],
    "pitfalls": [
      "区间两端相等且内部回文时才是回文；长度 1、2 的区间需要单独处理。"
    ],
    "complexity": "时间复杂度 O(n^2)，空间复杂度 O(n^2)。其中 n 是字符串 s 的长度。"
  },
  {
    "id": "leetcode-72",
    "number": "72",
    "title": "编辑距离",
    "difficulty": "中等",
    "category": "动态规划",
    "tags": [
      "Hot 100",
      "字符串",
      "动态规划"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/edit-distance/",
    "summary": "增、删、替换分别来自三个相邻状态；一边为空时需要另一边长度次操作。",
    "statement": "给你两个单词 word1 和 word2， 请返回将 word1 转换成 word2 所使用的最少操作数 。 你可以对一个单词进行如下三种操作： 插入一个字符 删除一个字符 替换一个字符",
    "demo": "problems/hot100-72/index.html",
    "principles": [
      {
        "title": "动态规划",
        "text": "把 word1 变成 word2，每次只能插入、删除或替换一个字符。若在每个位置尝试三种操作并递归处理剩余部分，同一对前缀会被不同路径反复求解， m, n ≤ 500 时时间无法接受。"
      },
      {
        "title": "状态表示什么",
        "text": "f[i][j]：word1 前 i 个字符变成 word2 前 j 个字符的最少编辑次数。"
      },
      {
        "title": "为什么可以这样做",
        "text": "同一对前缀的最少操作数与到达路径无关，因此可以按前缀长度递推。定义 f[i][j] 为将 word1 前 i 个字符变成 word2 前 j 个字符的最少操作数：末尾字符相同则无需改动；否则三种操作分别对应删除、插入与替换，取最小值即可。空串到另一串只能全部删除或全部插入。按 i、 j 递增填表， f[m][n] 即为答案。"
      }
    ],
    "pitfalls": [
      "增、删、替换分别来自三个相邻状态；一边为空时需要另一边长度次操作。"
    ],
    "complexity": "时间复杂度 O(mn)，空间复杂度 O(mn)。其中 m 和 n 分别是 word1 和 word2 的长度。"
  },
  {
    "id": "leetcode-136",
    "number": "136",
    "title": "只出现一次的数字",
    "difficulty": "简单",
    "category": "数组",
    "tags": [
      "Hot 100",
      "位运算",
      "数组"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/single-number/",
    "summary": "相同数字异或抵消，0 与任何数字异或不变；负数也适用。",
    "statement": "给你一个 非空 整数数组 nums ，除了某个元素只出现一次以外，其余每个元素均出现两次。找出那个只出现了一次的元素。 你必须设计并实现线性时间复杂度的算法来解决此问题，且该算法只使用常量额外空间。",
    "demo": "problems/hot100-136/index.html",
    "principles": [
      {
        "title": "位运算",
        "text": "其余数出现两次、一个出现一次，要求线性时间、常数空间。哈希计数空间是 O(n)。异或满足 xoplus x=0、 xoplus 0=x 且可交换，全部异或后成对的数消掉，剩下即只出现一次的那个。"
      },
      {
        "title": "状态表示什么",
        "text": "ans 是已扫描前缀的异或值；重复成对数字互相抵消。"
      },
      {
        "title": "为什么可以这样做",
        "text": "相同数字异或抵消，0 与任何数字异或不变；负数也适用。"
      }
    ],
    "pitfalls": [
      "相同数字异或抵消，0 与任何数字异或不变；负数也适用。"
    ],
    "complexity": "时间 O(n)，额外空间 O(1)。"
  },
  {
    "id": "leetcode-169",
    "number": "169",
    "title": "多数元素",
    "difficulty": "简单",
    "category": "数组",
    "tags": [
      "Hot 100",
      "数组",
      "哈希",
      "分治",
      "计数",
      "排序",
      "摩尔投票算法"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/majority-element/",
    "summary": "相同候选增加票数，不同候选抵消；题目保证多数元素存在。",
    "statement": "给定一个大小为 n 的数组 nums ，返回其中的多数元素。多数元素是指在数组中出现次数 大于 ⌊ n/2 ⌋ 的元素。 你可以假设数组是非空的，并且给定的数组总是存在多数元素。",
    "demo": "problems/hot100-169/index.html",
    "principles": [
      {
        "title": "摩尔投票法",
        "text": "多数元素出现次数超过 lfloor n/2rfloor，题目保证存在。哈希计数或排序都能做，进阶要 O(n) 时间、 O(1) 空间。 n≤ 5× 10^4。"
      },
      {
        "title": "状态表示什么",
        "text": "m 是当前候选，cnt 是抵消后的票数；票数归零后换新候选。"
      },
      {
        "title": "为什么可以这样做",
        "text": "摩尔投票把不同元素两两抵消：计数器归零就换候选人。多数元素无法被完全抵消，一趟结束后的候选人即答案，无需第二趟确认。"
      }
    ],
    "pitfalls": [
      "相同候选增加票数，不同候选抵消；题目保证多数元素存在。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是数组 nums 的长度。"
  },
  {
    "id": "leetcode-75",
    "number": "75",
    "title": "颜色分类",
    "difficulty": "中等",
    "category": "数组",
    "tags": [
      "Hot 100",
      "数组",
      "双指针",
      "冒泡排序",
      "排序",
      "快速排序"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/sort-colors/",
    "summary": "交换到右侧的 2 后不能立即推进扫描指针，因为换回来的数尚未检查。",
    "statement": "给定一个包含红色、白色和蓝色、共 n 个元素的数组 nums ，原地 对它们进行排序，使得相同颜色的元素相邻，并按照红色、白色、蓝色顺序排列。 我们使用整数 0、 1 和 2 分别表示红色、白色和蓝色。 必须在不使用库内置的 sort 函数的情况下解决这个问题。",
    "demo": "problems/hot100-75/index.html",
    "principles": [
      {
        "title": "三指针",
        "text": "统计 0、 1、 2 的个数再覆写需要两趟扫描；直接排序也能得到结果， n ≤ 300 时间足够。题目不允许使用库函数排序，进阶还要求一趟扫描且仅用常数额外空间。"
      },
      {
        "title": "状态表示什么",
        "text": "[0,i] 是 0 区，[i+1,k) 是 1 区，[j,n) 是 2 区；[k,j) 尚未检查。"
      },
      {
        "title": "为什么可以这样做",
        "text": "数组中只有三个取值，需要划分成「全 0 / 全 1 / 全 2」三段。为此用 i、 j 分别框住已经归位的 0 与 2， k 扫描未知区间。与 2 交换时，换回来的元素尚未考察，因此 k 不能前进；与 0 交换时，换回来的元素来自已扫描区间，因此 k 可以同步右移。一遍结束后三段自然有序。"
      }
    ],
    "pitfalls": [
      "交换到右侧的 2 后不能立即推进扫描指针，因为换回来的数尚未检查。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 是数组的长度。只需要遍历一遍数组即可。"
  },
  {
    "id": "leetcode-31",
    "number": "31",
    "title": "下一个排列",
    "difficulty": "中等",
    "category": "数组",
    "tags": [
      "Hot 100",
      "数组",
      "双指针"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/next-permutation/",
    "summary": "从右找到首个上升位置，换成刚好更大的数，再把后缀反转为最小顺序。",
    "statement": "整数数组的一个 排列 就是将其所有成员以序列或线性顺序排列。 例如，arr = [1,2,3] ，以下这些都可以视作 arr 的排列：[1,2,3]、[1,3,2]、[3,1,2]、[2,3,1] 。 整数数组的 下一个排列 是指其整数的下一个字典序更大的排列。更正式地，如果数组的所有排列根据其字典顺序从小到大排列在一个容器中，那么数组的 下一个排列 就是在这个有序容器中排在它后面的那个排列。如果不存在下一个更大的排列，那么这个数组必须重排为字典序最小的排列（即，其元素按升序排列）。 例如，arr = [1,2,3] 的下一个排列是 [1,3,2] 。 类似地，arr = [2,3,1] 的下一个排列是 [3,1,2] 。 而 arr = [3,2,1] 的下一个排列是 [1,2,3] ，因为 [3,2,1] 不存在一个字典序更大的排列。 给你一个整数数组 nums ，找出 nums 的下一个排列。 必须 原地 修改，只允许使用额外常数空间。",
    "demo": "problems/hot100-31/index.html",
    "principles": [
      {
        "title": "两次遍历",
        "text": "若生成全部排列再取当前序列的后继，时间复杂度为 O(n!)。 n ≤ 100，无法通过，且题目要求原地修改、仅使用常数额外空间。"
      },
      {
        "title": "状态表示什么",
        "text": "i 是最右侧可提升位置；交换后把右侧后缀变成递增，得到刚好更大的排列。"
      },
      {
        "title": "为什么可以这样做",
        "text": "我们并不需要全集，只需字典序中紧邻的下一个。下一个排列必须严格大于当前序列，且改动应尽量靠右、幅度尽量小。 注意到，最长降序后缀已经是该段能排出的最大形态；它左侧的 nums[i] 才是需要抬高的枢轴。后缀里刚好比 nums[i] 大的数位于最右侧，交换后再将后缀翻成升序，改动便落在最右边。若整段均为降序，则不存在更大的排列，反转即回到最小排列。"
      }
    ],
    "pitfalls": [
      "从右找到首个上升位置，换成刚好更大的数，再把后缀反转为最小顺序。",
      "此实现会改变输入数组、网格或节点连接。对照多种方法时要先复制原始输入；演示中的回退由独立快照实现。"
    ],
    "complexity": "时间复杂度 O(n)，空间复杂度 O(1)。其中 n 为数组的长度。"
  },
  {
    "id": "leetcode-287",
    "number": "287",
    "title": "寻找重复数",
    "difficulty": "中等",
    "category": "数组",
    "tags": [
      "Hot 100",
      "位运算",
      "数组",
      "双指针",
      "二分查找",
      "Floyd 判圈算法",
      "抽屉原理"
    ],
    "addedAt": "2026-11-03",
    "source": "https://leetcode.cn/problems/find-the-duplicate-number/",
    "summary": "若不大于 mid 的元素多于 mid 个，重复值必在低半区；二分的是值域而非下标。",
    "statement": "给定一个包含 n + 1 个整数的数组 nums ，其数字都在 [1, n] 范围内（包括 1 和 n），可知至少存在一个重复的整数。 假设 nums 只有 一个重复的整数 ，返回 这个重复的数 。 你设计的解决方案必须 不修改 数组 nums 且只用常量级 O(1) 的额外空间。",
    "demo": "problems/hot100-287/index.html",
    "principles": [
      {
        "title": "二分查找",
        "text": "不能改数组且只用常数空间，排序或哈希都不符合。抽屉原理： [1,x] 中若出现次数大于 x，则重复值落在该段。"
      },
      {
        "title": "状态表示什么",
        "text": "候选值域是 [l,r]；cnt 统计不大于 mid 的个数，用抽屉原理决定保留哪一半。"
      },
      {
        "title": "为什么可以这样做",
        "text": "对值域二分，统计 ≤ mid 的个数，大于 mid 则答案在左侧，否则在右侧。"
      }
    ],
    "pitfalls": [
      "若不大于 mid 的元素多于 mid 个，重复值必在低半区；二分的是值域而非下标。"
    ],
    "complexity": "时间 O(n log n)，额外空间 O(1)。每次值域二分遍历数组统计数量。"
  }
]);
for (const problem of window.PROBLEMS) {
  if (["leetcode-1", "leetcode-49", "leetcode-128", "leetcode-283", "leetcode-11", "leetcode-15", "leetcode-42", "leetcode-3", "leetcode-438", "leetcode-560", "leetcode-239", "leetcode-76", "leetcode-53", "leetcode-56", "leetcode-189", "leetcode-238", "leetcode-41", "leetcode-73", "leetcode-54", "leetcode-48", "leetcode-240", "leetcode-160", "leetcode-206", "leetcode-234", "leetcode-141", "leetcode-142", "leetcode-21", "leetcode-2", "leetcode-19", "leetcode-24", "leetcode-25", "leetcode-138", "leetcode-148", "leetcode-23", "leetcode-146", "leetcode-94", "leetcode-104", "leetcode-226", "leetcode-101", "leetcode-543", "leetcode-102", "leetcode-108", "leetcode-98", "leetcode-230", "leetcode-199", "leetcode-114", "leetcode-105", "leetcode-437", "leetcode-236", "leetcode-124", "leetcode-200", "leetcode-994", "leetcode-207", "leetcode-208", "leetcode-46", "leetcode-78", "leetcode-17", "leetcode-39", "leetcode-22", "leetcode-79", "leetcode-131", "leetcode-51", "leetcode-35", "leetcode-74", "leetcode-34", "leetcode-33", "leetcode-153", "leetcode-4", "leetcode-20", "leetcode-155", "leetcode-394", "leetcode-739", "leetcode-84", "leetcode-215", "leetcode-347", "leetcode-295", "leetcode-121", "leetcode-55", "leetcode-45", "leetcode-763", "leetcode-70", "leetcode-118", "leetcode-198", "leetcode-279", "leetcode-322", "leetcode-139", "leetcode-300", "leetcode-152", "leetcode-416", "leetcode-32", "leetcode-62", "leetcode-64", "leetcode-5", "leetcode-1143", "leetcode-72", "leetcode-136", "leetcode-169", "leetcode-75", "leetcode-31", "leetcode-287"].includes(problem.id) && !problem.tags.includes("Hot 100")) problem.tags.push("Hot 100");
}
