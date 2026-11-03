const assert=require('node:assert/strict');
module.exports=async function(page,base){
 for(const [id,slug,examples] of [['216','combination-sum3',['3,7','3,9','4,1','2,18','9,45']],['22','parentheses',['3','1','2','4']]]){
  await page.goto(base+'#/problem/leetcode-'+id);await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  const demo=page.frameLocator('#demo');assert.ok((await demo.locator('.insights').textContent()).includes(id==='216'?'自然为空':'两种选择都合法'));await demo.locator('#next').click();const state=await demo.locator('#slots').textContent(),progress=await demo.locator('#counter').textContent();await demo.locator('#next').click();await demo.locator('#prev').click();assert.equal(await demo.locator('#slots').textContent(),state);
  for(const lang of ['Python','Java']){
   await demo.locator('#lang').selectOption(lang);assert.equal(await demo.locator('#counter').textContent(),progress);
   assert.ok(await demo.locator('body').evaluate(()=>{const e=document.getElementById('seek');for(let i=0;i<=Number(e.max);i++){e.value=i;e.dispatchEvent(new Event('input'));if(document.querySelectorAll('.line.on').length!==1)return false;}return true;}));
   await demo.locator('#seek').evaluate(e=>{e.value=1;e.dispatchEvent(new Event('input'));});
   for(const input of examples){await demo.locator('#example').selectOption(input);await demo.locator('#seek').evaluate(e=>{e.value=e.max;e.dispatchEvent(new Event('input'));});const args=input.split(',').map(Number),expected=require('../../dist/problems/'+slug+'/app.js').trace(...args).answer;assert.equal(await demo.locator('#answers').textContent(),'ans = '+JSON.stringify(expected));}
   await demo.locator('#example').selectOption(examples[0]);await demo.locator('#next').click();
  }
  await demo.locator('#reset').click();await demo.locator('#speed').selectOption('350');await demo.locator('#play').click();await page.waitForTimeout(800);await demo.locator('#play').click();const paused=await demo.locator('#counter').textContent();assert.ok(!paused.startsWith('0 /'));await page.waitForTimeout(450);assert.equal(await demo.locator('#counter').textContent(),paused);
  await page.locator('#notes').fill('新题 '+id+' 回溯笔记');await page.reload();assert.equal(await page.locator('#notes').inputValue(),'新题 '+id+' 回溯笔记');await page.waitForFunction(()=>document.querySelector('#demoStatus')?.textContent.includes('已就绪'));
  await demo.locator('#seek').evaluate(e=>{e.value=10;e.dispatchEvent(new Event('input'));});
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await demo.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'test-results/'+slug+'-'+width+'.png',fullPage:true});}
 }
};
