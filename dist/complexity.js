(() => {
  "use strict";
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  const describe = (value) =>
    `<strong class="complexity-bound">${escape(value.bound)}</strong><p class="complexity-when">${escape(value.when)}</p><p class="complexity-why">${escape(value.why)}</p>`;
  function row(name, best, worst) {
    return `<tr><th scope="row">${escape(name)}</th><td data-label="最好情况">${describe(best)}</td><td data-label="最坏情况">${describe(worst)}</td></tr>`;
  }
  function render(id) {
    const profile = window.COMPLEXITY_ANALYSIS?.[id];
    if (!profile)
      return '<section class="panel"><h2>复杂度分析</h2><p>这道题的复杂度分析暂未补充。</p></section>';
    const spaceLabel = profile.spaceLabel || "辅助空间";
    return `<section class="panel complexity-panel" id="complexityPanel" tabindex="-1" aria-labelledby="complexityHeading">
      <div class="complexity-head"><div><div class="eyebrow">UNDERSTAND THE COST</div><h2 id="complexityHeading">复杂度分析</h2></div><span class="complexity-badge">当前展示的解法</span></div>
      <p class="complexity-algorithm">${escape(profile.algorithm)}</p>
      <div class="complexity-overview"><div><span>最坏时间</span><strong>${escape(profile.time.worst.bound)}</strong></div><div><span>最坏${escape(spaceLabel)}</span><strong>${escape(profile.space.worst.bound)}</strong></div></div>
      <details id="complexityDetails"><summary>展开最好 / 最坏情形与原因</summary>
        <p class="complexity-parameters">${escape(profile.parameters)}</p>
        <table class="complexity-table"><caption>同一实现的时间与空间对比</caption><thead><tr><th scope="col">分析维度</th><th scope="col">最好情况</th><th scope="col">最坏情况</th></tr></thead><tbody>${row("时间", profile.time.best, profile.time.worst)}${row(spaceLabel, profile.space.best, profile.space.worst)}</tbody></table>
        ${profile.operations?.length ? `<h3>分别看每个操作</h3><table class="complexity-table complexity-operations"><caption>单次操作的最好与最坏情况</caption><thead><tr><th scope="col">操作</th><th scope="col">最好情况</th><th scope="col">最坏情况</th></tr></thead><tbody>${profile.operations.map((operation) => row(operation.name, operation.best, operation.worst)).join("")}</tbody></table>` : ""}
        <div class="complexity-output"><h3>返回结果占多少空间？</h3><p>${escape(profile.output)}</p></div>
        ${profile.hash ? `<p class="complexity-note"><strong>哈希假设：</strong>${escape(profile.hash)}</p>` : ""}
        ${profile.notes?.length ? `<ul class="complexity-notes">${profile.notes.map((note) => `<li>${escape(note)}</li>`).join("")}</ul>` : ""}
        <details class="complexity-guide"><summary>怎么看这些记号与情况？</summary><ul>
          <li>O 表示渐近上界；Θ 表示紧确的增长阶。标为保守上界的式子，不等于已经证明紧确。</li>
          <li>比较最好与最坏时，要看上面的规模参数和情形条件。空输入、不同操作、不同树形都不能不加说明地混为一谈。</li>
          <li>默认空间列只算辅助空间：包括递归栈、独立切片、临时数组和持久数据结构，不含原输入。返回容器及用于构造它的扩容容量单独记入结果空间；显式的中间副本仍记辅助空间。特别使用总峰值的题目会明确标注。</li>
          <li>均摊分析研究一串操作的总成本；平均情况依赖输入分布。它们都不代表每次操作的最坏成本。</li>
          <li>按题目范围内的机器字运算计；忽略解释器、JVM、垃圾回收器的固定开销。演示缓存、绘图和个人笔记不计入算法复杂度。</li>
        </ul><p>库实现依据：<a href="https://docs.python.org/3.10/howto/sorting.html" target="_blank" rel="noopener noreferrer">Python 排序说明</a> · <a href="https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Arrays.html" target="_blank" rel="noopener noreferrer">Java 17 Arrays</a> · <a href="https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/PriorityQueue.html" target="_blank" rel="noopener noreferrer">Java 17 PriorityQueue</a>。</p></details>
      </details>
    </section>`;
  }
  window.Complexity = { render };
})();
