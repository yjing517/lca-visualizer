const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync,execFileSync}=require('node:child_process');
const {snippets}=require('../../dist/problems/target-sum/app.js');
const data=JSON.parse(fs.readFileSync('tools/traces/target-sum.json','utf8'));
const map=JSON.parse(fs.readFileSync('tools/target-sum-line-maps.json','utf8'));
function oracle(nums,target){let count=0;for(let mask=0;mask<2**nums.length;mask++){let sum=0;for(let i=0;i<nums.length;i++)sum+=(mask>>i&1)?nums[i]:-nums[i];if(sum===target)count++;}return count;}
for(const c of data.cases){
 assert.equal(c.answer,oracle(c.nums,c.target),c.id);assert.equal(c.solutions.length,c.answer);assert.equal(c.events.at(-1).value,c.answer);assert.equal(c.events.at(-1).kind,'done');
 assert.equal(c.events.at(-1).calls,Object.keys(c.events.at(-1).memo).length);assert.deepEqual(c.events[0].memo,{});
 for(const e of c.events){assert.equal(typeof snippets.Python[e.line],'string');assert.equal(typeof snippets.Java[e.javaLine],'string');assert.ok(snippets.Java[e.javaLine].trim());
  if(e.kind==='hit'){const key=e.stack.at(-1).join(',');assert.equal(e.value,e.memo[key]);assert.equal(e.javaLine,map.cacheHitJava);}
 }
}
assert.ok(data.cases.find(c=>c.id==='official').events.some(e=>e.kind==='hit'));
assert.equal(data.cases.find(c=>c.id==='all-zero').answer,8);
for(const key of ['odd','too-negative']){const c=data.cases.find(c=>c.id===key);assert.equal(c.events.at(-1).calls,0);}
assert.match(snippets.Java[map.lines['14']],/ways = dfs\(i - 1, c, nums, memo\);/);
assert.match(snippets.Java[map.lines['15']],/dfs\(i - 1, c, nums, memo\) \+ dfs\(i - 1, c - nums\[i\]/);
assert.match(snippets.Java[map.lines['12']],/c == 0 \? 1 : 0/);
const fixtures=[];
for(let n=0;n<=7;n++)for(let seed=0;seed<12;seed++)for(const target of [-11,-3,0,2,7,11]){const nums=Array.from({length:n},(_,i)=>(seed*7+i*3)%4);fixtures.push({nums,target,answer:oracle(nums,target)});}
fixtures.push({nums:Array(20).fill(0),target:0,answer:2**20},{nums:[1000],target:-1000,answer:1});
const py=`import json\n${snippets.Python.join('\n')}\nfor c in json.loads(input()):\n    assert Solution().findTargetSumWays(c['nums'],c['target']) == c['answer'], c\n`;
let run=spawnSync('python',['-c',py],{input:JSON.stringify(fixtures),encoding:'utf8'});assert.equal(run.status,0,run.stderr||run.error?.message);
const root=path.resolve('test-results/target-sum');fs.mkdirSync(root,{recursive:true});
const source=snippets.Java.join('\n')+'\nclass TargetSumCheck { public static void main(String[] args) { int[][] inputs={'+fixtures.map(c=>'new int[]{'+c.nums.join(',')+'}').join(',')+'}; int[] targets={'+fixtures.map(c=>c.target).join(',')+'}; int[] answers={'+fixtures.map(c=>c.answer).join(',')+'}; for(int i=0;i<inputs.length;i++) if(new Solution().findTargetSumWays(inputs[i],targets[i])!=answers[i]) throw new AssertionError("case "+i); }}';
const file=path.join(root,'TargetSumCheck.java');fs.writeFileSync(file,source);
run=spawnSync('javac',['-encoding','UTF-8','-d',root,file],{encoding:'utf8'});assert.equal(run.status,0,run.stderr||run.error?.message);
run=spawnSync('java',['-cp',root,'TargetSumCheck'],{encoding:'utf8'});assert.equal(run.status,0,run.stderr||run.error?.message);
execFileSync('python',['tools/build-target-sum.py','--check'],{stdio:'inherit'});
console.log(`Passed: 494, ${fixtures.length} actual Python/Java cases vs independent sign assignments, zero multiplicity, guards, cache hits, semantic maps and complete snapshot replay.`);
