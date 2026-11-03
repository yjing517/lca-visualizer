const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const data=JSON.parse(fs.readFileSync('tools/traces/target-sum.json','utf8'));
const {snippets}=require('../../dist/problems/target-sum/app.js');
(async()=>{
 const server=require('../../serve.cjs');await new Promise(r=>server.listening?r():server.once('listening',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(base+'#/problem/leetcode-236');await page.locator('#notes').fill('旧题笔记保留');
  await page.goto(base+'#/problem/leetcode-494');await page.locator('#notes').fill('目标和：零不能去重');
  const frame=page.frameLocator('#demo');await frame.locator('#example option').first().waitFor({state:'attached'});
  assert.equal(await frame.locator('#example option').count(),9);assert.equal(await frame.locator('#capacity').textContent(),'4');
  let steps=0;fs.mkdirSync('test-results',{recursive:true});
  for(const c of data.cases){
   await frame.locator('#example').selectOption(c.id);
   for(const lang of ['Python','Java']){
    const progress=await frame.locator('#seek').inputValue(),memo=await frame.locator('#memo').textContent(),stack=await frame.locator('#frames').textContent();
    await frame.locator('#lang').selectOption(lang);assert.equal(await frame.locator('#seek').inputValue(),progress);assert.equal(await frame.locator('#memo').textContent(),memo);assert.equal(await frame.locator('#frames').textContent(),stack);
    const actual=await frame.locator('body').evaluate((body,count)=>{const seek=document.getElementById('seek'),results=[];for(let i=0;i<count;i++){seek.value=i;seek.dispatchEvent(new Event('input'));results.push({lines:[...document.querySelectorAll('.line.on')].map(row=>row.textContent.slice(4)),memo:document.querySelectorAll('.memo-cell').length});}return results;},c.events.length);
    for(let i=0;i<actual.length;i++){assert.deepEqual(actual[i].lines,[snippets[lang][lang==='Python'?c.events[i].line:c.events[i].javaLine]],`${c.id} ${lang} ${i}`);assert.equal(actual[i].memo,Object.keys(c.events[i].memo).length);}steps+=actual.length;
    assert.equal(await frame.locator('#answer').textContent(),'方案数：'+c.answer);assert.equal(await frame.locator('#next').isDisabled(),true);
   }
   await frame.locator('#reset').click();assert.equal(await frame.locator('#prev').isDisabled(),true);
   await frame.locator('#next').click();const snapshot=await frame.locator('#message').textContent();await frame.locator('#next').click();await frame.locator('#prev').click();assert.equal(await frame.locator('#message').textContent(),snapshot);
  }
  await frame.locator('#example').selectOption('official');await frame.locator('#lang').selectOption('Java');
  const hit=data.cases[0].events.findIndex(e=>e.kind==='hit');await frame.locator('#seek').evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},hit);assert.ok((await frame.locator('#message').textContent()).includes('命中缓存'));
  assert.ok(await frame.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await frame.locator('body').screenshot({path:'test-results/target-sum-official-desktop.png'});
  await frame.locator('#example').selectOption('all-zero');await frame.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});assert.equal(await frame.locator('#answer').textContent(),'方案数：8');await frame.locator('body').screenshot({path:'test-results/target-sum-zero-desktop.png'});
  await frame.locator('#example').selectOption('official');await frame.locator('#speed').selectOption('350');await frame.locator('#play').click();await page.waitForFunction(()=>Number(document.getElementById('demo')?.contentDocument?.getElementById('seek')?.value)>0);await frame.locator('#play').click();const paused=await frame.locator('#seek').inputValue();await page.waitForTimeout(450);assert.equal(await frame.locator('#seek').inputValue(),paused);
  await frame.locator('#reset').click();await page.locator('h1').click();await page.keyboard.press('ArrowRight');assert.equal(await frame.locator('#seek').inputValue(),'1');await page.keyboard.press('ArrowLeft');assert.equal(await frame.locator('#seek').inputValue(),'0');
  await page.reload();assert.equal(await page.locator('#notes').inputValue(),'目标和：零不能去重');await page.goto(base+'#/problem/leetcode-236');assert.equal(await page.locator('#notes').inputValue(),'旧题笔记保留');
  await page.goto(base+'#/library');await page.locator('#search').fill('目标和');assert.ok((await page.locator('body').textContent()).includes('目标和'));
  await page.goto(pathToFileURL(path.resolve('dist/problems/target-sum/index.html')).href);await page.locator('#example').selectOption('official');await page.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});assert.equal(await page.locator('#answer').textContent(),'方案数：5');assert.deepEqual(errors,[]);
  console.log(`Passed: 494 browser, ${steps} Python/Java snapshot highlights, all nine cases, zero multiplicity, guards, cache, playback, reverse, keyboard, old/new records, search and file URL.`);
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
