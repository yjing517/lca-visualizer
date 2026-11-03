const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {stages}=require('../../dist/problems/robber/app.js');
function brute(a){let best=0;for(let mask=0;mask<1<<a.length;mask++){if(mask&(mask<<1))continue;let total=0;for(let i=0;i<a.length;i++)if(mask>>i&1)total+=a[i];best=Math.max(best,total);}return best;}
const fixtures=[[],[5],[0,0],[2,7,9,3,1],[1,2,3,1],[2,1,1,2],[2,7,9],Array(8).fill(400)];
for(let n=0;n<=8;n++)for(let seed=0;seed<12;seed++)fixtures.push(Array.from({length:n},(_,i)=>(seed*7+i*3)%11));
for(const [mode,stage]of Object.entries(stages)){
 for(const a of fixtures){
  const d=stage.trace(a),events=d.events;assert.equal(events.at(-1).answer,brute(a));assert.deepEqual(events.at(-1).stack,[]);
  for(const e of events)for(const lang of ['Python','Java'])assert.equal(typeof stage.snippets[lang][stage.lines[lang][e.line]],'string',mode+' '+lang+' '+e.line);
  if(mode==='memo'){for(const count of Object.values(events.at(-1).counts))assert.equal(count,1);assert.deepEqual(events[0].cache,{});}
  if(mode==='dp'){assert.equal(events[0].f[0],0);assert.ok(events[0].f.slice(1).every(x=>x===null));for(const e of events.filter(x=>x.line==='write'))assert.equal(e.f[e.i],brute(a.slice(0,e.i)));}
  if(mode==='rolling')for(let i=0;i<a.length;i++){
   const before=events[1+i*3],shift=events[2+i*3],write=events[3+i*3];
   assert.equal(before.f0,brute(a.slice(0,Math.max(0,i-1))));assert.equal(before.f1,brute(a.slice(0,i)));
   assert.equal(before.newF,Math.max(before.f1,before.f0+a[i]));assert.equal(shift.f0,before.f1);assert.equal(shift.f1,before.f1);assert.equal(write.f1,before.newF);
  }
 }
 for(const bad of [null,[-1],[401],Array(9).fill(1),[1.5]])assert.throws(()=>stage.trace(bad));
}
const demo=stages.memo.trace([2,7,9,3,1]).events;
assert.ok(demo.some(e=>e.line==='hit'));assert.ok(demo.filter(e=>e.line==='skip').length<stages.brute.trace([2,7,9,3,1]).events.filter(e=>e.line==='skip').length);
assert.deepEqual(stages.dp.trace([2,7,9,3,1]).events.at(-1).f,[0,2,7,11,11,12]);
const expected=fixtures.map(brute);
const python=`import json\ncases=json.loads(${JSON.stringify(JSON.stringify(fixtures))})\nanswers=json.loads(${JSON.stringify(JSON.stringify(expected))})\n`+Object.entries(stages).map(([mode,s])=>`exec(${JSON.stringify(s.snippets.Python.join('\n'))})\nfor a,want in zip(cases,answers):\n    assert Solution().rob(a)==want, (${JSON.stringify(mode)},a,want)\n`).join('');
let run=spawnSync('python',['-'],{input:python,encoding:'utf8'});assert.equal(run.status,0,run.stderr||run.error?.message);
const names=Object.keys(stages).map((k,i)=>'RobStage'+i);
const classes=Object.values(stages).map((s,i)=>s.snippets.Java.filter(l=>!l.startsWith('import ')).join('\n').replace('class Solution','class '+names[i])).join('\n');
const arrays=fixtures.map(a=>'new int[]{'+a.join(',')+'}').join(',');
const source='import java.util.Map;\nimport java.util.HashMap;\n'+classes+'\npublic class RobberStageCheck { public static void main(String[] args) { int[][] cases={'+arrays+'}; int[] expected={'+expected.join(',')+'}; for(int i=0;i<cases.length;i++){'+names.map(name=>'if(new '+name+'().rob(cases[i].clone())!=expected[i])throw new AssertionError("'+name+' case "+i);').join('')+'}}}';
const dir=path.resolve('test-results/robber-stages');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'RobberStageCheck.java');fs.writeFileSync(file,source);
run=spawnSync('javac',['-encoding','UTF-8','-d',dir,file],{encoding:'utf8'});assert.equal(run.status,0,run.stderr||run.error?.message);
run=spawnSync('java',['-cp',dir,'RobberStageCheck'],{encoding:'utf8'});assert.equal(run.status,0,run.stderr||run.error?.message);
console.log(`Passed: four robber stages, ${fixtures.length} exhaustive-oracle fixtures per stage, actual Python/Java, memo hits, DP prefixes, rolling update order and all line maps.`);
