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
}];
