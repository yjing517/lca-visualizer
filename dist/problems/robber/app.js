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
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value,nums=JSON.parse($('example').value);
  $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');el.textContent=(i+1).toString().padStart(2)+'  '+line;return el;}));
  $('houses').innerHTML=nums.map((v,i)=>'<div class="frame" style="'+(e.stack.at(-1)===i?'background:#ffedcf;border-color:#d69839':'')+'">⌂ '+v+'<br>下标 '+i+'</div>').join('');
  $('frames').textContent=e.stack.length?e.stack.map(i=>'dfs('+i+')').join(' → ')+' ← 栈顶':'∅ 空栈';
  const visible=new Set(data.events.slice(0,index+1).map(x=>x.node));
  $('calls').replaceChildren(...data.nodes.filter(n=>visible.has(n.id)).map(n=>{const row=document.createElement('div');row.className='frame';row.style.marginLeft=Math.min(7,depth(n))*12+'px';row.style.background=n.id===e.node?'#ffedcf':'';if(n.id===e.node)row.dataset.active='true';const result=data.events.slice(0,index+1).findLast(x=>x.node===n.id&&['return','zero'].includes(x.line));row.textContent='#'+n.id+(n.parent===null?'':' ← #'+n.parent)+' '+n.branch+' → dfs('+n.i+')'+(result?' = '+result.value:'')+(e.counts[n.i]>1?' · 重复状态':'');return row;}));
  const active=$('calls').querySelector('[data-active]');if(active)$('calls').scrollTop=active.offsetTop-$('calls').offsetTop-100;
  function depth(n){return n.parent===null?0:1+depth(data.nodes[n.parent]);}
  $('answers').textContent=e.answer===null?'当前返回值：'+(e.value??'等待子调用'):'最终答案：'+e.answer;
  $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;$('result').textContent='已调用 '+e.stack.length+' 层';
  $('counter').textContent=index+' / '+(data.events.length-1);$('seek').value=index;$('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace(JSON.parse($('example').value));index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}
