const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {stages}=require('../../dist/problems/robber/app.js');
(async()=>{
 const server=require('../../serve.cjs');await new Promise(r=>server.listening?r():server.once('listening',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||undefined,headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(base+'#/problem/leetcode-198');await page.locator('#notes').fill('四阶段推导，记录保持。');
  const frame=page.frameLocator('#demo');await frame.locator('[data-mode=dp]').waitFor();
  fs.mkdirSync('test-results',{recursive:true});let checks=0;
  for(const [mode,stage]of Object.entries(stages)){
   await frame.locator(`[data-mode=${mode}]`).click();
   assert.equal(await frame.locator('[aria-pressed=true]').getAttribute('data-mode'),mode);
   for(const input of ['[2,7,9,3,1]','[1,2,3,1]','[2,1,1,2]','[5]','[0,0]','[]']){
    await frame.locator('#example').selectOption(input);const expected=stage.trace(JSON.parse(input));
    for(const lang of ['Python','Java']){
     const before=await frame.locator('#seek').inputValue(),state=await frame.locator('#frames').textContent();
     await frame.locator('#lang').selectOption(lang);assert.equal(await frame.locator('#seek').inputValue(),before);assert.equal(await frame.locator('#frames').textContent(),state);
     const lines=await frame.locator('body').evaluate((body,max)=>{
      const seek=document.getElementById('seek'),seen=[];
      for(let i=0;i<=max;i++){seek.value=i;seek.dispatchEvent(new Event('input'));seen.push([...document.querySelectorAll('.line.on')].map(e=>e.textContent.slice(4)));}
      return seen;
     },expected.events.length-1);
     for(let i=0;i<lines.length;i++)assert.deepEqual(lines[i],[stage.snippets[lang][stage.lines[lang][expected.events[i].line]]],`${mode} ${input} ${lang} ${i}`);
     checks+=lines.length;assert.equal(await frame.locator('#answers').textContent(),'最终答案：'+expected.events.at(-1).answer);
    }
   }
   await frame.locator('#example').selectOption('[2,7,9,3,1]');
   await frame.locator('#next').click();const progress=await frame.locator('#counter').textContent();await frame.locator('#next').click();await frame.locator('#prev').click();assert.equal(await frame.locator('#counter').textContent(),progress);
   await frame.locator('#lang').selectOption('Python');assert.equal(await frame.locator('#counter').textContent(),progress);
   await frame.locator('#reset').click();await frame.locator('#speed').selectOption('350');await frame.locator('#play').click();
   await page.waitForFunction(()=>Number(document.getElementById('demo')?.contentDocument?.getElementById('seek')?.value)>0);
   await frame.locator('#play').click();const paused=await frame.locator('#counter').textContent();await page.waitForTimeout(450);assert.equal(await frame.locator('#counter').textContent(),paused);
   await frame.locator('#reset').click();await page.locator('h1').click();await page.keyboard.press('ArrowRight');assert.equal(await frame.locator('#seek').inputValue(),'1');
   await page.keyboard.press('ArrowLeft');assert.equal(await frame.locator('#seek').inputValue(),'0');
   await frame.locator('#example').selectOption('[2,7,9,3,1]');
   if(mode==='memo')await frame.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});
   if(mode==='dp'){await frame.locator('#seek').evaluate(e=>{e.value=6;e.dispatchEvent(new Event('input'));});assert.ok((await frame.locator('#state-grid').textContent()).includes('f[3]11'));}
   if(mode==='rolling')await frame.locator('#seek').evaluate(e=>{e.value=7;e.dispatchEvent(new Event('input'));});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await frame.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await frame.locator('body').screenshot({path:`test-results/robber-${mode}-desktop.png`});
   assert.equal(await page.locator('#notes').inputValue(),'四阶段推导，记录保持。');
  }
  await page.reload();assert.equal(await page.locator('#notes').inputValue(),'四阶段推导，记录保持。');
  await page.goto(pathToFileURL(path.resolve('dist/problems/robber/index.html')).href);
  for(const mode of Object.keys(stages)){await page.locator(`[data-mode=${mode}]`).click();await page.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});assert.equal(await page.locator('#answers').textContent(),'最终答案：12');}
  assert.deepEqual(errors,[]);console.log(`Passed: robber four stages, all examples and ${checks} dual-language step checks, playback, pause, reverse, keyboard, notes, desktop and file URL.`);
 }finally{if(browser)await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
