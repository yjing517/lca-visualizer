function trace(nums) {
 if(!Array.isArray(nums)||nums.length>8||nums.some(x=>!Number.isInteger(x)||x<0||x>400))throw Error('演示支持至多 8 个 0—400 的整数');
 const events=[],nodes=[],stack=[],counts={};let answer=null;
 const emit=(line,message,node,extra={})=>events.push({line,message,node,stack:[...stack],counts:{...counts},answer,...extra});
 function dfs(i,parent=null,branch='入口'){
  const id=nodes.length;nodes.push({id,parent,i,branch});stack.push(i);counts[i]=(counts[i]||0)+1;
  emit('check',`进入 dfs(${i})：求 nums[0..${i}] 的最优金额；这是该状态第 ${counts[i]} 次计算。`,id);
  if(i<0){emit('zero','没有房屋可选，返回 0；只返回上一层。',id,{value:0});stack.pop();return 0;}
  emit('skip',`不选下标 ${i}（金额 ${nums[i]}）：调用 dfs(${i-1})，相邻房屋仍可选。`,id);
  const skip=dfs(i-1,id,'不选');
  emit('take',`不选分支返回 ${skip}。选当前房屋时必须跳过相邻的 ${i-1}，调用 dfs(${i-2})。`,id,{skip});
  const previous=dfs(i-2,id,'选');const take=previous+nums[i];const value=Math.max(skip,take);
  emit('max',`不选得 ${skip}；选得 dfs(${i-2}) + ${nums[i]} = ${take}。max(${skip}, ${take}) = ${value}。`,id,{skip,take,value});
  emit('return',`dfs(${i}) 返回 ${value}，父调用从暂停处继续。`,id,{value});stack.pop();return value;
 }
 emit('start','dfs(i) 只考虑前 i+1 间，不代表一定选 i；从最后一间往前考虑。',null);
 answer=dfs(nums.length-1);emit('done',`最大金额为 ${answer}。相同 i 的重复调用返回相同结果，可用记忆化消除重复。`,null);
 return {events,nodes};
}
const snippets={Python:[
 'from typing import List',
 'class Solution:',
 '    def rob(self, nums: List[int]) -> int:',
 '        n = len(nums)',
 '        def dfs(i):',
 '            if i < 0:',
 '                return 0',
 '            skip = dfs(i - 1)',
 '            take = dfs(i - 2) + nums[i]',
 '            res = max(skip, take)',
 '            return res',
 '        return dfs(n - 1)'
],Java:[
 'class Solution {',
 '    public int rob(int[] nums) {',
 '        return dfs(nums.length - 1, nums);',
 '    }',
 '    private int dfs(int i, int[] nums) {',
 '        if (i < 0) {',
 '            return 0;',
 '        }',
 '        int skip = dfs(i - 1, nums);',
 '        int take = dfs(i - 2, nums) + nums[i];',
 '        int res = Math.max(skip, take);',
 '        return res;',
 '    }',
 '}'
]};
const highlightLines={Python:{start:3,check:5,zero:6,skip:7,take:8,max:9,return:10,done:11},Java:{start:2,check:5,zero:6,skip:8,take:9,max:10,return:11,done:2}};
const stageSnippets={
  "memo": {
    "Python": [
      "from functools import cache",
      "from typing import List",
      "class Solution:",
      "    def rob(self, nums: List[int]) -> int:",
      "        @cache",
      "        def dfs(i):",
      "            if i < 0:",
      "                return 0",
      "            skip = dfs(i - 1)",
      "            take = dfs(i - 2) + nums[i]",
      "            return max(skip, take)",
      "        return dfs(len(nums) - 1)"
    ],
    "Java": [
      "import java.util.HashMap;",
      "import java.util.Map;",
      "class Solution {",
      "    public int rob(int[] nums) {",
      "        return dfs(nums.length - 1, nums, new HashMap<>());",
      "    }",
      "    private int dfs(int i, int[] nums, Map<Integer, Integer> memo) {",
      "        if (memo.containsKey(i)) {",
      "            return memo.get(i);",
      "        }",
      "        if (i < 0) {",
      "            memo.put(i, 0);",
      "            return 0;",
      "        }",
      "        int skip = dfs(i - 1, nums, memo);",
      "        int take = dfs(i - 2, nums, memo) + nums[i];",
      "        int best = Math.max(skip, take);",
      "        memo.put(i, best);",
      "        return best;",
      "    }",
      "}"
    ]
  },
  "dp": {
    "Python": [
      "from typing import List",
      "class Solution:",
      "    def rob(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        f = [0] * (n + 1)",
      "        if n == 0:",
      "            return 0",
      "        f[1] = nums[0]",
      "        for i in range(2, n + 1):",
      "            skip = f[i - 1]",
      "            take = f[i - 2] + nums[i - 1]",
      "            best = max(skip, take)",
      "            f[i] = best",
      "        return f[n]"
    ],
    "Java": [
      "class Solution {",
      "    public int rob(int[] nums) {",
      "        int n = nums.length;",
      "        int[] f = new int[n + 1];",
      "        if (n == 0) {",
      "            return 0;",
      "        }",
      "        f[1] = nums[0];",
      "        for (int i = 2; i <= n; i++) {",
      "            int skip = f[i - 1];",
      "            int take = f[i - 2] + nums[i - 1];",
      "            int best = Math.max(skip, take);",
      "            f[i] = best;",
      "        }",
      "        return f[n];",
      "    }",
      "}"
    ]
  },
  "rolling": {
    "Python": [
      "from typing import List",
      "class Solution:",
      "    def rob(self, nums: List[int]) -> int:",
      "        f0 = 0",
      "        f1 = 0",
      "        for x in nums:",
      "            new_f = max(f1, f0 + x)",
      "            f0 = f1",
      "            f1 = new_f",
      "        return f1"
    ],
    "Java": [
      "class Solution {",
      "    public int rob(int[] nums) {",
      "        int f0 = 0;",
      "        int f1 = 0;",
      "        for (int x : nums) {",
      "            int newF = Math.max(f1, f0 + x);",
      "            f0 = f1;",
      "            f1 = newF;",
      "        }",
      "        return f1;",
      "    }",
      "}"
    ]
  }
};
function validate(nums) {
 if(!Array.isArray(nums)||nums.length>8||nums.some(x=>!Number.isInteger(x)||x<0||x>400))throw Error('演示支持至多 8 个 0—400 的整数');
}
function traceMemo(nums) {
 validate(nums);
 const events=[],nodes=[],stack=[],counts={},cache={};let hits=0,answer=null;
 const emit=(line,message,node,extra={})=>events.push({line,message,node,stack:[...stack],counts:{...counts},cache:{...cache},hits,answer,...extra});
 function dfs(i,parent=null,branch='入口') {
  const id=nodes.length;nodes.push({id,parent,i,branch});stack.push(i);
  emit('check',`请求 dfs(${i})：先检查这个状态是否已经求过。`,id);
  if(Object.hasOwn(cache,i)) {hits++;emit('hit',`命中缓存：dfs(${i}) = ${cache[i]}，直接返回，不再展开子调用。`,id,{value:cache[i]});stack.pop();return cache[i];}
  counts[i]=(counts[i]||0)+1;
  if(i<0){cache[i]=0;emit('zero',`dfs(${i}) 没有房屋，返回 0；@cache 也会缓存这个边界结果。`,id,{value:0});stack.pop();return 0;}
  emit('skip',`缓存中没有 dfs(${i})。先求不选当前房屋的 dfs(${i-1})。`,id);
  const skip=dfs(i-1,id,'不选');
  emit('take',`不选得到 ${skip}；选下标 ${i} 时，跳过相邻房屋，求 dfs(${i-2}) + ${nums[i]}。`,id,{skip});
  const take=dfs(i-2,id,'选')+nums[i],value=Math.max(skip,take);
  cache[i]=value;emit('store',`max(${skip}, ${take}) = ${value}。保存 dfs(${i}) 的答案，以后直接读取。`,id,{skip,take,value});
  emit('return',`dfs(${i}) 返回 ${value}。`,id,{value});stack.pop();return value;
 }
 emit('start','递归方向与暴力版相同，只增加缓存：每个状态的函数体最多执行一次。',null);
 answer=dfs(nums.length-1);emit('done',`最大金额为 ${answer}，缓存命中 ${hits} 次。自顶向下，只消除重复求值。`,null);
 return {events,nodes};
}
function traceDP(nums) {
 validate(nums);
 const events=[],f=Array(nums.length+1).fill(null);f[0]=0;
 const emit=(line,message,extra={})=>events.push({line,message,f:[...f],stack:[],answer:null,...extra});
 emit('start','f[i] 表示前 i 间房屋的最优金额。f[0] = 0；未推导的格子显示 ?（代码数组先分配为 0）。',{i:0});
 if(!nums.length){emit('empty','没有房屋，直接返回 0，不访问 nums[0] 或 f[1]。',{i:0,answer:0});return {events,nodes:[]};}
 if(nums.length) {
  f[1]=nums[0];emit('base',`只有第一间房屋，f[1] = nums[0] = ${nums[0]}。`,{i:1,value:f[1]});
 }
 for(let i=2;i<=nums.length;i++) {
  const skip=f[i-1],take=f[i-2]+nums[i-1],value=Math.max(skip,take);
  emit('compare',`前 ${i} 间：不选下标 ${i-1} 得 f[${i-1}] = ${skip}；选它得 f[${i-2}] + nums[${i-1}] = ${take}。`,{i,skip,take,value});
  f[i]=value;emit('write',`写入 f[${i}] = max(${skip}, ${take}) = ${value}。这里 i 是房屋数量，当前房屋下标是 i−1。`,{i,skip,take,value});
 }
 emit('done',`f[${nums.length}] = ${f[nums.length]}，即全部房屋的最优金额。`,{i:nums.length,answer:f[nums.length]});
 return {events,nodes:[]};
}
function traceRolling(nums) {
 validate(nums);
 const events=[];let f0=0,f1=0;
 const emit=(line,message,extra={})=>events.push({line,message,f0,f1,newF:null,stack:[],answer:null,...extra});
 emit('start','开始时 f0 = f1 = 0。每轮开始：f0 是前 i−2 间的最优值，f1 是前 i−1 间的最优值。',{i:0});
 nums.forEach((x,index)=>{
  const i=index+1,skip=f1,take=f0+x,newF=Math.max(skip,take);
  emit('compare',`处理第 ${i} 间（下标 ${index}，金额 ${x}）：new_f = max(旧 f1 ${f1}, 旧 f0 ${f0} + ${x}) = ${newF}。先算新值，暂不覆盖旧值。`,{i,x,skip,take,newF});
  f0=f1;emit('shift',`先把旧 f1 保存到 f0，得到 f0 = ${f0}；new_f = ${newF} 已保留，不会误用更新后的 f0。`,{i,x,skip,take,newF});
  f1=newF;emit('write',`再把 new_f 写入 f1 = ${f1}。本轮结束：f0 = f[${i-1}]，f1 = f[${i}]。`,{i,x,skip,take,newF});
 });
 emit('done',`最终 f1 = ${f1}。只保存两个历史状态和一个新值，额外空间 O(1)。`,{i:nums.length,answer:f1,newF:nums.length?f1:null});
 return {events,nodes:[]};
}
const stageLines={
 memo:{Python:{start:11,check:5,hit:4,zero:7,skip:8,take:9,store:10,return:10,done:11},Java:{start:4,check:6,hit:8,zero:11,skip:14,take:15,store:17,return:18,done:4}},
 dp:{Python:{start:4,empty:6,base:7,compare:11,write:12,done:13},Java:{start:3,empty:5,base:7,compare:11,write:12,done:14}},
 rolling:{Python:{start:3,compare:6,shift:7,write:8,done:9},Java:{start:2,compare:5,shift:6,write:7,done:9}}
};
const stages={
 brute:{title:'暴力递归',trace,snippets,lines:highlightLines,definition:'dfs(i)：下标 0 到 i 的最优金额，不要求偷第 i 间。',formula:'dfs(i) = max(dfs(i−1), dfs(i−2) + nums[i])',cost:'时间 O(2ⁿ)（更紧为 Θ(φⁿ)） · 递归栈 O(n)',change:'先把“选或不选”写出来，观察同一个 dfs(i) 为什么会重复出现。'},
 memo:{title:'记忆化搜索',trace:traceMemo,snippets:stageSnippets.memo,lines:stageLines.memo,definition:'dfs(i) 含义不变；已经求过的状态直接读缓存。',formula:'相同的 dfs(i) 只计算一次',cost:'时间 O(n) · 缓存与递归栈 O(n)',change:'Python 的 @cache 自动保存返回值；Java 用 Map 显式缓存。命中缓存时不再进入子递归。'},
 dp:{title:'递推 DP',trace:traceDP,snippets:stageSnippets.dp,lines:stageLines.dp,definition:'f[i]：前 i 间房屋的最优金额。i 是数量，当前房屋下标为 i−1。',formula:'f[i] = max(f[i−1], f[i−2] + nums[i−1])',cost:'时间 O(n) · DP 数组 O(n)',change:'递归 dfs(i) 对应数组 f[i+1]。依赖的都是更小的状态，因此从左往右填表。'},
 rolling:{title:'滚动变量',trace:traceRolling,snippets:stageSnippets.rolling,lines:stageLines.rolling,definition:'每轮开始：f0 对应 f[i−2]，f1 对应 f[i−1]；首轮的边界收益都为 0。',formula:'new_f = max(f1, f0 + x) → f0 = f1 → f1 = new_f',cost:'时间 O(n) · 额外空间 O(1)',change:'先用两个旧值算 new_f，再依次更新 f0、f1。不要先覆盖 f0，再拿新 f0 去算本轮答案。'}
};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines,traceMemo,traceDP,traceRolling,stages};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null,mode='brute';
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const stage=stages[mode],e=data.events[index],lang=$('lang').value,nums=JSON.parse($('example').value);
  $('code').replaceChildren(...stage.snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(stage.lines[lang][e.line]===i?' on':'');el.textContent=(i+1).toString().padStart(2)+'  '+line;return el;}));
  const current=mode==='brute'||mode==='memo'?e.stack.at(-1):(e.i||0)-1;
  $('houses').replaceChildren(...nums.map((value,i)=>{const el=document.createElement('div');el.className='house'+(current===i?' active':'');el.innerHTML='<span>房屋 '+(i+1)+'</span><b>'+value+'</b><small>下标 '+i+'</small>';return el;}));
  if(!nums.length)$('houses').textContent='空数组：没有房屋，收益为 0。';
  const recursive=mode==='brute'||mode==='memo';
  $('calls').hidden=!recursive;
  if(recursive){
   const seen=data.events.slice(0,index+1),visible=new Set(seen.map(x=>x.node));
   $('calls').replaceChildren(...data.nodes.filter(n=>visible.has(n.id)).map(n=>{
    const row=document.createElement('div');row.className='call'+(n.id===e.node?' active':'');
    let depth=0,parent=n.parent;while(parent!==null){depth++;parent=data.nodes[parent].parent;}
    row.style.paddingLeft=(12+Math.min(7,depth)*13)+'px';
    const result=seen.findLast(x=>x.node===n.id&&['return','zero','hit'].includes(x.line));
    row.textContent='#'+n.id+' '+n.branch+' → dfs('+n.i+')'+(result?' = '+result.value:'')+(result?.line==='hit'?' · 缓存命中':(e.counts[n.i]>1?' · 重复计算':''));
    if(n.id===e.node)row.dataset.active='true';return row;
   }));
   const active=$('calls').querySelector('[data-active]');if(active)$('calls').scrollTop=active.offsetTop-$('calls').offsetTop-80;
  }
  $('frames').textContent=recursive?(e.stack.length?e.stack.map(i=>'dfs('+i+')').join(' → ')+' ← 栈顶':'∅ 空栈'):mode==='dp'?'前缀状态：f['+(e.i||0)+']':'滚动到第 '+(e.i||0)+' 间房屋';
  $('state-grid').hidden=mode==='brute';
  const cells=mode==='brute'?[]:mode==='memo'?Object.entries(e.cache).sort((a,b)=>Number(a[0])-Number(b[0])).map(([k,v])=>['dfs('+k+')',v]):mode==='dp'?e.f.map((v,i)=>['f['+i+']',v]):[['f0',e.f0],['f1',e.f1],['new_f',e.newF]];
  $('state-grid').replaceChildren(...cells.map(([key,value],i)=>{const cell=document.createElement('div');cell.className='state-cell'+(mode==='dp'&&i===e.i?' active':'');const label=document.createElement('span'),number=document.createElement('b');label.textContent=key;number.textContent=value??'?';cell.append(label,number);return cell;}));
  $('state-caption').textContent=mode==='memo'?'缓存命中 '+e.hits+' 次；下面是当前已保存的返回值。':mode==='dp'?'? 表示尚未推导。高亮格是当前处理的前缀长度。':mode==='rolling'?'对照解释观察：先算 new_f，再移动两个旧状态。':'调用次数：'+Object.values(e.counts).reduce((a,b)=>a+b,0)+'；相同下标可能被重复计算。';
  $('answers').textContent=e.answer!==null?'最终答案：'+e.answer:recursive?'当前返回值：'+(e.value??'等待下一步'):mode==='dp'?'本轮候选最优值：'+(e.value??'等待计算'):'本轮新值：'+(e.newF??'等待计算');
  $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;
  $('result').textContent=recursive?'当前递归深度 '+e.stack.length:'当前前缀 '+(e.i||0)+' / '+nums.length+' 间';
  $('counter').textContent=index+' / '+(data.events.length-1);$('seek').value=index;$('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=stages[mode].trace(JSON.parse($('example').value));index=0;$('seek').max=data.events.length-1;render();}
 function changeMode(next){mode=next;const stage=stages[mode];document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));$('definition').textContent=stage.definition;$('formula').textContent=stage.formula;$('cost').textContent=stage.cost;$('stage-change').textContent=stage.change;reset();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>changeMode(button.dataset.mode));
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};changeMode('brute');
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}
