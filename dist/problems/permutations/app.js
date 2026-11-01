function trace(nums) {
 if(!Array.isArray(nums)||nums.length<1||nums.length>6||new Set(nums).size!==nums.length||nums.some(x=>!Number.isInteger(x)||x < -10||x > 10))throw Error('需要 1—6 个互不相同的整数，范围 −10…10');
 const n=nums.length,events=[],path=Array(n).fill(0),ans=[],stack=[],nodes=[{id:'root',parent:null,label:'开始',depth:0}],seen=[];
 const emit=(line,message,node='root',i=0,s=nums)=>events.push({line,message,node,i,s:[...s],path:[...path],ans:ans.map(a=>[...a]),stack:[...stack],seen:[...seen]});
 emit('start','每层填一个位置；剩余集合排除已经选择的数字。');
 emit('init','建立固定长度 path 和空答案。只有有效前缀属于当前排列。');
 function dfs(i,s,parent){
  stack.push(`dfs(${i}, {${s.join(',')}})`);
  emit('check',`检查 i = ${i} 是否等于 n = ${n}。`,parent,i,s);
  if(i===n){ans.push([...path]);seen.push(parent);emit('save','已填满，复制 path 保存一个独立答案。',parent,i,s);emit('return','结束当前调用，回到父层递归语句之后。',parent,i,s);stack.pop();return;}
  for(const x of s){
   emit('loop',`从本层剩余集合枚举 x = ${x}。`,parent,i,s);
   path[i]=x;const id=path.slice(0,i+1).join('/');nodes.push({id,parent,label:String(x),depth:i+1});
   emit('assign',`path[${i}] = ${x}：覆盖格子，不增加数组长度。`,id,i+1,s);
   const next=s.filter(v=>v!==x);
   emit('call',`创建新集合 {${next.join(',')}} 并调用 dfs(${i+1}, s−{${x}})。父层集合不变。`,id,i+1,next);dfs(i+1,next,id);
   emit('resume',`返回父层 i = ${i}，有效前缀缩回前 ${i} 格，旧值等待覆盖；继续本层循环。`,parent,i,s);
  }
  emit('end','本层候选遍历完毕，自然返回上一层。',parent,i,s);stack.pop();
 }
 dfs(0,nums,'root');emit('done',`完成，共 ${ans.length} 个排列。`);return {events,nodes};
}
const snippets={"Python": ["from typing import List", "class Solution:", "    def permute(self, nums: List[int]) -> List[List[int]]:", "        n = len(nums)", "        ans = []", "        path = [0] * n", "        def dfs(i, s):", "            if i == n:", "                ans.append(path.copy())", "                return", "            for x in s:", "                path[i] = x", "                dfs(i + 1, s - {x})", "        dfs(0, set(nums))", "        return ans"], "Java": ["import java.util.ArrayList;", "import java.util.List;", "import java.util.Set;", "import java.util.LinkedHashSet;", "class Solution {", "    public List<List<Integer>> permute(int[] nums) {", "        List<List<Integer>> ans = new ArrayList<>();", "        Set<Integer> s = new LinkedHashSet<>();", "        for (int x : nums) s.add(x);", "        dfs(0, s, new int[nums.length], ans);", "        return ans;", "    }", "    private void dfs(int i, Set<Integer> s, int[] path, List<List<Integer>> ans) {", "        if (i == path.length) {", "            List<Integer> copy = new ArrayList<>();", "            for (int x : path) copy.add(x);", "            ans.add(copy);", "            return;", "        }", "        for (int x : s) {", "            path[i] = x;", "            Set<Integer> next = new LinkedHashSet<>(s);", "            next.remove(x);", "            dfs(i + 1, next, path, ans);", "        }", "    }", "}"]};
const highlightLines={"Python": {"start": 2, "init": 5, "check": 7, "save": 8, "return": 9, "loop": 10, "assign": 11, "call": 12, "resume": 10, "end": 10, "done": 14}, "Java": {"start": 5, "init": 6, "check": 13, "save": 16, "return": 17, "loop": 19, "assign": 20, "call": 23, "resume": 19, "end": 24, "done": 10}};
if(typeof module!=='undefined')module.exports={trace,snippets,highlightLines};
if(typeof document!=='undefined'){
 const $=id=>document.getElementById(id);let data,index=0,timer=null;
 function stop(){clearInterval(timer);timer=null;$('play').textContent='▶ 自动播放';}
 function render(){
  const e=data.events[index],lang=$('lang').value;
  // 只展示已经走到的分支，避免把尚未选择的数字误认为当前状态。
  const visible=new Set(['root',...data.events.slice(0,index+1).map(x=>x.node)]),nodes=data.nodes.filter(n=>visible.has(n.id));
  const rows=Array.from({length:9},(_,d)=>nodes.filter(n=>n.depth===d));
  const pos=Object.fromEntries(rows.flatMap(row=>row.map((n,j)=>[n.id,{x:280+(j-(row.length-1)/2)*56,y:35+n.depth*75}])));
  const width=Math.max(560,...rows.map(r=>r.length*56+40));
  $('tree').setAttribute('viewBox',`${280-width/2} 0 ${width} ${Math.max(240,70+JSON.parse($('example').value).length*75)}`);
  $('tree').innerHTML=nodes.filter(n=>n.parent).map(n=>`<line class="edge" x1="${pos[n.parent].x}" y1="${pos[n.parent].y}" x2="${pos[n.id].x}" y2="${pos[n.id].y}"/>`).join('')+nodes.map(n=>`<g class="node ${e.seen.includes(n.id)?'answer':''} ${e.node===n.id?'active':''}" transform="translate(${pos[n.id].x},${pos[n.id].y})"><circle r="23"/><text style="font-size:13px">${n.label}</text></g>`).join('');
  $('code').replaceChildren(...snippets[lang].map((line,i)=>{const el=document.createElement('div');el.className='line'+(highlightLines[lang][e.line]===i?' on':'');const num=document.createElement('span');num.className='num';num.textContent=i+1;el.append(num,document.createTextNode(line));return el;}));
  $('slots').textContent='有效前缀 = '+JSON.stringify(e.path.slice(0,e.i))+'；剩余 s = {'+e.s.join(',')+'}'; const raw=document.createElement('p');raw.className='mini';raw.textContent='固定数组 path = '+JSON.stringify(e.path)+'（前 '+e.i+' 格有效，其余为初值或旧值）';$('slots').append(raw);
  $('frames').textContent=e.stack.length?e.stack.join(' → ')+' ← 栈顶':'∅ 空栈';
  $('answers').textContent='ans = '+JSON.stringify(e.ans);
  $('message').textContent=e.message;$('phase').textContent='当前操作 / '+e.line;
  $('result').textContent=`已收集 ${e.ans.length} 个`;$('counter').textContent=`${index} / ${data.events.length-1}`;$('seek').value=index;
  $('prev').disabled=index===0;$('next').disabled=index===data.events.length-1;
 }
 function reset(){stop();data=trace(JSON.parse($('example').value));index=0;$('seek').max=data.events.length-1;render();}
 function step(d){index=Math.max(0,Math.min(data.events.length-1,index+d));render();if(index===data.events.length-1)stop();}
 $('next').onclick=()=>{stop();step(1)};$('prev').onclick=()=>{stop();step(-1)};$('reset').onclick=reset;
 $('seek').oninput=()=>{stop();index=+$('seek').value;render()};$('example').onchange=reset;$('lang').onchange=render;
 $('play').onclick=()=>{if(timer)return stop();if(index===data.events.length-1)index=0;$('play').textContent='Ⅱ 暂停';render();timer=setInterval(()=>step(1),+$('speed').value)};
 $('speed').onchange=()=>{if(timer){stop();$('play').click()}};reset();
 if(window.parent!==window){const report=()=>window.parent.postMessage({type:'algorithm-demo-ready',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');new ResizeObserver(report).observe(document.body);report();}
}

