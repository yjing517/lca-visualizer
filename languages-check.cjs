const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync('dist/catalog.js','utf8'),sandbox);
for(const problem of sandbox.window.PROBLEMS) {
 const demo=path.join('dist',problem.demo),html=fs.readFileSync(demo,'utf8');
 const selector=html.match(/<select\b[^>]*\bid="lang"[^>]*>([\s\S]*?)<\/select>/);
 assert.ok(selector,`${problem.id}: 缺少语言选择器`);
 const options=[...selector[1].matchAll(/<option\b([^>]*)>([^<]*)<\/option>/g)].map(m=>m[1].match(/\bvalue="([^"]+)"/)?.[1]??m[2].trim());
 const scripts=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>fs.readFileSync(path.join(path.dirname(demo),m[1]),'utf8')).join('\n');
 const snippets=require('./read-snippets.cjs')(scripts);
 for(const lang of ['Python','Java']) {
  assert.ok(options.includes(lang),`${problem.id}: 缺少 ${lang} 选项`);
  assert.ok(Array.isArray(snippets[lang])&&snippets[lang].length>0,`${problem.id}: 缺少 ${lang} 实现`);
  assert.ok(snippets[lang].every(line=>typeof line==='string'),`${problem.id}: ${lang} 代码行无效`);
  assert.match(snippets[lang].join('\n'),lang==='Python'?/def \w+\(/:/(?:^|\n)\s*(?:(?:public|private|protected)\s+)?(?:int|long|double|boolean|void|String|TreeNode|ListNode|Node|List)(?:[\w<>, ?\[\]]*)\s+\w+\(/,`${problem.id}: ${lang} 必须包含算法方法`);
  assert.match(snippets[lang].join('\n'),lang==='Python'?/\breturn\b|->\s*None\s*:/:/\breturn\b|\bvoid\s+\w+\(/,`${problem.id}: ${lang} 必须返回结果或原地修改`);
 }
}
console.log('Passed: every catalog problem provides Python/Java implementations and language options.');
