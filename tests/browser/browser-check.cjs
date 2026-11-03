// 可选浏览器验收：使用环境已提供的 Playwright，自动启停本地服务。
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
 const server = process.env.EXTERNAL_PREVIEW ? {listening:true,close(){}} : require('../../serve.cjs');
 await new Promise(resolve => server.listening ? resolve() : server.once('listening', resolve));
 const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
 try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const base = 'http://127.0.0.1:'+server.address().port+'/';
  assert.equal((await page.goto(base)).status(), 200);
  await page.getByRole('heading', { name: '让每一道错题，都成为理解的起点。' }).waitFor();
  await page.locator('.skip').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'content');
  assert.ok((await page.locator('h1').textContent()).includes('让每一道错题'));
  await fs.mkdir('test-results', { recursive: true });
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.locator('nav').getByText('全部题目').click();
  await page.locator('#search').fill('236');
  assert.equal(await page.locator('#results .problem').count(), 1);
  await page.locator('#search').fill('递归');
  assert.equal(await page.locator('#results .problem').count(), await page.evaluate(()=>window.PROBLEMS.filter(p=>[p.title,p.number,p.category,...p.tags].join(' ').includes('递归')).length));
  await page.locator('#search').fill('不存在的题目');
  assert.ok((await page.locator('#results').textContent()).includes('没有找到'));
  await page.locator('#search').fill('');
  await page.locator('#status').selectOption('已掌握');
  assert.equal(await page.locator('#results .problem').count(), 0);
  await page.locator('#status').selectOption('');
  await page.locator('#category').selectOption('二叉树');
  assert.equal(await page.locator('#results .problem').count(), await page.evaluate(()=>window.PROBLEMS.filter(p=>p.category==='二叉树').length));
  await page.locator('#results .problem').filter({ hasText: '最近公共祖先' }).click();
  await page.waitForFunction(() => document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const demo = page.frameLocator('#demo');
  await demo.locator('#next').click();
  assert.ok((await demo.locator('#counter').textContent()).startsWith('1 /'));
  await demo.locator('#prev').click();
  assert.ok((await demo.locator('#counter').textContent()).startsWith('0 /'));
  await demo.locator('#lang').selectOption('Python');
  assert.ok((await demo.locator('#code').textContent()).includes('def lowestCommonAncestor'));
  await demo.locator('#next').click();
  const lcaProgress=await demo.locator('#counter').textContent();
  const lcaFrames=await demo.locator('#frames').textContent();
  await demo.locator('#lang').selectOption('Java');
  assert.ok((await demo.locator('#code').textContent()).includes('TreeNode lca'));
  assert.equal(await demo.locator('#counter').textContent(),lcaProgress);
  assert.equal(await demo.locator('#frames').textContent(),lcaFrames);
  assert.equal(await demo.locator('.line.on').count(),1);
  await demo.locator('#example').selectOption('5,4');
  await demo.locator('#seek').evaluate(e => { e.value = e.max; e.dispatchEvent(new Event('input')); });
  assert.equal(await demo.locator('#result').textContent(), 'LCA = 5');
  await demo.locator('#example').selectOption('7,4');
  await demo.locator('#seek').evaluate(e => { e.value = e.max; e.dispatchEvent(new Event('input')); });
  assert.equal(await demo.locator('#result').textContent(), 'LCA = 2');
  await demo.locator('#reset').click();
  await demo.locator('#speed').selectOption('350');
  await demo.locator('#play').click();
  await page.waitForTimeout(800);
  await demo.locator('#play').click();
  const counter = await demo.locator('#counter').textContent();
  assert.ok(!counter.startsWith('0 /'));
  await page.waitForTimeout(500);
  assert.equal(await demo.locator('#counter').textContent(), counter);
  const notes = 'return 只结束当前调用。\n<script>window.bad=true</script>';
  await page.locator('#notes').fill(notes);
  await page.locator('#mastery').selectOption('需复习');
  await page.locator('#review').check();
  assert.ok((await page.locator('#saveStatus').textContent()).includes('已保存'));
  await page.reload();
  assert.equal(await page.locator('#notes').inputValue(), notes);
  assert.equal(await page.locator('#mastery').inputValue(), '需复习');
  assert.equal(await page.locator('#review').isChecked(), true);
  assert.equal(await page.evaluate(() => window.bad), undefined);
  await page.waitForFunction(() => document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await page.screenshot({ path: 'test-results/detail-desktop.png', fullPage: true });
  await page.locator('nav').getByText('学习首页').click();
  assert.ok((await page.locator('.continue').textContent()).includes('继续学习'));
  assert.equal(await page.locator('.cards .problem').count(), 7);
  await page.goBack();
  await page.locator('#notes').waitFor();
  await page.goForward();
  await page.getByRole('heading', { name: '最近收录', exact: true }).waitFor();
  await page.locator('nav').getByText('记录备份').click();
  const downloadPromise = page.waitForEvent('download'); await page.locator('#export').click();
  const downloaded = await downloadPromise;
  const data = JSON.parse(await fs.readFile(await downloaded.path(), 'utf8'));
  assert.equal(data.records['leetcode-236'].notes, notes);
  const upload = value => page.locator('#importFile').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(value) });
  await upload('{broken');
  await page.waitForFunction(() => document.querySelector('#importPreview').textContent.includes('无法导入'));
  assert.equal(await page.locator('#confirmImport').isVisible(), false);
  data.records['leetcode-236'].notes = '已恢复的备份';
  await upload(JSON.stringify(data));
  await page.locator('#confirmImport').waitFor();
  await page.locator('#cancelImport').click();
  assert.ok((await page.locator('#importPreview').textContent()).includes('已取消'));
  await upload(JSON.stringify(data));
  await page.locator('#confirmImport').click();
  assert.ok((await page.locator('#importPreview').textContent()).includes('已导入并保存'));
  await page.goto(base + '#/problem/leetcode-236');
  assert.equal(await page.locator('#notes').inputValue(), '已恢复的备份');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.ok(await demo.locator('body').evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: 'test-results/detail-mobile.png', fullPage: true });
  await page.goto(base + '#/home');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  await page.goto(base + '#/problem/not-found');
  await page.getByRole('heading', { name: '这道题还没有收录' }).waitFor();
  await page.route('**/problems/lca/index.html', route => route.abort());
  await page.goto(base + '#/problem/leetcode-236');
  await page.waitForFunction(() => document.querySelector('#demoStatus')?.textContent.includes('未能加载'), { timeout: 15000 });
  await page.unroute('**/problems/lca/index.html');
  await page.goto(base + 'lca.html');
  await page.locator('#next').click();
  assert.ok((await page.locator('#counter').textContent()).startsWith('1 /'));
  const failedPage = await context.newPage();
  await failedPage.addInitScript(() => { Storage.prototype.setItem = () => { throw Error('quota'); }; });
  await failedPage.goto(base + '#/problem/leetcode-236');
  await failedPage.locator('#notes').fill('保存失败时不能显示成功');
  assert.ok((await failedPage.locator('#saveStatus').textContent()).includes('保存失败'));
  const local = await context.newPage();
  await local.goto(pathToFileURL(path.resolve('dist/index.html')).href + '#/problem/leetcode-236');
  await local.waitForFunction(() => document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  assert.ok(await local.locator('#notes').isVisible());
  await page.setViewportSize({width:1440,height:1000});
  // 从新题详情验证播放、记录隔离和两种屏幕尺寸。
  await page.goto(base + '#/problem/leetcode-513');
  await page.waitForFunction(() => document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const bfs=page.frameLocator('#demo');
  const {trace:traceBfs,examples:bfsExamples,snippets,highlightLines}=require('../../dist/problems/bottom-left/app.js');
  const bfsEvents=traceBfs(bfsExamples[1]).events;
  for(let i=1;i<bfsEvents.length;i++) {
   await bfs.locator('#seek').evaluate((e,value)=>{e.value=value;e.dispatchEvent(new Event('input'));},i);
   const state=await bfs.locator('#queue').textContent();
   const progress=await bfs.locator('#counter').textContent();
   for(const lang of ['Java','Python']) {
    await bfs.locator('#lang').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},lang);
    assert.equal(await bfs.locator('#queue').textContent(),state);
    assert.equal(await bfs.locator('#counter').textContent(),progress);
    assert.equal(await bfs.locator('.line.on').count(),1);
    assert.ok((await bfs.locator('.line.on').textContent()).endsWith(snippets[lang][highlightLines[lang][bfsEvents[i].line]]));
   }
  }
  await bfs.locator('#reset').click();
  await bfs.locator('#next').click();
  assert.equal(await bfs.locator('.line.on').count(),1);
  const queueSnapshot=await bfs.locator('#queue').textContent();
  await bfs.locator('#next').click();await bfs.locator('#prev').click();
  assert.equal(await bfs.locator('#queue').textContent(),queueSnapshot);
  await bfs.locator('#prev').click();
  assert.ok((await bfs.locator('#counter').textContent()).startsWith('0 /'));
  for(const lang of ['Python','Java']) {
  await bfs.locator('#lang').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},lang);
  for(const [value,answer] of [['0','1'],['1','7'],['2','42'],['3','9'],['4','3']]) {
   await bfs.locator('#example').selectOption(value);
   await bfs.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
   assert.equal(await bfs.locator('#result').textContent(),'答案 = '+answer);
   assert.ok((await bfs.locator('.line.on').textContent()).includes('return node.val'));
  }
  }
  await bfs.locator('#example').selectOption('1');
  await bfs.locator('#speed').selectOption('350');await bfs.locator('#play').click();
  await page.waitForTimeout(800);await bfs.locator('#play').click();
  const paused=await bfs.locator('#counter').textContent();
  assert.ok(!paused.startsWith('0 /'));await page.waitForTimeout(450);
  assert.equal(await bfs.locator('#counter').textContent(),paused);
  await bfs.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
  await page.locator('#notes').fill('先右后左，最后出队是左下角。');
  await page.reload();
  assert.equal(await page.locator('#notes').inputValue(),'先右后左，最后出队是左下角。');
  await page.waitForFunction(() => document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await page.screenshot({path:'test-results/bottom-left-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await bfs.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const height=await page.locator('#demo').getAttribute('height');
  await page.waitForTimeout(300);
  assert.equal(await page.locator('#demo').getAttribute('height'),height);
  await page.screenshot({path:'test-results/bottom-left-mobile.png',fullPage:true});
  await page.goto(base+'#/problem/leetcode-236');
  assert.equal(await page.locator('#notes').inputValue(),'已恢复的备份');
  await page.goto(base+'#/problem/leetcode-17');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const phone=page.frameLocator('#demo');
  const {trace:phoneTrace,snippets:phoneCode,highlightLines:phoneLines}=require('../../dist/problems/phone/app.js');
  await page.setViewportSize({width:1440,height:1000});
  const phoneEvents=phoneTrace('23').events;
  for(let i=0;i<phoneEvents.length;i++){
   await phone.locator('#seek').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input'));},i);
   const state=await phone.locator('#slots').textContent();
   for(const lang of ['Java','Python']){
    await phone.locator('#lang').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},lang);
    assert.equal(await phone.locator('#slots').textContent(),state);
    assert.equal(await phone.locator('#counter').textContent(),`${i} / ${phoneEvents.length-1}`);
    assert.equal(await phone.locator('.line.on').count(),1);
    assert.ok((await phone.locator('.line.on').textContent()).endsWith(phoneCode[lang][phoneLines[lang][phoneEvents[i].line]]));
   }
  }
  for(const value of ['','2','79','222']){
   await phone.locator('#example').selectOption(value);
   await phone.locator('#seek').evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input'));});
   assert.equal(await phone.locator('#answers').textContent(),'ans = '+JSON.stringify(phoneTrace(value).events.at(-1).ans));
  }
  await phone.locator('#example').selectOption('23');
  await phone.locator('#next').click();const phoneState=await phone.locator('#slots').textContent();
  await phone.locator('#next').click();await phone.locator('#prev').click();assert.equal(await phone.locator('#slots').textContent(),phoneState);
  await phone.locator('#reset').click();await phone.locator('#speed').selectOption('350');await phone.locator('#play').click();
  await page.waitForTimeout(800);await phone.locator('#play').click();
  const phonePaused=await phone.locator('#counter').textContent();assert.ok(!phonePaused.startsWith('0 /'));
  await page.waitForTimeout(450);assert.equal(await phone.locator('#counter').textContent(),phonePaused);
  await page.locator('#notes').fill('固定格子覆盖，不需要 pop。');await page.reload();
  assert.equal(await page.locator('#notes').inputValue(),'固定格子覆盖，不需要 pop。');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await page.screenshot({path:'test-results/phone-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await phone.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'test-results/phone-mobile.png',fullPage:true});
  await page.goto(base+'#/problem/leetcode-513');assert.equal(await page.locator('#notes').inputValue(),'先右后左，最后出队是左下角。');
  await page.goto(base+'#/problem/leetcode-236');assert.equal(await page.locator('#notes').inputValue(),'已恢复的备份');

  await page.goto(base+'#/problem/leetcode-78');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const subsets=page.frameLocator('#demo');
  const {trace:subsetTrace,snippets:subsetCode,highlightLines:subsetLines}=require('../../dist/problems/subsets/app.js');
  const subsetEvents=subsetTrace([1,2,3]).events;
  for(let i=0;i<subsetEvents.length;i++){
   await subsets.locator('#seek').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input'));},i);
   for(const lang of ['Java','Python']){
    await subsets.locator('#lang').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},lang);
    assert.equal(await subsets.locator('#slots').textContent(),'path = '+JSON.stringify(subsetEvents[i].path));
    assert.equal(await subsets.locator('#answers').textContent(),'ans = '+JSON.stringify(subsetEvents[i].ans));
    assert.equal(await subsets.locator('#counter').textContent(),i+' / '+(subsetEvents.length-1));
    assert.equal(await subsets.locator('.line.on').count(),1);
    assert.ok((await subsets.locator('.line.on').textContent()).endsWith(subsetCode[lang][subsetLines[lang][subsetEvents[i].line]]));
   }
  }
  assert.ok((await subsets.locator('#alias').textContent()).includes('8 项'));
  for(const input of ['[1,2]','[0]','[-1,2]','[]']){
   await subsets.locator('#example').selectOption(input);
   await subsets.locator('#seek').evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input'));});
   assert.equal(await subsets.locator('#answers').textContent(),'ans = '+JSON.stringify(subsetTrace(JSON.parse(input)).events.at(-1).ans));
  }
  await subsets.locator('#example').selectOption('[1,2,3]');
  await subsets.locator('#next').click();const subsetState=await subsets.locator('#slots').textContent();
  await subsets.locator('#next').click();await subsets.locator('#prev').click();assert.equal(await subsets.locator('#slots').textContent(),subsetState);
  await subsets.locator('#reset').click();await subsets.locator('#speed').selectOption('350');await subsets.locator('#play').click();
  await page.waitForTimeout(800);await subsets.locator('#play').click();const subsetPaused=await subsets.locator('#counter').textContent();
  assert.ok(!subsetPaused.startsWith('0 /'));await page.waitForTimeout(450);assert.equal(await subsets.locator('#counter').textContent(),subsetPaused);
  await page.locator('#notes').fill('copy 保存，pop 撤销，两次递归分别选与不选。');await page.reload();
  assert.equal(await page.locator('#notes').inputValue(),'copy 保存，pop 撤销，两次递归分别选与不选。');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await subsets.locator('#seek').evaluate(el=>{el.value=el.max;el.dispatchEvent(new Event('input'));});
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   await page.setViewportSize({width,height});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.ok(await subsets.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:'test-results/subsets-'+name+'.png',fullPage:true});
  }
  await page.goto(base+'#/problem/leetcode-17');assert.equal(await page.locator('#notes').inputValue(),'固定格子覆盖，不需要 pop。');
  await page.goto(base+'#/problem/leetcode-236');assert.equal(await page.locator('#notes').inputValue(),'已恢复的备份');
  await page.goto(base+'#/problem/leetcode-77');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const combo=page.frameLocator('#demo');
  const {trace:ct,snippets:cs,highlightLines:cl}=require('../../dist/problems/combinations/app.js');
  for(let i=0;i<ct(4,2).events.length;i++){
   await combo.locator('#seek').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},i);
   const state=await combo.locator('#slots').textContent();
   for(const lang of ['Java','Python']){
    await combo.locator('#lang').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},lang);
    assert.equal(await combo.locator('#slots').textContent(),state);
    assert.equal(await combo.locator('.line.on').count(),1);
    assert.ok((await combo.locator('.line.on').textContent()).endsWith(cs[lang][cl[lang][ct(4,2).events[i].line]]));
   }
  }
  for(const v of ['1,1','4,4','4,1','5,3']){
   await combo.locator('#example').selectOption(v);
   await combo.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
   assert.equal(await combo.locator('#answers').textContent(),'ans = '+JSON.stringify(ct(...v.split(',').map(Number)).events.at(-1).ans));
  }
  await combo.locator('#reset').click();await combo.locator('#next').click();const cp=await combo.locator('#counter').textContent();
  await combo.locator('#next').click();await combo.locator('#prev').click();assert.equal(await combo.locator('#counter').textContent(),cp);
  await combo.locator('#speed').selectOption('350');await combo.locator('#play').click();await page.waitForTimeout(800);await combo.locator('#play').click();
  const pausedC=await combo.locator('#counter').textContent();assert.notEqual(pausedC,cp);await page.waitForTimeout(450);assert.equal(await combo.locator('#counter').textContent(),pausedC);
  await page.locator('#notes').fill('j 至少为 d。');await page.reload();assert.equal(await page.locator('#notes').inputValue(),'j 至少为 d。');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await combo.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`test-results/combinations-${width}.png`,fullPage:true});}
  await page.goto(base+'#/problem/leetcode-236');assert.equal(await page.locator('#notes').inputValue(),'已恢复的备份');
  await page.goto(base+'#/problem/leetcode-46');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const perm=page.frameLocator('#demo');
  const {trace:pt,snippets:ps,highlightLines:pl}=require('../../dist/problems/permutations/app.js');
  const pe=pt([1,2,3]).events;
  for(let i=0;i<pe.length;i++){
   await perm.locator('#seek').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},i);
   const state=await perm.locator('#slots').textContent();
   for(const lang of ['Java','Python']){
    await perm.locator('#lang').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},lang);
    assert.equal(await perm.locator('#slots').textContent(),state);
    assert.equal(await perm.locator('#counter').textContent(),i+' / '+(pe.length-1));
    assert.equal(await perm.locator('#answers').textContent(),'ans = '+JSON.stringify(pe[i].ans));
    assert.equal(await perm.locator('.line.on').count(),1);
    assert.ok((await perm.locator('.line.on').textContent()).endsWith(ps[lang][pl[lang][pe[i].line]]));
   }
  }
  for(const v of ['[0,1]','[1]','[-1,0,2]','[3,1,2]']){
   await perm.locator('#example').selectOption(v);
   await perm.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
   assert.equal(await perm.locator('#answers').textContent(),'ans = '+JSON.stringify(pt(JSON.parse(v)).events.at(-1).ans));
  }
  await perm.locator('#reset').click();await perm.locator('#next').click();const pp=await perm.locator('#slots').textContent();
  await perm.locator('#next').click();await perm.locator('#prev').click();assert.equal(await perm.locator('#slots').textContent(),pp);
  await perm.locator('#speed').selectOption('350');await perm.locator('#play').click();await page.waitForTimeout(800);await perm.locator('#play').click();
  const pausedP=await perm.locator('#counter').textContent();assert.ok(!pausedP.startsWith('1 /'));await page.waitForTimeout(450);assert.equal(await perm.locator('#counter').textContent(),pausedP);
  await page.locator('#notes').fill('新集合不用恢复，固定格子覆盖，答案要复制。');await page.reload();assert.equal(await page.locator('#notes').inputValue(),'新集合不用恢复，固定格子覆盖，答案要复制。');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await perm.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await perm.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`test-results/permutations-${width}.png`,fullPage:true});}
  await page.goto(base+'#/problem/leetcode-236');assert.equal(await page.locator('#notes').inputValue(),'已恢复的备份');

  await page.goto(base+'#/problem/leetcode-131');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const pal=page.frameLocator('#demo');
  const {trace:palTrace,snippets:palCode,highlightLines:palLines}=require('../../dist/problems/palindrome/app.js');
  const palEvents=palTrace('aab').events;
  for(let i=0;i<palEvents.length;i++){
   await pal.locator('#seek').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},i);
   for(const lang of ['Java','Python']){
    await pal.locator('#lang').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},lang);
    assert.equal(await pal.locator('#slots').textContent(),'path = '+JSON.stringify(palEvents[i].path));
    assert.equal(await pal.locator('#answers').textContent(),'ans = '+JSON.stringify(palEvents[i].ans));
    assert.equal(await pal.locator('#counter').textContent(),i+' / '+(palEvents.length-1));
    assert.equal(await pal.locator('.line.on').count(),1);
    assert.ok((await pal.locator('.line.on').textContent()).endsWith(palCode[lang][palLines[lang][palEvents[i].line]]));
   }
  }
  for(const v of ['a','aba','aaa','abc']){
   await pal.locator('#example').selectOption(v);
   await pal.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
   assert.equal(await pal.locator('#answers').textContent(),'ans = '+JSON.stringify(palTrace(v).events.at(-1).ans));
  }
  await pal.locator('#example').selectOption('aab');await pal.locator('#next').click();
  const palState=await pal.locator('#slots').textContent();await pal.locator('#next').click();await pal.locator('#prev').click();
  assert.equal(await pal.locator('#slots').textContent(),palState);
  await pal.locator('#reset').click();await pal.locator('#speed').selectOption('350');await pal.locator('#play').click();
  await page.waitForTimeout(800);await pal.locator('#play').click();const palPaused=await pal.locator('#counter').textContent();
  assert.ok(!palPaused.startsWith('0 /'));await page.waitForTimeout(450);assert.equal(await pal.locator('#counter').textContent(),palPaused);
  await page.locator('#notes').fill('下一段从 j+1 开始，非回文继续枚举，不是 break。');await page.reload();
  assert.equal(await page.locator('#notes').inputValue(),'下一段从 j+1 开始，非回文继续枚举，不是 break。');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await pal.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.ok(await pal.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:'test-results/palindrome-'+width+'.png',fullPage:true});
  }
  await page.goto(base+'#/problem/leetcode-78');assert.equal(await page.locator('#notes').inputValue(),'copy 保存，pop 撤销，两次递归分别选与不选。');
  await page.goto(base+'#/problem/leetcode-236');assert.equal(await page.locator('#notes').inputValue(),'已恢复的备份');
  await page.goto(base+'#/problem/leetcode-239');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const sw=page.frameLocator('#demo');
  const {trace:swTrace,examples:swExamples,snippets:swCode,highlightLines:swLines}=require('../../dist/problems/sliding-window/app.js');
  for(let example=0;example<swExamples.length;example++){
   await sw.locator('#example').selectOption(String(example));
   const expected=swTrace(swExamples[example].nums,swExamples[example].k).events;
   const checked=await sw.locator('body').evaluate((body,{expected,swCode,swLines,nums})=>{
    const $=id=>document.getElementById(id);
    for(let i=0;i<expected.length;i++){
     $('seek').value=i;$('seek').dispatchEvent(new Event('input'));
     for(const lang of ['Python','Java']){
      $('lang').value=lang;$('lang').dispatchEvent(new Event('change'));
      if($('counter').textContent!==`${i} / ${expected.length-1}`)throw Error('progress changed');
      if($('answers').textContent!=='ans = '+JSON.stringify(expected[i].ans))throw Error('answers changed');
      if(document.querySelectorAll('.line.on').length!==1||!document.querySelector('.line.on').textContent.endsWith(swCode[lang][swLines[lang][expected[i].line]]))throw Error('highlight mismatch');
      const expectedQueue=expected[i].queue.map(j=>`${j} → 值 ${nums[j]}`).join('');
      if($('queue').textContent!==(expectedQueue||'∅ 空队列'))throw Error('queue changed');
     }
    }
    return true;
   },{expected,swCode,swLines,nums:swExamples[example].nums});assert.ok(checked);
  }
  await sw.locator('#example').selectOption('0');await sw.locator('#next').click();const swProgress=await sw.locator('#counter').textContent();
  await sw.locator('#next').click();await sw.locator('#prev').click();assert.equal(await sw.locator('#counter').textContent(),swProgress);
  await sw.locator('#reset').click();await sw.locator('#speed').selectOption('350');await sw.locator('#play').click();await page.waitForTimeout(800);await sw.locator('#play').click();
  const swPaused=await sw.locator('#counter').textContent();assert.ok(!swPaused.startsWith('0 /'));await page.waitForTimeout(450);assert.equal(await sw.locator('#counter').textContent(),swPaused);
  await sw.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});assert.equal(await sw.locator('#answers').textContent(),'ans = [3,3,5,5,6,7]');
  await page.locator('#notes').fill('存下标，队尾淘汰，队头过期。');await page.reload();assert.equal(await page.locator('#notes').inputValue(),'存下标，队尾淘汰，队头过期。');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await sw.locator('#seek').evaluate(e=>{e.value=30;e.dispatchEvent(new Event('input'));});
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await sw.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`test-results/sliding-window-${width}.png`,fullPage:true});}
  await page.goto(base+'#/problem/leetcode-236');assert.equal(await page.locator('#notes').inputValue(),'已恢复的备份');
  await page.goto(base+'#/problem/leetcode-198');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const rob=page.frameLocator('#demo');
  await rob.locator('#next').click();const robState=await rob.locator('#frames').textContent();
  await rob.locator('#next').click();await rob.locator('#prev').click();assert.equal(await rob.locator('#frames').textContent(),robState);
  for(const lang of ['Python','Java']){
   await rob.locator('#lang').evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('change'));},lang);assert.equal(await rob.locator('#frames').textContent(),robState);
   const max=await rob.locator('#seek').getAttribute('max');
   for(let i=0;i<=Number(max);i++){
    await rob.locator('#seek').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},String(i));
    assert.equal(await rob.locator('.line.on').count(),1);
   }
   await rob.locator('#seek').evaluate(e=>{e.value=1;e.dispatchEvent(new Event('input'));});
  }
  for(const [value,answer] of [['[1,2,3,1]',4],['[2,7,9,3,1]',12],['[2,1,1,2]',4],['[5]',5],['[0,0]',0],['[]',0]]){
   await rob.locator('#example').selectOption(value);
   await rob.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
   assert.equal(await rob.locator('#answers').textContent(),'最终答案：'+answer);
  }
  await rob.locator('#example').selectOption('[1,2,3,1]');await rob.locator('#reset').click();await rob.locator('#speed').selectOption('350');await rob.locator('#play').click();await page.waitForTimeout(800);await rob.locator('#play').click();
  const robPaused=await rob.locator('#counter').textContent();assert.ok(!robPaused.startsWith('0 /'));await page.waitForTimeout(450);assert.equal(await rob.locator('#counter').textContent(),robPaused);
  await page.locator('#notes').fill('选 i 必须跳过 i-1');await page.reload();assert.equal(await page.locator('#notes').inputValue(),'选 i 必须跳过 i-1');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await rob.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:'test-results/robber-'+width+'.png',fullPage:true});
  }
  await page.goto(base+'#/problem/leetcode-1143');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const lcs=page.frameLocator('#demo');
  const {trace:lcsTrace,snippets:lcsCode,highlightLines:lcsLines}=require('../../dist/problems/lcs/app.js');
  const lcsEvents=lcsTrace('abcde','ace').events;
  for(let i=0;i<lcsEvents.length;i++){
   await lcs.locator('#seek').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},i);
   const state=await lcs.locator('#array').textContent();
   for(const lang of ['Java','Python']){
    await lcs.locator('#lang').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('change'));},lang);
    assert.equal(await lcs.locator('#array').textContent(),state);
    assert.equal(await lcs.locator('#counter').textContent(),i+' / '+(lcsEvents.length-1));
    assert.equal(await lcs.locator('.line.on').count(),1);
    assert.ok((await lcs.locator('.line.on').textContent()).endsWith(lcsCode[lang][lcsLines[lang][lcsEvents[i].line]]));
    assert.deepEqual(await lcs.locator('.slot b').allTextContents(),lcsEvents[i].f.map(String));
   }
  }
  for(const [input,expected] of [['["abc","abc"]',3],['["abc","def"]',0],['["a","aa"]',1],['["ab","ba"]',1],['["","abc"]',0]]){
   await lcs.locator('#example').selectOption(input);
   await lcs.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
   assert.equal(await lcs.locator('#result').textContent(),'LCS 长度 = '+expected);
  }
  await lcs.locator('#example').selectOption('["abcde","ace"]');
  await lcs.locator('#next').click();const lcsState=await lcs.locator('#array').textContent();
  await lcs.locator('#next').click();await lcs.locator('#prev').click();assert.equal(await lcs.locator('#array').textContent(),lcsState);
  await lcs.locator('#reset').click();await lcs.locator('#speed').selectOption('350');await lcs.locator('#play').click();
  await page.waitForTimeout(800);await lcs.locator('#play').click();const lcsPaused=await lcs.locator('#counter').textContent();assert.ok(!lcsPaused.startsWith('0 /'));
  await page.waitForTimeout(450);assert.equal(await lcs.locator('#counter').textContent(),lcsPaused);
  await page.locator('#notes').fill('先保存旧上方到 tmp，再更新，最后 pre=tmp。');await page.reload();
  assert.equal(await page.locator('#notes').inputValue(),'先保存旧上方到 tmp，再更新，最后 pre=tmp。');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await lcs.locator('#seek').evaluate(e=>{e.value=10;e.dispatchEvent(new Event('input'));});
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.ok(await lcs.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:'test-results/lcs-'+width+'.png',fullPage:true});
  }
  await page.goto(base+'#/problem/leetcode-78');assert.equal(await page.locator('#notes').inputValue(),'copy 保存，pop 撤销，两次递归分别选与不选。');
  await page.goto(base+'#/problem/leetcode-236');assert.equal(await page.locator('#notes').inputValue(),'已恢复的备份');
  await page.goto(base+'#/problem/leetcode-300');
  await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const lis=page.frameLocator('#demo');
  await lis.locator('#next').click();const lisState=await lis.locator('#state').textContent();await lis.locator('#next').click();await lis.locator('#prev').click();assert.equal(await lis.locator('#state').textContent(),lisState);
  for(const lang of ['Python','Java']){
   await lis.locator('#lang').selectOption(lang);assert.equal(await lis.locator('#state').textContent(),lisState);
   assert.ok(await lis.locator('body').evaluate(()=>{const seek=document.getElementById('seek');for(let i=0;i<=Number(seek.max);i++){seek.value=i;seek.dispatchEvent(new Event('input'));if(document.querySelectorAll('.line.on').length!==1)return false;}return true;}));
   await lis.locator('#seek').evaluate(e=>{e.value=1;e.dispatchEvent(new Event('input'));});
  }
  for(const mode of ['strict','screenshot']){
   await lis.locator('#mode').selectOption(mode);
   for(const lang of ['Python','Java']){
    await lis.locator('#lang').selectOption(lang);
    for(const [input,expected] of [['[10,9,2,5,3,7,101,18]',4],['[0,1,0,3,2,3]',mode==='strict'?4:4],['[7,7,7,7,7,7,7]',mode==='strict'?1:7],['[3,5,6,2,4]',3],['[5,4,3,2,1]',1],['[-2,-1,0]',3],['[1]',1],['[]',0]]){
     await lis.locator('#example').selectOption(input);await lis.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});assert.ok((await lis.locator('#answers').textContent()).startsWith('当前长度：'+expected+'（'));
    }
   }
  }
  await lis.locator('#mode').selectOption('strict');await lis.locator('#example').selectOption('[10,9,2,5,3,7,101,18]');await lis.locator('#speed').selectOption('350');await lis.locator('#play').click();await page.waitForTimeout(800);await lis.locator('#play').click();const lisPaused=await lis.locator('#counter').textContent();assert.ok(!lisPaused.startsWith('0 /'));await page.waitForTimeout(450);assert.equal(await lis.locator('#counter').textContent(),lisPaused);
  await page.locator('#notes').fill('严格递增找首个大于等于 x；前缀不一定是实际方案。');await page.reload();assert.equal(await page.locator('#notes').inputValue(),'严格递增找首个大于等于 x；前缀不一定是实际方案。');await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await lis.locator('#seek').evaluate(e=>{e.value=20;e.dispatchEvent(new Event('input'));});
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await lis.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'test-results/lis-'+width+'.png',fullPage:true});}
  await require('./backtracking-additions-browser.cjs')(page,base);
  await require('./queens-browser.cjs')(page,base);
  assert.deepEqual(errors, []);
  console.log('Passed: Python/Java switching and step highlighting, desktop/mobile, search/filter, routes, playback, persistence, backup/restore/cancel, invalid JSON, failed storage/demo, legacy and file opening.');
 } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

