const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {trace,examples}=require('../../dist/problems/bottom-left/app.js');
for(const [values,expected] of [...examples.map((v,i)=>[v,[1,7,42,9,3][i]]),[[0,-1,-1],-1],[[8,8,8,8,null,null,8],8]]) {
 const {events,nodes}=trace(values),last=events.at(-1);
 assert.equal(nodes[last.answer].val,expected);
 assert.equal(last.queue.length,0);
 assert.equal(last.visited.length,nodes.length);
 assert.equal(new Set(last.visited).size,nodes.length);
 const depths=last.visited.map(id=>nodes[id].depth);
 assert.deepEqual(depths,[...depths].sort((a,b)=>a-b));
 for(const e of events) {
  assert.ok(e.queue.every(id=>!e.visited.includes(id)));
  assert.equal(new Set(e.queue).size,e.queue.length);
 }
}
assert.deepEqual(trace(examples[1]).events.at(-1).visited.map(id=>trace(examples[1]).nodes[id].val),[1,3,2,6,5,4,7]);
// 用独立的左优先 DFS 作为判定，覆盖重复值与不完整树。
let seed=513;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;}
for(let t=0;t<100;t++) {
 const values=[t%3]; let parents=1;
 for(let depth=0;depth<5&&parents;depth++) {
  let next=0;
  for(let i=0;i<parents*2;i++){const v=random()<.35?null:Math.floor(random()*7)-3;values.push(v);if(v!==null)next++;}
  parents=next;
 }
 const {nodes,events}=trace(values);let bestDepth=-1,expected;
 function dfs(n){if(!n)return;if(n.depth>bestDepth){bestDepth=n.depth;expected=n.id;}dfs(n.left);dfs(n.right);}
 dfs(nodes[0]);assert.equal(events.at(-1).answer,expected);
}
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync('dist/catalog.js','utf8'),sandbox);
assert.equal(new Set(sandbox.window.PROBLEMS.map(p=>p.id)).size,sandbox.window.PROBLEMS.length);
for(const p of sandbox.window.PROBLEMS) assert.ok(fs.existsSync('dist/'+p.demo));
console.log('Passed: 513 examples, sparse/duplicate/negative trees, FIFO snapshots, 100 DFS cross-checks and catalog paths.');
