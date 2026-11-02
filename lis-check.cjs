const assert=require('node:assert/strict');const {trace,snippets,highlightLines}=require('./dist/problems/lis/app.js');
function oracle(a,nonStrict){const f=a.map(()=>1);for(let i=0;i<a.length;i++)for(let j=0;j<i;j++)if(nonStrict?a[j]<=a[i]:a[j]<a[i])f[i]=Math.max(f[i],f[j]+1);return Math.max(0,...f);}
for(let n=0;n<=7;n++)for(let seed=0;seed<80;seed++){
 const a=Array.from({length:n},(_,i)=>((seed>>(i%5))+i*seed)%7-3);
 for(const mode of ['strict','screenshot']){const d=trace(a,mode);assert.equal(d.answer,oracle(a,mode==='screenshot'));
 for(const e of d.events){assert.ok(e.ng<=a.length);if(e.i>=0&&e.i<a.length)assert.deepEqual(e.nums.slice(e.i+1),a.slice(e.i+1));
 for(const lang of ['Python','Java'])assert.equal(typeof snippets[lang][highlightLines[lang][e.line]],'string');}
 }
}
assert.equal(trace([7,7,7,7,7,7,7]).answer,1);assert.equal(trace([7,7,7,7,7,7,7],'screenshot').answer,7);
assert.equal(trace([10,9,2,5,3,7,101,18]).answer,4);assert.equal(trace([0,1,0,3,2,3]).answer,4);
assert.deepEqual(trace([3,5,6,2,4]).events.at(-1).tails,[2,4,6]);
for(const bad of [[NaN],[10001],Array(21).fill(1)])assert.throws(()=>trace(bad));
const {spawnSync}=require('node:child_process');const py=snippets.Python.join('\n')+'\nassert Solution().lengthOfLIS([7,7,7]) == 1\nassert Solution().lengthOfLIS([0,1,0,3,2,3]) == 4';const run=spawnSync('python',['-c',py],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
console.log('Passed: LIS vs quadratic DP in both modes, duplicate counterexample, input overwrite safety, code maps and actual Python.');

const fs=require('node:fs'),path=require('node:path');const dir=path.resolve('test-results/lis-java');fs.mkdirSync(dir,{recursive:true});
const main='public class LisCodeCheck { public static void main(String[] args) { if(new Solution().lengthOfLIS(new int[]{7,7,7})!=1 || new Solution().lengthOfLIS(new int[]{10,9,2,5,3,7,101,18})!=4 || new Solution().lengthOfLIS(new int[]{0,1,0,3,2,3})!=4 || new Solution().lengthOfLIS(new int[]{})!=0 || new ScreenshotSolution().lengthOfLIS(new int[]{7,7,7})!=3) throw new AssertionError(); } }';
const source=main+'\n'+snippets.Java.join('\n')+'\n'+snippets.Java.join('\n').replace('class Solution','class ScreenshotSolution').replace('nums[mid] >= x','nums[mid] > x');
fs.writeFileSync(path.join(dir,'LisCodeCheck.java'),source);const compile=spawnSync('javac',['-encoding','UTF-8','-d',dir,path.join(dir,'LisCodeCheck.java')],{encoding:'utf8'});assert.equal(compile.status,0,compile.stderr);const java=spawnSync('java',['-cp',dir,'LisCodeCheck'],{encoding:'utf8'});assert.equal(java.status,0,java.stderr);console.log('Passed: actual Java strict and screenshot implementations.');
