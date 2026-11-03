(() => {
  'use strict';
  const problems = window.PROBLEMS;
  const { createStore, statuses, validateBackup } = window.NotebookRecords;
  const storage = { getItem: key => window.localStorage.getItem(key), setItem: (key, value) => window.localStorage.setItem(key, value) };
  const store = createStore(storage);
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const href = p => `#/problem/${encodeURIComponent(p.id)}`;
  const categories = [...new Set(problems.map(p => p.category))];
  let demoTimer, demoReady = false, viewToken = 0;
  function notice(message) { $('notice').textContent = message; $('notice').hidden = false; }
  function tags(p) { return `<div class="tags">${[p.category, ...p.tags].map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>`; }
  function card(p) {
    const r = store.get(p.id);
    return `<a class="problem" href="${href(p)}"><div class="problemmeta"><span>NO. ${esc(p.number)} / ${esc(p.category)}</span><span class="difficulty">${esc(p.difficulty)}</span></div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${tags(p)}<div class="cardfoot"><span>${esc(r.status)}${r.review ? ' · 待复习' : ''}</span><b>回放解题过程 ↗</b></div></a>`;
  }
  function cards(list, empty) { return list.length ? `<div class="cards">${list.map(card).join('')}</div>` : `<div class="empty">${esc(empty)}</div>`; }
  const heading = (eyebrow, title, sub) => `<div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subtitle">${sub}</p>`;
  function home() {
    const last = problems.find(p => p.id === store.lastVisited);
    const review = problems.filter(p => store.get(p.id).review || store.get(p.id).status === '需复习');
    const latest = [...problems].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 6);
    $('content').innerHTML = `<div class="hero"><div>${heading('A LITTLE CLEARER, EVERY TIME', '让每一道错题，都成为理解的起点。', '回放一次执行，记下一个卡点。下次再见时，就多懂一点。')}</div><svg class="hero-art" viewBox="0 0 150 115" aria-hidden="true"><path d="M75 24L36 65M75 24L114 65M36 65L17 99M36 65L56 99" fill="none" stroke="#b6c6a4" stroke-width="2"/><g fill="#e4edda" stroke="#a1b98d"><circle cx="75" cy="24" r="17"/><circle cx="36" cy="65" r="13"/><circle cx="114" cy="65" r="13"/><circle cx="17" cy="99" r="9"/><circle cx="56" cy="99" r="9"/></g><circle cx="75" cy="24" r="5" fill="#527a40"/></svg></div>
      <div class="stats"><div class="stat"><span>已收录题目</span><strong>${problems.length.toString().padStart(2, '0')}</strong></div><div class="stat"><span>等待再看一遍</span><strong>${review.length.toString().padStart(2, '0')}</strong></div><div class="stat"><span>已经想明白</span><strong>${problems.filter(p => store.get(p.id).status === '已掌握').length.toString().padStart(2, '0')}</strong></div></div>
      <section class="continue"><div><div class="eyebrow">${last ? 'PICK UP WHERE YOU LEFT OFF' : 'YOUR FIRST REPLAY'}</div><h3 style="margin:12px 0 0">${last ? `继续学习 · ${esc(last.title)}` : '从最近公共祖先，开始理解递归'}</h3><p class="muted">${last ? '上次的思考已经保留。再走一遍执行过程，看看还有哪里需要停下来。' : '先看动画，再看返回值是怎样一层层传回来的。'}</p></div>${last || problems[0] ? `<a class="button primary" href="${href(last || problems[0])}">${last ? '继续学习' : '开始第一题'} →</a>` : ''}</section>
      <div class="sectionheading"><h2>最近收录</h2><a href="#/library">浏览全部题目 →</a></div>${cards(latest, '还没有收录题目。下一道不明白的题，就是新的起点。')}
      <div class="sectionheading"><h2>留给下一次的思考</h2><span class="muted">待复习</span></div>${cards(review, '暂时没有待复习题目。遇到卡点时，可以在题目中标记“待复习”。')}`;
  }
  function library(params) {
    $('content').innerHTML = heading('YOUR ALGORITHM COLLECTION', '题库，按你的思路翻阅。', '按题型整理，也可以通过题号、名称或算法标签找到它。') +
      `<div class="filters"><label>搜索题目<input id="search" type="search" placeholder="题号、名称或标签，例如：236 / 递归" maxlength="200"></label><label>题型<select id="category"><option value="">全部题型</option>${categories.map(c => `<option>${esc(c)}</option>`).join('')}</select></label><label>掌握程度<select id="status"><option value="">全部程度</option>${statuses.map(s => `<option>${s}</option>`).join('')}</select></label></div><div class="resultcount" id="count" aria-live="polite"></div><div id="results"></div>`;
    $('search').value = params.get('q') || '';
    $('category').value = categories.includes(params.get('category')) ? params.get('category') : '';
    $('status').value = statuses.includes(params.get('status')) ? params.get('status') : '';
    function filter() {
      const q = $('search').value.trim().toLowerCase(), category = $('category').value, status = $('status').value;
      const list = problems.filter(p => (!category || p.category === category) && (!status || store.get(p.id).status === status) && `${p.number} ${p.title} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(q));
      $('count').textContent = `找到 ${list.length} 道题目 · 共收录 ${problems.length} 道`;
      $('results').innerHTML = cards(list, '没有找到符合条件的题目。试试其他关键词，或清除筛选。');
      const query = new URLSearchParams(); if (q) query.set('q', $('search').value); if (category) query.set('category', category); if (status) query.set('status', status);
      history.replaceState(null, '', `#/library${query.size ? '?' + query : ''}`);
      document.querySelectorAll('.category').forEach(a => a.classList.toggle('active', a.dataset.category === category));
    }
    $('search').oninput = $('category').onchange = $('status').onchange = filter;
    filter();
  }
  function detail(p) {
    const saved = store.visit(p.id), r = store.get(p.id);
    if (!saved) notice(store.error);
    $('content').innerHTML = `<div class="breadcrumb"><a href="#/library">全部题目</a> / ${esc(p.category)} / ${esc(p.number)}</div><div class="detailhead"><div><div class="eyebrow">PROBLEM ${esc(p.number)} · ${esc(p.difficulty)}</div><h1>${esc(p.title)}</h1>${tags(p)}</div><div class="detail-actions"><button id="jumpComplexity" type="button" ${window.Complexity ? '' : 'disabled'}>查看复杂度 ↓</button><a class="button" href="${esc(p.source)}" target="_blank" rel="noopener noreferrer">查看原题 ↗</a></div></div>
      <section class="panel"><h2>这道题在问什么？</h2><p>${esc(p.statement)}</p></section>
      ${window.Complexity ? window.Complexity.render(p.id) : '<section class="panel"><h2>复杂度分析</h2><p>复杂度分析暂未能加载，请刷新后重试。题目、演示与笔记仍可使用。</p></section>'}
      <div class="demoheading"><h2>跟着代码，走一遍</h2><a href="${esc(p.demo)}" target="_blank" rel="noopener">独立打开演示 ↗</a></div><section class="demowrap"><div id="demoStatus" class="demo-status" role="status">正在准备交互演示…</div><iframe id="demo" title="${esc(p.title)} · 代码与执行过程" src="${esc(p.demo)}"></iframe></section>
      <div class="twocol"><section class="panel"><h2>理解这几个关键点</h2>${p.principles.map((x, i) => `<article class="principle"><h3>${i + 1}. ${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</section><section class="panel"><h2>容易卡住的地方</h2><ul>${p.pitfalls.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section></div>
      <section class="panel"><h2>留给自己的复习笔记</h2><p>记录你这次卡住的原因，以及下次想提醒自己的事。</p><div class="notecontrols"><label class="field">掌握程度<select id="mastery">${statuses.map(s => `<option>${s}</option>`).join('')}</select></label><label class="checkbox"><input type="checkbox" id="review">标记待复习</label></div><label class="field" for="notes">我的理解与易错点</label><textarea id="notes" maxlength="100000" placeholder="例如：return 结束的是当前调用；left / right 是子树传回来的线索…"></textarea><div class="savenote" id="saveStatus" role="status" aria-live="polite"></div><p class="backuphelp">记录保存在当前浏览器，更新题库会保留。更换设备或浏览器前，请<a href="#/backup">导出备份</a>。</p></section>`;
    $('mastery').value = r.status; $('review').checked = r.review; $('notes').value = r.notes;
    $('jumpComplexity').onclick = () => {
      const panel = $('complexityPanel'), details = $('complexityDetails');
      if (!panel || !details) return;
      details.open = true;
      panel.focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    };
    function saveStatus(ok, initial) {
      $('saveStatus').classList.toggle('error', !ok);
      $('saveStatus').textContent = ok ? (initial ? (r.updatedAt ? '已载入保存的记录' : '修改后自动保存') : '✓ 已保存到此浏览器') : store.error;
    }
    saveStatus(saved, true);
    const save = () => saveStatus(store.update(p.id, { status: $('mastery').value, review: $('review').checked, notes: $('notes').value }), false);
    $('notes').oninput = $('mastery').onchange = $('review').onchange = save;
    demoReady = false;
    $('demo').onerror = () => demoFailure();
    demoTimer = setTimeout(demoFailure, 10000);
  }
  function demoFailure() {
    if (!demoReady && $('demoStatus')) $('demoStatus').textContent = '演示未能加载，请刷新重试，或点击上方“独立打开演示”。讲解和笔记仍可使用。';
  }
  window.addEventListener('message', event => {
    const frame = $('demo');
    if (!frame || event.source !== frame.contentWindow || (location.protocol !== 'file:' && event.origin !== location.origin)) return;
    if (event.data?.type === 'algorithm-demo-ready' && Number.isFinite(event.data.height)) {
      demoReady = true; clearTimeout(demoTimer); frame.style.height = Math.min(12000, Math.max(450, event.data.height + 4)) + 'px';
      $('demoStatus').textContent = '演示已就绪 · 单步看每次调用，或自动播放完整过程。';
    }
  });
  function backup() {
    const currentView = viewToken;
    $('content').innerHTML = heading('KEEP YOUR THINKING SAFE', '把自己的理解，好好保存。', '导出笔记与掌握程度。以后换个浏览器，也能接着复习。') +
      `<section class="panel backupbox"><h2>导出个人记录</h2><p>包含所有题目的笔记、掌握程度和待复习标记。题目与动画由网站维护，不需要放进个人备份。</p><div class="actions"><button id="export" class="primary">↓ 下载备份文件</button></div></section>
      <section class="panel backupbox"><h2>从备份恢复</h2><p>先选择本网站导出的 JSON 文件，通过检查后再确认导入。备份中同一道题的记录会覆盖当前记录；其他题目的记录保留。</p><div class="actions"><label class="field">选择备份文件<input class="fileinput" type="file" accept=".json,application/json" id="importFile"></label></div><div id="importPreview" class="backupstatus" role="status" aria-live="polite"></div><div class="actions"><button id="confirmImport" class="primary" hidden>确认覆盖并导入</button><button id="cancelImport" hidden>取消</button></div></section>
      <section class="panel backupbox"><h2>关于记录保存</h2><ul><li>记录只保存在此浏览器，不会自动跨设备同步。</li><li>清除浏览器数据、使用无痕窗口或更换网站地址，可能无法继续读取旧记录；请定期导出。</li><li>本地网页与在线网站的记录分开保存，可以用备份文件迁移。</li></ul></section>`;
    $('export').onclick = () => {
      const blob = new Blob([JSON.stringify(store.backup(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url;
      link.download = `算法拾遗-复习备份-${new Date().toLocaleDateString('sv-SE')}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
      notice('已生成备份，请保存浏览器下载的 JSON 文件。');
    };
    let pending = null, selection = 0;
    const resetPending = () => { pending = null; $('confirmImport').hidden = $('cancelImport').hidden = true; };
    $('importFile').onchange = async () => {
      const token = ++selection; resetPending(); const file = $('importFile').files[0];
      $('importPreview').textContent = ''; $('importPreview').classList.remove('danger');
      if (!file) return;
      try {
        if (file.size > 2 * 1024 * 1024) throw Error('文件过大，请选择不超过 2 MB 的备份');
        const records = validateBackup(JSON.parse(await file.text()));
        if (token !== selection || currentView !== viewToken || !$('importPreview')) return;
        const ids = Object.keys(records); if (!ids.length) throw Error('备份中没有可导入的记录');
        pending = records;
        const overlaps = ids.filter(id => Object.hasOwn(store.records, id)).length;
        const unknown = ids.filter(id => !problems.some(p => p.id === id)).length;
        $('importPreview').textContent = `检查通过：${ids.length} 条记录，其中 ${overlaps} 条将覆盖已有记录。${unknown ? `含 ${unknown} 条当前题库未收录的记录，将保留以便以后使用。` : ''}确认后才会写入。`;
        $('confirmImport').hidden = $('cancelImport').hidden = false;
      } catch (error) {
        if (token !== selection || currentView !== viewToken || !$('importPreview')) return;
        resetPending(); $('importPreview').classList.add('danger'); $('importPreview').textContent = `无法导入：${error instanceof SyntaxError ? '文件不是有效的 JSON 备份' : error.message}。当前记录未改动。`;
      }
    };
    $('cancelImport').onclick = () => { ++selection; resetPending(); $('importFile').value = ''; $('importPreview').textContent = '已取消，当前记录未改动。'; };
    $('confirmImport').onclick = () => {
      if (!pending) return;
      const count = Object.keys(pending).length, ok = store.merge(pending);
      $('importPreview').classList.toggle('danger', !ok);
      $('importPreview').textContent = ok ? `✓ 已导入并保存 ${count} 条记录。` : store.error;
      if (ok) { resetPending(); $('importFile').value = ''; $('notice').hidden = true; }
    };
  }
  function route() {
    ++viewToken;
    clearTimeout(demoTimer);
    const [path, query = ''] = (location.hash.slice(1) || '/home').split('?');
    const page = path.split('/')[1], params = new URLSearchParams(query);
    $('notice').hidden = !store.error; if (store.error) notice(store.error);
    document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === (page === 'problem' ? 'library' : page)) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.querySelectorAll('.category').forEach(a => a.classList.toggle('active', page === 'library' && a.dataset.category === params.get('category')));
    if (page === 'home') { home(); document.title = '学习首页 · 算法拾遗'; }
    else if (page === 'library') { library(params); document.title = '全部题目 · 算法拾遗'; }
    else if (page === 'backup') { backup(); document.title = '记录备份 · 算法拾遗'; }
    else if (page === 'problem') {
      const p = problems.find(p => p.id === path.split('/')[2]);
      if (p) { detail(p); document.title = `${p.number}. ${p.title} · 算法拾遗`; }
      else { $('content').innerHTML = heading('NOT FOUND', '这道题还没有收录', '可以返回题库，继续翻阅已经整理好的题目。') + '<div class="actions"><a class="button" href="#/library">返回题库</a></div>'; document.title = '题目未找到 · 算法拾遗'; }
    } else { $('content').innerHTML = heading('NOT FOUND', '没有找到这个页面', '请从上方导航返回首页或题库。'); document.title = '页面未找到 · 算法拾遗'; }
    window.scrollTo(0, 0); $('content').focus({ preventScroll: true });
  }
  $('total').textContent = problems.length;
  document.querySelector('.skip').onclick = event => { event.preventDefault(); $('content').focus(); $('content').scrollIntoView(); };
  $('categories').innerHTML = categories.map(c => `<a class="category" data-category="${esc(c)}" href="#/library?category=${encodeURIComponent(c)}">${esc(c)}<span>${problems.filter(p => p.category === c).length}</span></a>`).join('');
  window.addEventListener('hashchange', route); route();
})();
